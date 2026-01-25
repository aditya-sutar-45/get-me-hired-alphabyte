// Package seeds
package seeds

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"time"

	"github.com/TheSushantKumbhar/get_me_hired/backend/api"
	"github.com/TheSushantKumbhar/get_me_hired/backend/internal/database"
	"github.com/google/uuid"
)

func SeedJobs(apiCfg *api.APIConfig) {
	data, err := os.Open("/home/adityasutar/projects/get_me_hired/backend/seeds/jobs.json")
	if err != nil {
		log.Fatalln("error opening jobs.json", err)
		return
	}
	defer func() {
		err := data.Close()
		if err != nil {
			panic(err)
		}
	}()

	type Job struct {
		CompanyName string   `json:"company_name"`
		Title       string   `json:"title"`
		Description string   `json:"description"`
		Languages   []string `json:"languages"`
	}
	jobs := []Job{}
	decoder := json.NewDecoder(data)
	err = decoder.Decode(&jobs)
	if err != nil {
		log.Fatalln("error decoding jobs.json")
		return
	}

	userID, err := uuid.Parse("43e3a77b-96ab-4c14-a3f8-6e79aa88f5c2")
	if err != nil {
		log.Fatalln("error getting user id")
		return
	}

	user, err := apiCfg.DB.GetUserByID(context.Background(), userID)
	if err != nil {
		log.Fatalln("error getting user")
		return
	}

	for _, job := range jobs {
		_, err := apiCfg.DB.CreateJob(context.Background(), database.CreateJobParams{
			ID:          uuid.New(),
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
			CompanyName: job.CompanyName,
			Title:       job.Title,
			Description: job.Description,
			Languages:   job.Languages,
			CreatedBy:   user.ID,
		})
		if err != nil {
			log.Fatalln("error inserting jobs.json in db")
		}
	}
}
