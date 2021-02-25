using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.Core.Configuration;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using System.Data.Entity;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using DanpheEMR.Utilities;
using Newtonsoft.Json;
using DanpheEMR.CommonTypes;
using DanpheEMR.Security;
using DanpheEMR.Core;
using DanpheEMR.Core.Parameters;
using DanpheEMR.Controllers.Billing;
using System.Data.SqlClient;
using System.Data;
using DanpheEMR.Enums;
// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860
//test for checkin
namespace DanpheEMR.Controllers
{

    public class VisitController : CommonController
    {
        bool realTimeRemoteSyncEnabled = false;
        public VisitController(IOptions<MyConfiguration> _config) : base(_config)
        {
            realTimeRemoteSyncEnabled = _config.Value.RealTimeRemoteSyncEnabled;
        }

        // GET: api/values
        [HttpGet]
        public string Get(int patientId,
            string status,
            string reqType,
            int visitId,
            bool followup,
            int inputProviderId,
            DateTime requestDate,
            string firstName,
            string lastName,
            string phoneNumber,
            DateTime fromDate,
            DateTime toDate,
            string claimCode,
            int dayslimit,
            string search)
        {
            //DanpheHTTPResponse<List<VisitModel>> responseData = new DanpheHTTPResponse<List<VisitModel>>();
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            responseData.Status = "OK";
            try
            {
                VisitDbContext dbContext = new VisitDbContext(base.connString);
                //List<VisitModel> visitList = new List<VisitModel>();
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                //load visits that are initiated

                if (reqType == "pastVisitList")
                {
                    CoreDbContext coreDbContext = new CoreDbContext(connString);
                    search = search == null ? string.Empty : search.ToLower();
                    var testdate = toDate.AddDays(1);
                    var visitList = (from visit in dbContext.Visits.Include("Patient")
                                     where (visit.VisitType.ToLower() == ENUM_VisitType.outpatient && (visit.BillingStatus != ENUM_BillingStatus.returned && visit.BillingStatus != ENUM_BillingStatus.cancel)
                                                && (visit.Patient.FirstName + " " + (string.IsNullOrEmpty(visit.Patient.MiddleName) ? "" : visit.Patient.MiddleName + " ")
                                                + visit.Patient.LastName + visit.Patient.PatientCode + visit.Patient.PhoneNumber).Contains(search))
                                     select visit).OrderByDescending(v => v.VisitDate).ThenByDescending(v => v.VisitTime).AsQueryable();


                    if (CommonFunctions.GetCoreParameterBoolValue(coreDbContext, "Common", "ServerSideSearchComponent", "NursingOutPatient") == true && search == "")
                    {
                        visitList = visitList.Take(CommonFunctions.GetCoreParameterIntValue(coreDbContext, "Common", "ServerSideSearchListLength"));
                    }

                    if (fromDate.Date != DateTime.Now.Date)
                    {
                        var finalResults = visitList.Where(a => a.CreatedOn > fromDate && a.CreatedOn < testdate).ToList();
                        responseData.Results = finalResults;
                    }
                    else
                    {
                        var finalResults = visitList.ToList();
                        responseData.Results = finalResults;
                    }
                    //responseData.Status = "OK";

                }
                else if (reqType == "existingClaimCode-VisitList")
                {
                    var visitList = (from visit in dbContext.Visits.Include("Patient")
                                     select visit).ToList()
                               .Where(v => (v.BillingStatus != ENUM_BillingStatus.returned && v.BillingStatus != ENUM_BillingStatus.cancel) && v.ClaimCode == claimCode)
                               .OrderByDescending(v => v.PatientVisitId).ToList();
                    //responseData.Status = "OK";
                    responseData.Results = visitList;
                }

                else if (reqType != null && reqType == "getVisitInfoforStickerPrint")
                {


                    List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@PatientVisitId", visitId) };
                    DataTable patStickerDetails = DALFunctions.GetDataTableFromStoredProc("SP_APPT_GetPatientVisitStickerInfo", paramList, dbContext);
                    responseData.Results = patStickerDetails;
                }
                else if (reqType == "patient-visitHistory")
                {
                    //today's all visit or all visits with IsVisitContinued status as false
                    var visitList = (from visit in dbContext.Visits
                                     where visit.PatientId == patientId && visit.BillingStatus != ENUM_BillingStatus.returned // "returned"
                                     select visit).ToList();
                    responseData.Results = visitList;
                }
                else if (reqType == "patient-visitHistory-today")
                {
                    //today's all visit or all visits with IsVisitContinued status as false
                    var visitList = (from visit in dbContext.Visits
                                     where visit.PatientId == patientId
                                   //DbFunctions.TruncateTime(defaultLastDateToShow)
                                   && DbFunctions.TruncateTime(visit.VisitDate) == DbFunctions.TruncateTime(DateTime.Now)
                                     && visit.BillingStatus != ENUM_BillingStatus.returned // "returned"
                                     select visit).ToList();
                    responseData.Results = visitList;
                }
                else if (reqType == "patient-visitHistorylist")
                {
                    //today's all visit or all visits with IsVisitContinued status as false
                    var visitList = (from visit in dbContext.Visits
                                     where visit.PatientId == patientId
                                   //DbFunctions.TruncateTime(defaultLastDateToShow)
                                   && (DbFunctions.TruncateTime(visit.VisitDate) == DbFunctions.TruncateTime(DateTime.Now) || followup == true)
                                     && visit.BillingStatus != ENUM_BillingStatus.returned // "returned"
                                     select visit).ToList();
                    responseData.Results = visitList;
                }
                else if (reqType == "patient-visit-providerWise")
                {
                    //if we do orderbydescending, the latest visit would come at the top. 
                    var patAllVisits = (from v in dbContext.Visits
                                        join doc in dbContext.Employees
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
                else if (reqType == "patientCurrentVisitContext")
                {
                    AdmissionDbContext admissionDb = new AdmissionDbContext(base.connString);
                    var data = (from bedInfo in admissionDb.PatientBedInfos
                                join bedFeat in admissionDb.BedFeatures on bedInfo.BedFeatureId equals bedFeat.BedFeatureId
                                join bed in admissionDb.Beds on bedInfo.BedId equals bed.BedId
                                join ward in admissionDb.Wards on bedInfo.WardId equals ward.WardId
                                join adm in admissionDb.Admissions on bedInfo.PatientVisitId equals adm.PatientVisitId
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
                        var patVisitInfo = (from vis in dbContext.Visits
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
                //gets the doctorschedule from visit table
                //Nagesh - want to remove added by me
                else if (reqType == "doctorschedule")
                {
                    DanpheHTTPResponse<object> responseResult = new DanpheHTTPResponse<object>();

                    List<VisitModel> visitListByProviderId = (from d in dbContext.Visits
                                                              where d.ProviderId == inputProviderId && d.BillingStatus != ENUM_BillingStatus.returned// "returned"
                                                              select d).ToList().Where(a => a.VisitDate.Date == requestDate.Date).ToList();
                    //VisitDay visitDays = VisitDay.FormatData(visitListByProviderId);

                    responseResult.Results = visitListByProviderId;
                }
                else if (reqType == "get-additional-billItems")
                {
                    var billingItems = new List<BillingItemVM>();
                    CoreDbContext coreDbContext = new CoreDbContext(connString);
                    var parameter = coreDbContext.Parameters.Where(a => a.ParameterGroupName == "Visit" && a.ParameterName == "AdditionalBillingItems").FirstOrDefault();
                    if (parameter != null && parameter.ParameterValue != null)
                    {
                        AdditionalItemInfoListVM additionalItemParameter = DanpheJSONConvert.DeserializeObject<AdditionalItemInfoListVM>(parameter.ParameterValue);
                        if (additionalItemParameter != null && additionalItemParameter.ItemList != null)
                        {
                            if (additionalItemParameter.ItemList.Count > 0)
                            {
                                var billItems = (from billItem in dbContext.BillItemPrice
                                                 join servDept in dbContext.ServiceDepartments on billItem.ServiceDepartmentId equals servDept.ServiceDepartmentId
                                                 select new BillingItemVM
                                                 {
                                                     ItemId = billItem.ItemId,
                                                     ItemName = billItem.ItemName,
                                                     ItemPrice = billItem.Price,
                                                     NormalPrice = billItem.Price, //added by Yubraj : 16th May '19
                                                     SAARCCitizenPrice = billItem.SAARCCitizenPrice,
                                                     ForeignerPrice = billItem.ForeignerPrice,
                                                     InsForeignerPrice = billItem.InsForeignerPrice,
                                                     TaxApplicable = billItem.TaxApplicable,
                                                     ServiceDepartmentId = billItem.ServiceDepartmentId,
                                                     ServiceDepartmentName = servDept.ServiceDepartmentName,
                                                     ProcedureCode = billItem.ProcedureCode
                                                 }).ToList();
                                additionalItemParameter.ItemList.ForEach(addItems =>
                                {
                                    var additionalBillItems = billItems.Find(items => items.ServiceDepartmentId == addItems.ServiceDepartmentId && items.ItemId == addItems.ItemId);
                                    if (additionalBillItems != null)
                                    {
                                        billingItems.Add(additionalBillItems);
                                    }
                                });

                            }
                        }
                    }
                    responseData.Results = billingItems;
                }
                else if (reqType == "get-doc-opd-prices")
                {
                    //check if we can use employee.IsAppointmentApplicable field in below join.--sud:15Jun'18
                    MasterDbContext masterDbContext = new DanpheEMR.DalLayer.MasterDbContext(connString);
                    BillingDbContext billingDbContext = new BillingDbContext(base.connString);
                    ServiceDepartmentModel srvDept = billingDbContext.ServiceDepartment.Where(s => s.ServiceDepartmentName == "OPD").FirstOrDefault();
                    if (srvDept != null)
                    {
                        var visitDoctorList = (from emp in dbContext.Employees
                                               where emp.IsActive == true && emp.IsAppointmentApplicable == true//sud:26Feb'19--get only active and AppointmentApplicable doctors.
                                               join dept in dbContext.Departments on emp.DepartmentId equals dept.DepartmentId
                                               join billItem in dbContext.BillItemPrice on emp.EmployeeId equals billItem.ItemId
                                               where billItem.ServiceDepartmentId == srvDept.ServiceDepartmentId
                                               //&& emp.IsActive == true && emp.IsAppointmentApplicable == true //sud:26Feb'19--get only active and AppointmentApplicable doctors.
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
                                                   Price = billItem.Price,
                                                   NormalPrice = billItem.Price, //added by Yubraj : 16th May '19
                                                   SAARCCitizenPrice = billItem.SAARCCitizenPrice,
                                                   ForeignerPrice = billItem.ForeignerPrice,
                                                   EHSPrice = billItem.EHSPrice,
                                                   InsForeignerPrice = billItem.InsForeignerPrice,
                                                   IsTaxApplicable = billItem.TaxApplicable,
                                                   billItem.HasAdditionalBillingItems
                                               }).ToList();
                        responseData.Results = visitDoctorList;
                    }
                }

                else if (reqType == "get-dept-opd-items")
                {
                    //check if we can use employee.IsAppointmentApplicable field in below join.--sud:15Jun'18
                    BillingDbContext billingDbContext = new BillingDbContext(base.connString);
                    ServiceDepartmentModel srvDept = billingDbContext.ServiceDepartment.Where(s => s.ServiceDepartmentName == "Department OPD").FirstOrDefault();
                    if (srvDept != null)
                    {
                        var deptOpdItems = (from dept in dbContext.Departments
                                            join billItem in dbContext.BillItemPrice on dept.DepartmentId equals billItem.ItemId
                                            where billItem.ServiceDepartmentId == srvDept.ServiceDepartmentId
                                            //&& emp.IsActive == true && emp.IsAppointmentApplicable == true //sud:26Feb'19--get only active and AppointmentApplicable doctors.
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
                                                EHSPrice = billItem.EHSPrice,
                                                InsForeignerPrice = billItem.InsForeignerPrice,
                                                IsTaxApplicable = billItem.TaxApplicable,
                                                DiscountApplicable = billItem.DiscountApplicable
                                            }).ToList();
                        responseData.Results = deptOpdItems;
                    }
                }

                else if (reqType == "get-doc-followup-items")
                {
                    //check if we can use employee.IsAppointmentApplicable field in below join.--sud:20Jun'19
                    BillingDbContext billingDbContext = new BillingDbContext(base.connString);
                    ServiceDepartmentModel srvDept = billingDbContext.ServiceDepartment.Where(s => s.ServiceDepartmentName == "Doctor Followup Charges").FirstOrDefault();
                    if (srvDept != null)
                    {
                        var visitDoctorList = (from emp in dbContext.Employees
                                               where emp.IsActive == true && emp.IsAppointmentApplicable == true//sud:26Feb'19--get only active and AppointmentApplicable doctors.
                                               join dept in dbContext.Departments on emp.DepartmentId equals dept.DepartmentId
                                               join billItem in dbContext.BillItemPrice on emp.EmployeeId equals billItem.ItemId
                                               where billItem.ServiceDepartmentId == srvDept.ServiceDepartmentId
                                               //&& emp.IsActive == true && emp.IsAppointmentApplicable == true //sud:26Feb'19--get only active and AppointmentApplicable doctors.
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
                                                   Price = billItem.Price,
                                                   NormalPrice = billItem.Price,
                                                   SAARCCitizenPrice = billItem.SAARCCitizenPrice,
                                                   ForeignerPrice = billItem.ForeignerPrice,
                                                   InsForeignerPrice = billItem.InsForeignerPrice,
                                                   EHSPrice = billItem.EHSPrice,
                                                   IsTaxApplicable = billItem.TaxApplicable
                                               }).ToList();
                        responseData.Results = visitDoctorList;
                    }
                }

                else if (reqType == "get-dept-followup-items")
                {
                    //check if we can use employee.IsAppointmentApplicable field in below join.--sud:15Jun'18
                    BillingDbContext billingDbContext = new BillingDbContext(base.connString);
                    ServiceDepartmentModel srvDept = billingDbContext.ServiceDepartment.Where(s => s.ServiceDepartmentName == "Department Followup Charges").FirstOrDefault();
                    if (srvDept != null)
                    {
                        var deptFollowupItems = (from dept in dbContext.Departments
                                                 join billItem in dbContext.BillItemPrice on dept.DepartmentId equals billItem.ItemId
                                                 where billItem.ServiceDepartmentId == srvDept.ServiceDepartmentId
                                                 //&& emp.IsActive == true && emp.IsAppointmentApplicable == true //sud:26Feb'19--get only active and AppointmentApplicable doctors.
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
                                                     DiscountApplicable = billItem.DiscountApplicable
                                                 }).ToList();
                        responseData.Results = deptFollowupItems;
                    }
                }

                else if (reqType == "get-dept-oldpatient-opd-items")
                {
                    //check if we can use employee.IsAppointmentApplicable field in below join.--sud:15Jun'18
                    BillingDbContext billingDbContext = new BillingDbContext(base.connString);
                    ServiceDepartmentModel srvDept = billingDbContext.ServiceDepartment.Where(s => s.ServiceDepartmentName == "Department OPD Old Patient").FirstOrDefault();
                    if (srvDept != null)
                    {
                        var deptOpdItems = (from dept in dbContext.Departments
                                            join billItem in dbContext.BillItemPrice on dept.DepartmentId equals billItem.ItemId
                                            where billItem.ServiceDepartmentId == srvDept.ServiceDepartmentId
                                            //&& emp.IsActive == true && emp.IsAppointmentApplicable == true //sud:26Feb'19--get only active and AppointmentApplicable doctors.
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
                                                EHSPrice = billItem.EHSPrice,
                                                InsForeignerPrice = billItem.InsForeignerPrice,
                                                IsTaxApplicable = billItem.TaxApplicable,
                                                DiscountApplicable = billItem.DiscountApplicable
                                            }).ToList();
                        responseData.Results = deptOpdItems;
                    }
                }

                else if (reqType == "get-doc-oldpatient-opd-items")
                {
                    //check if we can use employee.IsAppointmentApplicable field in below join.--sud:20Jun'19
                    BillingDbContext billingDbContext = new BillingDbContext(base.connString);
                    ServiceDepartmentModel srvDept = billingDbContext.ServiceDepartment.Where(s => s.ServiceDepartmentName == "Doctor OPD Old Patient").FirstOrDefault();
                    if (srvDept != null)
                    {
                        var visitDoctorList = (from emp in dbContext.Employees
                                               where emp.IsActive == true && emp.IsAppointmentApplicable == true//sud:26Feb'19--get only active and AppointmentApplicable doctors.
                                               join dept in dbContext.Departments on emp.DepartmentId equals dept.DepartmentId
                                               join billItem in dbContext.BillItemPrice on emp.EmployeeId equals billItem.ItemId
                                               where billItem.ServiceDepartmentId == srvDept.ServiceDepartmentId
                                               //&& emp.IsActive == true && emp.IsAppointmentApplicable == true //sud:26Feb'19--get only active and AppointmentApplicable doctors.
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
                                                   Price = billItem.Price,
                                                   NormalPrice = billItem.Price,
                                                   SAARCCitizenPrice = billItem.SAARCCitizenPrice,
                                                   ForeignerPrice = billItem.ForeignerPrice,
                                                   EHSPrice = billItem.EHSPrice,
                                                   InsForeignerPrice = billItem.InsForeignerPrice,
                                                   IsTaxApplicable = billItem.TaxApplicable
                                               }).ToList();
                        responseData.Results = visitDoctorList;
                    }
                }


                else if (reqType == "get-visit-doctors")
                {
                    //check if we can use employee.IsAppointmentApplicable field in below join.--sud:15Jun'18

                    var visitDoctorList = (from emp in dbContext.Employees
                                           where emp.IsActive == true && emp.IsAppointmentApplicable == true//sud:26Feb'19--get only active and AppointmentApplicable doctors.
                                           join dept in dbContext.Departments on emp.DepartmentId equals dept.DepartmentId
                                           select new
                                           {
                                               DepartmentId = dept.DepartmentId,
                                               DepartmentName = dept.DepartmentName,
                                               ProviderId = emp.EmployeeId,
                                               ProviderName = (string.IsNullOrEmpty(emp.Salutation) ? "" : emp.Salutation + ". ") + emp.FirstName + (string.IsNullOrEmpty(emp.MiddleName) ? " " : " " + emp.MiddleName + " ") + emp.LastName,

                                           }).ToList();
                    responseData.Results = visitDoctorList;


                }
                //else if (reqType == "get-visit-departments")
                //{
                //    //check if we can use employee.IsAppointmentApplicable field in below join.--sud:15Jun'18

                //    var visitDoctorList = (from  dept in dbContext.Departments
                //                           where dept.IsAppointmentApplicable == true
                //                           select new
                //                           {
                //                               DepartmentId = dept.DepartmentId,
                //                               DepartmentName = dept.DepartmentName
                //                           }).ToList();
                //    responseData.Results = visitDoctorList;
                //}


                //get the amount using providerId
                else if (reqType == "GetTotalAmountByProviderId" && inputProviderId > 0)
                {
                    BillingDbContext billingDbContext = new BillingDbContext(base.connString);
                    ServiceDepartmentModel srvDept = billingDbContext.ServiceDepartment.Where(s => s.ServiceDepartmentName == "OPD").FirstOrDefault();
                    if (srvDept != null)
                    {
                        ///remove tolist from below query-- one doc will have only one opd-tkt price.. <sudrshan:14jul2017>
                        var billingItemPrice = (from bill in billingDbContext.BillItemPrice
                                                where bill.ServiceDepartmentId == srvDept.ServiceDepartmentId && bill.ItemId == inputProviderId
                                                select bill.Price).ToList();

                        responseData.Results = billingItemPrice;
                    }
                    else
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "Failed to get OPD-Ticket Price";
                    }
                }
                //else if (reqType == "GetMatchingPatList" && !string.IsNullOrEmpty(firstName) && !string.IsNullOrEmpty(lastName) && !string.IsNullOrEmpty(phoneNumber))
                else if (reqType == "GetMatchingPatList")
                {
                    var patientList = (from patlist in dbContext.Patients
                                       where (patlist.FirstName == firstName && patlist.LastName == lastName)
                                       || (patlist.PhoneNumber == phoneNumber)
                                       || (patlist.FirstName == firstName && patlist.LastName == lastName && patlist.PhoneNumber == phoneNumber)
                                       select new
                                       {
                                           PatientId = patlist.PatientId,
                                           FirstName = patlist.FirstName,
                                           MiddleName = patlist.MiddleName,
                                           LastName = patlist.LastName,
                                           Gender = patlist.Gender,
                                           PhoneNumber = patlist.PhoneNumber,
                                           IsDobVerified = patlist.IsDobVerified,
                                           DateOfBirth = patlist.DateOfBirth,
                                           CountryId = patlist.CountryId,
                                           CountrySubDivisionId = patlist.CountrySubDivisionId,
                                           MembershipTypeId = patlist.MembershipTypeId,
                                           Address = patlist.Address,
                                           PatientCode = patlist.PatientCode
                                       }
                                    ).ToList();
                    responseData.Results = patientList;
                }
                else if (reqType == "patVisitList")
                {
                    var visList = (from visit in dbContext.Visits
                                   where visit.PatientId == patientId
                                   && visit.ProviderId == currentUser.EmployeeId
                                   && visit.BillingStatus != ENUM_BillingStatus.returned // "returned"
                                   && visit.IsSignedVisitSummary == true
                                   select new
                                   {
                                       PatientVisitId = visit.PatientVisitId,
                                       PatientVisitCode = visit.VisitCode,
                                       VisitDateTime = visit.VisitDate,
                                       IsSignedVisitSummary = visit.IsSignedVisitSummary
                                   }).OrderByDescending(v => v.VisitDateTime).ToList();

                    responseData.Results = visList;
                }
                else if (reqType == "getPatHealthCardStatus")
                {
                    ////added by sud:3sept'18 -- revised the healthcard conditions..
                    PatientDbContext patDbContext = new PatientDbContext(connString);
                    var cardPrintInfo = patDbContext.PATHealthCard.Where(a => a.PatientId == patientId).FirstOrDefault();

                    BillingDbContext billingDbContext = new BillingDbContext(connString);
                    CoreDbContext coreDbContext = new CoreDbContext(connString);
                    var parameter = coreDbContext.Parameters.Where(a => a.ParameterGroupName == "Common" && a.ParameterName == "BillItemHealthCard").FirstOrDefault();
                    if (parameter != null && parameter.ParameterValue != null)
                    {
                        //JObject paramValue = JObject.Parse(parameter.ParameterValue);
                       //var result = JsonConvert.DeserializeObject<any>(parameter.ParameterValue);

                        //dynamic result = JValue.Parse(parameter.ParameterValue);
                        
                    }
                        //if one item was found but cancelled or returned then we've to issue it again..
                        var cardBillingInfo = billingDbContext.BillingTransactionItems
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

                    //if (cardPrintInfo != null)
                    //    responseData.Results = true;
                    //else
                    //    responseData.Results = false;
                    //responseData.Status = "OK";
                }

