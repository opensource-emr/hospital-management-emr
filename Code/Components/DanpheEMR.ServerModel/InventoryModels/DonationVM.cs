using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.InventoryModels
{
    public class DonationVM
    {
        public int DonationId { get; set; }
        public int DonationNo { get; set; }
        public int VendorId { get; set; }
        public string VendorName { get; set; }
        public int StoreId { get; set; }
        public string StoreName { get; set; }
        public string DonationReferenceNo { get; set; }
        public DateTime DonationReferenceDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Remarks { get; set; }
        public DateTime DonatedDate { get; set; }
        public string Username { get; set; }

        [NotMapped]
        public List<DonationItemsVM> DonationItems { get; set; }

    }
}
