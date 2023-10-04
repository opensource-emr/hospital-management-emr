using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel.IncentiveModels
{
    public class PaymentInfoModel
    {
        [Key]
        public int PaymentInfoId { get; set; }
        public DateTime PaymentDate { get; set; }
        public int ReceiverId { get; set; }
        public float TotalAmount { get; set; }
        public float TDSAmount { get; set; }
        public float NetPayAmount { get; set; }
        public bool IsPostedToAccounting { get; set; }
        public DateTime? AccountingPostedDate { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public bool IsActive { get; set; }
        public float AdjustedAmount { get; set; }
        public string VoucherNumber { get; set; }
        public string Remarks { get; set; }

        [NotMapped]
        public DateTime FromDate { get; set; }
        [NotMapped]
        public DateTime ToDate { get; set; }
        [NotMapped]
        public int EmployeeId { get; set; }
    }
}
