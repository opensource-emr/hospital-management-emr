using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class ZeroItemDischargeModel
    {
        public int PatientVisitId { get; set; }
        public int PatientId { get; set; }
        public int CounterId { get; set; }
        public int? DiscountSchemeId { get; set; }
        public double DepositBalance { get; set; }
        public DateTime DischargeDate { get; set; }
        public string DischargeRemarks { get; set; }
        public string DischargeFrom { get; set; }
    }
}
