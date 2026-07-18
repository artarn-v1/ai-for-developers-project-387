package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
)

func decodeJSON(r *http.Request, v any) error {
	return json.NewDecoder(r.Body).Decode(v)
}

func writeError(w http.ResponseWriter, msg string, status int) {
	writeJSON(w, status, map[string]string{"error": msg})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func parseTime(s string) (time.Time, error) {
	return time.Parse(time.RFC3339, s)
}

func generateID() string {
	return uuid.NewString()
}
