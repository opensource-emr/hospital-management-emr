using DanpheEMR.CommonTypes;
using DanpheEMR.Controllers.Billing;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.ReportingModels;
using DanpheEMR.Services.Billing.DTO;
using DanpheEMR.Services.BillSettings.DTOs;
using DanpheEMR.Services.Utilities.DTOs;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Core.Common.CommandTrees;
using System.Linq;

namespace DanpheEMR.Controllers
{

    public class BillingDepositController : CommonController
    {

        double cacheExpMinutes;//= 5;//this should come from configuration later on.
        bool realTimeRemoteSyncEnabled = false;
        string InvoiceCode = "BL"; //get this from parameters when possible.
        private readonly BillingDbContext _billingDbContext;
        private DanpheHTTPResponse<object> _objResponseData;
        public BillingDepositController(IOptions<MyConfiguration> _config) : base(_config)
        {
            cacheExpMinutes = _config.Value.CacheExpirationMinutes;
            realTimeRemoteSyncEnabled = _config.Value.RealTimeRemoteSyncEnabled;

            _billingDbContext = new BillingDbContext(connString);
            _objResponseData = new DanpheHTTPResponse<object>();
            _objResponseData.Status = ENUM_Danphe_HTTP_ResponseStatus.OK;//this is for default
        }

        [HttpGet]
        [Route("Deposits")]
        public IActionResult Deposits()
        {
            //if (reqType == "deposit-list")
            //{
            Func<object> func = () => (from deposit in _billingDbContext.BillingDeposits
                                       join patient in _billingDbContext.Patient on deposit.PatientId equals patient.PatientId
                                       join adm in _billingDbContext.Admissions on deposit.PatientVisitId equals adm.PatientVisitId into admittedPatient
                                       from admPat in admittedPatient.DefaultIfEmpty()
                                       join fiscalYear in _billingDbContext.BillingFiscalYears on deposit.FiscalYearId equals fiscalYear.FiscalYearId
                                       join employee in _billingDbContext.Employee on deposit.CreatedBy equals employee.EmployeeId
                                       join mun in _billingDbContext.MunicipalityModels on patient.MunicipalityId equals mun.MunicipalityId into gr
                                       from mn in gr.DefaultIfEmpty()
                                       join country in _billingDbContext.CountrySubdivisions on patient.CountrySubDivisionId equals country.CountrySubDivisionId into sub
                                       from countrySub in sub.DefaultIfEmpty()

                                       where deposit.IsActive == true
                                       select new
                                       {
                                           deposit.DepositId,
                                           deposit.ReceiptNo,
                                           deposit.TransactionType,
                                           Amount = deposit.TransactionType == ENUM_DepositTransactionType.Deposit ? deposit.InAmount : deposit.OutAmount,
                                           deposit.InAmount,
                                           deposit.OutAmount,
                                           deposit.Remarks,
                                           deposit.CreatedOn,
                                           deposit.PrintCount,
                                           deposit.PaymentMode,
                                           deposit.PaymentDetails,
                                           deposit.DepositBalance,
                                           FiscalYear = fiscalYear.FiscalYearFormatted,

                                           deposit.PatientId,
                                           patient.PatientCode,
                                           PatientName = patient.ShortName,
                                           Gender = patient.Gender,
                                           DateOfBirth = patient.DateOfBirth,
                                           patient.PhoneNumber,
                                           BillingUser = employee.FullName,// employee.FirstName + " " + (string.IsNullOrEmpty(employee.MiddleName) ? "" : employee.MiddleName + " ") + employee.LastName,
                                           Address = patient.Address + ", " + mn.MunicipalityName + ", " + countrySub.CountrySubDivisionName,
                                           deposit.CareOf,
                                           IsDuplicatePrint = true,
                                           AdmissionCase = admPat != null ? admPat.AdmissionCase : null,
                                           AdmissionDate = admPat != null ? DbFunctions.TruncateTime(admPat.AdmissionDate) : null,
                                       }).OrderByDescending(d => d.CreatedOn).ToList();


            return InvokeHttpGetFunction<object>(func);
        }



