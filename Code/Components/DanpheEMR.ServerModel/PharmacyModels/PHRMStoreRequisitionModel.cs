using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class PHRMStoreRequisitionModel
    {
        [Key]
        public int RequisitionId { get; set; }
        public int FiscalYearId { get; set; }
        public int RequisitionNo { get; set; }
        public int StoreId { get; set; }
        public DateTime? RequisitionDate { get; set; }
        public string RequisitionStatus { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }

        public int? ApprovedBy { get; set; }
        public DateTime? ApprovedOn { get; set; }
        public virtual List<PHRMStoreRequisitionItemsModel> RequisitionItems { get; set; }
    }
}
