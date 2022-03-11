using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class LabSMSModel
    {
        [Key]
        public int SmsId { get; set; }
        public long RequisitionId { get; set; }
        public string Message { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        [NotMapped]
        public string PhoneNumber { get; set; }
    }
}
