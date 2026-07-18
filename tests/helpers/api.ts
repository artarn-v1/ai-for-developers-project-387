const API_BASE = 'http://localhost:8080'

export interface OwnerResponse {
  name: string
  clientSlug: string
  timeZone: string
}

export interface MeetingTypeInput {
  name: string
  description: string
  slug: string
  availableFrom: string
  availableTo: string
  durationMinutes: number
  isActive: boolean
}

export interface MeetingTypeResponse {
  id: string
  name: string
  description: string
  slug: string
  availableFrom: string
  availableTo: string
  durationMinutes: number
  isActive: boolean
}

export interface MeetingInput {
  startDateTime: string
  comment?: string
  participants: { name: string; email: string }[]
}

export interface ClientMeetingResponse {
  meetingType: {
    owner: { name: string; clientSlug: string; timeZone: string }
    name: string
    description: string
    availableFrom: string
    availableTo: string
    durationMinutes: number
    slug: string
  }
  startDateTime: string
  endDateTime: string
}

export interface MeetingResponse {
  id: string
  meetingType: MeetingTypeResponse
  startDateTime: string
  comment: string
  initiator: { id: string; name: string; email: string }
  isConfirmed: boolean | null
  participants: { id: string; name: string; email: string }[]
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    let message = `API error: ${res.status}`
    try {
      const body = await res.json()
      message = body.error ?? body.message ?? message
    } catch { /* ignore */ }
    throw new Error(message)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export async function getOwners(): Promise<OwnerResponse[]> {
  return request<OwnerResponse[]>('/owners')
}

export async function createMeetingType(
  adminSlug: string,
  data: MeetingTypeInput,
): Promise<MeetingTypeResponse> {
  return request<MeetingTypeResponse>(`/admin/${adminSlug}/meeting-types`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getMeetingTypes(
  adminSlug: string,
): Promise<MeetingTypeResponse[]> {
  return request<MeetingTypeResponse[]>(`/admin/${adminSlug}/meeting-types`)
}

export async function updateMeetingTypeStatus(
  adminSlug: string,
  meetingTypeId: string,
  isActive: boolean,
): Promise<MeetingTypeResponse> {
  return request<MeetingTypeResponse>(
    `/admin/${adminSlug}/meeting-types/${meetingTypeId}`,
    { method: 'PATCH', body: JSON.stringify({ isActive }) },
  )
}

export async function createMeeting(
  ownerSlug: string,
  meetingTypeSlug: string,
  data: MeetingInput,
): Promise<ClientMeetingResponse> {
  return request<ClientMeetingResponse>(
    `/client/${ownerSlug}/meeting-types/${meetingTypeSlug}/meetings`,
    { method: 'POST', body: JSON.stringify(data) },
  )
}

export async function getMeetings(
  adminSlug: string,
): Promise<MeetingResponse[]> {
  return request<MeetingResponse[]>(`/admin/${adminSlug}/meetings`)
}

export async function updateMeetingStatus(
  adminSlug: string,
  meetingId: string,
  isConfirmed: boolean,
): Promise<MeetingResponse> {
  return request<MeetingResponse>(
    `/admin/${adminSlug}/meetings/${meetingId}`,
    { method: 'PATCH', body: JSON.stringify({ isConfirmed }) },
  )
}
