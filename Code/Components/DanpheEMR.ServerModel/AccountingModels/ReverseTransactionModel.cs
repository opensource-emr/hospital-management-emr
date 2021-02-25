using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class ReverseTransactionModel
    {

        [Key]
        public int ReverseTransactionId { get; set; }
        public DateTime? TransactionDate { get; set; }
        public int? Section { get; set; }
        public int? TUId { get; set; }
        public int? FiscalYearId { get; set; }
        public string Reason { get; set; }
        public string JsonData { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
        //sud-nagesh: 20June'20-- for Acc-Hospital Separation.
        public int? HospitalId { get; set; }
    }
}
