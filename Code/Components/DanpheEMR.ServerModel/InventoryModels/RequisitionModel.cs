using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
     public class RequisitionModel
    {
        [Key]
        public int RequisitionId { get; set; }
        public int DepartmentId { get; set; }
        public DateTime? RequisitionDate { get; set; }
        public int? CreatedBy { get; set; }
        public string  RequisitionStatus { get; set; }
        public DateTime? CreatedOn { get; set; }
        
        public virtual List<RequisitionItemsModel> RequisitionItems { get; set; }
    }
}
