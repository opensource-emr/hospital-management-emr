using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class OTTeamsModel
    {
        [Key]
        public int OTTeamId { get; set; }
        public int EmployeeId { get; set; }
        public int OTBookingId { get; set; }
        public int PatientId { get; set; }
        public int? PatientVisitId { get; set; }
        public string RoleType { get; set; }

        //public virtual List<OtBookingListModel> OtbookingDetails { get; set; }

        //[NotMapped]
        //public string OtAssistantList { get; set; }
        //[NotMapped]
        //public int AnesthetistDoctorId { get; set; }
        //[NotMapped]
        //public int ScrubNurseId { get; set; }

        //[NotMapped]
        //public int SurgeonId { get; set; }

    }
}
