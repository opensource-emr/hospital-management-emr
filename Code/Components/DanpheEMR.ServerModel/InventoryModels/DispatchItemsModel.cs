using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class DispatchItemsModel
    {
        [Key]
        public int DispatchItemsId { get; set; }
        public int? DepartmentId { get; set; }
        public int RequisitionId { get; set; } //added later for easier use, hospitals like MIKC may face issue if we use this one.
        public int RequisitionItemId { get; set; }
        public double DispatchedQuantity { get; set; }
        public DateTime? DispatchedDate { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public string ReceivedBy { get; set; }
        public string Remarks { get; set; }
        public string ItemRemarks { get; set; }
        public int ItemId { get; set; }
        public string BatchNo { get; set; }
        public int DispatchId { get; set; }
        public DateTime? MatIssueDate { get; set; }
        public string MatIssueTo { get; set; }
        public int SourceStoreId { get; set; }
        public int TargetStoreId { get; set; }
        public int? ReceivedById { get; set; }
        public DateTime? ReceivedOn { get; set; }
        public string ReceivedRemarks { get; set; }
        [NotMapped]
        public int? IssueNo { get; set; }

        /// <summary>
        /// Maintains sequence for DispatchId
        /// </summary>
        public int? ReqDisGroupId { get; set; }
        public int FiscalYearId { get; set; }

        public int? DispatchNo { get; set; }
    }
}
