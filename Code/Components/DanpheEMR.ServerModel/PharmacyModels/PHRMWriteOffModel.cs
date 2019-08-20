using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
   public class PHRMWriteOffModel
    {
        [Key]
        public int WriteOffId { get; set; }
        public DateTime WriteOffDate { get; set; }
        public decimal SubTotal { get; set; }
        public decimal VATAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public string WriteOffRemark { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public bool? IsTransferredToACC { get; set; }
        public virtual List<PHRMWriteOffItemsModel> phrmWriteOffItem { get; set; }
    }
}
