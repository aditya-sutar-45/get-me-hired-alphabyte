package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/TheSushantKumbhar/get_me_hired/backend/internal/database"
	"github.com/TheSushantKumbhar/get_me_hired/backend/models"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/sqlc-dev/pqtype"
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

func (h Handler) HandlerUpdateInterviewByID(w http.ResponseWriter, r *http.Request, user database.User) {
	type Parameters struct {
		Status        string          `json:"status"`
		Transcript    json.RawMessage `json:"transcript"`
		UserFeedbacks json.RawMessage `json:"user_feedbacks"`
		HintsUsed     json.RawMessage `json:"hints_used"`
	}

	IDStr := chi.URLParam(r, "id")
	sessionID, err := uuid.Parse(IDStr)
	if err != nil {
		RespondWithErr(w, http.StatusNotFound, "interview session not found")
		return
	}

	params := Parameters{}

	err = json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		RespondWithErr(w, http.StatusBadRequest, "invalid input jsonStatueBadReq")
		return
	}

	session, err := h.DB.UpdateInterviewSession(
		r.Context(),
		database.UpdateInterviewSessionParams{
			ID:     sessionID,
			Status: database.InterviewStatus(params.Status),

			Transcript: pqtype.NullRawMessage{
				RawMessage: params.Transcript,
				Valid:      params.Transcript != nil,
			},

			UserFeedbacks: pqtype.NullRawMessage{
				RawMessage: params.UserFeedbacks,
				Valid:      params.UserFeedbacks != nil,
			},

			HintsUsed: pqtype.NullRawMessage{
				RawMessage: params.HintsUsed,
				Valid:      params.HintsUsed != nil,
			},
		},
	)
	if err != nil {
		RespondWithErr(w, http.StatusInternalServerError, "error updating database")
		return
	}

	respondWithJSON(w, http.StatusOK, models.DatabaseInterviewSessionToInterviewSession(session))
}

func (h Handler) GetInterviewSessionsByUserID(w http.ResponseWriter, r *http.Request, user database.User) {
	sessions, err := h.DB.GetCompleteSessionsByUserID(r.Context(), user.ID)
	if err != nil {
		log.Println(err)
		RespondWithErr(w, http.StatusNotFound, "no records found")
		return
	}

	respondWithJSON(w, http.StatusOK, models.DatabaseSessionsToSessions(sessions))
}
