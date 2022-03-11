using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.ViewModel.Pharmacy
{
    public class GetPHRMSupplierLedgerVM
    {
        public IList<GetPHRMSupplierLedgerDTO> SupplierLedgers { get; set; }
    }

    public class GetPHRMSupplierLedgerDTO
    {
        public int SupplierId { get; set; }
        public string SupplierName { get; set; }
        public decimal? TotalAmount { get; set; }
        public decimal? PaidAmount { get; set; }
        public decimal? DueAmount { get; set; }
        public bool IsActive { get; set; }
    }
}
