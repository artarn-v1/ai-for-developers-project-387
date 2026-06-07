using Http;

@tag("client")
namespace MeetingBooking.Client;

using MeetingBooking;

model ClientOwnerResponse {
  name: string;

  clientSlug: string;
}

model ClientMeetingTypeResponse {
  owner: ClientOwnerResponse;

  name: string;

  description: string;

  @pattern("^([01][0-9]|2[0-3]):[0-5][0-9]$")
  availableFrom: string;

  @pattern("^([01][0-9]|2[0-3]):[0-5][0-9]$")
  availableTo: string;

  durationMinutes: int32;

  slug: string;
}

model ClientMeetingResponse {
  meetingType: ClientMeetingTypeResponse;

  startDateTime: utcDateTime;

  endDateTime: utcDateTime;
}

model CreateParticipantRequest {
  name: string;

  @format("email")
  email: string;
}

model CreateMeetingRequest {
  startDateTime: utcDateTime;

  comment: string;

  participants: CreateParticipantRequest[];
}

@route("/client/{ownerSlug}/meeting-types")
interface ClientMeetingTypes {
  @get
  listActive(@path ownerSlug: string): ClientMeetingTypeResponse[];
}

@route("/client/{ownerSlug}/meeting-types/{meetingTypeSlug}/meetings")
interface ClientSlots {
  @get
  listOccupied(@path ownerSlug: string, @path meetingTypeSlug: string): ClientMeetingResponse[];
}

@route("/client/{ownerSlug}/meeting-types/{meetingTypeSlug}/meetings")
interface ClientMeetings {
  @post
  create(
    @path ownerSlug: string,
    @path meetingTypeSlug: string,
    @body body: CreateMeetingRequest
  ): ClientMeetingResponse;
}
