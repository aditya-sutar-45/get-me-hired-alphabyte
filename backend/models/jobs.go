package models

import (
	"time"

	"github.com/TheSushantKumbhar/get_me_hired/backend/internal/database"
	"github.com/google/uuid"
)

type Job struct {
	ID              uuid.UUID `json:"id"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	CompanyName     string    `json:"company_name"`
	Title           string    `json:"title"`
	Description     string    `json:"description"`
	CustomInterview bool      `json:"custom_interview"`
	Languages       []string  `json:"languages"`
}

func DatabaseJobToJob(dbJob database.Job) Job {
	return Job{
		ID:              dbJob.ID,
		CreatedAt:       dbJob.CreatedAt,
		UpdatedAt:       dbJob.UpdatedAt,
		CompanyName:     dbJob.CompanyName,
		Title:           dbJob.Title,
		Description:     dbJob.Description,
		CustomInterview: dbJob.CustomInterview,
		Languages:       dbJob.Languages,
	}
}

func DatabaseJobsToJobs(dbJobs []database.Job) []Job {
	jobs := []Job{}

	for _, job := range dbJobs {
		jobs = append(jobs, DatabaseJobToJob(job))
	}

	return jobs
}
