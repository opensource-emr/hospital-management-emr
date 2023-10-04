using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class BillItemPriceHistory
    {
        [Key]
        public int BillItemPriceHistoryId { get; set; }
        public int? BillItemPriceId { get; set; }
        public int? ServiceDepartmentId { get; set; }
        public int? ItemId { get; set; }
        public double? Price { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
