using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class FractionPercentModel
    {
        [Key]
        public int PercentSettingId { get; set; }
        public int BillItemPriceId { get; set; }
        public decimal HospitalPercent { get; set; }
        public decimal DoctorPercent { get; set; }
        public string Description { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        //[NotMapped]
        //public string ItemName { get; set; }
        //[NotMapped]
        //public double? ItemPrice { get; set; }

    }
}
