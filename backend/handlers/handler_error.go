package handlers

import "net/http"

func HandlerError(w http.ResponseWriter, r *http.Request) {
	RespondWithErr(w, 400, "something went wrong")
}
