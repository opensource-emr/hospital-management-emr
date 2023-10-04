using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class InventoryFiscalYear
    {
        [Key]
        public int FiscalYearId { get; set; }
        public string FiscalYearName { get; set; }
        public string NpFiscalYearName { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public bool IsActive { get; set; }
        public bool? IsClosed { get; set; }
        public int? ClosedBy { get; set; }
        public DateTime? ClosedOn { get; set; }
    }
}
