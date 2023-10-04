using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel.PharmacyModels.Patient_Consumption
{
    public class PatientConsumptionModel
    {
        [Key]
        public int PatientConsumptionId { get; set; }
        public int FiscalYearId { get; set; }
        public int? ConsumptionReceiptNo { get; set; }
        public int PatientId { get; set; }
        public int PatientVisitId { get; set; }
        public decimal SubTotal { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public string BillingStatus { get; set; }
        public int? SchemeId { get; set; }
        public int StoreId { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }
        [NotMapped]
        public string PatientName { get; set; }
        public List<PatientConsumptionItemModel> PatientConsumptionItems { get; set; }
        public int? PrescriberId { get; set; }

    }
}
