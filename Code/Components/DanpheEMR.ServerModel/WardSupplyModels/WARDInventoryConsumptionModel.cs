using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class WARDInventoryConsumptionModel
    {
        [Key]
        public int ConsumptionId { get; set; }
        public int StoreId { get; set; }
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; }
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public double Quantity { get; set; }
        public string Remark { get; set; }
        public string UsedBy { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? ConsumptionDate { get; set; }
        [NotMapped]
        public int CounterId { get; set; }
        [NotMapped]
        public double ConsumeQuantity { get; set; }
    }
}
