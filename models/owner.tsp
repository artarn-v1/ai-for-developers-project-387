namespace MeetingBooking;

model Owner {
  @key
  @format("uuid")
  id: string;

  @example("Evgeny")
  name: string;

  @example("evgeny-admin")
  adminSlug: string;

  @example("evgeny")
  clientSlug: string;
}
