using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class WARDInternalConsumptionItemsModel
    {
        [Key]
        public int ConsumptionItemId { get; set; }
        public int ConsumptionId { get; set; }
        public int ItemId { get; set; }
        public int WardId { get; set; }
        public int SubStoreId { get; set; }
        public int DepartmentId { get; set; }
        public string ItemName { get; set; }
        public string BatchNo { get; set; }
        public DateTime ExpiryDate { get; set; }
        public double MRP { get; set; }
        public decimal? Price { get; set; }
        public int Quantity { get; set; }
        public double Subtotal { get; set; }
        public string Remark { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
        [NotMapped]
        public int StockId { get; set; }
    }
}
