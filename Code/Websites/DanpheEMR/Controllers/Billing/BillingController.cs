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
using DanpheEMR.ServerModel.BillingModels;
using System.Threading.Tasks;
using System.Data.SqlClient;
using System.Data;
using DanpheEMR.Core;
using DanpheEMR.Core.Parameters;

namespace DanpheEMR.Controllers
{

    public class BillingController : CommonController
    {

        double cacheExpMinutes;//= 5;//this should come from configuration later on.
        string InvoiceCode = "BL"; //get this from parameters when possible.
        public BillingController(IOptions<MyConfiguration> _config) : base(_config)
        {
            cacheExpMinutes = _config.Value.CacheExpirationMinutes;
        }



        [HttpGet]
        public string Get(string reqType,
            int? InputId, int ProviderId,
            int serviceDeptId,
            int visitId,
            string serviceDeptName,
            int requisitionId,
            int patientId,
            string departmentName,
            string status,
            string FromDate,
            string ToDate,
            int billingTransactionId,
            int fiscalYrId,
            bool getVisitInfo,
            int? patVisitId,
            bool isInsuranceReceipt,
            bool isInsurance,
            DateTime date,
            string search)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            RbacDbContext rbacDbContext = new RbacDbContext(connString);
            MasterDbContext masterDbContext = new MasterDbContext(connString);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            int CreatedBy = ToInt(this.ReadQueryStringData("CreatedBy"));
            CoreDbContext coreDbContext = new CoreDbContext(connString);


