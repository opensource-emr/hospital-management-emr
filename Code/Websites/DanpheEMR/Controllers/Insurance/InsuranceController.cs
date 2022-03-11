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
using DanpheEMR.Core;
using DanpheEMR.Controllers;
using DanpheEMR.Sync.IRDNepal.Models;
using System.Data.SqlClient;
using System.Threading.Tasks;
using System.Transactions;
using System.Data.Entity.Core.Objects;
using DanpheEMR.ServerModel.InsuranceModels;
using System.Data.Entity.Infrastructure;

namespace DanpheEMR.Controllers
{
    public class InsuranceController : CommonController
    {
        bool realTimeRemoteSyncEnabled = false;
        double cacheExpMinutes;
        public InsuranceController(IOptions<MyConfiguration> _config) : base(_config)
        {
            cacheExpMinutes = _config.Value.CacheExpirationMinutes;
            realTimeRemoteSyncEnabled = _config.Value.RealTimeRemoteSyncEnabled;
        }
        [HttpGet]
        public string Get(string reqType, string searchText, DateTime toDate, DateTime fromDate, string status, int dayslimit, string search, string firstName, string lastName, string Gender,
            string Age, string phoneNumber, int patientId, string patientCode, string admitStatus, bool IsInsurance, string IMISCode, string Ins_NshiNumber, int requisitionId, string departmentName,
            Int64? claimCode, int visitId, int? patVisitId, int? InputId, int ipVisitId, int? billingTxnId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            string ipDataString = this.ReadPostData();
            responseData.Status = "OK";
            try
            {
                InsuranceDbContext insuranceDbContext = new InsuranceDbContext(connString);
                if (reqType == "govinsurance-patients-list")
                {
                    var insPats = (from pat in insuranceDbContext.Patients
                                   join ins in insuranceDbContext.Insurances on pat.PatientId equals ins.PatientId
                                   where pat.Ins_HasInsurance == true
                                   join country in insuranceDbContext.CountrySubDivisions
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
                                       Ins_HasInsurance = pat.Ins_HasInsurance,
                                       Ins_NshiNumber = pat.Ins_NshiNumber,
                                       Ins_InsuranceBalance = pat.Ins_InsuranceBalance,
                                       PatientInsuranceInfoId = ins.PatientInsuranceInfoId,
                                       LatestClaimCode = pat.Ins_LatestClaimCode,
                                       IsAdmitted = (from adm in insuranceDbContext.Admissions
                                                     where adm.PatientId == pat.PatientId && adm.AdmissionStatus == "admitted"
                                                     select adm.AdmissionStatus).FirstOrDefault() == null ? false : true,
                                       WardBedInfo = (from adttxn in insuranceDbContext.PatientBedInfos
                                                      join vis in insuranceDbContext.Visit on adttxn.StartedOn equals vis.CreatedOn
                                                      join bed in insuranceDbContext.Beds on adttxn.BedId equals bed.BedId
                                                      join ward in insuranceDbContext.Wards on adttxn.WardId equals ward.WardId
                                                      where adttxn.PatientId == pat.PatientId && adttxn.OutAction != "discharged"
                                                      select new
                                                      {
                                                          WardName = ward.WardName,
                                                          BedCode = bed.BedCode,
                                                          Date = adttxn.StartedOn
                                                      }).OrderByDescending(a => a.Date).FirstOrDefault()
                                   }).OrderByDescending(p => p.PatientInsuranceInfoId).ToList();
                    responseData.Results = insPats;
                }

                else if (reqType == "search-gov-ins-patient")
                {
                    List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@SearchTxt", searchText),
                          new SqlParameter("@RowCounts", 200)};//rowscount set to 200 by default..

                    DataTable dt = DALFunctions.GetDataTableFromStoredProc("SP_INS_SearchInsurancePatients", paramList, insuranceDbContext);
                    responseData.Results = dt;
                    responseData.Status = "OK";
                }

