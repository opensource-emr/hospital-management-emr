using DanpheEMR.DalLayer;
using DanpheEMR.ServerModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DanpheEMR.Security;
using DanpheEMR.Enums;
using System.Data.SqlClient;
using System.Data.Entity.Infrastructure;
using DanpheEMR.ServerModel.MasterModels;
using DanpheEMR.ServerModel.BillingModels;
using DanpheEMR.ServerModel.PatientModels;
using DanpheEMR.ServerModel.MedicareModels;

namespace DanpheEMR.Controllers.Billing
{
    public class BillingTransactionBL
    {
        //private static int invoiceNoTest = 1; // to test the duplicate invoiceNo.

        //post to BIL_TXN_BillingTransaction
        public static BillingTransactionModel PostBillingTransaction(BillingDbContext dbContext,
            string connString,
            BillingTransactionPostVM billingTransactionPostVM,
            BillingTransactionModel billingTransaction,
            RbacUser currentUser,
            DateTime currentDate, int? dischargeStatementId = null)
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
            if (billingTransaction.PatientVisitId == null)
            {
                billingTransaction.PatientVisitId = newTxnItems[0].PatientVisitId;
            }
            if (billingTransaction.BillStatus == ENUM_BillingStatus.unpaid)// "unpaid")
            {
                billingTransaction.PaidDate = null;
                billingTransaction.PaidAmount = 0;
                billingTransaction.PaymentReceivedBy = null;
                billingTransaction.PaidCounterId = null;

            }
            else if (billingTransaction.BillStatus == ENUM_BillingStatus.paid)// "paid")
            {
                billingTransaction.PaidDate = currentDate;
                billingTransaction.PaidCounterId = billingTransaction.CounterId;
                billingTransaction.PaymentReceivedBy = billingTransaction.CreatedBy;

            }

            BillingFiscalYear fiscYear = BillingBL.GetFiscalYear(connString);

            //ashim: 26Aug2018: Moved from client side to server side.
            billingTransaction.CreatedOn = currentDate;
            billingTransaction.CreatedBy = currentUser.EmployeeId;
            billingTransaction.FiscalYearId = fiscYear.FiscalYearId;
            billingTransaction.InvoiceCode = billingTransaction.IsInsuranceBilling == true ? "INS" : BillingBL.InvoiceCode;


            dbContext.BillingTransactions.Add(billingTransaction);

            dbContext.AddAuditCustomField("ChangedByUserId", currentUser.EmployeeId);
            dbContext.AddAuditCustomField("ChangedByUserName", currentUser.UserName);

            GenerateInvoiceNoAndSaveInvoice(billingTransaction, dbContext, connString); //To avoid the duplicate the invoiceNo..

            dbContext.AuditDisabled = true;
            //Krishna, 22,Jul'22, This will map PatientVisitId to the Provisional Items of inpatient only
            #region This will map PatientVisitId to the Provisional Items of inpatient 
            for (int i = 0; i < newTxnItems.Count; i++)
            {
                if (newTxnItems[i].BillStatus == ENUM_BillingStatus.provisional && billingTransaction.TransactionType == ENUM_BillingType.inpatient)
                {
                    newTxnItems[i].PatientVisitId = billingTransaction.PatientVisitId;
                }
            }
            #endregion

            PostUpdateBillingTransactionItems(dbContext,
                   connString,
                   newTxnItems,
                   currentUser, currentDate,
                   billingTransaction.BillStatus,
                   billingTransaction.CounterId,
                   billingTransaction.BillingTransactionId,
                   dischargeStatementId);

            dbContext.SaveChanges();

            //Krishna, 23rdMarch'23 Below Method will add requisition to its respective Departments
            if (billingTransaction.BillingTransactionItems[0].BillStatus != ENUM_BillingStatus.provisional)
            {
                AddRequisitions(dbContext, connString, billingTransactionPostVM, billingTransaction.BillingTransactionId, billingTransaction.BillStatus, currentUser);
            }




            if (billingTransaction.BillStatus == ENUM_BillingStatus.paid || billingTransaction.IsCoPayment == true)
            { //If transaction is done with Depositor paymentmode is credit we don't have to add in EmpCashTransaction table
                List<EmpCashTransactionModel> empCashTransaction = new List<EmpCashTransactionModel>();
                for (int i = 0; i < billingTransaction.EmployeeCashTransaction.Count; i++)
                {
                    EmpCashTransactionModel empCashTransactionModel = new EmpCashTransactionModel();
                    empCashTransactionModel.TransactionType = "CashSales";
                    empCashTransactionModel.ReferenceNo = billingTransaction.BillingTransactionId;
                    //empCashTransactionModel.InAmount = billingTransaction.TotalAmount;
                    empCashTransactionModel.InAmount = billingTransaction.EmployeeCashTransaction[i].InAmount;
                    empCashTransactionModel.OutAmount = 0;
                    empCashTransactionModel.EmployeeId = currentUser.EmployeeId;
                    //empCashTransaction.Description = billingTransaction.de;
                    empCashTransactionModel.TransactionDate = DateTime.Now;
                    empCashTransactionModel.CounterID = billingTransaction.CounterId;
                    empCashTransactionModel.PaymentModeSubCategoryId = billingTransaction.EmployeeCashTransaction[i].PaymentModeSubCategoryId;
                    empCashTransactionModel.PatientId = billingTransaction.PatientId;
                    empCashTransactionModel.ModuleName = billingTransaction.EmployeeCashTransaction[i].ModuleName;
                    empCashTransactionModel.Remarks = billingTransaction.EmployeeCashTransaction[i].Remarks;
                    empCashTransaction.Add(empCashTransactionModel);
                }

                BillingBL.AddEmpCashtransactionForBilling(dbContext, empCashTransaction);
            }

            //step:3-- if there's deposit deduction, then add to deposit table. 
            if ((billingTransaction.IsCoPayment == true &&
                billingTransaction.PaymentMode.ToLower() == ENUM_BillPaymentMode.credit.ToLower() &&  //case of Copayment
                billingTransaction.DepositUsed != null && billingTransaction.DepositUsed > 0) ||
                (billingTransaction.PaymentMode != ENUM_BillPaymentMode.credit // "credit" 
                && billingTransaction.DepositUsed != null && billingTransaction.DepositUsed > 0))
            {
                decimal depBalance = 0;
                if (billingTransaction.InvoiceType == ENUM_InvoiceType.inpatientDischarge)
                {
                    //in case of discharge bill, we clear all remaining deposits of a patient.
                    //but from client side, we're already making deposit balance=0.
                    //so only for DepositTable, we have to re-calcaultate the balance amount again.
                    depBalance = (decimal)billingTransaction.DepositReturnAmount;
                }
                else
                {
                    depBalance = (decimal)billingTransaction.DepositBalance;
                }

                
                BillingDepositModel dep = new BillingDepositModel()
                {
                    TransactionType = ENUM_DepositTransactionType.DepositDeduct, //"depositdeduct",
                    Remarks = "Deposit used in InvoiceNo. " + billingTransaction.InvoiceCode + billingTransaction.InvoiceNo,
                    //Remarks = "depositdeduct" + " for transactionid:" + billingTransaction.BillingTransactionId,
                    IsActive = true,
                    //Amount = billingTransaction.DepositUsed,
                    OutAmount = (decimal)billingTransaction.DepositUsed,
                    ModuleName = ENUM_ModuleNames.Billing,
                    DepositHeadId = 1,
                    BillingTransactionId = billingTransaction.BillingTransactionId,
                    DepositBalance = depBalance,
                    FiscalYearId = billingTransaction.FiscalYearId,
                    CounterId = billingTransaction.CounterId,
                    CreatedBy = billingTransaction.CreatedBy,
                    CreatedOn = currentDate,
                    PatientId = billingTransaction.PatientId,
                    PatientVisitId = billingTransaction.PatientVisitId,
                    PaymentMode = billingTransaction.PaymentMode,
                    PaymentDetails = billingTransaction.PaymentDetails,
                    ReceiptNo = BillingBL.GetDepositReceiptNo(connString),
                    VisitType = billingTransaction.TransactionType
                };
                billingTransaction.ReceiptNo = dep.ReceiptNo + 1;
                dbContext.BillingDeposits.Add(dep);
                dbContext.SaveChanges();

                MasterDbContext masterDbContext = new MasterDbContext(connString);
                PaymentModes MstPaymentModes = masterDbContext.PaymentModes.Where(a => a.PaymentSubCategoryName.ToLower() == "deposit").FirstOrDefault();
                EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel();
                empCashTransaction.TransactionType = ENUM_DepositTransactionType.DepositDeduct;
                empCashTransaction.ReferenceNo = dep.DepositId;
                empCashTransaction.InAmount = 0;
                //empCashTransaction.OutAmount = dep.Amount;
                empCashTransaction.OutAmount = (double)dep.OutAmount;
                empCashTransaction.EmployeeId = currentUser.EmployeeId;
                //empCashTransaction.Description = billingTransaction.de;
                empCashTransaction.TransactionDate = DateTime.Now;
                empCashTransaction.CounterID = dep.CounterId;
                empCashTransaction.ModuleName = "Billing";
                empCashTransaction.PatientId = dep.PatientId;
                empCashTransaction.PaymentModeSubCategoryId = MstPaymentModes.PaymentSubCategoryId;

                BillingBL.AddEmpCashTransaction(dbContext, empCashTransaction);
            }
            billingTransaction.FiscalYear = fiscYear.FiscalYearFormatted;

