
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.MedicareModels;
using DanpheEMR.Sync.IRDNepal.Models;
//using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;
using DanpheEMR.Core;
using DanpheEMR.ServerModel.PatientModels;
using System.Threading.Tasks;
using DanpheEMR.ServerModel.SSFModels;
using DanpheEMR.ServerModel.SSFModels.ClaimResponse;
using Newtonsoft.Json;
using System.Net.Http;
using System.Text;
using DanpheEMR.Utilities;
using Newtonsoft.Json.Linq;
using DanpheEMR.ServerModel.BillingModels;
using DanpheEMR.Services.Visits.DTO;
using DanpheEMR.Controllers.Billing;
using DanpheEMR.Services.SSF.DTO;
using DanpheEMR.Security;

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
                    visitDb.Entry(visit).Property(x => x.PerformerId).IsModified = true;
                    visitDb.Entry(visit).Property(x => x.PerformerName).IsModified = true;
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
                    billitm.PerformerId = visit.PerformerId;
                    billitm.PerformerName = visit.PerformerName;

                    billingDb.BillingTransactionItems.Attach(billitm);
                    billingDb.Entry(billitm).Property(x => x.PerformerId).IsModified = true;
                    billingDb.Entry(billitm).Property(x => x.PerformerName).IsModified = true;
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
                                                 && visit.PerformerId == providerId && visit.IsActive == true
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


        public static VisitModel GetVisitItemsMapped(int patientId, string visitType, int? providerId, DateTime visitDate, int priceCategoryId, int? membershipTypeId, int userID, string connString)
        {
            var visit = new VisitModel();
            visit.PatientId = patientId;
            visit.VisitType = visitType;
            visit.PerformerId = providerId;
            visit.BillingStatus = ENUM_BillingStatus.unpaid;// "unpaid";
            visit.VisitStatus = ENUM_VisitStatus.initiated;// "initiated";
            visit.CreatedOn = visitDate;
            visit.AppointmentType = ENUM_AppointmentType.New;// "New";
            visit.CreatedBy = userID;
            visit.VisitDate = visitDate;
            visit.VisitTime = visitDate.TimeOfDay;
            visit.PerformerName = VisitBL.GetProviderName(visit.PerformerId, connString);
            //visit.VisitCode = VisitBL.CreateNewPatientVisitCode(visit.VisitType, connString);
            visit.IsVisitContinued = false;
            visit.IsSignedVisitSummary = false;
            visit.IsActive = true;
            //visit.PriceCategoryId = GetPriceCategoryId(patientId,connString);
            visit.PriceCategoryId = priceCategoryId;
            visit.SchemeId = (int)membershipTypeId;
            return visit;
        }

        private static int? GetPriceCategoryId(int patientId, string connString)
        {
            VisitDbContext visitDbContext = new VisitDbContext(connString);
            var patientVisits = visitDbContext.Visits.Where(a => a.PatientId == patientId && a.IsActive == true).OrderByDescending(o => o.PatientVisitId).FirstOrDefault();
            return patientVisits.PriceCategoryId;
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

        public static Boolean IsValidForFollowUp(VisitDbContext visitDbContext, int visitId, string connString)
        {
            Boolean isValid = false;
            CoreDbContext coreDbContext = new CoreDbContext(connString);
            int maxDays = 0;
            var maxDaysParameterValue = coreDbContext.Parameters.Where(a => a.ParameterGroupName == "Appointment" && a.ParameterName == "MaximumLastVisitDays").FirstOrDefault();
            if (maxDaysParameterValue != null)
            {
                var value = maxDaysParameterValue.ParameterValue;
                maxDays = int.Parse(value);
            }
            int id = GetParentVisit(visitDbContext, visitId);

            if (id > 0)
            {
                var visit = visitDbContext.Visits.Where(a => a.PatientVisitId == id).FirstOrDefault();
                if (visit != null && DateTime.Now.Subtract(visit.VisitDate).Days > maxDays)
                {
                    isValid = false;
                }
                else
                {
                    isValid = true;
                }
            }

            return isValid;
        }
        //This function will be recursively invoked by itself until it does not find ParentVisitId...//Krishna,10thJun'22
        private static int GetParentVisit(VisitDbContext visitDbContext, int visitId)
        {
            int patientVisitId = visitId;
            var visit = visitDbContext.Visits.Where(a => a.PatientVisitId == patientVisitId).FirstOrDefault();
            if (visit != null && visit.ParentVisitId != null)
            {
                return GetParentVisit(visitDbContext, (int)visit.ParentVisitId);
            }
            return patientVisitId;
        }

        public static void SavePatientScheme(VisitDbContext visitDbContext, QuickVisitVM quickVisitVM, RbacUser currentUser, bool realTimeSSFClaimBooking, SSFDbContext _ssfDbContext)
        {
            var systemDefaultScheme = visitDbContext.BillingSchemes.FirstOrDefault(a => a.IsSystemDefault == true);

            if (quickVisitVM.Visit.PatientVisitId > 0 && quickVisitVM.Visit.SchemeId != systemDefaultScheme.SchemeId)
            {
                PatientSchemeMapModel patientScheme = new PatientSchemeMapModel();
                var patientSchemeFromClient = quickVisitVM.Patient.PatientScheme;
                BillingSchemeModel scheme = visitDbContext.BillingSchemes.FirstOrDefault(a => a.SchemeId == quickVisitVM.Visit.SchemeId);
                if (scheme != null)
                {
                    patientScheme = visitDbContext.PatientSchemeMaps.Where(a => a.PatientId == quickVisitVM.Patient.PatientId && a.SchemeId == scheme.SchemeId).FirstOrDefault();
                }
                if (patientScheme != null)
                {
                    patientScheme.LatestClaimCode = quickVisitVM.Visit.ClaimCode;
                    patientScheme.PolicyHolderEmployerID = patientSchemeFromClient.PolicyHolderEmployerID;
                    patientScheme.PolicyHolderEmployerName = patientSchemeFromClient.PolicyHolderEmployerName;
                    if (scheme.IsOpCreditLimited)
                    {
                        patientScheme.OpCreditLimit = patientSchemeFromClient.OpCreditLimit - (decimal)quickVisitVM.BillingTransaction.TotalAmount;
                    }
                    if (scheme.IsGeneralCreditLimited)
                    {
                        patientScheme.GeneralCreditLimit = patientSchemeFromClient.GeneralCreditLimit - (decimal)quickVisitVM.BillingTransaction.TotalAmount;
                    }
                    patientScheme.LatestPatientVisitId = quickVisitVM.Visit.PatientVisitId;
                    patientScheme.ModifiedOn = DateTime.Now;
                    patientScheme.ModifiedBy = currentUser.EmployeeId;

                    visitDbContext.Entry(patientScheme).State = EntityState.Modified;

                    visitDbContext.SaveChanges();
                }
                else
                {
                    patientScheme = patientSchemeFromClient;
                    if (scheme.IsGeneralCreditLimited)
                    {
                        patientScheme.OpCreditLimit = 0;
                        patientScheme.IpCreditLimit = 0;
                        patientScheme.GeneralCreditLimit = patientSchemeFromClient.GeneralCreditLimit - (decimal)quickVisitVM.BillingTransaction.TotalAmount;
                    }
                    else if(scheme.IsOpCreditLimited || scheme.IsIpCreditLimited)
                    {
                        patientScheme.OpCreditLimit = patientSchemeFromClient.OpCreditLimit - (decimal)quickVisitVM.BillingTransaction.TotalAmount;
                        patientScheme.IpCreditLimit = patientScheme.IpCreditLimit;
                        patientScheme.GeneralCreditLimit = 0;
                    }
                    else
                    {
                        patientScheme.OpCreditLimit = 0;
                        patientScheme.IpCreditLimit = 0;
                        patientScheme.GeneralCreditLimit = 0;
                    }
                    patientScheme.PatientId = quickVisitVM.Patient.PatientId;
                    patientScheme.PatientCode = quickVisitVM.Patient.PatientCode;
                    patientScheme.LatestPatientVisitId = quickVisitVM.Visit.PatientVisitId;
                    patientScheme.SchemeId = quickVisitVM.Visit.SchemeId;
                    patientScheme.CreatedOn = DateTime.Now;
                    patientScheme.CreatedBy = currentUser.EmployeeId;
                    patientScheme.IsActive = true;
                    patientScheme.LatestClaimCode = quickVisitVM.Visit.ClaimCode;
                    patientScheme.SubSchemeId = patientSchemeFromClient.SubSchemeId;

                    visitDbContext.PatientSchemeMaps.Add(patientScheme);
                    visitDbContext.SaveChanges();
                }

                //Send to SSF Server for Real time ClaimBooking.
                var patientSchemes = visitDbContext.PatientSchemeMaps.Where(a => a.SchemeId == quickVisitVM.Visit.SchemeId && a.PatientId == quickVisitVM.Visit.PatientId).FirstOrDefault();
                if (patientSchemes != null)
                {
                    var ssfPriceCategory = visitDbContext.PriceCategories.Where(a => a.PriceCategoryId == quickVisitVM.Visit.PriceCategoryId).FirstOrDefault();
                    if (ssfPriceCategory != null && ssfPriceCategory.PriceCategoryName.ToLower() == "ssf" && realTimeSSFClaimBooking)
                    {
                        //making parallel thread call (asynchronous) to post to SSF Server. so that it won't stop the normal BillingFlow.
                        var billObj = new SSF_ClaimBookingBillDetail_DTO()
                        {
                            InvoiceNoFormatted = $"BL{quickVisitVM.BillingTransaction.InvoiceNo}",
                            TotalAmount = (decimal)quickVisitVM.BillingTransaction.TotalAmount,
                            ClaimCode = (long)quickVisitVM.BillingTransaction.ClaimCode
                        };

                        SSF_ClaimBookingService_DTO claimBooking = SSF_ClaimBookingService_DTO.GetMappedToBookClaim(billObj, patientSchemes);

                        Task.Run(() => BillingBL.SyncToSSFServer(claimBooking, "billing", _ssfDbContext, patientSchemes, currentUser));
                    }
                }
            }
        }

        public static bool IsClaimed(VisitDbContext visitDbContext, long? claimCode, int patientId)
        {
            var isClaimed = false;
            try
            {
                if ((claimCode == 0 || patientId == 0))
                {
                    throw new InvalidOperationException();
                }

                var ssfClaimResponse = visitDbContext.SSFClaimResponseDetails.FirstOrDefault(ssfResDet => ssfResDet.PatientId == patientId && ssfResDet.ClaimCode == claimCode);
                if (ssfClaimResponse != null && ssfClaimResponse.ResponseStatus == true)
                {
                    isClaimed = true;
                }
            }
            catch (Exception)
            {
                throw;
            }

            return isClaimed;
        }

        //Krishna, 22Jan'23 Need to make this method async because we are using httpClient to post request to SSF server which should be async....
        internal async static void UpdatePatientSchemeForFreeFollowupAndFreeReferral(VisitDbContext visitDbContext, SSFDbContext sSFDbContext, VisitModel vis, VisitModel parentVisit, Security.RbacUser currentUser)
        {
            var patCurrentScheme = visitDbContext.PatientSchemeMaps
                                                        .Where(a =>
                                                               a.PatientId == vis.PatientId &&
                                                               a.SchemeId == vis.SchemeId).FirstOrDefault();
            if (patCurrentScheme != null)
            {

                var parentVisitClaimCode = (long)parentVisit.ClaimCode;
                patCurrentScheme.LatestPatientVisitId = vis.PatientVisitId;
                patCurrentScheme.LatestClaimCode = (long)vis.ClaimCode;
                if (VisitBL.IsClaimed(visitDbContext, parentVisitClaimCode, parentVisit.PatientId))
                {
                    //update CreditLimits in PatientMapPriceCategory table fetching from the SSF Server;

                    var newCreditLimitsFromSSFServer = await CheckSSFPatientEligibility(patCurrentScheme.PolicyNo, sSFDbContext);
                    var limitsForSpecificRegistrationCase = newCreditLimitsFromSSFServer.Where(a => a.SsfEligibilityType.ToLower() == patCurrentScheme.RegistrationCase.ToLower()).FirstOrDefault();

                    if (limitsForSpecificRegistrationCase != null)
                    {
                        patCurrentScheme.OpCreditLimit = limitsForSpecificRegistrationCase.OpdBalance;
                        patCurrentScheme.IpCreditLimit = limitsForSpecificRegistrationCase.IPBalance;

                        visitDbContext.Entry(patCurrentScheme).Property(p => p.OpCreditLimit).IsModified = true;
                        visitDbContext.Entry(patCurrentScheme).Property(p => p.IpCreditLimit).IsModified = true;
                    }

                }

                patCurrentScheme.ModifiedBy = currentUser.EmployeeId;
                patCurrentScheme.ModifiedOn = DateTime.Now;

                visitDbContext.Entry(patCurrentScheme).Property(p => p.LatestPatientVisitId).IsModified = true;
                visitDbContext.Entry(patCurrentScheme).Property(p => p.ModifiedBy).IsModified = true;
                visitDbContext.Entry(patCurrentScheme).Property(p => p.ModifiedOn).IsModified = true;
                visitDbContext.SaveChanges();
            }
        }

        //Krishna, 22Jan'23 Need to rewrite below logic here, as it is inside the SSFServices which is not accessible from here..
        private static async Task<List<EligibilityResponse>> CheckSSFPatientEligibility(string ssfPolicyNo, SSFDbContext sSFDbContext)
        {
            var ret = new List<EligibilityResponse>();
            var request = new EligibilityRequest();
            var patient = new EligibilityPatientData();
            var listExtension = new List<EligibilityExtension>();
            var extreq = new EligibilityExtension();
            extreq.url = "visitDate";
            extreq.valueString = DateTime.Now.ToString("yyyy-MM-dd");
            listExtension.Add(extreq);
            try
            {
                patient.reference = $"Patient/{ssfPolicyNo}";
                request.patient = patient;
                request.resourceType = "CoverageEligibilityRequest";
                request.extension = listExtension;
                var client = new HttpClient();
                var SSFCred = GetSSFCredentials(sSFDbContext);
                var ISO_8859_1 = Encoding.GetEncoding("ISO-8859-1");
                var svcCredentials = Convert.ToBase64String(ISO_8859_1.GetBytes(SSFCred.SSFUsername + ":" + SSFCred.SSFPassword));
                client.DefaultRequestHeaders.Add("Authorization", "Basic " + svcCredentials);
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Add(SSFCred.SSFRemotekey, SSFCred.SSFRemoteValue);
                client.BaseAddress = new Uri(SSFCred.SSFurl);
                var jsonContent = JsonConvert.SerializeObject(request);
                StringContent content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
                var response = await client.PostAsync($"CoverageEligibilityRequest/", content);
                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadAsStringAsync();
                    var data = JsonConvert.DeserializeObject<EligibilityRoot>(result);
                    if (data != null)
                    {
                        decimal allowMoney = 0;
                        decimal usedMoney = 0;
                        var extension = new List<EligibilityExtension>();
                        var insurance = data.insurance;

                        //accident and other information 
                        var accident = insurance[1];
                        var accidentext = accident.extension[0];
                        var accidentitem = accident.item[0];
                        var accbenifit = accidentitem.benefit;
                        foreach (var acc in accbenifit)
                        {
                            usedMoney = acc.usedMoney.value;
                            allowMoney = acc.allowedMoney.value;
                        }
                        ret.Add(new EligibilityResponse
                        {
                            Inforce = accident.inforce,
                            SsfSchemeName = accidentext.valueString.ToString(),
                            AccidentBalance = allowMoney,
                            UsedMoney = usedMoney,
                            OpdBalance = 0,
                            IPBalance = 0,
                            SsfEligibilityType = "Accident"
                        });

                        //Medical and other information
                        var medicaldata = insurance[0];
                        var medicaltext = medicaldata.extension[0];
                        var medicalOP = medicaldata.extension[1];
                        var medicalIP = medicaldata.extension[2];
                        var medicalitemitem = medicaldata.item[0];
                        var medicalbenifit = medicalitemitem.benefit;
                        foreach (var acc in medicalbenifit)
                        {
                            usedMoney = acc.usedMoney.value;
                            allowMoney = acc.allowedMoney.value;
                        }
                        ret.Add(new EligibilityResponse
                        {
                            Inforce = medicaldata.inforce,
                            SsfSchemeName = medicaltext.valueString.ToString(),
                            AccidentBalance = 0,
                            UsedMoney = usedMoney,
                            OpdBalance = Convert.ToDecimal(medicalOP.valueString),
                            IPBalance = Convert.ToDecimal(medicalIP.valueString),
                            SsfEligibilityType = "Medical"
                        }); ;
                    }

                }
                return ret;
            }
            catch (Exception ee)
            {
                throw ee;
            }
        }

        //Krishna, 22Jan'23 Need to rewrite below logic here, as it is inside the SSFServices which is not accessible from here..
        private static SSFCredentials GetSSFCredentials(SSFDbContext ssfDbContext)
        {
            SSFCredentials cred = new SSFCredentials();
            cred.SSFurl = GetCoreParameterValueByKeyName_String(ssfDbContext, "SSF", "SSFConfiguration", "SSFurl");
            cred.SSFUsername = GetCoreParameterValueByKeyName_String(ssfDbContext, "SSF", "SSFConfiguration", "SSFUsername");
            cred.SSFPassword = GetCoreParameterValueByKeyName_String(ssfDbContext, "SSF", "SSFConfiguration", "SSFPassword");
            cred.SSFRemotekey = GetCoreParameterValueByKeyName_String(ssfDbContext, "SSF", "SSFConfiguration", "SSFRemotekey");
            cred.SSFRemoteValue = GetCoreParameterValueByKeyName_String(ssfDbContext, "SSF", "SSFConfiguration", "SSFRemoteValue");
            return cred;
        }

        //Krishna, 22Jan'23 Need to rewrite below logic here, as it is inside the SSFServices which is not accessible from here..
        private static string GetCoreParameterValueByKeyName_String(SSFDbContext ssfDbContext, string paramGroup, string paramName, string keyNameOfJsonObj)
        {
            string retValue = null;

            var param = ssfDbContext.AdminParameters.Where(a => a.ParameterGroupName == paramGroup && a.ParameterName == paramName).FirstOrDefault();
            if (param != null)
            {
                string paramValueStr = param.ParameterValue;
                var data = DanpheJSONConvert.DeserializeObject<JObject>(paramValueStr);
                if (data != null)
                {
                    return data[keyNameOfJsonObj].Value<string>();
                }
            }

            return retValue;
        }
        #region This method is responsible to update the balance of Medicare Member while registration.
        public static void UpdateMedicareMemberBalance(VisitDbContext visitDbContext, QuickVisitVM quickVisit, int employeeId)
        {
            MedicareMemberBalance medicareMemberBalance = new MedicareMemberBalance();
            var medicareMember = visitDbContext.MedicareMembers.FirstOrDefault(a => a.PatientId == quickVisit.Patient.PatientId);
            if (medicareMember != null && medicareMember.IsDependent == false)
            {
                medicareMemberBalance = visitDbContext.MedicareMemberBalances.FirstOrDefault(a => a.MedicareMemberId == medicareMember.MedicareMemberId);
            }
            if (medicareMember != null && medicareMember.IsDependent == true)
            {
                medicareMemberBalance = visitDbContext.MedicareMemberBalances.FirstOrDefault(a => a.MedicareMemberId == medicareMember.ParentMedicareMemberId);
            }
            medicareMemberBalance.OpBalance = (decimal)(medicareMemberBalance.OpBalance - (decimal)quickVisit.BillingTransaction.TotalAmount);
            medicareMemberBalance.OpUsedAmount = (decimal)(medicareMemberBalance.OpUsedAmount + (decimal)quickVisit.BillingTransaction.TotalAmount);
            medicareMemberBalance.ModifiedOn = DateTime.Now;
            medicareMemberBalance.ModifiedBy = employeeId;

            visitDbContext.Entry(medicareMemberBalance).Property(p => p.OpBalance).IsModified = true;
            visitDbContext.Entry(medicareMemberBalance).Property(p => p.OpUsedAmount).IsModified = true;
            visitDbContext.Entry(medicareMemberBalance).Property(p => p.ModifiedOn).IsModified = true;
            visitDbContext.Entry(medicareMemberBalance).Property(p => p.ModifiedBy).IsModified = true;

            visitDbContext.SaveChanges();
        }
        #endregion

        public static NewClaimCode_DTO GetLatestClaimCode(VisitDbContext visitDbContext,int schemeId)
        {
            NewClaimCode_DTO newClaimObj = visitDbContext.Database.SqlQuery<NewClaimCode_DTO>("SP_Claim_GenerateNewClaimCode" + " " + schemeId).FirstOrDefault();
            return newClaimObj;
        }

        public static void AddEmpCashtransactions(VisitDbContext dbContext, List<EmpCashTransactionModel> empCashTransaction)
        {
            try
            {
                for (int i = 0; i < empCashTransaction.Count; i++)
                {
                    EmpCashTransactionModel empCashTxn = new EmpCashTransactionModel();
                    empCashTxn.TransactionType = empCashTransaction[i].TransactionType;
                    empCashTxn.ReferenceNo = empCashTransaction[i].ReferenceNo;
                    empCashTxn.EmployeeId = empCashTransaction[i].EmployeeId;
                    empCashTxn.InAmount = empCashTransaction[i].InAmount;
                    empCashTxn.OutAmount = empCashTransaction[i].OutAmount;
                    empCashTxn.Description = empCashTransaction[i].Description;
                    empCashTxn.TransactionDate = empCashTransaction[i].TransactionDate;
                    empCashTxn.CounterID = empCashTransaction[i].CounterID;
                    empCashTxn.IsActive = true;
                    empCashTxn.ModuleName = empCashTransaction[i].ModuleName;
                    empCashTxn.PatientId = empCashTransaction[i].PatientId;
                    empCashTxn.PaymentModeSubCategoryId = empCashTransaction[i].PaymentModeSubCategoryId;
                    empCashTxn.Remarks = empCashTransaction[i].Remarks;
                    dbContext.EmpCashTransactions.Add(empCashTxn);
                }
                dbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception("Unable to Add Cash Transaction Detail:" + ex.ToString());
            }
        }
    }

}
