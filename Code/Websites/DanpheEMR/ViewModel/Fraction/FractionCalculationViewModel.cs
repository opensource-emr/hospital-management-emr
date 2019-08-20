using System;

namespace DanpheEMR.ViewModel
{
 public class FractionCalculationViewModel
    {
        public int? BilltxnId { get; set; }
        public string ItemName { get; set; }
        public decimal? DoctorPercent { get; set; }
        public decimal? InitialPercent { get; set; }
        public decimal? FinalPercent { get; set; }
        public DateTime? CreatedOn { get; set; }
        public string DoctorName { get; set; }
        public string Designation { get; set; }
        public decimal? FinalAmount { get; set; }
        public int? IsParentId { get; set; }
        public int? Hierarchy { get; set; }


        //public int FractionCalculationId { get; set; }
        //public int PercentSettingId { get; set; }
        //public int BillTxnItemId { get; set; }
        //public int DoctorId { get; set; }
        //public double IsParentId { get; set; }
        //public int DesignationId { get; set; }
        //public double InitialPercent { get; set; }
        //public double FinalPercent { get; set; }
        //public int CreatedBy { get; set; }
        //public double FinalAmount { get; set; }
        //public DateTime? CreatedOn { get; set; }
        //public int IsActive { get; set; }

    }
}

