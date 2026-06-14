using Http;

@tag("client")
namespace MeetingBooking.Client;

using MeetingBooking;

model ClientOwnerResponse {
  @example("Evgeny")
  name: string;

  @example("evgeny")
  clientSlug: string;
}

model ClientMeetingTypeResponse {
  owner: ClientOwnerResponse;

  @example("Личное напоминание про масло")
  name: string;

  @example("Напоминание о смене масла")
  description: string;

  @pattern("^([01][0-9]|2[0-3]):[0-5][0-9]$")
  availableFrom: string;

  @pattern("^([01][0-9]|2[0-3]):[0-5][0-9]$")
  availableTo: string;

  @example(10)
  durationMinutes: int32;

  @example("personal-oil-change")
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
