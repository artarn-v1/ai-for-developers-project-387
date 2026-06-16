package memory

import (
	"database/sql"
	"sync"

	"github.com/google/uuid"
	"github.com/hexlet/meeting-booking/backend/internal/model"
	"github.com/hexlet/meeting-booking/backend/internal/repository"
)

type OwnerRepo struct {
	mu   sync.RWMutex
	data map[string]*model.Owner
}

func NewOwnerRepo() *OwnerRepo {
	return &OwnerRepo{
		data: make(map[string]*model.Owner),
	}
}

func (r *OwnerRepo) FindByAdminSlug(slug string) (*model.Owner, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	for _, o := range r.data {
		if o.AdminSlug == slug {
			return o, nil
		}
	}
	return nil, sql.ErrNoRows
}

func (r *OwnerRepo) FindByClientSlug(slug string) (*model.Owner, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	for _, o := range r.data {
		if o.ClientSlug == slug {
			return o, nil
		}
	}
	return nil, sql.ErrNoRows
}

func (r *OwnerRepo) ListAll() ([]model.Owner, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	owners := make([]model.Owner, 0, len(r.data))
	for _, o := range r.data {
		owners = append(owners, *o)
	}
	return owners, nil
}

func (r *OwnerRepo) Upsert(o *model.Owner) {
	r.mu.Lock()
	defer r.mu.Unlock()
	if o.ID == "" {
		o.ID = uuid.NewString()
	}
	r.data[o.ID] = o
}

var _ repository.OwnerRepository = (*OwnerRepo)(nil)
