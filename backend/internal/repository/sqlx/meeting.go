package sqlx

import (
	"database/sql"
	"fmt"

	"github.com/jmoiron/sqlx"

	"github.com/hexlet/meeting-booking/backend/internal/model"
	"github.com/hexlet/meeting-booking/backend/internal/repository"
)

type MeetingRepo struct {
	db *sqlx.DB
}

func NewMeetingRepo(db *sqlx.DB) *MeetingRepo {
	return &MeetingRepo{db: db}
}

func (r *MeetingRepo) ListByOwnerID(ownerID string, filters repository.MeetingFilters) ([]model.Meeting, error) {
	query := `SELECT m.* FROM meetings m
		JOIN meeting_types mt ON mt.id = m.meeting_type_id
		WHERE mt.owner_id = $1`
	args := []any{ownerID}
	argIdx := 2

	if filters.DateStartFrom != nil {
		query += fmt.Sprintf(" AND m.start_date_time >= $%d", argIdx)
		args = append(args, *filters.DateStartFrom)
		argIdx++
	}
	if filters.DateStartTo != nil {
		query += fmt.Sprintf(" AND m.start_date_time <= $%d", argIdx)
		args = append(args, *filters.DateStartTo)
		argIdx++
	}
	if filters.IsConfirmed != nil {
		query += fmt.Sprintf(" AND m.is_confirmed = $%d", argIdx)
		args = append(args, *filters.IsConfirmed)
		argIdx++
	}
	if filters.MeetingTypeID != nil {
		query += fmt.Sprintf(" AND m.meeting_type_id = $%d", argIdx)
		args = append(args, *filters.MeetingTypeID)
		argIdx++
	}

	query += " ORDER BY m.start_date_time"

	var meetings []model.Meeting
	err := r.db.Select(&meetings, query, args...)
	if err != nil {
		return nil, err
	}
	return meetings, nil
}

func (r *MeetingRepo) ListOccupiedByMeetingType(meetingTypeID string) ([]model.Meeting, error) {
	var meetings []model.Meeting
	err := r.db.Select(&meetings,
		`SELECT * FROM meetings WHERE meeting_type_id = $1 ORDER BY start_date_time`, meetingTypeID)
	if err != nil {
		return nil, err
	}
	return meetings, nil
}

func (r *MeetingRepo) Create(m *model.Meeting) error {
	query := `INSERT INTO meetings (id, meeting_type_id, start_date_time, comment, initiator_id, is_confirmed)
		VALUES (:id, :meeting_type_id, :start_date_time, :comment, :initiator_id, :is_confirmed)`
	_, err := r.db.NamedExec(query, m)
	return err
}

func (r *MeetingRepo) UpdateStatus(id string, isConfirmed bool) error {
	res, err := r.db.Exec("UPDATE meetings SET is_confirmed = $1 WHERE id = $2", isConfirmed, id)
	if err != nil {
		return err
	}
	n, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if n == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *MeetingRepo) GetByID(id string) (*model.Meeting, error) {
	var m model.Meeting
	err := r.db.Get(&m, "SELECT * FROM meetings WHERE id = $1", id)
	if err != nil {
		return nil, err
	}
	return &m, nil
}

var _ repository.MeetingRepository = (*MeetingRepo)(nil)
