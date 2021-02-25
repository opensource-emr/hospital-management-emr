
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class FiscalYearModel
    {
        [Key]
        public int FiscalYearId { get; set; }
        public string FiscalYearName { get; set; }
        public string NpFiscalYearName { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Description { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public bool IsActive { get; set; }

        [NotMapped]
        public string nStartDate { get; set; }
        [NotMapped]
        public string nEndDate { get; set; }

        public bool? IsClosed { get; set; }
        public int? ClosedBy { get; set; }
        public DateTime? ClosedOn { get; set; }
        public bool? ReadyToClose { get; set; }

        [NotMapped]
        public string Remark { get; set; }
        [NotMapped]
        public bool? showreopen { get; set; }

        //sud-nagesh: 20June'20-- for Acc-Hospital Separation.
        public int? HospitalId { get; set; }

        [NotMapped]
        public DateTime? CurrentDate { get; set; } //sud-nagesh:21Jun'20--only for local usage, not available in database.

    }

}
