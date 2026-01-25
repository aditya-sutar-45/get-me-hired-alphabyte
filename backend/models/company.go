package models

import (
	"time"

	"github.com/TheSushantKumbhar/get_me_hired/backend/internal/database"
	"github.com/google/uuid"
)

type Company struct {
	ID                 uuid.UUID `json:"id"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
	Role               string    `json:"role"`
	Username           string    `json:"username"`
	Email              string    `json:"email"`
	CompanyName        string    `json:"company_name"`
	CompanyWebsite     string    `json:"comapny_website"`
	CompanyDescription string    `json:"company_description"`
}

func DatabaseCompanyToCompany(dbUser database.User, dbCompanyProfile database.CompanyProfile) Company {
	return Company{
		ID:                 dbUser.ID,
		CreatedAt:          dbUser.CreatedAt,
		UpdatedAt:          dbUser.UpdatedAt,
		Role:               dbUser.Role,
		Username:           dbUser.Username,
		Email:              dbUser.Email,
		CompanyName:        dbCompanyProfile.CompanyName,
		CompanyWebsite:     dbCompanyProfile.CompanyWebsite,
		CompanyDescription: dbCompanyProfile.CompanyDescription,
	}
}
