using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.FractionModels
{
    public class FractionPercentVM
    {
        public int? PercentSettingId { get; set; }
        public int? BillItemPriceId { get; set; }
        public decimal? HospitalPercent { get; set; }
        public decimal? DoctorPercent { get; set; }
        public string Description { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
        public string ItemName { get; set; }
        public double? ItemPrice { get; set; }
    }
}
