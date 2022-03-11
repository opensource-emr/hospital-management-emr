using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.Core.Configuration;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using System.Data.Entity;
using Microsoft.Extensions.Options;
using DanpheEMR.Utilities;
using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Caching;
using System.Xml;
using Newtonsoft.Json;
using DanpheEMR.Security;
using DanpheEMR.Controllers.Billing;
using DanpheEMR.Enums;

namespace DanpheEMR.Controllers
{

    public class BillingDepositController : CommonController
    {

        double cacheExpMinutes;//= 5;//this should come from configuration later on.
        bool realTimeRemoteSyncEnabled = false;
        string InvoiceCode = "BL"; //get this from parameters when possible.
        public BillingDepositController(IOptions<MyConfiguration> _config) : base(_config)
        {
            cacheExpMinutes = _config.Value.CacheExpirationMinutes;
            realTimeRemoteSyncEnabled = _config.Value.RealTimeRemoteSyncEnabled;
        }



        [HttpGet]
        public string Get(string reqType, int? patientId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            responseData.Status = "OK";//by default status would be OK, hence assigning at the top
            try
            {
                BillingDbContext dbContext = new BillingDbContext(connString);
                if (reqType == "deposit-list")
                {
                    var depositList = (from deposit in dbContext.BillingDeposits
                                       join patient in dbContext.Patient on deposit.PatientId equals patient.PatientId
                                       join fiscalYear in dbContext.BillingFiscalYears on deposit.FiscalYearId equals fiscalYear.FiscalYearId
                                       join employee in dbContext.Employee on deposit.CreatedBy equals employee.EmployeeId
                                       where deposit.IsActive == true
                                       // && deposit.DepositType == depositType 
                                       select new
                                       {
                                           deposit.DepositId,
                                           deposit.ReceiptNo,
                                           deposit.DepositType,
                                           deposit.Amount,
                                           deposit.Remarks,
                                           deposit.CreatedOn,
                                           deposit.PrintCount,
                                           deposit.PaymentMode,
                                           deposit.PaymentDetails,
                                           deposit.DepositBalance,
                                           FiscalYear = fiscalYear.FiscalYearFormatted,

                                           deposit.PatientId,
                                           patient.PatientCode,
                                           PatientName = patient.FirstName + " " + (string.IsNullOrEmpty(patient.MiddleName) ? "" : patient.MiddleName + " ") + patient.LastName,
                                           Gender = patient.Gender,
                                           DateOfBirth = patient.DateOfBirth,
                                           patient.PhoneNumber,
                                           BillingUser = employee.FirstName + " " + (string.IsNullOrEmpty(employee.MiddleName) ? "" : employee.MiddleName + " ") + employee.LastName,
                                           Address = patient.Address,
                                           deposit.CareOf,
                                           IsDuplicatePrint = true
                                       }).OrderByDescending(d => d.CreatedOn).ToList();
                    responseData.Status = "OK";
                    responseData.Results = depositList;
                }
                else if (reqType != null && reqType == "patAllDeposits" && patientId != null && patientId != 0)
                {
                    //var PatientDeposit = (from bill in dbContext.BillingDeposits.Include("Patient")
                    //                       join deposit in dbContext.BillingDeposits on bill.PatientId equals deposit.PatientId //Yubraj: 18th Dec '18:: To get the deposit by checking IsCurrent ans ISActive Status
                    //                       where bill.PatientId == patientId &&
                    //                       deposit.IsCurrent == true &&
                    //                       deposit.IsActive == true
                    //                       group bill by new { bill.PatientId, bill.DepositType } into p
                    //                       select new
                    //                       {
                    //                           DepositType = p.Key.DepositType,
                    //                           DepositAmount = p.Sum(a => a.Amount)

                    //                       }).ToList();

                    var PatientDeposit = (from deposit in dbContext.BillingDeposits
                                          where deposit.PatientId == patientId &&
                                          deposit.IsActive == true
                                          group deposit by new { deposit.DepositType } into p
                                          select new
                                          {
                                              DepositType = p.Key.DepositType,
                                              DepositAmount = p.Sum(a => a.Amount)
                                          }).ToList();
                    responseData.Results = PatientDeposit;
                }


            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);

        }

