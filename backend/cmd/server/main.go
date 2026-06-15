package main

import (
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"

	"github.com/hexlet/meeting-booking/backend/internal/config"
	"github.com/hexlet/meeting-booking/backend/internal/handler"
	sqlxrepo "github.com/hexlet/meeting-booking/backend/internal/repository/sqlx"
	"github.com/hexlet/meeting-booking/backend/internal/service"
)

func main() {
	cfg := config.Load()

	db, err := sqlx.Connect("postgres", cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer db.Close()

	ownerRepo := sqlxrepo.NewOwnerRepo(db)
	mtRepo := sqlxrepo.NewMeetingTypeRepo(db)
	pRepo := sqlxrepo.NewParticipantRepo(db)
	mRepo := sqlxrepo.NewMeetingRepo(db)
	mpRepo := sqlxrepo.NewMeetingParticipantRepo(db)

	meetingSvc := service.NewMeetingService(mtRepo, mRepo, pRepo, mpRepo)

	adminHandler := handler.NewAdminHandler(ownerRepo, mtRepo, mRepo, mpRepo, pRepo)
	clientHandler := handler.NewClientHandler(ownerRepo, mtRepo, mRepo, mpRepo, meetingSvc)

	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: false,
		MaxAge:           300,
	}))
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)

	r.Get("/health-check", func(w http.ResponseWriter, r *http.Request) {
		if err := db.Ping(); err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			return
		}
		w.WriteHeader(http.StatusOK)
	})

	r.Get("/owners", clientHandler.ListOwners)

	r.Route("/admin/{adminSlug}", func(r chi.Router) {
		r.Mount("/", adminHandler.Routes())
	})

	r.Route("/client/{ownerSlug}", func(r chi.Router) {
		r.Mount("/", clientHandler.Routes())
	})

	addr := ":" + cfg.Port
	log.Printf("starting server on %s", addr)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
