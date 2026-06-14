package sqlx

import (
	"github.com/jmoiron/sqlx"

	"github.com/hexlet/meeting-booking/backend/internal/model"
	"github.com/hexlet/meeting-booking/backend/internal/repository"
)

type ParticipantRepo struct {
	db *sqlx.DB
}

func NewParticipantRepo(db *sqlx.DB) *ParticipantRepo {
	return &ParticipantRepo{db: db}
}

func (r *ParticipantRepo) FindByEmail(email string) (*model.Participant, error) {
	var p model.Participant
	err := r.db.Get(&p, "SELECT * FROM participants WHERE LOWER(email) = LOWER($1)", email)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *ParticipantRepo) GetByID(id string) (*model.Participant, error) {
	var p model.Participant
	err := r.db.Get(&p, "SELECT * FROM participants WHERE id = $1", id)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *ParticipantRepo) Create(p *model.Participant) error {
	query := `INSERT INTO participants (id, name, email) VALUES (:id, :name, :email)`
	_, err := r.db.NamedExec(query, p)
	return err
}

var _ repository.ParticipantRepository = (*ParticipantRepo)(nil)
