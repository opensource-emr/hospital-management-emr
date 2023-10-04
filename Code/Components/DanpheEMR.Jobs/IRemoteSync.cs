using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.Jobs
{
    interface IRemoteSync
    {                
        void SyncSalesToRemoteServer();
        void SyncSalesReturnToRemoteServer();
    }
}