            //create BillingTxnCreditBillStatus when IsCoPayment is true, Krishna,23,Aug'22

            if (billingTransaction.PaymentMode == ENUM_BillPaymentMode.credit)
            {
                BillingTransactionCreditBillStatusModel billingTransactionCreditBillStatus = new BillingTransactionCreditBillStatusModel();

                billingTransactionCreditBillStatus.BillingTransactionId = billingTransaction.BillingTransactionId;
                billingTransactionCreditBillStatus.FiscalYearId = billingTransaction.FiscalYearId;
                billingTransactionCreditBillStatus.InvoiceNoFormatted = $"{billingTransaction.FiscalYear}-{billingTransaction.InvoiceCode}{billingTransaction.InvoiceNo}";
                billingTransactionCreditBillStatus.InvoiceDate = (DateTime)billingTransaction.CreatedOn;
                billingTransactionCreditBillStatus.PatientVisitId = (int)billingTransaction.PatientVisitId;
                billingTransactionCreditBillStatus.SchemeId = billingTransaction.SchemeId;
                billingTransactionCreditBillStatus.LiableParty = billingTransaction.OrganizationId is null ? "SELF" : "Organization";
                billingTransactionCreditBillStatus.PatientId = billingTransaction.PatientId;
                billingTransactionCreditBillStatus.CreditOrganizationId = (int)billingTransaction.OrganizationId;
                billingTransactionCreditBillStatus.MemberNo = billingTransaction.MemberNo;
                billingTransactionCreditBillStatus.SalesTotalBillAmount = (decimal)billingTransaction.TotalAmount;
                billingTransactionCreditBillStatus.SettlementStatus = ENUM_ClaimManagement_SettlementStatus.Pending;
                billingTransactionCreditBillStatus.ReturnTotalBillAmount = 0; //This will come if bill is returned
                billingTransactionCreditBillStatus.CoPayReceivedAmount = billingTransaction.ReceivedAmount;
                billingTransactionCreditBillStatus.CoPayReturnAmount = 0;
                billingTransactionCreditBillStatus.NetReceivableAmount = billingTransactionCreditBillStatus.SalesTotalBillAmount - billingTransactionCreditBillStatus.CoPayReceivedAmount - (billingTransactionCreditBillStatus.ReturnTotalBillAmount - billingTransactionCreditBillStatus.CoPayReturnAmount);
                billingTransactionCreditBillStatus.CreatedBy = currentUser.EmployeeId;
                billingTransactionCreditBillStatus.NonClaimableAmount = 0;
                billingTransactionCreditBillStatus.IsClaimable = true;
                billingTransactionCreditBillStatus.ClaimCode = billingTransaction.ClaimCode;
                billingTransactionCreditBillStatus.CreatedOn = currentDate;
                billingTransactionCreditBillStatus.IsActive = true;

                dbContext.BillingTransactionCreditBillStatuses.Add(billingTransactionCreditBillStatus);
                dbContext.SaveChanges();
            }

            //update PatientPriceCategoryMap table to update CreditLimits according to Visit Types ('inpatient', 'outpatient')
            var patientVisit = dbContext.Visit.Where(a => a.PatientVisitId == billingTransaction.PatientVisitId).FirstOrDefault();

            //Krishna, 8th-Jan'23 Below logic is responsible to update the MedicareMemberBalance When Medicare Patient Billing is done.
            BillingSchemeModel scheme = new BillingSchemeModel();

            if (patientVisit != null)
            {
                scheme = dbContext.BillingSchemes.FirstOrDefault(a => a.SchemeId == patientVisit.SchemeId);
            }
            if (scheme != null && (scheme.IsGeneralCreditLimited || scheme.IsOpCreditLimited || scheme.IsIpCreditLimited))
            {
                UpdatePatientSchemeMap(billingTransaction, patientVisit, dbContext, currentDate, currentUser, scheme);
            }
            //UpdatePatientMapPriceCategoryForMedicarePatientBilling(billingTransaction, patientVisit, dbContext, currentDate, currentUser);

            if (scheme != null && scheme.ApiIntegrationName == ENUM_Scheme_ApiIntegrationNames.Medicare)
            {
                UpdateMedicareMemberBalance(billingTransaction, patientVisit, dbContext, currentDate, currentUser);
            }
            return billingTransaction;
        }

