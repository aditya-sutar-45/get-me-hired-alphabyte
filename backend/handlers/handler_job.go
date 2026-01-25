package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/TheSushantKumbhar/get_me_hired/backend/internal/database"
	"github.com/TheSushantKumbhar/get_me_hired/backend/models"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func (h Handler) HandlerGetJobs(w http.ResponseWriter, r *http.Request) {
	jobs, err := h.DB.GetJobs(r.Context())
	if err != nil {
		RespondWithErr(w, http.StatusNotFound, "jobs not found")
		return
	}

	respondWithJSON(w, http.StatusOK, models.DatabaseJobsToJobs(jobs))
}

func (h Handler) HandlerCreateJob(w http.ResponseWriter, r *http.Request, user database.User) {
	type Parameters struct {
		CompanyName     string   `json:"company_name"`
		Title           string   `json:"title"`
		Description     string   `json:"description"`
		CustomInterview bool     `json:"custom_interview"`
		Languages       []string `json:"languages"`
	}

	params := Parameters{}

	jsonStr := r.FormValue("params")
	if jsonStr == "" {
		RespondWithErr(w, http.StatusBadRequest, "missing params")
		return
	}

	err := json.Unmarshal([]byte(jsonStr), &params)
	if err != nil {
		RespondWithErr(w, http.StatusBadRequest, "could not decode json")
		return
	}
	jobID := uuid.New()

	if params.CustomInterview {
		kb, _, err := r.FormFile("knowledge_base")
		if err != nil {
			RespondWithErr(w, http.StatusBadRequest, "invalid file")
			return
		}

		tempPath := fmt.Sprintf("./store/jobs/knowledge_base/kb_%s", jobID)
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
		_, err = io.Copy(dst, kb)
		if err != nil {
			RespondWithErr(w, http.StatusInternalServerError, "something went wrong copying the resume!")
			return
		}

		storePath := os.Getenv("LOCAL_STORE_PATH")
		if storePath == "" {
			RespondWithErr(w, http.StatusInternalServerError, "store path is empty")
			return
		}
		kbPath := fmt.Sprintf("%s/jobs/knowledge_base/kb_%s", storePath, jobID)
		err = ingest(kbPath, jobID)
		if err != nil {
			RespondWithErr(w, http.StatusInternalServerError, "something went wrong ingesting")
			return
		}
	}

	job, err := h.DB.CreateJob(r.Context(), database.CreateJobParams{
		ID:              jobID,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
		CompanyName:     params.CompanyName,
		Title:           params.Title,
		Description:     params.Description,
		Languages:       params.Languages,
		CustomInterview: params.CustomInterview,
		CreatedBy:       user.ID,
	})
	if err != nil {
		RespondWithErr(w, http.StatusInternalServerError, "could not create job")
		return
	}

	respondWithJSON(w, http.StatusCreated, models.DatabaseJobToJob(job))
}

func (h Handler) HandlerGetJobByID(w http.ResponseWriter, r *http.Request) {
	jobIDStr := chi.URLParam(r, "id")
	jobID, err := uuid.Parse(jobIDStr)
	if err != nil {
		RespondWithErr(w, http.StatusBadRequest, "invalid job id")
		return
	}

	job, err := h.DB.GetJobByID(r.Context(), jobID)
	if err != nil {
		RespondWithErr(w, http.StatusNotFound, "job not found")
		return
	}

	respondWithJSON(w, http.StatusOK, models.DatabaseJobToJob(job))
}

func (h Handler) HandlerGetJobsByCompany(w http.ResponseWriter, r *http.Request, user database.User) {
	jobs, err := h.DB.GetJobsByCompany(r.Context(), user.ID)
	if err != nil {
		RespondWithErr(w, http.StatusNotFound, "jobs not found")
		return
	}

	respondWithJSON(w, http.StatusOK, models.DatabaseJobsToJobs(jobs))
}

func (h Handler) HandlerDeleteJobByID(w http.ResponseWriter, r *http.Request, u database.User) {
	id := chi.URLParam(r, "id")
	jobID, err := uuid.Parse(id)
	if err != nil {
		RespondWithErr(w, http.StatusInternalServerError, "error parsing uuid")
		return
	}

	job, err := h.DB.GetJobByID(r.Context(), jobID)
	if err != nil {
		RespondWithErr(w, http.StatusNotFound, "job not found")
		return
	}

	if job.CreatedBy != u.ID {
		RespondWithErr(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	err = h.DB.DeleteJobByID(context.TODO(), jobID)
	if err != nil {
		RespondWithErr(w, http.StatusInternalServerError, "error deleting the job")
		return
	}

	type Response struct {
		Message string `json:"message"`
	}

	res := Response{
		Message: "deleted successfully",
	}

	respondWithJSON(w, http.StatusOK, res)
}

func ingest(path string, id uuid.UUID) error {
	jsonData, _ := json.Marshal(map[string]string{
		"kb_path": path,
		"job_id":  id.String(),
	})

	_, err := http.Post("http://localhost:5000/ingest_kb",
		"application/json",
		bytes.NewBuffer(jsonData),
	)
	return err
}