            responseData.Status = "OK";//by default status would be OK, hence assigning at the top
            try
            {
                BillingDbContext dbContext = new BillingDbContext(connString);
                LabDbContext labDbContext = new LabDbContext(connString);
                #region //1.("allPatient")2.("Patientonly") 3.("Receipt") ------CREDIT VIEW--------
                #region //1. List out all the patient with the credit amount 

                if (reqType != null && reqType.ToLower() == "listpatientunpaidtotal")
                {
                    var allPatientCreditReceipts = (from bill in dbContext.BillingTransactionItems.Include("Patient")
                                                    where bill.BillStatus == "provisional"
                                                    && (bill.IsInsurance == false || bill.IsInsurance == null)
                                                    //couldn't use Patient.ShortName directly since it's not mapped to DB and hence couldn't be used inside LINQ.
                                                    group bill by new { bill.PatientId, bill.Patient.PatientCode, bill.Patient.FirstName, bill.Patient.LastName, bill.Patient.MiddleName, bill.Patient.DateOfBirth, bill.Patient.Gender } into p
                                                    select new
                                                    {
                                                        PatientId = p.Key.PatientId,
                                                        PatientCode = p.Key.PatientCode,
                                                        ShortName = p.Key.FirstName + " " + (string.IsNullOrEmpty(p.Key.MiddleName) ? "" : p.Key.MiddleName + " ") + p.Key.LastName,
                                                        Gender = p.Key.Gender,
                                                        DateOfBirth = p.Max(a => a.Patient.DateOfBirth.Value),
                                                        LastCreditBillDate = p.Max(a => a.RequisitionDate.Value),
                                                        TotalCredit = Math.Round(p.Sum(a => a.TotalAmount.Value), 2)
                                                    }).OrderByDescending(b => b.LastCreditBillDate).ToList();

                    responseData.Results = allPatientCreditReceipts;
                }
                #endregion
                //Getting unpaid insurance bill details
                else if (reqType != null && reqType.ToLower() == "listpatientinsuranceprovisional")
                {
                    var allPatientInsuranceCreditReceipts = (from bill in dbContext.BillingTransactionItems.Include("Patient")
                                                             where bill.BillStatus == "provisional"
                                                             && bill.IsInsurance == true
                                                             //couldn't use Patient.ShortName directly since it's not mapped to DB and hence couldn't be used inside LINQ.
                                                             group bill by new { bill.PatientId, bill.Patient.PatientCode, bill.Patient.FirstName, bill.Patient.LastName, bill.Patient.MiddleName, bill.Patient.DateOfBirth, bill.Patient.Gender } into p
                                                             select new
                                                             {
                                                                 PatientId = p.Key.PatientId,
                                                                 PatientCode = p.Key.PatientCode,
                                                                 ShortName = p.Key.FirstName + " " + (string.IsNullOrEmpty(p.Key.MiddleName) ? "" : p.Key.MiddleName + " ") + p.Key.LastName,
                                                                 Gender = p.Key.Gender,
                                                                 DateOfBirth = p.Max(a => a.Patient.DateOfBirth.Value),
                                                                 LastCreditBillDate = p.Max(a => a.RequisitionDate.Value),
                                                                 TotalCredit = Math.Round(p.Sum(a => a.TotalAmount.Value), 2)
                                                             }).OrderByDescending(b => b.LastCreditBillDate).ToList();

                    responseData.Results = allPatientInsuranceCreditReceipts;
                }

                else if (reqType != null && reqType == "creditbalanceByPatientId" && InputId != null && InputId != 0)
                {
                    //visitDbContext.Visits.Where(s => s.VisitType == visitType && s.VisitDate.Year == year).DefaultIfEmpty()
                    //    .Max(t => t.PatientVisitId == null ? 0 : t.PatientVisitId);

                    //for this request type, patientid comes as inputid.
                    double? patientCreditReceipts = dbContext.BillingTransactionItems.Where(bill => bill.PatientVisitId == InputId && (bill.BillStatus == "provisional" || bill.BillStatus == "unpaid")).DefaultIfEmpty()
                        .Sum(a => a.TotalAmount == null ? 0 : a.TotalAmount);

                    //for this request type, patientid comes as inputid.

                    responseData.Results = patientCreditReceipts;
                }

                else if (reqType != null && reqType == "allServiceDepts")
                {
                    var allServiceDepts = (from srvDpts in dbContext.ServiceDepartment
                                           select new
                                           {
                                               ServiceDepartmentId = srvDpts.ServiceDepartmentId,
                                               ServiceDepartmentName = srvDpts.ServiceDepartmentName
                                           }).ToList();

                    responseData.Results = allServiceDepts;
                }

                //---Patient Membership---- firstly the membership Id is taken from that patient and after that discountpercent is taken from that id 

                else if (reqType != null && reqType == "getPatMembershipInfo" && InputId != null && InputId != 0)
                {
                    //changed by sudarshan: we don't need 2 calls to get the membership detail.
                    //also no need to join with the PatientMembershipFor now--
                    var currPatMembershipId = (from pat in dbContext.Patient
                                               where pat.PatientId == InputId
                                               select pat).FirstOrDefault().MembershipTypeId;
                    var patMembershipInfo = (from memb in dbContext.MembershipType
                                             where memb.MembershipTypeId == currPatMembershipId
                                             select new
                                             {
                                                 PatientId = InputId,
                                                 MembershipTypeId = memb.MembershipTypeId,
                                                 DiscountPercent = memb.DiscountPercent,
                                                 MembershipTypeName = memb.MembershipTypeName
                                             }).FirstOrDefault();

                    responseData.Status = "OK";
                    responseData.Results = patMembershipInfo;
                }

                //Getting MembershipType Lists --Yubraj 30th July '19
                else if (reqType != null && reqType == "membership-types")
                {
                    var membershipTypes = (from type in dbContext.MembershipType
                                           where type.IsActive == true
                                           select new
                                           {
                                               type.MembershipTypeId,
                                               MembershipType = type.MembershipTypeName,
                                               MembershipTypeName = type.MembershipTypeName + " (" + type.DiscountPercent + " % off)",
                                               type.DiscountPercent
                                           }).ToList();
                    responseData.Results = membershipTypes;
                    responseData.Status = "OK";
                }

                #region //2.if in patient level, show all receipts which are credit for this patient.
                else if (reqType != null && reqType == "provisionalItemsByPatientId" && InputId != null && InputId != 0)
                {
                    PatientModel currPatient = dbContext.Patient.Where(pat => pat.PatientId == InputId).FirstOrDefault();
                    if (currPatient != null)
                    {
                        string subDivName = (from pat in dbContext.Patient
                                             join countrySubdiv in dbContext.CountrySubdivisions
                                             on pat.CountrySubDivisionId equals countrySubdiv.CountrySubDivisionId
                                             where pat.PatientId == currPatient.PatientId
                                             select countrySubdiv.CountrySubDivisionName
                                          ).FirstOrDefault();

                        currPatient.CountrySubDivisionName = subDivName;
                        //remove relational property of patient//sud: 12May'18
                        currPatient.BillingTransactionItems = null;
                    }
                    if (!isInsurance)
                    {
                        //    isInsurance == false;
                    }

                    //for this request type, patientid comes as inputid.
                    var patCreditItems = (from bill in dbContext.BillingTransactionItems.Include("ServiceDepartment")
                                          where bill.BillStatus == "provisional" && bill.PatientId == InputId
                                          && (bill.IsInsurance == false || bill.IsInsurance == null)
                                          select bill).ToList<BillingTransactionItemModel>().OrderBy(b => b.ServiceDepartmentId);

                    //clear patient object from Items, not needed since we're returning patient object separately
                    if (patCreditItems != null)
                    {

                        var allEmployees = (from emp in dbContext.Employee
                                            join dep in dbContext.Departments
                                            on emp.DepartmentId equals dep.DepartmentId into empDpt
                                            from emp2 in empDpt.DefaultIfEmpty()
                                            select new
                                            {
                                                EmployeeId = emp.EmployeeId,
                                                EmployeeName = emp.FirstName,
                                                DepartmentCode = emp2 != null ? emp2.DepartmentCode : "N/A",
                                                DepartmentName = emp2 != null ? emp2.DepartmentName : "N/A"
                                            }).ToList();

                        BillingFiscalYear fiscYear = BillingBL.GetFiscalYear(connString);

                        //remove relational property of BillingTransactionItem//sud: 12May'18
                        //assign requesting department and user for each provisional items.. -- sud: 25Sept'18
                        foreach (BillingTransactionItemModel item in patCreditItems)
                        {
                            //item.ProvFiscalYear = "2075 / 76";
                            item.ProvFiscalYear = fiscYear.FiscalYearFormatted;
                            item.RequestingUserName = allEmployees.Where(a => a.EmployeeId == item.CreatedBy)
                                    .Select(a => a.EmployeeName).FirstOrDefault();

                            item.RequestingUserDept = allEmployees.Where(a => a.EmployeeId == item.CreatedBy)
                                 .Select(a => a.DepartmentName).FirstOrDefault();

                            item.Patient = null;
                        }
                    }

                    //create new anonymous type with patient information + Credit Items information : Anish:4May'18
                    var patCreditDetails = new
                    {
                        Patient = currPatient,
                        CreditItems = patCreditItems.OrderBy(itm => itm.CreatedOn).ToList()
                    };


                    responseData.Results = patCreditDetails;
                }
                #endregion

                #region //3.if in patient level, show all receipts which are credit Insurance for this patient.
                else if (reqType != null && reqType == "insuranceprovisionalItemsByPatientId" && InputId != null && InputId != 0)
                {
                    PatientModel currPatient = dbContext.Patient.Where(pat => pat.PatientId == InputId).FirstOrDefault();
                    if (currPatient != null)
                    {
                        string subDivName = (from pat in dbContext.Patient
                                             join countrySubdiv in dbContext.CountrySubdivisions
                                             on pat.CountrySubDivisionId equals countrySubdiv.CountrySubDivisionId
                                             where pat.PatientId == currPatient.PatientId
                                             select countrySubdiv.CountrySubDivisionName
                                          ).FirstOrDefault();

                        currPatient.CountrySubDivisionName = subDivName;
                        //remove relational property of patient//sud: 12May'18
                        currPatient.BillingTransactionItems = null;
                    }
                    if (!isInsurance)
                    {
                        //    isInsurance == false;
                    }

                    //for this request type, patientid comes as inputid.
                    var patCreditItems = (from bill in dbContext.BillingTransactionItems.Include("ServiceDepartment")
                                          where bill.BillStatus == "provisional" && bill.PatientId == InputId
                                          && bill.IsInsurance == true
                                          select bill).ToList<BillingTransactionItemModel>().OrderBy(b => b.ServiceDepartmentId);

                    //clear patient object from Items, not needed since we're returning patient object separately
                    if (patCreditItems != null)
                    {

                        var allEmployees = (from emp in dbContext.Employee
                                            join dep in dbContext.Departments
                                            on emp.DepartmentId equals dep.DepartmentId into empDpt
                                            from emp2 in empDpt.DefaultIfEmpty()
                                            select new
                                            {
                                                EmployeeId = emp.EmployeeId,
                                                EmployeeName = emp.FirstName,
                                                DepartmentCode = emp2 != null ? emp2.DepartmentCode : "N/A",
                                                DepartmentName = emp2 != null ? emp2.DepartmentName : "N/A"
                                            }).ToList();

                        BillingFiscalYear fiscYear = BillingBL.GetFiscalYear(connString);

                        //remove relational property of BillingTransactionItem//sud: 12May'18
                        //assign requesting department and user for each provisional items.. -- sud: 25Sept'18
                        foreach (BillingTransactionItemModel item in patCreditItems)
                        {
                            //item.ProvFiscalYear = "2075 / 76";
                            item.ProvFiscalYear = fiscYear.FiscalYearFormatted;
                            item.RequestingUserName = allEmployees.Where(a => a.EmployeeId == item.CreatedBy)
                                    .Select(a => a.EmployeeName).FirstOrDefault();

                            item.RequestingUserDept = allEmployees.Where(a => a.EmployeeId == item.CreatedBy)
                                 .Select(a => a.DepartmentName).FirstOrDefault();

                            item.Patient = null;
                        }
                    }

                    //create new anonymous type with patient information + Credit Items information : Anish:4May'18
                    var patCreditDetails = new
                    {
                        Patient = currPatient,
                        InsCreditItems = patCreditItems.OrderBy(itm => itm.CreatedOn).ToList()
                    };


                    responseData.Results = patCreditDetails;
                }
                #endregion
                #endregion
                else if (reqType != null && reqType == "provItemsByPatIdAndVisitId" && InputId != null && InputId != 0 && patVisitId != null && patVisitId != 0)
                {
                    PatientModel currPatient = dbContext.Patient.Where(pat => pat.PatientId == InputId).FirstOrDefault();
                    if (currPatient != null)
                    {
                        string subDivName = (from pat in dbContext.Patient
                                             join countrySubdiv in dbContext.CountrySubdivisions
                                             on pat.CountrySubDivisionId equals countrySubdiv.CountrySubDivisionId
                                             where pat.PatientId == currPatient.PatientId
                                             select countrySubdiv.CountrySubDivisionName
                                          ).FirstOrDefault();

                        currPatient.CountrySubDivisionName = subDivName;
                        //remove relational property of patient//sud: 12May'18
                        currPatient.BillingTransactionItems = null;
                    }

                    //for this request type, patientid comes as inputid.
                    var patCreditItems = (from bill in dbContext.BillingTransactionItems.Include("ServiceDepartment")
                                          where bill.BillStatus == "provisional" && bill.PatientId == InputId && bill.PatientVisitId == patVisitId
                                          select bill).ToList<BillingTransactionItemModel>().OrderBy(b => b.ServiceDepartmentId);

                    //clear patient object from Items, not needed since we're returning patient object separately
                    if (patCreditItems != null)
                    {

                        var allEmployees = (from emp in dbContext.Employee
                                            join dep in dbContext.Departments
                                            on emp.DepartmentId equals dep.DepartmentId into empDpt
                                            from emp2 in empDpt.DefaultIfEmpty()
                                            select new
                                            {
                                                EmployeeId = emp.EmployeeId,
                                                EmployeeName = emp.FirstName,
                                                DepartmentCode = emp2 != null ? emp2.DepartmentCode : "N/A",
                                                DepartmentName = emp2 != null ? emp2.DepartmentName : "N/A"
                                            }).ToList();

                        //remove relational property of BillingTransactionItem//sud: 12May'18
                        //assign requesting department and user for each provisional items.. -- sud: 25Sept'18
                        foreach (BillingTransactionItemModel item in patCreditItems)
                        {
                            item.RequestingUserName = allEmployees.Where(a => a.EmployeeId == item.CreatedBy)
                                    .Select(a => a.EmployeeName).FirstOrDefault();

                            item.RequestingUserDept = allEmployees.Where(a => a.EmployeeId == item.CreatedBy)
                                 .Select(a => a.DepartmentName).FirstOrDefault();

                            item.Patient = null;
                        }
                    }

                    //create new anonymous type with patient information + Credit Items information : Anish:4May'18
                    var patCreditDetails = new
                    {
                        Patient = currPatient,
                        CreditItems = patCreditItems.OrderBy(itm => itm.CreatedOn).ToList()
                    };


                    responseData.Results = patCreditDetails;
                }


                else if (reqType != null && reqType == "inPatProvItemsByPatIdAndVisitId" && InputId != null && InputId != 0 && patVisitId != null && patVisitId != 0)
                {
                    List<BillingTransactionItemVM> billItemVM = new List<BillingTransactionItemVM>();

                    PatientModel currPatient = dbContext.Patient.Where(pat => pat.PatientId == InputId).FirstOrDefault();
                    if (currPatient != null)
                    {
                        string subDivName = (from pat in dbContext.Patient
                                             join countrySubdiv in dbContext.CountrySubdivisions
                                             on pat.CountrySubDivisionId equals countrySubdiv.CountrySubDivisionId
                                             where pat.PatientId == currPatient.PatientId
                                             select countrySubdiv.CountrySubDivisionName
                                          ).FirstOrDefault();

                        currPatient.CountrySubDivisionName = subDivName;
                        //remove relational property of patient//sud: 12May'18
                        currPatient.BillingTransactionItems = null;
                    }

                    //for this request type, patientid comes as inputid.
                    var patCreditItems = (from bill in dbContext.BillingTransactionItems.Include("ServiceDepartment")
                                          where bill.BillStatus == "provisional" && bill.PatientId == InputId && bill.PatientVisitId == patVisitId
                                          select bill).ToList<BillingTransactionItemModel>().OrderBy(b => b.ServiceDepartmentId);


                    //clear patient object from Items, not needed since we're returning patient object separately
                    if (patCreditItems != null)
                    {

                        var allEmployees = (from emp in dbContext.Employee
                                            join dep in dbContext.Departments
                                            on emp.DepartmentId equals dep.DepartmentId into empDpt
                                            from emp2 in empDpt.DefaultIfEmpty()
                                            select new
                                            {
                                                EmployeeId = emp.EmployeeId,
                                                EmployeeName = emp.FirstName,
                                                DepartmentCode = emp2 != null ? emp2.DepartmentCode : "N/A",
                                                DepartmentName = emp2 != null ? emp2.DepartmentName : "N/A"
                                            }).ToList();

                        //remove relational property of BillingTransactionItem//sud: 12May'18
                        //assign requesting department and user for each provisional items.. -- sud: 25Sept'18
                        foreach (BillingTransactionItemModel item in patCreditItems)
                        {
                            var blItm = new BillingTransactionItemVM();

                            item.RequestingUserName = allEmployees.Where(a => a.EmployeeId == item.CreatedBy)
                                    .Select(a => a.EmployeeName).FirstOrDefault();

                            item.RequestingUserDept = allEmployees.Where(a => a.EmployeeId == item.CreatedBy)
                                 .Select(a => a.DepartmentName).FirstOrDefault();

                            item.Patient = null;



                            blItm.BillingTransactionItemId = item.BillingTransactionItemId;
                            blItm.BillingTransactionId = item.BillingTransactionId;
                            blItm.PatientId = item.PatientId;
                            blItm.ProviderId = item.ProviderId;
                            blItm.ProviderName = item.ProviderName;
                            blItm.ServiceDepartmentId = item.ServiceDepartmentId;
                            blItm.ServiceDepartmentName = item.ServiceDepartmentName;
                            blItm.ProcedureCode = item.ProcedureCode;
                            blItm.ItemId = item.ItemId;
                            blItm.ItemName = item.ItemName;
                            blItm.Price = item.Price;
                            blItm.Quantity = item.Quantity;
                            blItm.SubTotal = item.SubTotal;
                            blItm.DiscountPercent = item.DiscountPercent;
                            blItm.DiscountPercentAgg = item.DiscountPercentAgg;
                            blItm.DiscountAmount = item.DiscountAmount;
                            blItm.Tax = item.Tax;
                            blItm.TotalAmount = item.TotalAmount;
                            blItm.BillStatus = item.BillStatus;
                            blItm.RequisitionId = item.RequisitionId;
                            blItm.RequisitionDate = item.RequisitionDate;
                            blItm.CounterDay = item.CounterDay;
                            blItm.CounterId = item.CounterId;
                            blItm.PaidDate = item.PaidDate;
                            blItm.ReturnStatus = item.ReturnStatus;
                            blItm.ReturnQuantity = item.ReturnQuantity;
                            blItm.CreatedBy = item.CreatedBy;
                            blItm.CreatedOn = item.CreatedOn;
                            blItm.Remarks = item.Remarks;
                            blItm.CancelRemarks = item.CancelRemarks;
                            blItm.TaxPercent = item.TaxPercent;
                            blItm.CancelledOn = item.CancelledOn;
                            blItm.CancelledBy = item.CancelledBy;
                            blItm.RequestedBy = item.RequestedBy;
                            blItm.PatientVisitId = item.PatientVisitId;
                            blItm.BillingPackageId = item.BillingPackageId;
                            blItm.TaxableAmount = item.TaxableAmount;
                            blItm.NonTaxableAmount = item.NonTaxableAmount;
                            blItm.PaymentReceivedBy = item.PaymentReceivedBy;
                            blItm.PaidCounterId = item.PaidCounterId;
                            blItm.BillingType = item.BillingType;
                            blItm.RequestingDeptId = item.RequestingDeptId;
                            blItm.IsTaxApplicable = item.IsTaxApplicable;
                            blItm.Patient = item.Patient;
                            blItm.BillingTransaction = item.BillingTransaction;
                            blItm.ServiceDepartment = item.ServiceDepartment;
                            blItm.VisitType = item.VisitType;
                            blItm.RequestingUserName = item.RequestingUserName;
                            blItm.RequestingUserDept = item.RequestingUserDept;

                            //Added by Anish: Oct 10- In case Of lab User should not be able to cancel the LabItem whose Report is already Generated
                            if (item.ServiceDepartment.IntegrationName == "LAB")
                            {
                                blItm.AllowCancellation = !(
                                                      (from cmp in labDbContext.LabTestComponentResults
                                                       where cmp.RequisitionId == item.RequisitionId
                                                      && cmp.LabReportId.HasValue
                                                       select cmp).ToList().Count > 0
                                                   );
                            }
                            else
                            {
                                blItm.AllowCancellation = true;
                            }

                            billItemVM.Add(blItm);

                        }
                    }

                    //create new anonymous type with patient information + Credit Items information : Anish:4May'18
                    var patCreditDetails = new
                    {
                        Patient = currPatient,
                        CreditItems = billItemVM.OrderBy(itm => itm.CreatedOn).ToList()
                    };


                    responseData.Results = patCreditDetails;
                }

                // to list out the invoice details for duplicate printing
                else if (reqType != null && reqType.ToLower() == "listinvoicewisebill")
                {
                    int searchListLength = 0;//this is default value.
                    List<ParameterModel> allParams = coreDbContext.Parameters.ToList();

                    ParameterModel listNumber = allParams.Where(a => a.ParameterGroupName == "Common" && a.ParameterName == "ServerSideSearchListLength").FirstOrDefault<ParameterModel>();
                    if (listNumber != null)
                    {
                        searchListLength = Convert.ToInt32(listNumber.ParameterValue);
                    }
                    if (search == null)
                    {
                        var allInvoiceReceipts = (from bill in dbContext.BillingTransactions.Include("Patient").Include("BillingTransactionItems")
                                                  join yr in dbContext.BillingFiscalYears
                                                  on bill.FiscalYearId equals yr.FiscalYearId
                                                  orderby bill.BillingTransactionId
                                                  //couldn't use Patient.ShortName directly since it's not mapped to DB and hence couldn't be used inside LINQ.
                                                  group bill by new
                                                  {
                                                      bill.PatientId,
                                                      bill.Patient.PatientCode,
                                                      bill.Patient.FirstName,
                                                      bill.Patient.LastName,
                                                      bill.Patient.MiddleName,
                                                      bill.Patient.Gender,
                                                      bill.Patient.PhoneNumber,
                                                      bill.Patient.DateOfBirth,
                                                      bill.BillingTransactionId,
                                                      bill.InvoiceNo,
                                                      bill.InvoiceCode,
                                                      yr.FiscalYearFormatted,
                                                      yr.FiscalYearId,
                                                      bill.PrintCount,
                                                      bill.DepositBalance,
                                                      bill.SubTotal,
                                                      bill.DiscountAmount,
                                                      bill.TaxTotal,
                                                      bill.TotalAmount,
                                                      bill.DepositReturnAmount,
                                                      bill.Tender,
                                                      bill.Change,
                                                      bill.Remarks,
                                                      bill.TransactionType,//added: sud:6Aug'17
                                                      bill.PaymentMode,//added: sud:4May'18
                                                      bill.BillStatus,//added: sud:4May'18
                                                      bill.PaymentDetails,//added: sud:4May'18
                                                      bill.IsInsuranceBilling,
                                                      bill.OrganizationId, //yubraj 22nd April '19
                                                      bill.ExchangeRate
                                                  } into p
                                                  select new
                                                  {
                                                      PatientId = p.Key.PatientId,
                                                      PatientCode = p.Key.PatientCode,
                                                      ShortName = p.Key.FirstName + " " + (string.IsNullOrEmpty(p.Key.MiddleName) ? "" : p.Key.MiddleName + " ") + p.Key.LastName,
                                                      Gender = p.Key.Gender,
                                                      DateOfBirth = p.Max(a => a.Patient.DateOfBirth.Value),
                                                      PaidDate = p.Max(a => a.PaidDate),
                                                      TransactionDate = p.Max(a => a.CreatedOn),
                                                      TotalAmount = p.Sum(a => a.TotalAmount),
                                                      BillingTransactionId = p.Key.BillingTransactionId,
                                                      InvoiceNumber = p.Key.InvoiceNo,
                                                      //Sud: 2-Oct'18--commented unused fields, it was increasing the response size un-necessarily.
                                                      InvoiceCode = p.Key.InvoiceCode,//
                                                      FiscalYear = p.Key.FiscalYearFormatted,
                                                      FiscalYearId = p.Key.FiscalYearId,
                                                      InvoiceNumFormatted = p.Key.InvoiceCode + p.Key.InvoiceNo.ToString(),
                                                      PhoneNumber = p.Key.PhoneNumber,
                                                      IsInsuranceBilling = p.Key.IsInsuranceBilling,

                                                      //Yubraj :: 22nd April '19 For finding creditOrganizationName to show in duplicate print
                                                      OrganizationId = p.Key.OrganizationId,
                                                      OrganizationName = p.Key.OrganizationId != null ? dbContext.CreditOrganization.Where(a =>
                                                                           a.OrganizationId == p.Key.OrganizationId)
                                                                           .Select(b => b.OrganizationName).FirstOrDefault() : null
                                                  }).OrderByDescending(a => a.FiscalYearId).ThenByDescending(a => a.InvoiceNumber).Take(searchListLength).ToList();
                        responseData.Results = allInvoiceReceipts;
                    }
                    else
                    {
                        var allInvoiceReceipts = (from bill in dbContext.BillingTransactions.Include("Patient").Include("BillingTransactionItems")
                                                  join yr in dbContext.BillingFiscalYears
                                                  on bill.FiscalYearId equals yr.FiscalYearId
                                                  //where (DbFunctions.TruncateTime(bill.CreatedOn) >= FromDate && DbFunctions.TruncateTime(bill.CreatedOn) <= ToDate)
                                                  where (bill.Patient.FirstName + " " + (string.IsNullOrEmpty(bill.Patient.MiddleName) ? "" : bill.Patient.MiddleName + " ") + bill.Patient.LastName + bill.Patient.PatientCode + bill.Patient.PhoneNumber + (bill.InvoiceCode + bill.InvoiceNo)).Contains(search)
                                                  orderby bill.BillingTransactionId
                                                  //couldn't use Patient.ShortName directly since it's not mapped to DB and hence couldn't be used inside LINQ.
                                                  group bill by new
                                                  {
                                                      bill.PatientId,
                                                      bill.Patient.PatientCode,
                                                      bill.Patient.FirstName,
                                                      bill.Patient.LastName,
                                                      bill.Patient.MiddleName,
                                                      bill.Patient.Gender,
                                                      bill.Patient.PhoneNumber,
                                                      bill.Patient.DateOfBirth,
                                                      bill.BillingTransactionId,
                                                      bill.InvoiceNo,
                                                      bill.InvoiceCode,
                                                      yr.FiscalYearFormatted,
                                                      yr.FiscalYearId,
                                                      bill.PrintCount,
                                                      bill.DepositBalance,
                                                      bill.SubTotal,
                                                      bill.DiscountAmount,
                                                      bill.TaxTotal,
                                                      bill.TotalAmount,
                                                      bill.DepositReturnAmount,
                                                      bill.Tender,
                                                      bill.Change,
                                                      bill.Remarks,
                                                      bill.TransactionType,//added: sud:6Aug'17
                                                      bill.PaymentMode,//added: sud:4May'18
                                                      bill.BillStatus,//added: sud:4May'18
                                                      bill.PaymentDetails,//added: sud:4May'18
                                                      bill.IsInsuranceBilling,
                                                      bill.OrganizationId, //yubraj 22nd April '19
                                                      bill.ExchangeRate
                                                  } into p
                                                  select new
                                                  {
                                                      PatientId = p.Key.PatientId,
                                                      PatientCode = p.Key.PatientCode,
                                                      ShortName = p.Key.FirstName + " " + (string.IsNullOrEmpty(p.Key.MiddleName) ? "" : p.Key.MiddleName + " ") + p.Key.LastName,
                                                      Gender = p.Key.Gender,
                                                      DateOfBirth = p.Max(a => a.Patient.DateOfBirth.Value),
                                                      PaidDate = p.Max(a => a.PaidDate),
                                                      TransactionDate = p.Max(a => a.CreatedOn),
                                                      TotalAmount = p.Sum(a => a.TotalAmount),
                                                      BillingTransactionId = p.Key.BillingTransactionId,
                                                      InvoiceNumber = p.Key.InvoiceNo,

                                                      InvoiceCode = p.Key.InvoiceCode,//
                                                      FiscalYear = p.Key.FiscalYearFormatted,
                                                      FiscalYearId = p.Key.FiscalYearId,
                                                      InvoiceNumFormatted = p.Key.InvoiceCode + p.Key.InvoiceNo.ToString(),

                                                      PhoneNumber = p.Key.PhoneNumber,
                                                      IsInsuranceBilling = p.Key.IsInsuranceBilling,

                                                      //Yubraj :: 22nd April '19 For finding creditOrganizationName to show in duplicate print
                                                      OrganizationId = p.Key.OrganizationId,
                                                      OrganizationName = p.Key.OrganizationId != null ? dbContext.CreditOrganization.Where(a =>
                                                                           a.OrganizationId == p.Key.OrganizationId)
                                                                           .Select(b => b.OrganizationName).FirstOrDefault() : null
                                                  }).ToList().OrderByDescending(a => a.FiscalYearId).ThenByDescending(a => a.InvoiceNumber);
                        responseData.Results = allInvoiceReceipts;
                    }
                }


                // to list out the Provisional details for duplicate printing
                else if (reqType != null && reqType.ToLower() == "listprovisionalwisebill")
                {
                    int searchListLength = 0;//this is default value.
                    List<ParameterModel> allParams = coreDbContext.Parameters.ToList();

                    ParameterModel listNumber = allParams.Where(a => a.ParameterGroupName == "Common" && a.ParameterName == "ServerSideSearchListLength").FirstOrDefault<ParameterModel>();
                    if (listNumber != null)
                    {
                        searchListLength = Convert.ToInt32(listNumber.ParameterValue);
                    }
                    if (search == null)
                    {
                        var onlyProvList = (from bil in dbContext.BillingTransactionItems
                                            where bil.ProvisionalReceiptNo.HasValue
                                            //&& (!bil.BillingTransactionId.HasValue)
                                            group bil by new
                                            {
                                                bil.PatientId,
                                                bil.ProvisionalReceiptNo,
                                                bil.ProvisionalFiscalYearId,
                                                bil.BillStatus,
                                                bil.IsInsurance
                                                //bil.CreatedOn,
                                                //bil.CreatedBy
                                            } into p
                                            select new
                                            {
                                                ProvisionalReceiptNo = p.Key.ProvisionalReceiptNo,
                                                ProvFiscalYearId = p.Key.ProvisionalFiscalYearId,
                                                PatientId = p.Key.PatientId,
                                                ItemCount = p.Count(),
                                                SubTotal = p.Sum(a => a.SubTotal),
                                                DiscountAmount = p.Sum(a => a.DiscountAmount),
                                                TotalAmount = p.Sum(a => a.TotalAmount),
                                                CurrentBillStatus = p.Key.BillStatus,
                                                CreatedOn = p.Max(a => a.CreatedOn),
                                                CreatedBy = p.Max(a => a.CreatedBy),
                                                IsInsurance = p.Key.IsInsurance
                                            }).OrderByDescending(a => a.ProvFiscalYearId).ThenByDescending(a => a.ProvisionalReceiptNo).Take(searchListLength).ToList();

                        var patProvDetails_All = (from prov in onlyProvList
                                                  join yr in dbContext.BillingFiscalYears on prov.ProvFiscalYearId equals yr.FiscalYearId
                                                  join pat in dbContext.Patient on prov.PatientId equals pat.PatientId
                                                  //where prov.BillStatus == "provisional"
                                                  select new
                                                  {
                                                      PatientId = prov.PatientId,
                                                      PatientCode = pat.PatientCode,
                                                      Address = pat.Address,
                                                      ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                                      Gender = pat.Gender,
                                                      DateOfBirth = pat.DateOfBirth,
                                                      ProvisionalReceiptNo = prov.ProvisionalReceiptNo,
                                                      InvoiceCode = "PR", //Hard coded for Provisional Invoice code
                                                      FiscalYear = yr.FiscalYearFormatted,
                                                      CreatedOn = prov.CreatedOn,
                                                      SubTotal = prov.SubTotal,
                                                      DiscountAmount = prov.DiscountAmount,
                                                      Total = prov.TotalAmount,
                                                      FiscalYearId = prov.ProvFiscalYearId,
                                                      IsInsurance = prov.IsInsurance,
                                                      ProvReceiptNumFormatted = yr.FiscalYearFormatted + "/PR/" + prov.ProvisionalReceiptNo, // return FiscalYear + "/" + "PR" + "/" + ProvReceiptNo;
                                                      PhoneNumber = pat.PhoneNumber,
                                                      CurrentBillStatus = prov.CurrentBillStatus,
                                                      User = rbacDbContext.Users.Where(usr => usr.EmployeeId == prov.CreatedBy).FirstOrDefault()
                                                  }).OrderByDescending(a => a.FiscalYearId).ThenByDescending(a => a.ProvisionalReceiptNo).ToList();

                        responseData.Results = patProvDetails_All;
                    }
                    else
                    {
                        var onlyProvList = (from bil in dbContext.BillingTransactionItems
                                            join pat in dbContext.Patient on bil.PatientId equals pat.PatientId
                                            where bil.ProvisionalReceiptNo.HasValue
                                            && (pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ")
                                            + pat.LastName
                                            + pat.PatientCode
                                            + pat.PhoneNumber).Contains(search)
                                            group bil by new
                                            {
                                                bil.PatientId,
                                                bil.ProvisionalReceiptNo,
                                                bil.ProvisionalFiscalYearId,
                                                bil.BillStatus,
                                                bil.IsInsurance
                                                //bil.CreatedOn,
                                                //bil.CreatedBy
                                            } into p
                                            select new
                                            {
                                                ProvisionalReceiptNo = p.Key.ProvisionalReceiptNo,
                                                ProvFiscalYearId = p.Key.ProvisionalFiscalYearId,
                                                PatientId = p.Key.PatientId,
                                                ItemCount = p.Count(),
                                                SubTotal = p.Sum(a => a.SubTotal),
                                                DiscountAmount = p.Sum(a => a.DiscountAmount),
                                                TotalAmount = p.Sum(a => a.TotalAmount),
                                                CurrentBillStatus = p.Key.BillStatus,
                                                CreatedOn = p.Max(a => a.CreatedOn),
                                                CreatedBy = p.Max(a => a.CreatedBy),
                                                IsInsurance = p.Key.IsInsurance
                                            }).OrderByDescending(a => a.ProvFiscalYearId).ThenByDescending(a => a.ProvisionalReceiptNo).ToList();

                        var patProvDetails_All = (
                                                from prov in onlyProvList
                                                join yr in dbContext.BillingFiscalYears on prov.ProvFiscalYearId equals yr.FiscalYearId
                                                join pat in dbContext.Patient on prov.PatientId equals pat.PatientId
                                                //where prov.BillStatus == "provisional"

                                                select new
                                                {
                                                    PatientId = prov.PatientId,
                                                    PatientCode = pat.PatientCode,
                                                    Address = pat.Address,
                                                    ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                                    Gender = pat.Gender,
                                                    DateOfBirth = pat.DateOfBirth,
                                                    ProvisionalReceiptNo = prov.ProvisionalReceiptNo,
                                                    InvoiceCode = "PR", //Hard coded for Provisional Invoice code
                                                    FiscalYear = yr.FiscalYearFormatted,
                                                    CreatedOn = prov.CreatedOn,
                                                    SubTotal = prov.SubTotal,
                                                    DiscountAmount = prov.DiscountAmount,
                                                    Total = prov.TotalAmount,
                                                    FiscalYearId = prov.ProvFiscalYearId,
                                                    IsInsurance = prov.IsInsurance,
                                                    ProvReceiptNumFormatted = yr.FiscalYearFormatted + "/PR/" + prov.ProvisionalReceiptNo, // return FiscalYear + "/" + "PR" + "/" + ProvReceiptNo;
                                                    PhoneNumber = pat.PhoneNumber,
                                                    CurrentBillStatus = prov.CurrentBillStatus,
                                                    User = rbacDbContext.Users.Where(usr => usr.EmployeeId == prov.CreatedBy).FirstOrDefault()
                                                }).OrderByDescending(a => a.FiscalYearId).ThenByDescending(a => a.ProvisionalReceiptNo).ToList();
                        responseData.Results = patProvDetails_All;
                    }

                }
                else if (reqType != null && reqType == "duplicateBillsByReceiptId" && InputId != null && InputId != 0)
                {
                    //For UMED:--6Sept2017
                    var receipt = (from bill in dbContext.BillingTransactions.Include("BillingTransactionItems").Include("Patient")
                                   where bill.InvoiceNo == InputId && bill.FiscalYearId == fiscalYrId
                                   //&& bill.IsInsuranceBilling == isInsuranceReceipt
                                   select new
                                   {
                                       Patient = bill.Patient,
                                       Transaction = bill,
                                       TransactionItems = bill.BillingTransactionItems,
                                   }).FirstOrDefault();

                    //Yubraj :: 22nd April '19 For finding creditOrganizationName to show in duplicate print
                    if (receipt.Transaction != null)
                    {
                        receipt.Transaction.OrganizationName = dbContext.CreditOrganization.Where(a => a.OrganizationId == receipt.Transaction.OrganizationId).Select(b => b.OrganizationName).FirstOrDefault();
                    }

                    if (receipt != null)
                    {
                        //get the username of the person who has created this receipt.
                        //RbacDbContext rbacDbContext = new RbacDbContext(connString);
                        string userName = null;

                        //commented: sud-5May'18 -- return logic moved from txnitem to txn model.
                        /////In case of Return, set the latest return remarks as the Receipt's Remarks. 
                        //if (receipt.TransactionItems.Where(a => a.ReturnStatus == true).Count() > 0)
                        //{
                        //    var lastRetItm = (from ret in dbContext.BillReturnRequests
                        //                      where ret.BillingTransactionId == receipt.Transaction.BillingTransactionId
                        //                      select ret)
                        //            .OrderByDescending(a => a.BillingReturnId).FirstOrDefault();//getting first from orderedbydescending gives us Latest item.

                        //    string latestReturnRemarks = lastRetItm != null ? lastRetItm.ReturnRemarks : "";
                        //    receipt.Transaction.Remarks = latestReturnRemarks;
                        //}

                        //if current reciept is returned, the assign User and Remarks from ReturnInvoice
                        if (receipt.Transaction.ReturnStatus.HasValue && receipt.Transaction.ReturnStatus.Value == true)
                        {
                            BillInvoiceReturnModel retInv = dbContext.BillReturns.Where(br => br.BillingTransactionId == receipt.Transaction.BillingTransactionId).FirstOrDefault();
                            receipt.Transaction.Remarks = retInv.Remarks;
                            userName = rbacDbContext.Users.Where(usr => usr.EmployeeId == retInv.CreatedBy).FirstOrDefault().UserName;
                        }
                        else
                        {
                            userName = rbacDbContext.Users.Where(usr => usr.EmployeeId == receipt.Transaction.CreatedBy).FirstOrDefault().UserName;
                        }

                        var invFiscalYear = dbContext.BillingFiscalYears.ToList()
                              .Where(f => f.FiscalYearId == receipt.Transaction.FiscalYearId).FirstOrDefault();
                        if (invFiscalYear != null)
                        {
                            receipt.Transaction.FiscalYear = invFiscalYear.FiscalYearFormatted;
                        }

                        //set navigational properties of Patient, BillingTransaction and BillingTransactioItems to null.
                        //mandatory, otherwise the response size will be too big.
                        receipt.Patient.BillingTransactionItems = null;
                        receipt.Transaction.Patient = null;
                        receipt.Transaction.BillingTransactionItems = null;
                        receipt.TransactionItems.ForEach(txnItm =>
                        {
                            txnItm.Patient = null;
                            txnItm.BillingTransaction = null;
                        });

                        // MasterDbContext masterDbContext = new MasterDbContext(connString);

                        receipt.Patient.CountrySubDivisionName = (from m in masterDbContext.CountrySubDivision
                                                                  where m.CountrySubDivisionId == receipt.Patient.CountrySubDivisionId
                                                                  select m.CountrySubDivisionName).FirstOrDefault();
                        //ashim:29Sep2018 rename this as patADTInfo:
                        var patVisitInfo = new object();
                        if (getVisitInfo)
                        {
                            AdmissionDbContext admissionDbContext = new AdmissionDbContext(connString);
                            patVisitInfo = (from admission in admissionDbContext.Admissions
                                            where admission.PatientId == receipt.Patient.PatientId
                                            select new
                                            {
                                                LastAdmissionDate = admission.AdmissionDate,
                                                LastDischargedDate = admission.DischargeDate
                                            }).OrderByDescending(a => a.LastAdmissionDate).FirstOrDefault();
                        }

                        //ashim: 29Sep2018 : To get patient's latest visit info incase of copy from earlier receipt in return receipt page.
                        var patientLatestVisitInfo = new object();
                        if (getVisitInfo)
                        {
                            patientLatestVisitInfo = (from visit in dbContext.Visit
                                                      where visit.PatientId == receipt.Patient.PatientId
                                                      select new
                                                      {
                                                          LatestVisitType = visit.VisitType,
                                                          LatestVisitId = visit.PatientVisitId,
                                                          LatestVisitCode = visit.VisitCode
                                                      }).OrderByDescending(a => a.LatestVisitId).FirstOrDefault();
                        }

                        //Returning new anonymous type. 
                        responseData.Results = new
                        {
                            Patient = receipt.Patient,
                            Transaction = receipt.Transaction,
                            TransactionItems = receipt.TransactionItems,
                            UserName = userName,
                            //ashim: 29Sep2018: Rename this as AdmissionInfo
                            VisitInfo = patVisitInfo,
                            //ashim: 29Sep2018 : To get patient's latest visit info incase of copy from earlier receipt in return receipt page.
                            LatestPatientVisitInfo = patientLatestVisitInfo
                        };

                    }

                }

                //Provisional Duplicate invoices from ReceiptNo and Fiscal Year --7th June
                else if (reqType != null && reqType == "duplicateProvisionalBillsByReceiptId" && InputId != null && InputId != 0)
                {
                    BillingFiscalYear fiscYear = BillingBL.GetFiscalYear(connString);

                    var patId = (from itm in dbContext.BillingTransactionItems
                                 where itm.ProvisionalReceiptNo == InputId
                                 && itm.ProvisionalFiscalYearId == fiscalYrId
                                 select itm.PatientId).FirstOrDefault();

                    var patientInfo = (from pat in dbContext.Patient where pat.PatientId == patId select pat).FirstOrDefault();
                    var receipt = (from bill in dbContext.BillingTransactionItems
                                   where bill.ProvisionalReceiptNo == InputId && bill.ProvisionalFiscalYearId == fiscalYrId
                                   //&& bill.IsInsuranceBilling == isInsuranceReceipt
                                   select bill).ToList();

                    //if (receipt.Transaction != null)
                    //{
                    //    receipt.Transaction.OrganizationName = dbContext.CreditOrganization.Where(a => a.OrganizationId == receipt.Transaction.OrganizationId).Select(b => b.OrganizationName).FirstOrDefault();
                    //}
                    var CountrySubDivisionName = (from sub in dbContext.CountrySubdivisions where sub.CountrySubDivisionId == patientInfo.CountrySubDivisionId select sub.CountrySubDivisionName).FirstOrDefault();
                    patientInfo.CountrySubDivisionName = CountrySubDivisionName;
                    //Returning new anonymous type. 
                    responseData.Results = new
                    {
                        FiscalYear = fiscYear.FiscalYearFormatted,
                        ReceiptNo = InputId,
                        Patient = patientInfo,
                        Transaction = receipt
                    };
                }

                else if (reqType == "returned-patient-invoices")
                {
                    var invoices = (from bill in dbContext.BillingTransactions.Include("BillingTransactionItems").Include("Patient")
                                    join fiscalYear in dbContext.BillingFiscalYears on bill.FiscalYearId equals fiscalYear.FiscalYearId
                                    where bill.ReturnStatus == true && bill.PatientId == patientId
                                    select new
                                    {
                                        bill.BillingTransactionId,
                                        bill.PatientId,
                                        bill.PatientVisitId,
                                        bill.PaymentMode,
                                        bill.PaymentDetails,
                                        bill.DiscountPercent,
                                        bill.Remarks,
                                        InvoiceNo = fiscalYear.FiscalYearFormatted + "-" + bill.InvoiceCode + bill.InvoiceNo.ToString(),
                                        bill.TotalAmount,
                                        bill.BillingTransactionItems,
                                        bill.CreatedOn,
                                        bill.PackageId,
                                        bill.PackageName,
                                        bill.TransactionType
                                    }).OrderByDescending(a => a.CreatedOn).Take(5).ToList();

                    //if any of invoices contains OPD items, then remove it: sud:7Aug'18--needed since OPD are billed only from VISIT MODULE, not Billing.. 
                    if (invoices != null && invoices.Count > 0)
                    {

                        invoices.RemoveAll(inv => inv.BillingTransactionItems.Where(itm => inv.PackageId == null && itm.ServiceDepartmentName == "OPD").Count() > 0);
                    }

                    responseData.Results = invoices;
                }

                //This block is for NormalProvisionalBilling 
                else if (reqType != null && reqType == "patientPastBillSummary" && InputId != null && InputId != 0)
                {
                    //Part-1: Get Deposit Balance of this patient. 
                    //get all deposit related transactions of this patient. and sum them acc to DepositType groups.
                    var patientAllDepositTxns = (from bill in dbContext.BillingDeposits
                                                 where bill.PatientId == InputId && bill.IsActive == true//here PatientId comes as InputId from client.
                                                 group bill by new { bill.PatientId, bill.DepositType } into p
                                                 select new
                                                 {
                                                     DepositType = p.Key.DepositType,
                                                     SumAmount = p.Sum(a => a.Amount)
                                                 }).ToList();
                    //separate sum of each deposit types and calculate deposit balance.
                    double? totalDepositAmt, totalDepositDeductAmt, totalDepositReturnAmt, currentDepositBalance;
                    currentDepositBalance = totalDepositAmt = totalDepositDeductAmt = totalDepositReturnAmt = 0;

                    if (patientAllDepositTxns.Where(bil => bil.DepositType.ToLower() == "deposit").FirstOrDefault() != null)
                    {
                        totalDepositAmt = patientAllDepositTxns.Where(bil => bil.DepositType.ToLower() == "deposit").FirstOrDefault().SumAmount;
                    }
                    if (patientAllDepositTxns.Where(bil => bil.DepositType.ToLower() == "depositdeduct").FirstOrDefault() != null)
                    {
                        totalDepositDeductAmt = patientAllDepositTxns.Where(bil => bil.DepositType.ToLower() == "depositdeduct").FirstOrDefault().SumAmount;
                    }
                    if (patientAllDepositTxns.Where(bil => bil.DepositType.ToLower() == "returndeposit").FirstOrDefault() != null)
                    {
                        totalDepositReturnAmt = patientAllDepositTxns.Where(bil => bil.DepositType.ToLower() == "returndeposit").FirstOrDefault().SumAmount;
                    }
                    //below is the formula to calculate deposit balance.
                    currentDepositBalance = totalDepositAmt - totalDepositDeductAmt - totalDepositReturnAmt;

                    //Part-2: Get Total Provisional Items
                    //for this request type, patientid comes as inputid.
                    var patProvisional = (from bill in dbContext.BillingTransactionItems
                                              //sud: 4May'18 changed unpaid to provisional
                                          where bill.PatientId == InputId && bill.BillStatus == "provisional" //here PatientId comes as InputId from client.
                                          && (bill.IsInsurance == false || bill.IsInsurance == null)
                                          group bill by new { bill.PatientId } into p
                                          select new
                                          {
                                              TotalProvisionalAmt = p.Sum(a => a.TotalAmount)
                                          }).FirstOrDefault();

                    var patProvisionalAmt = patProvisional != null ? patProvisional.TotalProvisionalAmt : 0;



                    //Part-3: Return a single object with Both Balances (Deposit and Credit).
                    //exclude returned invoices from credit total
                    //var patCredits = dbContext.BillingTransactions
                    //                .Where(b => b.PatientId == InputId && b.BillStatus == "unpaid" && b.ReturnStatus == false && b.IsInsuranceBilling == false)
                    //                 .Sum(b => b.TotalAmount);

                    //double patCreditAmt = patCredits != null ? patCredits.Value : 0;

                    var patCredits = (from bill in dbContext.BillingTransactionItems
                                      where bill.PatientId == InputId
                                      && bill.BillStatus == "unpaid"
                                      && (bill.ReturnStatus == false || bill.ReturnStatus == null)
                                      && (bill.IsInsurance == false || bill.IsInsurance == null)
                                      group bill by new { bill.PatientId } into p
                                      select new
                                      {
                                          TotalUnPaidAmt = p.Sum(a => a.TotalAmount)
                                      }).FirstOrDefault();

                    var patCreditAmt = patCredits != null ? patCredits.TotalUnPaidAmt : 0;

                    //Part-4: Get Total Paid Amount
                    var patPaid = (from bill in dbContext.BillingTransactionItems
                                   where bill.PatientId == InputId
                                   && bill.BillStatus == "paid"
                                   && (bill.ReturnStatus == false || bill.ReturnStatus == null)
                                   && (bill.IsInsurance == false || bill.IsInsurance == null)
                                   group bill by new { bill.PatientId } into p
                                   select new
                                   {
                                       TotalPaidAmt = p.Sum(a => a.TotalAmount)
                                   }).FirstOrDefault();

                    var patPaidAmt = patPaid != null ? patPaid.TotalPaidAmt : 0;

                    //Part-5: get Total Discount Amount
                    //var patDiscount = dbContext.BillingTransactionItems
                    //                .Where(b => b.PatientId == InputId && b.BillStatus == "unpaid" && b.ReturnStatus == false && b.IsInsurance == false)
                    //                 .Sum(b => b.DiscountAmount);

                    //double patDiscountAmt = patDiscount != null ? patDiscount.Value : 0;

                    var patDiscount = (from bill in dbContext.BillingTransactionItems
                                       where bill.PatientId == InputId
                                       && bill.BillStatus == "unpaid"
                                       && (bill.ReturnStatus == false || bill.ReturnStatus == null)
                                       && (bill.IsInsurance == false || bill.IsInsurance == null)
                                       group bill by new { bill.PatientId } into p
                                       select new
                                       {
                                           TotalDiscountAmt = p.Sum(a => a.DiscountAmount)
                                       }).FirstOrDefault();

                    var patDiscountAmt = patDiscount != null ? patDiscount.TotalDiscountAmt : 0;

                    //Part-6: get Total Cancelled Amount
                    var patCancel = (from bill in dbContext.BillingTransactionItems
                                         //sud: 4May'18 changed unpaid to provisional
                                     where bill.PatientId == InputId
                                     && bill.BillStatus == "cancel"
                                     && (bill.IsInsurance == false || bill.IsInsurance == null)
                                     group bill by new { bill.PatientId } into p
                                     select new
                                     {
                                         TotalPaidAmt = p.Sum(a => a.TotalAmount)
                                     }).FirstOrDefault();

                    var patCancelAmt = patCancel != null ? patCancel.TotalPaidAmt : 0;

                    //Part-7: get Total Cancelled Amount
                    //var patReturn = dbContext.BillingTransactionItems
                    //                .Where(b => b.PatientId == InputId && b.ReturnStatus == true) //&& (b.BillStatus == "paid" || b.BillStatus == "unpaid") && b.IsInsurance == false)
                    //                 .Sum(b => b.TotalAmount);

                    var patReturn = (from bill in dbContext.BillingTransactionItems
                                     where bill.PatientId == InputId
                                     && bill.ReturnStatus == true
                                     && (bill.IsInsurance == false || bill.IsInsurance == null)
                                     group bill by new { bill.PatientId } into p
                                     select new
                                     {
                                         TotalPaidAmt = p.Sum(a => a.TotalAmount)
                                     }).FirstOrDefault();
                    var patReturnAmt = patReturn != null ? patReturn.TotalPaidAmt : 0;

                    //Part-7: Return a single object with Both Balances (Deposit and Credit).
                    var patBillHistory = new
                    {
                        PatientId = InputId,
                        PaidAmount = patPaidAmt,
                        DiscountAmount = patDiscountAmt,
                        CancelAmount = patCancelAmt,
                        ReturnedAmount = patReturnAmt,
                        CreditAmount = patCreditAmt,
                        ProvisionalAmt = patProvisionalAmt,
                        TotalDue = patCreditAmt + patProvisionalAmt,
                        DepositBalance = currentDepositBalance,
                        BalanceAmount = currentDepositBalance - (patCreditAmt + patProvisionalAmt)
                    };


                    responseData.Results = patBillHistory;
                }

                //This block is for InsuranceProvisionalBilling 
                else if (reqType != null && reqType == "patientPastInsuranceBillSummary" && InputId != null && InputId != 0)
                {
                    //Part-1: Get Insurance Balance of this patient. 

                    var patientInsuranceBalance = (from bill in dbContext.Insurances where bill.PatientId == InputId select bill.CurrentBalance).FirstOrDefault();
                    double? currentInsurancebalance;
                    currentInsurancebalance = patientInsuranceBalance;

                    //Part-2: Get Total Provisional Items
                    //for this request type, patientid comes as inputid.
                    var patProvisional = (from bill in dbContext.BillingTransactionItems
                                          where bill.PatientId == InputId && bill.BillStatus == "provisional" //here PatientId comes as InputId from client.
                                          && bill.IsInsurance == true
                                          group bill by new { bill.PatientId } into p
                                          select new
                                          {
                                              TotalProvisionalAmt = p.Sum(a => a.TotalAmount)
                                          }).FirstOrDefault();

                    var patProvisionalAmt = patProvisional != null ? patProvisional.TotalProvisionalAmt : 0;



                    //Part-3: Return a single object with Both Balances (Deposit and Credit).
                    //exclude returned invoices from credit total
                    var patCredits = dbContext.BillingTransactions
                                    .Where(b => b.PatientId == InputId && b.BillStatus != "paid" && b.ReturnStatus != true && b.IsInsuranceBilling == true)
                                     .Sum(b => b.TotalAmount);

                    double patCreditAmt = patCredits != null ? patCredits.Value : 0;


                    //Part-4: Return a single object with Both Balances (Deposit and Credit).
                    var patInsuranceBillHistory = new
                    {
                        PatientId = InputId,
                        CreditAmount = patCreditAmt,
                        ProvisionalAmt = patProvisionalAmt,
                        TotalDue = patCreditAmt + patProvisionalAmt,
                        DepositBalance = currentInsurancebalance,
                        BalanceAmount = currentInsurancebalance - (patCreditAmt + patProvisionalAmt)
                    };


                    responseData.Results = patInsuranceBillHistory;
                }

                //list of Active Bills,Provisional Items, Settlements and Credit Invoices
                else if (reqType == "patient-bill-history-detail")
                {
                    var invoices = (from txn in dbContext.BillingTransactions
                                    join fiscalYear in dbContext.BillingFiscalYears on txn.FiscalYearId equals fiscalYear.FiscalYearId
                                    where txn.PatientId == patientId
                                    && (txn.IsInsuranceBilling == false || txn.IsInsuranceBilling == null)
                                    select new
                                    {
                                        TransactionId = txn.BillingTransactionId,
                                        Date = txn.CreatedOn,
                                        InvoiceNo = fiscalYear.FiscalYearFormatted + "-" + txn.InvoiceCode + txn.InvoiceNo.ToString(),
                                        Amount = txn.TotalAmount,
                                        BillStatus = txn.BillStatus,
                                        PaymentMode = txn.PaymentMode,
                                        IsReturned = txn.ReturnStatus,
                                        IsInsuranceBilling = txn.IsInsuranceBilling
                                    }).OrderBy(a => a.BillStatus == "paid").ThenByDescending(a => a.Date).ToList();

                    var provisionalItems = (from txnItm in dbContext.BillingTransactionItems
                                            join srvDept in dbContext.ServiceDepartment on txnItm.ServiceDepartmentId equals srvDept.ServiceDepartmentId
                                            join fiscalYear in dbContext.BillingFiscalYears on txnItm.ProvisionalFiscalYearId equals fiscalYear.FiscalYearId
                                            where txnItm.PatientId == patientId && txnItm.BillStatus == "provisional"
                                            && (txnItm.IsInsurance == false || txnItm.IsInsurance == null)
                                            select new
                                            {
                                                TransactionItemId = txnItm.BillingTransactionItemId,
                                                Date = txnItm.CreatedOn,
                                                ServiceDepartmentName = srvDept.ServiceDepartmentName,
                                                ItemName = txnItm.ItemName,
                                                Amount = txnItm.TotalAmount,
                                                ReceiptNo = fiscalYear.FiscalYearFormatted + "-" + "PR" + txnItm.ProvisionalReceiptNo.ToString(),
                                                BillStatus = txnItm.BillStatus,
                                                Quantity = txnItm.Quantity,
                                                Price = txnItm.Price,
                                                Discount = txnItm.DiscountAmount,
                                                Tax = txnItm.Tax,
                                                SubTotal = txnItm.SubTotal
                                            }).OrderByDescending(a => a.Date).ToList();
                    var paidItems = (from itms in dbContext.BillingTransactionItems
                                     join srvDept in dbContext.ServiceDepartment on itms.ServiceDepartmentId equals srvDept.ServiceDepartmentId
                                     join billtxn in dbContext.BillingTransactions on itms.BillingTransactionId equals billtxn.BillingTransactionId
                                     join fiscalYear in dbContext.BillingFiscalYears on billtxn.FiscalYearId equals fiscalYear.FiscalYearId
                                     where itms.PatientId == patientId && itms.BillStatus == "paid"
                                     && (itms.IsInsurance == false || itms.IsInsurance == null)
                                     select new
                                     {
                                         TransactionItemId = itms.BillingTransactionItemId,
                                         Date = itms.CreatedOn,
                                         InvoiceNo = fiscalYear.FiscalYearFormatted + "-" + billtxn.InvoiceCode + billtxn.InvoiceNo.ToString(),
                                         ServiceDepartmentName = srvDept.ServiceDepartmentName,
                                         ItemName = itms.ItemName,
                                         Amount = itms.TotalAmount,
                                         Quantity = itms.Quantity,
                                         Price = itms.Price,
                                         Discount = itms.DiscountAmount,
                                         Tax = itms.Tax,
                                         SubTotal = itms.SubTotal,

                                     }).OrderByDescending(a => a.Date).ToList();

                    var unpaidItems = (from crdItems in dbContext.BillingTransactionItems
                                       join srvDept in dbContext.ServiceDepartment on crdItems.ServiceDepartmentId equals srvDept.ServiceDepartmentId
                                       join billtxn in dbContext.BillingTransactions on crdItems.BillingTransactionId equals billtxn.BillingTransactionId
                                       join fiscalYear in dbContext.BillingFiscalYears on billtxn.FiscalYearId equals fiscalYear.FiscalYearId
                                       where crdItems.PatientId == patientId && crdItems.BillStatus == "unpaid"
                                       && (crdItems.IsInsurance == false || crdItems.IsInsurance == null)
                                       select new
                                       {
                                           TransactionItemId = crdItems.BillingTransactionItemId,
                                           Date = crdItems.CreatedOn,
                                           InvoiceNo = fiscalYear.FiscalYearFormatted + "-" + billtxn.InvoiceCode + billtxn.InvoiceNo.ToString(),
                                           ServiceDepartmentName = srvDept.ServiceDepartmentName,
                                           ItemName = crdItems.ItemName,
                                           Amount = crdItems.TotalAmount,
                                           Quantity = crdItems.Quantity,
                                           Discount = crdItems.DiscountAmount,
                                           Tax = crdItems.Tax,
                                           SubTotal = crdItems.SubTotal,

                                       }).OrderByDescending(a => a.Date).ToList();

                    var returnedItems = (from rtnItems in dbContext.BillingTransactionItems
                                         join srvDept in dbContext.ServiceDepartment on rtnItems.ServiceDepartmentId equals srvDept.ServiceDepartmentId
                                         join billtxn in dbContext.BillingTransactions on rtnItems.BillingTransactionId equals billtxn.BillingTransactionId
                                         join fiscalYear in dbContext.BillingFiscalYears on billtxn.FiscalYearId equals fiscalYear.FiscalYearId
                                         where rtnItems.PatientId == patientId
                                         && billtxn.ReturnStatus == true
                                         && (billtxn.BillStatus == "paid" || billtxn.BillStatus == "unpaid")
                                          && (rtnItems.IsInsurance == false || rtnItems.IsInsurance == null)
                                         select new
                                         {
                                             TransactionItemId = rtnItems.BillingTransactionItemId,
                                             Date = rtnItems.CreatedOn,
                                             InvoiceNo = fiscalYear.FiscalYearFormatted + "-" + billtxn.InvoiceCode + billtxn.InvoiceNo.ToString(),
                                             ServiceDepartmentName = srvDept.ServiceDepartmentName,
                                             ItemName = rtnItems.ItemName,
                                             Amount = rtnItems.TotalAmount,
                                             Quantity = rtnItems.Quantity,
                                             Discount = rtnItems.DiscountAmount,
                                             Tax = rtnItems.Tax,
                                             SubTotal = rtnItems.SubTotal,

                                         }).OrderByDescending(a => a.Date).ToList();
                    var insuranceItems = (from insrItems in dbContext.BillingTransactionItems
                                          join srvDept in dbContext.ServiceDepartment on insrItems.ServiceDepartmentId equals srvDept.ServiceDepartmentId
                                          join billtxn in dbContext.BillingTransactions on insrItems.BillingTransactionId equals billtxn.BillingTransactionId
                                          join fiscalYear in dbContext.BillingFiscalYears on billtxn.FiscalYearId equals fiscalYear.FiscalYearId
                                          where insrItems.PatientId == patientId && billtxn.IsInsuranceBilling == true
                                          select new
                                          {
                                              TransactionItemId = insrItems.BillingTransactionItemId,
                                              Date = insrItems.CreatedOn,
                                              InvoiceNo = fiscalYear.FiscalYearFormatted + "-" + billtxn.InvoiceCode + billtxn.InvoiceNo.ToString(),
                                              ServiceDepartmentName = srvDept.ServiceDepartmentName,
                                              ItemName = insrItems.ItemName,
                                              Amount = insrItems.TotalAmount,
                                              Quantity = insrItems.Quantity,
                                              Discount = insrItems.DiscountAmount,
                                              Tax = insrItems.Tax,
                                              SubTotal = insrItems.SubTotal,

                                          }).OrderByDescending(a => a.Date).ToList();

                    var settlements = (from settlement in dbContext.BillSettlements
                                       where settlement.PatientId == patientId
                                       select new
                                       {
                                           SettlementId = settlement.SettlementId,
                                           SettlementReceipt = "SR" + settlement.SettlementReceiptNo.ToString(),
                                           SettlementDate = settlement.SettlementDate,
                                           PaidAmount = settlement.PaidAmount,
                                       }).OrderByDescending(a => a.SettlementDate).ToList();
                    var deposits = (from deposit in dbContext.BillingDeposits
                                    join biltxn in dbContext.BillingTransactions on deposit.BillingTransactionId equals biltxn.BillingTransactionId into biltxnTemp
                                    from billingtxn in biltxnTemp.DefaultIfEmpty()
                                    join settlement in dbContext.BillSettlements on deposit.SettlementId equals settlement.SettlementId into settlementTemp
                                    from billSettlement in settlementTemp.DefaultIfEmpty()
                                    where deposit.PatientId == patientId
                                    select new
                                    {
                                        DepositId = deposit.DepositId,
                                        ReceiptNum = deposit.ReceiptNo, //used only to check whether No exists or not in client side
                                        ReceiptNo = "DR" + deposit.ReceiptNo.ToString(),
                                        Date = deposit.CreatedOn,
                                        Amount = deposit.Amount,
                                        Balance = deposit.DepositBalance,
                                        DepositType = deposit.DepositType,
                                        SettlementInvoice = deposit.SettlementId != null ? "SR " + billSettlement.SettlementReceiptNo.ToString() : null,
                                        ReferenceInvoice = billingtxn.InvoiceCode + billingtxn.InvoiceNo,
                                    }).OrderBy(a => a.Date).ToList();

                    var CancelItems = (from cancelItems in dbContext.BillingTransactionItems
                                       join fiscalYear in dbContext.BillingFiscalYears on cancelItems.ProvisionalFiscalYearId equals fiscalYear.FiscalYearId
                                       where cancelItems.PatientId == patientId
                                       && cancelItems.BillStatus == "cancel"
                                       && (cancelItems.IsInsurance == false || cancelItems.IsInsurance == null)
                                       select new
                                       {
                                           TransactionItemId = cancelItems.BillingTransactionItemId,
                                           CreatedDate = cancelItems.CreatedOn,
                                           CancelledDate = cancelItems.CancelledOn,
                                           ItemName = cancelItems.ItemName,
                                           ServiceDepartmentName = cancelItems.ServiceDepartmentName,
                                           Amount = cancelItems.TotalAmount,
                                           Quantity = cancelItems.Quantity,
                                           Discount = cancelItems.DiscountAmount,
                                           Tax = cancelItems.Tax,
                                           SubTotal = cancelItems.SubTotal,
                                           BillStatus = cancelItems.BillStatus,
                                       }).OrderByDescending(a => a.CancelledDate).ToList();


                    responseData.Results = new
                    {
                        IsLoaded = true,
                        PatientId = patientId,
                        Invoices = invoices,
                        ProvisionalItems = provisionalItems,
                        Settlements = settlements,
                        PaidItems = paidItems,
                        UnpaidItems = unpaidItems,
                        Deposits = deposits,
                        ReturnedItems = returnedItems,
                        InsuranceItems = insuranceItems,
                        CancelledItems = CancelItems

                    };

                }

                #region  //4.("billItemRequisition")  get price of doctor from Appointment
                else if (reqType == "OPDRequisitionItem")
                {
                    //patientvisitid is requisitionid for opd-ticket
                    Int64 patientVisitId = Convert.ToInt64(requisitionId);
                    BillItemRequisition billItem = (from bill in dbContext.BillItemRequisitions.Include("Patient")
                                                    where bill.RequisitionId == patientVisitId
                                                    select bill).FirstOrDefault();
                    responseData.Results = billItem;
                }
                //Doctor Order Pay All //to s
                else if (reqType == "DoctorOrdersFromAllDepartments")
                {
                    List<BillItemRequisition> billItem = (from billtot in dbContext.BillItemRequisitions
                                                          where billtot.PatientId == patientId && billtot.BillStatus == "pending"
                                                          select billtot).ToList();
                    responseData.Results = billItem;
                }
                #endregion

                #region  //5.("billitemreqpatientdetails") to get the order requested from the doctor to show on the billing transaction view
                else if (reqType == "pendingReqsByDeptname")
                {
                    var pendingRequests = (from req in dbContext.BillItemRequisitions
                                           where req.PatientId == patientId && req.BillStatus == "pending"
                                           && req.ServiceDepartmentId == serviceDeptId
                                           select req).ToList();
                    //commented: sud: 21May'18 -- simply return billitemRequisitions, no need to complicate this.

                    //var pendingRequests = (from bill in dbContext.BillItemRequisitions
                    //                       join doc in dbContext.Employee on bill.ProviderId equals doc.EmployeeId
                    //                       where (bill.PatientId == patientId && bill.BillStatus == "pending"
                    //                       && bill.ServiceDepartmentId == serviceDeptId)
                    //                       select new
                    //                       {
                    //                           bill.BillItemRequisitionId,
                    //                           bill.BillStatus,
                    //                           bill.DepartmentName,
                    //                           bill.ItemId,
                    //                           bill.ItemName,
                    //                           bill.Quantity,
                    //                           bill.Price,
                    //                           bill.PatientId,
                    //                           bill.PatientVisitId,
                    //                           bill.ProcedureCode,
                    //                           bill.ProviderId,
                    //                           bill.RequisitionId,
                    //                           bill.ServiceDepartmentId,
                    //                           bill.CreatedBy,
                    //                           bill.CreatedOn,
                    //                           bill.AssignedTo,
                    //                           RequestedBy = doc.FirstName + " " + (string.IsNullOrEmpty(doc.MiddleName) ? "" : doc.MiddleName + " ") + doc.LastName
                    //                       }).ToList();
                    responseData.Results = "OK";
                    responseData.Results = pendingRequests;

                }
                #endregion
                // Reporting Departmentwise---move to reporting controller : sudarshan:11June'17
                else if (reqType == "departmentwiseReport")
                {
                    var result = (from val in dbContext.BillingTransactionItems.Include("BillingTransactions")
                                  where val.BillStatus == "paid"
                                  group val by new { val.ServiceDepartmentName } into p
                                  select new
                                  {
                                      ServiceDepartmentName = p.Key.ServiceDepartmentName,
                                      ProductCount = p.Count()
                                  }).ToList();
                    responseData.Results = result;
                }




                #region  //5.("service") to generate the items from selecting the department 
                else if (reqType == "serviceDeptItems" && serviceDeptId != 0)
                {

                    List<BillingItemVM> itemList = (List<BillingItemVM>)DanpheCache.Get("billItem-srvdept-" + serviceDeptId);
                    if (itemList == null)
                    {
                        ServiceDepartmentModel serviceDept = (from service in dbContext.ServiceDepartment.Include("BillItemPriceList")
                                                              where service.ServiceDepartmentId == serviceDeptId
                                                              select service).FirstOrDefault();
                        if (serviceDept.BillItemPriceList.Count != 0)
                        {
                            itemList = serviceDept.BillItemPriceList
                                                        .Where(itm => itm.IsActive == true)//Include only Active Items-sud:7Aug'17.
                                                        .Select(t => new BillingItemVM  //mapping to the billing and Test items Format 
                                                        {
                                                            ProcedureCode = t.ProcedureCode,
                                                            ItemName = t.ItemName,
                                                            ItemPrice = t.Price,
                                                            ItemId = t.ItemId,
                                                            TaxApplicable = t.TaxApplicable,
                                                        }).ToList();

                            DanpheCache.Add("billItem-srvdept-" + serviceDeptId, itemList, DateTime.Now.AddMinutes(cacheExpMinutes));

                        }
                    }

                    responseData.Results = itemList;

                }
                else if (reqType == "billItemList")
                {
                    var itemList = (from item in dbContext.BillItemPrice
                                    join srv in dbContext.ServiceDepartment on item.ServiceDepartmentId equals srv.ServiceDepartmentId
                                    where item.IsActive == true
                                    && item.IsInsurancePackage == false
                                    && item.IsNormalPriceApplicable == true
                                    select new
                                    {
                                        BillItemPriceId = item.BillItemPriceId,
                                        ServiceDepartmentId = srv.ServiceDepartmentId,
                                        ServiceDepartmentName = srv.ServiceDepartmentName,
                                        ServiceDepartmentShortName = srv.ServiceDepartmentShortName,
                                        SrvDeptIntegrationName = srv.IntegrationName,
                                        Displayseq = item.DisplaySeq,
                                        ItemId = item.ItemId,
                                        ItemName = item.ItemName,
                                        ProcedureCode = item.ProcedureCode,
                                        Price = item.Price,
                                        TaxApplicable = item.TaxApplicable,
                                        DiscountApplicable = item.DiscountApplicable,
                                        Description = item.Description,
                                        IsDoctorMandatory = item.IsDoctorMandatory,
                                        NormalPrice = item.Price,
                                        EHSPrice = item.EHSPrice != null ? item.EHSPrice : 0, //sud:25Feb'19--For different price categories
                                        SAARCCitizenPrice = item.SAARCCitizenPrice != null ? item.SAARCCitizenPrice : 0,//sud:25Feb'19--For different price categories
                                        ForeignerPrice = item.ForeignerPrice != null ? item.ForeignerPrice : 0,//sud:25Feb'19--For different price categories
                                        GovtInsurancePrice = item.GovtInsurancePrice != null ? item.GovtInsurancePrice : 0,//sud:25Feb'19--For different price categories

                                        Doctor = (from doc in dbContext.Employee.DefaultIfEmpty()
                                                  where doc.IsAppointmentApplicable == true && doc.EmployeeId == item.ItemId && srv.ServiceDepartmentName == "OPD"
                                                  && srv.ServiceDepartmentId == item.ServiceDepartmentId
                                                  select new
                                                  {
                                                      //Temporary logic, correct it later on... 
                                                      DoctorId = doc != null ? doc.EmployeeId : 0,
                                                      DoctorName = doc != null ? doc.FirstName + " " + (string.IsNullOrEmpty(doc.MiddleName) ? doc.MiddleName + " " : "") + doc.LastName : "",
                                                  }).FirstOrDefault(),

                                        IsNormalPriceApplicable = item.IsNormalPriceApplicable,
                                        IsEHSPriceApplicable = item.IsEHSPriceApplicable,
                                        IsForeignerPriceApplicable = item.IsForeignerPriceApplicable,
                                        IsSAARCPriceApplicable = item.IsSAARCPriceApplicable


                                    }).ToList().OrderBy(a => a.Displayseq);
                    responseData.Status = "OK";
                    responseData.Results = itemList;

                }
                #endregion

                #region  //6.("getallitemreqfromdoctor")To show the all the department's request order from the doctor to the Billing View

                else if (reqType == "pendingDoctorOrderTotal")
                {
                    var requestDetails = (from billItemReq in dbContext.BillItemRequisitions
                                          join pat in dbContext.Patient.Include("CountrySubDivision") on billItemReq.PatientId equals pat.PatientId
                                          join item in dbContext.BillItemPrice on billItemReq.ItemId equals item.ItemId
                                          join doc in dbContext.Employee on billItemReq.ProviderId equals doc.EmployeeId
                                          join srvDpt in dbContext.ServiceDepartment on billItemReq.ServiceDepartmentId equals srvDpt.ServiceDepartmentId
                                          where (billItemReq.BillStatus == "pending" && billItemReq.ServiceDepartmentId == item.ServiceDepartmentId)
                                          group new { billItemReq, doc, srvDpt, pat } by new
                                          {
                                              billItemReq.PatientId,
                                              //billItemReq.Patient.PatientCode,
                                              //billItemReq.Patient.FirstName,
                                              //billItemReq.Patient.LastName,
                                              //billItemReq.Patient.MiddleName,
                                              //billItemReq.Patient.PhoneNumber,
                                              //billItemReq.Patient.Gender,
                                              srvDpt.ServiceDepartmentName,
                                              srvDpt.ServiceDepartmentId,
                                              pat,
                                              //billItemReq.CreatedBy,
                                              DSalutation = doc.Salutation,//sud:13Mar'19--need to get doctor's salutation as well..
                                              DFirstName = doc.FirstName,
                                              DMiddleName = doc.MiddleName,
                                              DLastName = doc.LastName
                                          } into r
                                          select new
                                          {
                                              //add more patient information if required.: sud-14May'18
                                              Patient = new
                                              {
                                                  PatientId = r.Key.pat.PatientId,
                                                  ShortName = r.Key.pat.FirstName + " " + (string.IsNullOrEmpty(r.Key.pat.MiddleName) ? "" : r.Key.pat.MiddleName + " ") + r.Key.pat.LastName,
                                                  PatientCode = r.Key.pat.PatientCode,
                                                  PhoneNumber = r.Key.pat.PhoneNumber,
                                                  Gender = r.Key.pat.Gender,
                                                  Address = r.Key.pat.Address,
                                                  DateOfBirth = r.Key.pat.DateOfBirth.Value,
                                                  CountrySubDivision = r.Key.pat.CountrySubDivision.CountrySubDivisionName,
                                                  PANNumber = r.Key.pat.PANNumber
                                              },

                                              PatientId = r.Key.PatientId,
                                              RequestDate = r.Max(a => a.billItemReq.CreatedOn),
                                              ServiceDepartmentName = r.Key.ServiceDepartmentName, //departmentName should be provided to show item on Txn view 
                                              ServiceDepatmentId = r.Key.ServiceDepartmentId,
                                              TotalAmount = r.Sum(a => a.billItemReq.Price * a.billItemReq.Quantity),
                                              RequestedBy = (string.IsNullOrEmpty(r.Key.DSalutation) ? "" : r.Key.DSalutation + ". ") + r.Key.DFirstName + " " + (string.IsNullOrEmpty(r.Key.DMiddleName) ? "" : r.Key.DMiddleName + " ") + r.Key.DLastName,

                                          }).OrderByDescending(a => a.RequestDate).ToList();
                    responseData.Status = "OK";
                    responseData.Results = requestDetails;
                }
                #endregion

                //Load all nursing order related one patient by PatientId
                else if (reqType == "nursingOrderList" && reqType != null)
                {
                    var nursingOrderList = (from bill in dbContext.BillItemRequisitions
                                            join srvDpt in dbContext.ServiceDepartment
                                            on bill.ServiceDepartmentId equals srvDpt.ServiceDepartmentId
                                            where bill.PatientId == patientId
                                            orderby bill.CreatedOn descending
                                            select new
                                            {
                                                DepartmentName = srvDpt.ServiceDepartmentName,
                                                ItemName = bill.ItemName,
                                                Quantity = bill.Quantity,
                                                BillStatus = bill.BillStatus,
                                                CreatedOn = bill.CreatedOn
                                            }

                                            ).ToList();
                    responseData.Results = nursingOrderList;
                }

                else if (reqType == "listpatientforCancellation")
                {
                    List<BillItemRequisition> pendingRequests = (from bill in dbContext.BillItemRequisitions
                                                                 where (bill.PatientId == patientId && bill.BillStatus == "pending"
                                                                 && bill.DepartmentName.ToLower() == departmentName.ToLower())
                                                                 select bill).ToList();
                    responseData.Results = pendingRequests;

                }
                //" Requisition Cancellation"
                else if (reqType != null && reqType == "unpaidBillsbyPatientIdForCancellation" && InputId != null && InputId != 0)
                {
                    //for this request type, patientid comes as inputid.
                    var patientUnpaidCancl = (from bill in dbContext.BillItemRequisitions.Include("Patient")
                                              where bill.BillStatus == "pending" && bill.PatientId == InputId
                                              select bill).ToList<BillItemRequisition>().OrderBy(b => b.ServiceDepartmentId);

                    responseData.Results = patientUnpaidCancl;


                }
                // Credit Cancellation 
                else if (reqType != null && reqType == "unpaidBillsbyPatientIdForCreditCancellation" && InputId != null && InputId != 0)
                {
                    //for this request type, patientid comes as inputid.
                    var patientUnpaidCancl = (from bill in dbContext.BillingTransactionItems.Include("Patient")
                                              where bill.BillStatus == "provisional" && bill.PatientId == InputId
                                              select bill).ToList<BillingTransactionItemModel>()
                                              .OrderBy(b => b.ServiceDepartmentId).ToList();

                    responseData.Results = patientUnpaidCancl;


                }


                else if (reqType == "getCounter")
                {
                    var getCounter = (from counter in dbContext.BillingCounter
                                      select counter
                                      ).ToList<BillingCounter>().OrderBy(b => b.CounterId);
                    responseData.Results = getCounter;
                }

                else if (reqType != null && reqType == "GetTxnItemsForEditDoctor")
                {
                    //PatientDbContext patientDbContext = new PatientDbContext(connString);
                    //List<ServiceDepartmentModel> allServDepts = dbContext.ServiceDepartment.ToList();
                    //OPD items cannot be edited -- Business Rule (MNK)--sud: 11Aug'17
                    List<string> excludedServicedeptNames = new List<string>() { "OPD", "EMERGENCY" };

                    //get list of servicedepartments where Edit Doctor is applicable. 
                    var srvDeptsWithEditApplicable = dbContext.ServiceDepartment.Where(a => !excludedServicedeptNames.Contains(a.ServiceDepartmentName));

                    //this is because we have to get data till todate not in between todate to fromdate 
                    //so i m adding  1 day to the todate 
                    //var toDate = ToDate.AddDays(1);
                    //List<PatientModel> allPatients = dbContext.Patient.AsEnumerable().ToList();
                    int searchListLength = 0;//this is default value.
                    List<ParameterModel> allParams = coreDbContext.Parameters.ToList();

                    ParameterModel listNumber = allParams.Where(a => a.ParameterGroupName == "Common" && a.ParameterName == "ServerSideSearchListLength").FirstOrDefault<ParameterModel>();
                    if (listNumber != null)
                    {
                        searchListLength = Convert.ToInt32(listNumber.ParameterValue);
                    }

                    if (search == null)
                    {
                        if (string.IsNullOrEmpty(FromDate) && string.IsNullOrEmpty(ToDate))
                        {
                            var TxnItemList = (from itm in dbContext.BillingTransactionItems.Include("BillingTransaction")
                                               join ser in srvDeptsWithEditApplicable on itm.ServiceDepartmentId equals ser.ServiceDepartmentId
                                               join pat in dbContext.Patient on itm.PatientId equals pat.PatientId
                                               from emp in dbContext.Employee.Where(emp => emp.EmployeeId == itm.ProviderId).DefaultIfEmpty()
                                               where itm.BillStatus != "cancel" && itm.ReturnStatus != true
                                               select new
                                               {
                                                   Date = itm.CreatedOn,
                                                   ServiceDepartmentId = itm.ServiceDepartmentId,
                                                   ServiceDepartmentName = ser.ServiceDepartmentName,
                                                   ItemId = itm.ItemId,
                                                   ItemName = itm.ItemName,
                                                   ProviderId = itm.ProviderId,
                                                   ProviderName = emp.FirstName + " " + (string.IsNullOrEmpty(emp.MiddleName) ? "" : emp.MiddleName + " ") + emp.LastName,
                                                   PatientId = itm.PatientId,
                                                   BillingTransactionItemId = itm.BillingTransactionItemId,
                                                   ReceiptNo = itm.BillingTransaction != null ? itm.BillingTransaction.InvoiceCode + itm.BillingTransaction.InvoiceNo : "",
                                                   PatientName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                                   DateOfBirth = pat.DateOfBirth,
                                                   Gender = pat.Gender,
                                                   PhoneNumber = pat.PhoneNumber,
                                                   BillingTransactionId = itm.BillingTransactionId != null ? itm.BillingTransactionId : 0,  //Zero if NULL. 
                                                   PatientCode = pat.PatientCode,
                                               }).OrderByDescending(a => a.BillingTransactionItemId).Take(searchListLength).ToList();
                            responseData.Results = TxnItemList;
                        }
                        else // for search by Date. / sud/yub:11Aug'19 - return all items in matching date range.
                        {
                            //by default fromdate-todate will be today. convert incoming from-to dates string to startdate, enddate
                            DateTime startDate = DateTime.Today;
                            DateTime endDate = DateTime.Today;

                            DateTime.TryParse(FromDate, out startDate);
                            DateTime.TryParse(ToDate, out endDate);

                            var TxnItemList = (from itm in dbContext.BillingTransactionItems.Include("BillingTransaction")
                                               join ser in srvDeptsWithEditApplicable on itm.ServiceDepartmentId equals ser.ServiceDepartmentId
                                               join pat in dbContext.Patient on itm.PatientId equals pat.PatientId

                                               from emp in dbContext.Employee.Where(emp => emp.EmployeeId == itm.ProviderId).DefaultIfEmpty()

                                               where itm.BillStatus != "cancel" && itm.ReturnStatus != true
                                                  && (DbFunctions.TruncateTime(itm.CreatedOn) >= startDate.Date && DbFunctions.TruncateTime(itm.CreatedOn) <= endDate.Date)
                                               select new
                                               {
                                                   Date = itm.CreatedOn,
                                                   ServiceDepartmentId = itm.ServiceDepartmentId,
                                                   ServiceDepartmentName = ser.ServiceDepartmentName,
                                                   ItemId = itm.ItemId,
                                                   ItemName = itm.ItemName,
                                                   ProviderId = itm.ProviderId,
                                                   ProviderName = emp.FirstName + " " + (string.IsNullOrEmpty(emp.MiddleName) ? "" : emp.MiddleName + " ") + emp.LastName,
                                                   PatientId = itm.PatientId,
                                                   BillingTransactionItemId = itm.BillingTransactionItemId,
                                                   ReceiptNo = itm.BillingTransaction != null ? itm.BillingTransaction.InvoiceCode + itm.BillingTransaction.InvoiceNo : "",
                                                   PatientName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                                   DateOfBirth = pat.DateOfBirth,
                                                   Gender = pat.Gender,
                                                   PhoneNumber = pat.PhoneNumber,
                                                   BillingTransactionId = itm.BillingTransactionId != null ? itm.BillingTransactionId : 0,  //Zero if NULL. 
                                                   PatientCode = pat.PatientCode,
                                               }).OrderByDescending(a => a.BillingTransactionItemId).ToList();
                            responseData.Results = TxnItemList;

                        }



                    }
                    else
                    {
                        var TxnItemList = (from itm in dbContext.BillingTransactionItems.Include("BillingTransaction")
                                           join ser in srvDeptsWithEditApplicable on itm.ServiceDepartmentId equals ser.ServiceDepartmentId
                                           join pat in dbContext.Patient on itm.PatientId equals pat.PatientId
                                           from emp in dbContext.Employee.Where(emp => emp.EmployeeId == itm.ProviderId).DefaultIfEmpty() //using left join yub--30th Sept 2018.
                                           where
                                              itm.BillStatus != "cancel" && itm.ReturnStatus != true
                                              &&

                                           (pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName
                                           + pat.PatientCode
                                           + pat.PhoneNumber
                                           + ser.ServiceDepartmentName
                                           + itm.ItemName
                                           ).Contains(search)
                                           select new
                                           {
                                               Date = itm.CreatedOn,
                                               ServiceDepartmentId = itm.ServiceDepartmentId,
                                               ServiceDepartmentName = ser.ServiceDepartmentName,
                                               ItemId = itm.ItemId,
                                               ItemName = itm.ItemName,
                                               ProviderId = itm.ProviderId,
                                               ProviderName = emp.FirstName + " " + (string.IsNullOrEmpty(emp.MiddleName) ? "" : emp.MiddleName + " ") + emp.LastName,
                                               PatientId = itm.PatientId,
                                               BillingTransactionItemId = itm.BillingTransactionItemId,
                                               //receiptno here is: invoice code+ invoicenumber//added: sud-21May'18
                                               ReceiptNo = itm.BillingTransaction != null ? itm.BillingTransaction.InvoiceCode + itm.BillingTransaction.InvoiceNo : "",
                                               PatientName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                               DateOfBirth = pat.DateOfBirth,
                                               Gender = pat.Gender,
                                               PhoneNumber = pat.PhoneNumber,
                                               BillingTransactionId = itm.BillingTransactionId != null ? itm.BillingTransactionId : 0,  //Zero if NULL. 
                                               PatientCode = pat.PatientCode,
                                           }).OrderByDescending(a => a.BillingTransactionItemId).Take(searchListLength).ToList();

                        responseData.Results = TxnItemList;
                    }

                }
                else if (reqType != null && reqType == "opd-doctors-list")
                {
                    var opdDocs = (from itm in dbContext.BillItemPrice
                                   join srvDpt in dbContext.ServiceDepartment
                                   on itm.ServiceDepartmentId equals srvDpt.ServiceDepartmentId
                                   where srvDpt.ServiceDepartmentName == "OPD"
                                   join emp in dbContext.Employee
                                   on itm.ItemId equals emp.EmployeeId
                                   select new
                                   {
                                       EmployeeId = emp.EmployeeId,
                                       EmployeeName = emp.FirstName + " " + (string.IsNullOrEmpty(emp.MiddleName) ? "" : emp.MiddleName + " ") + emp.LastName,
                                       DepartmentId = emp.DepartmentId,
                                       ServiceDepartmentId = srvDpt.ServiceDepartmentId,
                                       OPDPrice = itm.Price,
                                       ItemName = itm.ItemName,
                                   }).ToList();


                    //MasterDbContext mstDBContext = new MasterDbContext(connString);


                    //var docotorList = (from emp in mstDBContext.Employee
                    //                   join dep in mstDBContext.Departments on emp.DepartmentId equals dep.DepartmentId
                    //                   where dep.IsAppointmentApplicable == true
                    //                   select emp)
                    //                   .ToList().Select(emp => new { EmployeeId = emp.EmployeeId, EmployeeName = emp.FullName });
                    responseData.Results = opdDocs;
                }
                else if (reqType != null && reqType == "GetProviderList")
                {
                    ////sud: 15Jun'18 -- removed departmentjoin as IsAppointmentApplicable field is now added in Employee Level as well.
                    //MasterDbContext mstDBContext = new MasterDbContext(connString);
                    //var docotorList = (from emp in mstDBContext.Employees
                    //                   join dep in mstDBContext.Departments on emp.DepartmentId equals dep.DepartmentId
                    //                   where dep.IsAppointmentApplicable == true
                    //                   select emp)
                    //                   .ToList().Select(emp => new { EmployeeId = emp.EmployeeId, EmployeeName = emp.FullName });

                    List<EmployeeModel> empListFromCache = (List<EmployeeModel>)DanpheCache.GetMasterData(MasterDataEnum.Employee);
                    var docotorList = empListFromCache.Where(emp => emp.IsAppointmentApplicable.HasValue
                                                          && emp.IsAppointmentApplicable == true).ToList()
                                                          .Select(emp => new { EmployeeId = emp.EmployeeId, EmployeeName = emp.FullName });


                    responseData.Results = docotorList;
                }
                else if (reqType == "doctor-list")
                {
                    //sud:9Aug'18--isappointmentapplicable field can be taken from employee now.. 
                    MasterDbContext mstDBContext = new MasterDbContext(connString);
                    var doctorList = (from e in mstDBContext.Employees
                                      where e.IsAppointmentApplicable.HasValue && e.IsAppointmentApplicable == true
                                      //sud:13Mar'19--get only Isactive=True doctors..
                                      && e.IsActive == true
                                      select e).ToList();
                    responseData.Results = doctorList;
                }

                else if (reqType == "billing-packageList")
                {
                    List<BillingPackageModel> packageList = dbContext.BillingPackages.Where(a => a.IsActive == true && a.InsuranceApplicable == false).ToList();
                    if (packageList.Count > 0)
                    {
                        foreach (var package in packageList)
                        {
                            XmlDocument doc = new XmlDocument();
                            doc.LoadXml(package.BillingItemsXML);
                            package.BillingItemsXML = JsonConvert.SerializeXmlNode(doc, Newtonsoft.Json.Formatting.None, true);
                        }
                    }
                    responseData.Status = "OK";
                    responseData.Results = packageList;
                }
                //if none of the request type matches, then return Failed Status
                else if (reqType == "getLatestReceiptNo")
                {
                    int ReceiptNo = (from txn in dbContext.BillingTransactions
                                     select txn.InvoiceNo.Value).ToList().OrderByDescending(a => a).First();

                    responseData.Status = "OK";
                    responseData.Results = ReceiptNo;
                }
                else if (reqType == "all-fiscalYears")
                {
                    responseData.Results = dbContext.BillingFiscalYears.ToList();
                    responseData.Status = "OK";
                }
                else if (reqType == "current-fiscalYear")
                {
                    responseData.Results = BillingBL.GetFiscalYear(connString);
                    responseData.Status = "OK";
                }
                else if (reqType == "get-previous-amount")
                {
                    var todayDate = DateTime.Now.Date;
                    //BillingHandoverModel handoverDetail = (from amt in dbContext.Handover
                    //                               where amt.CreatedOn == todayDate
                    //                               select amt).OrderByDescending(a => a.HandoverId).FirstOrDefault();

                    BillingHandoverModel handoverDetail = new BillingHandoverModel();
                    List<BillingHandoverModel> handover = (from amt in dbContext.Handover
                                                           where amt.UserId == currentUser.UserId //getting indiviual user handover information
                                                           select amt).ToList();

                    handover.ForEach(val =>
                    {
                        if (val.CreatedOn.HasValue ? val.CreatedOn.Value.Date == todayDate : false)
                        {
                            handoverDetail = val;
                        }
                    });

                    responseData.Status = "OK";
                    responseData.Results = handoverDetail;
                }
                else if (reqType == "patient-billing-context")
                {

                    var currPat = dbContext.Patient.Where(p => p.PatientId == patientId).FirstOrDefault();
                    PatientBillingContextVM currBillContext = new PatientBillingContextVM();

                    if (currPat != null)
                    {
                        //get latest bed assigned to this patient if not discharged.
                        var adtDetail = (from adm in dbContext.Admissions
                                         where adm.PatientId == currPat.PatientId && adm.AdmissionStatus == "admitted"
                                         join beds in dbContext.PatientBedInfos
                                         on adm.PatientVisitId equals beds.PatientVisitId
                                         select new
                                         {
                                             BedInfo = beds,
                                             adm.PatientVisitId //added: ashim : 08Aug2018 : to update PatientVisitId in Depoist.

                                         }).OrderByDescending(adt => adt.BedInfo.PatientBedInfoId).FirstOrDefault();

                        int? requestingDeptId = null;
                        string billingType = "outpatient";//by default its outpatient
                        int? patientVisitId = null;
                        if (adtDetail != null)
                        {
                            requestingDeptId = adtDetail.BedInfo.RequestingDeptId;
                            patientVisitId = adtDetail.PatientVisitId;
                            billingType = "inpatient";
                        }
                        //added: ashim : 08Aug2018 : to update PatientVisitId in Depoist.
                        else
                        {
                            VisitModel patientVisit = dbContext.Visit.Where(visit => visit.PatientId == currPat.PatientId)
                                    .OrderByDescending(a => a.PatientVisitId)
                                    .FirstOrDefault();
                            //if the latest visit is inpatient even the patient was discharged use null for visitId
                            if (patientVisit != null && patientVisit.VisitType.ToLower() != "inpatient")
                            {
                                patientVisitId = (int?)patientVisit.PatientVisitId;
                            }
                        }

                        //for insurance details
                        currBillContext.Insurance = (from ins in dbContext.Insurances
                                                     join insProvider in dbContext.InsuranceProviders on ins.InsuranceProviderId equals insProvider.InsuranceProviderId
                                                     join pat in dbContext.Patient on ins.PatientId equals pat.PatientId
                                                     where insProvider.InsuranceProviderName == "Government Insurance" && ins.PatientId == currPat.PatientId
                                                     select new InsuranceVM
                                                     {
                                                         PatientId = ins.PatientId,
                                                         InsuranceProviderId = ins.InsuranceProviderId,
                                                         CurrentBalance = ins.CurrentBalance,
                                                         InsuranceNumber = ins.InsuranceNumber,
                                                         IMISCode = ins.IMISCode,
                                                         InsuranceProviderName = insProvider.InsuranceProviderName,
                                                         PatientInsurancePkgTxn = (from pkgTxn in dbContext.PatientInsurancePackageTransactions
                                                                                   join pkg in dbContext.BillingPackages on pkgTxn.PackageId equals pkg.BillingPackageId
                                                                                   where pkgTxn.PatientId == currPat.PatientId && pkgTxn.IsCompleted == false
                                                                                   select new PatientInsurancePkgTxnVM
                                                                                   {
                                                                                       PatientInsurancePackageId = pkgTxn.PatientInsurancePackageId,
                                                                                       PackageId = pkgTxn.PackageId,
                                                                                       PackageName = pkg.BillingPackageName,
                                                                                       StartDate = pkgTxn.StartDate
                                                                                   }).FirstOrDefault()
                                                     }).FirstOrDefault();

                        var patProvisional = (from bill in dbContext.BillingTransactionItems
                                              where bill.PatientId == currPat.PatientId && bill.BillStatus == "provisional" //here PatientId comes as InputId from client.
                                              && bill.IsInsurance == true
                                              group bill by new { bill.PatientId } into p
                                              select new
                                              {
                                                  TotalProvisionalAmt = p.Sum(a => a.TotalAmount)
                                              }).FirstOrDefault();

                        var patProvisionalAmt = patProvisional != null ? patProvisional.TotalProvisionalAmt : 0;
                        if (currBillContext.Insurance != null)
                        {
                            currBillContext.Insurance.InsuranceProvisionalAmount = patProvisionalAmt;
                        }
                        currBillContext.PatientId = currPat.PatientId;
                        currBillContext.BillingType = billingType;
                        currBillContext.RequestingDeptId = requestingDeptId;
                        currBillContext.PatientVisitId = patientVisitId == 0 ? null : patientVisitId;
                    }
                    responseData.Status = "OK";
                    responseData.Results = currBillContext;

                }

                #region Get Health-Card Item
                else if (reqType == "GetHealthCardBillItem")
                {
                    var HealthCardBillItm = (from billItem in dbContext.BillItemPrice
                                             join srvDept in dbContext.ServiceDepartment on billItem.ServiceDepartmentId equals srvDept.ServiceDepartmentId
                                             where billItem.ItemName == "Health Card"
                                             select new
                                             {
                                                 billItem.ItemId,
                                                 billItem.ItemName,
                                                 billItem.ServiceDepartmentId,
                                                 srvDept.ServiceDepartmentName,
                                                 billItem.Price,
                                                 billItem.TaxApplicable
                                             }).FirstOrDefault();


                    responseData.Status = "OK";
                    responseData.Results = HealthCardBillItm;
                }
                #endregion
                //get bill transaction in case of transfer visit
                //pass integrationname and use for other serveice departments if needed.
                //Sud:26June'19--Integration name is mandatory beacause requistionId could match between eg: Labs and Visit.
                else if (reqType == "billTxn-byRequisitioId")
                {

                    var bilTxnId = (from biltxnItem in dbContext.BillingTransactionItems
                                    join srv in dbContext.ServiceDepartment on biltxnItem.ServiceDepartmentId equals srv.ServiceDepartmentId
                                    where biltxnItem.RequisitionId == requisitionId
                                    && srv.IntegrationName.ToLower() == departmentName.ToLower()
                                    && biltxnItem.PatientId == patientId
                                    select biltxnItem.BillingTransactionId).FirstOrDefault();

                    if (bilTxnId != null && bilTxnId.HasValue)
                    {

                        var retVal = new
                        {
                            bill = dbContext.BillingTransactions.Where(b => b.BillingTransactionId == bilTxnId).FirstOrDefault(),
                            billTxnItems = (from txnItem in dbContext.BillingTransactionItems
                                            where txnItem.BillingTransactionId == bilTxnId
                                            select new
                                            {
                                                txnItem.BillingTransactionItemId,
                                                txnItem.ItemName,
                                                txnItem.ItemId,
                                                txnItem.ServiceDepartmentName,
                                                txnItem.Price,
                                                txnItem.Quantity,
                                                txnItem.SubTotal,
                                                txnItem.DiscountAmount,
                                                txnItem.TaxableAmount,
                                                txnItem.Tax,
                                                txnItem.TotalAmount,
                                                txnItem.DiscountPercent,
                                                txnItem.DiscountPercentAgg,
                                                txnItem.ProviderId,
                                                txnItem.ProviderName,
                                                txnItem.BillStatus,
                                                txnItem.RequisitionId,
                                                txnItem.BillingPackageId,
                                                txnItem.TaxPercent,
                                                txnItem.NonTaxableAmount,
                                                txnItem.BillingType,
                                                txnItem.VisitType
                                            }).ToList()
                        };

                        responseData.Results = retVal;
                        responseData.Status = "OK";
                    }
                    else
                    {
                        responseData.Results = null;
                        responseData.Status = "OK";
                    }



                    //var billTxn = (from bill in dbContext.BillingTransactions
                    //               join billTxnItem in dbContext.BillingTransactionItems on bill.BillingTransactionId
                    //               equals billTxnItem.BillingTransactionId
                    //               join srvDept in dbContext.ServiceDepartment
                    //               on billTxnItem.ServiceDepartmentId equals srvDept.ServiceDepartmentId
                    //               where billTxnItem.RequisitionId == requisitionId

                    //               //we need IntegrationName here in all cases.. Don't Remove it...! sud:26June'19
                    //               && srvDept.IntegrationName.ToLower() == departmentName.ToLower()
                    //               select new
                    //               {
                    //                   bill,
                    //                   billTxnItems = (from txnItem in dbContext.BillingTransactionItems
                    //                                   where txnItem.BillingTransactionId == bill.BillingTransactionId
                    //                                   select new
                    //                                   {
                    //                                       txnItem.BillingTransactionItemId,
                    //                                       txnItem.ItemName,
                    //                                       txnItem.ItemId,
                    //                                       txnItem.ServiceDepartmentName,
                    //                                       txnItem.Price,
                    //                                       txnItem.Quantity,
                    //                                       txnItem.SubTotal,
                    //                                       txnItem.DiscountAmount,
                    //                                       txnItem.TaxableAmount,
                    //                                       txnItem.Tax,
                    //                                       txnItem.TotalAmount,
                    //                                       txnItem.DiscountPercent,
                    //                                       txnItem.DiscountPercentAgg,
                    //                                       txnItem.ProviderId,
                    //                                       txnItem.ProviderName,
                    //                                       txnItem.BillStatus,
                    //                                       txnItem.RequisitionId,
                    //                                       txnItem.BillingPackageId,
                    //                                       txnItem.TaxPercent,
                    //                                       txnItem.NonTaxableAmount,
                    //                                       txnItem.BillingType,
                    //                                       txnItem.VisitType
                    //                                   }).ToList()
                    //               }).FirstOrDefault();


                    //var billTxn = (from bill in dbContext.BillingTransactions
                    //               join billTxnItem in dbContext.BillingTransactionItems on bill.BillingTransactionId equals billTxnItem.BillingTransactionId
                    //               join srvDept in dbContext.ServiceDepartment on billTxnItem.ServiceDepartmentId equals srvDept.ServiceDepartmentId
                    //               where billTxnItem.RequisitionId == requisitionId && srvDept.IntegrationName.ToLower() == departmentName.ToLower()
                    //               select new
                    //               {
                    //                   bill,
                    //                   billTxnItems = (from txnItem in dbContext.BillingTransactionItems
                    //                                   where txnItem.BillingTransactionId == bill.BillingTransactionId
                    //                                   select new
                    //                                   {
                    //                                       txnItem.ItemName,
                    //                                       txnItem.TotalAmount
                    //                                   }).ToList()
                    //               }).FirstOrDefault();
                    //responseData.Status = "OK";
                    //responseData.Results = billTxn;

                    //responseData.Status = "OK";
                    //responseData.Results = billTxn;
                }
                else if (reqType == "department-items")
                {
                    //sud: 18Sept'18-- added isActive Clause in bill items..
                    var billingItems = (from item in dbContext.BillItemPrice
                                        join srvDept in dbContext.ServiceDepartment on item.ServiceDepartmentId equals srvDept.ServiceDepartmentId
                                        join dept in dbContext.Departments on srvDept.DepartmentId equals dept.DepartmentId
                                        where item.IsActive == true && dept.DepartmentName.ToLower() == departmentName
                                        select new
                                        {
                                            BillItemPriceId = item.BillItemPriceId,
                                            ServiceDepartmentId = srvDept.ServiceDepartmentId,
                                            ServiceDepartmentName = srvDept.ServiceDepartmentName,
                                            ServiceDepartmentShortName = srvDept.ServiceDepartmentShortName,
                                            Displayseq = item.DisplaySeq,
                                            ItemId = item.ItemId,
                                            ItemName = item.ItemName,
                                            ProcedureCode = item.ProcedureCode,
                                            Price = item.Price,
                                            TaxApplicable = item.TaxApplicable,
                                            DiscountApplicable = item.DiscountApplicable,
                                            Description = item.Description,
                                            IsDoctorMandatory = item.IsDoctorMandatory//sud:5Feb'18--added for ward billing
                                        }).ToList().OrderBy(a => a.Displayseq);
                    responseData.Status = "OK";
                    responseData.Results = billingItems;
                }
                else if (reqType != null && reqType == "admission-bill-items")
                {
                    var billItems = (from bilItem in dbContext.BillItemPrice
                                     join servDept in dbContext.ServiceDepartment on bilItem.ServiceDepartmentId equals servDept.ServiceDepartmentId
                                     where bilItem.IntegrationName == "ADMISSION CHARGES (INDOOR)" || bilItem.IntegrationName == "Medical and Resident officer/Nursing Charges"
                                     || bilItem.IntegrationName == "Medical Record Charge"
                                     select new
                                     {
                                         bilItem.ItemId,
                                         bilItem.ItemName,
                                         bilItem.Price,
                                         bilItem.TaxApplicable,
                                         bilItem.ServiceDepartmentId,
                                         servDept.ServiceDepartmentName,
                                         bilItem.ProcedureCode
                                     }).ToList();

                    responseData.Status = "OK";
                    responseData.Results = billItems;
                }

                else if (reqType == "check-credit-bill")
                {
                    BillingTransactionModel billTxn = dbContext.BillingTransactions.Where(a => a.PatientId == patientId && a.BillStatus == "unpaid" && a.ReturnStatus != true).FirstOrDefault();
                    if (billTxn != null)
                    {
                        responseData.Results = true;
                    }
                    else
                    {
                        responseData.Results = false;
                    }
                    responseData.Status = "OK";
                }
                else if (reqType == "get-credit-organization-list")
                {
                    var orgList = (from co in dbContext.CreditOrganization
                                   where co.IsActive == true
                                   select co).ToList();
                    responseData.Results = orgList;
                }
                //getting user list
                else if (reqType == "get-users-list")
                {
                    //var allUsrs = (from user in rbacDbContext.Users
                    //               where user.IsActive == true
                    //               select user).ToList();
                    //getting userList from Employee table
                    var allUsrs = (from emp in dbContext.Employee
                                   join dep in dbContext.Departments on emp.DepartmentId equals dep.DepartmentId
                                   //join user in rbacDbContext.Users on emp.EmployeeId equals user.EmployeeId
                                   where emp.IsActive == true
                                   //&& user.IsActive==true 
                                   select new
                                   {
                                       ShortName = emp.FirstName + " " + (string.IsNullOrEmpty(emp.MiddleName) ? "" : emp.MiddleName + " ") + emp.LastName,
                                       UserId = emp.EmployeeId,
                                       //UserName=user.UserName,
                                       DepartmentName = dep.DepartmentName
                                   }).ToList();

                    responseData.Status = "OK";
                    responseData.Results = allUsrs;
                }
                else if (reqType == "past-test-list")
                {
                    var numberOfPastDays = (from param in dbContext.AdminParameters
                                            where param.ParameterGroupName.ToLower() == "bill" && param.ParameterName == "PastBillMaximumDays"
                                            select param.ParameterValue).FirstOrDefault();

                    if (numberOfPastDays == null)
                    {
                        numberOfPastDays = "7";
                    }
                    List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@PatientId", patientId), new SqlParameter("@maxPastDays", numberOfPastDays) };
                    DataTable patpastBills = DALFunctions.GetDataTableFromStoredProc("SP_BIL_GetPatientPastBills", paramList, dbContext);


                    //var intNum = 7;
                    //DateTime lastFewDaysDays = DateTime.Now.AddDays(intNum);

                    //var allTestList = (from items in dbContext.BillingTransactionItems
                    //                   where  (items.CreatedOn.HasValue ? items.CreatedOn > lastFewDaysDays : true)
                    //                   && items.PatientId == patientId && items.BillStatus != "cancel"
                    //                   select new
                    //                   {
                    //                       CreatedOn = items.CreatedOn,
                    //                       InvoiceCode = (from billTransaction in dbContext.BillingTransactions
                    //                                      where billTransaction.BillingTransactionId==items.BillingTransactionId
                    //                                      select billTransaction.InvoiceCode).FirstOrDefault(),
                    //                       InvoiceNo = (from billTransaction in dbContext.BillingTransactions
                    //                                    where billTransaction.BillingTransactionId == items.BillingTransactionId
                    //                                    select billTransaction.InvoiceNo).FirstOrDefault(),
                    //                       ServiceDepartmentName = items.ServiceDepartmentName,
                    //                       ItemName = items.ItemName,
                    //                       Price = items.Price,
                    //                       BillStatus = items.BillStatus,
                    //                       CreatedBy = items.CreatedBy
                    //                   }).ToList();



                    responseData.Status = "OK";
                    responseData.Results = patpastBills;
                }
                else
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = "request type is incorrect.";
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
            string serviceDepartment = this.ReadQueryStringData("serviceDepartment");
            string PrinterName = this.ReadQueryStringData("PrinterName");
            string FilePath = this.ReadQueryStringData("FilePath");
            try
            {
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                int CreatedBy = ToInt(this.ReadQueryStringData("CreatedBy"));
                BillingDbContext billingDbContext = new BillingDbContext(connString);
                //ashim: 23Dec2018 Delete this ASAP
                if (reqType == "billTxnItems")//submit
                {
                    //once the items are added to the transactionitem-table, update the status in BillItemRequisition as 'paid'
                    List<BillingTransactionItemModel> billTranItems = DanpheJSONConvert.DeserializeObject<List<BillingTransactionItemModel>>(ipDataString);
                    //int serviceDeptId = dbContext.ServiceDepartment.Where(s=>s.ServiceDepartmentName==service)
                    MasterDbContext masterDbContext = new MasterDbContext(connString);
                    List<EmployeeModel> allEmps = masterDbContext.Employees.ToList();
                    List<ServiceDepartmentModel> allSrvDepts = billingDbContext.ServiceDepartment.ToList();

                    if (billTranItems != null && billTranItems.Count > 0)
                    {
                        //a single bill may contain package items as well as other items.
                        int? packageId = null;
                        bool isInsurancePackage = false;
                        foreach (BillingTransactionItemModel txnItem in billTranItems)
                        {
                            txnItem.CreatedOn = System.DateTime.Now;
                            txnItem.RequisitionDate = System.DateTime.Now;

                            //assign providername and servicedepartmentname to each of the incoming transaction items.
                            //Needs Revision: 12-12-17: sud: I think we don't need to get providername since that property already comes from client side: 
                            txnItem.ProviderName = (from a in allEmps where a.EmployeeId == txnItem.ProviderId select a.FullName).FirstOrDefault();
                            txnItem.ServiceDepartmentName = (from b in allSrvDepts where b.ServiceDepartmentId == txnItem.ServiceDepartmentId select b.ServiceDepartmentName).FirstOrDefault();


                            billingDbContext.BillingTransactionItems.Add(txnItem);
                            //a single bill may contain package items as well as other items.
                            //if any of the item contains insurance-package it must AddPatientInsurancePackage
                            if (txnItem.IsInsurancePackage)
                            {
                                isInsurancePackage = true;
                                packageId = txnItem.BillingPackageId;
                            }
                        }
                        billingDbContext.SaveChanges();
                        if (isInsurancePackage)
                        {
                            BillingBL.AddPatientInsurancePackage(billingDbContext, packageId ?? default(int), billTranItems[0].PatientId, currentUser.EmployeeId);
                        }
                        //update the Requisitions billingstatus as 'paid' for above items. 
                        //List<Int32?> requisitionIds = (from a in billTranItems select a.BillItemRequisitionId).ToList();
                        foreach (var billTransItem in billTranItems)
                        {
                            BillItemRequisition billItemRequisition = new BillItemRequisition();
                            billItemRequisition = (from bill in billingDbContext.BillItemRequisitions
                                                   where bill.RequisitionId == billTransItem.RequisitionId
                                                   && bill.ServiceDepartmentId == billTransItem.ServiceDepartmentId
                                                   select bill).FirstOrDefault();
                            if (billItemRequisition != null)
                            {
                                billItemRequisition.BillStatus = "paid";
                                billingDbContext.Entry(billItemRequisition).State = EntityState.Modified;
                            }

                        }

                        billingDbContext.SaveChanges();
                        responseData.Results = billTranItems;//check if we need to send back all the input array back to client.--sudarshan
                    }
                }

                else if (reqType == "post-billingTransaction")
                {
                    BillingTransactionModel billTransaction = DanpheJSONConvert.DeserializeObject<BillingTransactionModel>(ipDataString);
                    //Transaction Begins  
                    using (var dbContextTransaction = billingDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            billTransaction = BillingTransactionBL.PostBillingTransaction(billingDbContext, connString, billTransaction, currentUser.EmployeeId, DateTime.Now);
                            //RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                            if (billTransaction.IsInsuranceBilling == true)
                            {

                                BillingBL.UpdateInsuranceCurrentBalance(connString,
                                    billTransaction.PatientId,
                                    billTransaction.InsuranceProviderId ?? default(int),
                                    currentUser.EmployeeId, billTransaction.TotalAmount ?? default(int), true);
                            }

                           
                            //Billing User should be assigned from the server side avoiding assigning from client side 
                            //which is causing issue in billing receipt while 2 user loggedIn in the same browser
                            billTransaction.BillingUserName = currentUser.UserName;//Yubaraj: 28June'19

                            responseData.Results = billTransaction;//check if we need to send back all the input object back to client.--sudarshan

                            dbContextTransaction.Commit(); //end of transaction

                           
                            responseData.Status = "OK";
                        }
                        catch (Exception ex)
                        {
                            //rollback all changes if any error occurs
                            dbContextTransaction.Rollback();
                            throw ex;
                        }
                    }
                }

                else if (reqType == "post-billingTransactionItems")
                {
                    //Transaction Begins 
                    List<BillingTransactionItemModel> billTranItems = DanpheJSONConvert.DeserializeObject<List<BillingTransactionItemModel>>(ipDataString);
                    using (var dbContextTransaction = billingDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            if (billTranItems != null && billTranItems.Count > 0)
                            {
                                billTranItems = BillingTransactionBL.PostUpdateBillingTransactionItems(billingDbContext,
                                    connString,
                                    billTranItems,
                                    currentUser.EmployeeId,
                                    DateTime.Now,
                                    billTranItems[0].BillStatus,
                                    billTranItems[0].CounterId);

                                var userName = (from emp in billingDbContext.Employee where emp.EmployeeId == currentUser.EmployeeId select emp.FirstName).FirstOrDefault();
                                billTranItems.ForEach(usr => usr.RequestingUserName = userName);

                                responseData.Results = billTranItems;//check if we need to send back all the input object back to client.--sudarshan
                                dbContextTransaction.Commit(); //end of transaction
                                responseData.Status = "OK";
                            }
                        }
                        catch (Exception ex)
                        {
                            //rollback all changes if any error occurs
                            dbContextTransaction.Rollback();
                            throw ex;
                        }
                    }

                }

