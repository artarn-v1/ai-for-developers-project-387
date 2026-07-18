package sqlx

import (
	"github.com/jmoiron/sqlx"

	"github.com/hexlet/meeting-booking/backend/internal/model"
	"github.com/hexlet/meeting-booking/backend/internal/repository"
)

type OwnerRepo struct {
	db *sqlx.DB
}

func NewOwnerRepo(db *sqlx.DB) *OwnerRepo {
	return &OwnerRepo{db: db}
}

func (r *OwnerRepo) FindByAdminSlug(slug string) (*model.Owner, error) {
	var o model.Owner
	err := r.db.Get(&o, "SELECT * FROM owners WHERE admin_slug = $1", slug)
	if err != nil {
		return nil, err
	}
	return &o, nil
}

func (r *OwnerRepo) FindByClientSlug(slug string) (*model.Owner, error) {
	var o model.Owner
	err := r.db.Get(&o, "SELECT * FROM owners WHERE client_slug = $1", slug)
	if err != nil {
		return nil, err
	}
	return &o, nil
}

func (r *OwnerRepo) ListAll() ([]model.Owner, error) {
	var owners []model.Owner
	err := r.db.Select(&owners, "SELECT * FROM owners")
	if err != nil {
		return nil, err
	}
	return owners, nil
}

var _ repository.OwnerRepository = (*OwnerRepo)(nil)
