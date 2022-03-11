using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    public class BillingTransactionModel
    {
        [Key]
        public int BillingTransactionId { get; set; }
        public int PatientId { get; set; }
        public int? PatientVisitId { get; set; }
        public int? CounterId { get; set; }
        public DateTime? PaidDate { get; set; }
        public string TransactionType { get; set; }
        public double? TotalQuantity { get; set; }
        public double? SubTotal { get; set; }
        public double? DiscountPercent { get; set; }
        public double? DiscountAmount { get; set; }
        public double? TaxTotal { get; set; }
        public double? TotalAmount { get; set; }
        public double? PaidAmount { get; set; }
        public double? DepositAmount { get; set; }
        public double? DepositAvailable { get; set; }
        public double? DepositUsed { get; set; }
        public double? DepositReturnAmount { get; set; }
        public double? DepositBalance { get; set; }
        public string Remarks { get; set; }
        public double? Tender { get; set; }
        public double? Change { get; set; }

        //this will be employeeid of the requesting user--sudarshan:7May'17
        public int? CreatedBy { get; set; }//might need to create virtual employeemodel for this
        public DateTime? CreatedOn { get; set; }
        //public string BillReturnRemarks { get; set; }//removed sud: 5May'18
        public int? PrintCount { get; set; }

        //added below 3fields: sud:4May'18 - for CreditInvoice scenario
        public string PaymentMode { get; set; }
        public string PaymentDetails { get; set; }
        public string BillStatus { get; set; }
        //start: Ashim-5May for FiscalYear and InvoiceNo.
        public int? FiscalYearId { get; set; }
        [NotMapped]
        public string FiscalYear { get; set; }//added: sud-5May (need to show this in client side)
        public int? InvoiceNo { get; set; }
        //end: Ashim-5May for FiscalYear and InvoiceNo.
        public virtual PatientModel Patient { get; set; }
        public virtual List<BillingTransactionItemModel> BillingTransactionItems { get; set; }

        public bool? ReturnStatus { get; set; }
        //public bool? IsRemoteSynced { get; set; }//added for IRD-sud:6May'18

        public int? TaxId { get; set; }
        public string InvoiceCode { get; set; }
        public double? TaxableAmount { get; set; }//sud:9May'18
        public bool? IsRemoteSynced { get; set; }
        public bool? IsRealtime { get; set; }//sud: 10May'18

        public int? SettlementId { get; set; }//sud: 13May'18--check with dinesh if it's already added in another branch.

        public double? NonTaxableAmount { get; set; }//added: sud: 29May'18
        public int? PaymentReceivedBy { get; set; }//added: sud: 29May'18
        public int? PaidCounterId { get; set; }//added: sud: 29May'18

        public int? PackageId { get; set; }//sud: 10Sept'18-- needs revision
        public string PackageName { get; set; }//sud: 10Sept'18-- needs revision
                                               //15July'2018 :Ashim Added for Govt Insurance Billing
        public bool? IsInsuranceBilling { get; set; }
        public bool? IsInsuranceClaimed { get; set; }
        public DateTime? InsuranceClaimedDate { get; set; }
        public int? InsuranceProviderId { get; set; }
        //Yubraj: 22nd April '19 for credit organization 
        public double? ExchangeRate { get; set; }//Sanjit: 5-17-19 added for foreign exchange
        public int? OrganizationId { get; set; }
        [NotMapped]
        public string OrganizationName { get; set; }

        [NotMapped]//Yubraj 16th Jan '19
        public int? ReceiptNo { get; set; }
        [NotMapped]//shankar 14th nov '19
        public int? CreditNoteNumber { get; set; }
        //sud: 19Jul'19-- For Insurance Transaction Date for MNK-Specific.
        public DateTime? InsTransactionDate { get; set; }
        public DateTime? PrintedOn { get; set; } //Yubraj: 13th August'19
        public int? PrintedBy { get; set; } //Yubraj: 13th August'19

        public int? PartialReturnTxnId { get; set; } // Rajesh:7Aug19
        public decimal? AdjustmentTotalAmount { get; set; }
        [NotMapped]
        public string BillingUserName { get; set; }//Yubaraj:28June'19--needed for Billing receipt to return current logged in user.

        public string InvoiceType { get; set; }// pratik:29April 2020-- needed for partial payment invoice in ipbilling

        public string LabTypeName { get; set; }//pratik:25Feb2021

        //sud:1-Oct'21--Changing Claimcode from String to Int64-- to use Incremental logic (max+1)
        //need nullable since ClaimCode is Non-Mandatory for normal visits.
        public Int64? ClaimCode { get; set; }//pramod

        public static BillingTransactionModel GetCloneWithItems(BillingTransactionModel txnToClone)
        {
            BillingTransactionModel retTxnModel = new BillingTransactionModel()
            {
                BillingTransactionId = txnToClone.BillingTransactionId,
                BillingTransactionItems = txnToClone.BillingTransactionItems,
                FiscalYearId = txnToClone.FiscalYearId,
                InvoiceCode = txnToClone.InvoiceCode,
                InvoiceNo = txnToClone.InvoiceNo,
                SubTotal = txnToClone.SubTotal,
                DiscountAmount = txnToClone.DiscountAmount,
                DiscountPercent = txnToClone.DiscountPercent,
                SettlementId = txnToClone.SettlementId,
                BillStatus = txnToClone.BillStatus,
                PaymentMode = txnToClone.PaymentMode,
                PaymentDetails = txnToClone.PaymentDetails,
                CreatedOn = txnToClone.CreatedOn,
                CreatedBy = txnToClone.CreatedBy,
                CounterId = txnToClone.CounterId,
                DepositAmount = txnToClone.DepositAmount,
                DepositBalance = txnToClone.DepositBalance,
                PatientId = txnToClone.PatientId,
                IsRealtime = txnToClone.IsRealtime,
                IsRemoteSynced = txnToClone.IsRemoteSynced,
                PatientVisitId = txnToClone.PatientVisitId,
                Remarks = txnToClone.Remarks,
                TaxableAmount = txnToClone.TaxableAmount,
                TaxId = txnToClone.TaxId,
                TaxTotal = txnToClone.TaxTotal,
                TransactionType = txnToClone.TransactionType,
                PaidAmount = txnToClone.PaidAmount,
                PaidDate = txnToClone.PaidDate,
                TotalAmount = txnToClone.TotalAmount,
                TotalQuantity = txnToClone.TotalQuantity,
                DepositReturnAmount = txnToClone.DepositReturnAmount,
                Change = txnToClone.Change,
                PrintCount = txnToClone.PrintCount,
                Tender = txnToClone.Tender,
                ReturnStatus = txnToClone.ReturnStatus,
                InvoiceType = txnToClone.InvoiceType,
                LabTypeName = txnToClone.LabTypeName
            };
            return retTxnModel;
        }
    }
    public class BillingTransactionPostVM
    {
        public List<LabRequisitionModel> LabRequisition = new List<LabRequisitionModel>();
        public List<ImagingRequisitionModel> ImagingItemRequisition = new List<ImagingRequisitionModel>();
        public List<VisitModel> VisitItems = new List<VisitModel>();
        public BillingTransactionModel Txn = new BillingTransactionModel();
    }

}
