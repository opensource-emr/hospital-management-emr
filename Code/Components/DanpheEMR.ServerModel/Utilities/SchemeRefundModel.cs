using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Input;

namespace DanpheEMR.ServerModel.Utilities
{
    public class SchemeRefundModel
    {
        [Key]
        public int SchemeRefundId { get; set; }
        public int FiscalYearId { get; set; }
        public int ReceiptNo { get; set; }
        public int SchemeId { get; set; }
        public int PatientId { get; set; }
        public string InpatientNumber { get; set; }
        public decimal RefundAmount { get; set; }
        public string Remarks { get; set; }
        public int CreatedBy { get; set; }
        public int CounterId { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public Boolean IsActive { get; set; }
        public bool IsTransferredToAcc { get; set; }

    }
}
