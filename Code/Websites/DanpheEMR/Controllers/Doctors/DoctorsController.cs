using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using DbFunctions = System.Data.Entity.DbFunctions;
// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860
//this is the cotroller
namespace DanpheEMR.Controllers
{

    [RequestFormSizeLimit(valueCountLimit: 100000, Order = 1)]
    [Route("api/[controller]")]
    public class DoctorsController : CommonController
    {

        private readonly DoctorsDbContext _doctorDbContext;
        private readonly PatientDbContext _patientDbContext;
        private readonly AdmissionDbContext _admissionDbContext;
        private readonly BillingDbContext _billingDbContext;
        private readonly VisitDbContext _visitDbContext;
        private readonly MasterDbContext _masterDbContext;
        private readonly PharmacyDbContext _pharmacyDbContext;



        public DoctorsController(IOptions<MyConfiguration> _config) : base(_config)
        {
            _doctorDbContext = new DoctorsDbContext(connString);
            _patientDbContext = new PatientDbContext(connString);
            _admissionDbContext = new AdmissionDbContext(connString);
            _billingDbContext = new BillingDbContext(base.connString);
            _visitDbContext = new VisitDbContext(base.connString);
            _masterDbContext = new MasterDbContext(connString);
            _pharmacyDbContext = new PharmacyDbContext(connString);
        }


