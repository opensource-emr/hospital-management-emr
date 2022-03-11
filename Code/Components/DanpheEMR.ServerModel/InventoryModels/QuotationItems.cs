using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
   public class QuotationItems
    {
        [Key]
        public int? QuotationItemId { get; set; }
        public int? QuotationId { get; set; }
        public int VendorId { get; set; }
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public decimal? Price { get; set; }
        public string Description { get; set; }
        public DateTime? UpLoadedOn { get; set; }
        public int? UpLoadedBy { get; set; }
        [NotMapped]
        public bool? IsAdded { get; set; }
        [NotMapped]
        public bool? IsDeleted { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }

    }
}
