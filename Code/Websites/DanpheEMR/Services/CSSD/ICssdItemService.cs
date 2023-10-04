using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DanpheEMR.Services
{
    public interface ICssdItemService
    {
        Task<CssdItemTransactionModel> AddCssdItemTransaction(CssdItemTransactionModel cssdItemTransaction);
        Task<IList<PendingItemsDto>> GetAllPendingCSSDTransactions(DateTime FromDate, DateTime ToDate);
        Task<IList<FinalizedItemDto>> GetAllFinalizedCSSDTransactions(DateTime FromDate, DateTime ToDate);
        Task<int> DisinfectCSSDItem(int CssdTxnId, string DisinfectantName, string DisinfectionRemarks, RbacUser currentUser);
        Task<int> DispatchCSSDItem(int CssdTxnId, string DispatchRemarks, RbacUser currentUser);
    }
}
