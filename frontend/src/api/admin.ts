import { api } from './client.ts'
import type { components } from '../types/api.ts'

type MeetingTypeResponse = components['schemas']['Admin.MeetingTypeResponse']
type CreateMeetingTypeRequest = components['schemas']['Admin.CreateMeetingTypeRequest']
type MeetingResponse = components['schemas']['Admin.MeetingResponse']
type MeetingStatusUpdate = components['schemas']['Admin.MeetingStatusUpdate']

export function getMeetingTypes(adminSlug: string) {
  return api.get<MeetingTypeResponse[]>(
    `/admin/${adminSlug}/meeting-types`,
  )
}

export function createMeetingType(
  adminSlug: string,
  body: CreateMeetingTypeRequest,
) {
  return api.post<MeetingTypeResponse>(
    `/admin/${adminSlug}/meeting-types`,
    body,
  )
}

export function getMeetings(adminSlug: string) {
  return api.get<MeetingResponse[]>(`/admin/${adminSlug}/meetings`)
}

export function updateMeetingStatus(
  adminSlug: string,
  meetingId: string,
  body: MeetingStatusUpdate,
) {
  return api.patch<MeetingResponse>(
    `/admin/${adminSlug}/meetings/${meetingId}`,
    body,
  )
}
