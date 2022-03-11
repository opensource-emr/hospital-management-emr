using System.Linq;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using DanpheEMR.Sync.IRDNepal.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using DanpheEMR.Enums;
using System.Data.SqlClient;
using System.Data;

namespace DanpheEMR.Controllers
{
    public class VisitBL
    {
        /// <summary>
        /// To get the latest patient visit of current patient.
        /// </summary>
        /// <param name="visitDbContext"></param>
        /// <param name="patientId"></param>
        /// <returns></returns>
        public static VisitModel GetPatientLatestVisit(VisitDbContext visitDbContext, int patientId)
        {
            VisitModel retVisit = new VisitModel();
            if (visitDbContext != null)
            {
                //if we do orderbydescending, the latest visit would come at the top. 
                var patAllVisits = (from v in visitDbContext.Visits
                                    where v.PatientId == patientId
                                    select v
                                   ).OrderByDescending(v => v.PatientVisitId).ToList();
                //take first element of the Ordered-List.
                if (patAllVisits != null && patAllVisits.Count > 0)
                {
                    retVisit = patAllVisits.ElementAt(0);
                }
            }

            return retVisit;
        }

        //had to pass patient db context, since it is called inside db-transaction of PatientDbContext
        public static void SyncBillToRemoteServer(object billToPost, string billType, VisitDbContext dbContext)
        {
            if (billType == "sales")
            {

                string responseMsg = null;
                BillingTransactionModel billTxn = (BillingTransactionModel)billToPost;
                try
                {
                    IRD_BillViewModel bill = IRD_BillViewModel.GetMappedSalesBillForIRD(billTxn, true);
                    responseMsg = DanpheEMR.Sync.IRDNepal.APIs.PostSalesBillToIRD(bill);
                }
                catch (Exception ex)
                {
                    responseMsg = "0";
                }

                dbContext.BillingTransactions.Attach(billTxn);
                if (responseMsg == "200")
                {
                    billTxn.IsRealtime = true;
                    billTxn.IsRemoteSynced = true;
                }
                else
                {
                    billTxn.IsRealtime = false;
                    billTxn.IsRemoteSynced = false;
                }

                dbContext.Entry(billTxn).Property(x => x.IsRealtime).IsModified = true;
                dbContext.Entry(billTxn).Property(x => x.IsRemoteSynced).IsModified = true;
                dbContext.SaveChanges();

            }
            else if (billType == "sales-return")
            {
                BillInvoiceReturnModel billRet = (BillInvoiceReturnModel)billToPost;

                string responseMsg = null;
                try
                {
                    IRD_BillReturnViewModel salesRetBill = IRD_BillReturnViewModel.GetMappedSalesReturnBillForIRD(billRet, true);
                    responseMsg = DanpheEMR.Sync.IRDNepal.APIs.PostSalesReturnBillToIRD(salesRetBill);
                }
                catch (Exception ex)
                {
                    responseMsg = "0";
                }

                dbContext.BillReturns.Attach(billRet);
                if (responseMsg == "200")
                {
                    billRet.IsRealtime = true;
                    billRet.IsRemoteSynced = true;
                }
                else
                {
                    billRet.IsRealtime = false;
                    billRet.IsRemoteSynced = false;
                }

                dbContext.Entry(billRet).Property(x => x.IsRealtime).IsModified = true;
                dbContext.Entry(billRet).Property(x => x.IsRemoteSynced).IsModified = true;
                dbContext.SaveChanges();


            }
        }
        public static void UpdateRequisitionItemsBillStatus(VisitDbContext visitDbContext,
          string serviceDepartmentName,
          string billStatus, //provisional,paid,unpaid,returned
          int? userId,
          long? requisitionId,
          DateTime? modifiedDate)
        {

            string integrationName = visitDbContext.ServiceDepartments
             .Where(a => a.ServiceDepartmentName == serviceDepartmentName)
             .Select(a => a.IntegrationName).FirstOrDefault();

            if (integrationName != null)
            {
                //update status in lab 
                if (integrationName.ToLower() == "lab")
                {
                    var labItem = visitDbContext.LabRequisitions.Where(req => req.RequisitionId == requisitionId).FirstOrDefault();
                    if (labItem != null)
                    {
                        labItem.BillingStatus = billStatus;
                        labItem.ModifiedOn = modifiedDate;
                        labItem.ModifiedBy = userId;
                        visitDbContext.Entry(labItem).Property(a => a.BillingStatus).IsModified = true;
                        visitDbContext.Entry(labItem).Property(a => a.ModifiedOn).IsModified = true;
                        visitDbContext.Entry(labItem).Property(a => a.ModifiedBy).IsModified = true;
                    }

                }
                //update status for Radiology
                else if (integrationName.ToLower() == "radiology")
                {
                    var radioItem = visitDbContext.RadiologyImagingRequisitions.Where(req => req.ImagingRequisitionId == requisitionId).FirstOrDefault();
                    if (radioItem != null)
                    {
                        radioItem.BillingStatus = billStatus;
                        radioItem.ModifiedOn = modifiedDate;
                        radioItem.ModifiedBy = userId;
                        visitDbContext.Entry(radioItem).Property(a => a.BillingStatus).IsModified = true;
                        visitDbContext.Entry(radioItem).Property(a => a.ModifiedOn).IsModified = true;
                        visitDbContext.Entry(radioItem).Property(a => a.ModifiedBy).IsModified = true;
                    }

                }
            }
        }