                else if (reqType == "list-ip-patients")
                {
                    var ipPatients = (from adm in insuranceDbContext.Admissions.Include(a => a.Visit.Patient)
                                      join ins in insuranceDbContext.Insurances on adm.PatientId equals ins.PatientId
                                      where adm.AdmissionStatus == "admitted" && adm.IsInsurancePatient == true
                                      let deposits = insuranceDbContext.BillingDeposits.Where(dep => dep.PatientId == adm.PatientId &&
                                        dep.PatientVisitId == adm.PatientVisitId && dep.IsActive == true).ToList()
                                      let visit = adm.Visit
                                      let patient = adm.Visit.Patient
                                      let doc = insuranceDbContext.Employee.Where(doc => doc.EmployeeId == adm.AdmittingDoctorId).Select(d => d.FullName).FirstOrDefault() ?? string.Empty
                                      let bedInformations = (from bedinf in insuranceDbContext.PatientBedInfos
                                                             where bedinf.PatientVisitId == adm.PatientVisitId && bedinf.IsActive == true
                                                             select new
                                                             {
                                                                 Ward = bedinf.Ward.WardName,
                                                                 BedCode = bedinf.Bed.BedCode,
                                                                 BedNumber = bedinf.Bed.BedNumber,
                                                                 StartedOn = bedinf.StartedOn,
                                                             }).OrderByDescending(a => a.StartedOn).FirstOrDefault()
                                      select new
                                      {
                                          PatientId = patient.PatientId,
                                          PatientNo = patient.PatientCode,
                                          patient.DateOfBirth,
                                          patient.Gender,
                                          PhoneNumber = patient.PhoneNumber + (String.IsNullOrEmpty(adm.CareOfPersonPhoneNo) ? "" : " / " + adm.CareOfPersonPhoneNo),
                                          VisitId = adm.PatientVisitId,
                                          IpNumber = visit.VisitCode,
                                          PatientName = patient.ShortName,
                                          FirstName = patient.FirstName,
                                          LastName = patient.LastName,
                                          MiddleName = patient.MiddleName,
                                          AdmittedDate = adm.AdmissionDate,
                                          DischargeDate = adm.AdmissionStatus == "admitted" ? adm.DischargeDate : (DateTime?)DateTime.Now,
                                          AdmittingDoctorId = adm.AdmittingDoctorId,
                                          AdmittingDoctorName = doc,
                                          Ins_NshiNumber = patient.Ins_NshiNumber,
                                          ClaimCode = visit.ClaimCode,
                                          Ins_HasInsurance = visit.Ins_HasInsurance,
                                          DepositAdded = (deposits.Where(dep => dep.DepositType == ENUM_BillDepositType.Deposit).Sum(dep => dep.Amount)),//deposits

                                          DepositReturned = (
                                                 deposits.Where(dep => (dep.DepositType.ToLower() == ENUM_BillDepositType.DepositDeduct.ToLower() || dep.DepositType.ToLower() == ENUM_BillDepositType.ReturnDeposit.ToLower())).Sum(dep => dep.Amount)
                                           ),

                                          BedInformation = bedInformations
                                      }).ToList();

                    responseData.Results = ipPatients.OrderByDescending(a => a.AdmittedDate);
                }
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
                                       where pat.IsActive == true &&
                                       (pat.IsOutdoorPat == null || pat.IsOutdoorPat == false)//exclude Inactive and OutDoor patients.
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
                                           IMISCode = ins != null ? ins.IMISCode : null,
                                           Ins_HasInsurance = pat.Ins_HasInsurance,
                                           Ins_NshiNumber = pat.Ins_NshiNumber,
                                           Ins_InsuranceBalance = pat.Ins_InsuranceBalance,
                                           InsuranceName = ins.InsuranceName,
                                           Ins_IsFamilyHead = ins.Ins_IsFamilyHead,
                                           Ins_FamilyHeadName = ins.Ins_FamilyHeadName,
                                           Ins_FamilyHeadNshi = ins.Ins_FamilyHeadNshi,
                                           Ins_IsFirstServicePoint = ins.Ins_IsFirstServicePoint,
                                           MunicipalityId = pat.MunicipalityId,
                                           MunicipalityName = (from pat in patDbContext.Patients
                                                               join mun in patDbContext.Municipalities on pat.MunicipalityId equals mun.MunicipalityId
                                                               where (pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName + pat.PatientCode + pat.PhoneNumber).Contains(searchText)
                                                               select mun.MunicipalityName).FirstOrDefault()
                                       }).OrderByDescending(p => p.PatientId).ToList();
                        responseData.Results = allPats;
                    }

                    responseData.Status = "OK";
                }
                else if (reqType == "get-new-claimCode")
                {
                    //DanpheHTTPResponse<object> funcResponse = new DanpheHTTPResponse<object>();
                    INS_NewClaimCodeDTO newClaimObj = InsuranceBL.GetGovInsNewClaimCode(insuranceDbContext);

                    if (newClaimObj.IsMaxLimitReached)
                    {
                        responseData.Status = "Failed";
                        responseData.Results = 0;
                        responseData.ErrorMessage = "Claim clode reached maximum limit";
                    }
                    else
                    {
                        responseData.Status = "OK";
                        responseData.Results = newClaimObj.NewClaimCode;
                        responseData.ErrorMessage = null;
                    }
                }
                else if (reqType == "get-patient-old-claimCode")
                {
                    ////NageshBB: 27-June-2021: as per business logic we are getting last used claim code for patient                                                                                                
                    //var lastUsedClaimcode = insuranceDbContext.Visit.AsQueryable()
                    //                            .Where(t => t.Ins_HasInsurance == true && t.PatientId == patientId
                    //                            && (t.BillingStatus != ENUM_BillingStatus.returned && t.BillingStatus != ENUM_BillingStatus.cancel))
                    //                            .Select(i => i.ClaimCode).DefaultIfEmpty().ToList().Max(t => Convert.ToInt64(t));
                    //responseData.Status = (lastUsedClaimcode > 0) ? "OK" : "Failed";
                    //responseData.Results = (responseData.Status == "OK") ? lastUsedClaimcode : 0;
                    //responseData.ErrorMessage = (responseData.Status == "Failed") ? "Last used claim code not found for this patient, Please get new claim code ." : "";

                    //sud/sanjit: 09-Oct'21--getting the Claimcode of last visit (orderby PatVisitId) instead of getting max.. 
                    //case: LPH used 10Digits Claimcode earlier and later used 9digits. So Max(Claimcode) is always giving 10Digits claimcode..
                    var lastUsedClaimcode = insuranceDbContext.Visit.AsQueryable()
                                            .Where(t => t.Ins_HasInsurance == true && t.PatientId == patientId && t.ClaimCode != null
                                            && (t.BillingStatus != ENUM_BillingStatus.returned && t.BillingStatus != ENUM_BillingStatus.cancel))
                                            .OrderByDescending(v => v.PatientVisitId)
                                            .Select(i => i.ClaimCode).FirstOrDefault();
                    responseData.Status = (lastUsedClaimcode > 0) ? "OK" : "Failed";
                    responseData.Results = (responseData.Status == "OK") ? lastUsedClaimcode : 0;
                    responseData.ErrorMessage = (responseData.Status == "Failed") ? "Last used claim code not found for this patient, Please get new claim code ." : "";
                }

                else if (reqType == "get-patient-old-claimCode-for-admission")
                {
                    //Aniket: 05-Aug- 2021: Get last used claim code for patient. As discussed with Bikas sir, - Claim code older than follow-up validity date cannot be re-used.
                    //this logic is only for Admission module, for now
                    //sud/sanjit: 09-Oct'21--getting the Claimcode of last visit (orderby PatVisitId) instead of getting max.. 
                    //case: LPH used 10Digits Claimcode earlier and later used 9digits. So Max(Claimcode) is always giving 10Digits claimcode..
                    CoreDbContext coreDbContext = new CoreDbContext(connString);
                    var followUpDays = CommonFunctions.GetCoreParameterIntValue(coreDbContext, "Insurance", "FollowupValidDays");
                    var lastValidDate = DateTime.Now.AddDays(-followUpDays).Date;
                    var lastUsedClaimcode = insuranceDbContext.Visit.AsQueryable()
                                                .Where(t => t.Ins_HasInsurance == true && t.PatientId == patientId
                                                && t.ClaimCode != null
                                                && DbFunctions.TruncateTime(t.VisitDate) > lastValidDate
                                                && (t.BillingStatus != ENUM_BillingStatus.returned && t.BillingStatus != ENUM_BillingStatus.cancel))
                                                  .OrderByDescending(v => v.PatientVisitId)
                                                .Select(i => i.ClaimCode).FirstOrDefault();
                    responseData.Status = (lastUsedClaimcode > 0) ? "OK" : "Failed";
                    responseData.Results = (responseData.Status == "OK") ? lastUsedClaimcode : 0;
                    responseData.ErrorMessage = (responseData.Status == "Failed") ? "Last used claim code not found for this patient. New claim code is generated automatically." : "";
                }

                else if (reqType == "get-dept-opd-items")
                {
                    ServiceDepartmentModel srvDept = insuranceDbContext.ServiceDepartment.Where(s => s.ServiceDepartmentName == "Department OPD").FirstOrDefault();
                    if (srvDept != null)
                    {
                        var deptOpdItems = (from dept in insuranceDbContext.Departments
                                            join billItem in insuranceDbContext.BillItemPrice on dept.DepartmentId equals billItem.ItemId
                                            where billItem.ServiceDepartmentId == srvDept.ServiceDepartmentId
                                             && billItem.InsuranceApplicable == true
                                            select new
                                            {
                                                DepartmentId = dept.DepartmentId,
                                                DepartmentName = dept.DepartmentName,
                                                ServiceDepartmentId = srvDept.ServiceDepartmentId,
                                                ServiceDepartmentName = srvDept.ServiceDepartmentName,
                                                ItemId = billItem.ItemId,
                                                ItemName = billItem.ItemName,
                                                IsZeroPriceAllowed = billItem.IsZeroPriceAllowed,
                                                Price = billItem.Price, // billItem.Price,
                                                NormalPrice = billItem.Price,
                                                SAARCCitizenPrice = billItem.SAARCCitizenPrice,
                                                ForeignerPrice = billItem.ForeignerPrice,
                                                EHSPrice = billItem.EHSPrice,
                                                InsForeignerPrice = billItem.InsForeignerPrice,
                                                IsTaxApplicable = billItem.TaxApplicable,
                                                DiscountApplicable = billItem.DiscountApplicable,
                                                GovtInsurancePrice = billItem.GovtInsurancePrice != null ? billItem.GovtInsurancePrice : 0
                                            }).ToList();
                        responseData.Results = deptOpdItems;
                    }
                }
                else if (reqType == "get-dept-followup-items")
                {
                    ServiceDepartmentModel srvDept = insuranceDbContext.ServiceDepartment.Where(s => s.ServiceDepartmentName == "Department Followup Charges").FirstOrDefault();
                    if (srvDept != null)
                    {
                        var deptFollowupItems = (from dept in insuranceDbContext.Departments
                                                 join billItem in insuranceDbContext.BillItemPrice on dept.DepartmentId equals billItem.ItemId
                                                 where billItem.ServiceDepartmentId == srvDept.ServiceDepartmentId && billItem.InsuranceApplicable == true
                                                 select new
                                                 {
                                                     DepartmentId = dept.DepartmentId,
                                                     DepartmentName = dept.DepartmentName,
                                                     ServiceDepartmentId = srvDept.ServiceDepartmentId,
                                                     ServiceDepartmentName = srvDept.ServiceDepartmentName,
                                                     ItemId = billItem.ItemId,
                                                     ItemName = billItem.ItemName,
                                                     Price = billItem.Price,
                                                     NormalPrice = billItem.Price,
                                                     SAARCCitizenPrice = billItem.SAARCCitizenPrice,
                                                     ForeignerPrice = billItem.ForeignerPrice,
                                                     InsForeignerPrice = billItem.InsForeignerPrice,
                                                     EHSPrice = billItem.EHSPrice,
                                                     IsTaxApplicable = billItem.TaxApplicable,
                                                     DiscountApplicable = billItem.DiscountApplicable,
                                                     IsZeroPriceAllowed = billItem.IsZeroPriceAllowed,
                                                     GovtInsurancePrice = billItem.GovtInsurancePrice != null ? billItem.GovtInsurancePrice : 0
                                                 }).ToList();
                        responseData.Results = deptFollowupItems;
                    }
                }
                else if (reqType == "get-doc-followup-items")
                {
                    ServiceDepartmentModel srvDept = insuranceDbContext.ServiceDepartment.Where(s => s.ServiceDepartmentName == "Doctor Followup Charges").FirstOrDefault();
                    if (srvDept != null)
                    {
                        var visitDoctorList = (from emp in insuranceDbContext.Employee
                                               where emp.IsActive == true && emp.IsAppointmentApplicable == true//sud:26Feb'19--get only active and AppointmentApplicable doctors.
                                               join dept in insuranceDbContext.Departments on emp.DepartmentId equals dept.DepartmentId
                                               join billItem in insuranceDbContext.BillItemPrice on emp.EmployeeId equals billItem.ItemId
                                               where billItem.ServiceDepartmentId == srvDept.ServiceDepartmentId
                                                 && billItem.InsuranceApplicable == true
                                               select new
                                               {
                                                   DepartmentId = dept.DepartmentId,
                                                   DepartmentName = dept.DepartmentName,
                                                   ServiceDepartmentId = srvDept.ServiceDepartmentId,
                                                   ServiceDepartmentName = srvDept.ServiceDepartmentName,
                                                   ItemId = billItem.ItemId,

                                                   ProviderId = emp.EmployeeId,
                                                   ProviderName = (string.IsNullOrEmpty(emp.Salutation) ? "" : emp.Salutation + ". ") + emp.FirstName + (string.IsNullOrEmpty(emp.MiddleName) ? " " : " " + emp.MiddleName + " ") + emp.LastName,
                                                   ItemName = billItem.ItemName,
                                                   Price = billItem.GovtInsurancePrice, // billItem.Price,
                                                   NormalPrice = billItem.GovtInsurancePrice,
                                                   SAARCCitizenPrice = billItem.SAARCCitizenPrice,
                                                   ForeignerPrice = billItem.ForeignerPrice,
                                                   InsForeignerPrice = billItem.InsForeignerPrice,
                                                   EHSPrice = billItem.EHSPrice,
                                                   IsTaxApplicable = billItem.TaxApplicable,
                                                   IsZeroPriceAllowed = billItem.IsZeroPriceAllowed,
                                                   GovtInsurancePrice = billItem.GovtInsurancePrice != null ? billItem.GovtInsurancePrice : 0
                                               }).ToList();
                        responseData.Results = visitDoctorList;
                    }
                }
                else if (reqType == "get-doc-oldpatient-opd-items")
                {
                    ServiceDepartmentModel srvDept = insuranceDbContext.ServiceDepartment.Where(s => s.ServiceDepartmentName == "Doctor OPD Old Patient").FirstOrDefault();
                    if (srvDept != null)
                    {
                        var visitDoctorList = (from emp in insuranceDbContext.Employee
                                               where emp.IsActive == true && emp.IsAppointmentApplicable == true//sud:26Feb'19--get only active and AppointmentApplicable doctors.
                                               join dept in insuranceDbContext.Departments on emp.DepartmentId equals dept.DepartmentId
                                               join billItem in insuranceDbContext.BillItemPrice on emp.EmployeeId equals billItem.ItemId
                                               where billItem.ServiceDepartmentId == srvDept.ServiceDepartmentId
                                                 && billItem.InsuranceApplicable == true
                                               select new
                                               {
                                                   DepartmentId = dept.DepartmentId,
                                                   DepartmentName = dept.DepartmentName,
                                                   ServiceDepartmentId = srvDept.ServiceDepartmentId,
                                                   ServiceDepartmentName = srvDept.ServiceDepartmentName,
                                                   ItemId = billItem.ItemId,

                                                   ProviderId = emp.EmployeeId,
                                                   ProviderName = (string.IsNullOrEmpty(emp.Salutation) ? "" : emp.Salutation + ". ") + emp.FirstName + (string.IsNullOrEmpty(emp.MiddleName) ? " " : " " + emp.MiddleName + " ") + emp.LastName,
                                                   ItemName = billItem.ItemName,
                                                   Price = billItem.GovtInsurancePrice, // billItem.Price,
                                                   IsZeroPriceAllowed = billItem.IsZeroPriceAllowed,
                                                   NormalPrice = billItem.GovtInsurancePrice,
                                                   SAARCCitizenPrice = billItem.SAARCCitizenPrice,
                                                   ForeignerPrice = billItem.ForeignerPrice,
                                                   EHSPrice = billItem.EHSPrice,
                                                   InsForeignerPrice = billItem.InsForeignerPrice,
                                                   IsTaxApplicable = billItem.TaxApplicable,
                                                   GovtInsurancePrice = billItem.GovtInsurancePrice != null ? billItem.GovtInsurancePrice : 0
                                               }).ToList();
                        responseData.Results = visitDoctorList;
                    }
                }
                else if (reqType == "get-dept-oldpatient-opd-items")
                {
                    ServiceDepartmentModel srvDept = insuranceDbContext.ServiceDepartment.Where(s => s.ServiceDepartmentName == "Department OPD Old Patient").FirstOrDefault();
                    if (srvDept != null)
                    {
                        var deptOpdItems = (from dept in insuranceDbContext.Departments
                                            join billItem in insuranceDbContext.BillItemPrice on dept.DepartmentId equals billItem.ItemId
                                            where billItem.ServiceDepartmentId == srvDept.ServiceDepartmentId
                                              && billItem.InsuranceApplicable == true
                                            select new
                                            {
                                                DepartmentId = dept.DepartmentId,
                                                DepartmentName = dept.DepartmentName,
                                                ServiceDepartmentId = srvDept.ServiceDepartmentId,
                                                ServiceDepartmentName = srvDept.ServiceDepartmentName,
                                                ItemId = billItem.ItemId,
                                                ItemName = billItem.ItemName,
                                                Price = billItem.GovtInsurancePrice, // billItem.Price,
                                                IsZeroPriceAllowed = billItem.IsZeroPriceAllowed,
                                                NormalPrice = billItem.GovtInsurancePrice,
                                                SAARCCitizenPrice = billItem.SAARCCitizenPrice,
                                                ForeignerPrice = billItem.ForeignerPrice,
                                                EHSPrice = billItem.EHSPrice,
                                                InsForeignerPrice = billItem.InsForeignerPrice,
                                                IsTaxApplicable = billItem.TaxApplicable,
                                                DiscountApplicable = billItem.DiscountApplicable,
                                                GovtInsurancePrice = billItem.GovtInsurancePrice != null ? billItem.GovtInsurancePrice : 0
                                            }).ToList();
                        responseData.Results = deptOpdItems;
                    }
                }
                else if (reqType == "get-visit-doctors")
                {
                    //check if we can use employee.IsAppointmentApplicable field in below join.--sud:15Jun'18

                    var visitDoctorList = (from emp in insuranceDbContext.Employee
                                           where emp.IsActive == true && emp.IsAppointmentApplicable == true//sud:26Feb'19--get only active and AppointmentApplicable doctors.
                                           join dept in insuranceDbContext.Departments on emp.DepartmentId equals dept.DepartmentId
                                           select new
                                           {
                                               DepartmentId = dept.DepartmentId,
                                               DepartmentName = dept.DepartmentName,
                                               ProviderId = emp.EmployeeId,
                                               ProviderName = (string.IsNullOrEmpty(emp.Salutation) ? "" : emp.Salutation + ". ") + emp.FirstName + (string.IsNullOrEmpty(emp.MiddleName) ? " " : " " + emp.MiddleName + " ") + emp.LastName,

                                           }).ToList();
                    responseData.Results = visitDoctorList;


                }
                else if (reqType == "billItemList")
                {
                    var itemList = (from item in insuranceDbContext.BillItemPrice
                                    join srv in insuranceDbContext.ServiceDepartment on item.ServiceDepartmentId equals srv.ServiceDepartmentId
                                    where item.IsActive == true
                                    && item.IsInsurancePackage == false
                                    && item.IsNormalPriceApplicable == true
                                    && item.InsuranceApplicable == true
                                    select new
                                    {
                                        BillItemPriceId = item.BillItemPriceId,
                                        ServiceDepartmentId = srv.ServiceDepartmentId,
                                        ServiceDepartmentName = srv.ServiceDepartmentName,
                                        ServiceDepartmentShortName = srv.ServiceDepartmentShortName,
                                        SrvDeptIntegrationName = srv.IntegrationName,
                                        Displayseq = item.DisplaySeq,
                                        ItemId = item.ItemId,
                                        ItemCode = item.ItemCode,
                                        ItemName = item.ItemName,
                                        ProcedureCode = item.ProcedureCode,
                                        Price = item.GovtInsurancePrice,
                                        NormalPrice = item.Price,
                                        TaxApplicable = item.TaxApplicable,
                                        DiscountApplicable = item.DiscountApplicable,
                                        Description = item.Description,
                                        IsDoctorMandatory = item.IsDoctorMandatory,
                                        IsZeroPriceAllowed = item.IsZeroPriceAllowed,
                                        EHSPrice = item.EHSPrice != null ? item.EHSPrice : 0, //sud:25Feb'19--For different price categories
                                        SAARCCitizenPrice = item.SAARCCitizenPrice != null ? item.SAARCCitizenPrice : 0,//sud:25Feb'19--For different price categories
                                        ForeignerPrice = item.ForeignerPrice != null ? item.ForeignerPrice : 0,//sud:25Feb'19--For different price categories
                                        GovtInsurancePrice = item.GovtInsurancePrice != null ? item.GovtInsurancePrice : 0,//sud:25Feb'19--For different price categories
                                        InsForeignerPrice = item.InsForeignerPrice != null ? item.InsForeignerPrice : 0,//pratik:8Nov'19--For different price categories
                                        IsErLabApplicable = item.IsErLabApplicable,//pratik:10Feb'21--For LPH
                                        Doctor = (from doc in insuranceDbContext.Employee.DefaultIfEmpty()
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
                                        IsSAARCPriceApplicable = item.IsSAARCPriceApplicable,
                                        IsInsForeignerPriceApplicable = item.IsInsForeignerPriceApplicable,
                                        AllowMultipleQty = item.AllowMultipleQty,
                                        DefaultDoctorList = item.DefaultDoctorList


                                    }).ToList().OrderBy(a => a.Displayseq);

                    responseData.Status = "OK";
                    responseData.Results = itemList;

                }
                else if (reqType == "get-doc-opd-prices")
                {
                    //check if we can use employee.IsAppointmentApplicable field in below join.--sud:15Jun'18
                    MasterDbContext masterDbContext = new DanpheEMR.DalLayer.MasterDbContext(connString);
                    ServiceDepartmentModel srvDept = insuranceDbContext.ServiceDepartment.Where(s => s.ServiceDepartmentName == "OPD").FirstOrDefault();
                    if (srvDept != null)
                    {
                        var visitDoctorList = (from emp in insuranceDbContext.Employee
                                               where emp.IsActive == true && emp.IsAppointmentApplicable == true//sud:26Feb'19--get only active and AppointmentApplicable doctors.
                                               join dept in insuranceDbContext.Departments on emp.DepartmentId equals dept.DepartmentId
                                               join billItem in insuranceDbContext.BillItemPrice on emp.EmployeeId equals billItem.ItemId
                                               where billItem.ServiceDepartmentId == srvDept.ServiceDepartmentId
                                                 && billItem.InsuranceApplicable == true
                                               select new
                                               {
                                                   DepartmentId = dept.DepartmentId,
                                                   DepartmentName = dept.DepartmentName,
                                                   ServiceDepartmentId = srvDept.ServiceDepartmentId,
                                                   ServiceDepartmentName = srvDept.ServiceDepartmentName,
                                                   ItemId = billItem.ItemId,

                                                   ProviderId = emp.EmployeeId,
                                                   ProviderName = (string.IsNullOrEmpty(emp.Salutation) ? "" : emp.Salutation + ". ") + emp.FirstName + (string.IsNullOrEmpty(emp.MiddleName) ? " " : " " + emp.MiddleName + " ") + emp.LastName,
                                                   ItemName = billItem.ItemName,
                                                   Price = billItem.Price, // billItem.Price,
                                                   NormalPrice = billItem.Price,
                                                   SAARCCitizenPrice = billItem.SAARCCitizenPrice,
                                                   ForeignerPrice = billItem.ForeignerPrice,
                                                   EHSPrice = billItem.EHSPrice,
                                                   InsForeignerPrice = billItem.InsForeignerPrice,
                                                   IsTaxApplicable = billItem.TaxApplicable,
                                                   billItem.HasAdditionalBillingItems,
                                                   IsZeroPriceAllowed = billItem.IsZeroPriceAllowed,
                                                   GovtInsurancePrice = billItem.GovtInsurancePrice != null ? billItem.GovtInsurancePrice : 0
                                               }).ToList();
                        responseData.Results = visitDoctorList;
                    }
                }
                else if (reqType == "department")
                {
                    var departmentdetails = insuranceDbContext.Departments.Where(x => x.IsAppointmentApplicable == true).ToList();
                    responseData.Status = "OK";
                    responseData.Results = departmentdetails;
                }
                else if (reqType == "getPatHealthCardStatus")
                {
                    ////added by sud:3sept'18 -- revised the healthcard conditions..
                    PatientDbContext patDbContext = new PatientDbContext(connString);
                    var cardPrintInfo = patDbContext.PATHealthCard.Where(a => a.PatientId == patientId).FirstOrDefault();

                    CoreDbContext coreDbContext = new CoreDbContext(connString);
                    var parameter = coreDbContext.Parameters.Where(a => a.ParameterGroupName == "Common" && a.ParameterName == "BillItemHealthCard").FirstOrDefault();
                    if (parameter != null && parameter.ParameterValue != null)
                    {
                        //JObject paramValue = JObject.Parse(parameter.ParameterValue);
                        //var result = JsonConvert.DeserializeObject<any>(parameter.ParameterValue);

                        //dynamic result = JValue.Parse(parameter.ParameterValue);

                    }
                    //if one item was found but cancelled or returned then we've to issue it again..
                    var cardBillingInfo = insuranceDbContext.BillingTransactionItems
                                                   .Where(bItm => bItm.PatientId == patientId && bItm.ItemName == "Health Card"
                                                   && bItm.BillStatus != ENUM_BillingStatus.cancel //"cancel" 
                                                   && ((!bItm.ReturnStatus.HasValue || bItm.ReturnStatus == false)))
                                                   .FirstOrDefault();

                    var healthCardStatus = new
                    {
                        BillingDone = cardBillingInfo != null ? true : false,
                        CardPrinted = cardPrintInfo != null ? true : false
                    };

                    responseData.Results = healthCardStatus;
                }
                else if (reqType == "patient-visitHistory")
                {
                    //today's all visit or all visits with IsVisitContinued status as false
                    var visitList = (from visit in insuranceDbContext.Visit
                                     where visit.PatientId == patientId && visit.BillingStatus != ENUM_BillingStatus.returned // "returned"
                                     select visit).ToList();
                    responseData.Results = visitList;
                }
                else if (reqType == "billTxn-byRequisitioId")
                {

                    var bilTxnId = (from biltxnItem in insuranceDbContext.BillingTransactionItems
                                    join srv in insuranceDbContext.ServiceDepartment on biltxnItem.ServiceDepartmentId equals srv.ServiceDepartmentId
                                    where biltxnItem.RequisitionId == requisitionId
                                    && srv.IntegrationName.ToLower() == departmentName.ToLower()
                                    && biltxnItem.PatientId == patientId
                                    select biltxnItem.BillingTransactionId).FirstOrDefault();

                    if (bilTxnId != null && bilTxnId.HasValue)
                    {

                        var retVal = new
                        {
                            bill = insuranceDbContext.BillingTransactions.Where(b => b.BillingTransactionId == bilTxnId).FirstOrDefault(),
                            billTxnItems = (from txnItem in insuranceDbContext.BillingTransactionItems
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

                }
                else if (reqType == "GetHealthCardBillItem")
                {
                    var HealthCardBillItm = (from billItem in insuranceDbContext.BillItemPrice
                                             join srvDept in insuranceDbContext.ServiceDepartment on billItem.ServiceDepartmentId equals srvDept.ServiceDepartmentId
                                             where billItem.ItemName == "Health Card"
                                             select new
                                             {
                                                 ItemId = billItem.ItemId,
                                                 ItemName = billItem.ItemName,
                                                 ServiceDepartmentId = billItem.ServiceDepartmentId,
                                                 ServiceDepartmentName = srvDept.ServiceDepartmentName,
                                                 Price = billItem.Price,
                                                 TaxApplicable = billItem.TaxApplicable,
                                                 GovtInsurancePrice = billItem.GovtInsurancePrice != null ? billItem.GovtInsurancePrice : 0
                                             }).FirstOrDefault();


                    responseData.Status = "OK";
                    responseData.Results = HealthCardBillItm;
                }
                else if (reqType == "GetMatchingPatList")
                {

                    List<object> result = new List<object>();

                    result = (from pat in insuranceDbContext.Patients
                                  //.Include("Insurances")
                              join membership in insuranceDbContext.MembershipTypes on pat.MembershipTypeId equals membership.MembershipTypeId
                              join subDiv in insuranceDbContext.CountrySubDivisions on pat.CountrySubDivisionId equals subDiv.CountrySubDivisionId
                              where (pat.FirstName.ToLower() == firstName.ToLower() && pat.LastName.ToLower() == lastName.ToLower() && pat.Age.ToLower() == Age.ToLower() && pat.Gender.ToLower() == Gender.ToLower())
                              || (pat.PhoneNumber == phoneNumber && pat.PhoneNumber != "0" && pat.Gender.ToLower() == Gender.ToLower())
                              select new
                              {
                                  PatientId = pat.PatientId,
                                  FirstName = pat.FirstName,
                                  MiddleName = pat.MiddleName,
                                  LastName = pat.LastName,
                                  ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                  FullName = pat.FirstName + " " + pat.LastName,
                                  Gender = pat.Gender,
                                  PhoneNumber = pat.PhoneNumber,
                                  IsDobVerified = pat.IsDobVerified,
                                  DateOfBirth = pat.DateOfBirth,
                                  Age = pat.Age,
                                  CountryId = pat.CountryId,
                                  CountrySubDivisionId = pat.CountrySubDivisionId,
                                  MembershipTypeId = pat.MembershipTypeId,
                                  MembershipTypeName = membership.MembershipTypeName,
                                  MembershipDiscountPercent = membership.DiscountPercent,
                                  Address = pat.Address,
                                  PatientCode = pat.PatientCode,
                                  Ins_NshiNumber = pat.Ins_NshiNumber,
                                  CountrySubDivisionName = subDiv.CountrySubDivisionName
                              }
                                   ).ToList<object>();
                    responseData.Results = result;
                }
                else if (reqType == "getPatientsListByNshiNumber")
                {
                    List<object> result = new List<object>();

                    result = (from pat in insuranceDbContext.Patients
                              join ins in insuranceDbContext.Insurances on pat.PatientId equals ins.PatientId
                              join subDiv in insuranceDbContext.CountrySubDivisions on pat.CountrySubDivisionId equals subDiv.CountrySubDivisionId
                              where Ins_NshiNumber == ins.Ins_NshiNumber
                              select new
                              {
                                  FirstName = pat.FirstName,
                                  MiddleName = pat.MiddleName,
                                  LastName = pat.LastName,
                                  Age = pat.Age,
                                  PhoneNumber = pat.PhoneNumber,
                                  Gender = pat.Gender,
                                  Address = pat.Address,
                                  Ins_NshiNumber = pat.Ins_NshiNumber,
                                  DateOfBirth = pat.DateOfBirth,
                                  FullName = pat.FirstName + " " + pat.LastName,
                                  CountrySubDivisionName = subDiv.CountrySubDivisionName
                              }).ToList<object>();
                    responseData.Results = result;

                }
                else if (reqType == "insurance-providers")
                {
                    //declaring variable insuraceProviders of type List<InsuranceProviderModel> and assigning data from the server to it.
                    var insuranceProviders = (from insu in insuranceDbContext.InsuranceProviders
                                              select new
                                              {
                                                  insu.InsuranceProviderId,
                                                  insu.InsuranceProviderName
                                              }).ToList();
                    //assigning result to our response model object and sending it to client side.
                    responseData.Results = insuranceProviders;
                    responseData.Status = "OK";
                }
                else if (reqType == "patient-billing-context")
                {


                    var currPat = insuranceDbContext.Patients.Where(p => p.PatientId == patientId).FirstOrDefault();
                    PatientBillingContextVM currBillContext = new PatientBillingContextVM();

                    if (currPat != null)
                    {
                        //get latest bed assigned to this patient if not discharged.
                        var adtDetail = (from adm in insuranceDbContext.Admissions
                                         where adm.PatientId == currPat.PatientId && adm.AdmissionStatus == "admitted"
                                         join beds in insuranceDbContext.PatientBedInfos
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
                            VisitModel patientVisit = insuranceDbContext.Visit.Where(visit => visit.PatientId == currPat.PatientId)
                                    .OrderByDescending(a => a.PatientVisitId)
                                    .FirstOrDefault();
                            //if the latest visit is inpatient even the patient was discharged use null for visitId
                            if (patientVisit != null && patientVisit.VisitType.ToLower() != ENUM_VisitType.inpatient)
                            {
                                patientVisitId = (int?)patientVisit.PatientVisitId;
                            }
                        }

                        //for insurance details
                        currBillContext.Insurance = (from ins in insuranceDbContext.Insurances
                                                     join insProvider in insuranceDbContext.InsuranceProviders on ins.InsuranceProviderId equals insProvider.InsuranceProviderId
                                                     join pat in insuranceDbContext.Patients on ins.PatientId equals pat.PatientId
                                                     where insProvider.InsuranceProviderName == "Government Insurance" && ins.PatientId == currPat.PatientId
                                                     select new InsuranceVM
                                                     {
                                                         PatientId = ins.PatientId,
                                                         InsuranceProviderId = ins.InsuranceProviderId,
                                                         CurrentBalance = ins.CurrentBalance,
                                                         InsuranceNumber = ins.InsuranceNumber,
                                                         Ins_InsuranceBalance = ins.Ins_InsuranceBalance,
                                                         IMISCode = ins.IMISCode,
                                                         InsuranceProviderName = insProvider.InsuranceProviderName,
                                                         PatientInsurancePkgTxn = (from pkgTxn in insuranceDbContext.PatientInsurancePackageTransactions
                                                                                   join pkg in insuranceDbContext.BillingPackages on pkgTxn.PackageId equals pkg.BillingPackageId
                                                                                   where pkgTxn.PatientId == currPat.PatientId && pkgTxn.IsCompleted == false
                                                                                   select new PatientInsurancePkgTxnVM
                                                                                   {
                                                                                       PatientInsurancePackageId = pkgTxn.PatientInsurancePackageId,
                                                                                       PackageId = pkgTxn.PackageId,
                                                                                       PackageName = pkg.BillingPackageName,
                                                                                       StartDate = pkgTxn.StartDate
                                                                                   }).FirstOrDefault()
                                                     }).FirstOrDefault();

                        var patProvisional = (from bill in insuranceDbContext.BillingTransactionItems
                                              where bill.PatientId == currPat.PatientId && bill.BillStatus == ENUM_BillingStatus.provisional // "provisional" //here PatientId comes as InputId from client.
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
                else if (reqType == "get-credit-organization-list")
                {
                    var orgList = (from co in insuranceDbContext.CreditOrganization
                                   where co.IsActive == true
                                   select co).ToList();
                    responseData.Results = orgList;
                }
                else if (reqType == "existingClaimCode-VisitList")
                {
                    //NageshBB: 25-June-2021: as per business logic we are allowing same claim code to use multiple times for same patient.                     
                    string resErrMessage = "";
                    var INSParameter = insuranceDbContext.CFGParameters.Where(a => a.ParameterGroupName == "Insurance" && a.ParameterName == "ClaimCodeAutoGenerateSettings").FirstOrDefault().ParameterValue;
                    var claimcodeParameter = Newtonsoft.Json.Linq.JObject.Parse(INSParameter);
                    var minCode = Convert.ToInt64(claimcodeParameter["min"]);
                    var maxCode = Convert.ToInt64(claimcodeParameter["max"]);
                    resErrMessage = (Convert.ToInt64(claimCode) < minCode || Convert.ToInt64(claimCode) > maxCode) ? "Please enter claim code within range. " : "";
                    var flag = (Convert.ToInt64(claimCode) < minCode || Convert.ToInt64(claimCode) > maxCode) ? false : true;
                    var visitList = (from visit in insuranceDbContext.Visit.Include("Patient")
                                     where visit.PatientId != patientId && visit.ClaimCode == claimCode && (visit.BillingStatus != ENUM_BillingStatus.returned && visit.BillingStatus != ENUM_BillingStatus.cancel)

                                     select visit).ToList().OrderByDescending(v => v.PatientVisitId).ToList();

                    responseData.Status = (visitList.Count() > 0 || flag == false) ? "Failed" : "OK";
                    responseData.Results = null;
                    if (responseData.Status == "Failed")
                    {
                        responseData.ErrorMessage = (visitList.Count() > 0) ? resErrMessage + "Claim code already used for other patient,  Please enter valid claim code" : resErrMessage;
                    }


                }
                else if (reqType == "patient-visitHistory-today")
                {
                    //today's all visit or all visits with IsVisitContinued status as false
                    var visitList = (from visit in insuranceDbContext.Visit
                                     where visit.PatientId == patientId && visit.Ins_HasInsurance == true
                                     && DbFunctions.TruncateTime(visit.VisitDate) == DbFunctions.TruncateTime(DateTime.Now)
                                     && visit.BillingStatus != ENUM_BillingStatus.returned // "returned"
                                     select visit).ToList();
                    responseData.Results = visitList;
                }
                else if (reqType == "get-ins-patient-visit-list")
                {
                    /*int defaultMaxDays = 30;
                    DateTime defaultLastDateToShow = System.DateTime.Now.AddDays(-defaultMaxDays);
                    DateTime freeFollowupLastDate = System.DateTime.Now.AddDays(-dayslimit);

                    CoreDbContext coreDbContext = new CoreDbContext(connString);
                    search = search == null ? string.Empty : search.ToLower();

                    var visitVMList = (from visit in insuranceDbContext.Visit
                                       join department in insuranceDbContext.Departments on visit.DepartmentId equals department.DepartmentId
                                       join patient in insuranceDbContext.Patients on visit.PatientId equals patient.PatientId
                                       where ((visit.VisitStatus == status) && ((visit.Ins_HasInsurance.HasValue ? visit.Ins_HasInsurance : false) == true)
                                          && visit.VisitDate > DbFunctions.TruncateTime(defaultLastDateToShow) && visit.VisitType != ENUM_VisitType.inpatient) && visit.BillingStatus != ENUM_BillingStatus.returned
                                          && (visit.Patient.FirstName + " " + (string.IsNullOrEmpty(visit.Patient.MiddleName) ? "" : visit.Patient.MiddleName + " ")
                                     + visit.Patient.LastName + visit.Patient.PatientCode + visit.Patient.PhoneNumber).Contains(search)
                                       select new ListVisitsVM
                                       {
                                           PatientVisitId = visit.PatientVisitId,
                                           ParentVisitId = visit.ParentVisitId,
                                           DepartmentId = department.DepartmentId,
                                           DepartmentName = department.DepartmentName,
                                           ProviderId = visit.ProviderId,
                                           ProviderName = visit.ProviderName,
                                           VisitDate = visit.VisitDate,
                                           VisitTime = visit.VisitTime,

                                           VisitType = visit.VisitType,
                                           AppointmentType = visit.AppointmentType,

                                           PatientId = patient.PatientId,
                                           PatientCode = patient.PatientCode,
                                           ShortName = patient.FirstName + " " + (string.IsNullOrEmpty(patient.MiddleName) ? "" : patient.MiddleName + " ") + patient.LastName,
                                           PhoneNumber = patient.PhoneNumber,
                                           DateOfBirth = patient.DateOfBirth,
                                           Gender = patient.Gender,
                                           Patient = patient,
                                           ClaimCode = visit.ClaimCode,
                                           Ins_NshiNumber = patient.Ins_NshiNumber,
                                           BillStatus = visit.BillingStatus,
                                           Ins_HasInsurance = visit.Ins_HasInsurance
                                       }).OrderByDescending(v => v.VisitDate).ThenByDescending(a => a.VisitTime).AsQueryable();

                    if (CommonFunctions.GetCoreParameterBoolValue(coreDbContext, "Common", "ServerSideSearchComponent", "InsuranceVisitList") == true && search == "")
                    {
                        visitVMList = visitVMList.Take(CommonFunctions.GetCoreParameterIntValue(coreDbContext, "Common", "ServerSideSearchListLength"));
                    }
                    var finalResults = visitVMList.ToList();
                    //check if the topmost visit is valid for follow up or not.
                    var List = VisitBL.GetValidForFollowUp(finalResults, freeFollowupLastDate);
                    responseData.Results = List;*/

                    List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@SearchTxt", search),
                          new SqlParameter("@RowCounts", 200),
                          new SqlParameter("@DaysLimit",dayslimit)};

                    DataTable dtInsPatient = DALFunctions.GetDataTableFromStoredProc("SP_INS_GetVisitListOfValidDays", paramList, insuranceDbContext);
                    responseData.Results = dtInsPatient;
                    responseData.Status = "OK";

                }
                else if (reqType != null && reqType == "getVisitInfoforStickerPrint")
                {
                    List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@PatientVisitId", visitId) };
                    DataTable patStickerDetails = DALFunctions.GetDataTableFromStoredProc("SP_INS_GetPatientVisitStickerInfo", paramList, insuranceDbContext);
                    responseData.Results = patStickerDetails;
                    responseData.Status = "OK";
                    responseData.Results = patStickerDetails;
                }
                else if (reqType == "insurance-billing-items")
                {
                    var itemList = (from item in insuranceDbContext.BillItemPrice
                                    join srv in insuranceDbContext.ServiceDepartment on item.ServiceDepartmentId equals srv.ServiceDepartmentId
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
                                        IsZeroPriceAllowed = item.IsZeroPriceAllowed,
                                        TaxApplicable = item.TaxApplicable,
                                        DiscountApplicable = item.DiscountApplicable,
                                        Description = item.Description,
                                        IsDoctorMandatory = item.IsDoctorMandatory,
                                        item.IsInsurancePackage,
                                        IsErLabApplicable = item.IsErLabApplicable,
                                    }).ToList().OrderBy(a => a.ServiceDepartmentId).ThenBy(a => a.ItemId);
                    responseData.Status = "OK";
                    responseData.Results = itemList;
                }
                else if (reqType == "get-latest-visit-claim-code")
                {
                    //var lastClaimCode = insuranceDbContext.Visit.AsQueryable()
                    //                         .Where(t => t.Ins_HasInsurance == true && t.PatientId == patientId)
                    //                         .Select(i => i.ClaimCode).DefaultIfEmpty().ToList().Max(t => t);
                    //responseData.Status = (lastClaimCode != null || lastClaimCode != 0) ? "OK" : "Failed";
                    //responseData.Results = lastClaimCode;

                    //sud:11-Oct'21--getting the Claimcode of last visit (orderby PatVisitId) instead of getting max.. 
                    //case: LPH used 10Digits Claimcode earlier and later used 9digits. So Max(Claimcode) is always giving 10Digits claimcode..
                    var lastClaimCode = insuranceDbContext.Visit.AsQueryable()
                                             .Where(t => t.Ins_HasInsurance == true && t.PatientId == patientId && t.ClaimCode != null)
                                             .OrderByDescending(vis => vis.PatientVisitId)
                                              .Select(i => i.ClaimCode).FirstOrDefault();
                    // .Select(i => i.ClaimCode).DefaultIfEmpty().ToList().Max(t => t);
                    responseData.Status = (lastClaimCode != null || lastClaimCode != 0) ? "OK" : "Failed";
                    responseData.Results = lastClaimCode;
                }
                //Insurance IPD Billing
                else if (reqType == "InPatientDetailForPartialBilling")
                {
                    var visitNAdmission = (from visit in insuranceDbContext.Visit.Include(v => v.Admission)
                                           where visit.PatientVisitId == patVisitId
                                           select visit).FirstOrDefault();

                    var patientDetail = (from pat in insuranceDbContext.Patients
                                         join sub in insuranceDbContext.CountrySubDivisions on pat.CountrySubDivisionId equals sub.CountrySubDivisionId
                                         where pat.PatientId == visitNAdmission.PatientId
                                         select new PatientDetailVM
                                         {
                                             PatientId = pat.PatientId,
                                             PatientName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                             HospitalNo = pat.PatientCode,
                                             DateOfBirth = pat.DateOfBirth,
                                             Gender = pat.Gender,
                                             Address = pat.Address,
                                             ContactNo = pat.PhoneNumber,
                                             InpatientNo = visitNAdmission.VisitCode,
                                             CountrySubDivision = sub.CountrySubDivisionName,
                                             PANNumber = pat.PANNumber
                                         }).FirstOrDefault();

                    responseData.Results = patientDetail;
                    responseData.Status = "OK";
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
                else if (reqType == "get-active-employees-info")
                {
                    var employeeList = (from e in insuranceDbContext.Employee.Include("Department").Include("EmployeeRole").Include("EmployeeType")
                                        where e.IsExternal == false && e.IsActive == true
                                        select new
                                        {
                                            EmployeeId = e.EmployeeId,
                                            Salutation = e.Salutation,
                                            FirstName = e.FirstName,
                                            MiddleName = e.MiddleName,
                                            LastName = e.LastName,
                                            FullName = e.FullName,
                                            ContactNumber = e.ContactNumber,
                                            Gender = e.Gender,
                                            DepartmentId = e.DepartmentId,
                                            DepartmentName = e.Department != null ? e.Department.DepartmentName : null,
                                            EmployeeRoleId = e.EmployeeRoleId,
                                            EmployeeRoleName = e.EmployeeRole != null ? e.EmployeeRole.EmployeeRoleName : null,
                                            EmployeeTypeId = e.EmployeeTypeId,
                                            EmployeeTypeName = e.EmployeeType != null ? e.EmployeeType.EmployeeTypeName : null,
                                            IsAppointmentApplicable = e.IsAppointmentApplicable,
                                            DisplaySequence = e.DisplaySequence
                                        }).OrderBy(e => e.EmployeeId).ToList();

                    responseData.Status = "OK";
                    responseData.Results = employeeList;
                }
                else if (reqType == "patientCurrentVisitContext")
                {
                    var data = (from bedInfo in insuranceDbContext.PatientBedInfos
                                join bedFeat in insuranceDbContext.BedFeatures on bedInfo.BedFeatureId equals bedFeat.BedFeatureId
                                join bed in insuranceDbContext.Beds on bedInfo.BedId equals bed.BedId
                                join ward in insuranceDbContext.Wards on bedInfo.WardId equals ward.WardId
                                join adm in insuranceDbContext.Admissions on bedInfo.PatientVisitId equals adm.PatientVisitId
                                where adm.PatientId == patientId && adm.AdmissionStatus == "admitted"
                                select new
                                {
                                    bedFeat.BedFeatureName,
                                    adm.PatientVisitId,
                                    ward.WardName,
                                    bed.BedNumber,
                                    bed.BedCode,
                                    adm.AdmittingDoctorId,
                                    bedInfo.StartedOn,
                                    adm.AdmissionDate
                                }).OrderByDescending(a => a.StartedOn).FirstOrDefault();

                    if (data != null)
                    {
                        var results = new
                        {
                            PatientId = patientId,
                            PatientVisitId = data.PatientVisitId,
                            BedFeatureName = data.BedFeatureName,
                            BedNumber = data.BedNumber,
                            BedCode = data.BedCode,
                            ProviderId = data.AdmittingDoctorId,
                            ProviderName = VisitBL.GetProviderName(data.AdmittingDoctorId, base.connString),
                            Current_WardBed = data.WardName,
                            VisitType = "inpatient",
                            AdmissionDate = data.AdmissionDate,
                            VisitDate = data.AdmissionDate//sud:14Mar'19--needed in Billing
                        };
                        responseData.Results = results;
                    }
                    else
                    {
                        var patVisitInfo = (from vis in insuranceDbContext.Visit
                                            where vis.PatientId == patientId && (visitId > 0 ? vis.PatientVisitId == visitId : true)
                                            select new
                                            {
                                                vis.PatientId,
                                                vis.PatientVisitId,
                                                vis.ProviderId,
                                                ProviderName = "",
                                                vis.VisitType,
                                                vis.VisitDate
                                            }).OrderByDescending(a => a.VisitDate).FirstOrDefault();
                        if (patVisitInfo != null)
                        {
                            if (patVisitInfo.VisitType.ToLower() == "outpatient")
                            {
                                var results = new
                                {
                                    PatientId = patVisitInfo.PatientId,
                                    PatientVisitId = patVisitInfo.PatientVisitId,
                                    ProviderId = patVisitInfo.ProviderId,
                                    ProviderName = VisitBL.GetProviderName(patVisitInfo.ProviderId, base.connString),
                                    Current_WardBed = "outpatient",
                                    VisitType = "outpatient",
                                    AdmissionDate = (DateTime?)null,
                                    VisitDate = patVisitInfo.VisitDate//sud:14Mar'19--needed in Billing
                                };
                                responseData.Results = results;
                            }
                            else if (patVisitInfo.VisitType.ToLower() == "emergency")
                            {
                                var results = new
                                {
                                    PatientId = patVisitInfo.PatientId,
                                    PatientVisitId = patVisitInfo.PatientVisitId,
                                    ProviderId = patVisitInfo.ProviderId,
                                    ProviderName = VisitBL.GetProviderName(patVisitInfo.ProviderId, base.connString),
                                    Current_WardBed = "emergency",
                                    VisitType = "emergency",
                                    AdmissionDate = (DateTime?)null,
                                    VisitDate = patVisitInfo.VisitDate//sud:14Mar'19--needed in Billing
                                };
                                responseData.Results = results;
                            }
                        }
                        else
                        {
                            var results = new
                            {
                                PatientId = patientId,
                                PatientVisitId = (int?)null,
                                ProviderId = (int?)null,
                                ProviderName = (string)null,
                                Current_WardBed = "outpatient",
                                VisitType = "outpatient",
                                AdmissionDate = (DateTime?)null,
                                VisitDate = (DateTime?)null//sud:14Mar'19--needed in Billing
                            };
                            responseData.Results = results;
                        }
                    }
                    //responseData.Status = "OK";
                }
                else if (reqType == "patient-visit-providerWise")
                {
                    //if we do orderbydescending, the latest visit would come at the top. 
                    var patAllVisits = (from v in insuranceDbContext.Visit
                                        join doc in insuranceDbContext.Employee
                                         on v.ProviderId equals doc.EmployeeId
                                        where v.PatientId == patientId && v.BillingStatus != ENUM_BillingStatus.returned // "returned"
                                        group new { v, doc } by new { v.ProviderId, doc.FirstName, doc.MiddleName, doc.LastName, doc.Salutation } into patVis
                                        select new
                                        {
                                            PatientVisitId = patVis.Max(a => a.v.PatientVisitId),
                                            PatientId = patientId,
                                            ProviderId = patVis.Key.ProviderId,
                                            ProviderName = (string.IsNullOrEmpty(patVis.Key.Salutation) ? "" : patVis.Key.Salutation + ". ") + patVis.Key.FirstName + " " + (string.IsNullOrEmpty(patVis.Key.MiddleName) ? "" : patVis.Key.MiddleName + " ") + patVis.Key.LastName
                                        }).OrderByDescending(v => v.PatientVisitId).ToList();

                    //If there's no visit for this patient, add one default visit to Unknown Dr.here will always be one visit with all values set to Empty/Null. 
                    int? providerId = 0;
                    patAllVisits.Add(new { PatientVisitId = 0, PatientId = patientId, ProviderId = providerId, ProviderName = "SELF" });

                    responseData.Results = patAllVisits;
                }
                else if (reqType != null && reqType == "patAllDeposits")
                {
                    var PatientDeposit = (from deposit in insuranceDbContext.BillingDeposits
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
                //This block is for NormalProvisionalBilling 
                else if (reqType != null && reqType == "patientPastBillSummary")
                {
                    //Part-1: Get Deposit Balance of this patient. 
                    //get all deposit related transactions of this patient. and sum them acc to DepositType groups.
                    var patientAllDepositTxns = (from bill in insuranceDbContext.BillingDeposits
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
                    var patProvisional = (from bill in insuranceDbContext.BillingTransactionItems
                                              //sud: 4May'18 changed unpaid to provisional
                                          where bill.PatientId == InputId && bill.BillStatus == ENUM_BillingStatus.provisional // "provisional" //here PatientId comes as InputId from client.
                                          && (bill.IsInsurance == false || bill.IsInsurance == null)
                                          group bill by new { bill.PatientId } into p
                                          select new
                                          {
                                              TotalProvisionalAmt = p.Sum(a => a.TotalAmount)
                                          }).FirstOrDefault();

                    var patProvisionalAmt = patProvisional != null ? patProvisional.TotalProvisionalAmt : 0;

                    //Part-3: Return a single object with Both Balances (Deposit and Credit). 
                    var patCredits = (from bill in insuranceDbContext.BillingTransactionItems
                                      where bill.PatientId == InputId
                                      && bill.BillStatus == ENUM_BillingStatus.unpaid// "unpaid"
                                      && (bill.ReturnStatus == false || bill.ReturnStatus == null)
                                      && (bill.IsInsurance == false || bill.IsInsurance == null)
                                      group bill by new { bill.PatientId } into p
                                      select new
                                      {
                                          TotalUnPaidAmt = p.Sum(a => a.TotalAmount)
                                      }).FirstOrDefault();

                    var patCreditAmt = patCredits != null ? patCredits.TotalUnPaidAmt : 0;

                    //Part-4: Get Total Paid Amount
                    var patPaid = (from bill in insuranceDbContext.BillingTransactionItems
                                   where bill.PatientId == InputId
                                   && bill.BillStatus == ENUM_BillingStatus.paid // "paid"
                                   && (bill.ReturnStatus == false || bill.ReturnStatus == null)
                                   && (bill.IsInsurance == false || bill.IsInsurance == null)
                                   group bill by new { bill.PatientId } into p
                                   select new
                                   {
                                       TotalPaidAmt = p.Sum(a => a.TotalAmount)
                                   }).FirstOrDefault();

                    var patPaidAmt = patPaid != null ? patPaid.TotalPaidAmt : 0;

                    //Part-5: get Total Discount Amount 
                    var patDiscount = (from bill in insuranceDbContext.BillingTransactionItems
                                       where bill.PatientId == InputId
                                       && bill.BillStatus == ENUM_BillingStatus.unpaid// "unpaid"
                                       && (bill.ReturnStatus == false || bill.ReturnStatus == null)
                                       && (bill.IsInsurance == false || bill.IsInsurance == null)
                                       group bill by new { bill.PatientId } into p
                                       select new
                                       {
                                           TotalDiscountAmt = p.Sum(a => a.DiscountAmount)
                                       }).FirstOrDefault();

                    var patDiscountAmt = patDiscount != null ? patDiscount.TotalDiscountAmt : 0;

                    //Part-6: get Total Cancelled Amount
                    var patCancel = (from bill in insuranceDbContext.BillingTransactionItems
                                         //sud: 4May'18 changed unpaid to provisional
                                     where bill.PatientId == InputId
                                     && bill.BillStatus == ENUM_BillingStatus.cancel// "cancel"
                                     && (bill.IsInsurance == false || bill.IsInsurance == null)
                                     group bill by new { bill.PatientId } into p
                                     select new
                                     {
                                         TotalPaidAmt = p.Sum(a => a.TotalAmount)
                                     }).FirstOrDefault();

                    var patCancelAmt = patCancel != null ? patCancel.TotalPaidAmt : 0;

                    var patReturn = (from bill in insuranceDbContext.BillingTransactionItems
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
                else if (reqType != null && reqType == "GetProviderList")
                {
                    List<EmployeeModel> empListFromCache = (List<EmployeeModel>)DanpheCache.GetMasterData(MasterDataEnum.Employee);
                    var docotorList = empListFromCache.Where(emp => emp.IsAppointmentApplicable.HasValue
                                                          && emp.IsAppointmentApplicable == true).ToList()
                                                          .Select(emp => new { EmployeeId = emp.EmployeeId, EmployeeName = emp.FullName });
                    responseData.Results = docotorList;
                    responseData.Status = "OK";
                }
                else if (reqType == "pat-pending-items")
                {
                    var BedServiceDepartmentId = insuranceDbContext.CFGParameters.Where(a => a.ParameterGroupName == "ADT" && a.ParameterName == "Bed_Charges_SevDeptId").FirstOrDefault().ParameterValue;
                    var intbedservdeptid = Convert.ToInt64(BedServiceDepartmentId);

                    var pendingItems = insuranceDbContext.BillingTransactionItems.Where(itm => itm.PatientId == patientId && itm.PatientVisitId == ipVisitId
                                                  && itm.BillStatus == ENUM_BillingStatus.provisional && itm.IsInsurance == true).AsEnumerable().ToList();

                    var bedPatInfo = (from bedInfo in insuranceDbContext.PatientBedInfos
                                      where bedInfo.PatientVisitId == ipVisitId
                                      select bedInfo).OrderBy(x => x.PatientBedInfoId).ToList().LastOrDefault();
                    DateTime admDate = insuranceDbContext.Admissions.Where(a => a.PatientVisitId == bedPatInfo.PatientVisitId && a.PatientId == bedPatInfo.PatientId).Select(a => a.AdmissionDate).FirstOrDefault();
                    var tempTime = admDate.TimeOfDay;
                    var EndDateTime = DateTime.Now.Date + tempTime;
                    TimeSpan qty;
                    var checkBedFeatureId = insuranceDbContext.PatientBedInfos.Where(a => a.PatientVisitId == bedPatInfo.PatientVisitId && a.PatientId == bedPatInfo.PatientId && bedPatInfo.BedFeatureId == a.BedFeatureId).Select(a => a.BedFeatureId).ToList();
                    pendingItems.ForEach(itm =>
                    {
                        if (itm.ItemId == bedPatInfo.BedFeatureId && itm.ServiceDepartmentId == intbedservdeptid && bedPatInfo.EndedOn == null && itm.ModifiedBy == null)
                        {
                            itm.IsLastBed = true;
                            if (DateTime.Now > EndDateTime)
                            {
                                qty = EndDateTime.Subtract(bedPatInfo.StartedOn.Value);
                                itm.Quantity = (checkBedFeatureId.Count > 1) ? ((int)qty.TotalDays + itm.Quantity + 1) : (itm.Quantity = (int)qty.TotalDays + 1);
                                if (bedPatInfo.StartedOn.Value.Date != EndDateTime.Date)
                                {
                                    itm.Quantity = (DateTime.Now.TimeOfDay > EndDateTime.TimeOfDay) ? (itm.Quantity + 1) : itm.Quantity;
                                }
                            }
                            else
                            {
                                qty = DateTime.Now.Subtract(bedPatInfo.StartedOn.Value);
                                itm.Quantity = (checkBedFeatureId.Count > 1) ? ((int)qty.TotalDays + itm.Quantity + 1) : ((int)qty.TotalDays) + 1;

                            }
                        }
                    });
                    var itemToRemove = pendingItems.Where(r => r.Quantity == 0).Select(z => z).ToList();
                    if (itemToRemove.Count > 0)
                    {
                        itemToRemove.ForEach(a =>
                        {
                            pendingItems.Remove(a);
                        });
                    }
                    var srvDepts = insuranceDbContext.ServiceDepartment.ToList();
                    var billItems = insuranceDbContext.BillItemPrice.ToList();
                    //update integrationName and integrationServiceDepartmentName
                    //required while updating quantity of ADT items.
                    pendingItems.ForEach(penItem =>
                    {
                        var itemIntegrationDetail = (from itm in billItems
                                                     join srv in srvDepts on itm.ServiceDepartmentId equals srv.ServiceDepartmentId
                                                     where itm.ServiceDepartmentId == penItem.ServiceDepartmentId && itm.ItemId == penItem.ItemId
                                                     select new
                                                     {
                                                         ItemIntegrationName = itm.IntegrationName,
                                                         SrvIntegrationName = srv.IntegrationName
                                                     }).FirstOrDefault();
                        if (itemIntegrationDetail != null)
                        {
                            penItem.ItemIntegrationName = itemIntegrationDetail.ItemIntegrationName;
                            penItem.SrvDeptIntegrationName = itemIntegrationDetail.SrvIntegrationName;
                        }
                        penItem.ServiceDepartment = null;

                    });
                    var admInfo = (from adm in insuranceDbContext.Admissions.Include(a => a.Visit.Patient)
                                   where adm.PatientVisitId == ipVisitId && adm.PatientId == patientId
                                   let visit = adm.Visit
                                   let patient = adm.Visit.Patient
                                   let doc = insuranceDbContext.Employee.Where(doc => doc.EmployeeId == adm.AdmittingDoctorId).Select(d => d.FullName).FirstOrDefault() ?? string.Empty
                                   select new
                                   {
                                       AdmissionPatientId = adm.PatientAdmissionId,
                                       PatientId = patient.PatientId,
                                       PatientNo = patient.PatientCode,
                                       patient.Gender,
                                       patient.DateOfBirth,
                                       patient.PhoneNumber,
                                       VisitId = adm.PatientVisitId,
                                       IpNumber = visit.VisitCode,
                                       PatientName = patient.ShortName,
                                       FirstName = patient.FirstName,
                                       LastName = patient.LastName,
                                       MiddleName = patient.MiddleName,
                                       MembershipTypeId = patient.MembershipTypeId,
                                       AdmittedOn = adm.AdmissionDate,
                                       DischargedOn = adm.AdmissionStatus == "admitted" ? (DateTime?)DateTime.Now : adm.DischargeDate,
                                       AdmittingDoctorId = adm.AdmittingDoctorId,
                                       AdmittingDoctorName = doc,
                                       ProcedureType = adm.ProcedureType,
                                       IsPoliceCase = adm.IsPoliceCase.HasValue ? adm.IsPoliceCase : false,
                                       ClaimCode = visit.ClaimCode,
                                       Ins_NshiNumber = patient.Ins_NshiNumber,
                                       Ins_InsuranceBalance = patient.Ins_InsuranceBalance,

                                       DepositAdded = (
                                          insuranceDbContext.BillingDeposits.Where(dep => dep.PatientId == patient.PatientId &&
                                                                        dep.PatientVisitId == visit.PatientVisitId &&
                                                                        dep.DepositType.ToLower() == ENUM_BillDepositType.Deposit.ToLower()  //"deposit"
                                                                         && dep.IsActive == true)
                                           .Sum(dep => dep.Amount)

                                        ),

                                       DepositReturned = (
                                              insuranceDbContext.BillingDeposits.Where(dep =>
                                                  dep.PatientId == patient.PatientId &&
                                                  dep.PatientVisitId == visit.PatientVisitId &&
                                                  (dep.DepositType.ToLower() == ENUM_BillDepositType.DepositDeduct.ToLower() || dep.DepositType.ToLower() == ENUM_BillDepositType.ReturnDeposit.ToLower()) &&
                                                  //(dep.DepositType.ToLower() == "depositdeduct" || dep.DepositType.ToLower() == "returndeposit") &&
                                                  dep.IsActive == true
                                           ).Sum(dep => dep.Amount)
                                        ),
                                       DepositTxns = (
                                         insuranceDbContext.BillingDeposits.Where(dep => dep.PatientId == patient.PatientId &&
                                                                                   dep.IsActive == true)
                                       ).ToList(),

                                       BedsInformation = (
                                       from bedInfo in insuranceDbContext.PatientBedInfos
                                       where bedInfo.PatientVisitId == adm.PatientVisitId
                                       join ward in insuranceDbContext.Wards
                                       on bedInfo.WardId equals ward.WardId
                                       join bf in insuranceDbContext.BedFeatures
                                       on bedInfo.BedFeatureId equals bf.BedFeatureId
                                       join bed in insuranceDbContext.Beds
                                      on bedInfo.BedId equals bed.BedId
                                       select new
                                       {
                                           bedInfo.PatientBedInfoId,
                                           BedId = bedInfo.BedId,
                                           WardId = ward.WardId,
                                           WardName = ward.WardName,
                                           BedFeatureName = bf.BedFeatureName,
                                           bed.BedNumber,
                                           PricePerDay = bedInfo.BedPrice,
                                           StartedOn = bedInfo.StartedOn,
                                           EndedOn = bedInfo.EndedOn.HasValue ? bedInfo.EndedOn : DateTime.Now
                                       }).OrderByDescending(a => a.PatientBedInfoId).FirstOrDefault(),

                                       BedDetails = (from bedInfos in insuranceDbContext.PatientBedInfos
                                                     join bedFeature in insuranceDbContext.BedFeatures on bedInfos.BedFeatureId equals bedFeature.BedFeatureId
                                                     join bed in insuranceDbContext.Beds on bedInfos.BedId equals bed.BedId
                                                     join ward in insuranceDbContext.Wards on bed.WardId equals ward.WardId
                                                     where (bedInfos.PatientVisitId == adm.PatientVisitId)
                                                     select new BedDetailVM
                                                     {
                                                         PatientBedInfoId = bedInfos.PatientBedInfoId,
                                                         BedFeatureId = bedFeature.BedFeatureId,
                                                         WardName = ward.WardName,
                                                         BedCode = bed.BedCode,
                                                         BedFeature = bedFeature.BedFeatureName,
                                                         StartDate = bedInfos.StartedOn,
                                                         EndDate = bedInfos.EndedOn,
                                                         BedPrice = bedInfos.BedPrice,
                                                         Action = bedInfos.Action,
                                                         Days = 0,
                                                     }).OrderByDescending(a => a.PatientBedInfoId).ToList()
                                   }).FirstOrDefault();




                    var patIpInfo = new
                    {
                        AdmissionInfo = admInfo,
                        PendingBillItems = pendingItems

                        //allBillItem = billItems, // sud: 30Apr'20-- These two are not needed in this list.. they're already available in client side..
                        //AllEmployees = allEmployees
                    };

                    responseData.Results = patIpInfo;
                }
                else if (reqType == "check-credit-bill")
                {
                    BillingTransactionModel billTxn = insuranceDbContext.BillingTransactions.Where(a => a.PatientId == patientId && a.BillStatus == "unpaid" && a.ReturnStatus != true).FirstOrDefault();
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

                else if (reqType == "additional-info-discharge-receipt" && ipVisitId != 0)
                {
                    RbacDbContext rbacDbContext = new RbacDbContext(connString);
                    AdmissionDetailVM admInfo = null;
                    PatientDetailVM patientDetail = null;
                    //List<DepositDetailVM> deposits = null;
                    BillingTransactionDetailVM billingTxnDetail = null;

                    var visitNAdmission = (from visit in insuranceDbContext.Visit.Include(v => v.Admission)
                                           where visit.PatientVisitId == ipVisitId
                                           select visit).FirstOrDefault();
                    if (visitNAdmission != null && visitNAdmission.Admission != null)
                    {
                        var patId = visitNAdmission.PatientId;
                        var patientVisitId = visitNAdmission.PatientVisitId;
                        var billTxn = insuranceDbContext.BillingTransactions.Where(a => a.BillingTransactionId == billingTxnId).FirstOrDefault();

                        //--Pratik: We dont need Deposit Detail in Insurance since all Insurance transaction is in Credit.
                        //if (billTxn != null && billTxn.ReturnStatus == false)
                        //{
                        //    deposits = (from deposit in insuranceDbContext.BillingDeposits
                        //                where deposit.PatientId == patId &&
                        //                deposit.PatientVisitId == ipVisitId && deposit.DepositType != ENUM_BillDepositType.DepositCancel && //"depositcancel" &&
                        //                deposit.IsActive == true
                        //                join settlement in insuranceDbContext.BillSettlements on deposit.SettlementId
                        //                equals settlement.SettlementId into settlementTemp
                        //                from billSettlement in settlementTemp.DefaultIfEmpty()
                        //                select new DepositDetailVM
                        //                {
                        //                    DepositId = deposit.DepositId,
                        //                    IsActive = deposit.IsActive,
                        //                    ReceiptNo = "DR" + deposit.ReceiptNo.ToString(),
                        //                    ReceiptNum = deposit.ReceiptNo, //yubraj: to check whether receipt number is null or not for client side use
                        //                    Date = deposit.CreatedOn,
                        //                    Amount = deposit.Amount,
                        //                    Balance = deposit.DepositBalance,
                        //                    DepositType = deposit.DepositType,
                        //                    ReferenceInvoice = deposit.SettlementId != null ? "SR " + billSettlement.SettlementReceiptNo.ToString() : null,
                        //                }).OrderBy(a => a.Date).ToList();
                        //}
                        //else
                        //{
                        //    deposits = (from deposit in insuranceDbContext.BillingDeposits
                        //                where deposit.PatientId == patId &&
                        //                deposit.PatientVisitId == ipVisitId && deposit.IsActive == true
                        //                join settlement in insuranceDbContext.BillSettlements on deposit.SettlementId
                        //                equals settlement.SettlementId into settlementTemp
                        //                from billSettlement in settlementTemp.DefaultIfEmpty()
                        //                select new DepositDetailVM
                        //                {
                        //                    DepositId = deposit.DepositId,
                        //                    IsActive = deposit.IsActive,
                        //                    ReceiptNo = "DR" + deposit.ReceiptNo.ToString(),
                        //                    ReceiptNum = deposit.ReceiptNo, //yubraj: to check whether receipt number is null or not for client side use
                        //                    Date = deposit.CreatedOn,
                        //                    Amount = deposit.Amount,
                        //                    Balance = deposit.DepositBalance,
                        //                    DepositType = deposit.DepositType,
                        //                    ReferenceInvoice = deposit.SettlementId != null ? "SR " + billSettlement.SettlementReceiptNo.ToString() : null,
                        //                }).OrderBy(a => a.Date).ToList();
                        //}
                        //dischDetail.AdmissionInfo.AdmittingDoctor = "Dr. Anil Shakya";

                        AdmissionDbContext admDbContext = new AdmissionDbContext(connString);
                        var admittingDocId = insuranceDbContext.Employee.Where(e => e.EmployeeId == visitNAdmission.ProviderId).Select(d => d.DepartmentId).FirstOrDefault() ?? 0;
                        DepartmentModel dept = insuranceDbContext.Departments.Where(d => d.DepartmentId == admittingDocId).FirstOrDefault();
                        //EmployeeModel admittingDoc = insuranceDbContext.Employee.Where(e => e.EmployeeId == visitNAdmission.ProviderId).FirstOrDefault();
                        //DepartmentModel dept = insuranceDbContext.Departments.Where(d => d.DepartmentId == admittingDoc.DepartmentId).FirstOrDefault();
                        List<PatientBedInfo> patBeds = admDbContext.PatientBedInfos.Where(b => b.PatientVisitId == visitNAdmission.PatientVisitId).OrderByDescending(a => a.PatientBedInfoId).ToList();

                        WardModel ward = null;
                        //we're getting first ward from admission info as WardName. <needs revision>
                        if (patBeds != null && patBeds.Count > 0)
                        {
                            int wardId = patBeds.ElementAt(0).WardId;
                            ward = admDbContext.Wards.Where(w => w.WardId == wardId).FirstOrDefault();
                        }

                        admInfo = new AdmissionDetailVM()
                        {
                            AdmissionDate = visitNAdmission.Admission.AdmissionDate,
                            DischargeDate = visitNAdmission.Admission.DischargeDate.HasValue ? visitNAdmission.Admission.DischargeDate.Value : DateTime.Now,
                            Department = dept != null ? dept.DepartmentName : "",//need to change this and get this from ADT-Bed Info table--sud: 20Aug'18
                            RoomType = ward != null ? ward.WardName : "",
                            LengthOfStay = CalculateBedStayForAdmission(visitNAdmission.Admission),
                            AdmittingDoctor = visitNAdmission.ProviderName,
                            ProcedureType = visitNAdmission.Admission.ProcedureType
                        };

                        patientDetail = (from pat in insuranceDbContext.Patients
                                         join sub in insuranceDbContext.CountrySubDivisions on pat.CountrySubDivisionId equals sub.CountrySubDivisionId
                                         where pat.PatientId == visitNAdmission.PatientId
                                         select new PatientDetailVM
                                         {
                                             PatientId = pat.PatientId,
                                             PatientName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                             HospitalNo = pat.PatientCode,
                                             DateOfBirth = pat.DateOfBirth,
                                             Gender = pat.Gender,
                                             Address = pat.Address,
                                             ContactNo = pat.PhoneNumber,
                                             InpatientNo = visitNAdmission.VisitCode,
                                             CountrySubDivision = sub.CountrySubDivisionName,
                                             PANNumber = pat.PANNumber,
                                             Ins_NshiNumber = pat.Ins_NshiNumber,
                                             ClaimCode = visitNAdmission.ClaimCode
                                         }).FirstOrDefault();


                    }

                    //ashim: 14Sep2018 : BillingDetail for Discharge Bill

                    billingTxnDetail = (from bil in insuranceDbContext.BillingTransactions
                                        join emp in insuranceDbContext.Employee on bil.CreatedBy equals emp.EmployeeId
                                        join fiscalYear in insuranceDbContext.BillingFiscalYears on bil.FiscalYearId equals fiscalYear.FiscalYearId
                                        where bil.BillingTransactionId == billingTxnId
                                        select new BillingTransactionDetailVM
                                        {
                                            FiscalYear = fiscalYear.FiscalYearFormatted,
                                            ReceiptNo = bil.InvoiceNo,
                                            InvoiceNumber = bil.InvoiceCode + bil.InvoiceNo.ToString(),
                                            BillingDate = bil.CreatedOn,
                                            PaymentMode = bil.PaymentMode,
                                            DepositBalance = bil.DepositBalance + bil.DepositReturnAmount,
                                            CreatedBy = bil.CreatedBy,
                                            //DepositDeductAmount = bil.DepositReturnAmount,
                                            TotalAmount = bil.TotalAmount,
                                            Discount = bil.DiscountAmount,
                                            SubTotal = bil.SubTotal,
                                            Quantity = bil.TotalQuantity,
                                            User = "",
                                            Remarks = bil.Remarks,
                                            PrintCount = bil.PrintCount,
                                            ReturnStatus = bil.ReturnStatus,
                                            OrganizationId = bil.OrganizationId,
                                            ExchangeRate = bil.ExchangeRate,
                                            Tender = bil.Tender,
                                            Change = bil.Change,
                                            IsInsuranceBilling = bil.IsInsuranceBilling,
                                            LabTypeName = bil.LabTypeName
                                        }).FirstOrDefault();
                    if (billingTxnDetail != null)
                    {
                        billingTxnDetail.User = rbacDbContext.Users.Where(usr => usr.EmployeeId == billingTxnDetail.CreatedBy).Select(a => a.UserName).FirstOrDefault();
                        if (billingTxnDetail.OrganizationId != null)
                        {
                            billingTxnDetail.OrganizationName = insuranceDbContext.CreditOrganization.Where(a => a.OrganizationId == billingTxnDetail.OrganizationId).Select(b => b.OrganizationName).FirstOrDefault();
                        }
                    }


                    var dischargeBillInfo = new
                    {
                        AdmissionInfo = admInfo,
                        //DepositInfo = deposits,
                        BillingTxnDetail = billingTxnDetail,
                        PatientDetail = patientDetail
                    };

                    responseData.Results = dischargeBillInfo;
                    responseData.Status = "OK";
                }
                else if (reqType == "insurance-upadte-balance-history")
                {

                    var insBal = (from insbal in insuranceDbContext.InsuranceBalanceHistories
                                  join pat in insuranceDbContext.Patients on insbal.PatientId equals pat.PatientId
                                  where pat.Ins_HasInsurance == true
                                  join ins in insuranceDbContext.Insurances on pat.Ins_InsuranceBalance equals ins.Ins_InsuranceBalance
                                  join emp in insuranceDbContext.Employee on insbal.CreatedBy equals emp.EmployeeId
                                  where insbal.PatientId == patientId
                                  select new
                                  {
                                      patientId = insbal.PatientId,
                                      PatientCode = pat.PatientCode,
                                      ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                      FirstName = pat.FirstName,
                                      LastName = pat.LastName,
                                      MiddleName = pat.MiddleName,
                                      Age = pat.Age,
                                      Gender = pat.Gender,
                                      PhoneNumber = pat.PhoneNumber,
                                      CreatedOn = insbal.CreatedOn,
                                      CreatedBy = insbal.CreatedBy,
                                      Remark = insbal.Remark,
                                      CurrentBalance = ins.CurrentBalance,
                                      IMISCode = ins.IMISCode,
                                      Ins_HasInsurance = pat.Ins_HasInsurance,
                                      Ins_NshiNumber = pat.Ins_NshiNumber,
                                      Ins_InsuranceBalance = pat.Ins_InsuranceBalance,
                                      PatientInsuranceInfoId = ins.PatientInsuranceInfoId,
                                      PreviousAmount = insbal.PreviousAmount,
                                      UpdatedAmount = insbal.UpdatedAmount,
                                      //UserFullName = emp.FullName,
                                      User = emp.FullName
                                  }).OrderByDescending(p => p.CreatedOn).ToList();

                    responseData.Results = insBal;
                }
                else if (reqType == "insurance-claim-code-list")
                {
                    var codelist = (from v in insuranceDbContext.Visit
                                    where v.Ins_HasInsurance == true && v.PatientId == patientId
                                    group v by new { v.PatientId, v.ClaimCode } into p
                                    select new
                                    {
                                        PatientId = p.Key.PatientId,
                                        ClaimCodeFirstGeneratedOn = p.Min(a => a.CreatedOn),
                                        ClaimCode = p.Key.ClaimCode

                                    }
                                      ).OrderByDescending(a => a.ClaimCodeFirstGeneratedOn).ToList();
                    responseData.Results = codelist;
                    responseData.Status = "OK";
                }
                else if (reqType == "insurance-single-claim-code-details")
                {
                    List<SqlParameter> paramList = new List<SqlParameter>()
                    {
                        new SqlParameter("@PatientId", patientId),
                         new SqlParameter("@ClaimCode", claimCode)
                    };
                    DataSet ds = DALFunctions.GetDatasetFromStoredProc("SP_INS_RPT_GetDetailsOfSingleClaimCode", paramList, insuranceDbContext);

                    ds.Tables[0].TableName = "AdmissionInfo";
                    ds.Tables[1].TableName = "BillingInfo";
                    ds.Tables[2].TableName = "PharmacyInfo";



                    responseData.Results = ds;
                    responseData.Status = "OK";
                }
                else if (reqType == "insurance-claim-code-list-by-claimcode")
                {
                    var codelist = (from v in insuranceDbContext.Visit
                                    join p in insuranceDbContext.Patients on v.PatientId equals p.PatientId
                                    where v.Ins_HasInsurance == true && v.ClaimCode == claimCode
                                    group v by new { v.PatientId, v.ClaimCode, p.ShortName, p.Gender, p.Age, p.Ins_NshiNumber, p.PatientCode, p.Address } into p
                                    select new
                                    {
                                        PatientId = p.Key.PatientId,
                                        ClaimCodeFirstGeneratedOn = p.Min(a => a.CreatedOn),
                                        ClaimCode = p.Key.ClaimCode,
                                        ShortName = p.Key.ShortName,
                                        PatientCode = p.Key.PatientCode,
                                        Gender = p.Key.Gender,
                                        Age = p.Key.Age,
                                        Address = p.Key.Address,
                                        NSHI = p.Key.Ins_NshiNumber
                                    }
                                    ).OrderByDescending(a => a.ClaimCodeFirstGeneratedOn).ToList();
                    responseData.Results = codelist;
                    responseData.Status = "OK";
                }
                else
                {
                    responseData.Status = "failed";
                    responseData.ErrorMessage = "Invalid request type.";
                }

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }
            
        #region Insurance Billing Post Request..
        [Route("insurance-billing")]
        [HttpPost]
        public object PostInsuranceBilling()
        {
            BillingTransactionModel insuranceBillingTransactionModel = new BillingTransactionModel();
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

            string strInsuranceBilling = this.ReadPostData();
            InsuranceDbContext insuranceDbContext = new InsuranceDbContext(connString);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            InsuranceBillingTransactionPostVM insuranceBillingTransactionPostVM = DanpheJSONConvert.DeserializeObject<InsuranceBillingTransactionPostVM>(strInsuranceBilling);
            using (var insuranceBillingTransactionScope = insuranceDbContext.Database.BeginTransaction())
            {
                try
                {
                    if (insuranceBillingTransactionPostVM.LabRequisition != null && insuranceBillingTransactionPostVM.LabRequisition.Count > 0)
                    {
                        insuranceBillingTransactionPostVM.LabRequisition = AddLabRequisition(insuranceDbContext, insuranceBillingTransactionPostVM.LabRequisition, currentUser.EmployeeId);
                    }
                    if (insuranceBillingTransactionPostVM.ImagingItemRequisition != null && insuranceBillingTransactionPostVM.ImagingItemRequisition.Count > 0)
                    {
                        insuranceBillingTransactionPostVM.ImagingItemRequisition = AddImagingRequisition(insuranceDbContext, insuranceBillingTransactionPostVM.ImagingItemRequisition, currentUser.EmployeeId);
                    }
                    if (insuranceBillingTransactionPostVM.VisitItems != null && insuranceBillingTransactionPostVM.VisitItems.Count > 0)
                    {
                        insuranceBillingTransactionPostVM.VisitItems = AddVisitItems(insuranceDbContext, insuranceBillingTransactionPostVM.VisitItems, currentUser.EmployeeId);
                    }

                    insuranceBillingTransactionModel.BillingTransactionItems = new List<BillingTransactionItemModel>();

                    if (insuranceBillingTransactionPostVM.LabRequisition != null && insuranceBillingTransactionPostVM.LabRequisition.Count > 0)
                    {
                        MapLabRequsitionId(insuranceBillingTransactionPostVM.Txn.BillingTransactionItems, insuranceBillingTransactionPostVM.LabRequisition);
                    }
                    if (insuranceBillingTransactionPostVM.ImagingItemRequisition != null && insuranceBillingTransactionPostVM.ImagingItemRequisition.Count > 0)
                    {
                        MapRadiologyRequisitionId(insuranceBillingTransactionPostVM.Txn.BillingTransactionItems, insuranceBillingTransactionPostVM.ImagingItemRequisition);
                    }
                    if (insuranceBillingTransactionPostVM.VisitItems != null && insuranceBillingTransactionPostVM.VisitItems.Count > 0)
                    {
                        MapPatientVisitId(insuranceBillingTransactionPostVM.Txn.BillingTransactionItems, insuranceBillingTransactionPostVM.VisitItems);
                    }

                    insuranceBillingTransactionModel = insuranceBillingTransactionPostVM.Txn;

                    insuranceBillingTransactionModel = PostInsuranceBillingTransaction(insuranceDbContext, insuranceBillingTransactionModel, currentUser);
                    insuranceBillingTransactionScope.Commit();
                    responseData.Status = "OK";
                }
                catch (Exception ex)
                {
                    responseData.Status = "Failed";
                    insuranceBillingTransactionScope.Rollback();
                    responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();

                }
            }

            responseData.Results = insuranceBillingTransactionModel;
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }
        #endregion
        #region After all the requisitions are made, it posts the invoice to Invoice table..
        private BillingTransactionModel PostInsuranceBillingTransaction(InsuranceDbContext insuranceDbContext, BillingTransactionModel insuranceBillingTransactionModel, RbacUser currentUser)
        {
            try
            {
                insuranceBillingTransactionModel = InsuranceBL.PostBillingTransaction(insuranceDbContext, connString, insuranceBillingTransactionModel, currentUser, DateTime.Now);
                if (insuranceBillingTransactionModel.IsInsuranceBilling == true)
                {
                    InsuranceBL.UpdateInsuranceCurrentBalance(connString, insuranceBillingTransactionModel.PatientId, insuranceBillingTransactionModel.InsuranceProviderId ?? default(int), currentUser.EmployeeId, insuranceBillingTransactionModel.TotalAmount ?? default(int), true);

                }

                //Billing User should be assigned from the server side avoiding assigning from client side 
                //which is causing issue in billing receipt while 2 user loggedIn in the same browser
                insuranceBillingTransactionModel.BillingUserName = currentUser.UserName;


                 //send to IRD only after transaction is committed successfully: sud-23Dec'18
                //Below is asynchronous call, so even if IRD api is down, it won't hold the execution of other code..
                if (realTimeRemoteSyncEnabled)
                {
                    if (insuranceBillingTransactionModel.Patient == null)
                    {
                        PatientModel pat = insuranceDbContext.Patients.Where(p => p.PatientId == insuranceBillingTransactionModel.PatientId).FirstOrDefault();
                        insuranceBillingTransactionModel.Patient = pat;
                    }
                    Task.Run(() => InsuranceBL.SyncBillToRemoteServer(insuranceBillingTransactionModel, "sales", insuranceDbContext));
                }
                return insuranceBillingTransactionModel;
            }
            catch (Exception ex)
            {
                
                throw ex;
            }
        } 
        #endregion

        #region Creates the lab requisition..
        private List<LabRequisitionModel> AddLabRequisition(InsuranceDbContext insuranceDbContext, List<LabRequisitionModel> labRequisition, int CurrentUserId)
        {
            try
            {
                List<LabRequisitionModel> labReqListFromClient = labRequisition;
                LabVendorsModel defaultVendor = insuranceDbContext.LabVendors.Where(val => val.IsDefault == true).FirstOrDefault();

                if (labReqListFromClient != null && labReqListFromClient.Count > 0)
                {
                    PatientDbContext patientContext = new PatientDbContext(connString);
                    List<LabTestModel> allLabTests = insuranceDbContext.LabTests.ToList();
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
                                req.ReportTemplateId = labTestdb.ReportTemplateId ?? default(int);
                                req.LabTestSpecimen = null;
                                req.LabTestSpecimenSource = null;
                                req.LabTestName = labTestdb.LabTestName;
                                req.RunNumberType = labTestdb.RunNumberType;
                                //req.OrderStatus = "active";
                                req.LOINC = "LOINC Code";
                                req.BillCancelledBy = null;
                                req.BillCancelledOn = null;
                                if (req.ProviderId != null && req.ProviderId != 0)
                                {
                                    var emp = insuranceDbContext.Employee.Where(a => a.EmployeeId == req.ProviderId).FirstOrDefault();
                                    req.ProviderName = emp.FullName;
                                }

                                //req.PatientVisitId = visitId;//assign above visitid to this requisition.
                                if (String.IsNullOrEmpty(currPatient.MiddleName))
                                    req.PatientName = currPatient.FirstName + " " + currPatient.LastName;
                                else
                                    req.PatientName = currPatient.FirstName + " " + currPatient.MiddleName + " " + currPatient.LastName;

                                req.OrderDateTime = DateTime.Now;
                                insuranceDbContext.LabRequisitions.Add(req);
                                insuranceDbContext.SaveChanges();
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

        #endregion
        #region Creates the Radiology Requisition..
        private List<ImagingRequisitionModel> AddImagingRequisition(InsuranceDbContext insuranceDbContext, List<ImagingRequisitionModel> imagingItemRequisition, int employeeId)
        {
            try
            {
                //getting the imagingtype because imagingtypename is needed in billing for getting service department
                List<RadiologyImagingTypeModel> Imgtype = insuranceDbContext.RadiologyImagingTypes
                                    .ToList<RadiologyImagingTypeModel>();

                var notValidForReportingItem = insuranceDbContext.RadiologyImagingItems.Where(i => i.IsValidForReporting == false).Select(m => m.ImagingItemId);

                if (imagingItemRequisition != null && imagingItemRequisition.Count > 0)
                {
                    foreach (var req in imagingItemRequisition)
                    {
                        req.ImagingDate = System.DateTime.Now;
                        req.CreatedOn = DateTime.Now;
                        req.CreatedBy = employeeId;
                        req.IsActive = true;
                        if (req.ProviderId != null && req.ProviderId != 0)
                        {
                            var emp = insuranceDbContext.Employee.Where(a => a.EmployeeId == req.ProviderId).FirstOrDefault();
                            req.ProviderName = emp.FullName;
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
                            insuranceDbContext.RadiologyImagingRequisitions.Add(req);
                        }
                    }
                    insuranceDbContext.SaveChanges();
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

        #endregion
        #region Creates new visit..
        private List<VisitModel> AddVisitItems(InsuranceDbContext insuranceDbContext, List<VisitModel> visitItems, int employeeId)
        {
            GeneratePatientVisitCodeAndSave(insuranceDbContext, visitItems);
            /*visitItems.ForEach(visit =>
            {
                visit.VisitCode = CreateNewPatientVisitCode(visit.VisitType, insuranceDbContext);
                insuranceDbContext.Visit.Add(visit);

            });
            insuranceDbContext.SaveChanges();*/
            return visitItems;
        }

        private void GeneratePatientVisitCodeAndSave(InsuranceDbContext insuranceDbContext, List<VisitModel> visitItems)
        {
            try
            {
                visitItems.ForEach(visit =>
                {
                    visit.VisitCode = CreateNewPatientVisitCode(visit.VisitType, insuranceDbContext);
                    insuranceDbContext.Visit.Add(visit);

                });
                insuranceDbContext.SaveChanges();
            }
            catch (Exception ex)
            {

                if (ex is DbUpdateException dbUpdateEx)
                {
                    if (dbUpdateEx.InnerException?.InnerException is SqlException sqlException)
                    {

                        if (sqlException.Number == 2627)// unique constraint error 
                        {
                            GeneratePatientVisitCodeAndSave(insuranceDbContext, visitItems);
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

        #endregion
        #region Creates new patient visitCode..
        private string CreateNewPatientVisitCode(string visitType, InsuranceDbContext insuranceDbContext)
        {
            try
            {
                var visitCode = "";
                if (visitType != null)
                {
                    //VisitDbContext visitDbContext = new VisitDbContext(connString);
                    var year = DateTime.Now.Year;
                    var patVisitId = insuranceDbContext.Visit.Where(s => s.VisitType == visitType && s.VisitDate.Year == year && s.VisitCode != null).DefaultIfEmpty()
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

        #endregion

        #region Maps Lab RequisitionId after the Requisitions are added to the LabRequisition table.. 
        private List<BillingTransactionItemModel> MapLabRequsitionId(List<BillingTransactionItemModel> billingTransactionItems, List<LabRequisitionModel> labRequisition)
        {
            var itms = billingTransactionItems.Where(a => a.ItemIntegrationName.ToLower() == "lab").ToList();
            for (int i = 0; i < itms.Count; i++)
            {
                itms[i].RequisitionId = labRequisition[i].RequisitionId;

            }

            return itms;
        }

        #endregion
        #region Maps the ImagingRequisitionId after the requisitions are added to the RadiologyImagingRequisition table..
        private List<BillingTransactionItemModel> MapRadiologyRequisitionId(List<BillingTransactionItemModel> billingTransactionItems, List<ImagingRequisitionModel> imagingRequisitions)
        {
            var itms = billingTransactionItems.Where(a => a.ItemIntegrationName.ToLower() == "radiology").ToList();
            for (int i = 0; i < itms.Count; i++)
            {
                itms[i].RequisitionId = imagingRequisitions[i].ImagingRequisitionId;

            }

            return itms;
        }

        #endregion
        #region Maps the PatientVisitId with RequisitionId for erVisit or opVisit
        private List<BillingTransactionItemModel> MapPatientVisitId(List<BillingTransactionItemModel> billingTransactionItems, List<VisitModel> visitItems)
        {
            for (int i = 0; i < billingTransactionItems.Count; i++)
            {
                var erVisit = visitItems.Where(a => billingTransactionItems[i].ItemName.ToLower() == "emergency registration" && a.ProviderId == billingTransactionItems[i].ProviderId);
                if (erVisit != null && (billingTransactionItems[i].RequisitionId == null || billingTransactionItems[i].RequisitionId == 0))
                {
                    billingTransactionItems[i].RequisitionId = erVisit.Select(a => a.ParentVisitId).FirstOrDefault();
                    billingTransactionItems[i].PatientVisitId = erVisit.Select(a => a.ParentVisitId).FirstOrDefault();

                }

                var opVisit = visitItems.Where(a => billingTransactionItems[i].ItemIntegrationName.ToLower() == "opd" && a.ProviderId == billingTransactionItems[i].ProviderId);
                if (opVisit != null && (billingTransactionItems[i].RequisitionId == null || billingTransactionItems[i].RequisitionId == 0))
                {
                    billingTransactionItems[i].RequisitionId = opVisit.Select(a => a.PatientVisitId).FirstOrDefault();
                }

            }

            return billingTransactionItems;
        }

        #endregion


        [Route("insurance-provisional-billing")]
        [HttpPost]
        public object PostInsuranceProvisionalBilling()
        {
            BillingTransactionModel insuranceBillingTransactionModel = new BillingTransactionModel();
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

            string strInsuranceBilling = this.ReadPostData();
            InsuranceDbContext insuranceDbContext = new InsuranceDbContext(connString);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            InsuranceBillingTransactionPostVM insuranceBillingTransactionPostVM = DanpheJSONConvert.DeserializeObject<InsuranceBillingTransactionPostVM>(strInsuranceBilling);
            using (var insuranceBillingTransactionScope = insuranceDbContext.Database.BeginTransaction())
            {
                try
                {
                    if (insuranceBillingTransactionPostVM.LabRequisition != null && insuranceBillingTransactionPostVM.LabRequisition.Count > 0)
                    {
                        insuranceBillingTransactionPostVM.LabRequisition = AddLabRequisition(insuranceDbContext, insuranceBillingTransactionPostVM.LabRequisition, currentUser.EmployeeId);
                    }
                    if (insuranceBillingTransactionPostVM.ImagingItemRequisition != null && insuranceBillingTransactionPostVM.ImagingItemRequisition.Count > 0)
                    {
                        insuranceBillingTransactionPostVM.ImagingItemRequisition = AddImagingRequisition(insuranceDbContext, insuranceBillingTransactionPostVM.ImagingItemRequisition, currentUser.EmployeeId);
                    }
                    if (insuranceBillingTransactionPostVM.VisitItems != null && insuranceBillingTransactionPostVM.VisitItems.Count > 0)
                    {
                        insuranceBillingTransactionPostVM.VisitItems = AddVisitItems(insuranceDbContext, insuranceBillingTransactionPostVM.VisitItems, currentUser.EmployeeId);
                    }

                    insuranceBillingTransactionModel.BillingTransactionItems = new List<BillingTransactionItemModel>();

                    if (insuranceBillingTransactionPostVM.LabRequisition != null && insuranceBillingTransactionPostVM.LabRequisition.Count > 0)
                    {
                        MapLabRequsitionId(insuranceBillingTransactionPostVM.Txn.BillingTransactionItems, insuranceBillingTransactionPostVM.LabRequisition);
                    }
                    if (insuranceBillingTransactionPostVM.ImagingItemRequisition != null && insuranceBillingTransactionPostVM.ImagingItemRequisition.Count > 0)
                    {
                        MapRadiologyRequisitionId(insuranceBillingTransactionPostVM.Txn.BillingTransactionItems, insuranceBillingTransactionPostVM.ImagingItemRequisition);
                    }
                    if (insuranceBillingTransactionPostVM.VisitItems != null && insuranceBillingTransactionPostVM.VisitItems.Count > 0)
                    {
                        MapPatientVisitId(insuranceBillingTransactionPostVM.Txn.BillingTransactionItems, insuranceBillingTransactionPostVM.VisitItems);
                    }

                    insuranceBillingTransactionModel = insuranceBillingTransactionPostVM.Txn;

                    insuranceBillingTransactionModel.BillingTransactionItems = PostInsuranceProvisional(insuranceDbContext, insuranceBillingTransactionModel, currentUser);
                    insuranceBillingTransactionScope.Commit();
                    responseData.Status = "OK";
                }
                catch (Exception ex)
                {
                    responseData.Status = "Failed";
                    insuranceBillingTransactionScope.Rollback();
                    responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();

                }
            }

            responseData.Results = insuranceBillingTransactionModel.BillingTransactionItems;
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        private List<BillingTransactionItemModel> PostInsuranceProvisional(InsuranceDbContext insuranceDbContext, BillingTransactionModel insuranceBillingTransactionModel, RbacUser currentUser)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                if (insuranceBillingTransactionModel != null && insuranceBillingTransactionModel.BillingTransactionItems.Count > 0)
                {
                    insuranceBillingTransactionModel.BillingTransactionItems = InsuranceBL.PostUpdateBillingTransactionItems(insuranceDbContext,
                        connString,
                        insuranceBillingTransactionModel.BillingTransactionItems,
                        currentUser,
                        DateTime.Now,
                        insuranceBillingTransactionModel.BillingTransactionItems[0].BillStatus,
                        insuranceBillingTransactionModel.BillingTransactionItems[0].CounterId);

                    var userName = (from emp in insuranceDbContext.Employee where emp.EmployeeId == currentUser.EmployeeId select emp.FirstName).FirstOrDefault();
                    insuranceBillingTransactionModel.BillingTransactionItems.ForEach(usr => usr.RequestingUserName = userName);
                  
                }
                return insuranceBillingTransactionModel.BillingTransactionItems;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpPost]// POST api/values
        public string Post()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            int CreatedBy = ToInt(this.ReadQueryStringData("CreatedBy"));
            RbacUser currentSessionUser = HttpContext.Session.Get<RbacUser>("currentuser");
            responseData.Status = "OK";
            string ipDataString = this.ReadPostData();
            string reqType = this.ReadQueryStringData("reqType");
            string PrinterName = this.ReadQueryStringData("PrinterName");
            string FilePath = this.ReadQueryStringData("FilePath");
            try
            {
                string str = this.ReadPostData();
                InsuranceDbContext insuranceDbContext = new InsuranceDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                if (reqType == "gov-insurance-patient")
                {
                    GovInsurancePatientVM govInsClientPatObj = JsonConvert.DeserializeObject<GovInsurancePatientVM>(str);

                    PatientModel govInsNewPatient = GetPatientModelFromPatientVM(govInsClientPatObj, connString, insuranceDbContext);
                    InsuranceModel patInsInfo = GetInsuranceModelFromInsPatientVM(govInsClientPatObj);
                    patInsInfo.CreatedBy = currentSessionUser.EmployeeId;

                    govInsNewPatient.Insurances = new List<InsuranceModel>();
                    govInsNewPatient.Insurances.Add(patInsInfo);

                    govInsNewPatient.CreatedBy = currentSessionUser.EmployeeId;
                    govInsNewPatient.CreatedOn = DateTime.Now;

                    insuranceDbContext.Patients.Add(govInsNewPatient);
                    insuranceDbContext.SaveChanges();

                    PatientMembershipModel patMembership = new PatientMembershipModel();

                    List<MembershipTypeModel> allMemberships = insuranceDbContext.MembershipTypes.ToList();
                    MembershipTypeModel currPatMembershipModel = allMemberships.Where(a => a.MembershipTypeId == govInsNewPatient.MembershipTypeId).FirstOrDefault();


                    patMembership.PatientId = govInsNewPatient.PatientId;
                    patMembership.MembershipTypeId = govInsNewPatient.MembershipTypeId.Value;
                    patMembership.StartDate = System.DateTime.Now;//set today's datetime as start date.
                    int expMths = currPatMembershipModel.ExpiryMonths != null ? currPatMembershipModel.ExpiryMonths.Value : 0;

                    patMembership.EndDate = System.DateTime.Now.AddMonths(expMths);//add membership type's expiry date to current date for expiryDate.
                    patMembership.CreatedBy = currentSessionUser.EmployeeId;
                    patMembership.CreatedOn = System.DateTime.Now;
                    patMembership.IsActive = true;

                    insuranceDbContext.PatientMemberships.Add(patMembership);
                    insuranceDbContext.SaveChanges();

                    responseData.Results = govInsNewPatient;
                    responseData.Status = "OK";
                }
                else if (!string.IsNullOrEmpty(reqType) && reqType == "patientVisitCreate")
                {
                    //This method for do the patient visit transaction
                    //In this transaction- Post data to Patient, Visit,BillTransaction, BillTransactionItems tables
                    return PatientVisitTransaction(ipDataString);
                }
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
                else if (!string.IsNullOrEmpty(reqType) && reqType == "ins-free-followup-visit")
                {
                    VisitModel vis = JsonConvert.DeserializeObject<VisitModel>(str);
                    //to avoid clashing of visits
                    if (InsuranceBL.HasDuplicateVisitWithSameProvider(insuranceDbContext, vis.PatientId, vis.ProviderId, vis.VisitDate) && vis.VisitType == "outpatient")
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "Patient already has appointment with this Doctor today.";
                    }
                    else
                    {
                        //get provider name from providerId
                        if (vis.ProviderId != null && vis.ProviderId != 0)
                        {
                            vis.ProviderName = InsuranceBL.GetProviderName(vis.ProviderId, connString);
                        }

                        //vis.VisitCode = InsuranceBL.CreateNewPatientVisitCode(vis.VisitType, connString);
                        insuranceDbContext.Visit.Add(vis);
                        vis.Ins_HasInsurance = true;
                        //insuranceDbContext.SaveChanges();
                        GenerateVisitCodeAndSave(insuranceDbContext, vis, connString);


                        //updateIsContinuedStatus in case of referral visit and followup visit
                        if (vis.AppointmentType.ToLower() == ENUM_AppointmentType.referral.ToLower() // "referral"
                            || vis.AppointmentType.ToLower() == ENUM_AppointmentType.followup.ToLower() // "followup"
                            || vis.AppointmentType.ToLower() == ENUM_AppointmentType.transfer.ToLower()) // "transfer")
                        {
                            UpdateIsContinuedStatus(vis.ParentVisitId,
                                vis.AppointmentType,
                                true,
                                currentUser.EmployeeId,
                                insuranceDbContext);
                        }



                        //Return Model should be in same format as that of the ListVisit since it's appended in the samae list.
                        ListVisitsVM returnVisit = (from visit in insuranceDbContext.Visit
                                                    where visit.PatientVisitId == vis.PatientVisitId && visit.Ins_HasInsurance == true
                                                    join department in insuranceDbContext.Departments on visit.DepartmentId equals department.DepartmentId
                                                    join patient in insuranceDbContext.Patients on visit.PatientId equals patient.PatientId
                                                    select new ListVisitsVM
                                                    {
                                                        PatientVisitId = visit.PatientVisitId,
                                                        ParentVisitId = visit.ParentVisitId,
                                                        VisitDate = visit.VisitDate,
                                                        VisitTime = visit.VisitTime,
                                                        PatientId = patient.PatientId,
                                                        PatientCode = patient.PatientCode,
                                                        ShortName = patient.FirstName + " " + (string.IsNullOrEmpty(patient.MiddleName) ? "" : patient.MiddleName + " ") + patient.LastName,
                                                        PhoneNumber = patient.PhoneNumber,
                                                        DateOfBirth = patient.DateOfBirth,
                                                        Gender = patient.Gender,
                                                        DepartmentId = department.DepartmentId,
                                                        DepartmentName = department.DepartmentName,
                                                        ProviderId = visit.ProviderId,
                                                        ProviderName = visit.ProviderName,
                                                        VisitType = visit.VisitType,
                                                        AppointmentType = visit.AppointmentType,
                                                        BillStatus = visit.BillingStatus,
                                                        Patient = patient,
                                                        ClaimCode = visit.ClaimCode,
                                                        Ins_NshiNumber = patient.Ins_NshiNumber
                                                    }).FirstOrDefault();


                        responseData.Results = returnVisit;
                        responseData.Status = "OK";
                    }

                }
                else if (!string.IsNullOrEmpty(reqType) && reqType == "ins-paid-followup-visit")
                {
                    QuickVisitVM qckVisit = PaidFollowupVisitTransaction(str);
                    responseData.Status = "OK";
                    responseData.Results = qckVisit;
                }

                else if (reqType == "post-billingTransactionItems")
                {
                    //Transaction Begins 
                    List<BillingTransactionItemModel> billTranItems = DanpheJSONConvert.DeserializeObject<List<BillingTransactionItemModel>>(ipDataString);
                    using (var dbContextTransaction = insuranceDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            if (billTranItems != null && billTranItems.Count > 0)
                            {
                                billTranItems = InsuranceBL.PostUpdateBillingTransactionItems(insuranceDbContext,
                                    connString,
                                    billTranItems,
                                    currentUser,
                                    DateTime.Now,
                                    billTranItems[0].BillStatus,
                                    billTranItems[0].CounterId);

                                var userName = (from emp in insuranceDbContext.Employee where emp.EmployeeId == currentUser.EmployeeId select emp.FirstName).FirstOrDefault();
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
                else if (!string.IsNullOrEmpty(reqType) && reqType == "billing-visits")
                {
                    List<VisitModel> visits = JsonConvert.DeserializeObject<List<VisitModel>>(str);
                    visits.ForEach(visit =>
                    {
                        visit.VisitCode = VisitBL.CreateNewPatientVisitCode(visit.VisitType, connString);
                        insuranceDbContext.Visit.Add(visit);

                    });
                    insuranceDbContext.SaveChanges();
                    responseData.Results = visits;
                    responseData.Status = "OK";
                }
                else if (reqType == "addNewRequisitions") //comes here from doctor and nurse orders.
                {
                    List<LabRequisitionModel> labReqListFromClient = DanpheJSONConvert.DeserializeObject<List<LabRequisitionModel>>(str);
                    LabVendorsModel defaultVendor = insuranceDbContext.LabVendors.Where(val => val.IsDefault == true).FirstOrDefault();
                    var currDateTime = DateTime.Now;

                    if (labReqListFromClient != null && labReqListFromClient.Count > 0)
                    {
                        PatientDbContext patientContext = new PatientDbContext(connString);
                        List<LabTestModel> allLabTests = insuranceDbContext.LabTests.ToList();
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
                                    req.ReportTemplateId = labTestdb.ReportTemplateId ?? default(int);
                                    req.LabTestSpecimen = null;
                                    req.LabTestSpecimenSource = null;
                                    req.LabTestName = labTestdb.LabTestName;
                                    req.RunNumberType = labTestdb.RunNumberType;
                                    //req.OrderStatus = "active";
                                    req.LOINC = "LOINC Code";
                                    req.BillCancelledBy = null;
                                    req.BillCancelledOn = null;
                                    if (req.ProviderId != null && req.ProviderId != 0)
                                    {
                                        var emp = insuranceDbContext.Employee.Where(a => a.EmployeeId == req.ProviderId).FirstOrDefault();
                                        req.ProviderName = emp.FullName;
                                    }

                                    //req.PatientVisitId = visitId;//assign above visitid to this requisition.
                                    if (String.IsNullOrEmpty(currPatient.MiddleName))
                                        req.PatientName = currPatient.FirstName + " " + currPatient.LastName;
                                    else
                                        req.PatientName = currPatient.FirstName + " " + currPatient.MiddleName + " " + currPatient.LastName;

                                    req.OrderDateTime = currDateTime;
                                    req.CreatedOn = currDateTime;
                                    insuranceDbContext.LabRequisitions.Add(req);
                                    insuranceDbContext.SaveChanges();
                                }
                            });

                            responseData.Results = labReqListFromClient;
                            responseData.Status = "OK";
                        }
                    }
                    else
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "Invalid input request.";
                    }

                }
                else if (reqType == "postRequestItems")
                {
                    List<ImagingRequisitionModel> imgrequests = JsonConvert.DeserializeObject<List<ImagingRequisitionModel>>(str);
                    MasterDbContext masterContext = new MasterDbContext(base.connString);

                    PatientDbContext patientContext = new PatientDbContext(connString);

                    //getting the imagingtype because imagingtypename is needed in billing for getting service department
                    List<RadiologyImagingTypeModel> Imgtype = masterContext.ImagingTypes
                                        .ToList<RadiologyImagingTypeModel>();

                    var notValidForReportingItem = masterContext.ImagingItems.Where(i => i.IsValidForReporting == false).Select(m => m.ImagingItemId);

                    if (imgrequests != null && imgrequests.Count > 0)
                    {
                        foreach (var req in imgrequests)
                        {
                            req.ImagingDate = System.DateTime.Now;
                            req.CreatedOn = DateTime.Now;
                            req.CreatedBy = currentUser.EmployeeId;
                            req.IsActive = true;
                            if (req.ProviderId != null && req.ProviderId != 0)
                            {
                                var emp = insuranceDbContext.Employee.Where(a => a.EmployeeId == req.ProviderId).FirstOrDefault();
                                req.ProviderName = emp.FullName;
                            }
                            if (req.ImagingTypeId != null)
                            {
                                req.ImagingTypeName = Imgtype.Where(a => a.ImagingTypeId == req.ImagingTypeId).Select(a => a.ImagingTypeName).FirstOrDefault();
                                req.Urgency = string.IsNullOrEmpty(req.Urgency) ? "normal" : req.Urgency;
                                //req.WardName = ;
                            }
                            else
                            {
                                req.ImagingTypeId = Imgtype.Where(a => a.ImagingTypeName == req.ImagingTypeName).Select(a => a.ImagingTypeId).FirstOrDefault();
                            }
                            if (!notValidForReportingItem.Contains(req.ImagingItemId.Value))
                            {
                                insuranceDbContext.RadiologyImagingRequisitions.Add(req);
                            }
                        }
                        insuranceDbContext.SaveChanges();
                        responseData.Status = "OK";
                        responseData.Results = imgrequests;
                    }
                    else
                    {
                        responseData.ErrorMessage = "imgrequests is null";
                        responseData.Status = "Failed";
                    }
                }
                else if (reqType == "Deposit")
                {
                    BillingDeposit deposit = DanpheJSONConvert.DeserializeObject<BillingDeposit>(ipDataString);
                    deposit.CreatedOn = System.DateTime.Now;
                    deposit.CreatedBy = currentUser.EmployeeId;
                    BillingFiscalYear fiscYear = BillingBL.GetFiscalYear(connString);
                    deposit.FiscalYearId = fiscYear.FiscalYearId;
                    if (deposit.DepositType != ENUM_BillDepositType.DepositDeduct)
                        deposit.ReceiptNo = BillingBL.GetDepositReceiptNo(connString);
                    deposit.FiscalYear = fiscYear.FiscalYearFormatted;
                    EmployeeModel currentEmp = insuranceDbContext.Employee.Where(emp => emp.EmployeeId == currentUser.EmployeeId).FirstOrDefault();
                    deposit.BillingUser = currentEmp.FirstName + " " + currentEmp.LastName;
                    deposit.IsActive = true;
                    insuranceDbContext.BillingDeposits.Add(deposit);
                    insuranceDbContext.SaveChanges();
                    responseData.Status = "OK";
                    responseData.Results = deposit;//check if we need to send back the whole input object back to client.--sudarshan
                }
                else if (reqType == "postBillTransaction")//submit
                {
                    DateTime currentDate = DateTime.Now;
                    BillingTransactionModel billTransaction = DanpheJSONConvert.DeserializeObject<BillingTransactionModel>(ipDataString);
                    bool transactionSuccess = false;
                    if (billTransaction != null)
                    {
                        //Transaction Begins  
                        using (var dbContextTransaction = insuranceDbContext.Database.BeginTransaction())
                        {
                            try
                            {
                                //step:1 -- make copy of billingTxnItems into new list, so thate EF doesn't add txn items again.
                                //step:2-- if there's deposit deduction, then add to deposit table.
                                billTransaction = InsuranceBL.PostBillingTransaction(insuranceDbContext, connString, billTransaction, currentUser, currentDate);
                                if (billTransaction.IsInsuranceBilling == true)
                                {
                                    InsuranceBL.UpdateInsuranceCurrentBalance(connString, billTransaction.PatientId, billTransaction.InsuranceProviderId ?? default(int), currentUser.EmployeeId, billTransaction.TotalAmount ?? default(int), true);

                                }
                                //step:3-- if there's deposit balance, then add a return transaction to deposit table. 
                                if (billTransaction.PaymentMode != ENUM_BillPaymentMode.credit // "credit" 
                                    && billTransaction.DepositBalance != null && billTransaction.DepositBalance > 0)
                                {
                                    BillingDeposit dep = new BillingDeposit()
                                    {
                                        DepositType = ENUM_BillDepositType.ReturnDeposit, // "ReturnDeposit",
                                        Remarks = "Deposit Refunded from InvoiceNo. " + billTransaction.InvoiceCode + billTransaction.InvoiceNo,
                                        //Remarks = "ReturnDeposit" + " for transactionid:" + billTransaction.BillingTransactionId,
                                        Amount = billTransaction.DepositBalance,
                                        IsActive = true,
                                        BillingTransactionId = billTransaction.BillingTransactionId,
                                        DepositBalance = 0,
                                        FiscalYearId = billTransaction.FiscalYearId,
                                        CounterId = billTransaction.CounterId,
                                        CreatedBy = billTransaction.CreatedBy,
                                        CreatedOn = currentDate,
                                        PatientId = billTransaction.PatientId,
                                        PatientVisitId = billTransaction.PatientVisitId,
                                        PaymentMode = billTransaction.PaymentMode,
                                        PaymentDetails = billTransaction.PaymentDetails,

                                    };
                                    if (billTransaction.ReceiptNo == null)
                                    {
                                        dep.ReceiptNo = BillingBL.GetDepositReceiptNo(connString);
                                    }
                                    else
                                    {
                                        dep.ReceiptNo = billTransaction.ReceiptNo;
                                    }


                                    insuranceDbContext.BillingDeposits.Add(dep);
                                    insuranceDbContext.SaveChanges();
                                }

                                //For cancel BillingTransactionItems
                                List<BillingTransactionItemModel> item = (from itm in insuranceDbContext.BillingTransactionItems
                                                                          where itm.PatientId == billTransaction.PatientId && itm.PatientVisitId == billTransaction.PatientVisitId && itm.BillStatus == "provisional" && itm.Quantity == 0
                                                                          select itm).ToList();
                                if (item.Count() > 0)
                                {
                                    item.ForEach(itm =>
                                    {
                                        var txnItem = InsuranceBL.UpdateTxnItemBillStatus(insuranceDbContext, itm, "adtCancel", currentUser, currentDate, billTransaction.CounterId, null);
                                    });
                                }

                                if (realTimeRemoteSyncEnabled)
                                {
                                    if (billTransaction.Patient == null)
                                    {
                                        PatientModel pat = insuranceDbContext.Patients.Where(p => p.PatientId == billTransaction.PatientId).FirstOrDefault();
                                        billTransaction.Patient = pat;
                                    }

                                    Task.Run(() => InsuranceBL.SyncBillToRemoteServer(billTransaction, "sales", insuranceDbContext));

                                }

                                var allPatientBedInfos = (from bedInfos in insuranceDbContext.PatientBedInfos
                                                          where bedInfos.PatientVisitId == billTransaction.PatientVisitId
                                                          && bedInfos.IsActive == true
                                                          select bedInfos
                                                          ).OrderByDescending(a => a.PatientBedInfoId).Take(2).ToList();

                                if (allPatientBedInfos.Count > 0)
                                {
                                    allPatientBedInfos.ForEach(bed =>
                                    {
                                        var b = insuranceDbContext.Beds.FirstOrDefault(fd => fd.BedId == bed.BedId);
                                        if (b != null)
                                        {
                                            b.OnHold = null;
                                            b.HoldedOn = null;
                                            insuranceDbContext.Entry(b).State = EntityState.Modified;
                                            insuranceDbContext.Entry(b).Property(x => x.OnHold).IsModified = true;
                                            insuranceDbContext.Entry(b).Property(x => x.HoldedOn).IsModified = true;
                                            insuranceDbContext.SaveChanges();
                                        }
                                    });
                                }

                                dbContextTransaction.Commit();
                                transactionSuccess = true;
                            }
                            catch (Exception ex)
                            {
                                transactionSuccess = false;
                                //rollback all changes if any error occurs
                                dbContextTransaction.Rollback();
                                throw ex;
                            }
                        }

                        if (transactionSuccess)
                        {
                            //Starts: This code is for Temporary solution for Checking and Updating the Invoice Number if there is duplication Found
                            List<SqlParameter> paramList = new List<SqlParameter>() {
                                    new SqlParameter("@fiscalYearId", billTransaction.FiscalYearId),
                                    new SqlParameter("@billingTransactionId", billTransaction.BillingTransactionId),
                                    new SqlParameter("@invoiceNumber", billTransaction.InvoiceNo)
                                };

                            DataSet dataFromSP = DALFunctions.GetDatasetFromStoredProc("SP_BIL_Update_Duplicate_Invoice_If_Exists", paramList, insuranceDbContext);
                            var data = new List<object>();
                            if (dataFromSP.Tables.Count > 0)
                            {
                                billTransaction.InvoiceNo = Convert.ToInt32(dataFromSP.Tables[0].Rows[0]["LatestInvoiceNumber"].ToString());
                            }
                            //Ends
                            responseData.Results = billTransaction;
                        }

                    }
                    else
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "billTransaction is invalid";
                    }
                }
                else if (reqType == "post-billingTransaction")
                {
                    bool transactionSuccess = false;
                    BillingTransactionModel billTransaction = DanpheJSONConvert.DeserializeObject<BillingTransactionModel>(ipDataString);
                    using (var dbContextTransaction = insuranceDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            billTransaction = InsuranceBL.PostBillingTransaction(insuranceDbContext, connString, billTransaction, currentUser, DateTime.Now);
                            //RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                            if (billTransaction.IsInsuranceBilling == true)
                            {
                                InsuranceBL.UpdateInsuranceCurrentBalance(connString, billTransaction.PatientId, billTransaction.InsuranceProviderId ?? default(int), currentUser.EmployeeId, billTransaction.TotalAmount ?? default(int), true);

                            }

                            //Billing User should be assigned from the server side avoiding assigning from client side 
                            //which is causing issue in billing receipt while 2 user loggedIn in the same browser
                            billTransaction.BillingUserName = currentUser.UserName;//Yubaraj: 28June'19

                            responseData.Results = billTransaction;//check if we need to send back all the input object back to client.--sudarshan

                            dbContextTransaction.Commit(); //end of transaction
                            transactionSuccess = true;

                            //send to IRD only after transaction is committed successfully: sud-23Dec'18
                            //Below is asynchronous call, so even if IRD api is down, it won't hold the execution of other code..
                            if (realTimeRemoteSyncEnabled)
                            {
                                if (billTransaction.Patient == null)
                                {
                                    PatientModel pat = insuranceDbContext.Patients.Where(p => p.PatientId == billTransaction.PatientId).FirstOrDefault();
                                    billTransaction.Patient = pat;
                                }
                                Task.Run(() => InsuranceBL.SyncBillToRemoteServer(billTransaction, "sales", insuranceDbContext));
                            }
                            responseData.Status = "OK";
                        }
                        catch (Exception ex)
                        {
                            transactionSuccess = false;
                            dbContextTransaction.Rollback();
                            throw ex;
                        }
                    }
                    if (transactionSuccess)
                    {
                        //Starts: This code is for Temporary solution for Checking and Updating the Invoice Number if there is duplication Found
                        List<SqlParameter> paramList = new List<SqlParameter>() {
                                    new SqlParameter("@fiscalYearId", billTransaction.FiscalYearId),
                                    new SqlParameter("@billingTransactionId", billTransaction.BillingTransactionId),
                                    new SqlParameter("@invoiceNumber", billTransaction.InvoiceNo)
                                };

                        DataSet dataFromSP = DALFunctions.GetDatasetFromStoredProc("SP_BIL_Update_Duplicate_Invoice_If_Exists", paramList, insuranceDbContext);
                        var data = new List<object>();
                        if (dataFromSP.Tables.Count > 0)
                        {
                            billTransaction.InvoiceNo = Convert.ToInt32(dataFromSP.Tables[0].Rows[0]["LatestInvoiceNumber"].ToString());
                        }
                        //Ends
                        responseData.Results = billTransaction;
                    }
                }
                else
                {
                    responseData.Status = "failed";
                    responseData.ErrorMessage = "Invalid request type.";
                }
            }



            catch (Exception ex)
            {
                responseData.Status = "failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);

        }

        private void GenerateVisitCodeAndSave(InsuranceDbContext insuranceDbContext, VisitModel vis, string connString)
        {
            try
            {
                vis.VisitCode = VisitBL.CreateNewPatientVisitCode(vis.VisitType, connString);
                insuranceDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                if (ex is DbUpdateException dbUpdateEx)
                {
                    if (dbUpdateEx.InnerException?.InnerException is SqlException sqlException)
                    {

                        if (sqlException.Number == 2627)// unique constraint error 
                        {
                            GenerateVisitCodeAndSave(insuranceDbContext, vis, connString);
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
                InsuranceDbContext insuranceDbContext = new InsuranceDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                string status = this.ReadQueryStringData("status");
                int appointmentId = ToInt(this.ReadQueryStringData("appointmentId"));
                int billingTransactionId = ToInt(this.ReadQueryStringData("billingTransactionId"));
                int PrintCount = ToInt(this.ReadQueryStringData("PrintCount"));
                int AdmissionPatientId = ToInt(this.ReadQueryStringData("AdmissionPatientId"));
                string ProcedureType = this.ReadQueryStringData("ProcedureType");

                if (reqType == "update-gov-insurance-patient")
                {
                    string str = this.ReadPostData();
                    GovInsurancePatientVM insPatObjFromClient = JsonConvert.DeserializeObject<GovInsurancePatientVM>(str);

                    using (TransactionScope scope = new TransactionScope())
                    {
                        try
                        {
                            if (insPatObjFromClient != null && insPatObjFromClient.PatientId != 0)
                            {
                                PatientModel patFromDb = insuranceDbContext.Patients.Include("Insurances")
                                    .Where(p => p.PatientId == insPatObjFromClient.PatientId).FirstOrDefault();
                                //duplicate check on update
                                var checkDuplicateNSHI = (from pat in insuranceDbContext.Patients
                                                          where pat.PatientId != insPatObjFromClient.PatientId &&
                                                          pat.Ins_NshiNumber == insPatObjFromClient.Ins_NshiNumber
                                                          select pat).Count();
                                if (checkDuplicateNSHI > 0)
                                {
                                    responseData.Status = "Failed";
                                    responseData.Results = null;
                                    responseData.ErrorMessage = "Duplicate NSHI Number not allowed, please change it.";
                                    return DanpheJSONConvert.SerializeObject(responseData, true);
                                }
                                //if insurance info is not found then add new, else update that.
                                if (patFromDb.Insurances == null || patFromDb.Insurances.Count == 0)
                                {
                                    InsuranceModel insInfo = InsuranceBL.GetInsuranceModelFromInsPatVM(insPatObjFromClient, currentUser.EmployeeId);
                                    InsuranceBL.UpdatePatientInfoFromInsurance(insuranceDbContext, patFromDb, insPatObjFromClient);
                                    patFromDb.Insurances = new List<InsuranceModel>();
                                    patFromDb.Insurances.Add(insInfo);
                                }
                                else
                                {
                                    InsuranceBL.UpdatePatientInfoFromInsurance(insuranceDbContext, patFromDb, insPatObjFromClient);

                                    //InsuranceModel patInsInfo = patFromDb.Insurances[0];
                                    InsuranceModel patInsInfo = insuranceDbContext.Insurances
                                    .Where(p => p.PatientId == insPatObjFromClient.PatientId).FirstOrDefault();
                                    patInsInfo.IMISCode = insPatObjFromClient.IMISCode;
                                    patInsInfo.InsuranceProviderId = insPatObjFromClient.InsuranceProviderId;
                                    patInsInfo.InsuranceName = insPatObjFromClient.InsuranceName;
                                    //update only current balance, don't update initial balance.
                                    patInsInfo.Ins_IsFirstServicePoint = insPatObjFromClient.Ins_IsFirstServicePoint;
                                    patInsInfo.Ins_FamilyHeadName = insPatObjFromClient.Ins_FamilyHeadName;
                                    patInsInfo.Ins_FamilyHeadNshi = insPatObjFromClient.Ins_FamilyHeadNshi;
                                    patInsInfo.Ins_IsFamilyHead = insPatObjFromClient.Ins_IsFamilyHead;
                                    patInsInfo.Ins_NshiNumber = insPatObjFromClient.Ins_NshiNumber;
                                    patInsInfo.Ins_HasInsurance = insPatObjFromClient.Ins_HasInsurance;
                                    patInsInfo.Ins_InsuranceBalance = insPatObjFromClient.Ins_InsuranceBalance;
                                    patInsInfo.ModifiedOn = DateTime.Now;
                                    patInsInfo.ModifiedBy = currentUser.EmployeeId;

                                    //not sure if we've to allow to update imis code..
                                    insuranceDbContext.Entry(patInsInfo).Property(a => a.IMISCode).IsModified = true;
                                    insuranceDbContext.Entry(patInsInfo).Property(a => a.InsuranceProviderId).IsModified = true;
                                    insuranceDbContext.Entry(patInsInfo).Property(a => a.InsuranceName).IsModified = true;
                                    insuranceDbContext.Entry(patInsInfo).Property(a => a.Ins_InsuranceBalance).IsModified = true;
                                    insuranceDbContext.Entry(patInsInfo).Property(a => a.ModifiedOn).IsModified = true;
                                    insuranceDbContext.Entry(patInsInfo).Property(a => a.ModifiedBy).IsModified = true;
                                    insuranceDbContext.Entry(patInsInfo).Property(a => a.Ins_HasInsurance).IsModified = true;
                                    insuranceDbContext.Entry(patInsInfo).Property(a => a.Ins_IsFirstServicePoint).IsModified = true;
                                    insuranceDbContext.Entry(patInsInfo).Property(a => a.Ins_FamilyHeadNshi).IsModified = true;
                                    insuranceDbContext.Entry(patInsInfo).Property(a => a.Ins_FamilyHeadName).IsModified = true;
                                    insuranceDbContext.Entry(patInsInfo).Property(a => a.Ins_IsFamilyHead).IsModified = true;
                                    insuranceDbContext.Entry(patInsInfo).Property(a => a.Ins_NshiNumber).IsModified = true;

                                }
                                insuranceDbContext.SaveChanges();
                            }
                            ///After All Files Added Commit the Transaction
                            scope.Complete();
                            responseData.Results = "Patient Information updated successfully.";
                            responseData.Status = "OK";
                        }
                        catch (Exception ex)
                        {
                            scope.Dispose();
                            responseData.Results = ex;
                            responseData.Status = "Failed";
                            throw ex;
                        }
                    }
                }
                //update appointmentStatus
                else if (reqType == "updateAppStatus" && !string.IsNullOrEmpty(status))
                {
                    AppointmentModel dbAppointment = insuranceDbContext.Appointments
                                                    .Where(a => a.AppointmentId == appointmentId)
                                                    .FirstOrDefault<AppointmentModel>();
                    var providerId = ToInt(ReadQueryStringData("ProviderId"));
                    var providerName = ReadQueryStringData("ProviderName");

                    dbAppointment.AppointmentStatus = status.ToLower();
                    if (status == "checkedin")
                    {
                        dbAppointment.PatientId = insuranceDbContext.Visit
                                                .Where(a => a.AppointmentId == appointmentId)
                                                .Select(a => a.PatientId).ToList().FirstOrDefault();
                    }


                    dbAppointment.ProviderId = providerId;
                    dbAppointment.ProviderName = providerName;
                    insuranceDbContext.Appointments.Attach(dbAppointment);
                    insuranceDbContext.Entry(dbAppointment).State = EntityState.Modified;
                    insuranceDbContext.Entry(dbAppointment).Property(x => x.ProviderId).IsModified = true;
                    insuranceDbContext.Entry(dbAppointment).Property(x => x.ProviderName).IsModified = true;
                    insuranceDbContext.SaveChanges();

                    responseData.Status = "OK";
                    responseData.Results = "Appointment information updated successfully.";
                }
                // Update the Print Count on Bill transaction after the Receipt print 
                else if (reqType == "UpdatePrintCountafterPrint")
                {


                    BillingTransactionModel dbBillPrintReq = insuranceDbContext.BillingTransactions
                                            .Where(a => a.BillingTransactionId == billingTransactionId)
                                            .FirstOrDefault<BillingTransactionModel>();
                    if (dbBillPrintReq != null)
                    {
                        dbBillPrintReq.PrintCount = PrintCount;
                        dbBillPrintReq.PrintedOn = System.DateTime.Now;
                        dbBillPrintReq.PrintedBy = currentUser.EmployeeId;
                        insuranceDbContext.Entry(dbBillPrintReq).State = EntityState.Modified;
                    }


                    insuranceDbContext.SaveChanges();
                    responseData.Status = "OK";
                    responseData.Results = "Print count updated successfully.";
                }
                else if (reqType == "update-Procedure")
                {
                    AdmissionModel patAdms = (from patAdmission in insuranceDbContext.Admissions
                                              where patAdmission.PatientAdmissionId == AdmissionPatientId
                                              select patAdmission).FirstOrDefault();

                    if (patAdms != null)
                    {
                        patAdms.ProcedureType = ProcedureType;
                        patAdms.ModifiedBy = currentUser.EmployeeId;
                        patAdms.ModifiedOn = currentUser.ModifiedOn;
                        insuranceDbContext.Entry(patAdms).Property(a => a.ProcedureType).IsModified = true;
                        insuranceDbContext.Entry(patAdms).Property(a => a.ModifiedBy).IsModified = true;
                        insuranceDbContext.Entry(patAdms).Property(a => a.ModifiedOn).IsModified = true;

                        insuranceDbContext.SaveChanges();
                        responseData.Status = "OK";
                    }

                }
                else if (reqType == "update-adtItems-duration")
                {
                    var str = this.ReadPostData();
                    List<BedDurationTxnDetailsVM> bedDurationDetails = DanpheJSONConvert.DeserializeObject<List<BedDurationTxnDetailsVM>>(str);
                    if (bedDurationDetails != null && bedDurationDetails.Count > 0)
                    {
                        double totalDuration = bedDurationDetails[0].Days;
                        int patientVisitId = bedDurationDetails[0].PatientVisitId;
                        BillingTransactionItemModel billItem = new BillingTransactionItemModel();
                        //update duration for Medical and Resident officer/Nursing Charges
                        billItem = (from bill in insuranceDbContext.BillingTransactionItems
                                    join itmCfg in insuranceDbContext.BillItemPrice on new { bill.ServiceDepartmentId, bill.ItemId } equals new { itmCfg.ServiceDepartmentId, itmCfg.ItemId }
                                    where bill.PatientVisitId == patientVisitId && itmCfg.IntegrationName == "Medical and Resident officer/Nursing Charges"
                                    select bill).FirstOrDefault();
                        if (billItem != null)
                        {
                            billItem.Quantity = totalDuration > 0 ? totalDuration : 1;
                            billItem.SubTotal = billItem.Price * billItem.Quantity;
                            billItem.DiscountAmount = (billItem.SubTotal * billItem.DiscountPercent) / 100;
                            billItem.TotalAmount = billItem.SubTotal - billItem.DiscountAmount;
                            insuranceDbContext.Entry(billItem).Property(a => a.Quantity).IsModified = true;
                            insuranceDbContext.Entry(billItem).Property(a => a.SubTotal).IsModified = true;
                            insuranceDbContext.Entry(billItem).Property(a => a.DiscountAmount).IsModified = true;
                            insuranceDbContext.Entry(billItem).Property(a => a.TotalAmount).IsModified = true;
                            insuranceDbContext.Entry(billItem).Property(a => a.NonTaxableAmount).IsModified = true;

                        }
                        responseData.Status = "OK";
                        insuranceDbContext.SaveChanges();
                        responseData.Results = "quantity updated";
                    }

                    else
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "Unable to upadate bed duration details.";
                    }

                }
                else if (reqType == "EditItemPrice_Qty_Disc_Provider")
                {
                    var str = this.ReadPostData();
                    BillingTransactionItemModel txnItmFromClient = DanpheJSONConvert.DeserializeObject<BillingTransactionItemModel>(str);
                    txnItmFromClient.ModifiedBy = currentUser.EmployeeId;
                    InsuranceBL.UpdateBillingTransactionItems(insuranceDbContext, txnItmFromClient);
                    if (txnItmFromClient.ModifiedBy != null)
                    {
                        var ModifiedByName = (from emp in insuranceDbContext.Employee
                                              where emp.EmployeeId == txnItmFromClient.ModifiedBy
                                              select emp.FirstName + " " + emp.LastName).FirstOrDefault();
                        txnItmFromClient.ModifiedByName = ModifiedByName;
                    }
                    responseData.Status = "OK";
                    responseData.Results = txnItmFromClient;
                }
                else if (reqType == "discharge-frombilling")
                {
                    string str = this.ReadPostData();
                    DischargeDetailVM dischargeDetail = DanpheJSONConvert.DeserializeObject<DischargeDetailVM>(str);
                    AdmissionModel admission = insuranceDbContext.Admissions.FirstOrDefault(adt => adt.PatientVisitId == dischargeDetail.PatientVisitId);
                    if (dischargeDetail != null && dischargeDetail.PatientId != 0)
                    {
                        //Transaction Begins  
                        using (var dbContextTransaction = insuranceDbContext.Database.BeginTransaction())
                        {
                            try
                            {
                                PatientBedInfo bedInfo = insuranceDbContext.PatientBedInfos
                        .Where(bed => bed.PatientVisitId == dischargeDetail.PatientVisitId)
                        .OrderByDescending(bed => bed.PatientBedInfoId).FirstOrDefault();

                                admission.AdmissionStatus = "discharged";
                                admission.DischargeDate = dischargeDetail.DischargeDate;
                                admission.BillStatusOnDischarge = dischargeDetail.BillStatus;
                                admission.DischargedBy = currentUser.EmployeeId;
                                admission.ModifiedBy = currentUser.EmployeeId;
                                admission.ModifiedOn = DateTime.Now;
                                admission.ProcedureType = dischargeDetail.ProcedureType;

                                FreeBed(insuranceDbContext, bedInfo.PatientBedInfoId, dischargeDetail.DischargeDate, admission.AdmissionStatus);

                                insuranceDbContext.Entry(admission).Property(a => a.DischargedBy).IsModified = true;
                                insuranceDbContext.Entry(admission).Property(a => a.AdmissionStatus).IsModified = true;
                                insuranceDbContext.Entry(admission).Property(a => a.DischargeDate).IsModified = true;
                                insuranceDbContext.Entry(admission).Property(a => a.BillStatusOnDischarge).IsModified = true;
                                insuranceDbContext.Entry(admission).Property(a => a.ModifiedBy).IsModified = true;
                                insuranceDbContext.Entry(admission).Property(a => a.ProcedureType).IsModified = true;

                                insuranceDbContext.SaveChanges();
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
                }
                //to cancel multiple items at once--needed in provisional items cancellation.sud:12May'18
                else if (reqType == "cancelBillTxnItems")
                {
                    var str = this.ReadPostData();
                    List<BillingTransactionItemModel> txnItemsToCancel = DanpheJSONConvert.DeserializeObject<List<BillingTransactionItemModel>>(str);

                    if (txnItemsToCancel != null && txnItemsToCancel.Count > 0)
                    {
                        //Transaction Begins  
                        using (var dbContextTransaction = insuranceDbContext.Database.BeginTransaction())
                        {
                            try
                            {
                                for (int i = 0; i < txnItemsToCancel.Count; i++)
                                {
                                    txnItemsToCancel[i] = InsuranceBL.UpdateTxnItemBillStatus(insuranceDbContext,
                                  txnItemsToCancel[i],
                                  "cancel",
                                  currentUser,
                                  DateTime.Now);
                                }
                                insuranceDbContext.SaveChanges();
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
                else if (reqType == "update-billtxnItem")
                {
                    var str = this.ReadPostData();
                    List<BillingTransactionItemModel> txnItems = DanpheJSONConvert.DeserializeObject<List<BillingTransactionItemModel>>(str);
                    if (txnItems != null)
                    {
                        txnItems.ForEach(item =>
                        {
                            item.ModifiedBy = currentUser.EmployeeId;
                            InsuranceBL.UpdateBillingTransactionItems(insuranceDbContext, item);
                        });
                    }

                    responseData.Status = "OK";
                }
                else if (reqType == "update-insurance-balance")
                {
                    var str = this.ReadPostData();
                    InsuranceBalanceHistoryModel insBalance = DanpheJSONConvert.DeserializeObject<InsuranceBalanceHistoryModel>(str);
                    if (insBalance != null)
                    {
                        InsuranceBL.UpdateInsuranceCurrentBalance(connString, insBalance.PatientId.Value,
                         insBalance.InsuranceProviderId.Value,
                         currentUser.EmployeeId,
                         Convert.ToDouble(insBalance.UpdatedAmount), false, insBalance.Remark);
                    }
                    responseData.Results =
                    responseData.Status = "OK";
                }
                else
                {
                    responseData.Results = null;
                    responseData.Status = "failed";
                    responseData.ErrorMessage = "Invalid request type.";
                }

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
        //NageshBB: 11 Feb 2021- Move below statuc methods to InsuranceBL 
        //If InsuranceBL not created then we will create separte only for Business logic like below methods
        //controller only for GET, POST, PUT, DELETE
        public static PatientModel GetPatientModelFromPatientVM(GovInsurancePatientVM govPatientVM, string connString, InsuranceDbContext insDbContext)
        {
            PatientModel retPat = new PatientModel()
            {
                PatientId = 0,
                PatientNo = 0,
                PatientCode = null,
                FirstName = govPatientVM.FirstName,
                MiddleName = govPatientVM.MiddleName,
                LastName = govPatientVM.LastName,
                ShortName = govPatientVM.ShortName,
                PatientNameLocal = govPatientVM.PatientNameLocal,
                Age = govPatientVM.Age,
                Gender = govPatientVM.Gender,
                DateOfBirth = govPatientVM.DateOfBirth,
                Address = govPatientVM.Address,
                CountryId = govPatientVM.CountryId,
                CountrySubDivisionId = govPatientVM.CountrySubDivisionId,
                CountrySubDivisionName = govPatientVM.CountrySubDivisionName,
                MembershipTypeId = 0,
                PhoneNumber = govPatientVM.PhoneNumber,
                IsActive = govPatientVM.IsActive,
                Ins_HasInsurance = govPatientVM.Ins_HasInsurance,
                Ins_NshiNumber = govPatientVM.Ins_NshiNumber,
                Ins_InsuranceBalance = govPatientVM.Ins_InsuranceBalance,
                MunicipalityId = govPatientVM.MunicipalityId,
                MunicipalityName = govPatientVM.MunicipalityName

            };



            NewPatientUniqueNumbersVM newPatientNumber = DanpheEMR.Controllers.PatientBL.GetPatNumberNCodeForNewPatient(connString);

            retPat.PatientNo = newPatientNumber.PatientNo;
            retPat.PatientCode = newPatientNumber.PatientCode;

            if (retPat.MembershipTypeId == null || retPat.MembershipTypeId == 0)
            {
                var membership = insDbContext.MembershipTypes.Where(i => i.MembershipTypeName == "General").FirstOrDefault();
                retPat.MembershipTypeId = membership.MembershipTypeId;
            }

            return retPat;
        }
        public static InsuranceModel GetInsuranceModelFromInsPatientVM(GovInsurancePatientVM govPatientVM)
        {
            InsuranceModel retInsInfo = new InsuranceModel()
            {
                InsuranceProviderId = govPatientVM.InsuranceProviderId,
                InsuranceName = govPatientVM.InsuranceName,
                CreatedOn = DateTime.Now,
                InitialBalance = govPatientVM.InitialBalance,
                //CurrentBalance = govPatientVM.CurrentBalance,
                IMISCode = govPatientVM.Ins_NshiNumber,
                Ins_HasInsurance = true,
                Ins_NshiNumber = govPatientVM.Ins_NshiNumber,
                Ins_InsuranceBalance = govPatientVM.Ins_InsuranceBalance,
                Ins_InsuranceProviderId = govPatientVM.Ins_InsuranceProviderId,
                Ins_IsFamilyHead = govPatientVM.Ins_IsFamilyHead,
                Ins_FamilyHeadNshi = govPatientVM.Ins_FamilyHeadNshi,
                Ins_FamilyHeadName = govPatientVM.Ins_FamilyHeadName,
                Ins_IsFirstServicePoint = govPatientVM.Ins_IsFirstServicePoint
            };

            return retInsInfo;
        }

        private string PatientVisitTransaction(string strLocal)
        {
            DanpheHTTPResponse<QuickVisitVM> responseData = new DanpheHTTPResponse<QuickVisitVM>();
            try
            {
                InsuranceDbContext insuranceDbContext = new InsuranceDbContext(base.connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                QuickVisitVM quickVisit = DanpheJSONConvert.DeserializeObject<QuickVisitVM>(strLocal);

                //check for clashing visit
                if (HasDuplicateVisitWithSameProvider(insuranceDbContext, quickVisit.Patient.PatientId, quickVisit.Visit.ProviderId, quickVisit.Visit.VisitDate))
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = "Patient already has visit with this provider today.";
                }
                else
                {
                    using (var visitDbTransaction = insuranceDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            quickVisit.Patient = AddPatientForVisit(insuranceDbContext, quickVisit.Patient, currentUser.EmployeeId);
                            quickVisit.Visit = AddVisit(insuranceDbContext, quickVisit.Patient.PatientId, quickVisit.Visit, quickVisit.BillingTransaction, currentUser.EmployeeId);
                            quickVisit.BillingTransaction = AddBillingTransactionForPatientVisit(insuranceDbContext,
                                quickVisit.BillingTransaction,
                                quickVisit.Visit.PatientId,
                                 quickVisit.Visit,
                                currentUser.EmployeeId);

                            //if (quickVisit.Visit.AppointmentType.ToLower() == "transfer" || quickVisit.Visit.AppointmentType.ToLower() == "referral")
                            if (quickVisit.Visit.AppointmentType.ToLower() == ENUM_AppointmentType.transfer.ToLower()
                                || quickVisit.Visit.AppointmentType.ToLower() == ENUM_AppointmentType.referral.ToLower())

                            {
                                UpdateIsContinuedStatus(quickVisit.Visit.ParentVisitId, quickVisit.Visit.AppointmentType, true, currentUser.EmployeeId, insuranceDbContext);
                            }
                            visitDbTransaction.Commit();

                            //pratik: 5march'20 ---to generate queue no for every new visit
                            quickVisit.Visit.QueueNo = CreateNewPatientQueueNo(insuranceDbContext, quickVisit.Visit.PatientVisitId, connString);
                            InsuranceBL.UpdateLatestClaimCode(connString, quickVisit.Patient.PatientId, quickVisit.Visit.ClaimCode, currentUser.EmployeeId);
                            //InsuranceBL.UpdateInsuranceCurrentBalance(connString, quickVisit.Visit.PatientId, quickVisit.BillingTransaction.InsuranceProviderId.Value, currentUser.EmployeeId, quickVisit.BillingTransaction.TotalAmount.Value, true);
                            quickVisit.Patient.Ins_LatestClaimCode = quickVisit.Visit.ClaimCode;
                            responseData.Results = quickVisit;
                            responseData.Status = "OK";
                        }
                        catch (Exception ex)
                        {
                            visitDbTransaction.Rollback();
                            responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                            responseData.Status = "Failed";
                        }
                    }
                }

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                throw ex;
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }


        public static bool HasDuplicateVisitWithSameProvider(InsuranceDbContext insurancevisitDb, int patientId, int? providerId, DateTime visitDate)
        {
            //sud:19Jun'19--For DepartmentLevel appointment, ProviderId will be Zero or Null. so return false in that case.//Needs revision.
            if (providerId == null || providerId == 0)
            {
                return false;
            }

            List<VisitModel> patientvisitList = (from visit in insurancevisitDb.Visit
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

        //Adding appointment for patient visit      
        public PatientModel AddPatientForVisit(InsuranceDbContext visitDbContext, PatientModel clientPat, int currentUserId)
        {
            try
            {
                //create patient and save if not registered. else get patient details from id.
                if (clientPat.PatientId == 0)
                {
                    clientPat.EMPI = PatientBL.CreateEmpi(clientPat, connString);
                    //sud:10Apr'19--To centralize patient number and Patient code logic.
                    //NewPatientUniqueNumbersVM newPatientNumber = DanpheEMR.Controllers.PatientBL.GetPatNumberNCodeForNewPatient(connString);
                    //clientPat.PatientNo = newPatientNumber.PatientNo;
                    //clientPat.PatientCode = newPatientNumber.PatientCode;

                    //clientPat.PatientNo = PatientBL.GetNewPatientNo(connString);
                    //clientPat.PatientCode = PatientBL.GetPatientCode(clientPat.PatientNo.Value, connString);

                    clientPat.CreatedOn = DateTime.Now;
                    clientPat.CreatedBy = currentUserId;
                    visitDbContext.Patients.Add(clientPat);
                    //this save is used to get patientid and using that patientid we are creating patientcode
                    //visitDbContext.SaveChanges();
                    GeneratePatientNoAndSavePatient(visitDbContext, clientPat, connString); //This is done to handle the duplicate patientNo..//Krishna' 6th,JAN'2022

                }
                return clientPat;

            }
            catch (Exception ex) { throw ex; }
        }

        private void GeneratePatientNoAndSavePatient(InsuranceDbContext visitDbContext, PatientModel clientPat, string connString)
        {
            try
            {
                NewPatientUniqueNumbersVM newPatientNumber = DanpheEMR.Controllers.PatientBL.GetPatNumberNCodeForNewPatient(connString);
                clientPat.PatientNo = newPatientNumber.PatientNo;
                clientPat.PatientCode = newPatientNumber.PatientCode;
                visitDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                if (ex is DbUpdateException dbUpdateEx)
                {
                    if (dbUpdateEx.InnerException?.InnerException is SqlException sqlException)
                    {

                        if (sqlException.Number == 2627)// unique constraint error in BillingTranscation table..
                        {
                            GeneratePatientNoAndSavePatient(visitDbContext, clientPat, connString);
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

        //Adding visit for patient visit   
        public VisitModel AddVisit(InsuranceDbContext insvisitDbContext, int currPatientId, VisitModel currVisit, BillingTransactionModel billTxn, int currentUserId)
        {
            try
            {
                var INSParameter = insvisitDbContext.CFGParameters.Where(a => a.ParameterGroupName == "Insurance" && a.ParameterName == "ClaimCodeAutoGenerateSettings").FirstOrDefault().ParameterValue;
                var claimcodeParameter = Newtonsoft.Json.Linq.JObject.Parse(INSParameter);
                var EnableAutoGenerate = Convert.ToBoolean(claimcodeParameter["EnableAutoGenerate"]);

                //Need to generate new claimcode when LastClaimCode is not used..
                if (currVisit.IsLastClaimCodeUsed == false)
                {
                    INS_NewClaimCodeDTO newClaimObj = InsuranceBL.GetGovInsNewClaimCode(insvisitDbContext);
                    currVisit.ClaimCode = newClaimObj.NewClaimCode;
                }

                currVisit.CreatedBy = currentUserId;
                currVisit.CreatedOn = DateTime.Now;
                currVisit.VisitType = currVisit.VisitType;
                currVisit.VisitStatus = ENUM_VisitStatus.initiated;// "initiated";
                currVisit.Ins_HasInsurance = true;

                if (billTxn != null && billTxn.IsInsuranceBilling == true)
                {
                    currVisit.BillingStatus = ENUM_BillingStatus.unpaid; // "unpaid";
                }

                else
                {
                    currVisit.BillingStatus = ENUM_BillingStatus.paid;// "paid";
                }
                currVisit.PatientId = currPatientId;
                //if (currVisit.VisitType == "outpatient")
                if (currVisit.VisitType == ENUM_VisitType.outpatient)
                    currVisit.VisitCode = VisitBL.CreateNewPatientVisitCode(currVisit.VisitType, connString);//"V" + (newVisit.PatientVisitId + 100000);
                else
                    currVisit.VisitCode = VisitBL.CreateNewPatientVisitCode(currVisit.VisitType, connString); //"H" + (newVisit.PatientVisitId + 100000);

                insvisitDbContext.Visit.Add(currVisit);
                insvisitDbContext.SaveChanges();
                return currVisit;

            }
            catch (Exception ex) { throw ex; }
        }


        //Adding billing for patient Visit
        public BillingTransactionModel AddBillingTransactionForPatientVisit(InsuranceDbContext
            insvisitDbContext,
            BillingTransactionModel
            clientTransaction,
            int PatientId,
            VisitModel currVisit,
            int currentUserId)
        {
            try
            {
                if (clientTransaction.BillingTransactionItems != null && clientTransaction.BillingTransactionItems.Count > 0)
                {
                    BillingFiscalYear fiscYr = BillingBL.GetFiscalYear(connString);
                    clientTransaction.FiscalYearId = fiscYr.FiscalYearId;
                    clientTransaction.FiscalYear = fiscYr.FiscalYearFormatted;
                    clientTransaction.Tender = 0;
                    if (clientTransaction.IsInsuranceBilling == true)
                        clientTransaction.InvoiceCode = "INS";
                    else
                        clientTransaction.InvoiceCode = "BL";
                    //clientTransaction.InvoiceNo = BillingBL.GetInvoiceNumber(connString);

                    clientTransaction.CreatedOn = DateTime.Now;
                    clientTransaction.CreatedBy = currentUserId;
                    clientTransaction.PatientId = PatientId;
                    clientTransaction.PatientVisitId = currVisit.PatientVisitId;
                    clientTransaction.ClaimCode = currVisit.ClaimCode;
                    if (clientTransaction.BillStatus == ENUM_BillingStatus.paid)// "paid")
                    {
                        clientTransaction.PaidAmount = clientTransaction.TotalAmount;
                        clientTransaction.PaidCounterId = clientTransaction.CounterId;
                        clientTransaction.PaidDate = clientTransaction.CreatedOn;
                        clientTransaction.PaymentReceivedBy = currentUserId;

                    }

                    ////get all ServiceDepts related to Visit/Appointment etc.. 
                    //List<ServiceDepartmentModel> visitServiceDepts = visitDbContext.ServiceDepartments
                    //    .Where(s => (!string.IsNullOrEmpty(s.IntegrationName)) && s.IntegrationName.ToLower() == "opd").ToList();


                    clientTransaction.BillingTransactionItems.ForEach(txnItem =>
                    {
                        txnItem.CreatedOn = clientTransaction.CreatedOn;
                        txnItem.CreatedBy = clientTransaction.CreatedBy;
                        txnItem.PatientId = clientTransaction.PatientId;
                        txnItem.PatientVisitId = clientTransaction.PatientVisitId;
                        txnItem.RequisitionDate = clientTransaction.CreatedOn;
                        txnItem.VisitType = currVisit.VisitType;
                        //if (txnItem.ItemName == "consultation charges")
                        //   
                        //if (txnItem.ItemName != "Health Card")
                        //    txnItem.RequisitionId = clientTransaction.PatientVisitId;
                        txnItem.CounterDay = clientTransaction.CreatedOn;
                        txnItem.CounterId = clientTransaction.CounterId;
                        txnItem.IsInsurance = clientTransaction.IsInsuranceBilling;


                        ServiceDepartmentModel srvDept = insvisitDbContext.ServiceDepartment.Where(s => s.ServiceDepartmentName == txnItem.ServiceDepartmentName).FirstOrDefault();

                        if (srvDept != null)
                        {
                            txnItem.ServiceDepartmentId = srvDept.ServiceDepartmentId;

                            //If integrationName is opd then we should add requisition id as patientvisitid.
                            if ((!string.IsNullOrEmpty(srvDept.IntegrationName)) && srvDept.IntegrationName.ToLower() == "opd")
                            {
                                txnItem.RequisitionId = clientTransaction.PatientVisitId;
                            }
                        }

                        if (clientTransaction.BillStatus == ENUM_BillingStatus.paid)// "paid")
                        {
                            txnItem.PaidCounterId = clientTransaction.PaidCounterId;
                            txnItem.PaidDate = clientTransaction.PaidDate;
                            txnItem.PaymentReceivedBy = clientTransaction.PaymentReceivedBy;
                        }
                        UpdateRequisitionItemsBillStatus(insvisitDbContext, txnItem.ServiceDepartmentName, "paid", currentUserId, txnItem.RequisitionId, DateTime.Now);
                    });
                    if (clientTransaction.IsInsuranceBilling == true)
                    {
                        InsuranceBL.UpdateInsuranceCurrentBalance(connString,
                            clientTransaction.PatientId,
                            clientTransaction.InsuranceProviderId ?? default(int),
                            currentUserId, clientTransaction.TotalAmount ?? default(int), true);

                    }
                    insvisitDbContext.AuditDisabled = false;
                    insvisitDbContext.BillingTransactions.Add(clientTransaction);
                    //insvisitDbContext.SaveChanges();
                    GenerateInvoiceNoAndSaveTransaction(insvisitDbContext, clientTransaction, connString);
                    //Yubraj: 28th June '19 //to get Billing UserName 
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                    insvisitDbContext.AddAuditCustomField("ChangedByUserId", currentUser.EmployeeId);
                    insvisitDbContext.AddAuditCustomField("ChangedByUserName", currentUser.UserName);
                    clientTransaction.BillingUserName = currentUser.UserName;

                    insvisitDbContext.AuditDisabled = true;

                    //sync transcation data to IRD or any other remote server.
                    if (realTimeRemoteSyncEnabled)
                    {
                        //passing null from here as we don't want to creat another billingdb context inside of it..
                        //this will be handled inside BillingBL's function. 
                        SyncBillToRemoteServer(clientTransaction, "sales", insvisitDbContext);
                    }
                }
                else
                {
                    throw new Exception("BillingTransactionItem not found.");
                }
                return clientTransaction;
            }
            catch (Exception ex)
            {

                throw ex;

            }
        }

        private void GenerateInvoiceNoAndSaveTransaction(InsuranceDbContext insvisitDbContext, BillingTransactionModel clientTransaction, string connString)
        {
            try
            {
                clientTransaction.InvoiceNo = BillingBL.GetInvoiceNumber(connString);
                //if(invoiceNoTest == 1) { billingTransaction.InvoiceNo = 258017; invoiceNoTest++; }//logic to test the duplicate invoice no and retry to get the latest invoiceNo
                insvisitDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                if (ex is DbUpdateException dbUpdateEx)
                {
                    if (dbUpdateEx.InnerException?.InnerException is SqlException sqlException)
                    {

                        if (sqlException.Number == 2627)// unique constraint error in BillingTranscation table..
                        {
                            GenerateInvoiceNoAndSaveTransaction(insvisitDbContext, clientTransaction, connString);
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

        public static void UpdateRequisitionItemsBillStatus(InsuranceDbContext visitDbContext,
        string serviceDepartmentName,
        string billStatus, //provisional,paid,unpaid,returned
        int? userId,
        long? requisitionId,
        DateTime? modifiedDate)
        {

            string integrationName = visitDbContext.ServiceDepartment
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

        //had to pass patient db context, since it is called inside db-transaction of PatientDbContext
        public static void SyncBillToRemoteServer(object billToPost, string billType, InsuranceDbContext dbContext)
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

        private void UpdateIsContinuedStatus(int? patientVisitId,
         string appointmentType,
         bool status, int? currentEmployeeId, InsuranceDbContext dbContext)
        {
            VisitModel dbVisit = dbContext.Visit
                        .Where(v => v.PatientVisitId == patientVisitId)
                        .FirstOrDefault<VisitModel>();
            if (dbVisit != null)
            {
                dbVisit.ModifiedOn = DateTime.Now;
                dbVisit.ModifiedBy = currentEmployeeId;
                //updated: sud-14aug-- visit-continued is set to true for both referral as well as followup.
                if (appointmentType.ToLower() == "referral" || appointmentType.ToLower() == "followup")
                {
                    dbVisit.IsVisitContinued = status;
                    dbContext.Entry(dbVisit).Property(b => b.IsVisitContinued).IsModified = true;

                }
                else if (appointmentType.ToLower() == "transfer")
                {
                    dbVisit.IsVisitContinued = status;
                    dbVisit.IsActive = false;
                    dbContext.Entry(dbVisit).Property(b => b.IsVisitContinued).IsModified = true;
                    dbContext.Entry(dbVisit).Property(b => b.IsActive).IsModified = true;
                }
                dbContext.Entry(dbVisit).Property(b => b.ModifiedOn).IsModified = true;
                dbContext.Entry(dbVisit).Property(b => b.ModifiedBy).IsModified = true;
                dbContext.SaveChanges();
            }
            else
                throw new Exception("Cannot update IsContinuedStatus of ParentVisit.");


        }

        public static int CreateNewPatientQueueNo(InsuranceDbContext visitDbContext, int visitId, string con)
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


        //Overload for GetFiscalYear with dbcontext as parameter, no need to initialize dbcontext if we already have that object.
        public static BillingFiscalYear GetFiscalYear(InsuranceDbContext billingDbContext)
        {
            DateTime currentDate = DateTime.Now.Date;
            return billingDbContext.BillingFiscalYears.Where(fsc => fsc.StartYear <= currentDate && fsc.EndYear >= currentDate).FirstOrDefault();
        }


        //updates billStatus and related fields in BIL_TXN_BillingTransactionItems table.
        public static BillingTransactionItemModel UpdateTxnItemBillStatus(InsuranceDbContext billingDbContext,
            BillingTransactionItemModel billItem,
            string billStatus, //provisional,paid,unpaid,returned
            RbacUser currentUser,
            DateTime? modifiedDate = null,
            int? counterId = null,
            int? billingTransactionId = null)
        {
            modifiedDate = modifiedDate != null ? modifiedDate : DateTime.Now;

            billItem = GetBillStatusMapped(billItem, billStatus, modifiedDate, currentUser.EmployeeId, counterId);
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

            //these fields could also be changed during update.
            billingDbContext.Entry(billItem).Property(b => b.BillStatus).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.Price).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.Quantity).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.SubTotal).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.DiscountAmount).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.DiscountPercent).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.DiscountPercentAgg).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.TotalAmount).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.ProviderId).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.ProviderName).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.TaxableAmount).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.NonTaxableAmount).IsModified = true;

            UpdateRequisitionItemsBillStatus2(billingDbContext, billItem.ServiceDepartmentName, billStatus, currentUser, billItem.RequisitionId, modifiedDate);

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

        //updates billStatus in respective tables.
        public static void UpdateRequisitionItemsBillStatus2(InsuranceDbContext billingDbContext,
            string serviceDepartmentName,
            string billStatus, //provisional,paid,unpaid,returned
            RbacUser currentUser,
            long? requisitionId,
            DateTime? modifiedDate)
        {

            string integrationName = billingDbContext.ServiceDepartment
             .Where(a => a.ServiceDepartmentName == serviceDepartmentName)
             .Select(a => a.IntegrationName).FirstOrDefault();

            if (integrationName != null)
            {
                //update return status in lab 
                if (integrationName.ToLower() == "lab")
                {
                    var labItem = billingDbContext.LabRequisitions.Where(req => req.RequisitionId == requisitionId).FirstOrDefault();
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
                    var radioItem = billingDbContext.RadiologyImagingRequisitions.Where(req => req.ImagingRequisitionId == requisitionId).FirstOrDefault();
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
                    var visitItem = billingDbContext.Visit.Where(vis => vis.PatientVisitId == requisitionId).FirstOrDefault();
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
        private QuickVisitVM PaidFollowupVisitTransaction(string strLocal)
        {
            DanpheHTTPResponse<QuickVisitVM> responseData = new DanpheHTTPResponse<QuickVisitVM>();
            QuickVisitVM quickVisit = null;
            try
            {
                InsuranceDbContext insuranceDbContext = new InsuranceDbContext(base.connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                quickVisit = DanpheJSONConvert.DeserializeObject<QuickVisitVM>(strLocal);


                //check for clashing visit
                if (InsuranceBL.HasDuplicateVisitWithSameProvider(insuranceDbContext, quickVisit.Visit.PatientId, quickVisit.Visit.ProviderId, quickVisit.Visit.VisitDate))
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = "Patient already has visit with this provider today.";
                }
                else
                {
                    using (var visitDbTransaction = insuranceDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            //quickVisit.Patient = AddPatientForVisit(visitDbContext, quickVisit.Patient, currentUser.EmployeeId);

                            quickVisit.Visit = AddVisit(insuranceDbContext, quickVisit.Visit.PatientId, quickVisit.Visit, quickVisit.BillingTransaction, currentUser.EmployeeId);

                            quickVisit.BillingTransaction = AddBillingTransactionForPatientVisit(insuranceDbContext,
                                quickVisit.BillingTransaction,
                                quickVisit.Visit.PatientId,
                                 quickVisit.Visit,
                                currentUser.EmployeeId);
                            //if (quickVisit.Visit.AppointmentType.ToLower() == "transfer" || quickVisit.Visit.AppointmentType.ToLower() == "referral" || quickVisit.Visit.AppointmentType.ToLower() == "followup")
                            if (quickVisit.Visit.AppointmentType.ToLower() == ENUM_AppointmentType.transfer.ToLower()
                                || quickVisit.Visit.AppointmentType.ToLower() == ENUM_AppointmentType.referral.ToLower()
                                || quickVisit.Visit.AppointmentType.ToLower() == ENUM_AppointmentType.followup.ToLower())

                            {
                                UpdateIsContinuedStatus(quickVisit.Visit.ParentVisitId, quickVisit.Visit.AppointmentType, true, currentUser.EmployeeId, insuranceDbContext);
                            }
                            visitDbTransaction.Commit();

                            InsuranceBL.UpdateLatestClaimCode(connString, quickVisit.Visit.PatientId, quickVisit.Visit.ClaimCode, currentUser.EmployeeId);
                            InsuranceBL.UpdateInsuranceCurrentBalance(connString, quickVisit.Visit.PatientId, quickVisit.BillingTransaction.InsuranceProviderId.Value, currentUser.EmployeeId, quickVisit.BillingTransaction.TotalAmount.Value, true);
                            quickVisit.Patient.Ins_LatestClaimCode = quickVisit.Visit.ClaimCode;
                            responseData.Results = quickVisit;
                            responseData.Status = "OK";

                        }
                        catch (Exception ex)
                        {
                            visitDbTransaction.Rollback();
                            responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                            responseData.Status = "Failed";
                        }
                    }
                }

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                throw ex;
            }
            return quickVisit;
        }

        private void FreeBed(InsuranceDbContext insDbContext, int bedInfoId, DateTime? endedOn, string status)
        {
            try
            {
                PatientBedInfo bedInfo = insDbContext.PatientBedInfos
                           .Where(b => b.PatientBedInfoId == bedInfoId)
                           .FirstOrDefault();
                UpdateIsOccupiedStatus(insDbContext, bedInfo.BedId, false);
                //endedOn can get updated from Billing Edit item as well.
                if (bedInfo.EndedOn == null)
                    bedInfo.EndedOn = endedOn;

                if (status == "discharged")
                {
                    bedInfo.OutAction = "discharged";
                }
                else if (status == "transfer")
                {
                    bedInfo.OutAction = "transfer";
                }
                else
                {
                    bedInfo.OutAction = null;
                }

                insDbContext.Entry(bedInfo).State = EntityState.Modified;
                insDbContext.Entry(bedInfo).Property(x => x.CreatedOn).IsModified = false;
                insDbContext.Entry(bedInfo).Property(x => x.StartedOn).IsModified = false;
                insDbContext.Entry(bedInfo).Property(x => x.CreatedBy).IsModified = false;
                insDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        private void UpdateIsOccupiedStatus(InsuranceDbContext dbContext, int bedId, bool status)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {

                BedModel selectedBed = dbContext.Beds
                    .Where(b => b.BedId == bedId)
                    .FirstOrDefault();
                selectedBed.IsOccupied = status;
                dbContext.Entry(selectedBed).State = EntityState.Modified;
                dbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
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
    }
}
