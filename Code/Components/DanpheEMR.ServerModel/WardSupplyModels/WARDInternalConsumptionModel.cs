using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class WARDInternalConsumptionModel
    {
        [Key]
        public int ConsumptionId { get; set; }
        public int WardId { get; set; }
        public int SubStoreId { get; set; }
        public int DepartmentId { get; set; }
        public double TotalAmount { get; set; }
        public string Remark { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int?  ModifiedBy { get; set; }
        public string ConsumedBy { get; set; }

        [NotMapped]
        public List<WARDInternalConsumptionItemsModel> WardInternalConsumptionItemsList { get; set; }

    }
}
