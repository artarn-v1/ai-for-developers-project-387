package memory

import (
	"github.com/hexlet/meeting-booking/backend/internal/model"
)

const (
	ownerID       = "a0000000-0000-0000-0000-000000000001"
	meetingTypeID = "b0000000-0000-0000-0000-000000000001"
)

func Seed(ownerRepo *OwnerRepo, mtRepo *MeetingTypeRepo) {
	ownerRepo.Upsert(&model.Owner{
		ID:         ownerID,
		Name:       "Evgeny",
		AdminSlug:  "evgeny-admin",
		ClientSlug: "evgeny",
		TimeZone:   "Europe/Moscow",
	})

	mtRepo.Upsert(&model.MeetingType{
		ID:              meetingTypeID,
		OwnerID:         ownerID,
		Name:            "Личное напоминание про масло",
		Description:     "Напоминание о смене масла в автомобиле",
		AvailableFrom:   "09:00",
		AvailableTo:     "18:00",
		DurationMinutes: 30,
		Slug:            "personal-oil-change",
		IsActive:        true,
	})
}
