package memory

import (
	"database/sql"
	"fmt"
	"sync"

	"github.com/google/uuid"
	"github.com/hexlet/meeting-booking/backend/internal/model"
	"github.com/hexlet/meeting-booking/backend/internal/repository"
)

type MeetingRepo struct {
	mu   sync.RWMutex
	data map[string]*model.Meeting
}

func NewMeetingRepo() *MeetingRepo {
	return &MeetingRepo{
		data: make(map[string]*model.Meeting),
	}
}

func (r *MeetingRepo) ListByOwnerID(ownerID string, filters repository.MeetingFilters) ([]model.Meeting, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var meetings []model.Meeting
	for _, m := range r.data {
		match := true
		if filters.DateStartFrom != nil && m.StartDateTime.Before(*filters.DateStartFrom) {
			match = false
		}
		if filters.DateStartTo != nil && m.StartDateTime.After(*filters.DateStartTo) {
			match = false
		}
		if filters.IsConfirmed != nil && (m.IsConfirmed == nil || *m.IsConfirmed != *filters.IsConfirmed) {
			match = false
		}
		if filters.MeetingTypeID != nil && m.MeetingTypeID != *filters.MeetingTypeID {
			match = false
		}
		if match {
			meetings = append(meetings, *m)
		}
	}
	return meetings, nil
}

func (r *MeetingRepo) ListOccupiedByMeetingType(meetingTypeID string) ([]model.Meeting, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var meetings []model.Meeting
	for _, m := range r.data {
		if m.MeetingTypeID == meetingTypeID {
			meetings = append(meetings, *m)
		}
	}
	return meetings, nil
}

func (r *MeetingRepo) Create(m *model.Meeting) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if err := r.checkOverlapLocked(m); err != nil {
		return err
	}

	if m.ID == "" {
		m.ID = uuid.NewString()
	}
	r.data[m.ID] = m
	return nil
}

func (r *MeetingRepo) checkOverlapLocked(m *model.Meeting) error {
	for _, existing := range r.data {
		if existing.MeetingTypeID != m.MeetingTypeID {
			continue
		}
		if m.StartDateTime.Before(existing.EndDateTime) && m.EndDateTime.After(existing.StartDateTime) {
			return repository.ErrSlotOccupied
		}
	}
	return nil
}

func (r *MeetingRepo) UpdateStatus(id string, isConfirmed bool) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	m, ok := r.data[id]
	if !ok {
		return sql.ErrNoRows
	}
	m.IsConfirmed = &isConfirmed
	return nil
}

func (r *MeetingRepo) GetByID(id string) (*model.Meeting, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	m, ok := r.data[id]
	if !ok {
		return nil, fmt.Errorf("meeting not found: %s", id)
	}
	return m, nil
}

var _ repository.MeetingRepository = (*MeetingRepo)(nil)
