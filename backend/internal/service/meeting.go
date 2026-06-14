package service

import (
	"errors"
	"time"

	"github.com/google/uuid"

	"github.com/hexlet/meeting-booking/backend/internal/model"
	"github.com/hexlet/meeting-booking/backend/internal/repository"
)

var ErrNotActive = errors.New("meeting type is not active")
var ErrSlotOccupied = errors.New("time slot is already occupied")

type MeetingService struct {
	mtRepo     repository.MeetingTypeRepository
	mRepo      repository.MeetingRepository
	pRepo      repository.ParticipantRepository
	mpRepo     repository.MeetingParticipantRepository
}

func NewMeetingService(
	mtRepo repository.MeetingTypeRepository,
	mRepo repository.MeetingRepository,
	pRepo repository.ParticipantRepository,
	mpRepo repository.MeetingParticipantRepository,
) *MeetingService {
	return &MeetingService{
		mtRepo: mtRepo,
		mRepo:  mRepo,
		pRepo:  pRepo,
		mpRepo: mpRepo,
	}
}

type CreateMeetingInput struct {
	OwnerID         string
	MeetingTypeSlug string
	StartDateTime   time.Time
	Comment         string
	InitiatorName   string
	InitiatorEmail  string
	Participants    []CreateParticipantInput
}

type CreateParticipantInput struct {
	Name  string
	Email string
}

func (s *MeetingService) Create(input CreateMeetingInput) (*model.Meeting, error) {
	mt, err := s.mtRepo.GetByOwnerIDAndSlug(input.OwnerID, input.MeetingTypeSlug)
	if err != nil {
		return nil, err
	}
	if !mt.IsActive {
		return nil, ErrNotActive
	}

	occupied, err := s.mRepo.ListOccupiedByMeetingType(mt.ID)
	if err != nil {
		return nil, err
	}

	newEnd := input.StartDateTime.Add(time.Duration(mt.DurationMinutes) * time.Minute)
	for _, occ := range occupied {
		occEnd := occ.StartDateTime.Add(time.Duration(mt.DurationMinutes) * time.Minute)
		if input.StartDateTime.Before(occEnd) && newEnd.After(occ.StartDateTime) {
			return nil, ErrSlotOccupied
		}
	}

	initiator := &model.Participant{
		ID:    uuid.NewString(),
		Name:  input.InitiatorName,
		Email: input.InitiatorEmail,
	}
	if err := s.pRepo.Create(initiator); err != nil {
		return nil, err
	}

	meeting := &model.Meeting{
		ID:            uuid.NewString(),
		MeetingTypeID: mt.ID,
		StartDateTime: input.StartDateTime,
		Comment:       input.Comment,
		InitiatorID:   initiator.ID,
	}
	if err := s.mRepo.Create(meeting); err != nil {
		return nil, err
	}

	participantIDs := []string{initiator.ID}
	for _, p := range input.Participants {
		if p.Email == input.InitiatorEmail {
			continue
		}
		part := &model.Participant{
			ID:    uuid.NewString(),
			Name:  p.Name,
			Email: p.Email,
		}
		if err := s.pRepo.Create(part); err != nil {
			return nil, err
		}
		participantIDs = append(participantIDs, part.ID)
	}

	if err := s.mpRepo.AddParticipants(meeting.ID, participantIDs); err != nil {
		return nil, err
	}

	return meeting, nil
}
