package main

import (
	"net/http"

	"github.com/TheSushantKumbhar/get_me_hired/backend/api"
	"github.com/TheSushantKumbhar/get_me_hired/backend/handlers"
	"github.com/TheSushantKumbhar/get_me_hired/backend/internal/database"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type Middleware struct {
	*api.APIConfig
}

var secretKey string = "hello world"

type authedHandler func(http.ResponseWriter, *http.Request, database.User)

func (m Middleware) middlwareAuth(next authedHandler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("jwt")
		if err != nil {
			handlers.RespondWithErr(w, http.StatusUnauthorized, "unauthorized")
			return
		}

		tokenString := cookie.Value

		token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
			return []byte(secretKey), nil
		})

		if err != nil || !token.Valid {
			handlers.RespondWithErr(w, http.StatusUnauthorized, "invalid or expired token")
			return
		}

		// ✅ FIX IS HERE
		mapClaims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			handlers.RespondWithErr(w, http.StatusUnauthorized, "invalid token claims")
			return
		}

		issuer, ok := mapClaims["iss"].(string)
		if !ok {
			handlers.RespondWithErr(w, http.StatusUnauthorized, "issuer missing")
			return
		}

		userID, err := uuid.Parse(issuer)
		if err != nil {
			handlers.RespondWithErr(w, http.StatusUnauthorized, "user id invalid")
			return
		}

		u, err := m.DB.GetUserByID(r.Context(), userID)
		if err != nil {
			handlers.RespondWithErr(w, http.StatusNotFound, "user not found")
			return
		}

		next(w, r, u)
	}
}

func (m Middleware) middlwareCompanyAuth(next authedHandler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("jwt")
		if err != nil {
			handlers.RespondWithErr(w, http.StatusUnauthorized, "unauthorized")
			return
		}

		tokenString := cookie.Value

		token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
			return []byte(secretKey), nil
		})
		if err != nil || !token.Valid {
			handlers.RespondWithErr(w, http.StatusUnauthorized, "invalid or expired token")
			return
		}

		mapClaims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			handlers.RespondWithErr(w, http.StatusUnauthorized, "invalid token claims")
			return
		}

		issuer, ok := mapClaims["iss"].(string)
		if !ok {
			handlers.RespondWithErr(w, http.StatusUnauthorized, "issuer missing")
			return
		}

		userID, err := uuid.Parse(issuer)
		if err != nil {
			handlers.RespondWithErr(w, http.StatusUnauthorized, "user id invalid")
			return
		}

		u, err := m.DB.GetUserByID(r.Context(), userID)
		if err != nil {
			handlers.RespondWithErr(w, http.StatusNotFound, "user not found")
			return
		}

		if u.Role != "company" {
			handlers.RespondWithErr(w, http.StatusUnauthorized, "unauthorized")
			return
		}

		next(w, r, u)
	}
}
