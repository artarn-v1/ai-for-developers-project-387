package sqlx

import (
	"database/sql"

	"github.com/jmoiron/sqlx"

	"github.com/hexlet/meeting-booking/backend/internal/model"
	"github.com/hexlet/meeting-booking/backend/internal/repository"
)

type MeetingTypeRepo struct {
	db *sqlx.DB
}

func NewMeetingTypeRepo(db *sqlx.DB) *MeetingTypeRepo {
	return &MeetingTypeRepo{db: db}
}

func (r *MeetingTypeRepo) ListByOwnerID(ownerID string) ([]model.MeetingType, error) {
	var types []model.MeetingType
	err := r.db.Select(&types, "SELECT * FROM meeting_types WHERE owner_id = $1 ORDER BY name", ownerID)
	if err != nil {
		return nil, err
	}
	return types, nil
}

func (r *MeetingTypeRepo) ListActiveByOwnerID(ownerID string) ([]model.MeetingType, error) {
	var types []model.MeetingType
	err := r.db.Select(&types, "SELECT * FROM meeting_types WHERE owner_id = $1 AND is_active = true ORDER BY name", ownerID)
	if err != nil {
		return nil, err
	}
	return types, nil
}

func (r *MeetingTypeRepo) GetByID(id string) (*model.MeetingType, error) {
	var mt model.MeetingType
	err := r.db.Get(&mt, "SELECT * FROM meeting_types WHERE id = $1", id)
	if err != nil {
		return nil, err
	}
	return &mt, nil
}

func (r *MeetingTypeRepo) GetByOwnerIDAndSlug(ownerID string, slug string) (*model.MeetingType, error) {
	var mt model.MeetingType
	err := r.db.Get(&mt, "SELECT * FROM meeting_types WHERE owner_id = $1 AND slug = $2", ownerID, slug)
	if err != nil {
		return nil, err
	}
	return &mt, nil
}

func (r *MeetingTypeRepo) Create(mt *model.MeetingType) error {
	query := `INSERT INTO meeting_types (id, owner_id, name, description, available_from, available_to, duration_minutes, slug, is_active)
		VALUES (:id, :owner_id, :name, :description, :available_from, :available_to, :duration_minutes, :slug, :is_active)`
	_, err := r.db.NamedExec(query, mt)
	return err
}

func (r *MeetingTypeRepo) UpdateStatus(id string, isActive bool) error {
	res, err := r.db.Exec("UPDATE meeting_types SET is_active = $1 WHERE id = $2", isActive, id)
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

var _ repository.MeetingTypeRepository = (*MeetingTypeRepo)(nil)
