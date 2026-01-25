package handlers

import (
	"database/sql"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/TheSushantKumbhar/get_me_hired/backend/internal/database"
	"github.com/TheSushantKumbhar/get_me_hired/backend/models"
	"github.com/TheSushantKumbhar/get_me_hired/backend/utils"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func HandlerRegisterUser(w http.ResponseWriter, r *http.Request, h Handler) {
	username := r.FormValue("username")
	email := r.FormValue("email")
	passwordStr := r.FormValue("password")
	resumeFile, _, err := r.FormFile("resume")
	if err != nil {
		log.Println("error reading resume...", err)
		RespondWithErr(w, http.StatusBadRequest, "failed to read resume...")
		return
	}
	defer func() {
		err := resumeFile.Close()
		if err != nil {
			panic(err)
		}
	}()

	password, err := bcrypt.GenerateFromPassword([]byte(passwordStr), 14)
	if err != nil {
		RespondWithErr(w, http.StatusInternalServerError, "something went wrong!")
		return
	}

	tempPath := fmt.Sprintf("./store/user/resume/resume_%s", username)
	dst, err := os.Create(tempPath)
	if err != nil {
		RespondWithErr(w, http.StatusInternalServerError, "something went wrong creating the path!")
		return
	}
	defer func() {
		err := dst.Close()
		if err != nil {
			panic(err)
		}
	}()
	_, err = io.Copy(dst, resumeFile)
	if err != nil {
		RespondWithErr(w, http.StatusInternalServerError, "something went wrong copying the resume!")
		return
	}

	storePath := os.Getenv("LOCAL_STORE_PATH")
	if storePath == "" {
		RespondWithErr(w, http.StatusInternalServerError, "store path is empty")
		return
	}
	resumeURL := fmt.Sprintf("%s/user/resume/resume_%s", storePath, username)
	parsedResume, err := parseResume(resumeURL)
	if err != nil {
		log.Println("error parsing resume: ", err)
		RespondWithErr(w, http.StatusInternalServerError, "error parsing the resume")
		return
	}

	user, err := h.DB.CreateUser(r.Context(), database.CreateUserParams{
		ID:        uuid.New(),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		Username:  username,
		Password:  string(password),
		Email:     email,
		Role:      "user",
	})
	if err != nil {
		RespondWithErr(w, http.StatusInternalServerError, "something went wrong creating the user")
		return
	}

	userProfile, err := h.DB.CreateUserProfile(r.Context(), database.CreateUserProfileParams{
		UserID: user.ID,
		ResumePath: sql.NullString{
			String: resumeURL,
			Valid:  true,
		},
		ParsedResume: sql.NullString{
			String: parsedResume,
			Valid:  true,
		},
	})
	if err != nil {
		RespondWithErr(w, http.StatusInternalServerError, "something went wrong creating the user")
		return
	}

	respondWithJSON(w, http.StatusCreated, models.DatabaseUserToUser(user, userProfile))
}

func HandlerRegisterCompany(w http.ResponseWriter, r *http.Request, h Handler) {
	username := r.FormValue("username")
	email := r.FormValue("email")
	passwordStr := r.FormValue("password")
	companyName := r.FormValue("company_name")
	companyWebsite := r.FormValue("company_website")
	companyDescription := r.FormValue("company_description")

	password, err := utils.GeneratePassword(passwordStr)
	if err != nil {
		RespondWithErr(w, http.StatusInternalServerError, "something went wrong hashing password")
		return
	}

	user, err := h.DB.CreateUser(r.Context(), database.CreateUserParams{
		ID:        uuid.New(),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		Username:  username,
		Password:  string(password),
		Email:     email,
		Role:      "company",
	})
	if err != nil {
		RespondWithErr(w, http.StatusInternalServerError, "something went wrong creating user")
		return
	}

	companyProfile, err := h.DB.CreateCompanyProfile(r.Context(), database.CreateCompanyProfileParams{
		UserID:             user.ID,
		CompanyName:        companyName,
		CompanyWebsite:     companyWebsite,
		CompanyDescription: companyDescription,
	})
	if err != nil {
		RespondWithErr(w, http.StatusInternalServerError, "something went wrong creating the user")
		return
	}

	respondWithJSON(w, http.StatusCreated, models.DatabaseCompanyToCompany(user, companyProfile))
}

func HandlerGetProfileByRole(w http.ResponseWriter, r *http.Request, h Handler, user database.User) {
	if user.Role == "user" || user.Role == "admin" {
		userProfile, err := h.DB.GetUserProfileByID(r.Context(), user.ID)
		if err != nil {
			RespondWithErr(w, http.StatusNotFound, "user not found")
			return
		}

		respondWithJSON(w, http.StatusAccepted, models.DatabaseUserToUser(user, userProfile))
		return
	}
	if user.Role == "company" {
		companyProfile, err := h.DB.GetCompanyProfileByID(r.Context(), user.ID)
		if err != nil {
			RespondWithErr(w, http.StatusNotFound, "user not found")
			return
		}
		respondWithJSON(w, http.StatusAccepted, models.DatabaseCompanyToCompany(user, companyProfile))
		return
	}
}
