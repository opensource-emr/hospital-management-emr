using DanpheEMR.CommonTypes;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.InsuranceModels;
using DanpheEMR.Sync.IRDNepal.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using System.Transactions;

namespace DanpheEMR.Controllers
{
    public class InsuranceBL
    {
        public static string InvoiceCode = "BL";

        public static void UpdateInsuranceCurrentBalance(string connString, int patientId, int insuranceProviderId, int currentUserId, double amount, bool isDeduct = false, string remark = "")
        {
            InsuranceDbContext insuranceDbContext = new InsuranceDbContext(connString);
            try
            {
                InsuranceModel insurance = insuranceDbContext.Insurances.Where(ins => ins.PatientId == patientId && ins.InsuranceProviderId == insuranceProviderId).FirstOrDefault();
                if (insurance != null)
                {
                    var previousBalance = insurance.Ins_InsuranceBalance.Value;
                    PatientModel patFromDb = insuranceDbContext.Patients.Where(p => p.PatientId == patientId).FirstOrDefault();
                    patFromDb.Ins_InsuranceBalance = isDeduct ? patFromDb.Ins_InsuranceBalance - amount : amount;
                    //insurance.CurrentBalance = isDeduct ? insurance.CurrentBalance - amount : amount;
                    insurance.Ins_InsuranceBalance = isDeduct ? insurance.Ins_InsuranceBalance - amount : amount;
                    insurance.ModifiedOn = DateTime.Now;
                    insurance.ModifiedBy = currentUserId;
                    insuranceDbContext.Entry(insurance).State = EntityState.Modified;
                    insuranceDbContext.SaveChanges();
                    SaveInsuranceBalanceAmountHistory(connString, patientId, Convert.ToDecimal(previousBalance), Convert.ToDecimal(insurance.Ins_InsuranceBalance), remark, currentUserId);

                }
                else
                {
                    throw new Exception("Unable to update Insurance Balance. Detail: Insurance object is null.");
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Unable to update Insurance Balance. Detail:" + ex.ToString());
            }
        }
        public static void SaveInsuranceBalanceAmountHistory(string connString, int patientId, decimal? previousAmt, decimal? updatedAmt, string remark, int employeeId)
        {
            InsuranceDbContext insuranceDbContext = new InsuranceDbContext(connString);
            try
            {
                InsuranceBalanceHistoryModel insBalHistory = new InsuranceBalanceHistoryModel();
                insBalHistory.PatientId = patientId;
                insBalHistory.PreviousAmount = previousAmt;
                insBalHistory.UpdatedAmount = updatedAmt;
                insBalHistory.Remark = remark;
                insBalHistory.CreatedBy = employeeId;
                insBalHistory.CreatedOn = DateTime.Now;
                insuranceDbContext.InsuranceBalanceHistories.Add(insBalHistory);
                insuranceDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception("Unable to add Insurance Balance history. Detail:" + ex.ToString());
            }
        }
        public static void UpdateLatestClaimCode(string connString, int patientId, Int64? claimCode, int currentUserId)
        {
            InsuranceDbContext insuranceDbContext = new InsuranceDbContext(connString);
            try
            {
                PatientModel pat = insuranceDbContext.Patients.Where(p => p.PatientId == patientId && p.Ins_HasInsurance == true).FirstOrDefault();

                if (pat != null)
                {
                    pat.Ins_LatestClaimCode = claimCode;
                    pat.ModifiedOn = DateTime.Now;
                    pat.ModifiedBy = currentUserId;
                    insuranceDbContext.Entry(pat).State = EntityState.Modified;
                    insuranceDbContext.SaveChanges();
                }
                else
                {
                    throw new Exception("Unable to update latest claim code. Insurance object is null.");
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Unable to update latest claim code. Detail:" + ex.ToString());
            }
        }
        /// <summary>
        /// Gets a new ClaimCode for Gov-Insurance from Visit table.
        /// Also gives if maximum claimcode limit is exceded or not.
        /// Range is defined in the parameter..Name='ClaimCodeAutoGenerateSettings'
        /// </summary>
        /// <param name="insuranceDbContext">Calling function need to pass an object of InsuranceDbContext.</param>
        public static INS_NewClaimCodeDTO GetGovInsNewClaimCode(DbContext dbContextToUse)
        {
            INS_NewClaimCodeDTO newClaimObj = dbContextToUse.Database.SqlQuery<INS_NewClaimCodeDTO>("SP_INS_GetNewClaimCode").FirstOrDefault();
            return newClaimObj;
        }
        public static bool HasDuplicateVisitWithSameProvider(InsuranceDbContext insuranceDb, int patientId, int? providerId, DateTime visitDate)
        {
            //sud:19Jun'19--For DepartmentLevel appointment, ProviderId will be Zero or Null. so return false in that case.//Needs revision.
            if (providerId == null || providerId == 0)
            {
                return false;
            }

            List<VisitModel> patientvisitList = (from visit in insuranceDb.Visit
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
        public static string CreateNewPatientVisitCode(string visitType, string connString)
        {
            try
            {
                InsuranceDbContext insuranceDbContext = new InsuranceDbContext(connString);
                var visitCode = "";
                if (visitType != null)
                {
                    //VisitDbContext visitDbContext = new VisitDbContext(connString);
                    var year = DateTime.Now.Year;
                    var patVisitId = insuranceDbContext.Visit.Where(s => s.VisitType == visitType && s.VisitDate.Year == year).DefaultIfEmpty()
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
                        var vCodMax = (from v in insuranceDbContext.Visit
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

        public static void UpdatePatientInfoFromInsurance(InsuranceDbContext insuranceDbContext, PatientModel patFromDb, GovInsurancePatientVM insPatObjFromClient)
        {
            PatientModel patInfo = patFromDb;
            patInfo.FirstName = insPatObjFromClient.FirstName;
            patInfo.MiddleName = insPatObjFromClient.MiddleName;
            patInfo.LastName = insPatObjFromClient.LastName;
            patInfo.Gender = insPatObjFromClient.Gender;
            patInfo.Age = insPatObjFromClient.Age;
            patInfo.PhoneNumber = insPatObjFromClient.PhoneNumber;
            patInfo.CountryId = insPatObjFromClient.CountryId;
            patInfo.CountrySubDivisionId = insPatObjFromClient.CountrySubDivisionId;
            patInfo.Address = insPatObjFromClient.Address;
            patInfo.PatientNameLocal = insPatObjFromClient.PatientNameLocal;
            patInfo.Ins_NshiNumber = insPatObjFromClient.Ins_NshiNumber;
            patInfo.Ins_HasInsurance = insPatObjFromClient.Ins_HasInsurance;
            patInfo.Ins_InsuranceBalance = insPatObjFromClient.Ins_InsuranceBalance;
            patInfo.ShortName = insPatObjFromClient.FirstName + " " + (string.IsNullOrEmpty(insPatObjFromClient.MiddleName) ? "" : insPatObjFromClient.MiddleName + " ") + insPatObjFromClient.LastName;

            insuranceDbContext.Entry(patInfo).Property(a => a.FirstName).IsModified = true;
            insuranceDbContext.Entry(patInfo).Property(a => a.MiddleName).IsModified = true;
            insuranceDbContext.Entry(patInfo).Property(a => a.LastName).IsModified = true;
            insuranceDbContext.Entry(patInfo).Property(a => a.Gender).IsModified = true;
            insuranceDbContext.Entry(patInfo).Property(a => a.Age).IsModified = true;
            insuranceDbContext.Entry(patInfo).Property(a => a.PhoneNumber).IsModified = true;
            insuranceDbContext.Entry(patInfo).Property(a => a.CountryId).IsModified = true;
            insuranceDbContext.Entry(patInfo).Property(a => a.CountrySubDivisionId).IsModified = true;
            insuranceDbContext.Entry(patInfo).Property(a => a.Address).IsModified = true;
            insuranceDbContext.Entry(patInfo).Property(a => a.PatientNameLocal).IsModified = true;
            insuranceDbContext.Entry(patInfo).Property(a => a.ShortName).IsModified = true;
            insuranceDbContext.Entry(patInfo).Property(a => a.Ins_HasInsurance).IsModified = true;
            insuranceDbContext.Entry(patInfo).Property(a => a.Ins_InsuranceBalance).IsModified = true;
            insuranceDbContext.Entry(patInfo).Property(a => a.Ins_NshiNumber).IsModified = true;

            insuranceDbContext.SaveChanges();
        }
        public static InsuranceModel GetInsuranceModelFromInsPatVM(GovInsurancePatientVM govPatientVM, int currentUserId)
        {
            InsuranceModel retInsInfo = new InsuranceModel()
            {
                InsuranceProviderId = govPatientVM.InsuranceProviderId,
                InsuranceName = govPatientVM.InsuranceName,
                IMISCode = govPatientVM.IMISCode,
                CreatedBy = currentUserId,
                CreatedOn = DateTime.Now,
                InitialBalance = govPatientVM.InitialBalance,
                //CurrentBalance = govPatientVM.CurrentBalance,
                Ins_HasInsurance = govPatientVM.Ins_HasInsurance,
                Ins_NshiNumber = govPatientVM.Ins_NshiNumber,
                Ins_InsuranceBalance = govPatientVM.Ins_InsuranceBalance,
                Ins_FamilyHeadName = govPatientVM.Ins_FamilyHeadName,
                Ins_FamilyHeadNshi = govPatientVM.Ins_FamilyHeadNshi,
                Ins_InsuranceProviderId = govPatientVM.Ins_InsuranceProviderId,
                Ins_IsFamilyHead = govPatientVM.Ins_IsFamilyHead,
                Ins_IsFirstServicePoint = govPatientVM.Ins_IsFirstServicePoint

            };

            return retInsInfo;
        }

        //post to BIL_TXN_BillingTransactionItems
        public static List<BillingTransactionItemModel> PostUpdateBillingTransactionItems(InsuranceDbContext insuranceDContext, string connString,
            List<BillingTransactionItemModel> billingTransactionItems,
            RbacUser currentUser,
            DateTime currentDate,
            string billStatus,
            int? counterId,
             int? billingTransactionId = null)
        {

            BillingFiscalYear fiscYear = InsuranceBL.GetFiscalYear(connString);

            var srvDepts = insuranceDContext.ServiceDepartment.ToList();
            //var empList = masterDbContext.Employees.ToList();
            if (billingTransactionItems != null && billingTransactionItems.Count > 0)
            {
               // we are using this only for Provisional billing hence we can use first element to check billing status..
                int? ProvisionalReceiptNo = null;
                if (billingTransactionItems[0].BillStatus == ENUM_BillingStatus.provisional)
                {
                    ProvisionalReceiptNo = InsuranceBL.GetProvisionalReceiptNo(connString);
                }
                for (int i = 0; i < billingTransactionItems.Count; i++)
                {
                    var txnItem = billingTransactionItems[i];
                    if (txnItem.BillingTransactionItemId == 0)
                    {
                        txnItem.CreatedOn = currentDate;
                        txnItem.CreatedBy = currentUser.EmployeeId;
                        txnItem.RequisitionDate = currentDate;
                        txnItem.CounterId = counterId;
                        txnItem.BillingTransactionId = billingTransactionId;
                        if (txnItem.BillStatus == ENUM_BillingStatus.provisional) // "provisional")
                        {
                            txnItem.ProvisionalReceiptNo = ProvisionalReceiptNo;
                            txnItem.ProvisionalFiscalYearId = fiscYear.FiscalYearId;
                            txnItem.ProvFiscalYear = fiscYear.FiscalYearFormatted; //not mapped
                        }
                        //assign providername and servicedepartmentname to each of the incoming transaction items.
                        //Needs Revision: 12-12-17: sud: I think we don't need to get providername since that property already comes from client side: 
                        //txnItem.ProviderName = (from a in empList where a.EmployeeId == txnItem.ProviderId select a.FullName).FirstOrDefault();
                        txnItem.ServiceDepartmentName = (from b in srvDepts where b.ServiceDepartmentId == txnItem.ServiceDepartmentId select b.ServiceDepartmentName).FirstOrDefault();

                        txnItem = GetBillStatusMapped(txnItem, billStatus, currentDate, currentUser.EmployeeId, counterId);
                        UpdateRequisitionItemsBillStatus(insuranceDContext, txnItem.ServiceDepartmentName, billStatus, currentUser, txnItem.RequisitionId, currentDate);
                        insuranceDContext.BillingTransactionItems.Add(txnItem);
                    }
                    else
                    {
                        txnItem = UpdateTxnItemBillStatus(insuranceDContext, txnItem, billStatus, currentUser, currentDate, counterId, billingTransactionId);
                    }


                    //update the Requisitions billingstatus as 'paid' for above items. 
                    //List<Int32?> requisitionIds = (from a in billTranItems select a.BillItemRequisitionId).ToList();
                    BillItemRequisition billItemRequisition = (from bill in insuranceDContext.BillItemRequisitions
                                                               where bill.RequisitionId == txnItem.RequisitionId
                                                               && bill.ServiceDepartmentId == txnItem.ServiceDepartmentId
                                                               select bill).FirstOrDefault();
                    if (billItemRequisition != null)
                    {
                        billItemRequisition.BillStatus = "paid";
                        insuranceDContext.Entry(billItemRequisition).State = EntityState.Modified;
                    }
                }
                insuranceDContext.SaveChanges();
            }
            else
            {
                throw new Exception("BillingTranscation Items is null");
            }
            return billingTransactionItems;
        }


        public static BillingFiscalYear GetFiscalYear(string connString)
        {
            InsuranceDbContext insDbContext = new InsuranceDbContext(connString);
            return GetFiscalYear(insDbContext);
        }

        //Overload for GetFiscalYear with dbcontext as parameter, no need to initialize dbcontext if we already have that object.
        public static BillingFiscalYear GetFiscalYear(InsuranceDbContext insDbContext)
        {
            DateTime currentDate = DateTime.Now.Date;
            return insDbContext.BillingFiscalYears.Where(fsc => fsc.StartYear <= currentDate && fsc.EndYear >= currentDate).FirstOrDefault();
        }

        public static int? GetProvisionalReceiptNo(string connString)
        {
            int fiscalYearId = GetFiscalYear(connString).FiscalYearId;
            InsuranceDbContext insDbContext = new InsuranceDbContext(connString);
            int? receiptNo = (from txnItems in insDbContext.BillingTransactionItems
                              where txnItems.ProvisionalFiscalYearId == fiscalYearId
                              select txnItems.ProvisionalReceiptNo).DefaultIfEmpty(0).Max();

            return receiptNo + 1;
        }

        //maps billStatus and related fields based on billStatus.
        public static BillingTransactionItemModel GetBillStatusMapped(BillingTransactionItemModel billItem,
            string billStatus,
            DateTime? currentDate,
            int userId,
            int? counterId)
        {
            if (billStatus == ENUM_BillingStatus.paid) //"paid")
            {
                billItem.PaidDate = currentDate;
                billItem.BillStatus = ENUM_BillingStatus.paid;// "paid";
                billItem.PaymentReceivedBy = userId;
                billItem.PaidCounterId = counterId;

            }
            else if (billStatus == ENUM_BillingStatus.unpaid)// "unpaid")
            {
                billItem.PaidDate = null;
                billItem.BillStatus = ENUM_BillingStatus.unpaid;// "unpaid";
                billItem.PaidCounterId = null;
                billItem.PaymentReceivedBy = null;

            }
            else if (billStatus == ENUM_BillingStatus.cancel)// "cancel")
            {
                billItem.CancelledBy = userId;
                billItem.BillStatus = ENUM_BillingStatus.cancel;// "cancel";
                billItem.CancelledOn = currentDate;
            }
            else if (billStatus == ENUM_BillingStatus.returned)//"returned")
            {
                billItem.ReturnStatus = true;
                billItem.ReturnQuantity = billItem.Quantity;//all items will be returned            
            }
            else if (billStatus == "adtCancel") // if admission cancelled
            {
                billItem.CancelledBy = userId;
                billItem.BillStatus = "adtCancel";
                billItem.CancelledOn = currentDate;
            }
            return billItem;
        }
        //updates billStatus in respective tables.
        public static void UpdateRequisitionItemsBillStatus(InsuranceDbContext insuranceDbContext,
            string serviceDepartmentName,
            string billStatus, //provisional,paid,unpaid,returned
            RbacUser currentUser,
            long? requisitionId,
            DateTime? modifiedDate)
        {

            string integrationName = insuranceDbContext.ServiceDepartment
             .Where(a => a.ServiceDepartmentName == serviceDepartmentName)
             .Select(a => a.IntegrationName).FirstOrDefault();

            if (integrationName != null)
            {
                //update return status in lab 
                if (integrationName.ToLower() == "lab")
                {
                    var labItem = insuranceDbContext.LabRequisitions.Where(req => req.RequisitionId == requisitionId).FirstOrDefault();
                    if (labItem != null)
                    {
                        labItem.BillingStatus = billStatus;
                        labItem.ModifiedOn = modifiedDate;
                        labItem.ModifiedBy = currentUser.EmployeeId;
                        insuranceDbContext.Entry(labItem).Property(a => a.BillingStatus).IsModified = true;
                        insuranceDbContext.Entry(labItem).Property(a => a.ModifiedOn).IsModified = true;
                        insuranceDbContext.Entry(labItem).Property(a => a.ModifiedBy).IsModified = true;
                    }

                }
                //update return status for Radiology
                else if (integrationName.ToLower() == "radiology")
                {
                    var radioItem = insuranceDbContext.RadiologyImagingRequisitions.Where(req => req.ImagingRequisitionId == requisitionId).FirstOrDefault();
                    if (radioItem != null)
                    {
                        radioItem.BillingStatus = billStatus;
                        radioItem.ModifiedOn = modifiedDate;
                        radioItem.ModifiedBy = currentUser.EmployeeId;
                        insuranceDbContext.Entry(radioItem).Property(a => a.BillingStatus).IsModified = true;
                        insuranceDbContext.Entry(radioItem).Property(a => a.ModifiedOn).IsModified = true;
                        insuranceDbContext.Entry(radioItem).Property(a => a.ModifiedBy).IsModified = true;
                    }

                }
                //update return status for Visit
                else if (integrationName.ToLower() == "opd" || integrationName.ToLower() == "er")
                {
                    var visitItem = insuranceDbContext.Visit.Where(vis => vis.PatientVisitId == requisitionId).FirstOrDefault();
                    if (visitItem != null)
                    {
                        visitItem.BillingStatus = billStatus;
                        visitItem.ModifiedOn = modifiedDate;
                        visitItem.ModifiedBy = currentUser.EmployeeId;
                        insuranceDbContext.Entry(visitItem).Property(a => a.BillingStatus).IsModified = true;
                        insuranceDbContext.Entry(visitItem).Property(a => a.ModifiedOn).IsModified = true;
                        insuranceDbContext.Entry(visitItem).Property(a => a.ModifiedBy).IsModified = true;
                    }
                }

                insuranceDbContext.AddAuditCustomField("ChangedByUserId", currentUser.EmployeeId);
                insuranceDbContext.AddAuditCustomField("ChangedByUserName", currentUser.UserName);

                insuranceDbContext.SaveChanges();
            }
        }

        //updates billStatus and related fields in BIL_TXN_BillingTransactionItems table.
        public static BillingTransactionItemModel UpdateTxnItemBillStatus(InsuranceDbContext insuranceDbContext,
            BillingTransactionItemModel billItem,
            string billStatus, //provisional,paid,unpaid,returned
            RbacUser currentUser,
            DateTime? modifiedDate = null,
            int? counterId = null,
            int? billingTransactionId = null)
        {
            modifiedDate = modifiedDate != null ? modifiedDate : DateTime.Now;

            billItem = GetBillStatusMapped(billItem, billStatus, modifiedDate, currentUser.EmployeeId, counterId);
            insuranceDbContext.BillingTransactionItems.Attach(billItem);
            //update returnstatus and returnquantity
            if (billStatus == "paid")
            {
                insuranceDbContext.Entry(billItem).Property(b => b.PaidDate).IsModified = true;
                insuranceDbContext.Entry(billItem).Property(a => a.BillStatus).IsModified = true;
                insuranceDbContext.Entry(billItem).Property(b => b.PaymentReceivedBy).IsModified = true;
                insuranceDbContext.Entry(billItem).Property(b => b.PaidCounterId).IsModified = true;
            }
            else if (billStatus == "unpaid")
            {

                insuranceDbContext.Entry(billItem).Property(b => b.PaidDate).IsModified = true;
                insuranceDbContext.Entry(billItem).Property(a => a.BillStatus).IsModified = true;
                insuranceDbContext.Entry(billItem).Property(b => b.PaidCounterId).IsModified = true;
                insuranceDbContext.Entry(billItem).Property(b => b.PaymentReceivedBy).IsModified = true;
            }
            else if (billStatus == "cancel")
            {

                insuranceDbContext.Entry(billItem).Property(a => a.CancelledBy).IsModified = true;
                insuranceDbContext.Entry(billItem).Property(a => a.BillStatus).IsModified = true;
                insuranceDbContext.Entry(billItem).Property(a => a.CancelledOn).IsModified = true;
                insuranceDbContext.Entry(billItem).Property(a => a.CancelRemarks).IsModified = true;

            }
            else if (billStatus == "adtCancel")
            {

                insuranceDbContext.Entry(billItem).Property(a => a.CancelledBy).IsModified = true;
                insuranceDbContext.Entry(billItem).Property(a => a.BillStatus).IsModified = true;
                insuranceDbContext.Entry(billItem).Property(a => a.CancelledOn).IsModified = true;
                insuranceDbContext.Entry(billItem).Property(a => a.CancelRemarks).IsModified = true;

            }
            else if (billStatus == "returned")
            {
                insuranceDbContext.Entry(billItem).Property(a => a.ReturnStatus).IsModified = true;
                insuranceDbContext.Entry(billItem).Property(a => a.ReturnQuantity).IsModified = true;
            }

            if (billItem.BillingTransactionId == null)
            {
                billItem.BillingTransactionId = billingTransactionId;
                insuranceDbContext.Entry(billItem).Property(b => b.BillingTransactionId).IsModified = true;
            }

            //these fields could also be changed during update.
            insuranceDbContext.Entry(billItem).Property(b => b.BillStatus).IsModified = true;
            insuranceDbContext.Entry(billItem).Property(a => a.Price).IsModified = true;
            insuranceDbContext.Entry(billItem).Property(a => a.Quantity).IsModified = true;
            insuranceDbContext.Entry(billItem).Property(a => a.SubTotal).IsModified = true;
            insuranceDbContext.Entry(billItem).Property(a => a.DiscountAmount).IsModified = true;
            insuranceDbContext.Entry(billItem).Property(a => a.DiscountPercent).IsModified = true;
            insuranceDbContext.Entry(billItem).Property(a => a.DiscountPercentAgg).IsModified = true;
            insuranceDbContext.Entry(billItem).Property(a => a.TotalAmount).IsModified = true;
            insuranceDbContext.Entry(billItem).Property(a => a.ProviderId).IsModified = true;
            insuranceDbContext.Entry(billItem).Property(a => a.ProviderName).IsModified = true;
            insuranceDbContext.Entry(billItem).Property(a => a.TaxableAmount).IsModified = true;
            insuranceDbContext.Entry(billItem).Property(a => a.NonTaxableAmount).IsModified = true;

            UpdateRequisitionItemsBillStatus(insuranceDbContext, billItem.ServiceDepartmentName, billStatus, currentUser, billItem.RequisitionId, modifiedDate);

            //update bill status in BillItemRequistion (Order Table)
            BillItemRequisition billItemRequisition = (from bill in insuranceDbContext.BillItemRequisitions
                                                       where bill.RequisitionId == billItem.RequisitionId
                                                       && bill.ServiceDepartmentId == billItem.ServiceDepartmentId
                                                       select bill).FirstOrDefault();
            if (billItemRequisition != null)
            {
                billItemRequisition.BillStatus = billStatus;
                insuranceDbContext.Entry(billItemRequisition).Property(a => a.BillStatus).IsModified = true;
            }
            return billItem;
        }

        //updates price, quantity, bed charges etc.
        public static void UpdateBillingTransactionItems(InsuranceDbContext insuranceDbContext, BillingTransactionItemModel txnItmFromClient)
        {
            if (txnItmFromClient != null && txnItmFromClient.BillingTransactionItemId != 0)
            {

                using (var dbContextTransaction = insuranceDbContext.Database.BeginTransaction())
                {
                    try
                    {

                        BillingTransactionItemModel txnItmFromDb = insuranceDbContext.BillingTransactionItems
          .Where(itm => itm.BillingTransactionItemId == txnItmFromClient.BillingTransactionItemId).FirstOrDefault();
                        insuranceDbContext.BillingTransactionItems.Attach(txnItmFromDb);

                        txnItmFromDb.Price = txnItmFromClient.Price;
                        txnItmFromDb.Quantity = txnItmFromClient.Quantity;
                        txnItmFromDb.SubTotal = txnItmFromClient.SubTotal;

                        txnItmFromDb.DiscountAmount = txnItmFromClient.DiscountAmount;
                        txnItmFromDb.DiscountPercent = txnItmFromClient.DiscountPercent;
                        txnItmFromDb.TotalAmount = txnItmFromClient.TotalAmount;
                        txnItmFromDb.ProviderId = txnItmFromClient.ProviderId;
                        txnItmFromDb.ProviderName = txnItmFromClient.ProviderName;
                        txnItmFromDb.RequestedBy = txnItmFromClient.RequestedBy;
                        txnItmFromDb.DiscountPercentAgg = txnItmFromClient.DiscountPercentAgg;
                        txnItmFromDb.TaxableAmount = txnItmFromClient.TaxableAmount;
                        txnItmFromDb.NonTaxableAmount = txnItmFromClient.NonTaxableAmount;
                        txnItmFromDb.ModifiedBy = txnItmFromClient.ModifiedBy;
                        txnItmFromDb.ModifiedOn = DateTime.Now;

                        insuranceDbContext.Entry(txnItmFromDb).Property(a => a.Price).IsModified = true;
                        insuranceDbContext.Entry(txnItmFromDb).Property(a => a.Quantity).IsModified = true;
                        insuranceDbContext.Entry(txnItmFromDb).Property(a => a.SubTotal).IsModified = true;
                        insuranceDbContext.Entry(txnItmFromDb).Property(a => a.DiscountAmount).IsModified = true;
                        insuranceDbContext.Entry(txnItmFromDb).Property(a => a.DiscountPercent).IsModified = true;
                        insuranceDbContext.Entry(txnItmFromDb).Property(a => a.DiscountPercentAgg).IsModified = true;
                        insuranceDbContext.Entry(txnItmFromDb).Property(a => a.TotalAmount).IsModified = true;
                        insuranceDbContext.Entry(txnItmFromDb).Property(a => a.ProviderId).IsModified = true;
                        insuranceDbContext.Entry(txnItmFromDb).Property(a => a.RequestedBy).IsModified = true;
                        insuranceDbContext.Entry(txnItmFromDb).Property(a => a.ProviderName).IsModified = true;
                        insuranceDbContext.Entry(txnItmFromDb).Property(a => a.TaxableAmount).IsModified = true;
                        insuranceDbContext.Entry(txnItmFromDb).Property(a => a.NonTaxableAmount).IsModified = true;
                        insuranceDbContext.Entry(txnItmFromDb).Property(a => a.ModifiedBy).IsModified = true;
                        insuranceDbContext.Entry(txnItmFromDb).Property(a => a.ModifiedOn).IsModified = true;

                        insuranceDbContext.SaveChanges();

                        dbContextTransaction.Commit();
                    }
                    catch (Exception ex)
                    {
                        //rollback all changes if any error occurs
                        dbContextTransaction.Rollback();
                        throw ex;
                    }
                }
            }
        }

        //post to BIL_TXN_BillingTransaction
        public static BillingTransactionModel PostBillingTransaction(InsuranceDbContext dbContext,
            string connString,
            BillingTransactionModel billingTransaction,
            RbacUser currentUser,
            DateTime currentDate)
        {
            List<BillingTransactionItemModel> newTxnItems = new List<BillingTransactionItemModel>();
            dbContext.AuditDisabled = false;
            if (billingTransaction.BillingTransactionItems != null && billingTransaction.BillingTransactionItems.Count > 0)
            {
                foreach (var txnItem in billingTransaction.BillingTransactionItems)
                {

                    BillingTransactionItemModel clonedItem = BillingTransactionItemModel.GetClone(txnItem);
                    clonedItem.BillingTransaction = null;
                    newTxnItems.Add(clonedItem);
                }
                billingTransaction.BillingTransactionItems = null;
            }
            //if paymentmode is credit, paiddate and paidamount should be null
            //handle this in client side as well. 
            billingTransaction.CreatedBy = currentUser.EmployeeId;
            if (billingTransaction.BillStatus == ENUM_BillingStatus.unpaid)// "unpaid")
            {
                double? totalAmount = billingTransaction.TotalAmount;
                int i = (int)totalAmount;
                billingTransaction.TotalAmount = i;
                string s = totalAmount.ToString();
                s = s.Replace(i + "", "");
                billingTransaction.AdjustmentTotalAmount = String.IsNullOrEmpty(s) ? 0 : Convert.ToDecimal(s);
                billingTransaction.PaidDate = null;
                billingTransaction.PaidAmount = null;
                billingTransaction.PaymentReceivedBy = null;
                billingTransaction.PaidCounterId = null;

            }
            else if (billingTransaction.BillStatus == ENUM_BillingStatus.paid)// "paid")
            {
                double? totalAmount = billingTransaction.TotalAmount;
                int i = (int)totalAmount;
                billingTransaction.TotalAmount = i;
                string s = totalAmount.ToString();
                s = s.Replace(i + "", "");
                billingTransaction.AdjustmentTotalAmount = String.IsNullOrEmpty(s) ? 0 : Convert.ToDecimal(s);
                billingTransaction.PaidDate = currentDate;
                billingTransaction.PaidCounterId = billingTransaction.CounterId;
                billingTransaction.PaymentReceivedBy = billingTransaction.CreatedBy;
            }

            BillingFiscalYear fiscYear = InsuranceBL.GetFiscalYear(connString);

            //ashim: 26Aug2018: Moved from client side to server side.
            billingTransaction.CreatedOn = currentDate;
            billingTransaction.CreatedBy = currentUser.EmployeeId;
            billingTransaction.FiscalYearId = fiscYear.FiscalYearId;
            //billingTransaction.InvoiceNo = GetInvoiceNumber(connString);
            //billingTransaction.InvoiceCode = BillingBL.InvoiceCode;
            billingTransaction.InvoiceCode = billingTransaction.IsInsuranceBilling == true ? "INS" : InvoiceCode;
            if (string.IsNullOrEmpty(billingTransaction.LabTypeName))
            {
                billingTransaction.LabTypeName = "op-lab";
            }
            dbContext.BillingTransactions.Add(billingTransaction);

            dbContext.AddAuditCustomField("ChangedByUserId", currentUser.EmployeeId);
            dbContext.AddAuditCustomField("ChangedByUserName", currentUser.UserName);

            //dbContext.SaveChanges();
            GenerateInvoiceNoAndSaveInvoice(dbContext, billingTransaction, connString);
            dbContext.AuditDisabled = true;

            PostUpdateBillingTransactionItems(dbContext,
                   connString,
                   newTxnItems,
                   currentUser, currentDate,
                   billingTransaction.BillStatus,
                   billingTransaction.CounterId,
                   billingTransaction.BillingTransactionId);
            dbContext.SaveChanges();

            //step:3-- if there's deposit deduction, then add to deposit table. 
            if (billingTransaction.PaymentMode != ENUM_BillPaymentMode.credit // "credit" 
                && billingTransaction.DepositReturnAmount != null && billingTransaction.DepositReturnAmount > 0)
            {
                BillingDeposit dep = new BillingDeposit()
                {
                    DepositType = ENUM_BillDepositType.DepositDeduct, //"depositdeduct",
                    Remarks = "Deposit used in InvoiceNo. " + billingTransaction.InvoiceCode + billingTransaction.InvoiceNo,
                    //Remarks = "depositdeduct" + " for transactionid:" + billingTransaction.BillingTransactionId,
                    IsActive = true,
                    Amount = billingTransaction.DepositReturnAmount,
                    BillingTransactionId = billingTransaction.BillingTransactionId,
                    DepositBalance = billingTransaction.DepositBalance,
                    FiscalYearId = billingTransaction.FiscalYearId,
                    CounterId = billingTransaction.CounterId,
                    CreatedBy = billingTransaction.CreatedBy,
                    CreatedOn = currentDate,
                    PatientId = billingTransaction.PatientId,
                    PatientVisitId = billingTransaction.PatientVisitId,
                    PaymentMode = billingTransaction.PaymentMode,
                    PaymentDetails = billingTransaction.PaymentDetails,
                    ReceiptNo = GetDepositReceiptNo(connString)
                };
                billingTransaction.ReceiptNo = dep.ReceiptNo + 1;
                dbContext.BillingDeposits.Add(dep);
                dbContext.SaveChanges();

            }
            billingTransaction.FiscalYear = fiscYear.FiscalYearFormatted;
            return billingTransaction;
        }

        private static void GenerateInvoiceNoAndSaveInvoice(InsuranceDbContext dbContext, BillingTransactionModel billingTransaction, string connString)
        {
            try
            {
                billingTransaction.InvoiceNo = InsuranceBL.GetInvoiceNumber(connString);
                //if(invoiceNoTest == 1) { billingTransaction.InvoiceNo = 258017; invoiceNoTest++; }//logic to test the duplicate invoice no and retry to get the latest invoiceNo
                dbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                if (ex is DbUpdateException dbUpdateEx)
                {
                    if (dbUpdateEx.InnerException?.InnerException is SqlException sqlException)
                    {

                        if (sqlException.Number == 2627)// unique constraint error in BillingTranscation table..
                        {
                            GenerateInvoiceNoAndSaveInvoice(dbContext, billingTransaction, connString);
                        }
                        else
                        {
                            throw;
                        }
                    }
                    else throw;
                }
                else throw;

            }
        }

        public static int? GetInvoiceNumber(string connString, bool? isInsuranceBIlling)
        {
            int fiscalYearId = GetFiscalYear(connString).FiscalYearId;
            DanpheEMR.DalLayer.BillingDbContext billDbContext = new DalLayer.BillingDbContext(connString);
            int? invoiceNumber = (from txn in billDbContext.BillingTransactions
                                  where txn.FiscalYearId == fiscalYearId
                                  where txn.IsInsuranceBilling == isInsuranceBIlling
                                  select txn.InvoiceNo).DefaultIfEmpty(0).Max();

            return invoiceNumber + 1;
        }

        public static int? GetInvoiceNumber(string connString)
        {
            using (new TransactionScope(TransactionScopeOption.Required, new TransactionOptions { IsolationLevel = System.Transactions.IsolationLevel.ReadUncommitted }))
            {
                int fiscalYearId = GetFiscalYear(connString).FiscalYearId;
                DanpheEMR.DalLayer.BillingDbContext billDbContext = new DalLayer.BillingDbContext(connString);
                int? invoiceNumber = (from txn in billDbContext.BillingTransactions
                                      where txn.FiscalYearId == fiscalYearId
                                      select txn.InvoiceNo).DefaultIfEmpty(0).Max();

                return invoiceNumber + 1;
            }
        }
        public static int? GetDepositReceiptNo(string connString)
        {
            int fiscalYearId = GetFiscalYear(connString).FiscalYearId;
            BillingDbContext billDbContext = new BillingDbContext(connString);
            int? receiptNo = (from depTxn in billDbContext.BillingDeposits
                              where depTxn.FiscalYearId == fiscalYearId
                              select depTxn.ReceiptNo).DefaultIfEmpty(0).Max();

            return receiptNo + 1;
        }
        public static void SyncBillToRemoteServer(object billToPost, string billType, InsuranceDbContext dbContext)
        {
            IRDLogModel irdLog = new IRDLogModel();
            if (billType == "sales")
            {

                string responseMsg = null;
                BillingTransactionModel billTxn = (BillingTransactionModel)billToPost;
                try
                {
                    IRD_BillViewModel bill = IRD_BillViewModel.GetMappedSalesBillForIRD(billTxn, true);
                    irdLog.JsonData = JsonConvert.SerializeObject(bill);
                    responseMsg = DanpheEMR.Sync.IRDNepal.APIs.PostSalesBillToIRD(bill);
                }
                catch (Exception ex)
                {
                    responseMsg = "0";
                    irdLog.ErrorMessage = GetInnerMostException(ex);
                    irdLog.Status = "failed";
                }

                dbContext.BillingTransactions.Attach(billTxn);
                if (responseMsg == "200")
                {
                    billTxn.IsRealtime = true;
                    billTxn.IsRemoteSynced = true;
                    irdLog.Status = "success";
                }
                else
                {
                    billTxn.IsRealtime = false;
                    billTxn.IsRemoteSynced = false;
                    irdLog.Status = "failed";
                }

                dbContext.Entry(billTxn).Property(x => x.IsRealtime).IsModified = true;
                dbContext.Entry(billTxn).Property(x => x.IsRemoteSynced).IsModified = true;
                dbContext.SaveChanges();

                irdLog.BillType = "billing-" + billType;
                irdLog.ResponseMessage = responseMsg;
                PostIRDLog(irdLog, dbContext);
            }
            else if (billType == "sales-return")
            {
                BillInvoiceReturnModel billRet = (BillInvoiceReturnModel)billToPost;

                string responseMsg = null;
                try
                {
                    IRD_BillReturnViewModel salesRetBill = IRD_BillReturnViewModel.GetMappedSalesReturnBillForIRD(billRet, true);
                    irdLog.JsonData = JsonConvert.SerializeObject(salesRetBill);
                    responseMsg = DanpheEMR.Sync.IRDNepal.APIs.PostSalesReturnBillToIRD(salesRetBill);
                }
                catch (Exception ex)
                {
                    responseMsg = "0";
                    irdLog.ErrorMessage = GetInnerMostException(ex);
                    irdLog.Status = "failed";
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
                    irdLog.Status = "failed";
                }

                dbContext.Entry(billRet).Property(x => x.IsRealtime).IsModified = true;
                dbContext.Entry(billRet).Property(x => x.IsRemoteSynced).IsModified = true;
                dbContext.SaveChanges();
                irdLog.BillType = "billing-" + billType;
                irdLog.ResponseMessage = responseMsg;
                PostIRDLog(irdLog, dbContext);
            }
        }

        //this function post IRD posting log details to Danphe IRD_Log table
        public static void PostIRDLog(IRDLogModel irdLogdata, InsuranceDbContext dbContext)
        {
            try
            {
                irdLogdata.CreatedOn = DateTime.Now;

                string url_IRDNepal = ConfigurationManager.AppSettings["url_IRDNepal"];
                switch (irdLogdata.BillType)
                {
                    case "billing-sales":
                        {
                            string api_SalesIRDNepal = ConfigurationManager.AppSettings["api_SalesIRDNepal"];
                            irdLogdata.UrlInfo = url_IRDNepal + "/" + api_SalesIRDNepal;
                            break;
                        }
                    case "billing-sales-return":
                        {
                            string api_SalesReturnIRDNepal = ConfigurationManager.AppSettings["api_SalesReturnIRDNepal"];
                            irdLogdata.UrlInfo = url_IRDNepal + "/" + api_SalesReturnIRDNepal;
                            break;
                        }
                }
                dbContext.IRDLog.Add(irdLogdata);
                dbContext.SaveChanges();
            }
            catch (Exception ex)
            {

            }
        }

        //method to return inner most exception 
        public static string GetInnerMostException(Exception ex)
        {
            Exception currentEx = ex;
            while (currentEx.InnerException != null)
            {
                currentEx = currentEx.InnerException;
            }
            return currentEx.Message;
        }
    }

    //public class InsNewClaimCodeDTO
    //{

    //}


}