        [HttpGet]
        [Route("PatientOverview")]
        public IActionResult PatientOverview(int patientId, int patientVisitId)
        {
            //if (reqType == "patientOverview" && patientId != 0)
            Func<object> func = () => GetatientOverview(patientId, patientVisitId);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("OtherRequestsOfPatient")]
        public IActionResult OtherRequestsOfPatient(int patientId, int patientVisitId)
        {
            //if (reqType == "otherRequestsOfPatient")

            //Func<object> func = () => (from billItemRequisition in _billingDbContext.BillItemRequisitions
            //                           where (billItemRequisition.PatientId == patientId
            //                           && billItemRequisition.PatientVisitId == patientVisitId
            //                           && (billItemRequisition.DepartmentName.ToLower() != "lab" && billItemRequisition.DepartmentName.ToLower() != "radiology"))
            //                           select billItemRequisition
            //                    ).ToList();
            Func<object> func = () => (from txnItms in _billingDbContext.BillingTransactionItems
                                       join servDep in _billingDbContext.ServiceDepartment on txnItms.ServiceDepartmentId equals servDep.ServiceDepartmentId
                                       where txnItms.BillStatus == ENUM_BillingStatus.provisional && txnItms.PatientId == patientId && txnItms.PatientVisitId == patientVisitId
                                       && (String.IsNullOrEmpty(servDep.IntegrationName) ? "" : servDep.IntegrationName.ToLower()) != ENUM_IntegrationNames.LAB.ToLower()
                                       && (String.IsNullOrEmpty(servDep.IntegrationName) ? "" : servDep.IntegrationName.ToLower()) != ENUM_IntegrationNames.Radiology.ToLower()
                                       select txnItms).ToList();


            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("TodaysVisits")]
        public IActionResult TodaysVisitList(DateTime toDate, string status)
        {
            //if (reqType == "providertodaysvisit")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => GetTodaysVisitList(toDate, status, currentUser);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("PastVisits")]
        public IActionResult PastVisits(DateTime fromDate, DateTime toDate)
        {
            //if (reqType == "providerpastvisits")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => GetPastVisitList(fromDate, toDate, currentUser);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("DepartmentVisits")]
        public IActionResult DoctorDepartmentVisit(DateTime fromDate, DateTime toDate)
        {
            //if (reqType == "providerDeptVisits")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => GetDoctorDepartmentVisit(fromDate, toDate, currentUser);
            return InvokeHttpGetFunction(func);
        }


        [HttpGet]
        [Route("EmployeeDepartment")]
        public IActionResult DepartmentByEmployeeId(int employeeId)
        {
            // if (reqType == "departmentByEmployeeId")
            Func<object> func = () => GetDepartmentByEmployeeId(employeeId);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("PatientVisitTypes")]
        public IActionResult PatientVisitType()
        {
            //if (reqType == " if (reqType == "patientVisitType")") 
            Func<object> func = () => (from type in _doctorDbContext.Visits group type by type.VisitType into x select x.Select(a => a.VisitType).Distinct().ToList());

            return InvokeHttpGetFunction(func);
        }



        //[HttpGet]
        //public string Get(string reqType, string status, int patientId, int patientVisitId, DateTime? fromDate,
        //    DateTime? toDate, int employeeId)
        //{
        //    DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        //    try
        //    {
        //        responseData.Status = "OK";
        //        DoctorsDbContext dbContext = new DoctorsDbContext(connString);


        //if (reqType == "patientOverview" && patientId != 0)
        //{
        //    PatientModel patientModel = new PatientModel();
        //    PatientDbContext patDbContext = new PatientDbContext(connString);
        //    AdmissionDbContext admDbContext = new AdmissionDbContext(connString);

        //    patientModel = (from pat in patDbContext.Patients
        //                    where pat.PatientId == patientId
        //                    select pat).Include(a => a.Visits.Select(v => v.Vitals))
        //                     .Include(a => a.Problems)
        //                     .Include(a => a.Allergies)
        //                     .Include(a => a.Addresses)
        //                     .Include(a => a.LabRequisitions)
        //                     .Include(a => a.UploadedFiles)
        //                     //.Include(a => a.ImagingReports)
        //                     .Include(a => a.ImagingItemRequisitions)
        //                     .Include(a => a.MedicationPrescriptions)
        //                     .FirstOrDefault<PatientModel>();

        //    //this will remove all other orders from past and only orders which matches visit-id will be shown (lab order / imaging order)
        //    if (patientModel != null && patientModel.Visits != null && patientModel.Visits.Count > 0)
        //    {
        //        patientModel.LabRequisitions = patientModel.LabRequisitions.Where(a => a.PatientVisitId == patientVisitId && a.BillingStatus != "returned" && a.BillingStatus != "cancel").ToList();
        //        patientModel.ImagingItemRequisitions = patientModel.ImagingItemRequisitions.Where(a => a.PatientVisitId == patientVisitId && a.BillingStatus != "returned" && a.BillingStatus != "cancel").ToList();
        //    }

        //    //add vitals to patient
        //    if (patientModel != null && patientModel.Visits != null && patientModel.Visits.Count > 0)
        //    {
        //        patientModel.Vitals = patientModel.Visits.SelectMany(a => a.Vitals).ToList();
        //        //take last three vitals only.. 
        //        patientModel.Vitals = patientModel.Vitals.OrderByDescending(a => a.CreatedOn).Take(3).ToList();

        //    }

        //    //add profilePic info to patient                    
        //    if (patientModel != null && patientModel.UploadedFiles != null && patientModel.PatientId == patientId)
        //    {
        //        var location = (from dbc in patDbContext.CFGParameters
        //                        where dbc.ParameterGroupName.ToLower() == "patient" && dbc.ParameterName == "PatientProfilePicImageUploadLocation"
        //                        select dbc.ParameterValue
        //                ).FirstOrDefault();

        //        patientModel.ProfilePic = (from p in patientModel.UploadedFiles
        //                                   where p.IsActive == true && p.FileType == "profile-pic"
        //                                   select p).FirstOrDefault();



        //        if (patientModel.ProfilePic != null)
        //        {
        //            var fullPath = location + patientModel.ProfilePic.FileName;
        //            byte[] imageArray = System.IO.File.ReadAllBytes(fullPath);
        //            patientModel.ProfilePic.FileBase64String = Convert.ToBase64String(imageArray);
        //            //patientModel.ProfilePic.FileBase64String = Convert.ToBase64String(patientModel.ProfilePic.FileBinaryData);
        //        }

        //    }

        //    //remove resolved problems
        //    if (patientModel != null && patientModel.Problems != null && patientModel.Problems.Count > 0)
        //    {
        //        patientModel.Problems = patientModel.Problems.Where(p => p.IsResolved == false).ToList();
        //    }

        //    MasterDbContext masterDbContext = new MasterDbContext(connString);
        //    PharmacyDbContext phrmDbContext = new PharmacyDbContext(connString);

        //    if (patientModel.CountrySubDivisionId != 0)
        //    {
        //        var subDiv = (from subdiv in masterDbContext.CountrySubDivision
        //                      where subdiv.CountrySubDivisionId == patientModel.CountrySubDivisionId
        //                      select subdiv.CountrySubDivisionName
        //                      ).FirstOrDefault();

        //        patientModel.CountrySubDivisionName = subDiv;
        //    }

        //    //add medication prescription if any.
        //    //need to get it as pharmacy model later on, now we're mapping this as MedicationPrescription model only.
        //    if (patientModel != null)
        //    {
        //        var patPrescriptions = phrmDbContext.PHRMPrescriptionItems.Where(p => p.PatientId == patientModel.PatientId).ToList();
        //        if (patPrescriptions != null && patPrescriptions.Count > 0)
        //        {
        //            var allItems = phrmDbContext.PHRMItemMaster.ToList();
        //            var presItems = (from pres in patPrescriptions
        //                             join itm in allItems
        //                             on pres.ItemId equals itm.ItemId
        //                             select new MedicationPrescriptionModel()
        //                             {
        //                                 MedicationId = itm.ItemId,
        //                                 MedicationName = itm.ItemName,
        //                                 Frequency = pres.Frequency.HasValue ? pres.Frequency.Value.ToString() : "",
        //                                 Duration = pres.HowManyDays.Value,
        //                                 CreatedOn = pres.CreatedOn
        //                             }).ToList();

        //            patientModel.MedicationPrescriptions = presItems;
        //        }


        //        //var presc = patPrescriptions[0];


        //    }

        //    //this is for getting current patients admission details (for current visit)
        //    var bedInfo = (from txn in admDbContext.PatientBedInfos
        //                   join bed in admDbContext.Beds on txn.BedId equals bed.BedId
        //                   join ward in admDbContext.Wards on txn.WardId equals ward.WardId
        //                   where txn.PatientId == patientId && txn.PatientVisitId == patientVisitId && txn.EndedOn == null
        //                   select new
        //                   {
        //                       bed.BedNumber,
        //                       ward.WardName
        //                   }).FirstOrDefault();

        //    if (bedInfo != null)
        //    {
        //        patientModel.BedNo = bedInfo.BedNumber;
        //        patientModel.WardName = bedInfo.WardName;
        //    }

        //    ////we're taking allergen from generic list: sud-15Jun'18
        //    //List<PHRMGenericModel> genericList = phrmDbContext.PHRMGenericModel.ToList();
        //    ////add name to allergies
        //    //if (patientModel != null && patientModel.Allergies != null && patientModel.Allergies.Count > 0)
        //    //{
        //    //    foreach (var allergy in patientModel.Allergies)
        //    //    {
        //    //        if (allergy.AllergenAdvRecId != 0 && allergy.AllergenAdvRecId != null)
        //    //        {
        //    //            allergy.AllergenAdvRecName = genericList.Where(a => a.GenericId == allergy.AllergenAdvRecId)
        //    //                                         .FirstOrDefault().GenericName;
        //    //        }
        //    //        if (allergy.AllergyType == "Others") {
        //    //            allergy.AllergenAdvRecName = allergy.Others;
        //    //        }

        //    //    }
        //    //}

        //    responseData.Results = patientModel;
        //}
        //else 

        //if (reqType == "otherRequestsOfPatient")
        //{
        //    BillingDbContext billingDbContext = new BillingDbContext(base.connString);
        //    var itemList = (from billItemRequisition in billingDbContext.BillItemRequisitions
        //                    where (billItemRequisition.PatientId == patientId
        //                    && billItemRequisition.PatientVisitId == patientVisitId
        //                    && (billItemRequisition.DepartmentName.ToLower() != "lab" && billItemRequisition.DepartmentName.ToLower() != "radiology"))
        //                    select billItemRequisition
        //                    ).ToList();

        //    responseData.Status = "OK";
        //    responseData.Results = itemList;
        //}

        //else

        //if (reqType == "providertodaysvisit")
        //{
        //    if (toDate == null)
        //    {
        //        RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
        //        int providerId = currentUser.EmployeeId;//check if we've to pass userid or employeeid--sudarshan 15mar'17
        //        var today = DateTime.Today;
        //        //show only today's visits for the provider.. and if the visittype is inpatient then  the addmission status shouled be admitted ..Dharam 9th Sept 2017..
        //        var visitList = (from visit in dbContext.Visits.Include("Admission").Include("Patient")
        //                         where visit.VisitStatus == status
        //                         && (DbFunctions.TruncateTime(visit.VisitDate) == DbFunctions.TruncateTime(today) || visit.Admission.AdmissionStatus == "admitted")
        //                         && visit.PerformerId == providerId && visit.BillingStatus != ENUM_BillingStatus.returned // "returned"
        //                         select visit).ToList()
        //                       .OrderBy(v => v.VisitDate).ThenBy(v => v.VisitTime).ToList();
        //        responseData.Results = visitList;
        //    }
        //    else // visit records according to selected Date
        //    {
        //        RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
        //        int providerId = currentUser.EmployeeId;//check if we've to pass userid or employeeid--sudarshan 15mar'17
        //        //var departmentId = dbContext.Employees.Where(a => a.EmployeeId == providerId).Select(a => a).FirstOrDefault();
        //        //show only today's visits for the provider.. and if the visittype is inpatient then  the addmission status shouled be admitted ..Dharam 9th Sept 2017..
        //        var visitList = (from visit in dbContext.Visits.Include("Admission").Include("Patient")
        //                         where DbFunctions.TruncateTime(visit.VisitDate) == DbFunctions.TruncateTime(toDate) && // visit.VisitStatus == status &&
        //                       (DbFunctions.TruncateTime(visit.VisitDate) == DbFunctions.TruncateTime(toDate) || visit.Admission.AdmissionStatus == "admitted")
        //                          && visit.BillingStatus != ENUM_BillingStatus.returned // "returned"
        //                         select visit).ToList()
        //                        .OrderBy(v => v.VisitDate).ThenBy(v => v.VisitTime).ToList().GroupBy(a => a.PerformerName)
        //                        .Select(v => new { ProviderName = v.Select(p => p.PerformerName).FirstOrDefault(), visit = v }).ToList();

        //        responseData.Results = visitList;
        //    }
        //}
        ////get all the past visits of the provider
        //else 

        //if (reqType == "providerpastvisits")
        //{
        //    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
        //    int providerId = currentUser.EmployeeId;//check if we've to pass userid or employeeid--sudarshan 15mar'17
        //    //var departmentId = dbContext.Employees.Where(a => a.EmployeeId == providerId).Select(a => a).FirstOrDefault();
        //    //gets all visits earlier than today for this provider.. and if the visittype is inpatient then  the addmission status shouled be discharged ..Dharam 9th Sept 2017..
        //    var visitList = (from visit in dbContext.Visits.Include("Admission").Include("Patient")
        //                     //where visit.DepartmentId == departmentId.DepartmentId
        //                     //Performer can view all department's patients.
        //                     //&& (visit.Admission == null || visit.Admission.AdmissionStatus == "discharged")
        //                     select visit).ToList()
        //                 .Where(v => v.VisitDate.Date >= fromDate && v.VisitDate <= toDate && v.BillingStatus != ENUM_BillingStatus.returned ) //"returned")
        //                 .OrderByDescending(v => v.VisitDate).ThenByDescending(v => v.VisitTime).ToList();
        //    responseData.Results = visitList;
        //}

        //else

        //if (reqType == "providerDeptVisits")
        //{
        //    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
        //    int performerId = currentUser.EmployeeId;
        //    MasterDbContext mstDbContext = new MasterDbContext(base.connString);
        //    int? DeptId = (from emp in mstDbContext.Employees
        //                   where emp.EmployeeId == performerId
        //                   select emp.DepartmentId).FirstOrDefault();
        //    var empList = mstDbContext.Employees.ToList();
        //    var visits = (from visit in dbContext.Visits.Include("Admission").Include("Patient")
        //                  where visit.PerformerId != performerId
        //                  //&& (visit.Admission == null || visit.Admission.AdmissionStatus == "discharged")
        //                  select visit).ToList()
        //                 .Where(v => v.VisitDate.Date >= fromDate && v.VisitDate <= toDate)
        //                 .OrderByDescending(v => v.VisitDate).ThenByDescending(v => v.VisitTime).ToList();

        //    List<VisitModel> visitLists = (from v in visits
        //                                   join e in empList on v.PerformerId equals e.EmployeeId
        //                                   where e.DepartmentId == DeptId
        //                                   select v).ToList();
        //    responseData.Results = visitLists;
        //}
        //else

        //if (reqType == "departmentByEmployeeId")
        //{
        //    var depid = dbContext.Employees.Where(a => a.EmployeeId == employeeId).Select(a => a.DepartmentId).FirstOrDefault();
        //    var department = dbContext.Departments.Where(a => a.DepartmentId == depid).Select(a => a.DepartmentName).FirstOrDefault();
        //    var deptDoctors = dbContext.Employees.Where(a => a.DepartmentId == depid && a.Salutation == "Dr")
        //        .Select(a => new
        //        {
        //            a.DepartmentId,
        //            a.EmployeeId,
        //            ProviderName = a.Salutation + ". " + a.FirstName + " " + (string.IsNullOrEmpty(a.MiddleName) ? " " : a.MiddleName + " ") + a.LastName
        //        }).ToList();
        //    responseData.Results = new
        //    {
        //        DepartmentId = depid,
        //        DepartmentName = department,
        //        Providers = deptDoctors
        //    };
        //}
        //else 

        //        if (reqType == "patientVisitType")
        //        {
        //            var result = (from type in dbContext.Visits group type by type.VisitType into x select x.Select(a => a.VisitType).Distinct().ToList());
        //            responseData.Results = result;
        //        }

        //        else
        //        {
        //            responseData.Status = "OK";
        //            //responseData.ErrorMessage = " ";
        //        }

        //    }
        //    catch (Exception ex)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
        //    }

        //    return DanpheJSONConvert.SerializeObject(responseData, true);


        //}


        [HttpPost]
        [Route("ConcludeVisit")]
        public IActionResult ConcludeVisit()
        {
            // if (reqType == "concludeVisit")
            String ipDataStr = this.ReadPostData();
            Func<object> func = () => PostConcludeVisit(ipDataStr);
            return InvokeHttpPostFunction(func);
        }




        //[HttpPost]
        //public string Post()
        //{
        //    DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        //    try
        //    {
        //        VisitDbContext dbContext = new VisitDbContext(base.connString);
        //        string str = this.ReadPostData();
        //        string reqType = this.ReadQueryStringData("reqType");

        //if (reqType == "concludeVisit")
        //{
        //    var visitid = DanpheJSONConvert.DeserializeObject<int>(str);
        //    var visit = dbContext.Visits.Where(v => v.PatientVisitId == visitid).Select(p => p).FirstOrDefault();
        //    visit.ConcludeDate = System.DateTime.Now;
        //    dbContext.Visits.Attach(visit);
        //    dbContext.Entry(visit).Property(a => a.ConcludeDate).IsModified = true;
        //    dbContext.SaveChanges();

        //    responseData.Status = "OK";
        //}
        //    }
        //    catch (Exception ex)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = "Error " + ex.Message;
        //    }
        //    return DanpheJSONConvert.SerializeObject(responseData, true);
        //}

        // PUT api/values/


        [HttpPut]
        [Route("ReassignProvider")]
        public IActionResult ReassignProvider()
        {
            // if (reqType == "reassignProvider")
            String ipDataStr = this.ReadPostData();
            Func<object> func = () => PutReassignProvider(ipDataStr);
            return InvokeHttpPutFunction(func);
        }


        [HttpPut]
        [Route("ChangeProvider")]
        public IActionResult ChangeProvider()
        {
            //if (reqType == "changeProvider")
            String ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdateProvider(ipDataStr);
            return InvokeHttpPutFunction(func);
        }

        //[HttpPut]
        //public string Put()
        //{
        //    DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        //    try
        //    {
        //        VisitDbContext dbContext = new VisitDbContext(base.connString);
        //        string str = this.ReadPostData();
        //        string reqType = this.ReadQueryStringData("reqType");
        //string billingStatus = this.ReadQueryStringData("billingStatus");
        //int patientVisitId = ToInt(this.ReadQueryStringData("billingStatus"));
        //  bool continuedVisitStatus = ToBool(this.ReadQueryStringData("continuedVisitStatus"));

        //if (reqType == "reassignProvider")
        //{
        //    VisitModel visitData = DanpheJSONConvert.DeserializeObject<VisitModel>(str);
        //    visitData.ModifiedOn = System.DateTime.Now;
        //    visitData.PerformerName = GetProviderName(visitData.PerformerId);

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
        //else
        //if (reqType == "changeProvider")
        //{
        //    VisitModel data = DanpheJSONConvert.DeserializeObject<VisitModel>(str);
        //    var visit = dbContext.Visits.Where(v => v.PatientVisitId == data.PatientVisitId).Select(p => p).FirstOrDefault();
        //    visit.ModifiedBy = data.ModifiedBy;
        //    visit.ModifiedOn = System.DateTime.Now;
        //    visit.PerformerName = GetProviderName(data.PerformerId);
        //    visit.PerformerId = data.PerformerId;
        //    visit.Remarks = string.IsNullOrEmpty(visit.Remarks) ? data.Remarks : (visit.Remarks + data.Remarks);

        //    dbContext.Visits.Attach(visit);
        //    dbContext.Entry(visit).Property(a => a.ModifiedBy).IsModified = true;
        //    dbContext.Entry(visit).Property(a => a.ModifiedOn).IsModified = true;
        //    dbContext.Entry(visit).Property(a => a.PerformerName).IsModified = true;
        //    dbContext.Entry(visit).Property(a => a.PerformerId).IsModified = true;
        //    dbContext.Entry(visit).Property(a => a.Remarks).IsModified = true;

        //    dbContext.SaveChanges();


        //    responseData.Status = "OK";
        //    responseData.Results = visit.PerformerName;
        //}
        //    }
        //    catch (Exception ex)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
        //    }
        //    return DanpheJSONConvert.SerializeObject(responseData, true);
        //}

        // DELETE api/values/5
        //[HttpDelete("{id}")]
        //public void Delete(int id)
        //{
        //}

        //get provider name from providerId
        private string GetProviderName(int? providerId)
        {
            EmployeeModel Provider = (from emp in _masterDbContext.Employees
                                      where emp.EmployeeId == providerId
                                      select emp).FirstOrDefault();
            //obj.ProviderName = Provider.Salutation + "." + Provider.FirstName + "." + Provider.LastName + "(" + Provider.Designation + ")";
            return Provider.FullName;
        }
        private object GetatientOverview(int patientId, int patientVisitId)
        {

            PatientModel patientModel = new PatientModel();

            patientModel = (from pat in _patientDbContext.Patients
                            where pat.PatientId == patientId
                            select pat).Include(a => a.Visits.Select(v => v.Vitals))
                             .Include(a => a.Problems)
                             .Include(a => a.Allergies)
                             .Include(a => a.Addresses)
                             .Include(a => a.LabRequisitions)
                             .Include(a => a.UploadedFiles)
                             //.Include(a => a.ImagingReports)
                             .Include(a => a.ImagingItemRequisitions)
                             .Include(a => a.MedicationPrescriptions)
                             .FirstOrDefault<PatientModel>();

            //this will remove all other orders from past and only orders which matches visit-id will be shown (lab order / imaging order)
            if (patientModel != null && patientModel.Visits != null && patientModel.Visits.Count > 0)
            {
                patientModel.LabRequisitions = patientModel.LabRequisitions.Where(a => a.PatientVisitId == patientVisitId && a.BillingStatus != "returned" && a.BillingStatus != "cancel").ToList();
                patientModel.ImagingItemRequisitions = patientModel.ImagingItemRequisitions.Where(a => a.PatientVisitId == patientVisitId && a.BillingStatus != "returned" && a.BillingStatus != "cancel").ToList();
            }

            //add vitals to patient
            if (patientModel != null && patientModel.Visits != null && patientModel.Visits.Count > 0)
            {
                patientModel.Vitals = patientModel.Visits.SelectMany(a => a.Vitals).ToList();
                //take last three vitals only.. 
                patientModel.Vitals = patientModel.Vitals.OrderByDescending(a => a.CreatedOn).Take(3).ToList();
            }
            //add profilePic info to patient                    
            if (patientModel != null && patientModel.UploadedFiles != null && patientModel.PatientId == patientId)
            {
                var location = (from dbc in _patientDbContext.CFGParameters
                                where dbc.ParameterGroupName.ToLower() == "patient" && dbc.ParameterName == "PatientProfilePicImageUploadLocation"
                                select dbc.ParameterValue
                        ).FirstOrDefault();

                patientModel.ProfilePic = (from p in patientModel.UploadedFiles
                                           where p.IsActive == true && p.FileType == "profile-pic"
                                           select p).FirstOrDefault();
                if (patientModel.ProfilePic != null)
                {
                    var fullPath = location + patientModel.ProfilePic.FileName;
                    byte[] imageArray = System.IO.File.ReadAllBytes(fullPath);
                    patientModel.ProfilePic.FileBase64String = Convert.ToBase64String(imageArray);
                    //patientModel.ProfilePic.FileBase64String = Convert.ToBase64String(patientModel.ProfilePic.FileBinaryData);
                }
            }
            //remove resolved problems
            if (patientModel != null && patientModel.Problems != null && patientModel.Problems.Count > 0)
            {
                patientModel.Problems = patientModel.Problems.Where(p => p.IsResolved == false).ToList();
            }

            if (patientModel.CountrySubDivisionId != 0)
            {
                var subDiv = (from subdiv in _masterDbContext.CountrySubDivision
                              where subdiv.CountrySubDivisionId == patientModel.CountrySubDivisionId
                              select subdiv.CountrySubDivisionName
                              ).FirstOrDefault();

                patientModel.CountrySubDivisionName = subDiv;
            }

            //add medication prescription if any.
            //need to get it as pharmacy model later on, now we're mapping this as MedicationPrescription model only.
            if (patientModel != null)
            {
                var patPrescriptions = _pharmacyDbContext.PHRMPrescriptionItems.Where(p => p.PatientId == patientModel.PatientId).ToList();
                if (patPrescriptions != null && patPrescriptions.Count > 0)
                {
                    var allItems = _pharmacyDbContext.PHRMItemMaster.ToList();
                    var presItems = (from pres in patPrescriptions
                                     join itm in allItems
                                     on pres.ItemId equals itm.ItemId
                                     select new MedicationPrescriptionModel()
                                     {
                                         MedicationId = itm.ItemId,
                                         MedicationName = itm.ItemName,
                                         Dose = pres.Dosage,
                                         Frequency = pres.Frequency.HasValue ? pres.Frequency.Value.ToString() : "",
                                         Duration = pres.HowManyDays.Value,
                                         CreatedOn = pres.CreatedOn
                                     }).ToList();

                    patientModel.MedicationPrescriptions = presItems;
                }
                //var presc = patPrescriptions[0];
            }
            //this is for getting current patients admission details (for current visit)
            var bedInfo = (from txn in _admissionDbContext.PatientBedInfos
                           join bed in _admissionDbContext.Beds on txn.BedId equals bed.BedId
                           join ward in _admissionDbContext.Wards on txn.WardId equals ward.WardId
                           where txn.PatientId == patientId && txn.PatientVisitId == patientVisitId && txn.EndedOn == null
                           select new
                           {
                               bed.BedNumber,
                               ward.WardName,
                               bed.BedId
                           }).FirstOrDefault();
            if (bedInfo != null)
            {
                patientModel.BedNo = bedInfo.BedNumber;
                patientModel.WardName = bedInfo.WardName;
                patientModel.BedId = bedInfo.BedId;
            }
            return patientModel;
        }
        private object GetTodaysVisitList(DateTime toDate, string status, RbacUser currentUser)
        {

            if (toDate == null)
            {
                int providerId = currentUser.EmployeeId;//check if we've to pass userid or employeeid--sudarshan 15mar'17
                var today = DateTime.Today;
                //show only today's visits for the provider.. and if the visittype is inpatient then  the addmission status shouled be admitted ..Dharam 9th Sept 2017..
                var visitList = (from visit in _doctorDbContext.Visits.Include("Admission").Include("Patient")
                                 where visit.VisitStatus == status
                                 && (DbFunctions.TruncateTime(visit.VisitDate) == DbFunctions.TruncateTime(today) || visit.Admission.AdmissionStatus == "admitted")
                                 && visit.PerformerId == providerId && visit.BillingStatus != ENUM_BillingStatus.returned // "returned"
                                 select visit).ToList()
                               .OrderBy(v => v.VisitDate).ThenBy(v => v.VisitTime).ToList();
                return visitList;
            }
            else // visit records according to selected Date
            {
                int providerId = currentUser.EmployeeId;//check if we've to pass userid or employeeid--sudarshan 15mar'17
                                                        //var departmentId = dbContext.Employees.Where(a => a.EmployeeId == providerId).Select(a => a).FirstOrDefault();
                                                        //show only today's visits for the provider.. and if the visittype is inpatient then  the addmission status shouled be admitted ..Dharam 9th Sept 2017..
                var visitList = (from visit in _doctorDbContext.Visits.Include("Admission").Include("Patient")
                                 where DbFunctions.TruncateTime(visit.VisitDate) == DbFunctions.TruncateTime(toDate) && // visit.VisitStatus == status &&
                               (DbFunctions.TruncateTime(visit.VisitDate) == DbFunctions.TruncateTime(toDate) || visit.Admission.AdmissionStatus == "admitted")
                                  && visit.BillingStatus != ENUM_BillingStatus.returned // "returned"
                                 select visit).ToList()
                                .OrderBy(v => v.VisitDate).ThenBy(v => v.VisitTime).ToList().GroupBy(a => a.PerformerName)
                                .Select(v => new { ProviderName = v.Select(p => p.PerformerName).FirstOrDefault(), visit = v }).ToList();

                return visitList;
            }

        }
        private object GetPastVisitList(DateTime fromDate, DateTime toDate, RbacUser currentUser)
        {

            int providerId = currentUser.EmployeeId;//check if we've to pass userid or employeeid--sudarshan 15mar'17
                                                    //var departmentId = dbContext.Employees.Where(a => a.EmployeeId == providerId).Select(a => a).FirstOrDefault();
                                                    //gets all visits earlier than today for this provider.. and if the visittype is inpatient then  the addmission status shouled be discharged ..Dharam 9th Sept 2017..
            var visitList = (from visit in _doctorDbContext.Visits.Include("Admission").Include("Patient")
                                 //where visit.DepartmentId == departmentId.DepartmentId
                                 //Performer can view all department's patients.
                                 //&& (visit.Admission == null || visit.Admission.AdmissionStatus == "discharged")
                             select visit).ToList()
                         .Where(v => v.VisitDate.Date >= fromDate && v.VisitDate <= toDate && v.BillingStatus != ENUM_BillingStatus.returned) //"returned")
                         .OrderByDescending(v => v.VisitDate).ThenByDescending(v => v.VisitTime).ToList();
            return visitList;

        }
        private object GetDoctorDepartmentVisit(DateTime fromDate, DateTime toDate, RbacUser currentUser)
        {

            int performerId = currentUser.EmployeeId;
            int? DeptId = (from emp in _masterDbContext.Employees
                           where emp.EmployeeId == performerId
                           select emp.DepartmentId).FirstOrDefault();
            var empList = _masterDbContext.Employees.ToList();
            var visits = (from visit in _doctorDbContext.Visits.Include("Admission").Include("Patient")
                          where visit.PerformerId != performerId
                          //&& (visit.Admission == null || visit.Admission.AdmissionStatus == "discharged")
                          select visit).ToList()
                         .Where(v => v.VisitDate.Date >= fromDate && v.VisitDate <= toDate)
                         .OrderByDescending(v => v.VisitDate).ThenByDescending(v => v.VisitTime).ToList();

            List<VisitModel> visitLists = (from v in visits
                                           join e in empList on v.PerformerId equals e.EmployeeId
                                           where e.DepartmentId == DeptId
                                           select v).ToList();
            return visitLists;
        }
        private object GetDepartmentByEmployeeId(int employeeId)
        {

            var depid = _doctorDbContext.Employees.Where(a => a.EmployeeId == employeeId).Select(a => a.DepartmentId).FirstOrDefault();
            var department = _doctorDbContext.Departments.Where(a => a.DepartmentId == depid).Select(a => a.DepartmentName).FirstOrDefault();
            var deptDoctors = _doctorDbContext.Employees.Where(a => a.DepartmentId == depid && a.Salutation == "Dr")
                .Select(a => new
                {
                    a.DepartmentId,
                    a.EmployeeId,
                    ProviderName = a.Salutation + ". " + a.FirstName + " " + (string.IsNullOrEmpty(a.MiddleName) ? " " : a.MiddleName + " ") + a.LastName
                }).ToList();
            var result = new
            {
                DepartmentId = depid,
                DepartmentName = department,
                Providers = deptDoctors
            };
            return result;

        }
        private object PostConcludeVisit(string ipDataStr)
        {

            var visitid = DanpheJSONConvert.DeserializeObject<int>(ipDataStr);
            var visit = _visitDbContext.Visits.Where(v => v.PatientVisitId == visitid).Select(p => p).FirstOrDefault();
            visit.ConcludeDate = System.DateTime.Now;
            _visitDbContext.Visits.Attach(visit);
            _visitDbContext.Entry(visit).Property(a => a.ConcludeDate).IsModified = true;
            _visitDbContext.SaveChanges();
            return visit;

        }
        private object PutReassignProvider(string ipDataStr)
        {

            VisitModel visitData = DanpheJSONConvert.DeserializeObject<VisitModel>(ipDataStr);
            visitData.ModifiedOn = System.DateTime.Now;
            visitData.PerformerName = GetProviderName(visitData.PerformerId);

            Boolean Flag = false;
            Flag = VisitBL.ReAssignProviderTxn(_visitDbContext, visitData, _billingDbContext);
            if (Flag)
            {
                return Ok();
            }
            else
            {
                // throw new Exception("Failed");
            }
            return Flag;

        }
        private object UpdateProvider(string ipDataStr)
        {


            VisitModel data = DanpheJSONConvert.DeserializeObject<VisitModel>(ipDataStr);
            var visit = _visitDbContext.Visits.Where(v => v.PatientVisitId == data.PatientVisitId).Select(p => p).FirstOrDefault();
            visit.ModifiedBy = data.ModifiedBy;
            visit.ModifiedOn = System.DateTime.Now;
            visit.PerformerName = GetProviderName(data.PerformerId);
            visit.PerformerId = data.PerformerId;
            visit.Remarks = string.IsNullOrEmpty(visit.Remarks) ? data.Remarks : (visit.Remarks + data.Remarks);

            _visitDbContext.Visits.Attach(visit);
            _visitDbContext.Entry(visit).Property(a => a.ModifiedBy).IsModified = true;
            _visitDbContext.Entry(visit).Property(a => a.ModifiedOn).IsModified = true;
            _visitDbContext.Entry(visit).Property(a => a.PerformerName).IsModified = true;
            _visitDbContext.Entry(visit).Property(a => a.PerformerId).IsModified = true;
            _visitDbContext.Entry(visit).Property(a => a.Remarks).IsModified = true;
            _visitDbContext.SaveChanges();
            return visit.PerformerName;

        }


    }
}
