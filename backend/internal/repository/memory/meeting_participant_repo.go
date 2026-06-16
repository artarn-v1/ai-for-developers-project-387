package memory

import (
	"sync"

	"github.com/hexlet/meeting-booking/backend/internal/model"
	"github.com/hexlet/meeting-booking/backend/internal/repository"
)

type MeetingParticipantRepo struct {
	mu   sync.RWMutex
	data map[string][]string
}

func NewMeetingParticipantRepo() *MeetingParticipantRepo {
	return &MeetingParticipantRepo{
		data: make(map[string][]string),
	}
}

func (r *MeetingParticipantRepo) AddParticipants(meetingID string, participantIDs []string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	existing := r.data[meetingID]
	seen := make(map[string]bool, len(existing))
	for _, pid := range existing {
		seen[pid] = true
	}
	for _, pid := range participantIDs {
		if !seen[pid] {
			existing = append(existing, pid)
			seen[pid] = true
		}
	}
	r.data[meetingID] = existing
	return nil
}

func (r *MeetingParticipantRepo) ListByMeetingID(meetingID string) ([]model.Participant, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	pIDs, ok := r.data[meetingID]
	if !ok {
		return nil, nil
	}
	participants := make([]model.Participant, len(pIDs))
	for i, pid := range pIDs {
		participants[i] = model.Participant{ID: pid}
	}
	return participants, nil
}

var _ repository.MeetingParticipantRepository = (*MeetingParticipantRepo)(nil)
