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
using System.Data;
using DanpheEMR.Enums;

namespace DanpheEMR.Controllers
{

    public class BillInsuranceController : CommonController
    {

        double cacheExpMinutes;//= 5;//this should come from configuration later on.

        public BillInsuranceController(IOptions<MyConfiguration> _config) : base(_config)
        {
            cacheExpMinutes = _config.Value.CacheExpirationMinutes;
        }



        [HttpGet]
        public string Get(string reqType,
            string searchText,
            DateTime toDate,
            DateTime fromDate)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            string ipDataString = this.ReadPostData();
            responseData.Status = "OK";//by default status would be OK, hence assigning at the top
            try
            {
                BillingDbContext billingDbContext = new BillingDbContext(connString);
                if (reqType == "insurance-patients-list")
                {
                    PatientDbContext patDbContext = new PatientDbContext(connString);

                    var allPats = (from pat in patDbContext.Patients
                                   join ins in patDbContext.Insurances on pat.PatientId equals ins.PatientId

                                   join country in patDbContext.CountrySubdivisions
                                   on pat.CountrySubDivisionId equals country.CountrySubDivisionId

                                   where pat.IsActive == true
                                   select new
                                   {
                                       PatientId = pat.PatientId,
                                       PatientCode = pat.PatientCode,
                                       ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                       FirstName = pat.FirstName,
                                       LastName = pat.LastName,
                                       MiddleName = pat.MiddleName,
                                       PatientNameLocal = pat.PatientNameLocal,
                                       Age = pat.Age,
                                       Gender = pat.Gender,
                                       PhoneNumber = pat.PhoneNumber,
                                       DateOfBirth = pat.DateOfBirth,
                                       Address = pat.Address,
                                       IsOutdoorPat = pat.IsOutdoorPat,
                                       CreatedOn = pat.CreatedOn,
                                       CountryId = pat.CountryId,
                                       CountrySubDivisionId = pat.CountrySubDivisionId,
                                       CountrySubDivisionName = country.CountrySubDivisionName,
                                       pat.BloodGroup,
                                       CurrentBalance = ins.CurrentBalance,
                                       InsuranceProviderId = ins.InsuranceProviderId,
                                       IMISCode = ins.IMISCode,
                                       PatientInsuranceInfoId = ins.PatientInsuranceInfoId
                                   }).OrderByDescending(p => p.PatientInsuranceInfoId).ToList();

                    responseData.Results = allPats;

                }

                else if (reqType == "insurance-billing-items")
                {
                    var itemList = (from item in billingDbContext.BillItemPrice
                                    join srv in billingDbContext.ServiceDepartment on item.ServiceDepartmentId equals srv.ServiceDepartmentId
                                    where item.IsActive == true && item.InsuranceApplicable == true
                                    select new
                                    {
                                        BillItemPriceId = item.BillItemPriceId,
                                        ServiceDepartmentId = srv.ServiceDepartmentId,
                                        ServiceDepartmentName = srv.ServiceDepartmentName,
                                        ServiceDepartmentShortName = srv.ServiceDepartmentShortName,
                                        SrvDeptIntegrationName = srv.IntegrationName,
                                        ItemId = item.ItemId,
                                        ItemName = item.ItemName,
                                        ProcedureCode = item.ProcedureCode,
                                        Price = item.GovtInsurancePrice,
                                        TaxApplicable = item.TaxApplicable,
                                        DiscountApplicable = item.DiscountApplicable,
                                        Description = item.Description,
                                        IsDoctorMandatory = item.IsDoctorMandatory,
                                        item.IsInsurancePackage,
                                        IsErLabApplicable = item.IsErLabApplicable,//pratik:21Feb'21--For LPH
                                    }).ToList().OrderBy(a => a.ServiceDepartmentId).ThenBy(a => a.ItemId);
                    responseData.Status = "OK";
                    responseData.Results = itemList;
                }

                else if (reqType == "unclaimed-insurance-bills")
                {
                    var unclaimedInvoicesList = (from txn in billingDbContext.BillingTransactions
                                                 join pat in billingDbContext.Patient on txn.PatientId equals pat.PatientId
                                                 join fis in billingDbContext.BillingFiscalYears on txn.FiscalYearId equals fis.FiscalYearId
                                                 where txn.IsInsuranceBilling == true && txn.IsInsuranceClaimed == false && txn.ReturnStatus == false
                                                 && (DbFunctions.TruncateTime(txn.CreatedOn) >= fromDate.Date && DbFunctions.TruncateTime(txn.CreatedOn) <= toDate.Date)

                                                 select new
                                                 {
                                                     BillingTransactionId = txn.BillingTransactionId,
                                                     BillingDate = txn.CreatedOn,
                                                     InvoiceNo = txn.InvoiceNo,
                                                     PatientFName = pat.FirstName,
                                                     PatientMName = pat.MiddleName,
                                                     PatientLName = pat.LastName,
                                                     TotalAmount = txn.TotalAmount,
                                                     FiscalYear = fis.FiscalYearName,
                                                     IsInsuranceClaimed = txn.IsInsuranceClaimed
                                                     //FiscalYearId= txn.FiscalYearId
                                                 }).OrderByDescending(invoice => invoice.BillingDate).ToList();
                    responseData.Status = "OK";
                    responseData.Results = unclaimedInvoicesList;
                }

                else if (reqType == "insurance-packages")
                {
                    List<BillingPackageModel> packageList = billingDbContext.BillingPackages.Where(a => a.IsActive == true && a.InsuranceApplicable == true)
                        .OrderBy(a => a.BillingPackageName).ToList();
                    if (packageList.Count > 0)
                    {
                        foreach (var package in packageList)
                        {
                            string jsonValues = "[]";//by default it'll be empty json-array.

                            if (!string.IsNullOrEmpty(package.BillingItemsXML))
                            {
                                XmlDocument doc = new XmlDocument();
                                doc.LoadXml(package.BillingItemsXML);
                                jsonValues = JsonConvert.SerializeXmlNode(doc, Newtonsoft.Json.Formatting.None, true);
                            }

                            package.BillingItemsXML = jsonValues;

                        }
                    }
                    responseData.Status = "OK";
                    responseData.Results = packageList;
                }

                //Yubraj: 21st July '19 -- Getting All Patient which does not have Insurance...
                else if (reqType == "all-patients-for-insurance")
                {
                    PatientDbContext patDbContext = new PatientDbContext(connString);

                    if (string.IsNullOrEmpty(searchText))
                    {
                        responseData.Results = new List<string>();//send empty string.
                    }
                    else
                    {

                        var allPats = (from pat in patDbContext.Patients
                                       join country in patDbContext.CountrySubdivisions
                                             on pat.CountrySubDivisionId equals country.CountrySubDivisionId

                                       //left join insurance information. 
                                       from ins in patDbContext.Insurances.Where(a => a.PatientId == pat.PatientId).DefaultIfEmpty()
                                       where pat.IsActive == true && (pat.IsOutdoorPat == null || pat.IsOutdoorPat == false)//exclude Inactive and OutDoor patients.

                                        && ((pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName + pat.PatientCode + pat.PhoneNumber).Contains(searchText))
                                       select new
                                       {
                                           PatientId = pat.PatientId,
                                           PatientCode = pat.PatientCode,
                                           ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                           FirstName = pat.FirstName,
                                           LastName = pat.LastName,
                                           MiddleName = pat.MiddleName,
                                           Age = pat.Age,
                                           Gender = pat.Gender,
                                           PhoneNumber = pat.PhoneNumber,
                                           DateOfBirth = pat.DateOfBirth,
                                           Address = pat.Address,
                                           CreatedOn = pat.CreatedOn,
                                           CountryId = pat.CountryId,
                                           CountrySubDivisionId = pat.CountrySubDivisionId,
                                           CountrySubDivisionName = country.CountrySubDivisionName,
                                           CurrentBalance = ins != null ? ins.CurrentBalance : 0,
                                           InsuranceProviderId = ins != null ? ins.InsuranceProviderId : 0,
                                           IMISCode = ins != null ? ins.IMISCode : null
                                       }).OrderByDescending(p => p.PatientId).ToList();
                        responseData.Results = allPats;
                    }

                    responseData.Status = "OK";
                }
                else
                {
                    responseData.Status = "failed";
                    responseData.ErrorMessage = "Invalid request type.";
                }
                //responseData.Results = null;
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
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            int CreatedBy = ToInt(this.ReadQueryStringData("CreatedBy"));
            responseData.Status = "OK";//by default status would be OK, hence assigning at the top
            string ipDataString = this.ReadPostData();
            string reqType = this.ReadQueryStringData("reqType");
            try
            {
                BillingDbContext billingDbContext = new BillingDbContext(connString);

                if (reqType == "")
                {
                }
                else
                {
                    responseData.Status = "failed";
                    responseData.ErrorMessage = "Invalid request type.";
                }


                //responseData.Results = null;
            }
            catch (Exception ex)
            {
                responseData.Status = "failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);

        }

        [HttpPut]
        public string Put(string reqType, int settlementId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            responseData.Status = "OK";//by default status would be OK, hence assigning at the top
            try
            {
                int patientId = ToInt(this.ReadQueryStringData("patientId"));
                int insuranceProviderId = ToInt(this.ReadQueryStringData("insuranceProviderId"));
                int updatedInsBalance = ToInt(this.ReadQueryStringData("updatedInsBalance"));
                int patientInsurancePkgId = ToInt(this.ReadQueryStringData("patientInsurancePkgId"));
                int couterId = ToInt(this.ReadQueryStringData("counterId"));
                BillingDbContext billingDbContext = new BillingDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

                //if (reqType == "update-insurance-balance")
                //{
                //    BillingBL.UpdateInsuranceCurrentBalance(connString,
                //        patientId,
                //        insuranceProviderId,
                //        currentUser.EmployeeId,
                //        updatedInsBalance);
                //    responseData.Status = "OK";
                //}

                //else 
                
                if (reqType == "close-insurance-package")
                {
                    PatientInsurancePackageTransactionModel insPkg = billingDbContext.PatientInsurancePackageTransactions
                        .Where(ins => ins.PatientInsurancePackageId == patientInsurancePkgId).FirstOrDefault();
                    if (insPkg != null)
                    {
                        insPkg.EndDate = DateTime.Now;
                        insPkg.IsCompleted = true;
                        insPkg.ModifiedOn = DateTime.Now;
                        insPkg.ModifiedBy = currentUser.EmployeeId;
                        billingDbContext.Entry(insPkg).State = EntityState.Modified;
                        billingDbContext.SaveChanges();
                        responseData.Status = "OK";
                    }
                }

                else if (reqType == "update-insurance-claim")
                {
                    string str = this.ReadPostData();
                    List<Int32> billingTransactionIdList = JsonConvert.DeserializeObject<List<Int32>>(str);
                    List<BillingTransactionModel> claimInsurance = new List<BillingTransactionModel>();
                    DateTime settlementDate = DateTime.Now;
                    foreach (var invoice in billingTransactionIdList)
                    {
                        BillingTransactionModel billingTransaction = billingDbContext.BillingTransactions
                            .Where(a => a.BillingTransactionId == invoice)
                            .FirstOrDefault<BillingTransactionModel>();

                        if (billingTransaction != null)
                        {
                            billingDbContext.BillingTransactions.Attach(billingTransaction);
                            billingTransaction.BillStatus = ENUM_BillingStatus.paid;// "paid";
                            billingTransaction.PaidAmount = billingTransaction.TotalAmount;
                            billingTransaction.PaidDate = settlementDate;
                            billingTransaction.PaymentReceivedBy = currentUser.EmployeeId;
                            billingTransaction.PaidCounterId = couterId;
                            billingTransaction.IsInsuranceClaimed = true;
                            billingTransaction.InsuranceClaimedDate = DateTime.Now;
                            billingDbContext.Entry(billingTransaction).Property(b => b.IsInsuranceClaimed).IsModified = true;
                            billingDbContext.Entry(billingTransaction).Property(b => b.InsuranceClaimedDate).IsModified = true;
                            billingDbContext.Entry(billingTransaction).Property(b => b.BillStatus).IsModified = true;
                            billingDbContext.Entry(billingTransaction).Property(b => b.PaidAmount).IsModified = true;
                            billingDbContext.Entry(billingTransaction).Property(b => b.PaidDate).IsModified = true;
                            billingDbContext.Entry(billingTransaction).Property(b => b.PaymentReceivedBy).IsModified = true;
                            billingDbContext.Entry(billingTransaction).Property(b => b.PaidCounterId).IsModified = true;



                            List<BillingTransactionItemModel> txnItems = billingDbContext.BillingTransactionItems
                                                                                 .Where(b => b.BillingTransactionId == billingTransaction.BillingTransactionId).ToList();

                            if (txnItems != null && txnItems.Count > 0)
                            {

                                foreach (var txnItm in txnItems)
                                {
                                    billingDbContext.BillingTransactionItems.Attach(txnItm);

                                    txnItm.BillStatus = ENUM_BillingStatus.paid;// "paid";
                                    txnItm.PaidDate = settlementDate;
                                    txnItm.PaidCounterId = couterId;
                                    txnItm.PaymentReceivedBy = currentUser.EmployeeId;
                                    billingDbContext.Entry(txnItm).Property(b => b.BillStatus).IsModified = true;
                                    billingDbContext.Entry(txnItm).Property(b => b.PaidDate).IsModified = true;
                                    billingDbContext.Entry(txnItm).Property(b => b.PaymentReceivedBy).IsModified = true;
                                    billingDbContext.Entry(txnItm).Property(b => b.PaidCounterId).IsModified = true;

                                }
                                billingDbContext.SaveChanges();

                            }
                            //claimInsurance.Add(billingTransaction);
                        }
                    }
                    billingDbContext.SaveChanges();
                    responseData.Status = "OK";
                    responseData.Results = claimInsurance;

                }

                else
                {
                    responseData.Status = "failed";
                    responseData.ErrorMessage = "Invalid request type.";
                }


                //responseData.Results = null;
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
