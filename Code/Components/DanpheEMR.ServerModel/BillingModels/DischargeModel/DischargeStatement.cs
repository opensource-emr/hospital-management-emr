using System;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel.BillingModels.DischargeStatementModels
{
    public class DischargeStatementModel
    {
        [Key]
        public int DischargeStatementId { get; set; }
        public int FiscalYearId { get; set; }
        public DateTime StatementDate { get; set; }
        public TimeSpan StatementTime { get; set; }
        public int StatementNo { get; set; }
        public int PatientId { get; set; }
        public int PatientVisitId { get; set; }
        public int PrintCount { get; set; }
        public int PrintedBy { get; set; }
        public DateTime PrintedOn { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }
        public bool IsDischargeCancel { get; set; }
    }
}