        private static void UpdatePatientSchemeMap(BillingTransactionModel billingTransaction, VisitModel patientVisit, BillingDbContext dbContext, DateTime currentDate, RbacUser currentUser, BillingSchemeModel scheme)
        {
            PatientSchemeMapModel patientSchemeMap = new PatientSchemeMapModel();
            patientSchemeMap = dbContext.PatientSchemeMaps.Where(a => a.PatientId == billingTransaction.PatientId && a.SchemeId == patientVisit.SchemeId).FirstOrDefault();

            if (scheme.IsGeneralCreditLimited && patientSchemeMap.GeneralCreditLimit > 0)
            {
                if ((decimal)billingTransaction.TotalAmount <= patientSchemeMap.GeneralCreditLimit)
                {
                    patientSchemeMap.GeneralCreditLimit = patientSchemeMap.GeneralCreditLimit - (decimal)billingTransaction.TotalAmount;
                    patientSchemeMap.ModifiedOn = currentDate;
                    patientSchemeMap.ModifiedBy = currentUser.EmployeeId;

                    dbContext.Entry(patientSchemeMap).Property(p => p.GeneralCreditLimit).IsModified = true;
                    dbContext.Entry(patientSchemeMap).Property(p => p.ModifiedOn).IsModified = true;
                    dbContext.Entry(patientSchemeMap).Property(p => p.ModifiedBy).IsModified = true;
                    dbContext.SaveChanges();
                }
                else
                {
                    throw new Exception("General Credit Limit is less than total bill amount");
                }
            }

            if (scheme.IsOpCreditLimited && (patientVisit != null && patientVisit.VisitType.ToLower() == ENUM_VisitType.outpatient.ToLower()))
            {

                if (patientSchemeMap != null && patientSchemeMap.OpCreditLimit > 0)
                {
                    patientSchemeMap.OpCreditLimit = patientSchemeMap.OpCreditLimit - (decimal)billingTransaction.TotalAmount;
                    patientSchemeMap.ModifiedOn = currentDate;
                    patientSchemeMap.ModifiedBy = currentUser.EmployeeId;

                    dbContext.Entry(patientSchemeMap).Property(p => p.OpCreditLimit).IsModified = true;
                    dbContext.Entry(patientSchemeMap).Property(p => p.ModifiedOn).IsModified = true;
                    dbContext.Entry(patientSchemeMap).Property(p => p.ModifiedBy).IsModified = true;
                    dbContext.SaveChanges();
                }
                else
                {
                    throw new Exception("OP Credit Limit is less than total bill amount");
                }
            }

            if (scheme.IsIpCreditLimited && (patientVisit != null && patientVisit.VisitType.ToLower() == ENUM_VisitType.inpatient.ToLower() && scheme.ApiIntegrationName != ENUM_Scheme_ApiIntegrationNames.SSF))
            {
                if (patientSchemeMap != null && patientSchemeMap.IpCreditLimit > 0)
                {
                    patientSchemeMap.IpCreditLimit = patientSchemeMap.IpCreditLimit - (decimal)billingTransaction.TotalAmount;
                    patientSchemeMap.ModifiedOn = currentDate;
                    patientSchemeMap.ModifiedBy = currentUser.EmployeeId;

                    dbContext.Entry(patientSchemeMap).Property(p => p.IpCreditLimit).IsModified = true;
                    dbContext.Entry(patientSchemeMap).Property(p => p.ModifiedOn).IsModified = true;
                    dbContext.Entry(patientSchemeMap).Property(p => p.ModifiedBy).IsModified = true;
                    dbContext.SaveChanges();
                }
                else
                {
                    throw new Exception("IP Credit Limit is less than total bill amount");
                }
            }

            //Below block is for inpatient i.e. either IPCreditlimit only is used or both IP and OP Credit limits are used.
            if (scheme.IsIpCreditLimited && (patientVisit != null && patientVisit.VisitType.ToLower() == ENUM_VisitType.inpatient.ToLower() && scheme.ApiIntegrationName == ENUM_Scheme_ApiIntegrationNames.SSF))
            {
                //Here when TotalBillAmount is less than the sum of (IPCreditLimit and OPCreditLimit) then only update Credit limits or allow to use Credit limits
                decimal TotalBillAmount = (decimal)billingTransaction.TotalAmount;
                if (patientSchemeMap != null && (TotalBillAmount <= (patientSchemeMap.IpCreditLimit + patientSchemeMap.OpCreditLimit)))
                {
                    //This checks which credit limit to use (if TotalBillAmount is less than IpCreditLimit itself use IpCreditLimit only and update its value as well)
                    if (TotalBillAmount <= patientSchemeMap.IpCreditLimit)
                    {
                        patientSchemeMap.IpCreditLimit = patientSchemeMap.IpCreditLimit - TotalBillAmount;
                        patientSchemeMap.ModifiedOn = currentDate;
                        patientSchemeMap.ModifiedBy = currentUser.EmployeeId;

                        dbContext.Entry(patientSchemeMap).Property(p => p.IpCreditLimit).IsModified = true;
                        dbContext.Entry(patientSchemeMap).Property(p => p.ModifiedOn).IsModified = true;
                        dbContext.Entry(patientSchemeMap).Property(p => p.ModifiedBy).IsModified = true;
                        dbContext.SaveChanges();
                    }
                    //(if TotalBillAmount is more than IpCreditLimit and there is OPCreditlimit remaining then use both and update there value as well)
                    else if (TotalBillAmount > patientSchemeMap.IpCreditLimit && patientSchemeMap.OpCreditLimit > 0)
                    {
                        TotalBillAmount = TotalBillAmount - patientSchemeMap.IpCreditLimit;
                        patientSchemeMap.IpCreditLimit = 0;
                        patientSchemeMap.OpCreditLimit = (decimal)(patientSchemeMap.OpCreditLimit - TotalBillAmount);
                        patientSchemeMap.ModifiedOn = currentDate;
                        patientSchemeMap.ModifiedBy = currentUser.EmployeeId;

                        dbContext.Entry(patientSchemeMap).Property(p => p.IpCreditLimit).IsModified = true;
                        dbContext.Entry(patientSchemeMap).Property(p => p.OpCreditLimit).IsModified = true;
                        dbContext.Entry(patientSchemeMap).Property(p => p.ModifiedOn).IsModified = true;
                        dbContext.Entry(patientSchemeMap).Property(p => p.ModifiedBy).IsModified = true;
                        dbContext.SaveChanges();
                    }
                }
                else
                {
                    throw new Exception("Credit Limit is less than total bill amount");
                }
            }
        }

        private static void AddRequisitions(BillingDbContext dbContext, string connString, BillingTransactionPostVM billingTransactionPostVM, int billingTransactionId, string billStatus, RbacUser currentUser)
        {
            if (billingTransactionPostVM != null)//sud:29Mar'23--Added NullCheck since this object was coming NULL from IpBilling.
            {
                if (billingTransactionPostVM.LabRequisition != null && billingTransactionPostVM.LabRequisition.Count > 0)
                {
                    AddLabRequisition(dbContext, billingTransactionId, billStatus, billingTransactionPostVM.LabRequisition, currentUser.EmployeeId, connString);
                }
                if (billingTransactionPostVM.ImagingItemRequisition != null && billingTransactionPostVM.ImagingItemRequisition.Count > 0)
                {
                    AddImagingRequisition(dbContext, billingTransactionId, billStatus, billingTransactionPostVM.ImagingItemRequisition, currentUser.EmployeeId);
                }
            }

            //if (billingTransactionPostVM.VisitItems != null && billingTransactionPostVM.VisitItems.Count > 0)
            //{
            //    billingTransactionPostVM.VisitItems = AddVisitItems(_billingDbContext, billingTransactionPostVM.VisitItems, currentUser.EmployeeId);
            //}
        }

