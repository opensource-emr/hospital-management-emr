using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    public class BillingPackageModel
    {
        [Key]
        public int BillingPackageId { get; set; }
        public string BillingPackageName { get; set; }
        public string Description { get; set; }
        public double TotalPrice { get; set; }
        public double DiscountPercent { get; set; }
        public string BillingItemsXML { get; set; }
        public string PackageCode { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }
        public bool InsuranceApplicable { get; set; }
    }
}