                //ashim: 23Dec2018 Delete this ASAP
                else if (reqType == "postBillTransaction")//submit
                {
                    BillingTransactionModel billTransaction = DanpheJSONConvert.DeserializeObject<BillingTransactionModel>(ipDataString);
                    if (billTransaction != null)
                    {
                        //Transaction Begins  
                        using (var dbContextTransaction = billingDbContext.Database.BeginTransaction())
                        {
                            try
                            {
                                //step: 1-- make copy of billingTxnItems into new list, so thate EF doesn't add txn items again.
                                DateTime createdOn = DateTime.Now;
                                List<BillingTransactionItemModel> newTxnItems = new List<BillingTransactionItemModel>();
                                if (billTransaction.BillingTransactionItems != null && billTransaction.BillingTransactionItems.Count > 0)
                                {
                                    foreach (var txnItem in billTransaction.BillingTransactionItems)
                                    {
                                        newTxnItems.Add(BillingTransactionItemModel.GetClone(txnItem));
                                    }
                                    billTransaction.BillingTransactionItems = null;
                                }
                                //if paymentmode is credit, paiddate and paidamount should be null
                                //handle this in client side as well. 
                                billTransaction.CreatedBy = currentUser.EmployeeId;
                                if (billTransaction.BillStatus == "unpaid")
                                {
                                    billTransaction.PaidDate = null;
                                    billTransaction.PaidAmount = null;
                                    billTransaction.PaymentReceivedBy = null;
                                    billTransaction.PaidCounterId = null;
                                }
                                else
                                {
                                    billTransaction.PaidDate = createdOn;
                                    billTransaction.PaidCounterId = billTransaction.CounterId;
                                    billTransaction.PaymentReceivedBy = billTransaction.CreatedBy;
                                }

                                BillingFiscalYear fiscYear = BillingBL.GetFiscalYear(connString);

                                //ashim: 26Aug2018: Moved from client side to server side.
                                billTransaction.CreatedOn = createdOn;
                                billTransaction.CreatedBy = currentUser.EmployeeId;
                                billTransaction.FiscalYearId = fiscYear.FiscalYearId;
                                billTransaction.InvoiceNo = BillingBL.GetInvoiceNumber(connString, billTransaction.IsInsuranceBilling);
                                billTransaction.InvoiceCode = billTransaction.IsInsuranceBilling == true ? "INS" : InvoiceCode;
                                billingDbContext.BillingTransactions.Add(billTransaction);
                                billingDbContext.SaveChanges();


                                //step:3-- if there's deposit deduction, then add to deposit table. 
                                if (billTransaction.DepositReturnAmount != null && billTransaction.DepositReturnAmount > 0)
                                {
                                    VisitModel patientVisit = billingDbContext.Visit.Where(visit => visit.PatientId == billTransaction.PatientId)
                                         .OrderByDescending(a => a.PatientVisitId)
                                         .FirstOrDefault();
                                    BillingDeposit dep = new BillingDeposit()
                                    {
                                        DepositType = "depositdeduct",
                                        Remarks = "Deposit used in InvoiceNo. " + billTransaction.InvoiceCode + billTransaction.InvoiceNo,
                                        Amount = billTransaction.DepositReturnAmount,
                                        BillingTransactionId = billTransaction.BillingTransactionId,
                                        DepositBalance = billTransaction.DepositBalance,
                                        FiscalYearId = billTransaction.FiscalYearId,
                                        CounterId = billTransaction.CounterId,
                                        CreatedBy = billTransaction.CreatedBy,
                                        CreatedOn = DateTime.Now,
                                        PatientId = billTransaction.PatientId,
                                        PatientVisitId = patientVisit != null ? (int?)patientVisit.PatientVisitId : null,
                                        ReceiptNo = BillingBL.GetDepositReceiptNo(connString)
                                    };

                                    billingDbContext.BillingDeposits.Add(dep);
                                    billingDbContext.SaveChanges();
                                }


                                ///review: sudarshan--24june-- Call the ItemsStatus->Put once PostTransaction is successful. we don't have to go round-trip from client again.. 
                                // UpdateStatusOfBillTxnItems(dbContext, billTransaction.BillingTransactionItems);
                                billTransaction.FiscalYear = fiscYear.FiscalYearFormatted;//added: sud:5May'18
                                responseData.Results = billTransaction;//check if we need to send back all the input object back to client.--sudarshan

                                if (billTransaction.IsInsuranceBilling == true)
                                {

                                    BillingBL.UpdateInsuranceCurrentBalance(connString,
                                        billTransaction.PatientId,
                                        billTransaction.InsuranceProviderId ?? default(int),
                                        currentUser.EmployeeId, billTransaction.TotalAmount ?? default(int), true);
                                }

                                billingDbContext.SaveChanges();
                                dbContextTransaction.Commit(); //end of transaction

                              
                                responseData.Status = "OK";
                            }
                            catch (Exception ex)
                            {
                                //rollback all changes if any error occurs
                                dbContextTransaction.Rollback();
                                throw ex;
                            }
                        }
                    }
                    else
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "billTransaction is invalid";
                    }
                }