        public static Boolean ReAssignProviderTxn(VisitDbContext visitDb, VisitModel visit, BillingDbContext billingDb)
        {
            using (var dbContextTxn = visitDb.Database.BeginTransaction())
            {
                try
                {
                    //updating visit-table
                    visitDb.Visits.Attach(visit);
                    visitDb.Entry(visit).Property(x => x.ProviderId).IsModified = true;
                    visitDb.Entry(visit).Property(x => x.ProviderName).IsModified = true;
                    visitDb.Entry(visit).Property(x => x.ModifiedBy).IsModified = true;
                    visitDb.Entry(visit).Property(x => x.ModifiedOn).IsModified = true;
                    visitDb.Entry(visit).Property(x => x.Remarks).IsModified = true;
                    visitDb.SaveChanges();

                    //updating billingTxnItem table

                    //getting ServiceDepartmentId of OPD
                    int servDeptId = (from d in billingDb.ServiceDepartment
                                      where d.ServiceDepartmentName == "OPD"
                                      select d.ServiceDepartmentId).FirstOrDefault();
                    //for updating get data from table using PatientVisitId as RequisitionId
                    BillingTransactionItemModel billitm = (from b in billingDb.BillingTransactionItems
                                                           where b.RequisitionId == visit.PatientVisitId && b.ServiceDepartmentId == servDeptId
                                                           select b).FirstOrDefault();
                    //assiging updated values
                    billitm.ProviderId = visit.ProviderId;
                    billitm.ProviderName = visit.ProviderName;

                    billingDb.BillingTransactionItems.Attach(billitm);
                    billingDb.Entry(billitm).Property(x => x.ProviderId).IsModified = true;
                    billingDb.Entry(billitm).Property(x => x.ProviderName).IsModified = true;
                    billingDb.SaveChanges();


                    //Commit Transaction
                    dbContextTxn.Commit();
                    return true;

                }
                catch (Exception ex)
                {
                    //Rollback all transaction if exception occured
                    dbContextTxn.Rollback();
                    throw ex;
                }
            }
        }

        public static bool HasDuplicateVisitWithSameProvider(VisitDbContext visitDb, int patientId, int? providerId, DateTime visitDate)
        {
            //sud:19Jun'19--For DepartmentLevel appointment, ProviderId will be Zero or Null. so return false in that case.//Needs revision.
            if (providerId == null || providerId == 0)
            {
                return false;
            }

            List<VisitModel> patientvisitList = (from visit in visitDb.Visits
                                                 where visit.PatientId == patientId
                                                 && DbFunctions.TruncateTime(visit.VisitDate) == DbFunctions.TruncateTime(visitDate)
                                                 && visit.ProviderId == providerId && visit.IsActive == true
                                                 && visit.BillingStatus != ENUM_BillingStatus.returned // "returned"
                                                 select visit).ToList();
            if (patientvisitList.Count != 0)
                return true;
            else
                return false;
        }


