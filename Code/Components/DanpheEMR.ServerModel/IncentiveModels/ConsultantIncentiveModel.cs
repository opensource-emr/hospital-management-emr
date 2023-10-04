using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.IncentiveModels
{
    public class ConsultantIncentiveModel
    {
        public string ReferenceIds { get; set; }
        public int? EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public DateTime? TransactionDate { get; set; }
        public string TransactionType { get; set; }
        public double? TotalAmount { get; set; }
        public double? TotalTDS { get; set; }
        public string Remarks { get; set; }

        public int VoucherId { get; set; }
        public string VoucherName { get; set; }

    }
}