        private static List<ImagingRequisitionModel> AddImagingRequisition(BillingDbContext billingDbContext, int billingTransactionId, string billStatus, List<ImagingRequisitionModel> imagingItemRequisition, int employeeId)
        {
            try
            {
                //getting the imagingtype because imagingtypename is needed in billing for getting service department
                List<RadiologyImagingTypeModel> Imgtype = billingDbContext.RadiologyImagingTypes
                                    .ToList<RadiologyImagingTypeModel>();

                var notValidForReportingItem = billingDbContext.RadiologyImagingItems.Where(i => i.IsValidForReporting == false).Select(m => m.ImagingItemId);
                if (imagingItemRequisition != null && imagingItemRequisition.Count > 0)
                {
                    foreach (var req in imagingItemRequisition)
                    {
                        req.ImagingDate = System.DateTime.Now;
                        req.CreatedOn = DateTime.Now;
                        req.CreatedBy = employeeId;
                        req.BillingStatus = billStatus;
                        req.IsActive = true;
                        var billingTransactionItem = billingDbContext.BillingTransactionItems.FirstOrDefault(a => a.BillingTransactionId == billingTransactionId && a.ServiceItemId == req.ServiceItemId);
                        if (billingTransactionItem != null)
                        {
                            req.BillingTransactionItemId = billingTransactionItem.BillingTransactionItemId;
                        }
                        if (req.PrescriberId != null && req.PrescriberId != 0)
                        {
                            var emp = billingDbContext.Employee.Where(a => a.EmployeeId == req.PrescriberId).FirstOrDefault();
                            req.PrescriberName = emp.FullName;
                        }
                        if (req.ImagingTypeId != null)
                        {
                            req.ImagingTypeName = Imgtype.Where(a => a.ImagingTypeId == req.ImagingTypeId).Select(a => a.ImagingTypeName).FirstOrDefault();
                            req.Urgency = string.IsNullOrEmpty(req.Urgency) ? "normal" : req.Urgency;
                            //req.WardName = ;
                        }
                        else
                        {
                            req.ImagingTypeId = Imgtype.Where(a => a.ImagingTypeName.ToLower() == req.ImagingTypeName.ToLower()).Select(a => a.ImagingTypeId).FirstOrDefault();
                        }
                        if (!notValidForReportingItem.Contains(req.ImagingItemId.Value))
                        {
                            billingDbContext.RadiologyImagingRequisitions.Add(req);
                        }
                    }
                    billingDbContext.SaveChanges();
                    return imagingItemRequisition;
                }
                else
                {
                    return null;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private static List<LabRequisitionModel> AddLabRequisition(BillingDbContext billingDbContext, int billingTransactionId, string billStatus, List<LabRequisitionModel> labRequisition, int employeeId, string connString)
        {
            try
            {
                List<LabRequisitionModel> labReqListFromClient = labRequisition;
                LabVendorsModel defaultVendor = billingDbContext.LabVendors.Where(val => val.IsDefault == true).FirstOrDefault();

                if (labReqListFromClient != null && labReqListFromClient.Count > 0)
                {
                    PatientDbContext patientContext = new PatientDbContext(connString);
                    List<LabTestModel> allLabTests = billingDbContext.LabTests.ToList();
                    int patId = labReqListFromClient[0].PatientId;
                    //get patient as querystring from client side rather than searching it from request's list.
                    PatientModel currPatient = patientContext.Patients.Where(p => p.PatientId == patId)
                        .FirstOrDefault<PatientModel>();

                    if (currPatient != null)
                    {

                        labReqListFromClient.ForEach(req =>
                        {
                            req.ResultingVendorId = defaultVendor.LabVendorId;
                            LabTestModel labTestdb = allLabTests.Where(a => a.LabTestId == req.LabTestId).FirstOrDefault<LabTestModel>();
                            if (labTestdb == null)
                                throw new Exception("Billing Item Not Mapped With Lab Test (Key:IntegrationItemId)");
                            //get PatientId from clientSide
                            if (labTestdb.IsValidForReporting == true)
                            {
                                req.CreatedOn = req.OrderDateTime = System.DateTime.Now;
                                req.CreatedBy = employeeId;
                                req.BillingStatus = billStatus;
                                var billingTransactionItem = billingDbContext.BillingTransactionItems.FirstOrDefault(a => a.BillingTransactionId == billingTransactionId && a.ServiceItemId == req.ServiceItemId);
                                if (billingTransactionItem != null)
                                {
                                    req.BillingTransactionItemId = billingTransactionItem.BillingTransactionItemId;
                                }
                                req.ReportTemplateId = labTestdb.ReportTemplateId;
                                req.LabTestSpecimen = null;
                                req.LabTestSpecimenSource = null;
                                req.LabTestName = labTestdb.LabTestName;
                                req.RunNumberType = labTestdb.RunNumberType;
                                //req.OrderStatus = "active";
                                req.LOINC = "LOINC Code";
                                req.BillCancelledBy = null;
                                req.BillCancelledOn = null;
                                if (req.PrescriberId != null && req.PrescriberId != 0)
                                {
                                    var emp = billingDbContext.Employee.Where(a => a.EmployeeId == req.PrescriberId).FirstOrDefault();
                                    req.PrescriberName = emp.FullName;
                                }

                                //req.PatientVisitId = visitId;//assign above visitid to this requisition.
                                if (String.IsNullOrEmpty(currPatient.MiddleName))
                                    req.PatientName = currPatient.FirstName + " " + currPatient.LastName;
                                else
                                    req.PatientName = currPatient.FirstName + " " + currPatient.MiddleName + " " + currPatient.LastName;

                                req.OrderDateTime = DateTime.Now;
                                req.IsFileUploaded = false;
                                req.IsFileUploadedToTeleMedicine = false;
                                req.IsUploadedToIMU = false;
                                billingDbContext.LabRequisitions.Add(req);
                                billingDbContext.SaveChanges();
                            }
                        });

                    }
                    return labReqListFromClient;
                }
                else
                {
                    return null;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        #region Update Medicare Member Balance
        private static void UpdateMedicareMemberBalance(BillingTransactionModel billingTransaction, VisitModel patientVisit, BillingDbContext dbContext, DateTime currentDate, RbacUser currentUser)
        {
            MedicareMemberBalance medicareMemberBalance = new MedicareMemberBalance();
            var medicareMember = dbContext.MedicareMembers.FirstOrDefault(a => a.PatientId == billingTransaction.PatientId);
            if (medicareMember != null && medicareMember.IsDependent == false)
            {
                medicareMemberBalance = dbContext.MedicareMemberBalances.FirstOrDefault(a => a.MedicareMemberId == medicareMember.MedicareMemberId);
            }
            if (medicareMember != null && medicareMember.IsDependent == true)
            {
                medicareMemberBalance = dbContext.MedicareMemberBalances.FirstOrDefault(a => a.MedicareMemberId == medicareMember.ParentMedicareMemberId);
            }
            if (patientVisit != null)
            {
                if (patientVisit.VisitType.ToLower() == ENUM_VisitType.outpatient.ToLower())
                {
                    if (medicareMemberBalance.OpBalance >= (decimal)billingTransaction.TotalAmount)
                    {
                        medicareMemberBalance.OpBalance = (medicareMemberBalance.OpBalance - (decimal)billingTransaction.TotalAmount);
                        medicareMemberBalance.OpUsedAmount = (medicareMemberBalance.OpUsedAmount + (decimal)billingTransaction.TotalAmount);
                        medicareMemberBalance.ModifiedOn = currentDate;
                        medicareMemberBalance.ModifiedBy = currentUser.EmployeeId;

                        dbContext.Entry(medicareMemberBalance).Property(p => p.OpBalance).IsModified = true;
                        dbContext.Entry(medicareMemberBalance).Property(p => p.OpUsedAmount).IsModified = true;
                        dbContext.Entry(medicareMemberBalance).Property(p => p.ModifiedOn).IsModified = true;
                        dbContext.Entry(medicareMemberBalance).Property(p => p.ModifiedBy).IsModified = true;

                        dbContext.SaveChanges();
                    }
                    else
                    {
                        throw new Exception("Op Balance for Medicare Member is less than Total Bill Amount");
                    }
                }
                if (patientVisit.VisitType.ToLower() == ENUM_VisitType.inpatient.ToLower())
                {
                    if (medicareMemberBalance.IpBalance >= (decimal)billingTransaction.TotalAmount)
                    {
                        medicareMemberBalance.IpBalance = (medicareMemberBalance.IpBalance - (decimal)billingTransaction.TotalAmount);
                        medicareMemberBalance.IpUsedAmount = (medicareMemberBalance.IpUsedAmount + (decimal)billingTransaction.TotalAmount);
                        medicareMemberBalance.ModifiedOn = currentDate;
                        medicareMemberBalance.ModifiedBy = currentUser.EmployeeId;

                        dbContext.Entry(medicareMemberBalance).Property(p => p.IpBalance).IsModified = true;
                        dbContext.Entry(medicareMemberBalance).Property(p => p.IpUsedAmount).IsModified = true;
                        dbContext.Entry(medicareMemberBalance).Property(p => p.ModifiedOn).IsModified = true;
                        dbContext.Entry(medicareMemberBalance).Property(p => p.ModifiedBy).IsModified = true;

                        dbContext.SaveChanges();
                    }
                    else
                    {
                        throw new Exception("Ip Balance for Medicare Member is less than Total Bill Amount");
                    }
                }
            }

        }
        #endregion

        //Krishna: 5th,Jan'2022 // avoids the duplicate invoiceNo..
        private static void GenerateInvoiceNoAndSaveInvoice(BillingTransactionModel billingTransaction, BillingDbContext dbContext, string connString)
        {
            try
            {
                billingTransaction.InvoiceNo = BillingBL.GetInvoiceNumber(connString);
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
                            GenerateInvoiceNoAndSaveInvoice(billingTransaction, dbContext, connString);
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

        //post to BIL_TXN_BillingTransactionItems
        public static List<BillingTransactionItemModel> PostUpdateBillingTransactionItems(BillingDbContext dbContext, string connString,
            List<BillingTransactionItemModel> billingTransactionItems,
            RbacUser currentUser,
            DateTime currentDate,
            string billStatus,
            int counterId,
            int? billingTransactionId = null,
            int? dischargeStatementId = null)
        {

            BillingFiscalYear fiscYear = BillingBL.GetFiscalYear(connString);

            var srvDepts = dbContext.ServiceDepartment.ToList();
            //var empList = masterDbContext.Employees.ToList();
            if (billingTransactionItems != null && billingTransactionItems.Count > 0)
            {
                // we are using this only for Provisional billing hence we can use first element to check billing status..
                int? ProvisionalReceiptNo = null;
                if (billingTransactionItems[0].BillStatus == ENUM_BillingStatus.provisional)
                {
                    ProvisionalReceiptNo = BillingBL.GetProvisionalReceiptNo(connString);
                }
                for (int i = 0; i < billingTransactionItems.Count; i++)
                {
                    var txnItem = billingTransactionItems[i];
                    if (txnItem.BillingTransactionItemId == 0)
                    {
                        //if (string.IsNullOrEmpty(txnItem.LabTypeName))
                        //{
                        //    txnItem.LabTypeName = "op-lab";
                        //}
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
                        //Krishna,23rdMarch'23 We need to move below code to some different place
                        //UpdateRequisitionItemsBillStatus(dbContext, txnItem.ServiceDepartmentName, billStatus, currentUser, txnItem.RequisitionId, currentDate);
                        dbContext.BillingTransactionItems.Add(txnItem);
                    }
                    else
                    {
                        txnItem = UpdateTxnItemBillStatus(dbContext, txnItem, billStatus, currentUser, currentDate, counterId, billingTransactionId, dischargeStatementId);
                    }


                    //update the Requisitions billingstatus as 'paid' for above items. 
                    //List<Int32?> requisitionIds = (from a in billTranItems select a.BillItemRequisitionId).ToList();
                    BillItemRequisition billItemRequisition = (from bill in dbContext.BillItemRequisitions
                                                               where bill.RequisitionId == txnItem.RequisitionId
                                                               && bill.ServiceDepartmentId == txnItem.ServiceDepartmentId
                                                               select bill).FirstOrDefault();
                    if (billItemRequisition != null)
                    {
                        billItemRequisition.BillStatus = "paid";
                        dbContext.Entry(billItemRequisition).State = System.Data.Entity.EntityState.Modified;
                    }
                }
                dbContext.SaveChanges();
            }
            else
            {
                throw new Exception("BillingTranscation Items is null");
            }
            return billingTransactionItems;
        }


        //updates billStatus and related fields in BIL_TXN_BillingTransactionItems table.
        public static BillingTransactionItemModel UpdateTxnItemBillStatus(BillingDbContext billingDbContext,
            BillingTransactionItemModel billItem,
            string billStatus, //provisional,paid,unpaid,returned
            RbacUser currentUser,
            DateTime? modifiedDate = null,
            int? counterId = null,
            int? billingTransactionId = null,
            int? dischargeStatementId = null)
        {
            modifiedDate = modifiedDate != null ? modifiedDate : DateTime.Now;
               int fiscalYearId =
                      billingDbContext.BillingFiscalYears.Where(f => f.StartYear <= DateTime.Today && f.EndYear >= DateTime.Today)
                 .Select(f => f.FiscalYearId).FirstOrDefault();
            int receiptNo = GetCancellationReceiptNo(billingDbContext, fiscalYearId);
            if (billStatus == ENUM_BillingStatus.cancel)
            {
                if (billItem.BillStatus == ENUM_BillingStatus.paid && billItem.BillingTransactionId != null)
                {
                    throw new Exception("Patients is discharged, Cannot Cancel this Service Item");
                }
                billItem = GetBillStatusMapped(billItem, billStatus, modifiedDate, currentUser.EmployeeId, counterId);
            }
            else
            {
                billItem = GetBillStatusMapped(billItem, billStatus, modifiedDate, currentUser.EmployeeId, counterId);
            }
            billingDbContext.BillingTransactionItems.Attach(billItem);
            //update returnstatus and returnquantity
            if (billStatus == "paid")
            {
                billingDbContext.Entry(billItem).Property(b => b.PaidDate).IsModified = true;
                billingDbContext.Entry(billItem).Property(a => a.BillStatus).IsModified = true;
                billingDbContext.Entry(billItem).Property(b => b.PaymentReceivedBy).IsModified = true;
                billingDbContext.Entry(billItem).Property(b => b.PaidCounterId).IsModified = true;
            }
            else if (billStatus == "unpaid")
            {

                billingDbContext.Entry(billItem).Property(b => b.PaidDate).IsModified = true;
                billingDbContext.Entry(billItem).Property(a => a.BillStatus).IsModified = true;
                billingDbContext.Entry(billItem).Property(b => b.PaidCounterId).IsModified = true;
                billingDbContext.Entry(billItem).Property(b => b.PaymentReceivedBy).IsModified = true;
            }
            else if (billStatus == "cancel")
            {

                billingDbContext.Entry(billItem).Property(a => a.CancelledBy).IsModified = true;
                billingDbContext.Entry(billItem).Property(a => a.BillStatus).IsModified = true;
                billingDbContext.Entry(billItem).Property(a => a.CancelledOn).IsModified = true;
                billingDbContext.Entry(billItem).Property(a => a.CancelRemarks).IsModified = true;


                billItem.BillStatus = ENUM_BillingStatus.cancel;// "cancel";
                billItem.CancelledBy = currentUser.EmployeeId;
                billItem.CancelledOn = DateTime.Now;

                BillingCancellationModel cancelledItem = new BillingCancellationModel();
                {
                    cancelledItem.BillingTransactionItemId = billItem.BillingTransactionItemId;
                    cancelledItem.ReferenceProvisionalReceiptNo = (int)billItem.ProvisionalReceiptNo;
                    cancelledItem.CancellationReceiptNo = receiptNo;
                    cancelledItem.CancellationFiscalYearId = (int)billItem.ProvisionalFiscalYearId;
                    cancelledItem.PatientId = billItem.PatientId;
                    cancelledItem.PatientVisitId = (int)billItem.PatientVisitId;
                    cancelledItem.BillingType = billItem.BillingType;
                    cancelledItem.VisitType = billItem.VisitType;
                    cancelledItem.ServiceItemId = billItem.ServiceItemId;
                    cancelledItem.ServiceDepartmentId = billItem.ServiceDepartmentId;
                    cancelledItem.ItemName = billItem.ItemName;
                    cancelledItem.ItemCode = billItem.ItemCode;
                    cancelledItem.IntegrationItemId = (int)billItem.IntegrationItemId;
                    cancelledItem.Price = (decimal)billItem.Price;
                    cancelledItem.CancelledQty = (int)billItem.Quantity;
                    cancelledItem.CancelledSubtotal = (decimal)billItem.SubTotal;
                    cancelledItem.CancelledDiscountPercent = (decimal)billItem.DiscountPercent;
                    cancelledItem.CancelledDiscountAmount = (decimal)billItem.DiscountAmount;
                    cancelledItem.CancelledTotalAmount = (decimal)billItem.TotalAmount;
                    cancelledItem.PerformerId = billItem.PerformerId;
                    cancelledItem.PrescriberId = billItem.PrescriberId;
                    cancelledItem.CancelledCounterId = billItem.CounterId;
                    cancelledItem.CancellationRemarks = billItem.CancelRemarks;
                    cancelledItem.SchemeId = billItem.DiscountSchemeId;
                    cancelledItem.PriceCategoryId = billItem.PriceCategoryId;
                    cancelledItem.CreatedBy = currentUser.EmployeeId;
                    cancelledItem.CreatedOn = DateTime.Now;
                    cancelledItem.IsActive = true;
                    cancelledItem.ModifiedOn = null;
                    cancelledItem.ModifiedBy = null;
                    billingDbContext.BillingCancellation.Add(cancelledItem);
                    billingDbContext.SaveChanges();
                };

                billItem.ProvisionalReturnItemId = cancelledItem.ProvisionalItemReturnId;


            }
            else if (billStatus == "adtCancel")
            {

                billingDbContext.Entry(billItem).Property(a => a.CancelledBy).IsModified = true;
                billingDbContext.Entry(billItem).Property(a => a.BillStatus).IsModified = true;
                billingDbContext.Entry(billItem).Property(a => a.CancelledOn).IsModified = true;
                billingDbContext.Entry(billItem).Property(a => a.CancelRemarks).IsModified = true;

            }
            else if (billStatus == "returned")
            {
                billingDbContext.Entry(billItem).Property(a => a.ReturnStatus).IsModified = true;
                billingDbContext.Entry(billItem).Property(a => a.ReturnQuantity).IsModified = true;
            }

            if (billItem.BillingTransactionId == null)
            {
                billItem.BillingTransactionId = billingTransactionId;
                billingDbContext.Entry(billItem).Property(b => b.BillingTransactionId).IsModified = true;
            }

            if (dischargeStatementId != null)
            {
                billItem.DischargeStatementId = dischargeStatementId;
                billingDbContext.Entry(billItem).Property(b => b.DischargeStatementId).IsModified = true;
            }
            //these fields could also be changed during update.
            billingDbContext.Entry(billItem).Property(b => b.BillStatus).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.Price).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.Quantity).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.SubTotal).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.DiscountAmount).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.DiscountPercent).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.DiscountPercentAgg).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.DiscountSchemeId).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.TotalAmount).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.PerformerId).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.PerformerName).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.TaxableAmount).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.NonTaxableAmount).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.PatientVisitId).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.CoPaymentCashAmount).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.CoPaymentCreditAmount).IsModified = true;

            UpdateRequisitionItemsBillStatus(billingDbContext, billItem.ServiceDepartmentName, billStatus, currentUser, billItem.BillingTransactionItemId, modifiedDate, billItem.PatientVisitId);

            //update bill status in BillItemRequistion (Order Table)
            BillItemRequisition billItemRequisition = (from bill in billingDbContext.BillItemRequisitions
                                                       where bill.RequisitionId == billItem.RequisitionId
                                                       && bill.ServiceDepartmentId == billItem.ServiceDepartmentId
                                                       select bill).FirstOrDefault();
            if (billItemRequisition != null)
            {
                billItemRequisition.BillStatus = billStatus;
                billingDbContext.Entry(billItemRequisition).Property(a => a.BillStatus).IsModified = true;
            }
            return billItem;
        }
        // Get max receiptnumber
        public static int GetCancellationReceiptNo(BillingDbContext billingDbContext, int fiscalYearId)
        {
            int? receiptNo = (from txnItems in billingDbContext.BillingCancellation
                              where txnItems.CancellationFiscalYearId == fiscalYearId
                              select txnItems.CancellationReceiptNo).DefaultIfEmpty(0).Max();

            return (int)receiptNo + 1;
        }
        //updates billStatus in respective tables.
        public static void UpdateRequisitionItemsBillStatus(BillingDbContext billingDbContext,
            string serviceDepartmentName,
            string billStatus, //provisional,paid,unpaid,returned
            RbacUser currentUser,
            int billingTransactionItemId,
            DateTime? modifiedDate,
            int? patientVisitId)
        {

            string integrationName = billingDbContext.ServiceDepartment
             .Where(a => a.ServiceDepartmentName == serviceDepartmentName)
             .Select(a => a.IntegrationName).FirstOrDefault();

            if (integrationName != null)
            {
                //update return status in lab 
                if (integrationName.ToLower() == "lab")
                {
                    var labItem = billingDbContext.LabRequisitions.Where(req => req.BillingTransactionItemId == billingTransactionItemId).FirstOrDefault();
                    if (labItem != null)
                    {
                        labItem.BillingStatus = billStatus;
                        labItem.ModifiedOn = modifiedDate;
                        labItem.ModifiedBy = currentUser.EmployeeId;
                        billingDbContext.Entry(labItem).Property(a => a.BillingStatus).IsModified = true;
                        billingDbContext.Entry(labItem).Property(a => a.ModifiedOn).IsModified = true;
                        billingDbContext.Entry(labItem).Property(a => a.ModifiedBy).IsModified = true;
                    }

                }
                //update return status for Radiology
                else if (integrationName.ToLower() == "radiology")
                {
                    var radioItem = billingDbContext.RadiologyImagingRequisitions.Where(req => req.BillingTransactionItemId == billingTransactionItemId).FirstOrDefault();
                    if (radioItem != null)
                    {
                        radioItem.BillingStatus = billStatus;
                        radioItem.ModifiedOn = modifiedDate;
                        radioItem.ModifiedBy = currentUser.EmployeeId;
                        billingDbContext.Entry(radioItem).Property(a => a.BillingStatus).IsModified = true;
                        billingDbContext.Entry(radioItem).Property(a => a.ModifiedOn).IsModified = true;
                        billingDbContext.Entry(radioItem).Property(a => a.ModifiedBy).IsModified = true;
                    }

                }
                //update return status for Visit
                else if (integrationName.ToLower() == "opd" || integrationName.ToLower() == "er")
                {
                    var visitItem = billingDbContext.Visit.Where(vis => vis.PatientVisitId == patientVisitId).FirstOrDefault();
                    if (visitItem != null)
                    {
                        visitItem.BillingStatus = billStatus;
                        visitItem.ModifiedOn = modifiedDate;
                        visitItem.ModifiedBy = currentUser.EmployeeId;
                        billingDbContext.Entry(visitItem).Property(a => a.BillingStatus).IsModified = true;
                        billingDbContext.Entry(visitItem).Property(a => a.ModifiedOn).IsModified = true;
                        billingDbContext.Entry(visitItem).Property(a => a.ModifiedBy).IsModified = true;
                    }
                }

                billingDbContext.AddAuditCustomField("ChangedByUserId", currentUser.EmployeeId);
                billingDbContext.AddAuditCustomField("ChangedByUserName", currentUser.UserName);

                billingDbContext.SaveChanges();
            }
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


        //updates price, quantity, bed charges etc.
        public static void UpdateBillingTransactionItems(BillingDbContext billingDbContext, BillingTransactionItemModel txnItmFromClient)
        {
            if (txnItmFromClient != null && txnItmFromClient.BillingTransactionItemId != 0)
            {

                using (var dbContextTransaction = billingDbContext.Database.BeginTransaction())
                {
                    try
                    {

                        BillingTransactionItemModel txnItmFromDb = billingDbContext.BillingTransactionItems
          .Where(itm => itm.BillingTransactionItemId == txnItmFromClient.BillingTransactionItemId).FirstOrDefault();
                        billingDbContext.BillingTransactionItems.Attach(txnItmFromDb);

                        txnItmFromDb.Price = txnItmFromClient.Price;
                        txnItmFromDb.Quantity = txnItmFromClient.Quantity;
                        txnItmFromDb.SubTotal = txnItmFromClient.SubTotal;
                        txnItmFromDb.DiscountAmount = txnItmFromClient.DiscountAmount;
                        txnItmFromDb.DiscountPercent = txnItmFromClient.DiscountPercent;
                        txnItmFromDb.TotalAmount = txnItmFromClient.TotalAmount;
                        txnItmFromDb.PerformerId = txnItmFromClient.PerformerId;
                        txnItmFromDb.PerformerName = txnItmFromClient.PerformerName;
                        txnItmFromDb.PrescriberId = txnItmFromClient.PrescriberId;
                        txnItmFromDb.DiscountPercentAgg = txnItmFromClient.DiscountPercentAgg;
                        txnItmFromDb.TaxableAmount = txnItmFromClient.TaxableAmount;
                        txnItmFromDb.NonTaxableAmount = txnItmFromClient.NonTaxableAmount;
                        txnItmFromDb.ModifiedBy = txnItmFromClient.ModifiedBy;
                        txnItmFromDb.ModifiedOn = DateTime.Now;
                        txnItmFromDb.IsAutoCalculationStop = txnItmFromClient.IsAutoCalculationStop;

                        billingDbContext.Entry(txnItmFromDb).Property(a => a.Price).IsModified = true;
                        billingDbContext.Entry(txnItmFromDb).Property(a => a.Quantity).IsModified = true;
                        billingDbContext.Entry(txnItmFromDb).Property(a => a.SubTotal).IsModified = true;
                        billingDbContext.Entry(txnItmFromDb).Property(a => a.DiscountAmount).IsModified = true;
                        billingDbContext.Entry(txnItmFromDb).Property(a => a.DiscountPercent).IsModified = true;
                        billingDbContext.Entry(txnItmFromDb).Property(a => a.DiscountPercentAgg).IsModified = true;
                        billingDbContext.Entry(txnItmFromDb).Property(a => a.TotalAmount).IsModified = true;
                        billingDbContext.Entry(txnItmFromDb).Property(a => a.PerformerId).IsModified = true;
                        billingDbContext.Entry(txnItmFromDb).Property(a => a.PrescriberId).IsModified = true;
                        billingDbContext.Entry(txnItmFromDb).Property(a => a.PerformerName).IsModified = true;
                        billingDbContext.Entry(txnItmFromDb).Property(a => a.TaxableAmount).IsModified = true;
                        billingDbContext.Entry(txnItmFromDb).Property(a => a.NonTaxableAmount).IsModified = true;
                        billingDbContext.Entry(txnItmFromDb).Property(a => a.ModifiedBy).IsModified = true;
                        billingDbContext.Entry(txnItmFromDb).Property(a => a.ModifiedOn).IsModified = true;
                        billingDbContext.Entry(txnItmFromDb).Property(a => a.IsAutoCalculationStop).IsModified = true;
                        //var billingTransact = billingDbContext.BillingTransactionItems;
                        //billingTransact.Add(txnItmFromDb);
                        //billingDbContext.BillingTransactionItems.Add(txnItmFromDb);
                        //Salakha: commented code, After update qty, date should not be update
                        ////check if bed item was edited.
                        //BillItemPrice billItem = (from item in billingDbContext.BillItemPrice
                        //                          join srvDept in billingDbContext.ServiceDepartment on item.ServiceDepartmentId equals srvDept.ServiceDepartmentId
                        //                          where item.ServiceDepartmentId == txnItmFromDb.ServiceDepartmentId
                        //                          && item.ItemId == txnItmFromClient.ItemId
                        //                          && srvDept.IntegrationName.ToLower() == "bed charges"
                        //                          select item).FirstOrDefault();
                        //if (billItem != null)
                        //{
                        //    PatientBedInfo selBedInfo = (from selBed in billingDbContext.PatientBedInfos
                        //                                 where selBed.PatientVisitId == txnItmFromClient.PatientVisitId
                        //                                 && selBed.BedFeatureId == txnItmFromClient.ItemId
                        //                                 select selBed).OrderByDescending(a=> a.PatientBedInfoId).FirstOrDefault();
                        //    if (selBedInfo != null)
                        //    {
                        //        PatientBedInfo nextBedInfo = (from nextBed in billingDbContext.PatientBedInfos
                        //                                      where nextBed.PatientVisitId == txnItmFromClient.PatientVisitId
                        //                                       && nextBed.StartedOn == selBedInfo.EndedOn
                        //                                       //sud/Yub:11Feb'19--if startedon/endedon is same then nextbed and current bed are same. adding bedinfoId != logic.
                        //                                       && selBedInfo.PatientBedInfoId != nextBed.PatientBedInfoId
                        //                                      select nextBed).FirstOrDefault();

                        //        DateTime endDate = Convert.ToDateTime(selBedInfo.StartedOn).AddDays(Convert.ToInt32(txnItmFromClient.Quantity - 1));
                        //        selBedInfo.EndedOn = endDate;
                        //        billingDbContext.Entry(selBedInfo).Property(a => a.EndedOn).IsModified = true;
                        //        if (nextBedInfo != null)
                        //        {
                        //            nextBedInfo.StartedOn = selBedInfo.EndedOn;
                        //            billingDbContext.Entry(nextBedInfo).Property(a => a.StartedOn).IsModified = true;
                        //        }
                        //    }
                        //}

                        billingDbContext.SaveChanges();

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

        //updates price, quantity, bed charges etc.
        public static void UpdateProvisionalBillingTransactionItems(BillingDbContext billingDbContext, List<BillingTransactionItemModel> txnItmsFromClient, RbacUser currentUser)
        {
            if (txnItmsFromClient != null && txnItmsFromClient.Count > 0)
            {

                using (var dbContextTransaction = billingDbContext.Database.BeginTransaction())
                {
                    try
                    {
                        txnItmsFromClient.ForEach(itm =>
                        {
                            BillingTransactionItemModel txnItmFromDb = billingDbContext.BillingTransactionItems.Where(a => a.BillingTransactionItemId == itm.BillingTransactionItemId).FirstOrDefault();
                            billingDbContext.BillingTransactionItems.Attach(txnItmFromDb);

                            txnItmFromDb.Price = itm.Price;
                            txnItmFromDb.Quantity = itm.Quantity;
                            txnItmFromDb.SubTotal = itm.SubTotal;
                            txnItmFromDb.DiscountAmount = itm.DiscountAmount;
                            txnItmFromDb.DiscountPercent = itm.DiscountPercent;
                            txnItmFromDb.TotalAmount = itm.TotalAmount;
                            txnItmFromDb.PerformerId = itm.PerformerId;
                            txnItmFromDb.PerformerName = itm.PerformerName;
                            txnItmFromDb.PrescriberId = itm.PrescriberId;
                            txnItmFromDb.DiscountPercentAgg = itm.DiscountPercentAgg;
                            txnItmFromDb.TaxableAmount = itm.TaxableAmount;
                            txnItmFromDb.NonTaxableAmount = itm.NonTaxableAmount;
                            txnItmFromDb.ModifiedBy = currentUser.EmployeeId;
                            txnItmFromDb.ModifiedOn = DateTime.Now;
                            txnItmFromDb.IsAutoCalculationStop = itm.IsAutoCalculationStop;
                        });

                        billingDbContext.SaveChanges();

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


        //Discharge should be allowed only when patient is currently in Admitted status.
        public static bool IsValidForDischarge(int patientId, int? patientVisitId, BillingDbContext billingDbContext)
        {
            bool isValidForDischarge = true;

            //condition-1: Check if patient is admitted or not in Admission table.
            AdmissionModel admissionObj = billingDbContext.Admissions.Where(adm => adm.PatientId == patientId
                                                  && adm.PatientVisitId == patientVisitId
                                                  && adm.AdmissionStatus == ENUM_AdmissionStatus.admitted).FirstOrDefault();

            //if admissionobject is not found then Patient is nomore Admitted. Hence Discharge is INVALID in such case.
            if (admissionObj == null)
            {
                isValidForDischarge = false;
            }

            return isValidForDischarge;
        }

        public static bool IsDepositAvailable(BillingDbContext contex, int patientId, double? depositUsed)
        {
            var patientAllDepositTxns = (from bill in contex.BillingDeposits
                                         where bill.PatientId == patientId && bill.IsActive == true
                                         group bill by new { bill.PatientId, bill.TransactionType } into p
                                         select new
                                         {
                                             TransactionType = p.Key.TransactionType,
                                             SumInAmount = p.Sum(a => a.InAmount),
                                             SumOutAmount = p.Sum(a => a.OutAmount)
                                         }).ToList();
            decimal totalDepositAmt, totalDepositDeductAmt, totalDepositReturnAmt, currentDepositBalance;
            currentDepositBalance = totalDepositAmt = totalDepositDeductAmt = totalDepositReturnAmt = 0;

            if (patientAllDepositTxns.Where(bil => bil.TransactionType.ToLower() == "deposit").FirstOrDefault() != null)
            {
                totalDepositAmt = patientAllDepositTxns.Where(bil => bil.TransactionType.ToLower() == "deposit").FirstOrDefault().SumInAmount;
            }
            if (patientAllDepositTxns.Where(bil => bil.TransactionType.ToLower() == "depositdeduct").FirstOrDefault() != null)
            {
                totalDepositDeductAmt = patientAllDepositTxns.Where(bil => bil.TransactionType.ToLower() == "depositdeduct").FirstOrDefault().SumOutAmount;
            }
            if (patientAllDepositTxns.Where(bil => bil.TransactionType.ToLower() == "returndeposit").FirstOrDefault() != null)
            {
                totalDepositReturnAmt = patientAllDepositTxns.Where(bil => bil.TransactionType.ToLower() == "returndeposit").FirstOrDefault().SumOutAmount;
            }
            currentDepositBalance = totalDepositAmt - totalDepositDeductAmt - totalDepositReturnAmt;

            depositUsed = depositUsed == null ? 0 : depositUsed;
            return (decimal)depositUsed <= currentDepositBalance ? true : false;
        }

        internal static void AddProvisionalRequisitions(BillingDbContext billingDbContext, string connString, BillingTransactionPostVM billingTransactionPostVM, List<BillingTransactionItemModel> billingTransactionItems, RbacUser currentUser)
        {
            if (billingTransactionPostVM.LabRequisition != null && billingTransactionPostVM.LabRequisition.Count > 0)
            {
                AddProvisionalLabRequisitions(billingDbContext, billingTransactionItems, billingTransactionPostVM.LabRequisition, currentUser.EmployeeId, connString);
            }
            if (billingTransactionPostVM.ImagingItemRequisition != null && billingTransactionPostVM.ImagingItemRequisition.Count > 0)
            {
                AddProvisionalImagingRequisition(billingDbContext, billingTransactionItems, billingTransactionPostVM.ImagingItemRequisition, currentUser.EmployeeId);
            }
        }

        private static List<ImagingRequisitionModel> AddProvisionalImagingRequisition(BillingDbContext billingDbContext, List<BillingTransactionItemModel> billingTransactionItems, List<ImagingRequisitionModel> imagingItemRequisition, int employeeId)
        {
            try
            {
                //getting the imagingtype because imagingtypename is needed in billing for getting service department
                List<RadiologyImagingTypeModel> Imgtype = billingDbContext.RadiologyImagingTypes
                                    .ToList<RadiologyImagingTypeModel>();

                var notValidForReportingItem = billingDbContext.RadiologyImagingItems.Where(i => i.IsValidForReporting == false).Select(m => m.ImagingItemId);
                if (imagingItemRequisition != null && imagingItemRequisition.Count > 0)
                {
                    foreach (var req in imagingItemRequisition)
                    {
                        req.ImagingDate = System.DateTime.Now;
                        req.CreatedOn = DateTime.Now;
                        req.CreatedBy = employeeId;
                        req.BillingStatus = ENUM_BillingStatus.provisional;
                        req.IsActive = true;
                        var billingTransactionItem = billingTransactionItems.FirstOrDefault(a => a.ServiceItemId == req.ServiceItemId);
                        if (billingTransactionItem != null)
                        {
                            req.BillingTransactionItemId = billingTransactionItem.BillingTransactionItemId;
                        }
                        if (req.PrescriberId != null && req.PrescriberId != 0)
                        {
                            var emp = billingDbContext.Employee.Where(a => a.EmployeeId == req.PrescriberId).FirstOrDefault();
                            req.PrescriberName = emp.FullName;
                        }
                        if (req.ImagingTypeId != null)
                        {
                            req.ImagingTypeName = Imgtype.Where(a => a.ImagingTypeId == req.ImagingTypeId).Select(a => a.ImagingTypeName).FirstOrDefault();
                            req.Urgency = string.IsNullOrEmpty(req.Urgency) ? "normal" : req.Urgency;
                            //req.WardName = ;
                        }
                        else
                        {
                            req.ImagingTypeId = Imgtype.Where(a => a.ImagingTypeName.ToLower() == req.ImagingTypeName.ToLower()).Select(a => a.ImagingTypeId).FirstOrDefault();
                        }
                        if (!notValidForReportingItem.Contains(req.ImagingItemId.Value))
                        {
                            billingDbContext.RadiologyImagingRequisitions.Add(req);
                        }
                    }
                    billingDbContext.SaveChanges();
                    return imagingItemRequisition;
                }
                else
                {
                    return null;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private static List<LabRequisitionModel> AddProvisionalLabRequisitions(BillingDbContext billingDbContext, List<BillingTransactionItemModel> billingTransactionItems, List<LabRequisitionModel> labRequisition, int employeeId, string connString)
        {
            try
            {
                List<LabRequisitionModel> labReqListFromClient = labRequisition;
                LabVendorsModel defaultVendor = billingDbContext.LabVendors.Where(val => val.IsDefault == true).FirstOrDefault();

                if (labReqListFromClient != null && labReqListFromClient.Count > 0)
                {
                    PatientDbContext patientContext = new PatientDbContext(connString);
                    List<LabTestModel> allLabTests = billingDbContext.LabTests.ToList();
                    int patId = labReqListFromClient[0].PatientId;
                    //get patient as querystring from client side rather than searching it from request's list.
                    PatientModel currPatient = patientContext.Patients.Where(p => p.PatientId == patId)
                        .FirstOrDefault<PatientModel>();

                    if (currPatient != null)
                    {

                        labReqListFromClient.ForEach(req =>
                        {
                            req.ResultingVendorId = defaultVendor.LabVendorId;
                            LabTestModel labTestdb = allLabTests.Where(a => a.LabTestId == req.LabTestId).FirstOrDefault<LabTestModel>();
                            //get PatientId from clientSide
                            if (labTestdb.IsValidForReporting == true)
                            {
                                req.CreatedOn = req.OrderDateTime = System.DateTime.Now;
                                req.CreatedBy = employeeId;
                                req.BillingStatus = ENUM_BillingStatus.provisional;
                                var billingTransactionItem = billingTransactionItems.FirstOrDefault(a => a.ServiceItemId == req.ServiceItemId);
                                if (billingTransactionItem != null)
                                {
                                    req.BillingTransactionItemId = billingTransactionItem.BillingTransactionItemId;
                                }
                                req.ReportTemplateId = labTestdb.ReportTemplateId;
                                req.LabTestSpecimen = null;
                                req.LabTestSpecimenSource = null;
                                req.LabTestName = labTestdb.LabTestName;
                                req.RunNumberType = labTestdb.RunNumberType;
                                //req.OrderStatus = "active";
                                req.LOINC = "LOINC Code";
                                req.BillCancelledBy = null;
                                req.BillCancelledOn = null;
                                if (req.PrescriberId != null && req.PrescriberId != 0)
                                {
                                    var emp = billingDbContext.Employee.Where(a => a.EmployeeId == req.PrescriberId).FirstOrDefault();
                                    req.PrescriberName = emp.FullName;
                                }

                                //req.PatientVisitId = visitId;//assign above visitid to this requisition.
                                if (String.IsNullOrEmpty(currPatient.MiddleName))
                                    req.PatientName = currPatient.FirstName + " " + currPatient.LastName;
                                else
                                    req.PatientName = currPatient.FirstName + " " + currPatient.MiddleName + " " + currPatient.LastName;

                                req.OrderDateTime = DateTime.Now;
                                req.IsFileUploaded = false;
                                req.IsFileUploadedToTeleMedicine = false;
                                req.IsUploadedToIMU = false;
                                billingDbContext.LabRequisitions.Add(req);
                                billingDbContext.SaveChanges();
                            }
                        });

                    }
                    return labReqListFromClient;
                }
                else
                {
                    return null;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }

}
