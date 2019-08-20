using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    public class History_BillingTransactionItem  // Its the model of the BIL_TXN_BillTransactionItems
    {
        [Key]
        public int BillTxnItemHistoryId { get; set; }
        public string HistoryType { get; set; }//eg: cancel/return/etc..

        //[ForeignKey("BillingTransactionItemId")]
        public int BillingTransactionItemId { get; set; }
        public int? BillingTransactionId { get; set; }
        public int PatientId { get; set; }
        public int? PatientVisitId { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? CounterId { get; set; }
        public string Remarks { get; set; }
        public int ServiceDepartmentId { get; set; }
        public string ServiceDepartmentName { get; set; }
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public double Price { get; set; }
        public double? Quantity { get; set; }
        public double? SubTotal { get; set; }
        public double? DiscountAmount { get; set; }
        public double? TaxableAmount { get; set; }
        public double? Tax { get; set; }
        public double? TotalAmount { get; set; }
        public double? DiscountPercent { get; set; }
        public double? DiscountPercentAgg { get; set; }
        public int? ProviderId { get; set; }
        public string ProviderName { get; set; }
        //this requisitionid comes from other modules for Requisition. 
        public Int64? RequisitionId { get; set; }
        public DateTime? CounterDay { get; set; }
        public double? TaxPercent { get; set; }
        public double? NonTaxableAmount { get; set; }
        public string PatientType { get; set; }//eg: inpatient/outpatient.
        public int? RequestingDeptId { get; set; }
        public bool? IsTransferredToACC { get; set; }



        //Get History Item from BillingTransactionItems.
        //re-order the sequence of property-assignment in there.
        public static History_BillingTransactionItem GetMappedFromBillingTxnItem(BillingTransactionItemModel ipTxnItem, string historyType)
        {
            History_BillingTransactionItem retModel = new History_BillingTransactionItem()
            {
                BillingTransactionItemId = ipTxnItem.BillingTransactionItemId,
                HistoryType = historyType,
                BillingTransactionId = ipTxnItem.BillingTransactionId,
                PatientId = ipTxnItem.PatientId,
                PatientType = ipTxnItem.BillingType,//change billingtype to patienttype in txnitem as well.
                PatientVisitId = ipTxnItem.PatientVisitId,
                ServiceDepartmentId = ipTxnItem.ServiceDepartmentId,
                ServiceDepartmentName = ipTxnItem.ServiceDepartmentName,
                ItemId = ipTxnItem.ItemId,
                ItemName = ipTxnItem.ItemName,
                CounterId = ipTxnItem.CounterId,
                CounterDay = ipTxnItem.CounterDay,
                CreatedBy = ipTxnItem.CreatedBy,
                CreatedOn = ipTxnItem.CreatedOn,
                DiscountAmount = ipTxnItem.DiscountAmount,
                DiscountPercent = ipTxnItem.DiscountPercent,
                DiscountPercentAgg = ipTxnItem.DiscountPercentAgg,
                Price = ipTxnItem.Price,
                ProviderId = ipTxnItem.ProviderId,
                ProviderName = ipTxnItem.ProviderName,
                SubTotal = ipTxnItem.SubTotal,
                Tax = ipTxnItem.Tax,
                TaxableAmount = ipTxnItem.TaxableAmount,
                NonTaxableAmount = ipTxnItem.NonTaxableAmount,
                IsTransferredToACC = false,
                Quantity = ipTxnItem.Quantity,
                TotalAmount = ipTxnItem.TotalAmount,
                Remarks = ipTxnItem.CancelRemarks,
                RequestingDeptId = ipTxnItem.RequestingDeptId,
                RequisitionId = ipTxnItem.RequisitionId,
                TaxPercent = ipTxnItem.TaxPercent

            };
            return retModel;
        }
    }
}
