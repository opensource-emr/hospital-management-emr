using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class MaternityPaymentReceipt
    {
        public string TransactionType { get; set; }
        public double InAmount { get; set; }
        public double OutAmount { get; set; }
        public string EmployeeName { get; set; }
        public string ReceiptNo { get; set; }
        public string HospitalNo { get; set; }
        public string Age { get; set; }
        public string Gender { get; set; }
        public string PatientName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public DateTime CreatedOn { get; set; }
    }
}
