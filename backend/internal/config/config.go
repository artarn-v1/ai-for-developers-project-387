package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	DatabaseURL string
	StorageType string
}

func Load() Config {
	_ = godotenv.Load()

	dbURL := os.Getenv("DATABASE_URL")
	storageType := "postgres"
	if dbURL == "" {
		storageType = "memory"
	}

	return Config{
		Port:        getEnv("PORT", "8080"),
		DatabaseURL: dbURL,
		StorageType: storageType,
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
