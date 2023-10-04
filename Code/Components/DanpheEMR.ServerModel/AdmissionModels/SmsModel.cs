using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class SmsModel
    {
        [Key]
        public int SmsId { get; set; }
        public int SmsCounter { get; set; }
        public int PatientId { get; set; }
        public int? DoctorId { get; set; }
        public string SmsInformation { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
        //public string response { get; set; }
        //public string credit_available { get; set; }
        //public string message_id { get; set; }
        //public int count { get; set; }
        //public int response_code { get; set; }
        //public string credit_consumed { get; set; }

    }
}

