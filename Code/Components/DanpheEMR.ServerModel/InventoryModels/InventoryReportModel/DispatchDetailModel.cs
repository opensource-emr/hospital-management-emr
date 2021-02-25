using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace DanpheEMR.ServerModel.ReportingModels
{
    public class DispatchDetailModel
    {
        public string CreatedByName { get; set; }
        public string RequestedByName { get; set; }
        public string Code { get; set; }
        public string ReceivedBy { get; set; }
        public string Remarks { get; set; }
        public string DepartmentName { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime RequisitionDate { get; set; }
        public string ItemName { get; set; }
        public int ITemId { get; set; }
        public int RequisitionId { get; set; }
        public int DispatchId { get; set; }
        public string BatchNO { get; set; }
        public Nullable<double> StandardRate { get; set; }
        public Nullable<double> DispatchedQuantity { get; set; }
        public Nullable<double> ReceivedQuantity { get; set; }
        public Nullable<double> PendingQuantity { get; set; }
        public Nullable<int> Quantity { get; set; }
        public Nullable<int> RequisitionNo { get; set; }
        public Nullable<int> IssueNo { get; set; }
        public Nullable<int> RequisitionItemId { get; set; }
        public string RequisitionItemStatus { get; set; }

    }
}
