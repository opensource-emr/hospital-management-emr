using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.ViewModel.Dispensary
{
    public class GetItemsForRequisitionVm
    {
        public List<GetItemsForRequisitionDto> ItemList { get; set; }
    }

    public class GetItemsForRequisitionDto
    {
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public string ItemCode { get; set; }
        public string GenericName { get; set; }
        public string UOMName { get; set; }
        public double AvailableQuantity { get; set; }
        public bool IsActive { get; internal set; }
    }
}
