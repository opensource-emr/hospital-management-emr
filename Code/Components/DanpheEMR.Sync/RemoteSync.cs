using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Configuration;
using DanpheEMR.ServerModel;
using DanpheEMR.Sync.IRDNepal;
using DanpheEMR.Sync.IRDNepal.Models;

namespace DanpheEMR.Sync
{
    /// <summary>
    /// This class will handle Remote Syncing of all modules. eg: Billing, Pharmacy, etc...!
    /// </summary>
    //public class RemoteSync
    //{
    //    public static string SyncBillingSalesData(BillingTransactionModel bilTxnModel, bool syncToLocal, bool isrealtime = true)
    //    {
    //        try
    //        {
    //            string remoteSyncServers = ConfigurationManager.AppSettings["RemoteSyncServers"];
    //            string irdNplConnString = ConfigurationManager.ConnectionStrings["irdNplConnStr"].ConnectionString;

    //            //For now we're syncing to IRDNepal server only.. later we need to put multiple if conditions.
    //            if (remoteSyncServers == "IRDNepal")
    //            {
    //                IRD_Common_InvoiceModel irdCmonInv = null;
    //                //local sync is required when it is called from our EMRapplication's -> Controllers. 
    //                if (syncToLocal)
    //                {
    //                    IRDNepalDbContext dbContext = new IRDNepalDbContext(irdNplConnString);
    //                    if (bilTxnModel.Patient == null)
    //                    {
    //                        PatientModel currPat = dbContext.Patients.Where(p => p.PatientId == bilTxnModel.PatientId).FirstOrDefault();
    //                        bilTxnModel.Patient = currPat;
    //                    }
    //                    irdCmonInv = SyncLocalData.SyncLocal_Single_BillingSalesData(bilTxnModel, dbContext);
    //                }
    //                else
    //                {
    //                    irdCmonInv = IRD_Common_InvoiceModel.MapFromBillTxnModel(bilTxnModel);
    //                }

    //                return APIs.PostBillInvoiceToIRD(irdCmonInv);

    //            }

    //        }
    //        catch (Exception ex)
    //        {

    //            Console.WriteLine(ex.Message);
    //        }

    //        return null;
    //    }
    //    public static string SyncBillingSalesReturnData(BillInvoiceReturnModel billReturnModel, bool syncToLocal, bool isrealtime = true)
    //    {
    //        string remoteSyncServers = ConfigurationManager.AppSettings["RemoteSyncServers"];
    //        string irdNplConnString = ConfigurationManager.ConnectionStrings["irdNplConnStr"].ConnectionString;

    //        //For now we're syncing to IRDNepal server only.. later we need to put multiple if conditions.
    //        if (remoteSyncServers == "IRDNepal")
    //        {
    //            IRD_Common_InvoiceModel irdCmonInv = null;
    //            if (syncToLocal)
    //            {
    //                IRDNepalDbContext dbContext = new IRDNepalDbContext(irdNplConnString);
    //                if (billReturnModel.Patient == null)
    //                {
    //                    PatientModel currPat = dbContext.Patients.Where(p => p.PatientId == billReturnModel.PatientId).FirstOrDefault();
    //                    billReturnModel.Patient = currPat;
    //                }

    //                irdCmonInv = SyncLocalData.SyncLocal_Single_BillingReturnData(billReturnModel, dbContext, isrealtime);
    //            }
    //            else
    //            {
    //                irdCmonInv = IRD_Common_InvoiceModel.MapFromBillReturnModel(billReturnModel);
    //            }
    //            return APIs.PostReturnBillDataToIRD(irdCmonInv);
    //        }
    //        return null;
    //    }
    //}
}
