package handler

import (
	"database/sql"
	"errors"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/hexlet/meeting-booking/backend/internal/model"
	"github.com/hexlet/meeting-booking/backend/internal/repository"
)

type AdminHandler struct {
	ownerRepo repository.OwnerRepository
	mtRepo    repository.MeetingTypeRepository
	mRepo     repository.MeetingRepository
	mpRepo    repository.MeetingParticipantRepository
	pRepo     repository.ParticipantRepository
}

func NewAdminHandler(
	ownerRepo repository.OwnerRepository,
	mtRepo repository.MeetingTypeRepository,
	mRepo repository.MeetingRepository,
	mpRepo repository.MeetingParticipantRepository,
	pRepo repository.ParticipantRepository,
) *AdminHandler {
	return &AdminHandler{
		ownerRepo: ownerRepo,
		mtRepo:    mtRepo,
		mRepo:     mRepo,
		mpRepo:    mpRepo,
		pRepo:     pRepo,
	}
}

func (h *AdminHandler) Routes() chi.Router {
	r := chi.NewRouter()
	r.Get("/", h.getOwner)
	r.Get("/meeting-types", h.listMeetingTypes)
	r.Post("/meeting-types", h.createMeetingType)
	r.Patch("/meeting-types/{meetingTypeId}", h.updateMeetingTypeStatus)
	r.Get("/meetings", h.listMeetings)
	r.Patch("/meetings/{meetingId}", h.updateMeetingStatus)
	return r
}

func (h *AdminHandler) getOwner(w http.ResponseWriter, r *http.Request) {
	owner, err := h.ownerFromSlug(r)
	if err != nil {
		writeError(w, "owner not found", http.StatusNotFound)
		return
	}
	writeJSON(w, http.StatusOK, adminOwnerResponse{
		Name:       owner.Name,
		ClientSlug: owner.ClientSlug,
		TimeZone:   owner.TimeZone,
	})
}

func (h *AdminHandler) listMeetingTypes(w http.ResponseWriter, r *http.Request) {
	owner, err := h.ownerFromSlug(r)
	if err != nil {
		writeError(w, "owner not found", http.StatusNotFound)
		return
	}
	types, err := h.mtRepo.ListByOwnerID(owner.ID)
	if err != nil {
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	resp := make([]adminMeetingTypeResponse, len(types))
	for i, mt := range types {
		resp[i] = toAdminMeetingType(&mt)
	}
	writeJSON(w, http.StatusOK, resp)
}

func (h *AdminHandler) createMeetingType(w http.ResponseWriter, r *http.Request) {
	owner, err := h.ownerFromSlug(r)
	if err != nil {
		writeError(w, "owner not found", http.StatusNotFound)
		return
	}
	var body createMeetingTypeRequest
	if err := decodeJSON(r, &body); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}
	mt := &model.MeetingType{
		ID:              generateID(),
		OwnerID:         owner.ID,
		Name:            body.Name,
		Description:     body.Description,
		AvailableFrom:   body.AvailableFrom,
		AvailableTo:     body.AvailableTo,
		DurationMinutes: body.DurationMinutes,
		Slug:            body.Slug,
		IsActive:        body.IsActive,
	}
	if err := h.mtRepo.Create(mt); err != nil {
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusCreated, toAdminMeetingType(mt))
}

func (h *AdminHandler) updateMeetingTypeStatus(w http.ResponseWriter, r *http.Request) {
	_, err := h.ownerFromSlug(r)
	if err != nil {
		writeError(w, "owner not found", http.StatusNotFound)
		return
	}
	meetingTypeID := chi.URLParam(r, "meetingTypeId")
	var body meetingTypeStatusUpdate
	if err := decodeJSON(r, &body); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if err := h.mtRepo.UpdateStatus(meetingTypeID, body.IsActive); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeError(w, "meeting type not found", http.StatusNotFound)
			return
		}
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	mt, err := h.mtRepo.GetByID(meetingTypeID)
	if err != nil {
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, toAdminMeetingType(mt))
}

