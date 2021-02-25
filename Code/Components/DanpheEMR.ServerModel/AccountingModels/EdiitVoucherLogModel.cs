
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class EditVoucherLogModel
    {
        [Key]
        public int LogId { get; set; }
        public DateTime?  TransactionDate { get; set; }
        public int? SectionId { get; set; }
        public string VoucherNumber { get; set; }
        public string Reason { get; set; }
        public string OldVocherJsonData { get; set; }
        public int? FiscalYearId { get; set; }
        public int? HospitalId { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
       

    }
    
}
