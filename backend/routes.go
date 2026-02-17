package main

import (
	"github.com/TheSushantKumbhar/get_me_hired/backend/handlers"
	"github.com/go-chi/chi/v5"
)

func setupRoutes(r *chi.Mux, h *handlers.Handler, m *Middleware) {
	r.Get("/healthz", handlers.HandlerReadiness)
	r.Get("/error", handlers.HandlerError)

	r.Post("/users", h.HandlerCreateUser)
	r.Get("/users/{username}", h.HandlerFindUserByUsername)

	r.Post("/login", h.HandlerLogin)
	r.Get("/user", h.HandlerUser)
	r.Get("/logout", h.HandlerLogout)

	// r.Get("/auth", middlwareAuth(h.AuthTest))

	r.Get("/jobs", h.HandlerGetJobs)
	r.Post("/jobs", m.middlwareCompanyAuth(h.HandlerCreateJob))
	r.Get("/jobs/{id}", h.HandlerGetJobByID)
	r.Delete("/jobs/{id}", m.middlwareCompanyAuth(h.HandlerDeleteJobByID))

	r.Get("/company/jobs", m.middlwareCompanyAuth(h.HandlerGetJobsByCompany))

	r.Post("/interview", m.middlwareAuth(h.HandlerCreateInterviewSession))
	r.Patch("/interview/{id}", m.middlwareAuth(h.HandlerUpdateInterviewByID))
	r.Get("/interview", m.middlwareAuth(h.GetInterviewSessionsByUserID))
}
