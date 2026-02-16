package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/TheSushantKumbhar/get_me_hired/backend/models"
	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

var secretKey string = "hello world"

func (h Handler) HandlerCreateUser(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(100) // 10MB max
	if err != nil {
		log.Println(err)
		RespondWithErr(w, http.StatusBadRequest, "failed to parse form")
		return
	}

	role := r.FormValue("role")
	if role != "user" && role != "company" {
		RespondWithErr(w, http.StatusBadRequest, "invalid role")
		return
	}

	if role == "user" {
		HandlerRegisterUser(w, r, h)
	} else {
		HandlerRegisterCompany(w, r, h)
	}
}

func (h Handler) HandlerLogin(w http.ResponseWriter, r *http.Request) {
	type Parameters struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	params := Parameters{}
	decorder := json.NewDecoder(r.Body)
	err := decorder.Decode(&params)
	if err != nil {
		RespondWithErr(w, http.StatusBadRequest, fmt.Sprintf("error parsing json: %v\n", err))
		return
	}

	log.Println("json found getting user from database")

	user, err := h.DB.GetUserByUsername(r.Context(), params.Username)
	if err != nil {
		log.Println(err)
		log.Println("whyyyyy")
		RespondWithErr(w, http.StatusNotFound, "user not found")
		return
	}

	log.Println("got user from database")

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(params.Password))
	if err != nil {
		RespondWithErr(w, http.StatusBadRequest, "incorrect username / password")
		return
	}

	userID := user.ID
	userIDStr := userID.String()

	claims := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.RegisteredClaims{
		Issuer:    userIDStr,
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 24)), // 1 day
	})

	token, err := claims.SignedString([]byte(secretKey))
	if err != nil {
		RespondWithErr(w, http.StatusInternalServerError, fmt.Sprintf("couldn not generate token: %v\n", err))
		return
	}

	cookie := http.Cookie{
		Name:     "jwt",
		Value:    token,
		Expires:  time.Now().Add(time.Hour * 24), // 1 day
		HttpOnly: true,
	}

	http.SetCookie(w, &cookie)
	type Response struct {
		Message string `json:"message"`
		Token   string `json:"token"`
	}
	res := Response{
		Message: "login success",
		Token:   token,
	}
	respondWithJSON(w, 200, res)
}

func (h Handler) HandlerUser(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("jwt")
	if err != nil {
		RespondWithErr(w, http.StatusUnauthorized, "unauthenticated")
		return
	}

	token, err := jwt.ParseWithClaims(cookie.Value, &jwt.RegisteredClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(secretKey), nil
	})
	if err != nil {
		RespondWithErr(w, http.StatusUnauthorized, "unauthenticated")
		return
	}

	claims := token.Claims.(*jwt.RegisteredClaims)
	userID, err := uuid.Parse(claims.Issuer)
	if err != nil {
		RespondWithErr(w, http.StatusUnauthorized, "user id invalid")
		return
	}
	user, err := h.DB.GetUserByID(r.Context(), userID)
	if err != nil {
		RespondWithErr(w, http.StatusNotFound, "user not found")
		return
	}

	HandlerGetProfileByRole(w, r, h, user)
}

func (h Handler) HandlerLogout(w http.ResponseWriter, r *http.Request) {
	cookie := http.Cookie{
		Name:     "jwt",
		Value:    "",
		Expires:  time.Now().Add(-time.Hour),
		HttpOnly: true,
	}
	http.SetCookie(w, &cookie)

	type Response struct {
		Message string `json:"message"`
	}
	res := Response{
		Message: "logout success",
	}
	respondWithJSON(w, 200, res)
}

func (h Handler) HandlerFindUserByUsername(w http.ResponseWriter, r *http.Request) {
	username := chi.URLParam(r, "username")

	user, err := h.DB.GetUserByUsername(r.Context(), username)
	if err != nil {
		log.Println(err)
		RespondWithErr(w, http.StatusNotFound, "User Not Found")
		return
	}
	log.Println(user.Role)

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

	log.Println("error in some role related thign idk")
	RespondWithErr(w, http.StatusNotFound, "user not found")
}

func parseResume(path string) (string, error) {
	data := map[string]string{
		"resume_path": path,
	}

	jsonData, err := json.Marshal(data)
	if err != nil {
		return "", fmt.Errorf("failed to encode json %v", err)
	}

	// baseURL := os.Getenv("LLM_SERVER_URL")
	baseURL := "http://localhost:5000"
	url := fmt.Sprintf("%v/parse", baseURL)
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to reach parser: %v", err)
	}
	defer func() {
		if cerr := resp.Body.Close(); cerr != nil {
			log.Printf("failed to close response body %v", cerr)
		}
	}()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read parsed response: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("parser returned error: %s", string(body))
	}

	return string(body), nil
}
