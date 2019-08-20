
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

    }

}
