
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class VendorMasterModel
    {
        [Key]
        public int VendorId { get; set; }
        public string VendorName { get; set; }
        public string VendorCode { get; set; }
        public string ContactPerson { get; set; }
        public string ContactAddress { get; set; }
        public string ContactNo { get; set; }
        public string Email { get; set; }
        public int? CountryId { get; set; }
        public double? Tds { get; set; }
        public double? CreditPeriod { get; set; }
        public string PanNo { get; set; }
        public DateTime? GovtRegDate { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public bool IsActive { get; set; }
        public int? DefaultCurrencyId { get; set; }
        public string DefaultItemJSON { get; set; }
        [NotMapped]
        public List<int> DefaultItem { get; set; }
        public bool IsTDSApplicable { get; set; }
        [NotMapped]
        public int LedgerId { get; set; }
        [NotMapped]
        public string LedgerType { get; set; }
    }
}