                #region //the requested orders will get inside the BillItemRequisition Table 
                else if (reqType == "billItemsRequisition")
                {

                    List<BillItemRequisition> ItemRequests = DanpheJSONConvert.DeserializeObject<List<BillItemRequisition>>(ipDataString);

                    if (ItemRequests != null && ItemRequests.Count > 0)
                    {
                        List<BillItemPrice> allBillingItems = billingDbContext.BillItemPrice.ToList();
                        List<ServiceDepartmentModel> allSrvDepts = billingDbContext.ServiceDepartment.ToList();


                        foreach (var req in ItemRequests)
                        {
                            ///Required for Doctor-Order, check if that can be passed from there (client side).

                            ServiceDepartmentModel srvDepartment = null;
                            if (req.ServiceDepartmentId != 0)
                            {
                                srvDepartment = (from srv in allSrvDepts
                                                 where (srv.ServiceDepartmentId == req.ServiceDepartmentId)
                                                 select srv).FirstOrDefault();
                            }
                            else if (req.DepartmentName != null || req.DepartmentName != "")
                            {
                                srvDepartment = (from billItem in billingDbContext.BillItemPrice
                                                 join srvDept in billingDbContext.ServiceDepartment on billItem.ServiceDepartmentId equals srvDept.ServiceDepartmentId
                                                 join dept in billingDbContext.Departments on srvDept.DepartmentId equals dept.DepartmentId
                                                 where (dept.DepartmentName.ToLower() == req.DepartmentName.ToLower()
                                                 && billItem.ItemName.ToLower() == req.ItemName.ToLower())
                                                 select srvDept).FirstOrDefault();
                            }

                            if (srvDepartment != null)
                            {
                                double? itemPrice = (from itmpr in allBillingItems
                                                     where (itmpr.ItemName == req.ItemName && itmpr.ServiceDepartmentId == srvDepartment.ServiceDepartmentId)
                                                     select itmpr.Price).FirstOrDefault();
                                //Check -If ItemPrice is zero in db then take ItemPrice from client req
                                double? itmPrice = itemPrice > 0 ? itemPrice : req.Price;
                                //used in case of visit.procedurecode is providerId
                                //getting item name from provider id
                                if (string.IsNullOrEmpty(req.ItemName))
                                {
                                    req.ItemName = (from itmpr in allBillingItems
                                                    where (itmpr.ProcedureCode == req.ProcedureCode)
                                                    select itmpr.ItemName).FirstOrDefault();
                                }
                                req.Price = Convert.ToDouble(itmPrice);
                                req.ServiceDepartmentId = srvDepartment.ServiceDepartmentId;
                                req.ServiceDepartment = srvDepartment.ServiceDepartmentName;
                                req.BillStatus = "pending";
                                req.CreatedOn = System.DateTime.Now;
                                billingDbContext.BillItemRequisitions.Add(req);
                            }
                            else
                            {
                                throw new Exception("Service Department is not proper.");
                            }
                        }

                        billingDbContext.SaveChanges();
                        responseData.Results = ItemRequests;//check if we need to send back all the input array back to client.--sudarshan
                    }
                }
                #endregion
                #region save HTML file from server
                else if (reqType == "saveHTMLfile")
                {
                    //ipDataString is input (HTML string)
                    if (ipDataString.Length > 0)
                    {
                        //right now we are naming file as printerName + employeeId.html so that there is no mis match in htmlfile from different users.

                        var fileName = PrinterName + currentUser.EmployeeId + ".html";
                        byte[] htmlbytearray = System.Text.Encoding.ASCII.GetBytes(ipDataString);
                        //saving file to default folder, html file need to be delete after print is called.
                        System.IO.File.WriteAllBytes(@FilePath + fileName, htmlbytearray);

                        responseData.Status = "OK";
                        responseData.Results = 1;
                    }
                }
                #endregion

