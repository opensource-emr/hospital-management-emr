using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class HealthCardInfoModel
    {
        [Key]
        public int PatHealthCardId { get; set; }
        public int PatientId { get; set; }
        public string InfoOnCardJSON { get; set; }
        public DateTime? BillingDate { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int CreatedBy { get; set; }
    }
}
