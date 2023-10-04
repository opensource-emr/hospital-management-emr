using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.InventoryModels
{
    public class DonationModel
    {
        [Key]
        public int DonationId { get; set; }
        public int DonationNo { get; set; }
        public int VendorId { get; set; }
        [NotMapped]
        public string VendorName { get; set; }
        public int StoreId { get; set; }
        public int FiscalYearId { get; set; }
        public string DonationReferenceNo { get; set; }
        public DateTime DonationReferenceDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Remarks { get; set; }
        public DateTime CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public bool IsActive { get; set; }
        public virtual List<DonationItemModel> DonationItems { get; set; } = new List<DonationItemModel>();
    }
}


