package model

import "time"

type Owner struct {
	ID         string `db:"id"`
	Name       string `db:"name"`
	AdminSlug  string `db:"admin_slug"`
	ClientSlug string `db:"client_slug"`
	TimeZone   string `db:"time_zone"`
}

type MeetingType struct {
	ID              string `db:"id"`
	OwnerID         string `db:"owner_id"`
	Name            string `db:"name"`
	Description     string `db:"description"`
	AvailableFrom   string `db:"available_from"`
	AvailableTo     string `db:"available_to"`
	DurationMinutes int32  `db:"duration_minutes"`
	Slug            string `db:"slug"`
	IsActive        bool   `db:"is_active"`
}

type Participant struct {
	ID    string `db:"id"`
	Name  string `db:"name"`
	Email string `db:"email"`
}

type Meeting struct {
	ID            string     `db:"id"`
	MeetingTypeID string     `db:"meeting_type_id"`
	StartDateTime time.Time  `db:"start_date_time"`
	Comment       string     `db:"comment"`
	InitiatorID   string     `db:"initiator_id"`
	IsConfirmed   *bool      `db:"is_confirmed"`
}

type MeetingParticipant struct {
	MeetingID     string `db:"meeting_id"`
	ParticipantID string `db:"participant_id"`
}
