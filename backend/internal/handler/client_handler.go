package handler

import (
	"errors"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/hexlet/meeting-booking/backend/internal/model"
	"github.com/hexlet/meeting-booking/backend/internal/repository"
	"github.com/hexlet/meeting-booking/backend/internal/service"
)

type ClientHandler struct {
	ownerRepo  repository.OwnerRepository
	mtRepo     repository.MeetingTypeRepository
	mRepo      repository.MeetingRepository
	mpRepo     repository.MeetingParticipantRepository
	meetingSvc *service.MeetingService
}

func NewClientHandler(
	ownerRepo repository.OwnerRepository,
	mtRepo repository.MeetingTypeRepository,
	mRepo repository.MeetingRepository,
	mpRepo repository.MeetingParticipantRepository,
	meetingSvc *service.MeetingService,
) *ClientHandler {
	return &ClientHandler{
		ownerRepo:  ownerRepo,
		mtRepo:     mtRepo,
		mRepo:      mRepo,
		mpRepo:     mpRepo,
		meetingSvc: meetingSvc,
	}
}

func (h *ClientHandler) Routes() chi.Router {
	r := chi.NewRouter()
	r.Get("/meeting-types", h.listActiveMeetingTypes)
	r.Get("/meeting-types/{meetingTypeSlug}", h.getMeetingTypeBySlug)
	r.Get("/meeting-types/{meetingTypeSlug}/meetings", h.listOccupiedSlots)
	r.Post("/meeting-types/{meetingTypeSlug}/meetings", h.createMeeting)
	return r
}

func (h *ClientHandler) listActiveMeetingTypes(w http.ResponseWriter, r *http.Request) {
	owner, err := h.ownerFromSlug(r)
	if err != nil {
		writeError(w, "owner not found", http.StatusNotFound)
		return
	}
	types, err := h.mtRepo.ListActiveByOwnerID(owner.ID)
	if err != nil {
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	resp := make([]clientMeetingTypeResponse, len(types))
	for i, mt := range types {
		resp[i] = toClientMeetingType(&mt, owner)
	}
	writeJSON(w, http.StatusOK, resp)
}

func (h *ClientHandler) getMeetingTypeBySlug(w http.ResponseWriter, r *http.Request) {
	owner, err := h.ownerFromSlug(r)
	if err != nil {
		writeError(w, "owner not found", http.StatusNotFound)
		return
	}
	meetingTypeSlug := chi.URLParam(r, "meetingTypeSlug")
	mt, err := h.mtRepo.GetByOwnerIDAndSlug(owner.ID, meetingTypeSlug)
	if err != nil {
		writeError(w, "meeting type not found", http.StatusNotFound)
		return
	}
	writeJSON(w, http.StatusOK, toClientMeetingType(mt, owner))
}

func (h *ClientHandler) listOccupiedSlots(w http.ResponseWriter, r *http.Request) {
	owner, err := h.ownerFromSlug(r)
	if err != nil {
		writeError(w, "owner not found", http.StatusNotFound)
		return
	}
	meetingTypeSlug := chi.URLParam(r, "meetingTypeSlug")
	mt, err := h.mtRepo.GetByOwnerIDAndSlug(owner.ID, meetingTypeSlug)
	if err != nil {
		writeError(w, "meeting type not found", http.StatusNotFound)
		return
	}
	meetings, err := h.mRepo.ListOccupiedByMeetingType(mt.ID)
	if err != nil {
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	ctr := toClientMeetingType(mt, owner)
	resp := make([]clientMeetingResponse, len(meetings))
	for i, m := range meetings {
		end := m.StartDateTime.Add(time.Duration(mt.DurationMinutes) * time.Minute)
		resp[i] = clientMeetingResponse{
			MeetingType:   ctr,
			StartDateTime: m.StartDateTime.Format(time.RFC3339),
			EndDateTime:   end.Format(time.RFC3339),
		}
	}
	writeJSON(w, http.StatusOK, resp)
}

func (h *ClientHandler) createMeeting(w http.ResponseWriter, r *http.Request) {
	owner, err := h.ownerFromSlug(r)
	if err != nil {
		writeError(w, "owner not found", http.StatusNotFound)
		return
	}
	meetingTypeSlug := chi.URLParam(r, "meetingTypeSlug")

	var body createMeetingRequest
	if err := decodeJSON(r, &body); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}
	startTime, err := time.Parse(time.RFC3339, body.StartDateTime)
	if err != nil {
		writeError(w, "invalid startDateTime", http.StatusBadRequest)
		return
	}
	if len(body.Participants) == 0 {
		writeError(w, "at least one participant required", http.StatusBadRequest)
		return
	}

	var partInputs []service.CreateParticipantInput
	for _, p := range body.Participants {
		partInputs = append(partInputs, service.CreateParticipantInput{
			Name:  p.Name,
			Email: p.Email,
		})
	}

	input := service.CreateMeetingInput{
		OwnerID:         owner.ID,
		MeetingTypeSlug: meetingTypeSlug,
		StartDateTime:   startTime,
		Comment:         body.Comment,
		InitiatorName:   body.Participants[0].Name,
		InitiatorEmail:  body.Participants[0].Email,
		Participants:    partInputs,
	}

	meeting, err := h.meetingSvc.Create(input)
	if err != nil {
		if errors.Is(err, service.ErrNotActive) {
			writeError(w, err.Error(), http.StatusBadRequest)
			return
		}
		if errors.Is(err, service.ErrSlotOccupied) {
			writeError(w, err.Error(), http.StatusConflict)
			return
		}
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	mt, err := h.mtRepo.GetByID(meeting.MeetingTypeID)
	if err != nil {
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	end := meeting.StartDateTime.Add(time.Duration(mt.DurationMinutes) * time.Minute)
	resp := clientMeetingResponse{
		MeetingType:   toClientMeetingType(mt, owner),
		StartDateTime: meeting.StartDateTime.Format(time.RFC3339),
		EndDateTime:   end.Format(time.RFC3339),
	}
	writeJSON(w, http.StatusCreated, resp)
}

func (h *ClientHandler) ownerFromSlug(r *http.Request) (*model.Owner, error) {
	slug := chi.URLParam(r, "ownerSlug")
	return h.ownerRepo.FindByClientSlug(slug)
}

func toClientOwner(o *model.Owner) clientOwnerResponse {
	return clientOwnerResponse{
		Name:       o.Name,
		ClientSlug: o.ClientSlug,
		TimeZone:   o.TimeZone,
	}
}

func toClientMeetingType(mt *model.MeetingType, owner *model.Owner) clientMeetingTypeResponse {
	return clientMeetingTypeResponse{
		Owner:           toClientOwner(owner),
		Name:            mt.Name,
		Description:     mt.Description,
		AvailableFrom:   mt.AvailableFrom,
		AvailableTo:     mt.AvailableTo,
		DurationMinutes: mt.DurationMinutes,
		Slug:            mt.Slug,
	}
}