        /// <response code="200">List of PatientDeposit Model</response>
        [HttpGet]
        [Route("PatientDeposits")]
        public object PatientDeposits(int patientId)
        {
            //if (reqType != null && reqType == "patAllDeposits" && patientId != null && patientId != 0)
            //{
            Func<object> func = () => (from deposit in _billingDbContext.BillingDeposits
                                       where deposit.PatientId == patientId &&
                                       deposit.IsActive == true
                                       group deposit by new { deposit.TransactionType } into p
                                       select new
                                       {
                                           TransactionType = p.Key.TransactionType,
                                           //DepositAmount = p.Sum(a => a.Amount)
                                           SumInAmount = p.Sum(a => a.InAmount),
                                           SumOutAmount = p.Sum(a => a.OutAmount)
                                       }).ToList();
            return InvokeHttpGetFunction<object>(func);

        }

        [HttpGet]
        [Route("PatientDepositsList")]
        public IActionResult PatientDepositsList(int patientId)
        {
            Func<object> func = () => GetPatientDepositsList(patientId);
            return InvokeHttpGetFunction<object>(func);
        }

        private object GetPatientDepositsList(int patientId)
        {
            var deposits = (from dep in _billingDbContext.BillingDeposits
                            join depositHead in _billingDbContext.DepositHeadModel on dep.DepositHeadId equals depositHead.DepositHeadId
                            join pat in _billingDbContext.Patient on dep.PatientId equals pat.PatientId
                            join vis in _billingDbContext.Visit on dep.PatientVisitId equals vis.PatientVisitId
                            into grp from visit in grp.DefaultIfEmpty()
                            join emp in _billingDbContext.Employee on dep.CreatedBy equals emp.EmployeeId
                            where pat.PatientId == patientId select new BillingDepositsList_DTO 
                            {
                                DepositId = dep.DepositId,
                                HospitalNo = pat.PatientCode,
                                InPatientNo = visit != null && visit.VisitType == ENUM_VisitType.inpatient ? visit.VisitCode : "N/A",
                                ReceiptDate = dep.CreatedOn,
                                ReceiptNo = string.Concat("DP-", dep.ReceiptNo),
                                Amount = dep.TransactionType == ENUM_DepositTransactionType.Deposit ? dep.InAmount : dep.OutAmount,
                                DepositType = depositHead.DepositHeadName,
                                TransactionType = dep.TransactionType,
                                User = emp.FullName,
                                Remarks = dep.Remarks,
                                IsDepositRefundedUsingDepositReceiptNo = dep.IsDepositRefundedUsingDepositReceiptNo,
                                DepositHeadId = dep.DepositHeadId
                            }).OrderByDescending(a => a.ReceiptDate).ToList();
            return deposits;
        }

        [HttpGet]
        [Route("GetDepositHead")]
        public IActionResult GetDepositHeads()
        {
            Func<object> func = () => GetDepositHeadsDetails();
            return InvokeHttpGetFunction(func);
        }
        private object GetDepositHeadsDetails()
        {
            var DepositHeadList = (from depositHead in _billingDbContext.DepositHeadModel
                                   select new DepositHead_DTO
                                   {
                                       DepositHeadId = depositHead.DepositHeadId,
                                       DepositHeadCode = depositHead.DepositHeadCode,
                                       DepositHeadName = depositHead.DepositHeadName,
                                       Description = depositHead.Description,
                                       IsDefault = depositHead.IsDefault,
                                       IsActive = depositHead.IsActive,
                                   }).Where(r => r.DepositHeadName != null && r.DepositHeadName != "" && r.IsActive == true)
                                   .OrderByDescending(d => d.DepositHeadId).ToList();

            if (DepositHeadList == null || DepositHeadList.Count() == 0)
            {
                throw new Exception("DepositHeads Not Found.");
            }
            return DepositHeadList;
        }

        [HttpGet]
        [Route("AllDepositHeads")]
        public IActionResult AllDepositHeads()
        {
            Func<object> func = () => GetAllDepositHeads();
            return InvokeHttpGetFunction(func);
        }
        private object GetAllDepositHeads()
        {
            var DepositHeadList = (from depositHead in _billingDbContext.DepositHeadModel
                                   select new DepositHead_DTO
                                   {
                                       DepositHeadId = depositHead.DepositHeadId,
                                       DepositHeadCode = depositHead.DepositHeadCode,
                                       DepositHeadName = depositHead.DepositHeadName,
                                       Description = depositHead.Description,
                                       IsDefault = depositHead.IsDefault,
                                       IsActive = depositHead.IsActive,
                                   }).Where(r => r.DepositHeadName != null && r.DepositHeadName != "")
                                   .OrderByDescending(d => d.DepositHeadId).ToList();

