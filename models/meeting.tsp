namespace MeetingBooking;

model Meeting {
  @key
  @format("uuid")
  id: string;

  meetingType: MeetingType;

  startDateTime: utcDateTime;

  comment: string;

  initiator: Participant;

  isConfirmed?: boolean;
}

model MeetingParticipant {
  participant: Participant;
  meeting: Meeting;
}
