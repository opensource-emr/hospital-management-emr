using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.InventoryModels
{
    public class DonationItemsVM
    {
        public int ItemId { get; set; }
        public int DonationItemId { get; set; }
        public string ItemName { get; set; }
        public string CategoryName { get; set; }
        public string Code { get; set; }
        public string BatchNo { get; set; }
        public string Specification { get; set; }
        public string Unit { get; set; }
        public string ModelNo { get; set; }
        public decimal CostPrice { get; set; }
        public double DonationQuantity { get; set; }
        public decimal TotalAmount { get; set; }
        public string Remarks { get; set; }
        public DateTime DonatedDate { get; set; }
        public int StockId { get; set; }
        public DateTime? GRDate { get; set; }
    }

    public class DonationDetailsVM
    {
        public DonationVM donationDetails;
        public List<DonationItemsVM> donationItemDetails { get; set; }
    }
}
