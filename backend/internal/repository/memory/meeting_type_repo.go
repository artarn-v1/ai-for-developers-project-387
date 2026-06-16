package memory

import (
	"database/sql"
	"sync"

	"github.com/google/uuid"
	"github.com/hexlet/meeting-booking/backend/internal/model"
	"github.com/hexlet/meeting-booking/backend/internal/repository"
)

type MeetingTypeRepo struct {
	mu   sync.RWMutex
	data map[string]*model.MeetingType
}

func NewMeetingTypeRepo() *MeetingTypeRepo {
	return &MeetingTypeRepo{
		data: make(map[string]*model.MeetingType),
	}
}

func (r *MeetingTypeRepo) ListByOwnerID(ownerID string) ([]model.MeetingType, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var types []model.MeetingType
	for _, mt := range r.data {
		if mt.OwnerID == ownerID {
			types = append(types, *mt)
		}
	}
	return types, nil
}

func (r *MeetingTypeRepo) ListActiveByOwnerID(ownerID string) ([]model.MeetingType, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var types []model.MeetingType
	for _, mt := range r.data {
		if mt.OwnerID == ownerID && mt.IsActive {
			types = append(types, *mt)
		}
	}
	return types, nil
}

func (r *MeetingTypeRepo) GetByID(id string) (*model.MeetingType, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	mt, ok := r.data[id]
	if !ok {
		return nil, sql.ErrNoRows
	}
	return mt, nil
}

func (r *MeetingTypeRepo) GetByOwnerIDAndSlug(ownerID string, slug string) (*model.MeetingType, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	for _, mt := range r.data {
		if mt.OwnerID == ownerID && mt.Slug == slug {
			return mt, nil
		}
	}
	return nil, sql.ErrNoRows
}

func (r *MeetingTypeRepo) Create(mt *model.MeetingType) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if mt.ID == "" {
		mt.ID = uuid.NewString()
	}
	r.data[mt.ID] = mt
	return nil
}

func (r *MeetingTypeRepo) UpdateStatus(id string, isActive bool) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	mt, ok := r.data[id]
	if !ok {
		return sql.ErrNoRows
	}
	mt.IsActive = isActive
	return nil
}

func (r *MeetingTypeRepo) Upsert(mt *model.MeetingType) {
	r.mu.Lock()
	defer r.mu.Unlock()
	if mt.ID == "" {
		mt.ID = uuid.NewString()
	}
	r.data[mt.ID] = mt
}

var _ repository.MeetingTypeRepository = (*MeetingTypeRepo)(nil)
