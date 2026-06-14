package repository

import (
	"time"

	"github.com/hexlet/meeting-booking/backend/internal/model"
)

type OwnerRepository interface {
	FindByAdminSlug(slug string) (*model.Owner, error)
	FindByClientSlug(slug string) (*model.Owner, error)
}

type MeetingTypeRepository interface {
	ListByOwnerID(ownerID string) ([]model.MeetingType, error)
	ListActiveByOwnerID(ownerID string) ([]model.MeetingType, error)
	GetByID(id string) (*model.MeetingType, error)
	GetByOwnerIDAndSlug(ownerID string, slug string) (*model.MeetingType, error)
	Create(mt *model.MeetingType) error
	UpdateStatus(id string, isActive bool) error
}

type ParticipantRepository interface {
	FindByEmail(email string) (*model.Participant, error)
	GetByID(id string) (*model.Participant, error)
	Create(p *model.Participant) error
}

type MeetingFilters struct {
	DateStartFrom *time.Time
	DateStartTo   *time.Time
	IsConfirmed   *bool
	MeetingTypeID *string
}

type MeetingRepository interface {
	ListByOwnerID(ownerID string, filters MeetingFilters) ([]model.Meeting, error)
	ListOccupiedByMeetingType(meetingTypeID string) ([]model.Meeting, error)
	Create(m *model.Meeting) error
	UpdateStatus(id string, isConfirmed bool) error
	GetByID(id string) (*model.Meeting, error)
}

type MeetingParticipantRepository interface {
	AddParticipants(meetingID string, participantIDs []string) error
	ListByMeetingID(meetingID string) ([]model.Participant, error)
}
