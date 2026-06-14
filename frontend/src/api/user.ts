import { api } from './client.ts'
import type { components } from '../types/api.ts'

type ClientMeetingTypeResponse = components['schemas']['Client.ClientMeetingTypeResponse']
type ClientMeetingResponse = components['schemas']['Client.ClientMeetingResponse']
type CreateMeetingRequest = components['schemas']['Client.CreateMeetingRequest']

export function getActiveMeetingTypes(ownerSlug: string) {
  return api.get<ClientMeetingTypeResponse[]>(
    `/client/${ownerSlug}/meeting-types`,
  )
}

export function getOccupiedSlots(
  ownerSlug: string,
  meetingTypeSlug: string,
) {
  return api.get<ClientMeetingResponse[]>(
    `/client/${ownerSlug}/meeting-types/${meetingTypeSlug}/meetings`,
  )
}

export function createMeeting(
  ownerSlug: string,
  meetingTypeSlug: string,
  body: CreateMeetingRequest,
) {
  return api.post<ClientMeetingResponse>(
    `/client/${ownerSlug}/meeting-types/${meetingTypeSlug}/meetings`,
    body,
  )
}