                else
                {
                    // var visitTemp = dbContext.Visits.ToList();
                    //get visit upto 15 days from today



                    //dayslimit = 30;//this will come from client side.

                    int defaultMaxDays = 30;//sud:12Apr'19--now we need visits from past 30days. FollowupDays logic is handled in client side only.

                    DateTime defaultLastDateToShow = System.DateTime.Now.AddDays(-defaultMaxDays);

                    DateTime freeFollowupLastDate = System.DateTime.Now.AddDays(-dayslimit);

                    CoreDbContext coreDbContext = new CoreDbContext(connString);
                    search = search == null ? string.Empty : search.ToLower();

                    var visitVMList = (from visit in dbContext.Visits
                                       join department in dbContext.Departments on visit.DepartmentId equals department.DepartmentId
                                       join patient in dbContext.Patients on visit.PatientId equals patient.PatientId
                                       where ((visit.VisitStatus == status)
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

                                           BillStatus = visit.BillingStatus
                                       }).OrderByDescending(v => v.VisitDate).ThenByDescending(a => a.VisitTime).AsQueryable();


                    if (CommonFunctions.GetCoreParameterBoolValue(coreDbContext, "Common", "ServerSideSearchComponent", "VisitList") == true && search == "")
                    {
                        visitVMList = visitVMList.Take(CommonFunctions.GetCoreParameterIntValue(coreDbContext, "Common", "ServerSideSearchListLength"));
                    }
                    var finalResults = visitVMList.ToList();
                    //check if the topmost visit is valid for follow up or not.
                    var List = VisitBL.GetValidForFollowUp(finalResults, freeFollowupLastDate);
                    //responseData.Status = "OK";
                    responseData.Results = List;

                    //if (search == null) // Vikas: 17th June 2019 :added real time search.
                    //{
                    //    var visitVMList = (from visit in dbContext.Visits
                    //                       join department in dbContext.Departments on visit.DepartmentId equals department.DepartmentId
                    //                       join patient in dbContext.Patients on visit.PatientId equals patient.PatientId
                    //                       where ((visit.VisitStatus == status)
                    //                              && visit.VisitDate > DbFunctions.TruncateTime(defaultLastDateToShow) && visit.VisitType != ENUM_VisitType.inpatient) && visit.BillingStatus != ENUM_BillingStatus.returned
                    //                       select new ListVisitsVM
                    //                       {
                    //                           PatientVisitId = visit.PatientVisitId,
                    //                           ParentVisitId = visit.ParentVisitId,
                    //                           DepartmentId = department.DepartmentId,
                    //                           DepartmentName = department.DepartmentName,
                    //                           ProviderId = visit.ProviderId,
                    //                           ProviderName = visit.ProviderName,
                    //                           VisitDate = visit.VisitDate,
                    //                           VisitTime = visit.VisitTime,

                    //                           VisitType = visit.VisitType,
                    //                           AppointmentType = visit.AppointmentType,

                    //                           PatientId = patient.PatientId,
                    //                           PatientCode = patient.PatientCode,
                    //                           ShortName = patient.FirstName + " " + (string.IsNullOrEmpty(patient.MiddleName) ? "" : patient.MiddleName + " ") + patient.LastName,
                    //                           PhoneNumber = patient.PhoneNumber,
                    //                           DateOfBirth = patient.DateOfBirth,
                    //                           Gender = patient.Gender,
                    //                           Patient = patient,

                    //                           BillStatus = visit.BillingStatus
                    //                       }).OrderByDescending(v => v.VisitDate).ThenByDescending(a => a.VisitTime).Take(200).ToList();

                    //    //check if the topmost visit is valid for follow up or not.
                    //    var List = VisitBL.GetValidForFollowUp(visitVMList, freeFollowupLastDate);
                    //    responseData.Results = List;
                    //}
                    //else
                    //{
                    //    List<ListVisitsVM> visitVMList = (from visit in dbContext.Visits
                    //                                      join department in dbContext.Departments on visit.DepartmentId equals department.DepartmentId
                    //                                      join patient in dbContext.Patients on visit.PatientId equals patient.PatientId
                    //                                      where ((visit.VisitStatus == status)
                    //                                         && visit.VisitDate > DbFunctions.TruncateTime(defaultLastDateToShow) && visit.VisitType != ENUM_VisitType.inpatient) && visit.BillingStatus != ENUM_BillingStatus.returned
                    //                                         && (visit.Patient.FirstName + " " + (string.IsNullOrEmpty(visit.Patient.MiddleName) ? "" : visit.Patient.MiddleName + " ")
                    //                                    + visit.Patient.LastName + visit.Patient.PatientCode + visit.Patient.PhoneNumber).Contains(search)
                    //                                      select new ListVisitsVM
                    //                                      {
                    //                                          PatientVisitId = visit.PatientVisitId,
                    //                                          ParentVisitId = visit.ParentVisitId,
                    //                                          DepartmentId = department.DepartmentId,
                    //                                          DepartmentName = department.DepartmentName,
                    //                                          ProviderId = visit.ProviderId,
                    //                                          ProviderName = visit.ProviderName,
                    //                                          VisitDate = visit.VisitDate,
                    //                                          VisitTime = visit.VisitTime,

                    //                                          VisitType = visit.VisitType,
                    //                                          AppointmentType = visit.AppointmentType,

                    //                                          PatientId = patient.PatientId,
                    //                                          PatientCode = patient.PatientCode,
                    //                                          ShortName = patient.FirstName + " " + (string.IsNullOrEmpty(patient.MiddleName) ? "" : patient.MiddleName + " ") + patient.LastName,
                    //                                          PhoneNumber = patient.PhoneNumber,
                    //                                          DateOfBirth = patient.DateOfBirth,
                    //                                          Gender = patient.Gender,
                    //                                          Patient = patient,

                    //                                          BillStatus = visit.BillingStatus
                    //                                      }).OrderByDescending(v => v.VisitDate).ThenByDescending(a => a.VisitTime).ToList();

                    //    //check if the topmost visit is valid for follow up or not.
                    //    var List = VisitBL.GetValidForFollowUp(visitVMList, freeFollowupLastDate);
                    //    responseData.Results = List;
                    //}

                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        //POST: asp/values
        [HttpPost]
        public string Post()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                VisitDbContext visitDbContext = new VisitDbContext(base.connString);

                string str = this.ReadPostData();
                string reqType = this.ReadQueryStringData("reqType");
                //JObject json = JObject.Parse(str); //use netwon soft to make a object

                if (!string.IsNullOrEmpty(reqType) && reqType == "patientVisitCreate")
                {
                    //This method for do the patient visit transaction
                    //In this transaction- Post data to Patient, Visit,BillTransaction, BillTransactionItems tables
                    return PatientVisitTransaction(str);
                }
                //added: ashim: 23Sep2018: Visit from billing transaction.
                else if (!string.IsNullOrEmpty(reqType) && reqType == "billing-visits")
                {
                    List<VisitModel> visits = JsonConvert.DeserializeObject<List<VisitModel>>(str);
                    visits.ForEach(visit =>
                    {
                        visit.VisitCode = VisitBL.CreateNewPatientVisitCode(visit.VisitType, connString);
                        visitDbContext.Visits.Add(visit);

                    });
                    visitDbContext.SaveChanges();
                    responseData.Results = visits;
                    responseData.Status = "OK";
                }

                //sud:4June'19--For Free-Referral Visit -- We don't have to send data to Billing Tables.

                else if (!string.IsNullOrEmpty(reqType) && reqType == "free-referral-visit")
                {
                    VisitModel vis = JsonConvert.DeserializeObject<VisitModel>(str);
                    //to avoid clashing of visits
                    if (VisitBL.HasDuplicateVisitWithSameProvider(visitDbContext, vis.PatientId, vis.ProviderId, vis.VisitDate) && vis.VisitType == "outpatient")
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "Patient already has visit with this Doctor today.";
                    }
                    else
                    {
                        //get provider name from providerId
                        if (vis.ProviderId != null && vis.ProviderId != 0)
                        {
                            vis.ProviderName = VisitBL.GetProviderName(vis.ProviderId, connString);
                        }

                        vis.VisitCode = VisitBL.CreateNewPatientVisitCode(vis.VisitType, connString);
                        visitDbContext.Visits.Add(vis);
                        visitDbContext.SaveChanges();
                        //VisitBL.UpdateVisitCode(obj.PatientVisitId, visitDbContext);
                        //in client side Patient Data is also needed along with visit

                        //VisitModel returnVisit = visitDbContext.Visits.Include("Patient")
                        //    .Where(v => v.PatientVisitId == vis.PatientVisitId).FirstOrDefault();

                        //updateIsContinuedStatus in case of referral visit and followup visit
                        if (vis.AppointmentType.ToLower() == ENUM_AppointmentType.referral.ToLower() // "referral"
                            || vis.AppointmentType.ToLower() == ENUM_AppointmentType.followup.ToLower() //"followup"
                            || vis.AppointmentType.ToLower() == ENUM_AppointmentType.transfer.ToLower())//"transfer")
                        {
                            UpdateIsContinuedStatus(vis.ParentVisitId,
                                vis.AppointmentType,
                                true,
                                currentUser.EmployeeId,
                                visitDbContext);
                        }


                        //Return Model should be in same format as that of the ListVisit since it's appended in the same list.
                        ListVisitsVM returnVisit = (from visit in visitDbContext.Visits
                                                    where visit.PatientVisitId == vis.PatientVisitId
                                                    join department in visitDbContext.Departments on visit.DepartmentId equals department.DepartmentId
                                                    join patient in visitDbContext.Patients on visit.PatientId equals patient.PatientId
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
                                                        ProviderName = visit.ProviderName,
                                                        ProviderId = visit.ProviderId,
                                                        VisitType = visit.VisitType,
                                                        AppointmentType = visit.AppointmentType,
                                                        BillStatus = visit.BillingStatus,
                                                        Patient = patient
                                                    }).FirstOrDefault();



                        responseData.Results = returnVisit;
                        responseData.Status = "OK";
                    }

                }
                //sud: 23June'19--logic used here might be duplicated from referral, try to merge them in free time.. 
                else if (!string.IsNullOrEmpty(reqType) && reqType == "free-followup-visit")
                {
                    VisitModel vis = JsonConvert.DeserializeObject<VisitModel>(str);
                    //to avoid clashing of visits
                    if (VisitBL.HasDuplicateVisitWithSameProvider(visitDbContext, vis.PatientId, vis.ProviderId, vis.VisitDate) && vis.VisitType == "outpatient")
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "Patient already has appointment with this Doctor today.";
                    }
                    else
                    {
                        //get provider name from providerId
                        if (vis.ProviderId != null && vis.ProviderId != 0)
                        {
                            vis.ProviderName = VisitBL.GetProviderName(vis.ProviderId, connString);
                        }

                        vis.VisitCode = VisitBL.CreateNewPatientVisitCode(vis.VisitType, connString);
                        visitDbContext.Visits.Add(vis);
                        visitDbContext.SaveChanges();
                        //VisitBL.UpdateVisitCode(obj.PatientVisitId, visitDbContext);
                        //in client side Patient Data is also needed along with visit
                        //VisitModel returnVisit = visitDbContext.Visits.Include("Patient")
                        //    .Where(v => v.PatientVisitId == vis.PatientVisitId).FirstOrDefault();

                        //updateIsContinuedStatus in case of referral visit and followup visit
                        if (vis.AppointmentType.ToLower() == ENUM_AppointmentType.referral.ToLower() // "referral"
                            || vis.AppointmentType.ToLower() == ENUM_AppointmentType.followup.ToLower() // "followup"
                            || vis.AppointmentType.ToLower() == ENUM_AppointmentType.transfer.ToLower()) // "transfer")
                        {
                            UpdateIsContinuedStatus(vis.ParentVisitId,
                                vis.AppointmentType,
                                true,
                                currentUser.EmployeeId,
                                visitDbContext);
                        }



                        //Return Model should be in same format as that of the ListVisit since it's appended in the samae list.
                        ListVisitsVM returnVisit = (from visit in visitDbContext.Visits
                                                    where visit.PatientVisitId == vis.PatientVisitId
                                                    join department in visitDbContext.Departments on visit.DepartmentId equals department.DepartmentId
                                                    join patient in visitDbContext.Patients on visit.PatientId equals patient.PatientId
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
                                                        Patient = patient
                                                    }).FirstOrDefault();


