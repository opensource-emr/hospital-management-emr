using System;

namespace DanpheEMR.ViewModel.Pharmacy
{
    public class RackViewModel
    {
        public int RackId { get; set; }
        public int? ParentId { get; set; }
        public string ParentRackNo { get; set; }
        public string RackNo { get; set; }
        public string Description { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int StoreId { get; set; }
        public string StoreName { get; set; }
    }
}
