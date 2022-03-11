using DanpheEMR.DalLayer;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.ViewModel.Pharmacy
{
    public class GetItemsForPOViewModel
    {
        public List<GetItemForPODto> ItemList { get; set; }
    }

    public class GetItemForPODto
    {
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public string ItemCode { get; set; }
        public string UOMName { get; set; }
        public decimal LastGRItemPrice { get; set; }
        public bool IsVATApplicable { get; set; }
        public double? VATPercentage { get; set; }
    }
}
