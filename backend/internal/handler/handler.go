package handler

import (
	"database/sql"
	"errors"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/hexlet/meeting-booking/backend/internal/model"
	"github.com/hexlet/meeting-booking/backend/internal/repository"
	"github.com/hexlet/meeting-booking/backend/internal/service"
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

func (h *AdminHandler) ownerFromSlug(r *http.Request) (*model.Owner, error) {
	slug := chi.URLParam(r, "adminSlug")
	return h.ownerRepo.FindByAdminSlug(slug)
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
