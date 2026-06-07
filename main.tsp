import "@typespec/http";
import "@typespec/rest";

import "./models/owner.tsp";
import "./models/meeting-type.tsp";
import "./models/participant.tsp";
import "./models/meeting.tsp";

import "./apis/admin.tsp";
import "./apis/user.tsp";

using Http;
using Rest;

@service(#{ title: "Meeting Booking Service" })
@server("http://localhost:8080", "Local development server")
namespace MeetingBooking;