        [HttpPost]// POST api/values
        public string Post()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();//type 'object' since we have variable return types
            responseData.Status = "OK";//by default status would be OK, hence assigning at the top
            string ipDataString = this.ReadPostData();
            string reqType = this.ReadQueryStringData("reqType");

            try
            {
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                BillingDbContext billingDbContext = new BillingDbContext(connString);

                if (reqType == "Deposit")
                {

                    BillingDeposit deposit = DanpheJSONConvert.DeserializeObject<BillingDeposit>(ipDataString);
                    deposit.CreatedOn = System.DateTime.Now;
                    deposit.CreatedBy = currentUser.EmployeeId;
                    BillingFiscalYear fiscYear = BillingBL.GetFiscalYear(connString);
                    deposit.FiscalYearId = fiscYear.FiscalYearId;
                    if (deposit.DepositType != ENUM_BillDepositType.DepositDeduct)// "depositdeduct")
                        deposit.ReceiptNo = BillingBL.GetDepositReceiptNo(connString);
                    deposit.FiscalYear = fiscYear.FiscalYearFormatted;
                    EmployeeModel currentEmp = billingDbContext.Employee.Where(emp => emp.EmployeeId == currentUser.EmployeeId).FirstOrDefault();
                    deposit.BillingUser = currentEmp.FirstName + " " + currentEmp.LastName;
                    deposit.IsActive = true; //yubraj: 18th Dec '18

                    billingDbContext.BillingDeposits.Add(deposit);
                    billingDbContext.SaveChanges();

                    if (deposit.DepositType != ENUM_BillDepositType.DepositDeduct)
                    {
                        EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel();
                        empCashTransaction.TransactionType = deposit.DepositType;
                        empCashTransaction.ReferenceNo = deposit.DepositId;
                        if (deposit.DepositType == ENUM_BillDepositType.Deposit)
                        {
                            empCashTransaction.InAmount = deposit.Amount;
                            empCashTransaction.OutAmount = 0;
                        }                            
                        else
                        {
                            empCashTransaction.InAmount = 0;
                            empCashTransaction.OutAmount = deposit.Amount;
                        }                           

                        empCashTransaction.EmployeeId = currentUser.EmployeeId;
                        empCashTransaction.TransactionDate = DateTime.Now;
                        empCashTransaction.CounterID = deposit.CounterId;
                       

                        BillingBL.AddEmpCashTransaction(billingDbContext, empCashTransaction);
                    }



                    responseData.Status = "OK";
                    responseData.Results = deposit;//check if we need to send back the whole input object back to client.--sudarshan
                }


            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }
        [HttpPut]
        public string Put()
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            responseData.Status = "OK";
            try
            {
                BillingDbContext billingDbContext = new BillingDbContext(connString);
                string reqType = this.ReadQueryStringData("reqType");
                int depositId = ToInt(this.ReadQueryStringData("depositId"));

                if (reqType == "updateDepositPrintCount")
                {
                    BillingDeposit deposit = billingDbContext.BillingDeposits
                                            .Where(a => a.DepositId == depositId)
                                            .FirstOrDefault<BillingDeposit>();
                    if (deposit != null)
                    {
                        deposit.PrintCount = deposit.PrintCount == null || deposit.PrintCount == 0 ? 1 : deposit.PrintCount + 1;
                        deposit.PrintedOn = System.DateTime.Now; //Yubraj: 13th August'19
                        deposit.PrintedBy = currentUser.EmployeeId;
                        billingDbContext.Entry(deposit).Property(a => a.PrintCount).IsModified = true;
                    }
                    billingDbContext.SaveChanges();
                    responseData.Status = "OK";
                }



            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }
        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }



    }



}
