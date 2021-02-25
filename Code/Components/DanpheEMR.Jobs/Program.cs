using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DanpheEMR;
using DanpheEMR.Sync.IRDNepal;
using DanpheEMR.Sync;
using System.Diagnostics;
/*
 File: DanpheEMR.Jobs.Program.cs
 Created: 10May'18 Sudarshan
 Description: This is for batch processing of IRD-post billing.
              This should be updated later if let's say we need to verify in India or something.
 */

namespace DanpheEMR.Jobs
{
    class Program
    {
        static void Main(string[] args)
        {

            //Console.WriteLine("local sync completed");
            Console.WriteLine("sync to IRD in progress..");

            #region Sync Billing -sales & Sales-return to IRD         
            //PostToIRD remoteSync = new PostToIRD();
            PostToIRD.SyncSalesToRemoteServer();//sync local Sales data to IRD server
            PostToIRD.SyncSalesReturnToRemoteServer();//sync local Sales return data to IRD server
            #endregion

            #region Sync PHRM -sales invoice & invoice-return to IRD         
            PostToIRD.SynchPhrmInvoiceToRemoteServer();
            PostToIRD.SyncPhrmInvoiceReturnToRemoteServer();
            #endregion
            Console.WriteLine("sync to IRD completed");
            Console.WriteLine("sync completed");
        }
    }
}
