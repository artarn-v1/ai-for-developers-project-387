using Http;

@tag("admin")
namespace MeetingBooking.Admin;

using MeetingBooking;

model MeetingTypeResponse {
  @format("uuid")
  id: string;

  @example("Личное напоминание про масло")
  name: string;

  @example("Напоминание о смене масла в автомобиле")
  description: string;

  @pattern("^([01][0-9]|2[0-3]):[0-5][0-9]$")
  @example("09:00")
  availableFrom: string;

  @pattern("^([01][0-9]|2[0-3]):[0-5][0-9]$")
  @example("18:00")
  availableTo: string;

  @example(10)
  durationMinutes: int32;

  @example("personal-oil-change")
  slug: string;

  @example(true)
  isActive: boolean;
}

model CreateMeetingTypeRequest {
  name: string;

  description: string;

  @pattern("^([01][0-9]|2[0-3]):[0-5][0-9]$")
  availableFrom: string;

  @pattern("^([01][0-9]|2[0-3]):[0-5][0-9]$")
  availableTo: string;

  durationMinutes: int32;

  slug: string;

  isActive: boolean;
}

model MeetingResponse {
  @format("uuid")
  id: string;

  meetingType: MeetingTypeResponse;

  startDateTime: utcDateTime;

  comment: string;

  initiator: Participant;

  isConfirmed?: boolean;

  participants: Participant[];
}

model MeetingStatusUpdate {
  isConfirmed: boolean;
}

model MeetingTypeStatusUpdate {
  @example(true)
  isActive: boolean;
}

@route("/admin/{adminSlug}/meeting-types")
interface AdminMeetingTypes {
  @get
  list(@path adminSlug: string): MeetingTypeResponse[];

  @post
  create(@path adminSlug: string, @body body: CreateMeetingTypeRequest): MeetingTypeResponse;

  @route("{meetingTypeId}")
  @patch
  updateStatus(
    @path adminSlug: string,
    @path meetingTypeId: string,
    @body body: MeetingTypeStatusUpdate
  ): MeetingTypeResponse;
}

@route("/admin/{adminSlug}/meetings")
interface AdminMeetings {
  @get
  list(
    @path adminSlug: string,
    @query dateStartFrom?: utcDateTime,
    @query dateStartTo?: utcDateTime,
    @query isConfirmed?: boolean,
  ): MeetingResponse[];
}

@route("/admin/{adminSlug}/meetings/{meetingId}")
interface AdminMeetingActions {
  @patch
  updateStatus(
    @path adminSlug: string,
    @path meetingId: string,
    @body body: MeetingStatusUpdate
  ): MeetingResponse;
}
