using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class BillingDenominationModel
    {
        [Key]
        public int? DenominationId{ get; set; }
        public int? HandoverId { get; set; }
        public int? CurrencyType { get; set; }
        public double? Quantity{ get; set; }
        public double? Amount { get; set; }
    }
}
