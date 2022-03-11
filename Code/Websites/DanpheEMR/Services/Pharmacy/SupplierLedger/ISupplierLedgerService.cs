using DanpheEMR.Security;
using DanpheEMR.ViewModel.Pharmacy;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services.Pharmacy.SupplierLedger
{
    public interface ISupplierLedgerService
    {
        Task<GetSupplierLedgerGRDetailsVM> GetSupplierLedgerGRDetails(int supplierId);
        Task<GetPHRMSupplierLedgerVM> GetAllAsync();
        int MakeSupplierLedgerPayment(IList<MakeSupplierLedgerPaymentVM> ledgerTxn, RbacUser currentUser);
    }
}