        //Ashim: 22June2017
        //recursive function which checks if the top most visit is valid for followup i.e top most visit should be of max 15 days ahead.
        //if the topmost visit is not valid for followup then removes all the branches.
        //GOTO  expression is used here, please remove it soon.. 
        //renamed to _old by sud:30Sept'19-- new function implemented, check below.
        public static List<ListVisitsVM> GetValidForFollowUp_Old(List<ListVisitsVM> visitList, DateTime visitDateLimit)
        {
            var count = 0;
            var length = visitList.Count();
            visitDateLimit = visitDateLimit.Date;

            for (count = 0; count < length; count++)
            {

                if (visitList[count].AppointmentType == "followup")
                {
                    int? parentVisitId = visitList[count].ParentVisitId;
                SearchParent:
                    if (parentVisitId != null)
                    {
                        ListVisitsVM parentVisit = (from vis in visitList
                                                    where (vis.PatientVisitId == parentVisitId && vis.VisitDate > visitDateLimit)
                                                    select vis).FirstOrDefault();
                        if (parentVisit != null)
                        {
                            parentVisitId = parentVisit.ParentVisitId;
                            goto SearchParent;
                        }
                        else
                        {
                            visitList.RemoveAt(count);
                            length--;
                            count--;
                        }
                    }
                }
            }
            return visitList;
        }



        public static List<ListVisitsVM> GetValidForFollowUp(List<ListVisitsVM> visitList, DateTime visitDateLimit)
        {
            visitDateLimit = visitDateLimit.Date;

            visitList.ForEach(v =>
            {
                if (v.VisitDate < visitDateLimit)
                {
                    v.IsValidForFollowup = false;
                }
                else
                {
                    v.IsValidForFollowup = true;
                }
            });

            List<ListVisitsVM> freeFwupsList = visitList.Where(v => v.BillStatus == "free").ToList();

            if (freeFwupsList.Count > 0)
            {
                freeFwupsList.ForEach(v =>
                {
                    ListVisitsVM parVisitOfFwUp = null;
                    AssignRootParentVisit_Recursive(v, visitList, out parVisitOfFwUp);
                    v.TopParentVisit = parVisitOfFwUp;

                    if (v.TopParentVisit != null && v.TopParentVisit.VisitDate.Date < visitDateLimit)
                    {
                        v.IsValidForFollowup = false;
                    }
                    else
                    {
                        v.IsValidForFollowup = true;
                    }

                });
            }

            return visitList.Where(v => v.IsValidForFollowup).ToList();

        }


        public static void AssignRootParentVisit_Recursive(ListVisitsVM currVisit, List<ListVisitsVM> allVisitsList, out ListVisitsVM parVisitOfFwup)
        {
            parVisitOfFwup = currVisit;

            int? parentVisitId = currVisit.ParentVisitId;
            ListVisitsVM parentVisitObj = null;
            if (parentVisitId != null)
            {
                parentVisitObj = allVisitsList.Find(a => a.PatientVisitId == parentVisitId);
                if (parentVisitObj != null)
                {
                    AssignRootParentVisit_Recursive(parentVisitObj, allVisitsList, out parVisitOfFwup);
                }
            }
        }



