namespace MeetingBooking;

model Owner {
  @key
  @format("uuid")
  id: string;

  name: string;

  adminSlug: string;

  clientSlug: string;
}
