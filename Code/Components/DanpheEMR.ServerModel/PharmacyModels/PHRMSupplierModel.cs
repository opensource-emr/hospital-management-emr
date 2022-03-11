using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class PHRMSupplierModel
    {
        [Key]
        public int SupplierId { get; set; }
        public string SupplierName { get; set; }
        public string ContactNo { get; set; }
        public string Description { get; set; }
        public string City { get; set; }
        public string  PANNumber  { get; set; }
        public string  DDA  { get; set; }
        public string ContactAddress { get; set; }
        public string AdditionalContactInformation { get; set; }
        public string Email { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public bool IsActive { get; set; }
        public int? CreditPeriod { get; set; }
        public bool IsLedgerRequired { get; set; }

        [NotMapped]
        public int LedgerId { get; set; }
        [NotMapped]
        public string LedgerType { get; set; }

    }
}
