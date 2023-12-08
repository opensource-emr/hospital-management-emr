using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.InventoryModels.InventoryReportModel
{
    public class IssuedItemViewModel
    {
        public int DispatchNo { get; set; }
        public string SubStoreName { get; set; }
        public string ItemName { get; set; }
        public string Unit { get; set; }
        public double Quantity { get; set; }
        public DateTime IssuedDate { get; set; }
        public string EmployeeName { get; set; }
        public string SubCategoryName { get; set; }

    }
}
