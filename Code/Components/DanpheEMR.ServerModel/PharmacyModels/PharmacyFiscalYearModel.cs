using System;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel.PharmacyModels
{
    public class PharmacyFiscalYear
    {
        [Key]
        public int FiscalYearId { get; set; }
        public string FiscalYearName { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public bool? IsActive { get; set; }
        public string NpFiscalYearName { get; set; }
        public bool? IsClosed { get; set; }
        public DateTime? ClosedOn { get; set; }
        public int? ClosedBy { get; set; }
    }
}
