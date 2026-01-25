package handlers

import (
	"net/http"

	"github.com/TheSushantKumbhar/get_me_hired/backend/api"
)

type Handler struct {
	*api.APIConfig
}

func (h Handler) AuthTest(w http.ResponseWriter, r *http.Request) {
	respondWithJSON(w, http.StatusAccepted, struct{}{})
}