            if (DepositHeadList == null || DepositHeadList.Count() == 0)
            {
                throw new Exception("DepositHeads Not Found.");
            }
            return DepositHeadList;
        }

        [HttpGet]
        [Route("OrganizationDeposits")]
        public IActionResult GetOrganizationDeposits()
        {
            Func<object> func = () => GetOrganizationDepositLists();
            return InvokeHttpGetFunction(func);
        }

        private object GetOrganizationDepositLists()
        {
            var orgDeposits = (from deposit in _billingDbContext.BillingDeposits
                               join fiscalYear in _billingDbContext.BillingFiscalYears on deposit.FiscalYearId equals fiscalYear.FiscalYearId
                               join org in _billingDbContext.CreditOrganization on deposit.CreditOrganizationId equals org.OrganizationId
                               join employee in _billingDbContext.Employee on deposit.CreatedBy equals employee.EmployeeId
                               where deposit.IsActive == true && deposit.OrganizationOrPatient == ENUM_Deposit_OrganizationOrPatient.Organization
                               select new OrganizationDepositList_DTO
                               {
                                   DepositId = deposit.DepositId,
                                   DepositReceiptNo = deposit.ReceiptNo,
                                   TransactionType = deposit.TransactionType,
                                   Amount = deposit.TransactionType == ENUM_DepositTransactionType.Deposit ? deposit.InAmount : deposit.OutAmount,
                                   CreditOrganization = org.OrganizationName,
                                   Remarks = deposit.Remarks,
                                   ReceiptDate = deposit.CreatedOn,
                                   PrintCount = deposit.PrintCount,
                                   DepositBalance = deposit.DepositBalance,
                                   FiscalYear = fiscalYear.FiscalYearFormatted,
                                   BillingUser = employee.FullName,
                                   Representative = deposit.CareOf
                               }).OrderByDescending(d => d.ReceiptDate).ToList();
            return orgDeposits;
        }

        [HttpPost]
        [Route("NewDeposit")]
        public ActionResult NewDeposit()
        {
            //if (reqType == "Deposit")
            //{

            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string ipDataString = this.ReadPostData();

            Func<object> func = () => SaveDeposit(currentUser, ipDataString);
            return InvokeHttpPostFunction<object>(func);

        }

