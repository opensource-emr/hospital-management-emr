using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.PatientModels;
using DanpheEMR.ServerModel.Utilities;
using DanpheEMR.Services.Utilities.DTOs;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;

namespace DanpheEMR.Services.Utilities
{
    public class UtilitiesService : IUtilitiesService
    {
        public object SaveSchemeRefundTransaction(RbacUser currentUser, SchemeRefund_DTO schemeRefundDTO, UtilitiesDbContext _utilitiesDbContext)
        {
            using (var dbContextTransaction = _utilitiesDbContext.Database.BeginTransaction())
            {
                try
                {
                    if (schemeRefundDTO != null)
                    {
                        int currentFyId =
                            _utilitiesDbContext.FiscicalYear.Where(f => f.StartYear <= DateTime.Today && f.EndYear >= DateTime.Today)
                       .Select(f => f.FiscalYearId).FirstOrDefault();

                        //6;Add logic to get current FyId from BIL_CFG_FiscalYear table.

                        int maxReceiptNo = _utilitiesDbContext.SchemeRefunds.Where(s => s.FiscalYearId == currentFyId)
                                            .Select(s => s.ReceiptNo).DefaultIfEmpty(0).Max();

                        int newReceiptNo = maxReceiptNo + 1;

                        SchemeRefundModel schmeRefundEntity = new SchemeRefundModel();
                        schmeRefundEntity.SchemeId = schemeRefundDTO.SchemeId;
                        schmeRefundEntity.PatientId = schemeRefundDTO.PatientId;
                        schmeRefundEntity.InpatientNumber = schemeRefundDTO.InpatientNumber;
                        schmeRefundEntity.RefundAmount = schemeRefundDTO.RefundAmount;
                        schmeRefundEntity.Remarks = schemeRefundDTO.Remarks;
                        schmeRefundEntity.CreatedBy = currentUser.EmployeeId;
                        schmeRefundEntity.CreatedOn = DateTime.Now;
                        schmeRefundEntity.IsActive = true;
                        schmeRefundEntity.FiscalYearId = currentFyId;
                        schmeRefundEntity.ReceiptNo = newReceiptNo;
                        schmeRefundEntity.CounterId = schemeRefundDTO.CounterId;
                        _utilitiesDbContext.SchemeRefunds.Add(schmeRefundEntity);
                        _utilitiesDbContext.SaveChanges();

                        var schemeName = _utilitiesDbContext.BillingSchemeModels.FirstOrDefault(a => a.SchemeId == schmeRefundEntity.SchemeId);
                        //We need to add SchemeRefund Transaction to Employee Cash Transaction also.
                        EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel();
                        empCashTransaction.TransactionType = ENUM_EMP_CashTransactinType.SchemeRefund;
                        empCashTransaction.ReferenceNo = schmeRefundEntity.SchemeRefundId;
                        empCashTransaction.InAmount = 0;
                        empCashTransaction.OutAmount = (double)schmeRefundEntity.RefundAmount;
                        empCashTransaction.EmployeeId = schmeRefundEntity.CreatedBy;
                        empCashTransaction.TransactionDate = schmeRefundEntity.CreatedOn;
                        empCashTransaction.CounterID = schmeRefundEntity.CounterId;
                        empCashTransaction.PaymentModeSubCategoryId = GetCashPaymentModeSubCategoryId(_utilitiesDbContext);
                        empCashTransaction.PatientId = schmeRefundEntity.PatientId;
                        empCashTransaction.ModuleName = ENUM_ModuleNames.Billing;
                        empCashTransaction.Remarks = $"Scheme Refunded against ${schemeName.SchemeName}";
                        _utilitiesDbContext.EmpCashTransactionModels.Add(empCashTransaction);
                        _utilitiesDbContext.SaveChanges();

                    }
                    dbContextTransaction.Commit();
                    return schemeRefundDTO;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        private int GetCashPaymentModeSubCategoryId(UtilitiesDbContext _utilitiesDbContext)
        {
            var paymentModeSubCategoryId = 0;
            var paymentModes = _utilitiesDbContext.PaymentModes.Where(a => a.PaymentSubCategoryName.ToLower() == "cash");
            if (paymentModes != null)
            {
                paymentModeSubCategoryId = paymentModes.Select(a => a.PaymentSubCategoryId).FirstOrDefault();
            }
            return paymentModeSubCategoryId;
        }

        public object GetSchemeRefundTransaction(UtilitiesDbContext utilitiesDbContext, DateTime fromDate, DateTime toDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@FromDate", fromDate),
                        new SqlParameter("@ToDate", toDate),
                    };
            DataTable dt = DALFunctions.GetDataTableFromStoredProc("[SP_UTL_SchemeRefundTransactions]", paramList, utilitiesDbContext);
            return dt;
        }
        public object GetSchemeRefundById(UtilitiesDbContext utilitiesDbContext, int receiptNo)
        {
             var refundScheme = (from refund in utilitiesDbContext.SchemeRefunds
                                  join sch in utilitiesDbContext.BillingSchemeModels on refund.SchemeId equals sch.SchemeId
                                  join pat in utilitiesDbContext.Patient on refund.PatientId equals pat.PatientId
                                  join fis in utilitiesDbContext.FiscicalYear on refund.FiscalYearId equals fis.FiscalYearId
                                 where refund.ReceiptNo == receiptNo
                                 select new 
                                  {
                                      PatientName = pat.ShortName,
                                      CreatedOn = refund.CreatedOn,
                                      HospitalNo = pat.PatientCode,
                                      Address = pat.Address,
                                      Amount = refund.RefundAmount,
                                      Contact = pat.PhoneNumber,
                                      SchemeName = sch.SchemeName,
                                      Remarks = refund.Remarks,
                                      ReceiptNo = refund.ReceiptNo,
                                      Paymentmode = sch.DefaultPaymentMode,
                                      FiscalYear = fis.FiscalYearName,
                                  }).FirstOrDefault();
              return refundScheme;

        }

            public object GetPatientSchemeRefunds(UtilitiesDbContext utilitiesDbContext, int patientId)
        {
            var refundDetails = (from refund in utilitiesDbContext.SchemeRefunds
                                 join emp in utilitiesDbContext.EmployeeModels on refund.CreatedBy equals emp.EmployeeId
                                 join scheme in utilitiesDbContext.BillingSchemeModels on refund.SchemeId equals scheme.SchemeId
                                 where refund.PatientId == patientId
                                 select new PatientSchemeRefundsList_DTO
                                 {
                                     RefundedDate = refund.CreatedOn,
                                     SchemeName = scheme.SchemeName,
                                     RefundAmount = refund.RefundAmount,
                                     FullName = emp.FullName,
                                     Remarks = refund.Remarks
                                 }).OrderByDescending(refund => refund.RefundedDate).ToList();
            return refundDetails;
        }
        public object SaveVisitSchemeChange(RbacUser currentUser, VisitSchemeChangeHistory_DTO visitSchemeChangeHistory_DTO, UtilitiesDbContext _utilitiesDbContext)
        {
            using (var dbContextTransaction = _utilitiesDbContext.Database.BeginTransaction())
            {
                try
                {

                    var priceVsScheme = _utilitiesDbContext.MapPriceCategoryScheme.FirstOrDefault(m => m.PriceCategoryId == visitSchemeChangeHistory_DTO.NewPriceCategoryId && m.SchemeId == visitSchemeChangeHistory_DTO.NewSchemeId);
                    if (priceVsScheme == null)
                    {
                        throw new Exception("Selected Price Category is not available for Selected Scheme");
                    }


                    if (visitSchemeChangeHistory_DTO != null)
                    {
                        VisitSchemeChangeHistoryModel changeVisitSchemeEntity = new VisitSchemeChangeHistoryModel();
                        changeVisitSchemeEntity.ChangeAction = ENUM_VisitSchemeChangeAction.ManualUpdate;
                        changeVisitSchemeEntity.PatientId = visitSchemeChangeHistory_DTO.PatientId;
                        changeVisitSchemeEntity.PatientVisitId = visitSchemeChangeHistory_DTO.PatientVisitId;
                        changeVisitSchemeEntity.OldSchemeId = visitSchemeChangeHistory_DTO.OldSchemeId;
                        changeVisitSchemeEntity.OldPriceCategoryId = visitSchemeChangeHistory_DTO.OldPriceCategoryId;
                        changeVisitSchemeEntity.NewSchemeId = visitSchemeChangeHistory_DTO.NewSchemeId;
                        changeVisitSchemeEntity.NewPriceCategoryId = visitSchemeChangeHistory_DTO.NewPriceCategoryId;
                        changeVisitSchemeEntity.Remarks = visitSchemeChangeHistory_DTO.Remarks;
                        changeVisitSchemeEntity.CreatedBy = currentUser.EmployeeId;
                        changeVisitSchemeEntity.CreatedOn = DateTime.Now;
                        _utilitiesDbContext.VisitSchemeChangeHistory.Add(changeVisitSchemeEntity);
                        _utilitiesDbContext.SaveChanges();

                        var visit = _utilitiesDbContext.PatientVisitModel.FirstOrDefault(v => v.PatientVisitId == visitSchemeChangeHistory_DTO.PatientVisitId);
                        if (visit != null)
                        {
                            visit.SchemeId = visitSchemeChangeHistory_DTO.NewSchemeId;
                            visit.PriceCategoryId = visitSchemeChangeHistory_DTO.NewPriceCategoryId;
                            visit.ModifiedBy = currentUser.EmployeeId;
                            visit.ModifiedOn = DateTime.Now;
                            visit.IsActive = true;
                            _utilitiesDbContext.SaveChanges();
                        }

                        if (visitSchemeChangeHistory_DTO.PatientVisitId == null)
                        {
                            throw new Exception("Latest Visit ID is null. Data cannot be saved.");
                        }
                        else
                        {
                            //Krishna, 24thJune'23, Logic below works as: 
                            /*
                                Step 1: Check if New Scheme and old Scheme are same?
                                Step 2: Check if New Scheme is already mapped with the patient?
                                Step 3: If New Scheme and Old scheme are same, No need to update PatientSchemeMap
                                Step 4: If New Scheme is already mapped with Patient,  We need to update that row wit latest PatientVisitId
                                Step 5: If New Scheme is not mapped with Patient, then we need add a new row.

                                NOTE: We should avoid change of Scheme and PriceCategory for Schemes that handles Limit, CoPay, etc.
                             */
                            var existingPatientScheme = _utilitiesDbContext.PatientSchemeMapModel.FirstOrDefault(p => p.PatientId == visitSchemeChangeHistory_DTO.PatientId && p.SchemeId == visitSchemeChangeHistory_DTO.NewSchemeId);

                            if(visitSchemeChangeHistory_DTO.NewSchemeId != visitSchemeChangeHistory_DTO.OldSchemeId)
                            {
                                if(existingPatientScheme == null)
                                {
                                    PatientSchemeMapModel patientSchemeMapModel = new PatientSchemeMapModel();
                                    {
                                        patientSchemeMapModel.PatientId = visitSchemeChangeHistory_DTO.PatientId;
                                        patientSchemeMapModel.SchemeId = visitSchemeChangeHistory_DTO.NewSchemeId;
                                        patientSchemeMapModel.PatientCode = visitSchemeChangeHistory_DTO.PatientCode;
                                        patientSchemeMapModel.PolicyNo = visitSchemeChangeHistory_DTO.PolicyNo;
                                        patientSchemeMapModel.LatestClaimCode = visitSchemeChangeHistory_DTO.LatestClaimCode;
                                        patientSchemeMapModel.CreatedBy = currentUser.EmployeeId;
                                        patientSchemeMapModel.CreatedOn = DateTime.Now;
                                        patientSchemeMapModel.IsActive = true;
                                        patientSchemeMapModel.LatestPatientVisitId = visitSchemeChangeHistory_DTO.PatientVisitId;
                                        patientSchemeMapModel.PriceCategoryId = visitSchemeChangeHistory_DTO.NewPriceCategoryId;
                                    }
                                    _utilitiesDbContext.PatientSchemeMapModel.Add(patientSchemeMapModel);

                                }
                                else
                                {
                                    existingPatientScheme.LatestPatientVisitId = visitSchemeChangeHistory_DTO.PatientVisitId;
                                    existingPatientScheme.ModifiedBy = currentUser.EmployeeId;
                                    existingPatientScheme.ModifiedOn = DateTime.Now;

                                }

                            }
                            _utilitiesDbContext.SaveChanges();
                        }

                    }
                    dbContextTransaction.Commit();
                    return visitSchemeChangeHistory_DTO;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }
        public object SaveOrganizationDeposit(RbacUser currentUser, OrganizationDeposit_DTO organizationDeposit_DTO, UtilitiesDbContext _utilitiesDbContext)
        {
            if (organizationDeposit_DTO == null)
            {
                throw new ArgumentNullException("Null cannot be deserialized to any Entity!");
            }
            else
            {
                using (var dbContextTransaction = _utilitiesDbContext.Database.BeginTransaction())
                {
                    try
                    {
                        int currentFyId = _utilitiesDbContext.FiscicalYear
                                                             .Where(f => f.StartYear <= DateTime.Today && f.EndYear >= DateTime.Today)
                                                             .Select(f => f.FiscalYearId)
                                                             .FirstOrDefault();

                        int maxReceiptNo = (int)_utilitiesDbContext.BillingDepositModel
                                                              .Where(s => s.FiscalYearId == currentFyId)
                                                              .Select(s => s.ReceiptNo)
                                                              .DefaultIfEmpty(0)
                                                              .Max();

                        int newReceiptNo = maxReceiptNo + 1;

                        BillingDepositModel billingDeposit = new BillingDepositModel();

                        if (organizationDeposit_DTO.OrganizationOrPatient == ENUM_Deposit_OrganizationOrPatient.Organization)
                        {
                            billingDeposit.CreditOrganizationId = organizationDeposit_DTO.CreditOrganizationId;
                            billingDeposit.OrganizationOrPatient = organizationDeposit_DTO.OrganizationOrPatient;
                        }
                        else if (organizationDeposit_DTO.OrganizationOrPatient == ENUM_Deposit_OrganizationOrPatient.Patient)
                        {
                            billingDeposit.PatientId = organizationDeposit_DTO.PatientId ?? null;
                        }


                        billingDeposit.TransactionType = organizationDeposit_DTO.TransactionType;
                        billingDeposit.DepositHeadId = organizationDeposit_DTO.DepositHeadId;
                        billingDeposit.CareOf = organizationDeposit_DTO.CareOf;
                        billingDeposit.InAmount = organizationDeposit_DTO.InAmount;
                        billingDeposit.OutAmount = organizationDeposit_DTO.OutAmount;
                        billingDeposit.DepositBalance = organizationDeposit_DTO.DepositBalance;
                        billingDeposit.PaymentMode = organizationDeposit_DTO.PaymentMode;
                        billingDeposit.PaymentDetails = organizationDeposit_DTO.PaymentDetails;
                        billingDeposit.ModuleName = organizationDeposit_DTO.ModuleName;
                        billingDeposit.Remarks = organizationDeposit_DTO.Remarks;
                        billingDeposit.CreatedBy = currentUser.EmployeeId;
                        billingDeposit.CreatedOn = DateTime.Now;
                        billingDeposit.IsActive = true;
                        billingDeposit.FiscalYearId = currentFyId;
                        billingDeposit.ReceiptNo = newReceiptNo;
                        _utilitiesDbContext.BillingDepositModel.Add(billingDeposit);
                        _utilitiesDbContext.SaveChanges();

                        //Save EmployeeCashtransaction
                        List<EmpCashTransactionModel> empCashTransactionModels= new List<EmpCashTransactionModel>();
                        for(int i = 0; i < organizationDeposit_DTO.empCashTransactionModel.Count; i++)
                        {
                            EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel()
                            {
                            TransactionType = billingDeposit.TransactionType == ENUM_DepositTransactionType.Deposit ? ENUM_EMP_CashTransactinType.Deposit : ENUM_EMP_CashTransactinType.ReturnDeposit,
                            ReferenceNo = billingDeposit.DepositId,
                            InAmount = billingDeposit.TransactionType == ENUM_DepositTransactionType.Deposit ? organizationDeposit_DTO.empCashTransactionModel[i].InAmount : 0,
                            OutAmount = billingDeposit.TransactionType == ENUM_DepositTransactionType.ReturnDeposit ? organizationDeposit_DTO.empCashTransactionModel[i].InAmount : 0,
                            PaymentModeSubCategoryId = organizationDeposit_DTO.empCashTransactionModel[i].PaymentModeSubCategoryId,
                            PatientId = null,//Bibek, 30thApril'23,keeping null for PatientId as we are adding Deposit for Organization
                            ModuleName = billingDeposit.ModuleName,
                            EmployeeId = currentUser.EmployeeId,
                            TransactionDate = DateTime.Now,
                            CounterID = billingDeposit.CounterId,
                            IsActive = true,
                            };
                            empCashTransactionModels.Add(empCashTransaction);
                        }
                        _utilitiesDbContext.EmpCashTransactionModels.AddRange(empCashTransactionModels);
                        _utilitiesDbContext.SaveChanges();

                        dbContextTransaction.Commit();
                        return billingDeposit.DepositId;
                    }

                    catch (Exception ex)
                    {
                        dbContextTransaction.Rollback();
                        throw ex;
                    }
                }
            }
        }
        public decimal GetOrganizationDepositBalance(UtilitiesDbContext _utilitiesDbContext, int OrganizationId)
        {
            var OrganizationsDeposits = _utilitiesDbContext.BillingDepositModel.Where(a => a.CreditOrganizationId == OrganizationId && a.OrganizationOrPatient == ENUM_Deposit_OrganizationOrPatient.Organization)
                .GroupBy(a => new { a.CreditOrganizationId, a.TransactionType })
                .Select(a => new
                {
                    TransactionType = a.Key.TransactionType,
                    SumInAmount = a.Sum(p => p.InAmount),
                    SumOutAmount = a.Sum(p => p.OutAmount)

                }).ToList();
            decimal totalDepositAmt, totalDepositDeductAmt, totalDepositReturnAmt, currentDepositBalance;
            currentDepositBalance = totalDepositAmt = totalDepositDeductAmt = totalDepositReturnAmt = 0;

            if (OrganizationsDeposits.Where(bil => bil.TransactionType == ENUM_DepositTransactionType.Deposit).FirstOrDefault() != null)
            {
                totalDepositAmt = OrganizationsDeposits.Where(bil => bil.TransactionType == ENUM_DepositTransactionType.Deposit).FirstOrDefault().SumInAmount;
            }
            if (OrganizationsDeposits.Where(bil => bil.TransactionType == ENUM_DepositTransactionType.DepositDeduct).FirstOrDefault() != null)
            {
                totalDepositDeductAmt = OrganizationsDeposits.Where(bil => bil.TransactionType == ENUM_DepositTransactionType.DepositDeduct).FirstOrDefault().SumOutAmount;
            }
            if (OrganizationsDeposits.Where(bil => bil.TransactionType == ENUM_DepositTransactionType.ReturnDeposit).FirstOrDefault() != null)
            {
                totalDepositReturnAmt = OrganizationsDeposits.Where(bil => bil.TransactionType == ENUM_DepositTransactionType.ReturnDeposit).FirstOrDefault().SumOutAmount;
            }
            //below is the formula to calculate deposit balance.
            currentDepositBalance = totalDepositAmt - totalDepositDeductAmt - totalDepositReturnAmt;
            return currentDepositBalance;
        }
        public object GetOrganizationDepositDetails(UtilitiesDbContext _utilitiesDbContext, int DepositId)
        {
           
            var organizationDeposit=(from billDep in _utilitiesDbContext.BillingDepositModel
                                     join org in _utilitiesDbContext.CreditOrganizationModels on billDep.CreditOrganizationId equals org.OrganizationId
                                     where billDep.DepositId == DepositId && billDep.OrganizationOrPatient == ENUM_Deposit_OrganizationOrPatient.Organization
                                     select new OrganizationDeposit_DTO
                                     {
                                         
                                         CareOf = billDep.CareOf,
                                         TransactionType=billDep.TransactionType,
                                         DepositBalance = billDep.DepositBalance,
                                         InAmount = billDep.InAmount,
                                         OutAmount = billDep.OutAmount,
                                         Remarks = billDep.Remarks,
                                         PaymentMode = billDep.PaymentMode,
                                         PaymentDetails = billDep.PaymentDetails,
                                         ModuleName = billDep.ModuleName,
                                         CreditOrganizationName = org.OrganizationName,
                                       
                                     }).FirstOrDefault();

            return organizationDeposit;
        }
    }
}