func (h *AdminHandler) listMeetings(w http.ResponseWriter, r *http.Request) {
	owner, err := h.ownerFromSlug(r)
	if err != nil {
		writeError(w, "owner not found", http.StatusNotFound)
		return
	}

	filters := repository.MeetingFilters{}
	if v := r.URL.Query().Get("dateStartFrom"); v != "" {
		t, _ := parseTime(v)
		filters.DateStartFrom = &t
	}
	if v := r.URL.Query().Get("dateStartTo"); v != "" {
		t, _ := parseTime(v)
		filters.DateStartTo = &t
	}
	if v := r.URL.Query().Get("isConfirmed"); v != "" {
		b := v == "true"
		filters.IsConfirmed = &b
	}
	if v := r.URL.Query().Get("meetingTypeId"); v != "" {
		filters.MeetingTypeID = &v
	}

	meetings, err := h.mRepo.ListByOwnerID(owner.ID, filters)
	if err != nil {
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	resp := make([]adminMeetingResponse, 0, len(meetings))
	for _, m := range meetings {
		item, err := h.buildAdminMeetingResponse(&m)
		if err != nil {
			writeError(w, err.Error(), http.StatusInternalServerError)
			return
		}
		resp = append(resp, item)
	}
	writeJSON(w, http.StatusOK, resp)
}

func (h *AdminHandler) updateMeetingStatus(w http.ResponseWriter, r *http.Request) {
	_, err := h.ownerFromSlug(r)
	if err != nil {
		writeError(w, "owner not found", http.StatusNotFound)
		return
	}
	meetingID := chi.URLParam(r, "meetingId")
	var body meetingStatusUpdate
	if err := decodeJSON(r, &body); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if err := h.mRepo.UpdateStatus(meetingID, body.IsConfirmed); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeError(w, "meeting not found", http.StatusNotFound)
			return
		}
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	m, err := h.mRepo.GetByID(meetingID)
	if err != nil {
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	resp, err := h.buildAdminMeetingResponse(m)
	if err != nil {
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, resp)
}

func (h *AdminHandler) ownerFromSlug(r *http.Request) (*model.Owner, error) {
	slug := chi.URLParam(r, "adminSlug")
	return h.ownerRepo.FindByAdminSlug(slug)
}

func (h *AdminHandler) buildAdminMeetingResponse(m *model.Meeting) (adminMeetingResponse, error) {
	mt, err := h.mtRepo.GetByID(m.MeetingTypeID)
	if err != nil {
		return adminMeetingResponse{}, err
	}
	participants, err := h.mpRepo.ListByMeetingID(m.ID)
	if err != nil {
		return adminMeetingResponse{}, err
	}
	initiator, err := h.pRepo.GetByID(m.InitiatorID)
	if err != nil {
		return adminMeetingResponse{}, err
	}
	partDTOs := make([]participantDTO, len(participants))
	for i, p := range participants {
		partDTOs[i] = toParticipantDTO(&p)
	}
	return adminMeetingResponse{
		ID:            m.ID,
		MeetingType:   toAdminMeetingType(mt),
		StartDateTime: m.StartDateTime.Format(time.RFC3339),
		Comment:       m.Comment,
		Initiator:     toParticipantDTO(initiator),
		IsConfirmed:   m.IsConfirmed,
		Participants:  partDTOs,
	}, nil
}

func toAdminMeetingType(mt *model.MeetingType) adminMeetingTypeResponse {
	return adminMeetingTypeResponse{
		ID:              mt.ID,
		Name:            mt.Name,
		Description:     mt.Description,
		AvailableFrom:   mt.AvailableFrom,
		AvailableTo:     mt.AvailableTo,
		DurationMinutes: mt.DurationMinutes,
		Slug:            mt.Slug,
		IsActive:        mt.IsActive,
	}
}

func toParticipantDTO(p *model.Participant) participantDTO {
	return participantDTO{
		ID:    p.ID,
		Name:  p.Name,
		Email: p.Email,
	}
}
