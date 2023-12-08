using System.Collections.Generic;

namespace DanpheEMR.Services.SSF.DTO
{
    public class Accident
    {
        public string totalBooked { get; set; }
        public string bookedAmount { get; set; }
    }

    public class Medical
    {
        public object totalBooked { get; set; }
        public string bookedAmount { get; set; }
        public string type { get; set; }
    }

    public class Response
    {
        public List<Medical> medical { get; set; }
        public List<Accident> accident { get; set; }
    }

    public class ClaimBookingResponseRoot
    {
        public string resourceType { get; set; }
        public List<Response> response { get; set; }
    }
}
