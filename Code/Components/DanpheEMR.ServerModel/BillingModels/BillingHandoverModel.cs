using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class BillingHandoverModel
    {
        [Key]
        public int? HandoverId { get; set; }
        public int? UserId { get; set; }
        public int? CounterId { get; set; }
        public string HandoverType { get; set; }
        public int? HandOverUserId { get; set; }
        public double? PreviousAmount { get; set; }
        public double? HandoverAmount { get; set; }
        public double? TotalAmount { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public List<BillingDenominationModel> denomination { get; set; }
    }
}
