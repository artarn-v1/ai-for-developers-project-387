namespace MeetingBooking;

model MeetingType {
  @key
  @format("uuid")
  id: string;

  owner: Owner;

  name: string;

  description: string;

  @pattern("^([01][0-9]|2[0-3]):[0-5][0-9]$")
  availableFrom: string = "09:00";

  @pattern("^([01][0-9]|2[0-3]):[0-5][0-9]$")
  availableTo: string = "18:00";

  durationMinutes: int32;

  slug: string;

  isActive: boolean;
}
