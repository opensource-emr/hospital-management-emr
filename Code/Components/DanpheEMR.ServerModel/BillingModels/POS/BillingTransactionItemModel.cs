using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    public class BillingTransactionItemModel  // Its the model of the BIL_TXN_BillTransactionItems
    {
        [Key]
        public int BillingTransactionItemId { get; set; }
        [ForeignKey("BillingTransaction")]
        public int? BillingTransactionId { get; set; }
        public int PatientId { get; set; }
        public int? PerformerId { get; set; }
        public string PerformerName { get; set; }
        public int ServiceDepartmentId { get; set; }
        public string ServiceDepartmentName { get; set; }
        public int ServiceItemId { get; set; }//sud:17March'23--For new billingStructure Changes
        public int PriceCategoryId { get; set; }//sud:17March'23--For new billingStructure Changes
        public string ItemCode { get; set; }//sud:17March'23--For new billingStructure Changes

        public int? IntegrationItemId { get; set; }//sud:17March'23--For new billingStructure Changes
        public string ProcedureCode { get; set; }
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public double Price { get; set; }
        public double Quantity { get; set; }
        public double SubTotal { get; set; }
        public double DiscountPercent { get; set; }
        public double DiscountPercentAgg { get; set; }
        public double DiscountAmount { get; set; }
        public double Tax { get; set; }
        public double TotalAmount { get; set; }
        public string BillStatus { get; set; }
        //this requisitionid comes from other modules for Requisition. 
        public Int64? RequisitionId { get; set; }
        public DateTime? RequisitionDate { get; set; }
        public DateTime? CounterDay { get; set; }
        public int CounterId { get; set; }
        public DateTime? PaidDate { get; set; }
        public bool? ReturnStatus { get; set; }
        public double? ReturnQuantity { get; set; }
        //this will be employeeid of the current user--sudarshan:7may'17
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public string Remarks { get; set; }
        public string CancelRemarks { get; set; }
        public decimal TaxPercent { get; set; }
        public DateTime? CancelledOn { get; set; }
        //added sudarshan: 27May'17--to track who cancelled the credit item.
        public int? CancelledBy { get; set; }
        public int? PrescriberId { get; set; }
        public int? PatientVisitId { get; set; }
        public int? BillingPackageId { get; set; }

        public double TaxableAmount { get; set; }

        public decimal NonTaxableAmount { get; set; }//added: sud: 29May'18
        public int? PaymentReceivedBy { get; set; }//added: sud: 29May'18
        public int? PaidCounterId { get; set; }//added: sud: 29May'18       

        public string BillingType { get; set; }//added: sud: 19jun'18
        public int? RequestingDeptId { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }

        public bool IsCoPayment { get; set; } //Krishna: 8thDec'22
        public decimal CoPaymentCashAmount { get; set; } //Krishna: 8thDec'22
        public decimal CoPaymentCreditAmount { get; set; } //Krishna: 8thDec'22
        public bool? IsAutoBillingItem { get; set; }
        public bool? IsAutoCalculationStop { get; set; }

        [NotMapped]
        public bool IsTaxApplicable { get; set; } //added: ashim: 30May'18 to maintain TaxApplicable Property in client side during normal billing transaction

        //checked only if we need to do a post to INS_TXN_PatientInsurancePackages table
        [NotMapped]
        public bool IsInsurancePackage { get; set; }
        public int? PatientInsurancePackageId { get; set; }

        public virtual PatientModel Patient { get; set; }
        public virtual BillingTransactionModel BillingTransaction { get; set; }
        public virtual ServiceDepartmentModel ServiceDepartment { get; set; }


        public string VisitType { get; set; }//sud: 28Sept'18--needed for Lab, etc..

        [NotMapped]
        public string RequestingUserName { get; set; }//sud:24Sept'18
        [NotMapped]
        public string RequestingUserDept { get; set; }//sud:24Sept'18

        public static BillingTransactionItemModel GetClone(BillingTransactionItemModel ipTxnItem)
        {
            BillingTransactionItemModel retTxnItem = (BillingTransactionItemModel)ipTxnItem.MemberwiseClone();
            return retTxnItem;
        }


        //sud: 9Sept'18-- added for BillCancelltion feature.
        [NotMapped]
        public int CancelQty { get; set; }
        [NotMapped]
        public int ReturnQty { get; set; }
        [NotMapped]
        public int BalanceQty { get; set; }
        [NotMapped]
        public string ItemIntegrationName { get; set; }
        [NotMapped]
        public string SrvDeptIntegrationName { get; set; }

        [NotMapped]
        public string TransactionType { get; set; }

        //Price Category includes: Normal, Foreigner, EHS, SAARCCitizen, GovtInsurance, etc.. 
        public string PriceCategory { get; set; }//sud: 25Feb'19

        [NotMapped]
        public DateTime? StartedOn { get; set; }
        [NotMapped]
        public DateTime? EndedOn { get; set; }
        [NotMapped]
        public bool IsPatTransfered { get; set; }

        public int? ProvisionalReceiptNo { get; set; }//Yubraj 31th may '19
        public int? ProvisionalFiscalYearId { get; set; } //Yubraj 31th may '19

        [NotMapped]
        public string ProvFiscalYear { get; set; }

        [NotMapped]
        public bool IsLastBed { get; set; }

        public bool IsInsurance { get; set; }

        public int DiscountSchemeId { get; set; } //Yubraj 30th July '19
        [NotMapped]
        public bool IsSelected { get; set; } // Rajesh: 7Aug19
        [NotMapped]
        public string ModifiedByName { get; set; }

        public string OrderStatus { get; set; }//pratik:7Aug2020
        public string LabTypeName { get; set; }//pratik:9Feb2021
        public int? ReferredById { get; set; }//Krishna, 14th jun'22, added this to track external referrer.
        public int? DischargeStatementId { get; set; } //Krishna, 31stMarch'23, Copied from EMR_V2.3.1_manipal
        [NotMapped]
        public decimal CoPaymentCashPercent { get; set; }
        [NotMapped]
        public decimal CoPaymentCreditPercent { get; set; }
        [NotMapped]
        public int? ProvisionalReturnItemId { get; set; } //Krishna, 9thJuly'23, This added just to return the Property to client.
        public bool IsProvisionalDischarge { get; set; } //Krishna, 29thAug'23, This will track Provisional Discharge

        public BillingTransactionItemModel()
        {
            //Below fields are NOT null in DB, so initializing them to Zero so that it won't crash even if null value comes from other functions.
            CoPaymentCashAmount = 0;
            CoPaymentCreditAmount = 0;

        }
    }
}
