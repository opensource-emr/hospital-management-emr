using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class WARDRequisitionModel
    {
        [Key]
        public int RequisitionId { get; set; }
        public int WardId { get; set; }
        public int StoreId { get; set; }
        public string Status { get; set; }
        public string ReferenceId { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public virtual List<WARDRequisitionItemsModel> WardRequisitionItemsList { get; set; }
    }
}
