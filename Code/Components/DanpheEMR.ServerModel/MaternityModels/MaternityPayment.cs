using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    public class MaternityPayment
    {
        [Key]
        public int PatientPaymentId { get; set; }
        public int FiscalYearId { get; set; }
        public int ReceiptNo { get; set; }
        public string TransactionType { get; set;}
        public int PatientId { get; set; }
        public double InAmount { get; set; }
        public double OutAmount { get; set; }
        public string Remarks { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public bool IsActive { get; set; }
        [NotMapped]
        public string EmployeeName { get; set; }
        [NotMapped]
        public int CounterId { get; set; }

    }
}
