using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class PriceCategoryModel
    {
        [Key]
        public int PriceCategoryId { get; set; }
        public string PriceCategoryName { get; set; }
        public string DisplayName { get; set; }
        public string BillingColumnName { get; set; }
        public bool? IsDefault { get; set; }

        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }

        public bool? IsActive { get; set; }

    }
}
 