namespace MeetingBooking;

model MeetingType {
  @key
  @format("uuid")
  id: string;

  owner: Owner;

  @example("Личное напоминание про масло")
  name: string;

  @example("Напоминание о смене масла в автомобиле")
  description: string;

  @pattern("^([01][0-9]|2[0-3]):[0-5][0-9]$")
  availableFrom: string = "09:00";

  @pattern("^([01][0-9]|2[0-3]):[0-5][0-9]$")
  availableTo: string = "18:00";

  @example(30)
  durationMinutes: int32;

  @example("personal-oil-change")
  slug: string;

  @example(true)
  isActive: boolean;
}
