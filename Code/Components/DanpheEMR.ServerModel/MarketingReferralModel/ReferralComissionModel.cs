using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.MarketingReferralModel
{
    public class ReferralComissionModel
    {
        [Key]
        public int ReferralCommissionId { get; set; }
        public int FiscalYearId { get; set; }
        public int BillingTransactionId { get; set; }
        public string InvoiceNoFormatted { get; set; }
        public DateTime InvoiceDate { get; set; }
        public int PatientId { get; set; }
        public int PatientVisitId { get; set; }
        public int ReferringPartyId { get; set; }
        public int ReferralSchemeId { get; set; }
        public decimal InvoiceTotalAmount { get; set; }
        public decimal ReturnAmount { get; set; }
        public decimal InvoiceNetAmount { get; set; }
        public decimal Percentage { get; set; }
        public decimal ReferralAmount { get; set; }
        public string Remarks { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }

    }
}
