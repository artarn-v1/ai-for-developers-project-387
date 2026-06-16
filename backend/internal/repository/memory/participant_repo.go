package memory

import (
	"database/sql"
	"sync"

	"github.com/google/uuid"
	"github.com/hexlet/meeting-booking/backend/internal/model"
	"github.com/hexlet/meeting-booking/backend/internal/repository"
)

type ParticipantRepo struct {
	mu   sync.RWMutex
	data map[string]*model.Participant
}

func NewParticipantRepo() *ParticipantRepo {
	return &ParticipantRepo{
		data: make(map[string]*model.Participant),
	}
}

func (r *ParticipantRepo) FindByEmail(email string) (*model.Participant, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	for _, p := range r.data {
		if p.Email == email {
			return p, nil
		}
	}
	return nil, sql.ErrNoRows
}

func (r *ParticipantRepo) GetByID(id string) (*model.Participant, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	p, ok := r.data[id]
	if !ok {
		return nil, sql.ErrNoRows
	}
	return p, nil
}

func (r *ParticipantRepo) Create(p *model.Participant) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if p.ID == "" {
		p.ID = uuid.NewString()
	}
	r.data[p.ID] = p
	return nil
}

var _ repository.ParticipantRepository = (*ParticipantRepo)(nil)
