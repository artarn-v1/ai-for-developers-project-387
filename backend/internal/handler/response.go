package handler

type adminOwnerResponse struct {
	Name       string `json:"name"`
	ClientSlug string `json:"clientSlug"`
	TimeZone   string `json:"timeZone"`
}

type adminMeetingTypeResponse struct {
	ID              string `json:"id"`
	Name            string `json:"name"`
	Description     string `json:"description"`
	AvailableFrom   string `json:"availableFrom"`
	AvailableTo     string `json:"availableTo"`
	DurationMinutes int32  `json:"durationMinutes"`
	Slug            string `json:"slug"`
	IsActive        bool   `json:"isActive"`
}

type participantDTO struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

type adminMeetingResponse struct {
	ID            string                 `json:"id"`
	MeetingType   adminMeetingTypeResponse `json:"meetingType"`
	StartDateTime string                 `json:"startDateTime"`
	Comment       string                 `json:"comment"`
	Initiator     participantDTO         `json:"initiator"`
	IsConfirmed   *bool                  `json:"isConfirmed,omitempty"`
	Participants  []participantDTO       `json:"participants"`
}

type clientOwnerResponse struct {
	Name       string `json:"name"`
	ClientSlug string `json:"clientSlug"`
	TimeZone   string `json:"timeZone"`
}

type clientMeetingTypeResponse struct {
	Owner           clientOwnerResponse `json:"owner"`
	Name            string              `json:"name"`
	Description     string              `json:"description"`
	AvailableFrom   string              `json:"availableFrom"`
	AvailableTo     string              `json:"availableTo"`
	DurationMinutes int32               `json:"durationMinutes"`
	Slug            string              `json:"slug"`
}

type clientMeetingResponse struct {
	MeetingType   clientMeetingTypeResponse `json:"meetingType"`
	StartDateTime string                    `json:"startDateTime"`
	EndDateTime   string                    `json:"endDateTime"`
}

type createMeetingTypeRequest struct {
	Name            string `json:"name"`
	Description     string `json:"description"`
	AvailableFrom   string `json:"availableFrom"`
	AvailableTo     string `json:"availableTo"`
	DurationMinutes int32  `json:"durationMinutes"`
	Slug            string `json:"slug"`
	IsActive        bool   `json:"isActive"`
}

type meetingStatusUpdate struct {
	IsConfirmed bool `json:"isConfirmed"`
}

type meetingTypeStatusUpdate struct {
	IsActive bool `json:"isActive"`
}

type createParticipantRequest struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

type createMeetingRequest struct {
	StartDateTime string                    `json:"startDateTime"`
	Comment       string                    `json:"comment,omitempty"`
	Participants  []createParticipantRequest `json:"participants"`
}
