package sqlx

import (
	"github.com/jmoiron/sqlx"

	"github.com/hexlet/meeting-booking/backend/internal/model"
	"github.com/hexlet/meeting-booking/backend/internal/repository"
)

type MeetingParticipantRepo struct {
	db *sqlx.DB
}

func NewMeetingParticipantRepo(db *sqlx.DB) *MeetingParticipantRepo {
	return &MeetingParticipantRepo{db: db}
}

func (r *MeetingParticipantRepo) AddParticipants(meetingID string, participantIDs []string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	for _, pid := range participantIDs {
		_, err := tx.Exec(
			"INSERT INTO meeting_participants (meeting_id, participant_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
			meetingID, pid,
		)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *MeetingParticipantRepo) ListByMeetingID(meetingID string) ([]model.Participant, error) {
	var participants []model.Participant
	err := r.db.Select(&participants,
		`SELECT p.* FROM participants p
		JOIN meeting_participants mp ON mp.participant_id = p.id
		WHERE mp.meeting_id = $1`, meetingID)
	if err != nil {
		return nil, err
	}
	return participants, nil
}

var _ repository.MeetingParticipantRepository = (*MeetingParticipantRepo)(nil)
