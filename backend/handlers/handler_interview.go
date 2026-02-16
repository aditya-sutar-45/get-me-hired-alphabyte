package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/TheSushantKumbhar/get_me_hired/backend/internal/database"
	"github.com/TheSushantKumbhar/get_me_hired/backend/models"
	"github.com/google/uuid"
)

func (h Handler) HandlerCreateInterviewSession(w http.ResponseWriter, r *http.Request, user database.User) {
	type Parameters struct {
		JobID uuid.UUID `json:"job_id"`
	}

	params := Parameters{}

	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		RespondWithErr(w, http.StatusBadRequest, "invalid json request")
		return
	}

	jobID := params.JobID

	i, err := h.DB.CreateInterviewSession(r.Context(), database.CreateInterviewSessionParams{
		ID:        uuid.New(),
		UserID:    user.ID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		JobID:     jobID,
	})
	if err != nil {
		log.Println(err)
		RespondWithErr(w, http.StatusInternalServerError, "could not create interview session")
		return
	}

	respondWithJSON(w, http.StatusCreated, models.DatabaseCreateInterviewToCreateInterview(i))
}