        //get provider name from providerId
        public static string GetProviderName(int? providerId, string connString)
        {
            string providerName = null;

            if (providerId != null)
            {
                MasterDbContext dbContextProvider = new MasterDbContext(connString);
                EmployeeModel Provider = (from emp in dbContextProvider.Employees
                                          where emp.EmployeeId == providerId
                                          select emp).FirstOrDefault();
                if (Provider != null)
                {
                    //obj.ProviderName = Provider.Salutation + "." + Provider.FirstName + "." + Provider.LastName + "(" + Provider.Designation + ")";
                    providerName = Provider.FullName;
                }

            }
            return providerName;

        }
        //20Aug2018 : Ashim: This logic is not used anywhere. It has been replaced by
        //generate visit code for post visit
        public static string UpdateVisitCode(int patientVisitId, VisitDbContext visitDbContext)
        {
            try
            {
                string visitCode = null;
                if (patientVisitId != 0)
                {
                    VisitModel visit = visitDbContext.Visits
                                        .Where(a => a.PatientVisitId == patientVisitId)
                                        .FirstOrDefault<VisitModel>();
                    //if (visit.VisitType == "outpatient")
                    if (visit.VisitType == ENUM_VisitType.outpatient)
                        visit.VisitCode = "V" + (visit.PatientVisitId + 100000);
                    else
                        visit.VisitCode = "H" + (visit.PatientVisitId + 100000);

                    visitDbContext.Entry(visit).State = EntityState.Modified;
                    visitDbContext.SaveChanges();
                    visitCode = visit.VisitCode;
                }
                return visitCode;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        //updated visit logic.
        //created by: nagesh
        public static string CreateNewPatientVisitCode(string visitType, string connString)
        {
            try
            {
                VisitDbContext visitDbContext = new VisitDbContext(connString);
                var visitCode = "";
                if (visitType != null)
                {
                    //VisitDbContext visitDbContext = new VisitDbContext(connString);
                    var year = DateTime.Now.Year;
                    var patVisitId = visitDbContext.Visits.Where(s => s.VisitType == visitType && s.VisitDate.Year == year && s.VisitCode != null).DefaultIfEmpty()
                        .Max(t => t.PatientVisitId == null ? 0 : t.PatientVisitId);
                    string codeChar;
                    switch (visitType)
                    {
                        case "inpatient":
                            codeChar = "H";
                            break;
                        case "emergency":
                            codeChar = "ER";
                            break;
                        default:
                            codeChar = "V";
                            break;
                    }
                    if (patVisitId > 0)
                    {
                        var vCodMax = (from v in visitDbContext.Visits
                                       where v.PatientVisitId == patVisitId
                                       select v.VisitCode).FirstOrDefault();
                        int newCodeDigit = Convert.ToInt32(vCodMax.Substring(codeChar.Length + 2)) + 1;
                        visitCode = (string)codeChar + DateTime.Now.ToString("yy") + String.Format("{0:D5}", newCodeDigit);
                    }
                    else
                    {
                        visitCode = (string)codeChar + DateTime.Now.ToString("yy") + String.Format("{0:D5}", 1);
                    }
                }
                return visitCode;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        public static VisitModel GetVisitItemsMapped(int patientId, string visitType, int? providerId, DateTime visitDate, int userID, string connString)
        {
            var visit = new VisitModel();
            visit.PatientId = patientId;
            visit.VisitType = visitType;
            visit.ProviderId = providerId;
            visit.BillingStatus = ENUM_BillingStatus.unpaid;// "unpaid";
            visit.VisitStatus = ENUM_VisitStatus.initiated;// "initiated";
            visit.CreatedOn = visitDate;
            visit.AppointmentType = ENUM_AppointmentType.New;// "New";
            visit.CreatedBy = userID;
            visit.VisitDate = visitDate;
            visit.VisitTime = visitDate.TimeOfDay;
            visit.ProviderName = VisitBL.GetProviderName(visit.ProviderId, connString);
            visit.VisitCode = VisitBL.CreateNewPatientVisitCode(visit.VisitType, connString);
            visit.IsVisitContinued = false;
            visit.IsSignedVisitSummary = false;
            visit.IsActive = true;
            return visit;
        }

        public static int CreateNewPatientQueueNo(VisitDbContext visitDbContext, int visitId, string con)
        {
            int QueueNo;
            SqlConnection newCon = new SqlConnection(con);
            newCon.Open();
            DataSet ds = new DataSet();
            SqlCommand cmd = new SqlCommand();
            cmd.Connection = newCon;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "SP_VISIT_SetNGetQueueNo";
            cmd.Parameters.Add(new SqlParameter("@VisitId", visitId));
            SqlDataAdapter adapter = new SqlDataAdapter(cmd);
            adapter.Fill(ds);
            newCon.Close();
            QueueNo = Convert.ToInt32(ds.Tables[0].Rows[0][0].ToString());
            //DataTable dt = DALFunctions.GetDataTableFromStoredProc("SP_VISIT_SetNGetQueueNo", new List<SqlParameter>()
            //{  new SqlParameter("@VisitId", visitId)}, visitDbContext);

            //var abc = int.Parse(dt.Rows[0][0].ToString());

            return QueueNo;
        }

    }

}
