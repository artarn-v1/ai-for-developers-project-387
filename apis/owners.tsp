using Http;

@tag("public")
namespace MeetingBooking.Public;

@route("/owners")
interface Owners {
  @get
  list(): OwnerResponse[];
}

model OwnerResponse {
  @example("Evgeny")
  name: string;

  @example("evgeny")
  clientSlug: string;

  @example("Europe/Moscow")
  timeZone: string;
}
