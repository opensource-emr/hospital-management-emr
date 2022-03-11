using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/*
 File: BillInvoiceReturnItemsModel.cs
 Created: 1May'21 <sudarshan>
 Description: Invoice items for return (credit note) */


namespace DanpheEMR.ServerModel
{
    public class BillInvoiceReturnItemsModel
    {
        [Key]
        public int BillReturnItemId { get; set; }
        public int BillReturnId { get; set; }
        public int BillingTransactionItemId { get; set; }
        public int BillingTransactionId { get; set; }
        public int PatientId { get; set; }
        public int ServiceDepartmentId { get; set; }
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public double? Price { get; set; }
        public double? RetQuantity { get; set; }
        public double? RetSubTotal { get; set; }
        public double? RetDiscountAmount { get; set; }
        public double? RetTaxAmount { get; set; }
        public double? RetTotalAmount { get; set; }
        public double? RetDiscountPercent { get; set; }
        public int? ProviderId { get; set; }
        public string BillStatus { get; set; }
        public Int64? RequisitionId { get; set; }
        public DateTime? RequisitionDate { get; set; }
        public int? RetCounterId { get; set; }
        public string RetRemarks { get; set; }
        public int? RequestedBy { get; set; }
        public int? PatientVisitId { get; set; }
        public int? BillingPackageId { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public string BillingType { get; set; }
        public int? RequestingDeptId { get; set; }
        public string VisitType { get; set; }
        public string PriceCategory { get; set; }
        public int? PatientInsurancePackageId { get; set; }
        public bool? IsInsurance { get; set; }
        public int? DiscountSchemeId { get; set; }
        public bool? IsCashBillSyncToAcc { get; set; }
        public bool? IsCreditBillSyncToAcc { get; set; }
        public string LabTypeName { get; set; }

    }
}