        private object SaveDeposit(RbacUser currentUser, string ipDataString)
        {
            BillingDepositModel deposit = DanpheJSONConvert.DeserializeObject<BillingDepositModel>(ipDataString);
            using (var depositTransactionScope = _billingDbContext.Database.BeginTransaction())
            {
                try
                {
                    if (IsValidToReturnDeposit(_billingDbContext, deposit))
                    {

                        deposit.CreatedOn = System.DateTime.Now;
                        deposit.CreatedBy = currentUser.EmployeeId;
                        BillingFiscalYear fiscYear = BillingBL.GetFiscalYear(connString);
                        deposit.FiscalYearId = fiscYear.FiscalYearId;
                        if (deposit.TransactionType != ENUM_DepositTransactionType.DepositDeduct)// "depositdeduct")
                            deposit.ReceiptNo = BillingBL.GetDepositReceiptNo(connString);
                        deposit.FiscalYear = fiscYear.FiscalYearFormatted;
                        EmployeeModel currentEmp = _billingDbContext.Employee.Where(emp => emp.EmployeeId == currentUser.EmployeeId).FirstOrDefault();
                        deposit.BillingUser = currentEmp.FirstName + " " + currentEmp.LastName;
                        deposit.IsActive = true; //yubraj: 18th Dec '18
                        _billingDbContext.BillingDeposits.Add(deposit);
                        _billingDbContext.SaveChanges();

                        if (deposit.TransactionType != ENUM_DepositTransactionType.DepositDeduct)
                        {
                            List<EmpCashTransactionModel> empCashTransactionModel = new List<EmpCashTransactionModel>();
                            for (int i = 0; i < deposit.empCashTransactionModel.Count; i++)
                            {
                                EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel();
                                empCashTransaction.TransactionType = deposit.TransactionType;
                                empCashTransaction.ReferenceNo = deposit.DepositId;
                                if (deposit.TransactionType == ENUM_DepositTransactionType.Deposit)
                                {
                                    empCashTransaction.InAmount = deposit.empCashTransactionModel[i].InAmount;
                                    empCashTransaction.OutAmount = 0;
                                }
                                else
                                {
                                    empCashTransaction.InAmount = 0;
                                    empCashTransaction.OutAmount = deposit.empCashTransactionModel[i].InAmount;
                                }
                                empCashTransaction.PaymentModeSubCategoryId = deposit.empCashTransactionModel[i].PaymentModeSubCategoryId;
                                empCashTransaction.PatientId = deposit.PatientId;
                                empCashTransaction.ModuleName = deposit.empCashTransactionModel[i].ModuleName;
                                empCashTransaction.EmployeeId = currentUser.EmployeeId;
                                empCashTransaction.TransactionDate = DateTime.Now;
                                empCashTransaction.CounterID = deposit.CounterId;
                                empCashTransactionModel.Add(empCashTransaction);
                            }

                            BillingBL.AddEmpCashtransactionForBilling(_billingDbContext, empCashTransactionModel);

                        }

                        if (deposit.SelectedDepositId != null || deposit.SelectedDepositId > 0)
                        {
                            BillingDepositModel depositModel = _billingDbContext.BillingDeposits.FirstOrDefault(a => a.DepositId == deposit.SelectedDepositId);
                            if (depositModel != null)
                            {
                                depositModel.IsDepositRefundedUsingDepositReceiptNo = true;
                                depositModel.ModifiedBy = currentUser.EmployeeId;
                                depositModel.ModifiedOn = DateTime.Now;

                                _billingDbContext.Entry(depositModel).Property(p => p.IsDepositRefundedUsingDepositReceiptNo).IsModified = true;
                                _billingDbContext.Entry(depositModel).Property(p => p.ModifiedBy).IsModified = true;
                                _billingDbContext.Entry(depositModel).Property(p => p.ModifiedOn).IsModified = true;

                                _billingDbContext.SaveChanges();
                            }

                        }

                        depositTransactionScope.Commit();
                    }
                    else
                    {
                        throw new Exception("Return Deposit Amount is Invalid");
                    }
                }
                catch (Exception ex)
                {
                    depositTransactionScope.Rollback();
                    throw new Exception(ex.Message + " exception details:" + ex.ToString());
                }
                return deposit;
            }

        }

        private Boolean IsValidToReturnDeposit(BillingDbContext contex, BillingDepositModel deposit)
        {
            if (deposit.TransactionType != ENUM_DepositTransactionType.ReturnDeposit)
            {
                return true;
            }
            var patientAllDepositTxns = (from bill in contex.BillingDeposits
                                         where bill.PatientId == deposit.PatientId && bill.IsActive == true
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
            return deposit.OutAmount <= currentDepositBalance ? true : false;
        }


        [HttpPut]
        [Route("PrintCount")]
        public ActionResult UpdatePrintCount(int depositId)
        {
            //if (reqType == "updateDepositPrintCount")
            //{
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<string> func = () => UpateDepositPrintCount(depositId, currentUser);
            return InvokeHttpPutFunction(func);
        }

        private string UpateDepositPrintCount(int depositId, RbacUser currentUser)
        {
            try
            {
                BillingDepositModel deposit = _billingDbContext.BillingDeposits
                                        .Where(a => a.DepositId == depositId)
                                        .FirstOrDefault<BillingDepositModel>();
                if (deposit != null)
                {
                    deposit.PrintCount = deposit.PrintCount == null || deposit.PrintCount == 0 ? 1 : deposit.PrintCount + 1;
                    deposit.PrintedOn = System.DateTime.Now; //Yubraj: 13th August'19
                    deposit.PrintedBy = currentUser.EmployeeId;
                    _billingDbContext.Entry(deposit).Property(a => a.PrintCount).IsModified = true;
                    _billingDbContext.SaveChanges();
                    return "Deposit print Count updated successfully.";
                }
                else
                {
                    throw new Exception("Deposit Id is Is Invalid");
                }

            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
    }



}
