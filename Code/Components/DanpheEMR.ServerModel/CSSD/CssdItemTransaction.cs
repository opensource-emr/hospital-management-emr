using System;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel
{
    public class CssdItemTransactionModel
    {
        [Key]
        public int CssdTxnId { get; set; }
        public int FixedAssetStockId { get; set; }
        public int ItemId { get; set; }
        public int StoreId { get; set; }
        public int RequestedBy { get; set; }
        public DateTime RequestedOn { get; set; }
        public string RequestRemarks { get; set; }
        public string DisinfectantName { get; set; }
        public int? DisinfectedBy { get; set; }
        public DateTime? DisinfectedOn { get; set; }
        public string DisinfectionRemarks { get; set; }
        public int? DispatchedBy { get; set; }
        public DateTime? DispatchedOn { get; set; }
        public string DispatchRemarks { get; set; }
        public string CssdStatus { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
    }
}
