
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class VoucherModel
    {
        [Key]
        public int VoucherId { get; set; }
        public string VoucherName { get; set; }
        public string Description { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public bool IsActive { get; set; }
        public string VoucherCode { get; set; }
        public bool ISCopyDescription { get; set; }
        public bool ShowPayeeName { get; set; }
        public bool ShowChequeNumber { get; set; }



    }
}
