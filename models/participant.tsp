namespace MeetingBooking;

model Participant {
  @key
  @format("uuid")
  id: string;

  name: string;

  @format("email")
  email: string;
}
