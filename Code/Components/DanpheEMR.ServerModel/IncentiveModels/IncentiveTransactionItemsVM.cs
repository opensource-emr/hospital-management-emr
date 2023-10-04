using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.IncentiveModels
{
    class IncentiveTransactionItemsVM
    {
        public DateTime TransactionDate { get; set; }
        public int FiscalYearId { get; set; }
        public string InvoiceNo { get; set; }
        public string PriceCategory { get; set; }
        public int BillingTransactionItemId { get; set; }
        public int PatientId { get; set; }
        public string PatientName { get; set; }
        public string PatientCode { get; set; }
        public string ItemName { get; set; }
        public float? TotalAmount { get; set; }
        public int? ReferredByEmpId { get; set; }
        public string ReferredByEmpName { get; set; }
        public float? ReferredByPercent { get; set; }
        public float? ReferralAmount { get; set; }
        public int? AssignedToEmpId { get; set; }
        public string AssignedToEmpName { get; set; }
        public float? AssignedToPercent { get; set; }
        public float? AssignedToAmount { get; set; }

    }
}