                        responseData.Results = returnVisit;
                        responseData.Status = "OK";
                    }

                }
                else if (!string.IsNullOrEmpty(reqType) && reqType == "paid-followup-visit")
                {
                    QuickVisitVM qckVisit = PaidFollowupVisitTransaction(str);
                    responseData.Status = "OK";
                    responseData.Results = qckVisit;
                }
                else
                {
                    VisitModel vis = JsonConvert.DeserializeObject<VisitModel>(str);
                    //to avoid clashing of visits
                    if (VisitBL.HasDuplicateVisitWithSameProvider(visitDbContext, vis.PatientId, vis.ProviderId, vis.VisitDate) && vis.VisitType == "outpatient")
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "Patient already has visit with this provider today.";
                    }
                    else
                    {
                        //get provider name from providerId
                        if (vis.ProviderId != null && vis.ProviderId != 0)
                        {
                            vis.ProviderName = VisitBL.GetProviderName(vis.ProviderId, connString);
                        }

                        vis.VisitCode = VisitBL.CreateNewPatientVisitCode(vis.VisitType, connString);
                        visitDbContext.Visits.Add(vis);
                        visitDbContext.SaveChanges();
                        //VisitBL.UpdateVisitCode(obj.PatientVisitId, visitDbContext);
                        //in client side Patient Data is also needed along with visit
                        //VisitModel returnVisit = visitDbContext.Visits.Include("Patient")
                        //    .Where(v => v.PatientVisitId == vis.PatientVisitId).FirstOrDefault();

                        //updateIsContinuedStatus in case of referral visit and followup visit
                        if (vis.AppointmentType.ToLower() == ENUM_AppointmentType.referral.ToLower() // "referral"
                        || vis.AppointmentType.ToLower() == ENUM_AppointmentType.followup.ToLower() // "followup"
                        || vis.AppointmentType.ToLower() == ENUM_AppointmentType.transfer.ToLower()) // "transfer")
                        {
                            UpdateIsContinuedStatus(vis.ParentVisitId,
                                vis.AppointmentType,
                                true,
                                currentUser.EmployeeId,
                                visitDbContext);
                        }



                        //Return Model should be in same format as that of the ListVisit since it's appended in the samae list.
                        ListVisitsVM returnVisit = (from visit in visitDbContext.Visits
                                                    where visit.PatientVisitId == vis.PatientVisitId
                                                    join department in visitDbContext.Departments on visit.DepartmentId equals department.DepartmentId
                                                    join patient in visitDbContext.Patients on visit.PatientId equals patient.PatientId
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
                                                        ProviderName = visit.ProviderName,
                                                        ProviderId = visit.ProviderId,
                                                        VisitType = visit.VisitType,
                                                        AppointmentType = visit.AppointmentType,
                                                        BillStatus = visit.BillingStatus,
                                                        Patient = patient
                                                    }).FirstOrDefault();


                        responseData.Results = returnVisit;
                        responseData.Status = "OK";
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

        // PUT api/values/
        [HttpPut]
        public string Put()
        {
            DanpheHTTPResponse<VisitModel> responseData = new DanpheHTTPResponse<VisitModel>();
            try
            {
                VisitDbContext dbContext = new VisitDbContext(base.connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                string str = this.ReadPostData();
                string reqType = this.ReadQueryStringData("reqType");
                string billingStatus = this.ReadQueryStringData("billingStatus");
                int patientVisitId = ToInt(this.ReadQueryStringData("visitId"));
                bool continuedVisitStatus = ToBool(this.ReadQueryStringData("continuedVisitStatus"));
                //updates visit bill status
                if (reqType == "updateBillStatus")
                {
                    List<Int32> patientVisitIds = JsonConvert.DeserializeObject<List<Int32>>(str);
                    //updates the visit status when bill is paid.

                    foreach (var visitId in patientVisitIds)
                    {
                        VisitModel dbVisit = dbContext.Visits
                                                    .Where(v => v.PatientVisitId == visitId)
                                                    .FirstOrDefault<VisitModel>();
                        if (dbVisit != null)
                        {
                            dbVisit.BillingStatus = billingStatus.ToLower();
                            dbContext.Entry(dbVisit).State = EntityState.Modified;
                        }
                    }
                    dbContext.SaveChanges();

                    //create a return visitmodel with only updated/changed fields.
                    responseData.Results = new VisitModel() { VisitStatus = billingStatus };
                    responseData.Status = "OK";
                }
                else if (reqType == "updateIsSignedPatientData")
                {
                    VisitModel visit = dbContext.Visits.Where(a => a.PatientVisitId == patientVisitId).FirstOrDefault();
                    visit.ModifiedBy = currentUser.UserId;
                    visit.ModifiedOn = DateTime.Now;
                    visit.IsSignedVisitSummary = true;
                    dbContext.Entry(visit).State = EntityState.Modified;

                    dbContext.Entry(visit).Property(u => u.CreatedBy).IsModified = false;
                    dbContext.Entry(visit).Property(u => u.CreatedOn).IsModified = false;

                    dbContext.SaveChanges();
                    responseData.Status = "OK";

                }

                //else if (reqType == "reassignProvider")
                //{
                //    VisitModel visitData = DanpheJSONConvert.DeserializeObject<VisitModel>(str);
                //    visitData.ModifiedOn = System.DateTime.Now;
                //    visitData.ProviderName = GetProviderName(visitData.ProviderId);

                //    BillingDbContext billingDbContext = new BillingDbContext(base.connString);

                //    Boolean Flag = false;
                //    Flag = VisitBL.ReAssignProviderTxn(dbContext, visitData, billingDbContext);
                //    if (Flag)
                //    {
                //        responseData.Status = "OK";
                //    }
                //    else
                //    {
                //        responseData.Status = "Failed";
                //    }
                //}
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }
        //check if the patient has visit with same provider today

        //update IsContinuedStatus in case of referral  and followup
        private void UpdateIsContinuedStatus(int? patientVisitId,
            string appointmentType,
            bool status, int? currentEmployeeId, VisitDbContext dbContext)
        {
            VisitModel dbVisit = dbContext.Visits
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
        /**Modified: Ashim: 23Aug2018
         * It is called by /Appointment/Visit
         * Handles logic to Post New Patient (if patientId=0), Post Visit, and Post BillingTransaction and Update IsContinuedVisit status.
         * 
         * */
        private string PatientVisitTransaction(string strLocal)
        {
            DanpheHTTPResponse<QuickVisitVM> responseData = new DanpheHTTPResponse<QuickVisitVM>();
            try
            {
                VisitDbContext visitDbContext = new VisitDbContext(base.connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                QuickVisitVM quickVisit = DanpheJSONConvert.DeserializeObject<QuickVisitVM>(strLocal);

                //check for clashing visit
                if (VisitBL.HasDuplicateVisitWithSameProvider(visitDbContext, quickVisit.Patient.PatientId, quickVisit.Visit.ProviderId, quickVisit.Visit.VisitDate))
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = "Patient already has visit with this provider today.";
                }
                else
                {
                    using (var visitDbTransaction = visitDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            quickVisit.Patient = AddPatientForVisit(visitDbContext, quickVisit.Patient, currentUser.EmployeeId);
                            quickVisit.Visit = AddVisit(visitDbContext, quickVisit.Patient.PatientId, quickVisit.Visit, quickVisit.BillingTransaction, currentUser.EmployeeId);
                            quickVisit.BillingTransaction = AddBillingTransactionForPatientVisit(visitDbContext,
                                quickVisit.BillingTransaction,
                                quickVisit.Visit.PatientId,
                                 quickVisit.Visit,
                                currentUser.EmployeeId);
                            //if (quickVisit.Visit.AppointmentType.ToLower() == "transfer" || quickVisit.Visit.AppointmentType.ToLower() == "referral")
                            if (quickVisit.Visit.AppointmentType.ToLower() == ENUM_AppointmentType.transfer.ToLower()
                                || quickVisit.Visit.AppointmentType.ToLower() == ENUM_AppointmentType.referral.ToLower())

                            {
                                UpdateIsContinuedStatus(quickVisit.Visit.ParentVisitId, quickVisit.Visit.AppointmentType, true, currentUser.EmployeeId, visitDbContext);
                            }
                            visitDbTransaction.Commit();

                            //pratik: 5march'20 ---to generate queue no for every new visit
                            quickVisit.Visit.QueueNo = VisitBL.CreateNewPatientQueueNo(visitDbContext, quickVisit.Visit.PatientVisitId, connString);

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

        //Adding appointment for patient visit      
        public PatientModel AddPatientForVisit(VisitDbContext visitDbContext, PatientModel clientPat, int currentUserId)
        {
            try
            {
                //create patient and save if not registered. else get patient details from id.
                if (clientPat.PatientId == 0)
                {
                    clientPat.EMPI = PatientBL.CreateEmpi(clientPat, connString);
                    //sud:10Apr'19--To centralize patient number and Patient code logic.
                    NewPatientUniqueNumbersVM newPatientNumber = DanpheEMR.Controllers.PatientBL.GetPatNumberNCodeForNewPatient(connString);
                    clientPat.PatientNo = newPatientNumber.PatientNo;
                    clientPat.PatientCode = newPatientNumber.PatientCode;

                    //clientPat.PatientNo = PatientBL.GetNewPatientNo(connString);
                    //clientPat.PatientCode = PatientBL.GetPatientCode(clientPat.PatientNo.Value, connString);

                    clientPat.CreatedOn = DateTime.Now;
                    clientPat.CreatedBy = currentUserId;
                    visitDbContext.Patients.Add(clientPat);
                    //this save is used to get patientid and using that patientid we are creating patientcode
                    visitDbContext.SaveChanges();
                }
                return clientPat;

            }
            catch (Exception ex) { throw ex; }
        }

        //Adding visit for patient visit   
        public VisitModel AddVisit(VisitDbContext visitDbContext, int currPatientId, VisitModel currVisit, BillingTransactionModel billTxn, int currentUserId)
        {
            try
            {
                currVisit.CreatedBy = currentUserId;
                currVisit.CreatedOn = DateTime.Now;
                currVisit.VisitType = currVisit.VisitType;
                currVisit.VisitStatus = ENUM_VisitStatus.initiated;// "initiated";
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

                visitDbContext.Visits.Add(currVisit);
                visitDbContext.SaveChanges();
                //currVisit.VisitCode = VisitBL.UpdateVisitCode(currVisit.PatientVisitId, visitDbContext);
                return currVisit;

            }
            catch (Exception ex) { throw ex; }
        }

        //Adding billing for patient Visit
        public BillingTransactionModel AddBillingTransactionForPatientVisit(VisitDbContext
            visitDbContext,
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
                    if (clientTransaction.IsInsuranceBilling == true)
                        clientTransaction.InvoiceCode = "INS";
                    else
                        clientTransaction.InvoiceCode = "BL";
                    clientTransaction.InvoiceNo = BillingBL.GetInvoiceNumber(connString);

                    clientTransaction.CreatedOn = DateTime.Now;
                    clientTransaction.CreatedBy = currentUserId;
                    clientTransaction.PatientId = PatientId;
                    clientTransaction.PatientVisitId = currVisit.PatientVisitId;
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



                        ServiceDepartmentModel srvDept = visitDbContext.ServiceDepartments.Where(s => s.ServiceDepartmentName == txnItem.ServiceDepartmentName).FirstOrDefault();

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
                        VisitBL.UpdateRequisitionItemsBillStatus(visitDbContext, txnItem.ServiceDepartmentName, "paid", currentUserId, txnItem.RequisitionId, DateTime.Now);
                    });
                    if (clientTransaction.IsInsuranceBilling == true)
                    {
                        BillingBL.UpdateInsuranceCurrentBalance(connString,
                            clientTransaction.PatientId,
                            clientTransaction.InsuranceProviderId ?? default(int),
                            currentUserId, clientTransaction.TotalAmount ?? default(int), true);

                    }
                    visitDbContext.AuditDisabled = false;
                    visitDbContext.BillingTransactions.Add(clientTransaction);
                    visitDbContext.SaveChanges();
                    //Yubraj: 28th June '19 //to get Billing UserName 
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                    visitDbContext.AddAuditCustomField("ChangedByUserId", currentUser.EmployeeId);
                    visitDbContext.AddAuditCustomField("ChangedByUserName", currentUser.UserName);
                    clientTransaction.BillingUserName = currentUser.UserName;

                    visitDbContext.AuditDisabled = true;

                    //sync transcation data to IRD or any other remote server.
                    if (realTimeRemoteSyncEnabled)
                    {
                        //passing null from here as we don't want to creat another billingdb context inside of it..
                        //this will be handled inside BillingBL's function. 
                        DanpheEMR.Controllers.VisitBL.SyncBillToRemoteServer(clientTransaction, "sales", visitDbContext);
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

        //sud: 26June'19-- for followup visit. 
        private QuickVisitVM PaidFollowupVisitTransaction(string strLocal)
        {
            DanpheHTTPResponse<QuickVisitVM> responseData = new DanpheHTTPResponse<QuickVisitVM>();
            QuickVisitVM quickVisit = null;
            try
            {
                VisitDbContext visitDbContext = new VisitDbContext(base.connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                quickVisit = DanpheJSONConvert.DeserializeObject<QuickVisitVM>(strLocal);


                //check for clashing visit
                if (VisitBL.HasDuplicateVisitWithSameProvider(visitDbContext, quickVisit.Visit.PatientId, quickVisit.Visit.ProviderId, quickVisit.Visit.VisitDate))
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = "Patient already has visit with this provider today.";
                }
                else
                {
                    using (var visitDbTransaction = visitDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            //quickVisit.Patient = AddPatientForVisit(visitDbContext, quickVisit.Patient, currentUser.EmployeeId);

                            quickVisit.Visit = AddVisit(visitDbContext, quickVisit.Visit.PatientId, quickVisit.Visit, quickVisit.BillingTransaction, currentUser.EmployeeId);

                            quickVisit.BillingTransaction = AddBillingTransactionForPatientVisit(visitDbContext,
                                quickVisit.BillingTransaction,
                                quickVisit.Visit.PatientId,
                                 quickVisit.Visit,
                                currentUser.EmployeeId);
                            //if (quickVisit.Visit.AppointmentType.ToLower() == "transfer" || quickVisit.Visit.AppointmentType.ToLower() == "referral" || quickVisit.Visit.AppointmentType.ToLower() == "followup")
                            if (quickVisit.Visit.AppointmentType.ToLower() == ENUM_AppointmentType.transfer.ToLower()
                                || quickVisit.Visit.AppointmentType.ToLower() == ENUM_AppointmentType.referral.ToLower()
                                || quickVisit.Visit.AppointmentType.ToLower() == ENUM_AppointmentType.followup.ToLower())

                            {
                                UpdateIsContinuedStatus(quickVisit.Visit.ParentVisitId, quickVisit.Visit.AppointmentType, true, currentUser.EmployeeId, visitDbContext);
                            }
                            visitDbTransaction.Commit();

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




    }

}