                //not used
                //sud: 10sept'18--to save billingtxn, txnitems, and visit for BillingPackage.
                else if (reqType == "postBillingTxnWithPackage")
                {
                    BillingTransactionModel billTransaction = DanpheJSONConvert.DeserializeObject<BillingTransactionModel>(ipDataString);
                    if (billTransaction != null)
                    {
                        //if paymentmode is credit, paiddate and paidamount should be null
                        //handle this in client side as well. 
                        billTransaction.CreatedBy = currentUser.EmployeeId;
                        billTransaction.PaidDate = DateTime.Now;
                        billTransaction.PaidCounterId = billTransaction.CounterId;
                        billTransaction.PaymentReceivedBy = billTransaction.CreatedBy;

                        BillingFiscalYear fiscYear = BillingBL.GetFiscalYear(connString);

                        //assign AuditTrail properties in server side only
                        billTransaction.CreatedOn = DateTime.Now;
                        billTransaction.CreatedBy = currentUser.EmployeeId;
                        billTransaction.FiscalYearId = fiscYear.FiscalYearId;
                        billTransaction.InvoiceNo = BillingBL.GetInvoiceNumber(connString);
                        billTransaction.InvoiceCode = BillingBL.InvoiceCode;

                        //below will add both txn as well as TransactionItems.
                        billingDbContext.BillingTransactions.Add(billTransaction);
                        billingDbContext.SaveChanges();

                        //if there's any OPD item, then we should add them to the visit table as well..
                        if (billTransaction.BillingTransactionItems != null && billTransaction.BillingTransactionItems.Count > 0)
                        {
                            //IMPORTANT: ServiceDepartmentName and ItemName are HARD-CODED here, pls do not change from frontend.. 
                            List<BillingTransactionItemModel> opdItems = billTransaction.BillingTransactionItems.Where(itm => itm.ServiceDepartmentName == "OPD" && itm.ItemName.ToLower() == "consultation charge").ToList();
                            if (opdItems != null && opdItems.Count > 0)
                            {
                                VisitDbContext visDbContext = new VisitDbContext(connString);
                                foreach (BillingTransactionItemModel txnItem in opdItems)
                                {
                                    VisitModel vis = GetVisitModelFromBillTxnItem(txnItem, visDbContext);
                                    visDbContext.Visits.Add(vis);
                                    visDbContext.SaveChanges();

                                    //once visit is added, we have to update VisitId and RequisitionId fields of BillingTxnItemtable.
                                    billingDbContext.BillingTransactionItems.Attach(txnItem);
                                    txnItem.PatientVisitId = vis.PatientVisitId;
                                    txnItem.RequisitionId = vis.PatientVisitId;
                                    billingDbContext.Entry(txnItem).Property(a => a.PatientVisitId).IsModified = true;
                                    billingDbContext.Entry(txnItem).Property(a => a.RequisitionId).IsModified = true;
                                    billingDbContext.SaveChanges();

                                }

                            }
                            //BillingTransactionBL.UpdateTxnItemsBillStatus(billingDbContext,
                            //          billTransaction.BillingTransactionItems,
                            //          billTransaction.BillStatus,
                            //          currentUser.EmployeeId,
                            //          billTransaction.CreatedOn,
                            //          billTransaction.CounterId,
                            //          billTransaction.BillingTransactionId);

                        }


                        billTransaction.FiscalYear = fiscYear.FiscalYearFormatted;//added: sud:5May'18
                        responseData.Results = billTransaction;//check if we need to send back all the input object back to client.--sudarshan

                    }

                    else
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "billTransaction is invalid";
                    }
                }

                else if (reqType == "post-handover-denomination-detail")
                {
                    BillingHandoverModel handoverInfo = DanpheJSONConvert.DeserializeObject<BillingHandoverModel>(ipDataString);
                    var denominationDetails = handoverInfo.denomination;
                    //var hello = handoverInfo;
                    //Transaction Begins  
                    using (var dbContextTransaction = billingDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            var TotalAmount = handoverInfo.denomination.Sum(a => a.CurrencyType * a.Quantity);

                            if (handoverInfo != null)
                            {
                                BillingHandoverModel handover = new BillingHandoverModel();
                                {
                                    //handover.HandoverId =;
                                    handover.UserId = currentUser.EmployeeId;
                                    handover.HandoverType = handoverInfo.HandoverType;
                                    handover.PreviousAmount = handoverInfo.PreviousAmount;
                                    handover.HandoverAmount = TotalAmount;
                                    handover.HandOverUserId = handoverInfo.UserId;
                                    handover.TotalAmount = handoverInfo.PreviousAmount + TotalAmount;
                                    handover.CounterId = handoverInfo.CounterId;
                                    handover.CreatedBy = currentUser.EmployeeId;
                                    handover.CreatedOn = System.DateTime.Now;
                                }
                                billingDbContext.Handover.Add(handover);
                                billingDbContext.SaveChanges();

                                if (denominationDetails.Count != 0)
                                {
                                    for (int i = 0; i < denominationDetails.Count; i++)
                                    {
                                        if (denominationDetails[i].Quantity != null && denominationDetails[i].Quantity != 0)
                                        {
                                            var handoverDetail = denominationDetails[i];
                                            if (handoverDetail.DenominationId == null || handoverDetail.DenominationId == 0)
                                            {
                                                BillingDenominationModel denomination = new BillingDenominationModel();
                                                {
                                                    denomination.HandoverId = handover.HandoverId;
                                                    denomination.CurrencyType = denominationDetails[i].CurrencyType;
                                                    denomination.Quantity = denominationDetails[i].Quantity;
                                                    denomination.Amount = denomination.CurrencyType * denomination.Quantity;
                                                }
                                                billingDbContext.Denomination.Add(denomination);
                                            }
                                        }
                                        billingDbContext.SaveChanges();
                                    }
                                    dbContextTransaction.Commit(); //end of transaction
                                }
                            }
                            else
                            {
                                responseData.Status = "Failed";
                                responseData.ErrorMessage = "request type is incorrect.";
                            }
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
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            responseData.Status = "OK";
            try
            {
                BillingDbContext billingDbContext = new BillingDbContext(connString);
                LabDbContext labDbContext = new LabDbContext(connString);
                RadiologyDbContext radioDbContext = new RadiologyDbContext(connString);
                string str = this.ReadPostData();
                string reqType = this.ReadQueryStringData("reqType");
                string status = this.ReadQueryStringData("status");
                string ProviderName = this.ReadQueryStringData("ProviderName");
                string remarks = this.ReadQueryStringData("remarks");
                int billItemReqId = ToInt(this.ReadQueryStringData("billItemReqId"));
                int PrintCount = ToInt(this.ReadQueryStringData("PrintCount"));
                int ProviderId = ToInt(this.ReadQueryStringData("ProviderId"));
                int CreatedBy = ToInt(this.ReadQueryStringData("CreatedBy"));
                int billingTransactionId = ToInt(this.ReadQueryStringData("billingTransactionId"));
                int invoiceNo = ToInt(this.ReadQueryStringData("invoiceNo"));
                int patientId = ToInt(this.ReadQueryStringData("patientId"));
                int insuranceProviderId = ToInt(this.ReadQueryStringData("patientId"));
                int updatedInsBalance = ToInt(this.ReadQueryStringData("updatedInsBalance"));

                if (reqType == "billItemReqsStatus")
                {
                    List<Int32> billItemReqIds = DanpheJSONConvert.DeserializeObject<List<Int32>>(str);
                    BillItemRequisition billItem = new BillItemRequisition();
                    foreach (var id in billItemReqIds)
                    {
                        billItem = (from bill in billingDbContext.BillItemRequisitions
                                    where bill.BillItemRequisitionId == id
                                    select bill).FirstOrDefault();
                        if (billItem != null)
                        {
                            billItem.BillStatus = status;
                            billingDbContext.Entry(billItem).State = EntityState.Modified;
                        }
                    }
                    billingDbContext.SaveChanges();
                    responseData.Results = "Bill Status Updated";
                }


                //-------------------------To update Cancel status of the Credit Bills--------------------------------- 
                else if (reqType == "UpdateBillStatusForCreditCancellation")
                {
                    // List<Int32> BillTransactionItemIds = DanpheJSONConvert.DeserializeObject<List<Int32>>(str);
                    int? currTxnItmId = DanpheJSONConvert.DeserializeObject<int?>(str);

                    if (currTxnItmId != null && currTxnItmId.Value != 0)
                    {

                        BillingTransactionItemModel dbBillTxnItem = billingDbContext.BillingTransactionItems
                                                   .Where(a => a.BillingTransactionItemId == currTxnItmId)
                                                   .FirstOrDefault<BillingTransactionItemModel>();
                        if (dbBillTxnItem != null)
                        {
                            dbBillTxnItem.CancelRemarks = remarks;
                            dbBillTxnItem.CancelledBy = CreatedBy;
                            dbBillTxnItem.BillStatus = status.ToLower();
                            dbBillTxnItem.CancelledOn = System.DateTime.Now;//added: sudarshan-25jul
                            billingDbContext.Entry(dbBillTxnItem).State = EntityState.Modified;
                        }
                    }
                    //foreach (var id in BillTransactionItemIds)
                    //{

                    //}
                    billingDbContext.SaveChanges();
                    responseData.Status = "OK";
                    responseData.Results = currTxnItmId;
                }
                //to cancel multiple items at once--needed in provisional items cancellation.sud:12May'18
                else if (reqType == "cancelBillTxnItems")
                {
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                    // List<Int32> BillTransactionItemIds = DanpheJSONConvert.DeserializeObject<List<Int32>>(str);
                    List<BillingTransactionItemModel> txnItemsToCancel = DanpheJSONConvert.DeserializeObject<List<BillingTransactionItemModel>>(str);

                    if (txnItemsToCancel != null && txnItemsToCancel.Count > 0)
                    {
                        //Transaction Begins  
                        using (var dbContextTransaction = billingDbContext.Database.BeginTransaction())
                        {
                            try
                            {
                                for (int i = 0; i < txnItemsToCancel.Count; i++)
                                {
                                    txnItemsToCancel[i] = BillingTransactionBL.UpdateTxnItemBillStatus(billingDbContext,
                                  txnItemsToCancel[i],
                                  "cancel",
                                  currentUser.EmployeeId,
                                  DateTime.Now);
                                }
                                billingDbContext.SaveChanges();
                                dbContextTransaction.Commit(); //end of transaction
                                responseData.Status = "OK";
                                responseData.Results = txnItemsToCancel;
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

                // Update the Print Count on Bill transaction after the Receipt print 
                else if (reqType == "UpdatePrintCountafterPrint")
                {
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                    //BillingTransactionModel BillTxn = DanpheJSONConvert.DeserializeObject<BillingTransactionModel>(str);

                    BillingTransactionModel dbBillPrintReq = billingDbContext.BillingTransactions
                                            .Where(a => a.BillingTransactionId == billingTransactionId)
                                            .FirstOrDefault<BillingTransactionModel>();
                    if (dbBillPrintReq != null)
                    {
                        dbBillPrintReq.PrintCount = PrintCount;
                        dbBillPrintReq.PrintedOn = System.DateTime.Now;
                        dbBillPrintReq.PrintedBy = currentUser.EmployeeId;
                        billingDbContext.Entry(dbBillPrintReq).State = EntityState.Modified;
                    }


                    billingDbContext.SaveChanges();
                    responseData.Status = "OK";
                    responseData.Results = "Print count updated successfully.";
                }
                //edit Doctor 

                else if (reqType == "UpdateDoctorafterDoctorEdit")
                {
                    int BillTxnItemId = DanpheJSONConvert.DeserializeObject<int>(str);
                    BillingTransactionItemModel dbEditDoctor = billingDbContext.BillingTransactionItems
                        .Where(a => a.BillingTransactionItemId == BillTxnItemId)
                        .FirstOrDefault<BillingTransactionItemModel>();
                    if (dbEditDoctor != null)
                    {
                        dbEditDoctor.ProviderName = ProviderName;
                        dbEditDoctor.ProviderId = ProviderId;
                        billingDbContext.Entry(dbEditDoctor).State = EntityState.Modified;
                    }
                    billingDbContext.SaveChanges();
                    responseData.Status = "OK";
                    responseData.Results = BillTxnItemId;

                }

                else if (reqType == "cancelInpatientBillRequest")
                {
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                    BillingTransactionItemModel txnItmFromClient = DanpheJSONConvert.DeserializeObject<BillingTransactionItemModel>(str);


                    BillingTransactionItemModel billItem = billingDbContext.BillingTransactionItems
                                                                    .Where(itm =>
                                                                            itm.RequisitionId == txnItmFromClient.RequisitionId
                                                                            && itm.ItemId == txnItmFromClient.ItemId
                                                                            && itm.PatientId == txnItmFromClient.PatientId
                                                                            && itm.PatientVisitId == txnItmFromClient.PatientVisitId
                                                                            && itm.BillingTransactionItemId == txnItmFromClient.BillingTransactionItemId
                                                                        ).FirstOrDefault<BillingTransactionItemModel>();

                    billingDbContext.BillingTransactionItems.Attach(billItem);

                    billingDbContext.Entry(billItem).Property(a => a.BillStatus).IsModified = true;
                    billingDbContext.Entry(billItem).Property(a => a.CancelledBy).IsModified = true;
                    billingDbContext.Entry(billItem).Property(a => a.CancelledOn).IsModified = true;
                    billingDbContext.Entry(billItem).Property(a => a.CancelRemarks).IsModified = true;

                    billItem.BillStatus = "cancel";
                    billItem.CancelledBy = currentUser.EmployeeId;
                    billItem.CancelledOn = System.DateTime.Now;
                    billItem.CancelRemarks = txnItmFromClient.CancelRemarks;
                    billingDbContext.SaveChanges();
                    responseData.Status = "OK";
                    responseData.Results = billItem;
                }

                else if (reqType == "EditItemPrice_Qty_Disc_Provider")
                {
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                    BillingTransactionItemModel txnItmFromClient = DanpheJSONConvert.DeserializeObject<BillingTransactionItemModel>(str);
                    BillingTransactionBL.UpdateBillingTransactionItems(billingDbContext, txnItmFromClient);

                    responseData.Status = "OK";
                    responseData.Results = txnItmFromClient;
                }

                else if (reqType == "item-group-discount")
                {
                    List<BillingTransactionItemModel> txnItems = DanpheJSONConvert.DeserializeObject<List<BillingTransactionItemModel>>(str);
                    txnItems.ForEach(item =>
                    {
                        BillingTransactionBL.UpdateBillingTransactionItems(billingDbContext, item);
                    });
                    responseData.Status = "OK";
                }

                else
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = "request type is incorrect.";
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


        //we're calculating days by subtracting AdmissionDate from DischargeDate
        //minimum days will be 1  <needs revision> sud: 20Aug'18
        private int CalculateBedStayForAdmission(AdmissionModel adm)
        {
            int totalDays = 1;

            if (adm != null)
            {

                DateTime admissionTime = adm.AdmissionDate;
                DateTime dischargeTime = (DateTime)(adm.DischargeDate != null ? adm.DischargeDate : DateTime.Now);

                int daysDiff = ((TimeSpan)(dischargeTime - admissionTime)).Days;
                if (daysDiff != 1)
                {
                    totalDays = daysDiff;
                }
            }
            return totalDays;
        }


        private VisitModel GetVisitModelFromBillTxnItem(BillingTransactionItemModel txnItem, VisitDbContext visitDbContext)
        {
            //get provider name from providerId
            string visitCode = VisitBL.CreateNewPatientVisitCode("outpatient", connString);

            VisitModel retModel = new VisitModel()
            {
                PatientId = txnItem.PatientId,
                ProviderId = txnItem.ProviderId,
                ProviderName = txnItem.ProviderName,
                VisitDate = DateTime.Now.Date,
                VisitTime = DateTime.Now.TimeOfDay,
                VisitCode = visitCode,
                VisitStatus = "initiated",
                VisitType = "outpatient",
                BillingStatus = "paid",
                AppointmentType = "New",
                IsActive = true,
                CreatedOn = DateTime.Now,
                CreatedBy = txnItem.CreatedBy
            };

            return retModel;
        }

    }

}
