using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class FractionCalculationModel
    {
        [Key]
        public int FractionCalculationId { get; set; }
        public int PercentSettingId { get; set; }
        public int BillTxnItemId { get; set; }
        public int DoctorId { get; set; }
        public int IsParentId { get; set; }
        public int DesignationId { get; set; }
        public decimal? InitialPercent { get; set; }
        public decimal? FinalPercent { get; set; }
        public int CreatedBy { get; set; }
        public decimal? FinalAmount { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int IsActive { get; set; }
        public int Hierarchy { get; set; }

        [NotMapped]
        public int ParentId { get; set; }
    }
}
