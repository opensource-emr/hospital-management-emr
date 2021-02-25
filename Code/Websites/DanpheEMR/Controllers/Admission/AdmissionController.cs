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
using System.Globalization; //used for converting string to Titlecase i.e first letter capital
using DanpheEMR.Security;
using DanpheEMR.Controllers.Billing;
using System.Net;
using System.Collections.Specialized;
using System.Text;
using System.Xml;

using DanpheEMR.Core;
using DanpheEMR.Core.Parameters;
using System.Threading.Tasks;
using DanpheEMR.Enums;

namespace DanpheEMR.Controllers
{

    public class AdmissionController : CommonController
    {


        double cacheExpMinutes;//= 5;//this should come from configuration later on.

        public AdmissionController(IOptions<MyConfiguration> _config) : base(_config)
        {
            cacheExpMinutes = _config.Value.CacheExpirationMinutes;
        }

        [HttpGet]
        public string Get(string reqType,
            DateTime FromDate, DateTime ToDate,
            int patientId, int patientVisitId,
            string admissionStatus, int wardId, int departmentId,
            int bedFeatureId, int ipVisitId,
            int bedId, string search, string CertificateNumber, int dischargeSummaryId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                AdmissionDbContext dbContext = new AdmissionDbContext(base.connString);
                MasterDbContext masterDbContext = new MasterDbContext(base.connString);


                //Hom 4th Dec, 2018 joined Employee and department table
                if (reqType == "getADTList")
                {
                    //start1: sud:18Feb'20-these fields are implemented from client side, we can remove it after checking the impacts.
                    //RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                    //IEnumerable<RbacPermission> validPermissionList = RBAC.GetUserAllPermissions(currentUser.UserId).Where(x => x.ApplicationId == 9).AsEnumerable();
                    //RbacDbContext rbacDbContext = new RbacDbContext(connString);

                    //var rolePermissionList = rbacDbContext.RolePermissionMaps.Where(x => x.IsActive == true && x.Permission.ApplicationId == 9).AsEnumerable();
                    ////sanjit: Dear developer, if you have to change this code, then do change respectively in Doctor Module's IPD, as it uses the same API.
                    //var employeeslist = dbContext.Employees.Select(a => new
                    //{
                    //    EmployeeId = a.EmployeeId,
                    //    EmployeeName = a.FirstName + " " + a.LastName,
                    //}).ToList().AsEnumerable();

                    //var BtnPermissnList = (from permissionrole in rbacDbContext.RolePermissionMaps
                    //                       join permission in rbacDbContext.Permissions on permissionrole.PermissionId equals permission.PermissionId
                    //                       where permission.ApplicationId == 9 && permissionrole.IsActive == true
                    //                       select new
                    //                       {
                    //                           PermissionId = permission.PermissionId,
                    //                           PermissionName = permission.PermissionName
                    //                       }).ToList().AsEnumerable();
                    //string transferBtn = "";
                    //string stickerBtn = "";
                    //string changeDctBtn = "";
                    //string changeBedBtn = "";
                    //string billHistoryBtn = "";
                    //string cancelAdmBtn = "";
                    //string printWristBtn = "";
                    //string admitBtn = "";
                    //string genericStickerBtn = "";
                    //foreach (var item in BtnPermissnList)
                    //{
                    //    if (item.PermissionName == "transfer-button")
                    //    {
                    //        transferBtn = "transfer-button";
                    //    }
                    //    if (item.PermissionName == "sticker-button")
                    //    {
                    //        stickerBtn = "sticker-button";
                    //    }
                    //    if (item.PermissionName == "change-doctor-button")
                    //    {
                    //        changeDctBtn = "change-doctor-button";
                    //    }
                    //    if (item.PermissionName == "change-bed-feature-button")
                    //    {
                    //        changeBedBtn = "change-bed-feature-button";
                    //    }
                    //    if (item.PermissionName == "bill-history-button")
                    //    {
                    //        billHistoryBtn = "bill-history-button";
                    //    }
                    //    if (item.PermissionName == "cancel-admission-button")
                    //    {
                    //        cancelAdmBtn = "cancel-admission-button";
                    //    }
                    //    if (item.PermissionName == "print-wristband-button")
                    //    {
                    //        printWristBtn = "print-wristband-button";
                    //    }
                    //    if (item.PermissionName == "generic-sticker-button")
                    //    {
                    //        genericStickerBtn = "generic-sticker-button";
                    //    }
                    //    if (item.PermissionName == "admit-button")
                    //    {
                    //        admitBtn = "admit-button";
                    //    }
                    //};
                    //end1: sud:18Feb'20-these fields are implemented from client side, we can remove it after checking the impacts.

                    UpdateNotReceivedTransferredBed(dbContext);

                    var result = (from admission in dbContext.Admissions.Include(a => a.Visit.Patient)
                                  join employee in dbContext.Employees on admission.AdmittingDoctorId equals employee.EmployeeId
                                  join department in dbContext.Department on employee.DepartmentId equals department.DepartmentId
                                  join summary in dbContext.DischargeSummary on admission.PatientVisitId equals summary.PatientVisitId into dischargeSummaryTemp
                                  from dischargeSummary in dischargeSummaryTemp.DefaultIfEmpty()
                                  join admDoctor in dbContext.Employees on admission.AdmittingDoctorId equals admDoctor.EmployeeId
                                  where admission.AdmissionStatus == admissionStatus
                                  select new
                                  {
                                      VisitCode = admission.Visit.VisitCode,
                                      PatientVisitId = admission.Visit.PatientVisitId,
                                      PatientId = admission.Visit.Patient.PatientId,
                                      PatientAdmissionId = admission.PatientAdmissionId,
                                      AdmittedDate = admission.AdmissionDate,
                                      DischargedDate = admission.DischargeDate,
                                      DischargedBy = admission.DischargedBy,
                                      //  DischargedByEmployee = (from emp in employeeslist where emp.EmployeeId == admission.DischargedBy select emp.EmployeeName).ToString().AsEnumerable(),  // employeeslist.Where(a => a.EmployeeId == admission.DischargedBy).Select(a => a.EmployeeName).AsEnumerable().ToString(),
                                      //AdmissionNotes = admission.AdmissionNotes,
                                      PatientCode = admission.Visit.Patient.PatientCode,
                                      AdmittingDoctorId = admission.AdmittingDoctorId,
                                      AdmittingDoctorName = admDoctor.Salutation + ". " + admDoctor.FirstName + " " + (string.IsNullOrEmpty(admDoctor.MiddleName) ? "" : admDoctor.MiddleName + " ") + admDoctor.LastName,
                                      Address = admission.Visit.Patient.Address,
                                      AdmissionStatus = admission.AdmissionStatus,
                                      BillStatusOnDischarge = admission.BillStatusOnDischarge,
                                      //use ShortName instead of this when possible
                                      Name = admission.Visit.Patient.FirstName + " " + (string.IsNullOrEmpty(admission.Visit.Patient.MiddleName) ? "" : admission.Visit.Patient.MiddleName + " ") + admission.Visit.Patient.LastName,
                                      DateOfBirth = admission.Visit.Patient.DateOfBirth,
                                      PhoneNumber = admission.Visit.Patient.PhoneNumber,
                                      Gender = admission.Visit.Patient.Gender,
                                      IsSubmitted = dischargeSummary.IsSubmitted,
                                      DischargeSummaryId = dischargeSummary != null ? dischargeSummary.DischargeSummaryId : 0,
                                      DepartmentId = department.DepartmentId,
                                      Department = department.DepartmentName,
                                      GuardianName = admission.CareOfPersonName,
                                      GuardianRelation = admission.CareOfPersonRelation,
                                      IsPoliceCase = admission.IsPoliceCase.HasValue ? admission.IsPoliceCase :false,
                                      BedInformation = (from bedInfos in dbContext.PatientBedInfos
                                                        where bedInfos.PatientVisitId == admission.Visit.PatientVisitId
                                                        && bedInfos.IsActive == true
                                                        select new
                                                        {
                                                            BedId = bedInfos.BedId,
                                                            PatientBedInfoId = bedInfos.PatientBedInfoId,
                                                            WardId = bedInfos.WardId,
                                                            Ward = bedInfos.Ward.WardName,
                                                            BedFeatureId = bedInfos.BedFeatureId,
                                                            Action = bedInfos.Action.Substring(0, 1).ToUpper() + bedInfos.Action.Substring(1),
                                                            BedFeature = bedInfos.BedFeature.BedFeatureName,
                                                            BedCode = bedInfos.Bed.BedCode,
                                                            BedNumber = bedInfos.Bed.BedNumber,
                                                            StartedOn = bedInfos.StartedOn,
                                                            BedOnHoldEnabled = bedInfos.BedOnHoldEnabled,
                                                            ReceivedBy = bedInfos.ReceivedBy
                                                        }).OrderByDescending(a => a.PatientBedInfoId).FirstOrDefault(),
                                      //start2: sud:18Feb'20-these fields are implemented from client side, we can remove it after checking the impacts.
                                      //TransferButton = transferBtn,
                                      //StickerButton = stickerBtn,
                                      //ChangeDoctorButton = changeDctBtn,
                                      //ChangeBedButton = changeBedBtn,
                                      //BillHistoryButton = billHistoryBtn,
                                      //CancelAdmButton = cancelAdmBtn,
                                      //PrintWristButton = printWristBtn,
                                      //GenericStickerButton = genericStickerBtn,
                                      //AdmitButton = admitBtn
                                      //end2: sud:18Feb'20-these fields are implemented from client side, we can remove it after checking the impacts.
                                  }).ToList();
                    if (admissionStatus == "admitted")
                    {
                        responseData.Results = result.OrderByDescending(r => r.AdmittedDate);
                    }
                    if (patientVisitId > 0)
                    {
                        responseData.Results = result.Where(a => a.PatientVisitId == patientVisitId).FirstOrDefault();
                    }
                    responseData.Status = "OK";
                }

                else if (reqType == "DischargedPatientsList")
                {
                    var employeeslist = dbContext.Employees.Select(a => new
                    {
                        EmployeeId = a.EmployeeId,
                        EmployeeName = a.FirstName + " " + a.LastName,
                    }).ToList().AsEnumerable();
                    var result = (from admission in dbContext.Admissions.Include(a => a.Visit.Patient)
                                  join employee in dbContext.Employees on admission.AdmittingDoctorId equals employee.EmployeeId
                                  join department in dbContext.Department on employee.DepartmentId equals department.DepartmentId
                                  join summary in dbContext.DischargeSummary on admission.PatientVisitId equals summary.PatientVisitId into dischargeSummaryTemp
                                  from dischargeSummary in dischargeSummaryTemp.DefaultIfEmpty()
                                  join admDoctor in dbContext.Employees on admission.AdmittingDoctorId equals admDoctor.EmployeeId
                                  where admission.AdmissionStatus == admissionStatus && (DbFunctions.TruncateTime(admission.DischargeDate) >= FromDate && DbFunctions.TruncateTime(admission.DischargeDate) <= ToDate)
                                  select new
                                  {
                                      VisitCode = admission.Visit.VisitCode,
                                      PatientVisitId = admission.Visit.PatientVisitId,
                                      PatientId = admission.Visit.Patient.PatientId,
                                      PatientAdmissionId = admission.PatientAdmissionId,
                                      AdmittedDate = admission.AdmissionDate,
                                      DischargedDate = admission.DischargeDate,
                                      DischargedBy = admission.DischargedBy,
                                      PatientCode = admission.Visit.Patient.PatientCode,
                                      AdmittingDoctorId = admission.AdmittingDoctorId,
                                      AdmittingDoctorName = admDoctor.Salutation + ". " + admDoctor.FirstName + " " + (string.IsNullOrEmpty(admDoctor.MiddleName) ? "" : admDoctor.MiddleName + " ") + admDoctor.LastName,
                                      Address = admission.Visit.Patient.Address,
                                      AdmissionStatus = admission.AdmissionStatus,
                                      BillStatusOnDischarge = admission.BillStatusOnDischarge,
                                      //use ShortName instead of this when possible
                                      Name = admission.Visit.Patient.FirstName + " " + (string.IsNullOrEmpty(admission.Visit.Patient.MiddleName) ? "" : admission.Visit.Patient.MiddleName + " ") + admission.Visit.Patient.LastName,
                                      DateOfBirth = admission.Visit.Patient.DateOfBirth,
                                      PhoneNumber = admission.Visit.Patient.PhoneNumber,
                                      Gender = admission.Visit.Patient.Gender,
                                      IsSubmitted = dischargeSummary.IsSubmitted,
                                      IsPoliceCase = admission.IsPoliceCase != null ? admission.IsPoliceCase : false,
                                      DischargeSummaryId = dischargeSummary != null ? dischargeSummary.DischargeSummaryId : 0,
                                      //DischargeSummaryId = dischargeSummary.DischargeSummaryId,
                                      MedicalRecordId = (from mr in dbContext.MedicalRecords
                                                         where mr.PatientId == admission.Visit.Patient.PatientId
                                                         && mr.PatientVisitId == admission.Visit.PatientVisitId
                                                         select mr.MedicalRecordId).FirstOrDefault(),
                                      Department = department.DepartmentName,
                                      GuardianName = admission.CareOfPersonName,
                                      GuardianRelation = admission.CareOfPersonRelation,
                                      BedInformation = (from bedInfos in dbContext.PatientBedInfos
                                                        where bedInfos.PatientVisitId == admission.Visit.PatientVisitId && bedInfos.IsActive == true
                                                        select new
                                                        {
                                                            BedId = bedInfos.BedId,
                                                            PatientBedInfoId = bedInfos.PatientBedInfoId,
                                                            WardId = bedInfos.WardId,
                                                            Ward = bedInfos.Ward.WardName,
                                                            BedFeatureId = bedInfos.BedFeatureId,
                                                            Action = bedInfos.Action.Substring(0, 1).ToUpper() + bedInfos.Action.Substring(1),
                                                            BedFeature = bedInfos.BedFeature.BedFeatureName,
                                                            BedCode = bedInfos.Bed.BedCode,
                                                            BedNumber = bedInfos.Bed.BedNumber,
                                                            StartedOn = bedInfos.StartedOn,
                                                        }).OrderByDescending(a => a.StartedOn).FirstOrDefault()

                                  }).ToList();
                    if (admissionStatus == "discharged")
                    {
                        responseData.Results = result.OrderByDescending(r => r.DischargedDate);
                    }
                    responseData.Status = "OK";
                }

                else if (reqType == "AdmittedPatientsList")
                {
                    var result = (from admission in dbContext.Admissions.Include(a => a.Visit.Patient)
                                  join employee in dbContext.Employees on admission.AdmittingDoctorId equals employee.EmployeeId
                                  join department in dbContext.Department on employee.DepartmentId equals department.DepartmentId
                                  join summary in dbContext.DischargeSummary on admission.PatientVisitId equals summary.PatientVisitId into dischargeSummaryTemp
                                  from dischargeSummary in dischargeSummaryTemp.DefaultIfEmpty()
                                  join admDoctor in dbContext.Employees on admission.AdmittingDoctorId equals admDoctor.EmployeeId
                                  where admission.AdmissionStatus == admissionStatus && (DbFunctions.TruncateTime(admission.AdmissionDate) >= FromDate && DbFunctions.TruncateTime(admission.AdmissionDate) <= ToDate)
                                  select new
                                  {
                                      VisitCode = admission.Visit.VisitCode,
                                      PatientVisitId = admission.Visit.PatientVisitId,
                                      PatientId = admission.Visit.Patient.PatientId,
                                      PatientAdmissionId = admission.PatientAdmissionId,
                                      AdmittedDate = admission.AdmissionDate,
                                      DischargedDate = admission.DischargeDate,
                                      DischargedBy = admission.DischargedBy,
                                      PatientCode = admission.Visit.Patient.PatientCode,
                                      AdmittingDoctorId = admission.AdmittingDoctorId,
                                      AdmittingDoctorName = admDoctor.Salutation + ". " + admDoctor.FirstName + " " + (string.IsNullOrEmpty(admDoctor.MiddleName) ? "" : admDoctor.MiddleName + " ") + admDoctor.LastName,
                                      Address = admission.Visit.Patient.Address,
                                      AdmissionStatus = admission.AdmissionStatus,
                                      BillStatusOnDischarge = admission.BillStatusOnDischarge,
                                      //use ShortName instead of this when possible
                                      Name = admission.Visit.Patient.FirstName + " " + (string.IsNullOrEmpty(admission.Visit.Patient.MiddleName) ? "" : admission.Visit.Patient.MiddleName + " ") + admission.Visit.Patient.LastName,
                                      DateOfBirth = admission.Visit.Patient.DateOfBirth,
                                      PhoneNumber = admission.Visit.Patient.PhoneNumber,
                                      Gender = admission.Visit.Patient.Gender,
                                      IsSubmitted = dischargeSummary.IsSubmitted,
                                      DischargeSummaryId = dischargeSummary != null ? dischargeSummary.DischargeSummaryId : 0,
                                      //dischargeSummary.DischargeSummaryId,
                                      MedicalRecordId = (from mr in dbContext.MedicalRecords
                                                         where mr.PatientId == admission.Visit.Patient.PatientId
                                                         && mr.PatientVisitId == admission.Visit.PatientVisitId
                                                         select mr.MedicalRecordId).FirstOrDefault(),
                                      Department = department.DepartmentName,
                                      GuardianName = admission.CareOfPersonName,
                                      GuardianRelation = admission.CareOfPersonRelation,
                                      BedInformation = (from bedInfos in dbContext.PatientBedInfos
                                                        where bedInfos.PatientVisitId == admission.Visit.PatientVisitId && bedInfos.IsActive == true
                                                        select new
                                                        {
                                                            BedId = bedInfos.BedId,
                                                            PatientBedInfoId = bedInfos.PatientBedInfoId,
                                                            WardId = bedInfos.WardId,
                                                            Ward = bedInfos.Ward.WardName,
                                                            BedFeatureId = bedInfos.BedFeatureId,
                                                            Action = bedInfos.Action.Substring(0, 1).ToUpper() + bedInfos.Action.Substring(1),
                                                            BedFeature = bedInfos.BedFeature.BedFeatureName,
                                                            BedCode = bedInfos.Bed.BedCode,
                                                            BedNumber = bedInfos.Bed.BedNumber,
                                                            StartedOn = bedInfos.StartedOn,
                                                        }).OrderByDescending(a => a.StartedOn).FirstOrDefault()

                                  }).ToList();
                    if (admissionStatus == "admitted")
                    {
                        responseData.Results = result.OrderByDescending(r => r.AdmittedDate);
                    }
                    responseData.Status = "OK";
                }

                else if (reqType == "SelectedPatientPlusBedInfo")
                {
                    //var employeeslist = dbContext.Employees.Select(a => new
                    //{
                    //    EmployeeId = a.EmployeeId,
                    //    EmployeeName = a.FirstName + " " + a.LastName,
                    //}).ToList().AsEnumerable();
                    var result = (from admission in dbContext.Admissions.Include(a => a.Visit.Patient)
                                  join employee in dbContext.Employees on admission.AdmittingDoctorId equals employee.EmployeeId
                                  join department in dbContext.Department on employee.DepartmentId equals department.DepartmentId
                                  join summary in dbContext.DischargeSummary on admission.PatientVisitId equals summary.PatientVisitId into dischargeSummaryTemp
                                  from dischargeSummary in dischargeSummaryTemp.DefaultIfEmpty()
                                  join note in dbContext.Notes on admission.PatientVisitId equals note.PatientVisitId into noteTemp
                                  from notes in noteTemp.DefaultIfEmpty()
                                      //join admDoctor in dbContext.Employees on admission.AdmittingDoctorId equals admDoctor.EmployeeId
                                  where admission.PatientVisitId == patientVisitId && admission.PatientId == patientId
                                  select new
                                  {
                                      VisitCode = admission.Visit.VisitCode,
                                      PatientVisitId = admission.Visit.PatientVisitId,
                                      PatientId = admission.Visit.Patient.PatientId,
                                      PatientAdmissionId = admission.PatientAdmissionId,
                                      AdmittedDate = admission.AdmissionDate,
                                      DischargedDate = admission.DischargeDate,
                                      DischargedBy = admission.DischargedBy,
                                      PatientCode = admission.Visit.Patient.PatientCode,
                                      AdmittingDoctorId = admission.AdmittingDoctorId,
                                      AdmittingDoctorName = employee.Salutation + ". " + employee.FirstName + " " + (string.IsNullOrEmpty(employee.MiddleName) ? "" : employee.MiddleName + " ") + employee.LastName,
                                      Address = admission.Visit.Patient.Address,
                                      AdmissionStatus = admission.AdmissionStatus,
                                      BillStatusOnDischarge = admission.BillStatusOnDischarge,
                                      //use ShortName instead of this when possible
                                      Name = admission.Visit.Patient.FirstName + " " + (string.IsNullOrEmpty(admission.Visit.Patient.MiddleName) ? "" : admission.Visit.Patient.MiddleName + " ") + admission.Visit.Patient.LastName,
                                      DateOfBirth = admission.Visit.Patient.DateOfBirth,
                                      PhoneNumber = admission.Visit.Patient.PhoneNumber,
                                      Gender = admission.Visit.Patient.Gender,
                                      IsSubmitted = dischargeSummary.IsSubmitted,
                                      IsPending = (from note in dbContext.Notes
                                                   where note.PatientVisitId == admission.Visit.PatientVisitId && note.TemplateName == "Discharge Note"
                                                   select note.IsPending).FirstOrDefault(),

                                      MedicalRecordId = (from mr in dbContext.MedicalRecords
                                                         where mr.PatientId == admission.Visit.Patient.PatientId
                                                         && mr.PatientVisitId == admission.Visit.PatientVisitId
                                                         select mr.MedicalRecordId).FirstOrDefault(),
                                      Department = department.DepartmentName,
                                      GuardianName = admission.CareOfPersonName,
                                      GuardianRelation = admission.CareOfPersonRelation,
                                      BedInformation = (from bedInfos in dbContext.PatientBedInfos
                                                        where bedInfos.PatientVisitId == admission.Visit.PatientVisitId && bedInfos.IsActive == true
                                                        select new
                                                        {
                                                            BedId = bedInfos.BedId,
                                                            PatientBedInfoId = bedInfos.PatientBedInfoId,
                                                            WardId = bedInfos.WardId,
                                                            Ward = bedInfos.Ward.WardName,
                                                            BedFeatureId = bedInfos.BedFeatureId,
                                                            Action = bedInfos.Action.Substring(0, 1).ToUpper() + bedInfos.Action.Substring(1),
                                                            BedFeature = bedInfos.BedFeature.BedFeatureName,
                                                            BedCode = bedInfos.Bed.BedCode,
                                                            BedNumber = bedInfos.Bed.BedNumber,
                                                            StartedOn = bedInfos.StartedOn,
                                                        }).FirstOrDefault()

                                  }).ToList();

                    responseData.Results = result;
                    responseData.Status = "OK";
                }

                //used in cancel admission page
                else if (reqType == "get-pat-adt-info" && patientId != 0 && ipVisitId != 0)
                {
                    var patientInfo = (from patient in dbContext.Patients
                                       join admission in dbContext.Admissions on patient.PatientId equals admission.PatientId
                                       join vis in dbContext.Visits on admission.PatientVisitId equals vis.PatientVisitId
                                       join bedInfo in dbContext.PatientBedInfos on admission.PatientVisitId equals bedInfo.PatientVisitId
                                       join bed in dbContext.Beds on bedInfo.BedId equals bed.BedId
                                       join ward in dbContext.Wards on bedInfo.WardId equals ward.WardId
                                       from deposit in dbContext.BillDeposit.Where(dept => dept.PatientVisitId == vis.PatientVisitId).DefaultIfEmpty()
                                       where patient.PatientId == patientId && admission.PatientVisitId == ipVisitId
                                       select new AdmissionInfoVM
                                       {
                                           //Patient Model
                                           PatientName = patient.FirstName + " " + (string.IsNullOrEmpty(patient.MiddleName) ? "" : patient.MiddleName + " ") + patient.LastName,
                                           PatientCode = patient.PatientCode,
                                           Address = patient.Address,
                                           DateOfBirth = patient.DateOfBirth,
                                           Gender = patient.Gender,
                                           PhoneNumber = patient.PhoneNumber,
                                           //PatientVisit Model
                                           VisitCode = vis.VisitCode,
                                           //Admission Model
                                           AdmissionDate = admission.AdmissionDate,
                                           //Deposit Model
                                           DepositId = deposit.DepositId,
                                           DepositBalance = deposit.DepositBalance,
                                           //PatientBedInfo
                                           WardName = ward.WardName,
                                           BedCode = bed.BedCode
                                       }).OrderByDescending(a => a.DepositId).FirstOrDefault();
                    responseData.Results = patientInfo;
                    responseData.Status = "OK";
                }
                else if (reqType == "getAdmittedPatientDetails")
                {
                    //'patientVisitId' :: this is the parameter passed from dl services
                    //

                    var patientBedInfo = (from patientinfo in dbContext.PatientBedInfos
                                          join ward in dbContext.Wards on patientinfo.WardId equals ward.WardId
                                          join bed in dbContext.Beds on patientinfo.BedId equals bed.BedId
                                          join admissionpatient in dbContext.Admissions on patientinfo.PatientVisitId equals admissionpatient.PatientVisitId
                                          join emp in dbContext.Employees on patientinfo.SecondaryDoctorId equals emp.EmployeeId into empSummaryTemp
                                          from empSummary in empSummaryTemp.DefaultIfEmpty()
                                          where patientinfo.PatientVisitId == patientVisitId && patientinfo.IsActive == true
                                          select new PatientBedInfoVM
                                          {
                                              WardName = ward.WardName,
                                              StartedOn = patientinfo.StartedOn,
                                              EndedOn = patientinfo.EndedOn,
                                              BedNumber = bed.BedNumber,
                                              BedCode = bed.BedCode,
                                              PatientBedInfoId = patientinfo.PatientBedInfoId,
                                              PatientVisitId = patientinfo.PatientVisitId,
                                              Action = patientinfo.Action,
                                              SecondaryDoctorId = patientinfo.SecondaryDoctorId,
                                              SecondaryDoctor = empSummary.FirstName + " " + empSummary.MiddleName + " " + empSummary.LastName
                                          }).Distinct().OrderByDescending(a => a.StartedOn).ToList();

                    responseData.Results = patientBedInfo;
                    responseData.Status = "OK";
                }
                //used in nursing module.
                else if (reqType == "getAdmittedList")
                {
                    CoreDbContext coreDbContext = new CoreDbContext(connString);

                    UpdateNotReceivedTransferredBed(dbContext);

                    search = search == null ? string.Empty : search.ToLower();
                    var testdate = ToDate.AddDays(1);

                    var result = (from admission in dbContext.Admissions.Include(a => a.Visit.Patient)
                                  where admission.AdmissionStatus == "admitted" &&
                                  (admission.Visit.Patient.FirstName + " " + (string.IsNullOrEmpty(admission.Visit.Patient.MiddleName) ? "" : admission.Visit.Patient.MiddleName + " ")
                                  + admission.Visit.Patient.LastName + admission.Visit.Patient.PatientCode + admission.Visit.Patient.PhoneNumber).Contains(search)
                                  join emp in dbContext.Employees on admission.AdmittingDoctorId equals emp.EmployeeId
                                  select new
                                  {
                                      VisitCode = admission.Visit.VisitCode,
                                      PatientVisitId = admission.Visit.PatientVisitId,
                                      PatientId = admission.Visit.Patient.PatientId,
                                      AdmittedDate = admission.AdmissionDate,
                                      PatientCode = admission.Visit.Patient.PatientCode,
                                      //use ShortName instead of this when possible
                                      Name = admission.Visit.Patient.FirstName + " " + (string.IsNullOrEmpty(admission.Visit.Patient.MiddleName) ? "" : admission.Visit.Patient.MiddleName + " ") + admission.Visit.Patient.LastName,
                                      DateOfBirth = admission.Visit.Patient.DateOfBirth,
                                      Age = admission.Visit.Patient.Age,
                                      PhoneNumber = admission.Visit.Patient.PhoneNumber,
                                      Gender = admission.Visit.Patient.Gender,
                                      AdmittingDoctorId = admission.AdmittingDoctorId,
                                      AdmittingDoctorName = emp.FullName,
                                      CreatedOn = admission.CreatedOn,
                                      IsPoliceCase = admission.IsPoliceCase != null ? admission.IsPoliceCase : false,
                                      BedInformation = (from bedInfos in dbContext.PatientBedInfos
                                                        where bedInfos.PatientVisitId == admission.Visit.PatientVisitId
                                                        && bedInfos.IsActive == true
                                                        select new
                                                        {
                                                            BedFeature = bedInfos.BedFeature.BedFeatureName,
                                                            BedCode = bedInfos.Bed.BedCode,
                                                            StartedOn = bedInfos.StartedOn,
                                                            WardId = bedInfos.WardId,
                                                            PatientBedInfoId = bedInfos.PatientBedInfoId,
                                                            BedId = bedInfos.Bed.BedId,
                                                            BedNumber = bedInfos.Bed.BedNumber,
                                                            BedFeatureId = bedInfos.BedFeature.BedFeatureId,
                                                            OutAction = bedInfos.OutAction,
                                                            ReceivedBy = bedInfos.ReceivedBy,
                                                            ReceivedOn = bedInfos.ReceivedOn,
                                                            Action = bedInfos.Action,
                                                            BedOnHoldEnabled = bedInfos.BedOnHoldEnabled,
                                                            //AdmittedDate = bedInfos.ad,
                                                            //StartedOn = bedInfos.StartedOn,
                                                            Ward = bedInfos.Ward
                                                        }).OrderByDescending(a => a.PatientBedInfoId).FirstOrDefault()

                                  }).OrderByDescending(r => r.AdmittedDate).AsQueryable();


                    result = result.Where(res => res.BedInformation.WardId == wardId);



                    //var possibleBedsToUpdate = result.Where()

                    if (CommonFunctions.GetCoreParameterBoolValue(coreDbContext, "Common", "ServerSideSearchComponent", "NursingInPatient") == true && search == "")
                    {
                        result = result.Take(CommonFunctions.GetCoreParameterIntValue(coreDbContext, "Common", "ServerSideSearchListLength"));
                    }
                    if (FromDate != DateTime.Now.Date)
                    {
                        var finalResults = result.Where(a => a.CreatedOn > FromDate && a.CreatedOn < testdate).ToList();
                        responseData.Results = finalResults;
                    }
                    else
                    {
                        var finalResults = result.ToList();
                        responseData.Results = finalResults;
                    }


                    responseData.Status = "OK";

                    //if (search == null)
                    //{  // Vikas: 17th June 2019 :added real time search.

                    //    var testdate = ToDate.AddDays(1);
                    //    var result = (from admission in dbContext.Admissions.Include(a => a.Visit.Patient)
                    //                  where admission.AdmissionStatus == "admitted" && admission.CreatedOn > FromDate && admission.CreatedOn < testdate
                    //                  select new
                    //                  {
                    //                      VisitCode = admission.Visit.VisitCode,
                    //                      PatientVisitId = admission.Visit.PatientVisitId,
                    //                      PatientId = admission.Visit.Patient.PatientId,
                    //                      AdmittedDate = admission.AdmissionDate,
                    //                      PatientCode = admission.Visit.Patient.PatientCode,
                    //                      //use ShortName instead of this when possible
                    //                      Name = admission.Visit.Patient.FirstName + " " + (string.IsNullOrEmpty(admission.Visit.Patient.MiddleName) ? "" : admission.Visit.Patient.MiddleName + " ") + admission.Visit.Patient.LastName,
                    //                      DateOfBirth = admission.Visit.Patient.DateOfBirth,
                    //                      Age = admission.Visit.Patient.Age,
                    //                      PhoneNumber = admission.Visit.Patient.PhoneNumber,
                    //                      Gender = admission.Visit.Patient.Gender,
                    //                      AdmittingDoctorId = admission.AdmittingDoctorId,
                    //                      BedInformation = (from bedInfos in dbContext.PatientBedInfos
                    //                                        where bedInfos.PatientVisitId == admission.Visit.PatientVisitId
                    //                                        select new
                    //                                        {
                    //                                            BedFeature = bedInfos.BedFeature.BedFeatureName,
                    //                                            BedCode = bedInfos.Bed.BedCode,
                    //                                            StartedOn = bedInfos.StartedOn,
                    //                                        }).OrderByDescending(a => a.StartedOn).FirstOrDefault()

                    //                  }).OrderByDescending(r => r.AdmittedDate).Take(200).ToList();

                    //    responseData.Results = result;
                    //    responseData.Status = "OK";
                    //}
                    //else
                    //{
                    //    var result = (from admission in dbContext.Admissions.Include(a => a.Visit.Patient)
                    //                  where admission.AdmissionStatus == "admitted" &&
                    //                  (admission.Visit.Patient.FirstName + " " + (string.IsNullOrEmpty(admission.Visit.Patient.MiddleName) ? "" : admission.Visit.Patient.MiddleName + " ")
                    //                  + admission.Visit.Patient.LastName + admission.Visit.Patient.PatientCode + admission.Visit.Patient.PhoneNumber).Contains(search)
                    //                  select new
                    //                  {
                    //                      VisitCode = admission.Visit.VisitCode,
                    //                      PatientVisitId = admission.Visit.PatientVisitId,
                    //                      PatientId = admission.Visit.Patient.PatientId,
                    //                      AdmittedDate = admission.AdmissionDate,
                    //                      PatientCode = admission.Visit.Patient.PatientCode,
                    //                      //use ShortName instead of this when possible
                    //                      Name = admission.Visit.Patient.FirstName + " " + (string.IsNullOrEmpty(admission.Visit.Patient.MiddleName) ? "" : admission.Visit.Patient.MiddleName + " ") + admission.Visit.Patient.LastName,
                    //                      DateOfBirth = admission.Visit.Patient.DateOfBirth,
                    //                      Age = admission.Visit.Patient.Age,
                    //                      PhoneNumber = admission.Visit.Patient.PhoneNumber,
                    //                      Gender = admission.Visit.Patient.Gender,
                    //                      AdmittingDoctorId = admission.AdmittingDoctorId,
                    //                      BedInformation = (from bedInfos in dbContext.PatientBedInfos
                    //                                        where bedInfos.PatientVisitId == admission.Visit.PatientVisitId
                    //                                        select new
                    //                                        {
                    //                                            BedFeature = bedInfos.BedFeature.BedFeatureName,
                    //                                            BedCode = bedInfos.Bed.BedCode,
                    //                                            StartedOn = bedInfos.StartedOn,
                    //                                        }).OrderByDescending(a => a.StartedOn).FirstOrDefault()

                    //                  }).ToList().OrderByDescending(r => r.AdmittedDate);
                    //    responseData.Results = result;
                    //    responseData.Status = "OK";
                    //}
                }
                else if (reqType == "pendingAdmissionReceiveList")
                {
                    UpdateNotReceivedTransferredBed(dbContext);

                    var allAdm = dbContext.Admissions.Include(a => a.Visit.Patient).ToList();


                    var result = (from admission in dbContext.Admissions.Include(a => a.Visit.Patient)
                                  where admission.AdmissionStatus == "admitted"
                                  join emp in dbContext.Employees on admission.AdmittingDoctorId equals emp.EmployeeId
                                  join bedInfo in dbContext.PatientBedInfos on admission.PatientVisitId equals bedInfo.PatientVisitId
                                  where bedInfo.IsActive == true && bedInfo.Action == "transfer"
                                  && (!bedInfo.ReceivedBy.HasValue) && bedInfo.BedOnHoldEnabled == true
                                  select new
                                  {
                                      VisitCode = admission.Visit.VisitCode,
                                      PatientVisitId = admission.Visit.PatientVisitId,
                                      PatientId = admission.Visit.Patient.PatientId,
                                      AdmittedDate = admission.AdmissionDate,
                                      PatientCode = admission.Visit.Patient.PatientCode,
                                      //use ShortName instead of this when possible
                                      Name = admission.Visit.Patient.ShortName,
                                      DateOfBirth = admission.Visit.Patient.DateOfBirth,
                                      Age = admission.Visit.Patient.Age,
                                      PhoneNumber = admission.Visit.Patient.PhoneNumber,
                                      Gender = admission.Visit.Patient.Gender,
                                      AdmittingDoctorId = admission.AdmittingDoctorId,
                                      AdmittingDoctorName = emp.FullName,
                                      CreatedOn = admission.CreatedOn,
                                      BedInformation = (from bedInfos in dbContext.PatientBedInfos
                                                        where bedInfos.PatientVisitId == admission.Visit.PatientVisitId
                                                        && bedInfos.IsActive == true
                                                        join employ in dbContext.Employees on bedInfos.CreatedBy equals employ.EmployeeId
                                                        select new
                                                        {
                                                            BedFeature = bedInfos.BedFeature.BedFeatureName,
                                                            BedCode = bedInfos.Bed.BedCode,
                                                            StartedOn = bedInfos.StartedOn,
                                                            WardId = bedInfos.WardId,
                                                            PatientBedInfoId = bedInfos.PatientBedInfoId,
                                                            BedId = bedInfos.Bed.BedId,
                                                            BedNumber = bedInfos.Bed.BedNumber,
                                                            BedFeatureId = bedInfos.BedFeature.BedFeatureId,
                                                            OutAction = bedInfos.OutAction,
                                                            ReceivedBy = bedInfos.ReceivedBy,
                                                            ReceivedOn = bedInfos.ReceivedOn,
                                                            Action = bedInfos.Action,
                                                            BedOnHoldEnabled = bedInfos.BedOnHoldEnabled,
                                                            TransferredOn = bedInfos.StartedOn,
                                                            CreatedBy = employ.FullName,
                                                            //AdmittedDate = bedInfos.ad,
                                                            //StartedOn = bedInfos.StartedOn,
                                                            Ward = bedInfos.Ward
                                                        }).OrderByDescending(a => a.PatientBedInfoId).Take(2)

                                  }).OrderByDescending(r => r.AdmittedDate).AsQueryable();

                    var finalResults = result.ToList();
                    responseData.Results = finalResults;

                    responseData.Status = "OK";
                }
                else if (reqType == "checkPatientAdmission")
                {
                    AdmissionModel patAdmission = (from app in dbContext.Admissions
                                                   join visit in dbContext.Visits on app.PatientVisitId equals visit.PatientVisitId
                                                   where visit.PatientId == patientId && app.AdmissionStatus == "admitted"
                                                   select app).FirstOrDefault();
                    if (patAdmission != null)
                        responseData.Status = "OK";
                    else
                        responseData.Status = "Failed";
                }
                else if (reqType == "checkPatProvisionalInfo")
                {
                    BillingDbContext billingDb = new BillingDbContext(base.connString);
                    var info = (from bItm in billingDb.BillingTransactionItems
                                where bItm.PatientId == patientId && bItm.BillStatus == ENUM_BillingStatus.provisional // "provisional"
                                select bItm).FirstOrDefault();
                    if (info != null)
                        responseData.Status = "OK";
                    else
                        responseData.Status = "Failed";
                }
                else if (reqType == "get-doctor-list")
                {
                    //check if we can use employee.IsAppointmentApplicable field in below join.--sud:15Jun'18
                    ServiceDepartmentModel srvDept = dbContext.ServiceDepartment.Where(s => s.ServiceDepartmentName == "OPD").FirstOrDefault();
                    if (srvDept != null)
                    {
                        var visitDoctorList = (from emp in dbContext.Employees
                                               join dept in dbContext.Department on emp.DepartmentId equals dept.DepartmentId
                                               join billItem in dbContext.BillItemPrice on emp.EmployeeId equals billItem.ItemId
                                               where billItem.ServiceDepartmentId == srvDept.ServiceDepartmentId
                                               select new
                                               {
                                                   DepartmentId = dept.DepartmentId,
                                                   DepartmentName = dept.DepartmentName,
                                                   ProviderId = emp.EmployeeId,
                                                   ProviderName = emp.Salutation + ". " + emp.FirstName + (string.IsNullOrEmpty(emp.MiddleName) ? " " : " " + emp.MiddleName + " ") + emp.LastName,
                                                   ItemName = billItem.ItemName,
                                                   Price = billItem.Price,
                                                   IsTaxApplicable = billItem.TaxApplicable
                                               }).ToList();
                        responseData.Results = visitDoctorList;
                        responseData.Status = "OK";
                    }
                }
                else if (reqType == "provider-list")
                {
                    //sud: 15Jun'18 -- removed departmentjoin as IsAppointmentApplicable field is now added in Employee Level as well.
                    //List<DepartmentModel> allDeptsFromCache = (List<DepartmentModel>)DanpheCache.GetMasterData(MasterDataEnum.Department);
                    //List<EmployeeModel> apptEmployees = (from e in empListFromCache
                    //                                     join d in allDeptsFromCache
                    //                                     on e.DepartmentId equals d.DepartmentId
                    //                                     where d.IsAppointmentApplicable == true
                    //                                     select e
                    //                     ).ToList();

                    List<EmployeeModel> empListFromCache = (List<EmployeeModel>)DanpheCache.GetMasterData(MasterDataEnum.Employee);
                    List<EmployeeModel> apptEmployees = empListFromCache.Where(emp => emp.IsAppointmentApplicable.HasValue
                                                          && emp.IsAppointmentApplicable == true
                                                          //sud:13Mar'19 Get Only Active Employees.. 
                                                          && emp.IsActive == true).ToList();



                    //var providerList = (from emp in masterDbContext.Employee
                    //                    join role in masterDbContext.EmployeeRole on emp.EmployeeRoleId equals role.EmployeeRoleId
                    //                    where role.EmployeeRoleName == "Provider"
                    //                    select emp).ToList();
                    responseData.Status = "OK";
                    responseData.Results = apptEmployees;
                }
                else if (reqType == "anasthetists-employee-list")
                {
                    //List<DepartmentModel> allDeptsFromCache = (List<DepartmentModel>)DanpheCache.GetMasterData(MasterDataEnum.Department);

                    //List<EmployeeModel> empListFromCache = (List<EmployeeModel>)DanpheCache.GetMasterData(MasterDataEnum.Employee);
                    //List<EmployeeModel> empList = (from e in empListFromCache
                    //                               join d in allDeptsFromCache on e.DepartmentId equals d.DepartmentId
                    //                               where d.DepartmentName == "Anesthesiology"
                    //                               select e).ToList();

                    //Yubraj: 10th May '19 :: Getting Anaesthetist doctor list from employee
                    List<EmployeeModel> empList = (from e in masterDbContext.Employees
                                                   join r in masterDbContext.EmployeeRole on e.EmployeeRoleId equals r.EmployeeRoleId
                                                   where r.EmployeeRoleName == "Anaesthetist"
                                                   select e).ToList();

                    responseData.Status = "OK";
                    responseData.Results = empList;
                }
                else if (reqType == "discharge-type")
                {
                    var dischargeTypeList = dbContext.DischargeType.Where(a => a.IsActive == true).ToList();
                    responseData.Status = "OK";
                    responseData.Results = dischargeTypeList;
                }
                else if (reqType == "discharge-summary-patientVisit")
                {
                    var summary = (from dis in dbContext.DischargeSummary
                                   join visit in dbContext.Visits on dis.PatientVisitId equals visit.PatientVisitId
                                   join consultant in dbContext.Employees on dis.ConsultantId equals consultant.EmployeeId
                                   join incharge in dbContext.Employees on dis.DoctorInchargeId equals incharge.EmployeeId
                                   //Ashim: 15Dec2017 : ResidenceDr is not mandatory
                                   join residence in dbContext.Employees on dis.ResidenceDrId equals residence.EmployeeId into residenceDrTemp
                                   from residenceDr in residenceDrTemp.DefaultIfEmpty()
                                       //since anaesthist is a non-mandatory field, there might be null value sometimes.
                                       // below logic is equivalent to a Left join, so it takes the anesthiest Only if it's present.
                                   join anaesthetists in dbContext.Employees on dis.AnaesthetistsId equals anaesthetists.EmployeeId into anaesthistTemp
                                   from anesthist in anaesthistTemp.DefaultIfEmpty()
                                   join disType in dbContext.DischargeType on dis.DischargeTypeId equals disType.DischargeTypeId
                                   where dis.PatientVisitId == patientVisitId
                                   select new
                                   {
                                       DischargeSummary = dis,
                                       Medications = dbContext.DischargeSummaryMedications.Where(a => a.DischargeSummaryId == dis.DischargeSummaryId && a.IsActive == true).Select(a => a).OrderBy(a => a.OldNewMedicineType).ToList(),
                                       VisitCode = visit.VisitCode,
                                       BabyBirthDetails = dbContext.BabyBirthDetails.Where(a => a.DischargeSummaryId == dis.DischargeSummaryId).Select(a => a).ToList(),
                                       DischargeType = disType.DischargeTypeName,
                                       Certificate = dbContext.PatientCertificate.Where(a => a.DischargeSummaryId == dis.DischargeSummaryId).Select(a => a).ToList(),
                                       DrInchargeNMC = incharge.MedCertificationNo,
                                       DrInchargeLongSignature = incharge.LongSignature,
                                       ResidenceDrNMC = residenceDr.MedCertificationNo,
                                       ResidenceDrLongSignature = residenceDr.LongSignature,
                                       ConsultantNMC = consultant.MedCertificationNo,
                                       ConsultantLongSignature = consultant.LongSignature,
                                       AnaesthetistsNMC = anesthist.MedCertificationNo,
                                       AnaesthetistLongSignature = anesthist.LongSignature,
                                       DoctorInchargeName = incharge.Salutation + ". " + incharge.FirstName + " " + (string.IsNullOrEmpty(incharge.MiddleName) ? "" : incharge.MiddleName + " ") + incharge.LastName,
                                       Anaesthetists = anesthist.Salutation + ". " + anesthist.FirstName + " " + (string.IsNullOrEmpty(anesthist.MiddleName) ? "" : anesthist.MiddleName + " ") + anesthist.LastName,
                                       ConsultantName = consultant.Salutation + ". " + consultant.FirstName + " " + (string.IsNullOrEmpty(consultant.MiddleName) ? "" : consultant.MiddleName + " ") + consultant.LastName,
                                       ResidenceDrName = residenceDr.Salutation + ". " + residenceDr.FirstName + " " + (string.IsNullOrEmpty(residenceDr.MiddleName) ? "" : residenceDr.MiddleName + " ") + residenceDr.LastName,
                                       DischargeConditionType = dbContext.DischargeConditionTypes.Where(a => a.DischargeConditionId == dis.DischargeConditionId).Select(a => a.Condition).FirstOrDefault(),
                                       BabyBirthCondition = dbContext.BabyBirthConditions.Where(A => A.BabyBirthConditionId == dis.BabyBirthConditionId).Select(a => a.BirthConditionType).FirstOrDefault(),
                                       DeathType = dbContext.DeathTypes.Where(a => a.DeathTypeId == dis.DeathTypeId).Select(a => a.DeathType).FirstOrDefault(),
                                       DeliveryType = dbContext.DeliveryTypes.Where(A => A.DeliveryTypeId == dis.DeliveryTypeId).Select(a => a.DeliveryTypeName).FirstOrDefault(),

                                   }).FirstOrDefault();
                    responseData.Status = "OK";
                    responseData.Results = summary;
                }
                else if (reqType == "wardList")
                {
                    List<WardModel> wardList = (from ward in dbContext.Wards
                                                where ward.IsActive == true
                                                select ward).ToList();

                    responseData.Status = "OK";
                    responseData.Results = wardList;
                }
                else if (reqType == "bedFeatureList")
                {

                    List<BedFeature> bedFeatureList = (from bedFeature in dbContext.BedFeatures
                                                       where bedFeature.IsActive == true
                                                       select bedFeature).ToList();

                    responseData.Status = "OK";
                    responseData.Results = bedFeatureList;
                }
                else if (reqType == "availableBeds")
                {
                    BillingDbContext billingDb = new BillingDbContext(base.connString);
                    int minTimeBeforeCancel = 15;
                    var timeFrmParam = (from param in billingDb.AdminParameters
                                        where param.ParameterName == "MinutesBeforeAutoCancelOfReservedBed"
                                        && param.ParameterGroupName.ToLower() == "adt"
                                        select param.ParameterValue).FirstOrDefault();

                    if (!String.IsNullOrEmpty(timeFrmParam))
                    {
                        minTimeBeforeCancel = Int32.Parse(timeFrmParam);
                    }

                    DateTime currentDateTime = System.DateTime.Now;
                    DateTime bufferTime = currentDateTime.AddMinutes(minTimeBeforeCancel);

                    int timeInMinsBeforeCancel = 360;
                    var parameter = (from param in dbContext.CFGParameters
                                     where param.ParameterName == "AutoCancellationOfTransferReserveInMins"
                                     select param.ParameterValue).AsNoTracking().FirstOrDefault();
                    if (parameter != null)
                    {
                        timeInMinsBeforeCancel = Convert.ToInt32(parameter);
                        //add 2 min more buffer
                        timeInMinsBeforeCancel = timeInMinsBeforeCancel + 2;
                    }

                    var holdTimeBuffer = currentDateTime.AddMinutes((timeInMinsBeforeCancel * (-1)));

                    var allPossibleAvailableBeds = (from bed in dbContext.Beds
                                                    join bedFeatureMap in dbContext.BedFeaturesMaps on bed.BedId equals bedFeatureMap.BedId
                                                    where (
                                                       bedFeatureMap.WardId == wardId && bedFeatureMap.BedFeatureId == bedFeatureId
                                                       && bedFeatureMap.IsActive == true
                                                       && bed.IsActive == true
                                                       && (
                                                       (bed.IsOccupied == false && (bed.OnHold != true))
                                                       || (bed.IsOccupied == true && (bed.OnHold == true)
                                                       && (bed.HoldedOn.HasValue && bed.HoldedOn.Value < holdTimeBuffer))
                                                        )
                                                       )
                                                    select new
                                                    {
                                                        BedId = bed.BedId,
                                                        BedCode = bed.BedCode,
                                                        BedNumber = bed.BedNumber,
                                                        WardId = bed.WardId,
                                                        IsOccupied = bed.IsOccupied,
                                                        CreatedBy = bed.CreatedBy,
                                                        IsActive = bed.IsActive,
                                                        CreatedOn = bed.CreatedOn,
                                                        OnHold = bed.OnHold,
                                                        HoldedOn = bed.HoldedOn
                                                    }).ToList();

                    var reservationBedInfoList = (from resvd in dbContext.BedReservation
                                                  join pat in dbContext.Patients on resvd.PatientId equals pat.PatientId
                                                  where resvd.IsActive == true
                                                  && resvd.AdmissionStartsOn > bufferTime
                                                  select new
                                                  {
                                                      ShortName = pat.ShortName,
                                                      BedId = resvd.BedId,
                                                      ReservedBedInfoId = resvd.ReservedBedInfoId,
                                                      AdmissionStartsOn = resvd.AdmissionStartsOn
                                                  }).ToList();

                    var availableBeds = (from bed in allPossibleAvailableBeds
                                         select new
                                         {
                                             BedId = bed.BedId,
                                             BedCode = bed.BedCode,
                                             BedNumber = bed.BedNumber,
                                             WardId = bed.WardId,
                                             IsOccupied = bed.IsOccupied,
                                             IsReserved = (from resvd in reservationBedInfoList
                                                           where resvd.BedId == bed.BedId
                                                           select resvd.ReservedBedInfoId).FirstOrDefault() > 0 ? true : false,
                                             CreatedBy = bed.CreatedBy,
                                             IsActive = bed.IsActive,
                                             CreatedOn = bed.CreatedOn,
                                             ReservedByPatient = (from resvd in reservationBedInfoList
                                                                  where resvd.BedId == bed.BedId
                                                                  select resvd.ShortName).FirstOrDefault(),
                                             ReservedForDate = (from resvd in reservationBedInfoList
                                                                where resvd.BedId == bed.BedId
                                                                select resvd.AdmissionStartsOn).FirstOrDefault(),
                                             OnHold = bed.OnHold,
                                             HoldedOn = bed.HoldedOn
                                         }).ToList();



                    //var availableBeds = (from bed in dbContext.Beds
                    //                     join bedFeatureMap in dbContext.BedFeaturesMaps on bed.BedId equals bedFeatureMap.BedId
                    //                     where (
                    //                        bedFeatureMap.WardId == wardId &&
                    //                        bedFeatureMap.BedFeatureId == bedFeatureId &&
                    //                        bed.IsActive == true && bed.IsOccupied == false && (bed.OnHold != true) &&
                    //                        bedFeatureMap.IsActive == true)
                    //                     select new
                    //                     {
                    //                         BedId = bed.BedId,
                    //                         BedCode = bed.BedCode,
                    //                         BedNumber = bed.BedNumber,
                    //                         WardId = bed.WardId,
                    //                         IsOccupied = bed.IsOccupied,
                    //                         IsReserved = (from resvd in dbContext.BedReservation
                    //                                       where resvd.BedId == bed.BedId && resvd.IsActive == true
                    //                                       && resvd.AdmissionStartsOn > bufferTime
                    //                                       select resvd.ReservedBedInfoId).FirstOrDefault() > 0 ? true : false,
                    //                         CreatedBy = bed.CreatedBy,
                    //                         IsActive = bed.IsActive,
                    //                         CreatedOn = bed.CreatedOn,
                    //                         ReservedByPatient = (from resvd in dbContext.BedReservation
                    //                                              join pat in dbContext.Patients on resvd.PatientId equals pat.PatientId
                    //                                              where resvd.BedId == bed.BedId && resvd.IsActive == true
                    //                                              && resvd.AdmissionStartsOn > bufferTime
                    //                                              select pat.FirstName + (String.IsNullOrEmpty(pat.MiddleName) ? " " : (" " + pat.MiddleName + " ")) + pat.LastName).FirstOrDefault(),
                    //                         ReservedForDate = (from resvd in dbContext.BedReservation
                    //                                            where resvd.BedId == bed.BedId && resvd.IsActive == true
                    //                                            && resvd.AdmissionStartsOn > bufferTime
                    //                                            select resvd.AdmissionStartsOn).FirstOrDefault()
                    //                     }).ToList();

                    var bedFeature = dbContext.BedFeatures.Where(a => a.BedFeatureId == bedFeatureId).FirstOrDefault();

                    var BedbillItm = (from bilItm in billingDb.BillItemPrice
                                      join servDept in billingDb.ServiceDepartment on bilItm.ServiceDepartmentId equals servDept.ServiceDepartmentId
                                      where bilItm.ItemId == bedFeatureId && servDept.IntegrationName == "Bed Charges "
                                      select new
                                      {
                                          bilItm.ItemId,
                                          bilItm.ItemName,
                                          Price = bedFeature.BedPrice,
                                          bilItm.TaxApplicable,
                                          bilItm.ServiceDepartmentId,
                                          servDept.ServiceDepartmentName,
                                          bilItm.ProcedureCode
                                      }).FirstOrDefault();

                    responseData.Status = "OK";
                    responseData.Results = new { availableBeds, BedbillItm };
                }
                else if (reqType == "wardBedFeature")
                {

                    var wardBedFeatures = (from bedFeature in dbContext.BedFeatures
                                           join bedFeaturesMap in dbContext.BedFeaturesMaps on bedFeature.BedFeatureId equals bedFeaturesMap.BedFeatureId
                                           where (bedFeaturesMap.WardId == wardId && bedFeaturesMap.IsActive == true && bedFeature.IsActive == true)
                                           select bedFeature).Distinct().ToList();
                    responseData.Status = "OK";
                    responseData.Results = wardBedFeatures;
                }
                else if (reqType == "similarBedFeatures")
                {

                    var similarBedFeatures = (from bedFeature in dbContext.BedFeatures
                                              join bedFeaturesMap in dbContext.BedFeaturesMaps on bedFeature.BedFeatureId equals bedFeaturesMap.BedFeatureId
                                              where (bedFeaturesMap.IsActive == true && bedFeaturesMap.BedFeatureId != bedFeatureId && bedFeaturesMap.WardId == wardId)
                                              select bedFeature).Distinct().ToList();
                    responseData.Status = "OK";
                    responseData.Results = similarBedFeatures;
                }
                else if (reqType == "admissionHistory")
                {
                    var admissionHistory = (from admission in dbContext.Admissions
                                            join visit in dbContext.Visits on admission.PatientVisitId equals visit.PatientVisitId
                                            where visit.PatientId == patientId
                                            select new
                                            {
                                                AdmissionId = admission.PatientAdmissionId,
                                                AdmittedOn = admission.AdmissionDate,
                                                Status = admission.AdmissionStatus,
                                                DischaragedOn = admission.DischargeDate,
                                                IPNumber = visit.VisitCode,
                                                visit.PatientId,
                                                visit.PatientVisitId,
                                                BedInformations = (from bedInfos in dbContext.PatientBedInfos
                                                                   join bedFeature in dbContext.BedFeatures on bedInfos.BedFeatureId equals bedFeature.BedFeatureId
                                                                   join bed in dbContext.Beds on bedInfos.BedId equals bed.BedId
                                                                   join ward in dbContext.Wards on bed.WardId equals ward.WardId
                                                                   join emp in dbContext.Employees on bedInfos.CreatedBy equals emp.EmployeeId
                                                                   where bedInfos.PatientVisitId == visit.PatientVisitId
                                                                   select new
                                                                   {
                                                                       CreatedBy = emp.Salutation + " " + emp.FirstName + " " + emp.LastName,
                                                                       bedInfos.CreatedOn,
                                                                       ward.WardId,
                                                                       ward.WardName,
                                                                       BedCode = bed.BedCode,
                                                                       BedFeature = bedFeature.BedFeatureName,
                                                                       StartDate = bedInfos.StartedOn,
                                                                       EndDate = bedInfos.EndedOn,
                                                                       BedPrice = bedInfos.BedPrice,
                                                                       Action = bedInfos.Action,
                                                                       //calculated in clientSide
                                                                       Days = 0,
                                                                   }).ToList().OrderByDescending(a => a.StartDate)
                                            }).ToList().OrderByDescending(a => a.AdmittedOn);
                    responseData.Status = "OK";
                    responseData.Results = admissionHistory;
                }
                else if (reqType == "latest-adt-detail")
                {
                    var admisionDetail = (from admission in dbContext.Admissions
                                          join visit in dbContext.Visits on admission.PatientVisitId equals visit.PatientVisitId
                                          where visit.PatientId == patientId
                                          select new
                                          {
                                              AdmittedOn = admission.AdmissionDate,
                                              IPNumber = visit.VisitCode,
                                              visit.PatientId,
                                              visit.PatientVisitId,
                                              BedInformations = (from bedInfos in dbContext.PatientBedInfos
                                                                 join bedFeature in dbContext.BedFeatures on bedInfos.BedFeatureId equals bedFeature.BedFeatureId
                                                                 join bed in dbContext.Beds on bedInfos.BedId equals bed.BedId
                                                                 join ward in dbContext.Wards on bed.WardId equals ward.WardId
                                                                 where bedInfos.PatientVisitId == visit.PatientVisitId && bedInfos.IsActive == true
                                                                 select new
                                                                 {

                                                                     ward.WardId,
                                                                     WardName = ward.WardName,
                                                                     BedCode = bed.BedCode,
                                                                     BedFeature = bedFeature.BedFeatureName,
                                                                     StartDate = bedInfos.StartedOn,
                                                                     EndDate = bedInfos.EndedOn,
                                                                     BedPrice = bedInfos.BedPrice,
                                                                     Action = bedInfos.Action,
                                                                     //calculated in clientSide
                                                                     Days = 0,
                                                                 }).ToList().OrderByDescending(a => a.StartDate)
                                          }).OrderByDescending(a => a.AdmittedOn).FirstOrDefault();
                    responseData.Status = "OK";
                    responseData.Results = admisionDetail;
                }
                else if (reqType == "admission-sticker")
                {
                    RbacDbContext rbacDbContext = new RbacDbContext(base.connString);
                    MasterDbContext mstDbContext = new MasterDbContext(base.connString);
                    var userList = rbacDbContext.Users.ToList();
                    var countrySubDivList = masterDbContext.CountrySubDivision.ToList();
                    var admissionDetail = (from admission in dbContext.Admissions
                                           join visit in dbContext.Visits on admission.PatientVisitId equals visit.PatientVisitId
                                           join patient in dbContext.Patients on admission.PatientId equals patient.PatientId
                                           join doctor in dbContext.Employees on admission.AdmittingDoctorId equals doctor.EmployeeId
                                           join bedInfos in dbContext.PatientBedInfos on admission.PatientVisitId equals bedInfos.PatientVisitId
                                           join ward in dbContext.Wards on bedInfos.WardId equals ward.WardId
                                           join bed in dbContext.Beds on bedInfos.BedId equals bed.BedId
                                           where admission.PatientVisitId == patientVisitId
                                           select new
                                           {
                                               PatientCode = patient.PatientCode,
                                               PatientName = patient.FirstName + " " + (string.IsNullOrEmpty(patient.MiddleName) ? "" : patient.MiddleName + " ") + patient.LastName,
                                               DateOfBirth = patient.DateOfBirth,
                                               Gender = patient.Gender,
                                               Address = patient.Address,
                                               PhoneNumber = patient.PhoneNumber,
                                               CountrySubDivisionId = patient.CountrySubDivisionId,
                                               InPatientNo = visit.VisitCode,
                                               AdmittingDoctor = doctor.Salutation + ". " + doctor.FirstName + " " + (string.IsNullOrEmpty(doctor.MiddleName) ? "" : doctor.MiddleName + " ") + doctor.LastName,
                                               AdmissionDate = admission.AdmissionDate,
                                               bedInfos.PatientBedInfoId,
                                               Ward = ward.WardName,
                                               BedCode = bed.BedCode,

                                               CareOfPersonName = admission.CareOfPersonName,
                                               CareOfPersonPhoneNo = admission.CareOfPersonPhoneNo,
                                               CareOfPersonRelation = admission.CareOfPersonRelation,

                                               UserId = admission.CreatedBy
                                           }).ToList();

                    var stickerDetail = (from adt in admissionDetail
                                         join user in userList on adt.UserId equals user.EmployeeId
                                         join subDiv in countrySubDivList on adt.CountrySubDivisionId equals subDiv.CountrySubDivisionId
                                         select new
                                         {
                                             adt.PatientBedInfoId,
                                             PatientCode = adt.PatientCode,
                                             PatientName = adt.PatientName,
                                             DateOfBirth = adt.DateOfBirth,
                                             Gender = adt.Gender,
                                             Address = adt.Address,
                                             District = subDiv.CountrySubDivisionName,
                                             PhoneNumber = adt.PhoneNumber,
                                             CountrySubDivisionId = adt.CountrySubDivisionId,
                                             InPatientNo = adt.InPatientNo,
                                             AdmittingDoctor = adt.AdmittingDoctor,
                                             AdmissionDate = adt.AdmissionDate,
                                             Ward = adt.Ward,
                                             BedCode = adt.BedCode,


                                             CareOfPersonName = adt.CareOfPersonName,
                                             CareOfPersonPhoneNo = adt.CareOfPersonPhoneNo,
                                             CareOfPersonRelation = adt.CareOfPersonRelation,

                                             User = user.UserName
                                         }).OrderByDescending(a => a.PatientBedInfoId).FirstOrDefault();
                    responseData.Status = "OK";
                    //using double query since it was throwing exception 'Only primitive types or enumeration types are supported in this context' (when using userList and subDivList in the first query)
                    //didn't find appropriate solution other than this.
                    responseData.Results = stickerDetail;
                }
                else if (reqType == "wrist-band-info")//sud: 6thJan'18
                {
                    RbacDbContext rbacDbContext = new RbacDbContext(base.connString);
                    MasterDbContext mstDbContext = new MasterDbContext(base.connString);





                    var countrySubDivList = masterDbContext.CountrySubDivision.ToList();
                    var wristBandInfo_Temp = (from admission in dbContext.Admissions
                                              join visit in dbContext.Visits on admission.PatientVisitId equals visit.PatientVisitId
                                              join patient in dbContext.Patients on admission.PatientId equals patient.PatientId
                                              join doctor in dbContext.Employees on admission.AdmittingDoctorId equals doctor.EmployeeId
                                              //join bedInfos in dbContext.PatientBedInfos on admission.PatientVisitId equals bedInfos.PatientVisitId
                                              //join ward in dbContext.Wards on bedInfos.WardId equals ward.WardId
                                              //join bed in dbContext.Beds on bedInfos.BedId equals bed.BedId
                                              where admission.PatientVisitId == patientVisitId
                                              select new
                                              {
                                                  PatientCode = patient.PatientCode,
                                                  PatientName = patient.FirstName + " " + (string.IsNullOrEmpty(patient.MiddleName) ? "" : patient.MiddleName + " ") + patient.LastName,
                                                  DateOfBirth = patient.DateOfBirth,
                                                  Gender = patient.Gender,
                                                  Address = patient.Address,
                                                  BloodGroup = patient.BloodGroup,
                                                  PhoneNumber = patient.PhoneNumber,
                                                  CountrySubDivisionId = patient.CountrySubDivisionId,
                                                  InPatientNo = visit.VisitCode,
                                                  AdmittingDoctor = doctor.Salutation + ". " + doctor.FirstName + " " + (string.IsNullOrEmpty(doctor.MiddleName) ? "" : doctor.MiddleName + " ") + doctor.LastName,
                                                  AdmissionDate = admission.AdmissionDate,

                                                  BedInfo = (
                                                    (from bedInfo in dbContext.PatientBedInfos
                                                     where bedInfo.PatientVisitId == patientVisitId && bedInfo.IsActive == true
                                                     join ward in dbContext.Wards
                                                on bedInfo.WardId equals ward.WardId
                                                     join bed in dbContext.Beds
                                                on bedInfo.BedId equals bed.BedId
                                                     //to get the latest bedinfo, we have to take FirstOrDefault after OrderByDescending.
                                                     //PatientBedInfoId needed to sort by latest..
                                                     select new
                                                     {
                                                         BedCode = bed.BedCode,
                                                         Ward = ward.WardName,
                                                         PatientBedInfoId = bedInfo.PatientBedInfoId
                                                     }).OrderByDescending(a => a.PatientBedInfoId).FirstOrDefault()
                                                  ),


                                                  //bedInfos.PatientBedInfoId,
                                                  //Ward = ward.WardName,
                                                  //BedCode = bed.BedCode
                                              }).FirstOrDefault();


                    IpWristBandInfoVM wristBandInfo_Final = new IpWristBandInfoVM();
                    if (wristBandInfo_Temp != null)
                    {
                        wristBandInfo_Final = new IpWristBandInfoVM()
                        {
                            PatientCode = wristBandInfo_Temp.PatientCode,
                            PatientName = wristBandInfo_Temp.PatientName,
                            InPatientNo = wristBandInfo_Temp.InPatientNo,
                            Gender = wristBandInfo_Temp.Gender,
                            DateOfBirth = wristBandInfo_Temp.DateOfBirth.ToString(),
                            BloodGroup = wristBandInfo_Temp.BloodGroup,
                            PhoneNumber = wristBandInfo_Temp.PhoneNumber,
                            AdmittingDoctor = wristBandInfo_Temp.AdmittingDoctor,
                            AdmissionDate = wristBandInfo_Temp.AdmissionDate.ToString(),
                            Address = wristBandInfo_Temp.Address
                        };

                        if (wristBandInfo_Temp.BedInfo != null)
                        {
                            wristBandInfo_Final.Ward = wristBandInfo_Temp.BedInfo.Ward;
                            wristBandInfo_Final.BedCode = wristBandInfo_Temp.BedInfo.BedCode;
                        }
                    }


                    responseData.Status = "OK";
                    responseData.Results = wristBandInfo_Final;

                }
                #region Get:Check For Last Hemodialysis Report
                else if (reqType == "checkForLastReport")
                {

                    var lastHemoReport = (from hemo in dbContext.HemodialysisReport
                                          where hemo.PatientId == patientId
                                          select hemo).FirstOrDefault();
                    if (lastHemoReport != null)
                    {
                        responseData.Results = lastHemoReport;
                        responseData.Status = "OK";
                    }
                }
                #endregion
                #region Get:Check For Last Hemodialysis Report
                else if (reqType == "previousReportList")
                {

                    var hemoReportList = (from hemo in dbContext.HemodialysisReport
                                          where hemo.PatientId == patientId
                                          select hemo);
                    if (hemoReportList != null)
                    {
                        responseData.Results = hemoReportList;
                        responseData.Status = "OK";
                    }
                }
                #endregion
                else if (reqType != null && reqType == "existing-bed-types-for-patientVisit")
                {
                    var existingBedFeature = (from bedtxn in dbContext.PatientBedInfos
                                              where bedtxn.PatientId == patientId && bedtxn.PatientVisitId == patientVisitId
                                              select new
                                              {
                                                  bedtxn.BedFeatureId
                                              }).Distinct().ToList();

                    responseData.Status = "OK";
                    responseData.Results = existingBedFeature;
                }
                else if (reqType == "get-icd10-list")
                {
                    MasterDbContext mstDbContext = new MasterDbContext(base.connString);
                    var icdLists = mstDbContext.ICD10Code.Select(a => new { ICD10Id = a.ICD10ID, icd10Description = a.ICD10Description }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = icdLists;
                }
                else if (reqType == "get-medication-frequency")
                {
                    var frequency = dbContext.MedicationFrequencies.ToList();
                    responseData.Status = "OK";
                    responseData.Results = frequency;
                }
                else if (reqType == "get-discharge-condition-type")
                {
                    var conditions = (from c in dbContext.DischargeConditionTypes
                                      select c).ToList();
                    responseData.Results = conditions;
                    responseData.Status = "OK";
                }
                else if (reqType == "get-delivery-type")
                {
                    var delivery = dbContext.DeliveryTypes.Select(a => a).ToList();
                    responseData.Results = delivery;
                    responseData.Status = "OK";
                }
                else if (reqType == "get-baby-birth-condition")
                {
                    var condition = dbContext.BabyBirthConditions.Select(a => a).ToList();
                    responseData.Results = condition;
                    responseData.Status = "OK";
                }
                else if (reqType == "get-death-type")
                {
                    var condition = dbContext.DeathTypes.Select(a => a).ToList();
                    responseData.Results = condition;
                    responseData.Status = "OK";
                }
                else if (reqType == "get-active-FiscalYear")
                {
                    var year = dbContext.BillingFiscalYears.Where(a => a.IsActive == true).Select(a => a.FiscalYearName).ToList().LastOrDefault();
                    responseData.Results = year;
                    responseData.Status = "OK";
                }
                else if (reqType == "get-Certificate")
                {
                    var countrySubDivList = masterDbContext.CountrySubDivision.ToList();
                    var countryList = masterDbContext.Country.ToList();
                    var result = new
                    {
                        certificate = dbContext.PatientCertificate.Where(a => a.DischargeSummaryId == dischargeSummaryId).Select(a => a).ToList(),
                        PatAddress = (from add in dbContext.Address.AsEnumerable()
                                      where add.PatientId == patientId
                                      select new
                                      {
                                          Street = add.Street1.ToString(),
                                          Country = countryList.Where(c => c.CountryId == add.CountryId).Select(p => p.CountryName).FirstOrDefault(),
                                          CountryDivision = countrySubDivList.Where(c => c.CountrySubDivisionId == add.CountrySubDivisionId).Select(o => o.CountrySubDivisionName).FirstOrDefault(),
                                          Zip = add.ZipCode
                                      }).ToList().FirstOrDefault(),
                    };
                    responseData.Results = result;
                    responseData.Status = "OK";
                }
                else if (reqType == "get-doc-dpt-ward")
                {
                    List<DepartmentModel> deptList = dbContext.Department.Where(d => d.IsActive == true).ToList();
                    int minTimeBeforeCancel = 15;
                    var timeFrmParam = (from param in masterDbContext.CFGParameters
                                        where param.ParameterName == "MinutesBeforeAutoCancelOfReservedBed"
                                        && param.ParameterGroupName.ToLower() == "adt"
                                        select param.ParameterValue).FirstOrDefault();

                    if (!String.IsNullOrEmpty(timeFrmParam))
                    {
                        minTimeBeforeCancel = Int32.Parse(timeFrmParam);
                    }

                    var filteredDeptList = (from d in deptList
                                            where d.IsAppointmentApplicable == true
                                            select new
                                            {
                                                Key = d.DepartmentId,
                                                Value = d.DepartmentName
                                            }).ToList();

                    List<WardModel> wardList = (from ward in dbContext.Wards
                                                where ward.IsActive == true
                                                select ward).ToList();

                    var visitDoctorList = (from emp in dbContext.Employees
                                           join dept in dbContext.Department on (int)emp.DepartmentId equals dept.DepartmentId
                                           where emp.DepartmentId.HasValue && emp.IsActive == true && emp.IsAppointmentApplicable.HasValue && emp.IsAppointmentApplicable == true
                                           select new
                                           {
                                               DepartmentId = dept.DepartmentId,
                                               DepartmentName = dept.DepartmentName,
                                               Key = emp.EmployeeId,
                                               Value = (string.IsNullOrEmpty(emp.Salutation) ? "" : emp.Salutation + ". ") + emp.FirstName + (string.IsNullOrEmpty(emp.MiddleName) ? " " : " " + emp.MiddleName + " ") + emp.LastName
                                           }).ToList();

                    ADTBedReservation reservedBed = (from bedReserv in dbContext.BedReservation
                                                     where bedReserv.PatientId == patientId
                                                     && bedReserv.IsActive == true
                                                     select bedReserv).FirstOrDefault();

                    if (reservedBed != null && reservedBed.ReservedBedInfoId > 0)
                    {
                        reservedBed = ((reservedBed.AdmissionStartsOn).Subtract(System.DateTime.Now).TotalMinutes > minTimeBeforeCancel) ? reservedBed : null;
                    }

                    responseData.Status = "OK";
                    responseData.Results = new { DoctorList = visitDoctorList, DepartmentList = filteredDeptList, WardList = wardList, BedReservedForCurrentPat = reservedBed };
                }
                else if (reqType == "get-emp-favorites")
                {
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                    int empId = currentUser.EmployeeId;

                    List<OrderItemsVM> retList = new List<OrderItemsVM>();

                    var preferenceValue = (from preference in dbContext.EmployeePreferences
                                           where preference.EmployeeId == empId &&
                                           preference.PreferenceName == "Patientpreferences" &&
                                           preference.IsActive == true
                                           select preference.PreferenceValue).FirstOrDefault();
                    if (preferenceValue != null)
                    {
                        XmlDocument prefXmlDocument = new XmlDocument();
                        prefXmlDocument.LoadXml(preferenceValue);
                        // selecting the node of xml Document with tag LabTestId

                        XmlNodeList nodes = prefXmlDocument.GetElementsByTagName("PatientId");
                        List<int> patientIds = new List<int>();
                        for (int i = 0; i < nodes.Count; i++)
                        {
                            int patId = Convert.ToInt32(nodes[i].InnerXml);
                            patientIds.Add(patId);
                        }

                        responseData.Results = patientIds;
                    }
                    responseData.Status = "OK";
                }
                else if (reqType == "get-emp-followup")
                {
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                    int empId = currentUser.EmployeeId;

                    List<OrderItemsVM> retList = new List<OrderItemsVM>();

                    var preferenceValue = (from preference in dbContext.EmployeePreferences
                                           where preference.EmployeeId == empId &&
                                           preference.PreferenceName == "Followuppreferences" &&
                                           preference.IsActive == true
                                           select preference.PreferenceValue).FirstOrDefault();
                    if (preferenceValue != null)
                    {
                        XmlDocument prefXmlDocument = new XmlDocument();
                        prefXmlDocument.LoadXml(preferenceValue);
                        // selecting the node of xml Document with tag LabTestId

                        XmlNodeList nodes = prefXmlDocument.GetElementsByTagName("PatientId");
                        List<int> patientIds = new List<int>();
                        for (int i = 0; i < nodes.Count; i++)
                        {
                            int patId = Convert.ToInt32(nodes[i].InnerXml);
                            patientIds.Add(patId);
                        }

                        responseData.Results = patientIds;
                    }
                    responseData.Status = "OK";
                }
                else if (reqType == "get-nur-favorites")
                {
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                    int empId = currentUser.EmployeeId;

                    List<OrderItemsVM> retList = new List<OrderItemsVM>();

                    var preferenceRow = (from preference in dbContext.EmployeePreferences
                                         where preference.EmployeeId == empId &&
                                         preference.PreferenceName == "NursingPatientPreferences" &&
                                         preference.IsActive == true
                                         select preference).FirstOrDefault();

                    var dischargedDict = dbContext.Admissions.Where(d => d.AdmissionStatus == "discharged").ToDictionary(x => x.PatientVisitId, x => x.AdmissionStatus);

                    XmlDocument removeFromFavList(int visitId)
                    {
                        XmlDocument xdoc = new XmlDocument();
                        xdoc.LoadXml(preferenceRow.PreferenceValue);

                        XmlNodeList nodes = xdoc.SelectNodes("/root/Row/PatientVisitId");

                        foreach (XmlNode node in nodes)
                        {
                            if (node.InnerXml == visitId.ToString())
                            {
                                XmlNode parent = node.ParentNode;
                                parent.ParentNode.RemoveChild(parent);
                            }
                        }
                        preferenceRow.PreferenceValue = xdoc.InnerXml;
                        dbContext.Entry(preferenceRow).Property(p => p.PreferenceValue).IsModified = true;
                        dbContext.SaveChanges();
                        return xdoc;
                    }
                    if ((preferenceRow != null) && (preferenceRow.PreferenceValue != null))
                    {
                        XmlDocument prefXmlDocument = new XmlDocument();
                        prefXmlDocument.LoadXml(preferenceRow.PreferenceValue);
                        var originalxml = preferenceRow.PreferenceValue;
                        XmlNodeList nodes = prefXmlDocument.GetElementsByTagName("PatientVisitId");
                        List<int> patientVisitIds = new List<int>();
                        List<int> favPat = new List<int>();
                        List<int> resultingPat = new List<int>();
                        for (int i = 0; i < nodes.Count; i++)
                        {
                            int patVisitId = Convert.ToInt32(nodes[i].InnerXml);
                            patientVisitIds.Add(patVisitId);
                            if (dischargedDict.ContainsKey(patientVisitIds[i]))
                            {
                                XmlDocument doc = removeFromFavList(patientVisitIds[i]);
                                favPat.Add(patientVisitIds[i]);
                            }
                            else
                            {
                                resultingPat.Add(patientVisitIds[i]);
                            }
                        }
                        responseData.Results = patientVisitIds.Except(favPat).ToList();
                    }
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

        [HttpGet]
        [Route("~/api/Admission/GetAllWardBedInfo")]
        public async Task<IActionResult> GetAllWardBedInfo()
        {
            var _context = new AdmissionDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                var wardBedInfoList = await _context.Beds.GroupBy(bed => bed.WardId).Select(uniqueBedGroup => new
                {
                    WardId = uniqueBedGroup.Key,
                    TotalBed = uniqueBedGroup.Count(),
                    Occupied = uniqueBedGroup.Count(bed => bed.IsOccupied == true),
                    Vacant = uniqueBedGroup.Count(bed => bed.IsOccupied == false)
                }).ToListAsync();
                if (wardBedInfoList == null)
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = "Bed Info Not Found.";
                }
                else
                {
                    responseData.Status = "OK";
                    responseData.Results = wardBedInfoList;
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return Ok(responseData);
        }

        [HttpPost]// POST api/values
        public string Post()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();//type 'object' since we have variable return types
            responseData.Status = "OK";//by default status would be OK, hence assigning at the top


            try
            {
                AdmissionDbContext dbContext = new AdmissionDbContext(base.connString);
                string ipDataString = this.ReadPostData();
                string reqType = this.ReadQueryStringData("reqType");
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

                if (reqType == "Admission")
                {
                    AdmissionModel clientAdt = DanpheJSONConvert.DeserializeObject<AdmissionModel>(ipDataString);

                    var res = CreateAdmissionTransaction(dbContext, clientAdt, connString);

                    var pattNm = dbContext.Patients.ToList().Where(a => a.PatientId == clientAdt.PatientId).FirstOrDefault();
                    var bedcode = clientAdt.PatientBedInfos[0].Bed.BedCode;

                    SmsModel smsmdl = new SmsModel();
                    EmployeeModel docinfo = DanpheJSONConvert.DeserializeObject<EmployeeModel>(ipDataString);
                    var docname = dbContext.Employees.ToList().Where(a => a.EmployeeId == clientAdt.AdmittingDoctorId).Select(a => a.FullName).FirstOrDefault();
                    var patcode = dbContext.Patients.ToList().Where(a => a.PatientId == clientAdt.PatientId).Select(a => a.PatientCode).FirstOrDefault();
                    var smsmsg = "Dear,";
                    var smsmsg1 = "has been admitted to";
                    smsmdl.SmsInformation = smsmsg;
                    smsmdl.PatientId = clientAdt.PatientId;
                    smsmdl.DoctorId = clientAdt.AdmittingDoctorId;
                    smsmdl.CreatedOn = clientAdt.CreatedOn;
                    smsmdl.CreatedBy = clientAdt.CreatedBy;

                    smsmdl.SmsInformation = smsmsg + " " + docname + ",\n" + pattNm.FirstName + " " + pattNm.LastName + " (" + patcode + ") " + smsmsg1 + " " + bedcode;

                    var docnum = dbContext.Employees.ToList().Where(a => a.EmployeeId == clientAdt.AdmittingDoctorId).Select(a => a.ContactNumber).FirstOrDefault();

                    responseData.Results = res;
                    Task.Run(() => PostSMS(smsmdl, docname, dbContext));


                    //clientAdt.CreatedOn = DateTime.Now;
                    //clientAdt.PatientBedInfos[0].CreatedOn = DateTime.Now;
                    //dbContext.Admissions.Add(clientAdt);
                    //dbContext.SaveChanges();
                    //UpdateIsOccupiedStatus(clientAdt.PatientBedInfos[0].BedId, true);
                    //responseData.Results = clientAdt;
                }
                else if (reqType == "discharge-summary")
                {
                    DischargeSummaryModel summary = DanpheJSONConvert.DeserializeObject<DischargeSummaryModel>(ipDataString);
                    summary.CreatedOn = DateTime.Now;
                    dbContext.DischargeSummary.Add(summary);
                    dbContext.SaveChanges();
                    var summaryId = dbContext.DischargeSummary.Where(a => a.PatientVisitId == summary.PatientVisitId).Select(a => a.DischargeSummaryId).FirstOrDefault();
                    summary.DischargeSummaryMedications.ForEach(a =>
                    {
                        a.IsActive = true;
                        a.DischargeSummaryId = summaryId;
                        dbContext.DischargeSummaryMedications.Add(a);
                        dbContext.SaveChanges();
                    });

                    //if (summary.BabyBirthDetails.Count > 0)
                    //{
                    //    summary.BabyBirthDetails.ForEach(a =>
                    //    {
                    //        a.DischargeSummaryId = summaryId;
                    //        dbContext.BabyBirthDetails.Add(a);
                    //        dbContext.SaveChanges();
                    //    });
                    //}
                    responseData.Results = summary;
                }
                else if (reqType == "post-admission-remark")
                {
                    AdmissionModel admission = DanpheJSONConvert.DeserializeObject<AdmissionModel>(ipDataString);
                    admission.CancelledOn = DateTime.Now;
                    dbContext.Admissions.Add(admission);
                    dbContext.SaveChanges();
                    responseData.Results = admission;
                    responseData.Status = "OK";
                }
                else if (reqType == "saveWristBandHTML")
                {
                    string ipStr = this.ReadPostData();
                    //ipDataString is input (HTML string)
                    if (ipStr.Length > 0)
                    {

                        string PrinterName = this.ReadQueryStringData("PrinterName");
                        string FilePath = this.ReadQueryStringData("FilePath");

                        //index:i, taken in filename 
                        var fileName = "ADT_WristBand_" + PrinterName + "_user_" + currentUser.EmployeeId + ".html";
                        byte[] htmlbytearray = System.Text.Encoding.ASCII.GetBytes(ipStr);
                        //saving file to default folder, html file need to be delete after print is called.
                        System.IO.File.WriteAllBytes(@FilePath + fileName, htmlbytearray);



                        responseData.Status = "OK";
                        responseData.Results = 1;
                    }
                }
                //Salakha--18 July :: Restoring cancel dischaged patients Bills 
                else if (reqType == "postCancelDischargeBills")
                {
                    DischargeCancelModel cancelDisch = DanpheJSONConvert.DeserializeObject<DischargeCancelModel>(ipDataString);
                    var res = CancelDischargedInPatient(dbContext, cancelDisch);
                    responseData.Results = res;
                    responseData.Status = "OK";
                }
                #region Post:Hemo Report
                else if (reqType == "submitHemoReport")
                {

                    HemodialysisModel newHemoReport = DanpheJSONConvert.DeserializeObject<HemodialysisModel>(ipDataString);
                    newHemoReport.CreatedOn = System.DateTime.Now;
                    newHemoReport.CreatedBy = currentUser.EmployeeId;
                    newHemoReport.IsSubmittedOn = System.DateTime.Now;
                    dbContext.HemodialysisReport.Add(newHemoReport);
                    dbContext.SaveChanges();
                    responseData.Results = newHemoReport;
                    responseData.Status = "OK";
                }

                #endregion
                else if (reqType == "patient-birth-certificate")
                {
                    PatientCertificateModel report = DanpheJSONConvert.DeserializeObject<PatientCertificateModel>(ipDataString);
                    report.CreatedOn = DateTime.Now;
                    report.CreatedBy = currentUser.EmployeeId;
                    dbContext.PatientCertificate.Add(report);
                    dbContext.SaveChanges();

                    if (report.BabyBirthDetailsId > 0)
                    {
                        var baby = dbContext.BabyBirthDetails.Where(a => a.BabyBirthDetailsId == report.BabyBirthDetailsId).Select(a => a).FirstOrDefault();
                        baby.CertificateNumber = report.CertificateNumber;
                        dbContext.Entry(baby).State = EntityState.Modified;
                        dbContext.SaveChanges();
                    }

                    responseData.Status = "OK";
                }
                else if (reqType == "post-admission-reservation")
                {
                    ADTBedReservation reservedBed = DanpheJSONConvert.DeserializeObject<ADTBedReservation>(ipDataString);
                    string action = this.ReadQueryStringData("actionName");
                    using (var adtDbTransaction = dbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            int minTimeBeforeCancel = 15;
                            var timeFrmParam = (from param in dbContext.CFGParameters
                                                where param.ParameterName == "MinutesBeforeAutoCancelOfReservedBed"
                                                && param.ParameterGroupName.ToLower() == "adt"
                                                select param.ParameterValue).FirstOrDefault();

                            if (!String.IsNullOrEmpty(timeFrmParam))
                            {
                                minTimeBeforeCancel = Int32.Parse(timeFrmParam);
                            }

                            if (!String.IsNullOrEmpty(action) && action.ToLower() == "emergency")
                            {
                                int patVisitId = reservedBed.PatientVisitId.Value;
                                int patId = reservedBed.PatientId;
                                //if (reservedBed.PatientId == 0)
                                //{
                                //    (from visit in dbContext.Visits
                                //     where visit.PatientVisitId == patVisitId
                                //     select visit.PatientId).FirstOrDefault();
                                //}


                                var erPat = dbContext.EmergencyPatient.Where(e => e.PatientId == patId && e.PatientVisitId == patVisitId).FirstOrDefault();
                                if (erPat != null)
                                {
                                    erPat.ERStatus = "finalized";
                                    erPat.FinalizedStatus = "admitted";
                                    erPat.FinalizedOn = System.DateTime.Now;
                                    erPat.FinalizedBy = currentUser.EmployeeId;

                                    dbContext.Entry(erPat).Property(p => p.FinalizedBy).IsModified = true;
                                    dbContext.Entry(erPat).Property(p => p.FinalizedOn).IsModified = true;
                                    dbContext.Entry(erPat).Property(p => p.FinalizedStatus).IsModified = true;
                                    dbContext.Entry(erPat).Property(p => p.ERStatus).IsModified = true;
                                    dbContext.SaveChanges();
                                }
                            }

                            BedModel bedToReserve = dbContext.Beds.Where(b => b.BedId == reservedBed.BedId
                            && b.IsActive == true && b.IsOccupied == false).FirstOrDefault();

                            if (bedToReserve != null)
                            {
                                //if this bed is reserved then it has to be checked for autocancelled
                                if (bedToReserve.IsReserved == true)
                                {
                                    ADTBedReservation oldRes = (from bed in dbContext.BedReservation
                                                                where bed.BedId == bedToReserve.BedId
                                                                && bed.IsActive == true
                                                                select bed).FirstOrDefault();

                                    if (oldRes.AdmissionStartsOn.Subtract(System.DateTime.Now).TotalMinutes <= minTimeBeforeCancel)
                                    {
                                        oldRes.IsAutoCancelled = true;
                                        oldRes.IsActive = false;
                                        oldRes.AutoCancelledOn = System.DateTime.Now;

                                        dbContext.Entry(oldRes).Property(b => b.AutoCancelledOn).IsModified = true;
                                        dbContext.Entry(oldRes).Property(b => b.IsAutoCancelled).IsModified = true;
                                        dbContext.Entry(oldRes).Property(b => b.IsActive).IsModified = true;
                                        dbContext.SaveChanges();
                                    }
                                }


                                bedToReserve.IsReserved = true;
                                dbContext.Entry(bedToReserve).Property(b => b.IsReserved).IsModified = true;
                                dbContext.SaveChanges();

                                reservedBed.CreatedBy = currentUser.EmployeeId;
                                reservedBed.CreatedOn = System.DateTime.Now;
                                reservedBed.ReservedBy = currentUser.EmployeeId;
                                reservedBed.ReservedOn = System.DateTime.Now;
                                reservedBed.IsActive = true;

                                dbContext.BedReservation.Add(reservedBed);
                                dbContext.SaveChanges();

                                adtDbTransaction.Commit();
                                responseData.Status = "OK";
                                responseData.Results = reservedBed;
                            }
                            else
                            {
                                adtDbTransaction.Rollback();
                                responseData.Status = "Failed";
                                responseData.Results = "Cannot Reserve this bed as it may be already booked or occupied";
                            }
                        }
                        catch (Exception ex)
                        {
                            adtDbTransaction.Rollback();
                            throw (ex);
                        }
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
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + "exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        private void PostSMS(SmsModel smsmdl, string docnum, AdmissionDbContext dbContext)
        {
            using (var client = new WebClient())
            {
                {
                    var values = new NameValueCollection();
                    values["from"] = "Demo";
                    values["token"] = "1eZClpxXFuZXd7PJ0xmv";
                    values["to"] = docnum;
                    values["text"] = smsmdl.SmsInformation;
                    var response = client.UploadValues("http://api.sparrowsms.com/v2/sms/", "Post", values);
                    var responseString = Encoding.Default.GetString(response);
                    SmsModel responseSms = DanpheJSONConvert.DeserializeObject<SmsModel>(responseString);
                    //smsmdl.SmsCounter = responseSms.count;
                    //var smscount = smsmdl.SmsCounter;
                    //return responseString; 



                    //if (smscount == 200)


                    dbContext.SmsService.Add(smsmdl);
                    dbContext.SaveChanges();

                }
            }
        }

        private void UpdateIsOccupiedStatus(int bedId, bool status)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                AdmissionDbContext dbContext = new AdmissionDbContext(base.connString);
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

        private object CreateAdmissionTransaction(AdmissionDbContext admissionDb, AdmissionModel admissionFromClient, string connString)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            RbacDbContext rbacDbContext = new RbacDbContext(base.connString);
            var userList = rbacDbContext.Users.ToList();

            using (var dbContextTransaction = admissionDb.Database.BeginTransaction())
            {
                try
                {
                    BillingFiscalYear fiscalYear = BillingBL.GetFiscalYear(base.connString);
                    var currentDate = DateTime.Now;

                    //add visit
                    var visit = VisitBL.GetVisitItemsMapped(admissionFromClient.PatientId,
                        "inpatient",
                        admissionFromClient.AdmittingDoctorId,
                        admissionFromClient.AdmissionDate,
                        currentUser.EmployeeId,
                        connString);
                    visit.DepartmentId = admissionFromClient.RequestingDeptId;
                    admissionDb.Visits.Add(visit);
                    admissionDb.SaveChanges();

                    //adding admission
                    admissionFromClient.CreatedOn = currentDate;
                    admissionFromClient.CreatedBy = currentUser.EmployeeId;
                    admissionFromClient.PatientVisitId = visit.PatientVisitId;
                    admissionFromClient.PatientBedInfos[0].CreatedOn = currentDate;
                    admissionFromClient.PatientBedInfos[0].CreatedBy = currentUser.EmployeeId;
                    admissionFromClient.PatientBedInfos[0].PatientVisitId = visit.PatientVisitId;

                    admissionDb.Admissions.Add(admissionFromClient);

                    //updaing bed status

                    //Check for autocancellation of the bed and cancel accordingly
                    int minTimeBeforeCancel = 15;
                    var timeFrmParam = (from param in admissionDb.CFGParameters
                                        where param.ParameterName == "MinutesBeforeAutoCancelOfReservedBed"
                                        && param.ParameterGroupName.ToLower() == "adt"
                                        select param.ParameterValue).FirstOrDefault();
                    if (!String.IsNullOrEmpty(timeFrmParam))
                    {
                        minTimeBeforeCancel = Int32.Parse(timeFrmParam);
                    }

                    int bedId = admissionFromClient.PatientBedInfos[0].BedId;
                    int reservedBedId = admissionFromClient.PatientBedInfos[0].ReservedBedId.HasValue ? admissionFromClient.PatientBedInfos[0].ReservedBedId.Value : 0;

                    BedModel selBed = admissionDb.Beds.Where(b => b.BedId == bedId
                                        && b.IsActive == true && b.IsOccupied == false).FirstOrDefault();

                    if (selBed != null)
                    {
                        //if this bed is reserved then it has to be checked for autocancelled 
                        //and Is It Reserved by same patient
                        if (selBed.IsReserved == true)
                        {
                            //show who reserved it
                            ADTBedReservation oldRes = (from bed in admissionDb.BedReservation
                                                        where bed.BedId == selBed.BedId
                                                        && bed.IsActive == true
                                                        select bed).FirstOrDefault();

                            //check for this reservation for autocancellation 
                            if (oldRes.AdmissionStartsOn.Subtract(System.DateTime.Now).TotalMinutes <= minTimeBeforeCancel)
                            {
                                oldRes.IsAutoCancelled = true;
                                oldRes.IsActive = false;
                                oldRes.AutoCancelledOn = System.DateTime.Now;

                                admissionDb.Entry(oldRes).Property(b => b.AutoCancelledOn).IsModified = true;
                                admissionDb.Entry(oldRes).Property(b => b.IsAutoCancelled).IsModified = true;
                                admissionDb.Entry(oldRes).Property(b => b.IsActive).IsModified = true;
                                admissionDb.SaveChanges();
                            }
                            //it is other whos has reserved it
                            else if (oldRes.ReservedBedInfoId != reservedBedId)
                            {
                                dbContextTransaction.Rollback();
                                throw new Exception("Selected Bed is either already Reserved or Occupied !");
                            }
                        }

                        //this is patient itself who has reserved it
                        if (reservedBedId > 0)
                        {
                            var resbed = (from res in admissionDb.BedReservation
                                          where res.ReservedBedInfoId == reservedBedId
                                          select res).FirstOrDefault();
                            resbed.IsActive = false;
                            admissionDb.Entry(resbed).Property(b => b.IsActive).IsModified = true;
                            admissionDb.SaveChanges();
                        }


                        selBed.IsReserved = false;
                        selBed.IsOccupied = true;
                        selBed.ModifiedBy = currentUser.EmployeeId;
                        selBed.ModifiedOn = currentDate;
                        admissionDb.Beds.Attach(selBed);
                        admissionDb.Entry(selBed).Property(a => a.IsOccupied).IsModified = true;
                        admissionDb.Entry(selBed).Property(a => a.IsReserved).IsModified = true;
                        admissionDb.Entry(selBed).Property(a => a.ModifiedBy).IsModified = true;
                        admissionDb.Entry(selBed).Property(a => a.ModifiedBy).IsModified = true;


                    }
                    //for return deposit from OP

                    BillingDeposit deposit = (from dpt in admissionDb.BillDeposit
                                              where dpt.PatientId == admissionFromClient.PatientId
                                              select dpt).OrderByDescending(a => a.DepositId).FirstOrDefault();
                    int? depositReceiptNo = BillingBL.GetDepositReceiptNo(connString);
                    if (deposit != null)
                    {
                        //return deposit
                        if (deposit.DepositBalance > 0)
                        {
                            BillingDeposit returnOutPat = new BillingDeposit();
                            returnOutPat.DepositType = ENUM_BillDepositType.ReturnDeposit;// "ReturnDeposit";
                            returnOutPat.Remarks = "Deposit transfer from OutPatient to Inpatient Visit Deposit.";
                            returnOutPat.Amount = deposit.DepositBalance;
                            returnOutPat.IsActive = true;
                            returnOutPat.DepositBalance = 0;
                            returnOutPat.FiscalYearId = fiscalYear.FiscalYearId;
                            returnOutPat.CounterId = admissionFromClient.BilDeposit.CounterId;
                            returnOutPat.CreatedOn = currentDate;
                            returnOutPat.CreatedBy = currentUser.EmployeeId;
                            returnOutPat.PatientId = admissionFromClient.BilDeposit.PatientId;
                            //returnOutPat.PatientVisitId = admissionFromClient.BilDeposit.PatientVisitId;
                            returnOutPat.IsTransferTransaction = true;
                            returnOutPat.ReceiptNo = depositReceiptNo;
                            depositReceiptNo = depositReceiptNo + 1;

                            admissionDb.BillDeposit.Add(returnOutPat);
                            admissionDb.SaveChanges();
                        }


                        //transfer deposit to Inpatient Visit
                        if (deposit.DepositBalance > 0)
                        {
                            BillingDeposit InPatDeposit = new BillingDeposit();

                            InPatDeposit.DepositType = ENUM_BillDepositType.Deposit;// "Deposit";
                            InPatDeposit.Remarks = "Transfered from Outpatient Visit Deposit.";
                            InPatDeposit.Amount = deposit.DepositBalance;
                            InPatDeposit.IsActive = true;
                            InPatDeposit.DepositBalance = deposit.DepositBalance;
                            InPatDeposit.FiscalYearId = fiscalYear.FiscalYearId;
                            InPatDeposit.CounterId = admissionFromClient.BilDeposit.CounterId;
                            InPatDeposit.CreatedOn = currentDate;
                            InPatDeposit.CreatedBy = currentUser.EmployeeId;
                            InPatDeposit.PatientId = admissionFromClient.BilDeposit.PatientId;
                            InPatDeposit.PatientVisitId = visit.PatientVisitId;
                            InPatDeposit.ReceiptNo = depositReceiptNo;
                            depositReceiptNo = depositReceiptNo + 1;
                            InPatDeposit.IsTransferTransaction = true;

                            admissionDb.BillDeposit.Add(InPatDeposit);
                            admissionDb.SaveChanges();
                        }
                    }

                    //adding deposit
                    if (admissionFromClient.BilDeposit.Amount > 0)
                    {
                        admissionFromClient.BilDeposit.CreatedOn = currentDate;
                        //admissionFromClient.BilDeposit.DepositBalance = admissionFromClient.BilDeposit.DepositBalance;
                        admissionFromClient.BilDeposit.CreatedBy = currentUser.EmployeeId;
                        admissionFromClient.BilDeposit.PatientVisitId = visit.PatientVisitId;
                        admissionFromClient.BilDeposit.FiscalYearId = fiscalYear.FiscalYearId;
                        admissionFromClient.BilDeposit.ReceiptNo = depositReceiptNo;
                        admissionDb.BillDeposit.Add(admissionFromClient.BilDeposit);
                    }
                    //adding admission related charges
                    var admissionBillItems = GetADTBillingTransactionItems(admissionDb,
                        admissionFromClient.PatientId,
                        visit.PatientVisitId,
                        admissionFromClient.BilDeposit.CounterId,
                        currentUser.EmployeeId,
                        admissionFromClient.PatientBedInfos[0].BedFeatureId,
                        admissionFromClient.AdmissionDate);

                    foreach (BillingTransactionItemModel itm in admissionBillItems)
                    {
                        if (itm.ServiceDepartmentName == "Bed Charges")
                        {
                            itm.Quantity = 0;
                        }
                        admissionDb.BillTxnItem.Add(itm);
                    }
                    admissionDb.SaveChanges();
                    //commit transaction
                    dbContextTransaction.Commit();

                    var userId = admissionFromClient.BilDeposit.CreatedBy;
                    var username = (from user in userList
                                    where user.EmployeeId == userId
                                    select user.UserName).FirstOrDefault();

                    admissionFromClient.BilDeposit.BillingUser = username;
                    return admissionFromClient;
                }
                catch (Exception ex)
                {
                    //rollback all changes if any error occurs
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        private List<BillingTransactionItemModel> GetADTBillingTransactionItems(AdmissionDbContext admissionDb,
            int patientId,
            int patVisitId,
            int? counterId,
            int? userId,
            int bedFeatureId,
            DateTime currentDate)
        {
            CoreDbContext coreDbContext = new CoreDbContext(connString);
            var parameter = coreDbContext.Parameters.Where(a => a.ParameterGroupName == "ADT" && a.ParameterName == "AutoAddBillingItems").FirstOrDefault();
            var billItems = new List<BillingItemVM>();
            var billingTransactionItems = new List<BillingTransactionItemModel>();
            if (parameter != null && parameter.ParameterValue != null)
            {
                ADTAutoAddItemParameterVM adtParameter = DanpheJSONConvert.DeserializeObject<ADTAutoAddItemParameterVM>(parameter.ParameterValue);
                BillingFiscalYear fiscYear = BillingBL.GetFiscalYear(connString);
                var ProvisionalReceiptNo = BillingBL.GetProvisionalReceiptNo(connString);
                int ProvisionalFiscalYearId = fiscYear.FiscalYearId;

                if (adtParameter != null)
                {
                    //if (adtParameter != null && adtParameter.DoAutoAddBillingItems == true && adtParameter.ItemList.Count > 0)
                    if (adtParameter.DoAutoAddBillingItems == true && adtParameter.ItemList.Count > 0)
                    {
                        //var billItems = (from bilItem in admissionDb.BillItemPrice
                        //                 join servDept in admissionDb.ServiceDepartment on bilItem.ServiceDepartmentId equals servDept.ServiceDepartmentId
                        //                 where bilItem.IntegrationName == "ADMISSION CHARGES (INDOOR)" || bilItem.IntegrationName == "Medical and Resident officer/Nursing Charges"
                        //                 || bilItem.IntegrationName == "Medical Record Charge"
                        //                 select new BillingItemVM
                        //                 {
                        //                     ItemId = bilItem.ItemId,
                        //                     ItemName = bilItem.ItemName,
                        //                     ItemPrice = bilItem.Price,
                        //                     TaxApplicable = bilItem.TaxApplicable,
                        //                     ServiceDepartmentId = bilItem.ServiceDepartmentId,
                        //                     ServiceDepartmentName = servDept.ServiceDepartmentName,
                        //                     ProcedureCode = bilItem.ProcedureCode
                        //                 }).ToList();


                        var allBillItems = (from bilItem in admissionDb.BillItemPrice
                                            join servDept in admissionDb.ServiceDepartment on bilItem.ServiceDepartmentId equals servDept.ServiceDepartmentId
                                            select new BillingItemVM
                                            {
                                                ItemId = bilItem.ItemId,
                                                ItemName = bilItem.ItemName,
                                                ItemPrice = bilItem.Price,
                                                TaxApplicable = bilItem.TaxApplicable,
                                                ServiceDepartmentId = bilItem.ServiceDepartmentId,
                                                ServiceDepartmentName = servDept.ServiceDepartmentName,
                                                ProcedureCode = bilItem.ProcedureCode
                                            }).ToList();

                        adtParameter.ItemList.ForEach(autoItem =>
                        {
                            var billItem = allBillItems.Find(a => a.ServiceDepartmentId == autoItem.ServiceDepartmentId && a.ItemId == autoItem.ItemId);
                            if (billItem != null)
                            {
                                billItems.Add(billItem);
                            }
                        });
                        billItems.ForEach(item =>
                        {
                            billingTransactionItems.Add(GetBillItemsMapped(item, patientId, patVisitId, counterId, userId, currentDate, ProvisionalFiscalYearId, ProvisionalReceiptNo));
                        });
                    }

                    if (adtParameter.DoAutoAddBedItem == true)
                    {
                        var bedFeature = admissionDb.BedFeatures.Where(a => a.BedFeatureId == bedFeatureId).FirstOrDefault();
                        var BedbillItm = (from bilItm in admissionDb.BillItemPrice
                                          join servDept in admissionDb.ServiceDepartment on bilItm.ServiceDepartmentId equals servDept.ServiceDepartmentId
                                          where bilItm.ItemId == bedFeatureId && servDept.IntegrationName == "Bed Charges "
                                          select new BillingItemVM
                                          {
                                              ItemId = bilItm.ItemId,
                                              ItemName = bilItm.ItemName,
                                              ItemPrice = bedFeature.BedPrice,
                                              TaxApplicable = bilItm.TaxApplicable,
                                              ServiceDepartmentId = bilItm.ServiceDepartmentId,
                                              ServiceDepartmentName = servDept.ServiceDepartmentName,
                                              ProcedureCode = bilItm.ProcedureCode
                                          }).FirstOrDefault();
                        billingTransactionItems.Add(GetBillItemsMapped(BedbillItm, patientId, patVisitId, counterId, userId, currentDate, ProvisionalFiscalYearId, ProvisionalReceiptNo));
                    }
                }
            }
            return billingTransactionItems;
        }

        private BillingTransactionItemModel GetBillItemsMapped(BillingItemVM item, int patientId,
            int patVisitId,
            int? counterId,
            int? userId,
            DateTime currentDate,
            int? ProvFiscalYearId,
            int? ProvReceiptNo)
        {
            var billTxnItem = new BillingTransactionItemModel();
            billTxnItem.PatientId = patientId;
            billTxnItem.PatientVisitId = patVisitId;
            billTxnItem.ServiceDepartmentId = item.ServiceDepartmentId;
            billTxnItem.ServiceDepartmentName = item.ServiceDepartmentName;
            billTxnItem.ItemId = item.ItemId;
            billTxnItem.ItemName = item.ItemName;
            billTxnItem.Price = Convert.ToDouble(item.ItemPrice);
            billTxnItem.Quantity = 1;
            billTxnItem.SubTotal = item.ItemPrice * billTxnItem.Quantity;

            billTxnItem.NonTaxableAmount = billTxnItem.SubTotal;
            billTxnItem.TotalAmount = billTxnItem.SubTotal;
            billTxnItem.BillStatus = ENUM_BillingStatus.provisional;// "provisional";
            billTxnItem.CounterId = counterId;
            billTxnItem.CounterDay = currentDate;
            billTxnItem.BillingType = ENUM_BillingType.inpatient;//  "inpatient";
            billTxnItem.ProcedureCode = item.ProcedureCode;
            billTxnItem.CreatedBy = userId;
            billTxnItem.VisitType = ENUM_VisitType.inpatient;// "inpatient";
            billTxnItem.CreatedOn = currentDate;
            billTxnItem.RequisitionDate = currentDate;

            billTxnItem.Tax = 0;
            billTxnItem.TaxableAmount = 0;
            billTxnItem.TaxPercent = 0;
            billTxnItem.DiscountAmount = 0;
            billTxnItem.DiscountPercent = 0;
            billTxnItem.DiscountPercentAgg = 0;
            billTxnItem.ProvisionalFiscalYearId = ProvFiscalYearId;
            billTxnItem.ProvisionalReceiptNo = ProvReceiptNo;
            return billTxnItem;
        }

        private void FreeBed(int bedInfoId, DateTime? endedOn, string status)
        {
            try
            {
                AdmissionDbContext dbContext = new AdmissionDbContext(base.connString);
                PatientBedInfo bedInfo = dbContext.PatientBedInfos
                           .Where(b => b.PatientBedInfoId == bedInfoId)
                           .FirstOrDefault();
                UpdateIsOccupiedStatus(bedInfo.BedId, false);
                //endedOn can get updated from Billing Edit item as well.
                if (bedInfo.EndedOn == null)
                    bedInfo.EndedOn = endedOn;

                //AdmissionModel patAdmissionInfo = dbContext.Admissions.Where(a => a.PatientId == bedInfo.PatientId && a.PatientVisitId == bedInfo.PatientVisitId).FirstOrDefault();

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

                dbContext.Entry(bedInfo).State = EntityState.Modified;
                dbContext.Entry(bedInfo).Property(x => x.CreatedOn).IsModified = false;
                dbContext.Entry(bedInfo).Property(x => x.StartedOn).IsModified = false;
                dbContext.Entry(bedInfo).Property(x => x.CreatedBy).IsModified = false;
                dbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        private void UpdateBillTxnQuantity(PatientBedInfo newBedInfo, int bedInfoId, AdmissionDbContext dbContext)
        {
            try
            {
                //AdmissionDbContext dbContext = new AdmissionDbContext(base.connString);
                PatientBedInfo bedInfo = dbContext.PatientBedInfos
                         .Where(b => b.PatientBedInfoId == bedInfoId)
                         .FirstOrDefault();
                BillingTransactionItemModel txnitm = dbContext.BillTxnItem
                       .Where(itm => itm.PatientId == newBedInfo.PatientId && itm.PatientVisitId == newBedInfo.PatientVisitId
                                && itm.ItemId == bedInfo.BedFeatureId).FirstOrDefault();


                if (txnitm == null)
                {
                    //sud-2March'20 -- Below lines of code crashes when AutoAddBedItem is false in parameter (CMH scenario), so returning if bed item is not found. 
                    return;
                }

                BillingTransactionItemModel txnitmForSameBed = dbContext.BillTxnItem
                   .Where(itm => itm.PatientId == newBedInfo.PatientId && itm.PatientVisitId == newBedInfo.PatientVisitId
                            && itm.ItemId == newBedInfo.BedFeatureId).FirstOrDefault();
                //Update qty for same BedfeatureId
                if (newBedInfo.IsExistBedFeatureId == true)
                {
                    //txnitmForSameBed.Quantity = txnitmForSameBed.Quantity + 1;
                    //txnitmForSameBed.SubTotal = txnitmForSameBed.Quantity * txnitmForSameBed.Price;
                    //txnitmForSameBed.DiscountAmount = (txnitmForSameBed.SubTotal * txnitmForSameBed.DiscountPercent) / 100;
                    //txnitmForSameBed.TotalAmount = txnitmForSameBed.SubTotal - txnitmForSameBed.DiscountAmount;
                    //dbContext.Entry(txnitmForSameBed).State = EntityState.Modified;
                    //dbContext.Entry(txnitmForSameBed).Property(a => a.SubTotal).IsModified = true;
                    //dbContext.Entry(txnitmForSameBed).Property(a => a.DiscountAmount).IsModified = true;
                    //dbContext.Entry(txnitmForSameBed).Property(a => a.TotalAmount).IsModified = true;
                    //dbContext.Entry(txnitmForSameBed).Property(x => x.Quantity).IsModified = true;
                    //dbContext.SaveChanges();
                }

                //Update qty of existing bed after transfer to new bed
                DateTime admDate = dbContext.Admissions.Where(a => a.PatientVisitId == bedInfo.PatientVisitId && a.PatientId == bedInfo.PatientId).Select(a => a.AdmissionDate).FirstOrDefault();
                var tempTime = admDate.TimeOfDay;
                var EndDate = bedInfo.EndedOn.Value.Date;
                var EndDateTime = EndDate + tempTime;
                TimeSpan qty;
                var checkBedFeatureId = dbContext.PatientBedInfos.Where(a => a.PatientVisitId == bedInfo.PatientVisitId && a.PatientId == bedInfo.PatientId && bedInfo.BedFeatureId == a.BedFeatureId).Select(a => a.BedFeatureId).ToList();
                if (bedInfo.EndedOn.Value > EndDateTime)
                {
                    //DateTime date = bedInfo.EndedOn.Value.Date + tempTime;
                    qty = EndDateTime.Subtract(bedInfo.StartedOn.Value);
                    if (checkBedFeatureId.Count > 1)
                    {
                        txnitm.Quantity = (qty.TotalDays > (int)qty.TotalDays) ? (int)qty.TotalDays + 1 + txnitm.Quantity : (int)qty.TotalDays + txnitm.Quantity; //txnitm.Quantity + (int)qty.TotalDays; //-1;
                    }
                    else
                    {
                        txnitm.Quantity = (qty.TotalDays > (int)qty.TotalDays) ? (int)qty.TotalDays + 1 : (int)qty.TotalDays;
                    }
                }
                else
                {
                    qty = bedInfo.EndedOn.Value.Subtract(bedInfo.StartedOn.Value);
                    if (checkBedFeatureId.Count > 1)
                    {
                        txnitm.Quantity = txnitm.Quantity + (int)qty.TotalDays; //-1;
                    }
                    else
                    {
                        txnitm.Quantity = (int)qty.TotalDays;          // (qty.TotalDays > (int)qty.TotalDays) ? (int)qty.TotalDays + 1 : (int)qty.TotalDays;
                    }
                }
                //if (bedInfo.StartedOn.Value.Date == bedInfo.EndedOn.Value.Date)
                //{
                //    //if (txnitm.Quantity != null)
                //    //    txnitm.Quantity = txnitm.Quantity - 1;
                //}
                //else
                //{
                //    if (txnitm.Quantity != null)
                //    {
                //        var StartedOn = Convert.ToDateTime(bedInfo.StartedOn).Date;
                //        var endOn = Convert.ToDateTime(bedInfo.EndedOn).Date;
                //        int totalDays = Convert.ToInt32((endOn - StartedOn).TotalDays);
                //        txnitm.Quantity = txnitm.Quantity + totalDays - 1;
                //    }
                //}


                txnitm.SubTotal = txnitm.Quantity * txnitm.Price;
                txnitm.DiscountAmount = (txnitm.SubTotal * txnitm.DiscountPercent) / 100;
                txnitm.TotalAmount = txnitm.SubTotal - txnitm.DiscountAmount;
                dbContext.Entry(txnitm).State = EntityState.Modified;
                dbContext.Entry(txnitm).Property(x => x.Quantity).IsModified = true;
                dbContext.Entry(txnitm).Property(a => a.SubTotal).IsModified = true;
                dbContext.Entry(txnitm).Property(a => a.DiscountAmount).IsModified = true;
                dbContext.Entry(txnitm).Property(a => a.TotalAmount).IsModified = true;


                dbContext.SaveChanges();




            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        private void UpdateBedInfoQuantity(List<PatientBedInfo> newBedInfo, TimeSpan tempTime)
        {
            try
            {
                AdmissionDbContext dbContext = new AdmissionDbContext(base.connString);
                if (newBedInfo.Count > 0)
                {
                    var totalQty = 0;
                    var PatVisitId = 0;
                    var itemId = 0;
                    newBedInfo.ForEach(a =>
                    {
                        TimeSpan qty;
                        var item = 0;
                        PatVisitId = a.PatientVisitId;
                        itemId = a.BedFeatureId;
                        if (a.EndedOn != null)
                        {
                            var EndDate = a.EndedOn.Value.Date;
                            DateTime EndDateTime = EndDate + tempTime;
                            if (a.EndedOn.Value > EndDateTime)
                            {
                                qty = EndDateTime.Subtract(a.StartedOn.Value);
                                item = (qty.TotalDays > (int)qty.TotalDays) ? (int)qty.TotalDays + 1 : (int)qty.TotalDays;
                            }
                            else
                            {
                                var StartDate = a.StartedOn.Value.Date;
                                DateTime StartDateTime = StartDate + tempTime;
                                EndDateTime = EndDateTime.AddDays(-1);
                                if (a.StartedOn < StartDateTime)
                                {
                                    StartDateTime = StartDateTime.AddDays(-1);
                                }
                                qty = EndDateTime.Subtract(StartDateTime);
                                item = (int)qty.TotalDays; // (qty.TotalDays > (int)qty.TotalDays) ? (int)qty.TotalDays + 1 : (int)qty.TotalDays;
                            }
                            a.BedQuantity = item;
                        }
                        else
                        {
                            a.BedQuantity = 0;
                        }
                        totalQty = totalQty + item;
                        dbContext.PatientBedInfos.Attach(a);
                        dbContext.Entry(a).Property(s => s.BedQuantity).IsModified = true;
                        dbContext.SaveChanges();
                    });
                    BillingTransactionItemModel bill = dbContext.BillTxnItem.Where(k => k.PatientVisitId == PatVisitId && k.ItemId == itemId).Select(s => s).FirstOrDefault();
                    bill.Quantity = totalQty;
                    bill.SubTotal = bill.Quantity * bill.Price;
                    bill.DiscountAmount = (bill.SubTotal * bill.DiscountPercent) / 100;
                    bill.TotalAmount = bill.SubTotal - bill.DiscountAmount;
                    dbContext.Entry(bill).State = EntityState.Modified;
                    dbContext.Entry(bill).Property(x => x.Quantity).IsModified = true;
                    dbContext.Entry(bill).Property(a => a.SubTotal).IsModified = true;
                    dbContext.Entry(bill).Property(a => a.DiscountAmount).IsModified = true;
                    dbContext.Entry(bill).Property(a => a.TotalAmount).IsModified = true;
                    dbContext.SaveChanges();

                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        private object GetAdtReturnData(int patientBedInfoId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {

                AdmissionDbContext dbContext = new AdmissionDbContext(base.connString);
                var result = (from admission in dbContext.Admissions.Include(a => a.Visit.Patient)
                              select new
                              {
                                  PatientAdmissionId = admission.PatientAdmissionId,
                                  VisitCode = admission.Visit.VisitCode,

                                  AdmittedDate = admission.AdmissionDate,
                                  DischargedDate = admission.DischargeDate,
                                  PatientCode = admission.Visit.Patient.PatientCode,
                                  AdmittingDoctorId = admission.AdmittingDoctorId,
                                  Address = admission.Visit.Patient.Address,
                                  PatientVisitId = admission.Visit.PatientVisitId,
                                  PatientId = admission.Visit.Patient.PatientId,
                                  AdmissionNotes = admission.AdmissionNotes,
                                  AdmissionStatus = admission.AdmissionStatus,
                                  //use ShortName instead of this when possible
                                  Name = admission.Visit.Patient.FirstName + " " + (string.IsNullOrEmpty(admission.Visit.Patient.MiddleName) ? "" : admission.Visit.Patient.MiddleName + " ") + admission.Visit.Patient.LastName,
                                  DateOfBirth = admission.Visit.Patient.DateOfBirth,
                                  PhoneNumber = admission.Visit.Patient.PhoneNumber,
                                  BillStatusOnDischarge = admission.BillStatusOnDischarge,
                                  Gender = admission.Visit.Patient.Gender,
                                  BedInformation = (from bedInfos in dbContext.PatientBedInfos
                                                    where (bedInfos.PatientVisitId == admission.Visit.PatientVisitId && bedInfos.PatientBedInfoId == patientBedInfoId)
                                                    select new
                                                    {
                                                        BedId = bedInfos.BedId,
                                                        PatientBedInfoId = bedInfos.PatientBedInfoId,

                                                        WardId = bedInfos.WardId,
                                                        Ward = bedInfos.Ward.WardName,
                                                        BedFeatureId = bedInfos.BedFeatureId,
                                                        BedFeature = bedInfos.BedFeature.BedFeatureName,
                                                        BedCode = bedInfos.Bed.BedCode,
                                                        BedNumber = bedInfos.Bed.BedNumber,
                                                        StartedOn = bedInfos.StartedOn,
                                                        EndedOn = bedInfos.EndedOn,
                                                    }).OrderByDescending(a => a.StartedOn).FirstOrDefault()

                              }).FirstOrDefault();
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        private bool CancelDischargedInPatient(AdmissionDbContext admissionDbContext, DischargeCancelModel cancelDischarge)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            RbacDbContext rbacDbContext = new RbacDbContext(base.connString);
            using (var dbContextTransaction = admissionDbContext.Database.BeginTransaction())
            {
                try
                {
                    // Posting cancel discharged details 
                    cancelDischarge.CreatedOn = DateTime.Now;
                    cancelDischarge.DischargeCancelledBy = currentUser.EmployeeId;
                    cancelDischarge.BillingTransactionId = admissionDbContext.BillingTransactions.Where(c => c.PatientVisitId == cancelDischarge.PatientVisitId && c.InvoiceType != "ip-partial").Select(a => a.BillingTransactionId).FirstOrDefault();
                    admissionDbContext.DischargeCancel.Add(cancelDischarge);

                    //update Patient Admission 
                    var adtPatient = admissionDbContext.Admissions.Where(a => a.PatientVisitId == cancelDischarge.PatientVisitId).Select(a => a).FirstOrDefault();
                    adtPatient.BillStatusOnDischarge = null;
                    adtPatient.DischargeDate = null;
                    adtPatient.DischargedBy = null;
                    adtPatient.DischargeRemarks = null;
                    adtPatient.ModifiedBy = null;
                    adtPatient.AdmissionStatus = "admitted";
                    adtPatient.ModifiedOn = null;
                    //admissionDbContext.Admissions.Attach(adtPatient);
                    admissionDbContext.Entry(adtPatient).State = EntityState.Modified;
                    admissionDbContext.Entry(adtPatient).Property(a => a.BillStatusOnDischarge).IsModified = true;
                    admissionDbContext.Entry(adtPatient).Property(a => a.DischargeDate).IsModified = true;
                    admissionDbContext.Entry(adtPatient).Property(a => a.AdmissionStatus).IsModified = true;

                    //updating bedPatInfo
                    var bedInfo = admissionDbContext.PatientBedInfos.Where(a => a.PatientVisitId == cancelDischarge.PatientVisitId).Select(a => a).OrderByDescending(a => a.PatientBedInfoId).FirstOrDefault();
                    bedInfo.EndedOn = null;
                    admissionDbContext.Entry(bedInfo).Property(a => a.EndedOn).IsModified = true;

                    //updating bed
                    var bed = admissionDbContext.Beds.Where(b => b.BedId == bedInfo.BedId).FirstOrDefault();
                    bed.IsOccupied = true;
                    admissionDbContext.Entry(bed).Property(a => a.IsOccupied).IsModified = true;

                    
                    //restoring patient deposits, if exists
                    var deposits = admissionDbContext.BillDeposit.Where(a => a.PatientVisitId == cancelDischarge.PatientVisitId && a.DepositType != "Deposit").Select(a => a).ToList();
                    if (deposits.Count > 0)
                    {
                        //existing deposit cancels
                        deposits.ForEach(adv =>
                        {
                            //adv.DepositType = ENUM_BillDepositType.DepositCancel;// "depositcancel";
                            //admissionDbContext.Entry(adv).State = EntityState.Modified;
                            //admissionDbContext.Entry(adv).Property(a => a.DepositType).IsModified = true;
                            if (adv.DepositType != ENUM_BillDepositType.ReturnDeposit)
                            {
                                adv.DepositBalance = adv.Amount;
                                adv.DepositType = ENUM_BillDepositType.Deposit;
                                adv.CreatedBy = currentUser.EmployeeId;
                                adv.CreatedOn = DateTime.Now;

                                BillingFiscalYear fiscYear = BillingBL.GetFiscalYear(connString);
                                adv.FiscalYearId = fiscYear.FiscalYearId;
                                adv.ReceiptNo = BillingBL.GetDepositReceiptNo(connString);
                                adv.Remarks = null;
                                adv.CounterId = cancelDischarge.CounterId;
                                adv.PrintCount =0;
                                adv.PaymentMode = "cash";
                                adv.BillingTransactionId = null;
                                admissionDbContext.BillDeposit.Add(adv);

                            }
                        });
                        admissionDbContext.SaveChanges();
                    }

                    //restoring BillingTransactionItems
                    //var ipPatrialBillTxnId = admissionDbContext.BillingTransactions.Where(a => a.PatientVisitId == cancelDischarge.PatientVisitId
                    //&& a.TransactionType == "inpatient" && a.InvoiceType != "ip-partial" && a.ReturnStatus != true).FirstOrDefault();

                    var billtxnitm = admissionDbContext.BillTxnItem.Where(a => a.PatientVisitId == cancelDischarge.PatientVisitId
                    && a.ReturnStatus != true && a.BillingTransactionId == cancelDischarge.BillingTransactionId).Select(a => a).OrderBy(a => a.BillingTransactionItemId).ToList();

                    if (billtxnitm.Count > 0)
                    {
                        var tempTxnId = billtxnitm.Select(a => a.BillingTransactionId).Distinct().FirstOrDefault();

                        var billtxn = admissionDbContext.BillingTransactions.Where(a => a.BillingTransactionId == tempTxnId && a.InvoiceType != "ip-partial").Select(a => a).FirstOrDefault();

                        //Return Entry for billtxnitms
                        var currFiscYear = admissionDbContext.BillingFiscalYears.Where(a => a.IsActive == true).Select(a => a).FirstOrDefault();
                        //generate credit note no for return bills 
                        int? maxCreditNoteNum = admissionDbContext.BillReturns.Where(a => a.FiscalYearId == currFiscYear.FiscalYearId).Max(a => a.CreditNoteNumber);
                        BillInvoiceReturnModel retBill = new BillInvoiceReturnModel();
                        if (maxCreditNoteNum == null || !maxCreditNoteNum.HasValue)
                        {
                            maxCreditNoteNum = 0;

                        }
                        retBill.InvoiceCode = billtxn.InvoiceCode;
                        retBill.RefInvoiceNum = billtxn.InvoiceNo.Value;
                        retBill.FiscalYear = currFiscYear.FiscalYearFormatted;
                        retBill.FiscalYearId = currFiscYear.FiscalYearId;
                        retBill.PatientId = billtxn.PatientId;
                        retBill.CreditNoteNumber = (int?)(maxCreditNoteNum + 1);
                        retBill.CreatedBy = currentUser.EmployeeId;
                        retBill.BillingTransactionId = billtxn.BillingTransactionId;
                        retBill.SubTotal = billtxn.SubTotal;
                        retBill.DiscountAmount = billtxn.DiscountAmount;
                        retBill.TaxableAmount = billtxn.TaxableAmount;
                        retBill.TaxTotal = billtxn.TaxTotal;
                        retBill.TotalAmount = billtxn.TotalAmount;
                        retBill.Remarks = "Return of Cancelled Discharge Patient";
                        retBill.TaxId = billtxn.TaxId;
                        retBill.IsActive = true;
                        retBill.CreatedOn = DateTime.Now;
                        retBill.IsRemoteSynced = false;
                        retBill.CounterId = cancelDischarge.CounterId;
                        admissionDbContext.BillReturns.Add(retBill);
                        admissionDbContext.SaveChanges();


                        //update transactiontable after bill is returned..
                        admissionDbContext.BillingTransactions.Attach(billtxn);
                        billtxn.ReturnStatus = true;
                        admissionDbContext.Entry(billtxn).Property(a => a.ReturnStatus).IsModified = true;
                        admissionDbContext.SaveChanges();

                        // update existing records and making return  
                        billtxnitm.ForEach(bill =>
                        {
                            bill.ReturnQuantity = bill.Quantity;
                            bill.ReturnStatus = true;
                            admissionDbContext.Entry(bill).State = EntityState.Modified;
                            admissionDbContext.Entry(bill).Property(a => a.ReturnQuantity).IsModified = true;
                            admissionDbContext.Entry(bill).Property(a => a.ReturnStatus).IsModified = true;
                        });
                        admissionDbContext.SaveChanges();

                        //New entries for billTxnItems
                        billtxnitm.ForEach(itm =>
                        {
                            BillingTransactionItemModel billingtxn = new BillingTransactionItemModel();
                            billingtxn = itm;
                            billingtxn.BillStatus = ENUM_BillingStatus.provisional;// "provisional";
                            billingtxn.PaidDate = null;
                            billingtxn.BillingTransactionId = null;
                            billingtxn.ReturnQuantity = null;
                            billingtxn.ReturnStatus = null;
                            billingtxn.CounterId = cancelDischarge.CounterId;
                            admissionDbContext.BillTxnItem.Add(billingtxn);
                        });
                    }

                    //updating Discharge Summary 
                    var disSummary = admissionDbContext.DischargeSummary.Where(a => a.PatientVisitId == cancelDischarge.PatientVisitId).Select(a => a).FirstOrDefault();
                    if (disSummary != null)
                    {
                        disSummary.IsDischargeCancel = true;
                        admissionDbContext.Entry(disSummary).State = EntityState.Modified;
                        admissionDbContext.Entry(disSummary).Property(a => a.IsDischargeCancel).IsModified = true;
                    }

                    admissionDbContext.SaveChanges();
                    dbContextTransaction.Commit();
                    return true;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }
        [HttpPut]
        public string Put()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                AdmissionDbContext dbContext = new AdmissionDbContext(base.connString);
                string ipDataString = this.ReadPostData();
                string reqType = this.ReadQueryStringData("reqType");
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                int bedInfoId = ToInt(this.ReadQueryStringData("bedInfoId"));
                int inpatientvisitId = ToInt(this.ReadQueryStringData("inpatientvisitId"));
                int patientVisitId = ToInt(this.ReadQueryStringData("patientVisitId"));
                int AdmissionPatientId = ToInt(this.ReadQueryStringData("AdmissionPatientId"));
                string ProcedureType = this.ReadQueryStringData("ProcedureType");
                string action = this.ReadQueryStringData("actionName");

                //we need to update the transaction id on the Deposit Table 
                if (reqType == "discharge")
                {
                    AdmissionModel clientAdt = DanpheJSONConvert.DeserializeObject<AdmissionModel>(ipDataString);
                    dbContext.Admissions.Attach(clientAdt);
                    FreeBed(bedInfoId, clientAdt.DischargeDate, clientAdt.AdmissionStatus);
                    clientAdt.ModifiedOn = DateTime.Now;
                    dbContext.Entry(clientAdt).State = EntityState.Modified;
                    dbContext.Entry(clientAdt).Property(x => x.CreatedOn).IsModified = false;
                    dbContext.Entry(clientAdt).Property(x => x.CreatedBy).IsModified = false;
                    dbContext.Entry(clientAdt).Property(x => x.AdmissionDate).IsModified = false;
                    dbContext.SaveChanges();
                    responseData.Status = "OK";
                    responseData.Results = clientAdt.DischargeDate;
                }
                else if (reqType == "clear-due")
                {

                    AdmissionModel admission = dbContext.Admissions.Where(b => b.PatientVisitId == patientVisitId).FirstOrDefault();
                    if (admission != null)
                    {
                        admission.BillStatusOnDischarge = "paid";
                        admission.ModifiedBy = currentUser.EmployeeId;
                        admission.ModifiedOn = DateTime.Now;
                        dbContext.Entry(admission).Property(a => a.BillStatusOnDischarge).IsModified = true;
                        dbContext.Entry(admission).Property(a => a.ModifiedBy).IsModified = true;
                        dbContext.Entry(admission).Property(a => a.ModifiedOn).IsModified = true;
                        dbContext.SaveChanges();
                        responseData.Status = "OK";
                    }

                }
                else if (reqType == "transfer-upgrade")
                {
                    var transferredFrom = this.ReadQueryStringData("transferredFrom");
                    PatientBedInfo newBedInfo = DanpheJSONConvert.DeserializeObject<PatientBedInfo>(ipDataString);

                    //FreeBed(bedInfoId, newBedInfo.StartedOn, "transfer");   
                    PatientBedInfo oldBedInfo = dbContext.PatientBedInfos
                           .Where(b => b.PatientBedInfoId == bedInfoId)
                           .FirstOrDefault();

                    int oldBedId = oldBedInfo.BedId;

                    using (var dbTransaction = dbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            //UpdateIsOccupiedStatus(oldBedInfo.BedId, false);
                            //endedOn can get updated from Billing Edit item as well.
                            if (oldBedInfo.EndedOn == null)
                            { oldBedInfo.EndedOn = newBedInfo.StartedOn; }

                            newBedInfo.BedOnHoldEnabled = false;

                            oldBedInfo.OutAction = "transfer";

                            dbContext.Entry(oldBedInfo).State = EntityState.Modified;
                            dbContext.Entry(oldBedInfo).Property(x => x.CreatedOn).IsModified = false;
                            dbContext.Entry(oldBedInfo).Property(x => x.StartedOn).IsModified = false;
                            dbContext.Entry(oldBedInfo).Property(x => x.CreatedBy).IsModified = false;


                            var oldBed = dbContext.Beds.Where(b => b.BedId == oldBedId).FirstOrDefault();
                            oldBed.IsOccupied = false;
                            dbContext.Entry(oldBed).State = EntityState.Modified;

                            //UpdateIsOccupiedStatus(newBedInfo.BedId, true);
                            var newBed = dbContext.Beds.Where(b => b.BedId == newBedInfo.BedId).FirstOrDefault();
                            newBed.IsOccupied = true;
                            dbContext.Entry(newBed).State = EntityState.Modified;
                            //anish: 19 May,2020---Reserve the bed until accepted if parameter is set true
                            if (!String.IsNullOrEmpty(transferredFrom) && transferredFrom == "nursing")
                            {
                                newBedInfo.BedOnHoldEnabled = true;
                                var paramList = (from param in dbContext.CFGParameters
                                                 where (param.ParameterName == "ReservePreviousBedDuringTransferFromNursing"
                                                 || param.ParameterName == "AutoCancellationOfTransferReserveInMins")
                                                 select param).AsNoTracking().ToList();

                                var resPrevBed = paramList.Where(v => v.ParameterName == "ReservePreviousBedDuringTransferFromNursing").FirstOrDefault();
                                var autocancelDetail = paramList.Where(v => v.ParameterName == "AutoCancellationOfTransferReserveInMins").FirstOrDefault();

                                if (resPrevBed != null && resPrevBed.ParameterValue == "true")
                                {
                                    oldBed.OnHold = true;
                                    oldBed.HoldedOn = newBedInfo.StartedOn;
                                    dbContext.Entry(oldBed).Property(x => x.OnHold).IsModified = true;
                                    dbContext.Entry(oldBed).Property(x => x.HoldedOn).IsModified = true;

                                    newBed.OnHold = true;
                                    newBed.HoldedOn = newBedInfo.StartedOn;
                                    dbContext.Entry(newBed).Property(x => x.OnHold).IsModified = true;
                                    dbContext.Entry(newBed).Property(x => x.HoldedOn).IsModified = true;
                                }
                            }


                            dbContext.Entry(oldBed).Property(x => x.IsOccupied).IsModified = true;

                            dbContext.Entry(newBed).Property(x => x.IsOccupied).IsModified = true;

                            dbContext.SaveChanges();

                            CoreDbContext coreDbContext = new CoreDbContext(connString);

                            //sud: read the paramter value and assign to it.. 
                            //this is the json format for parameter value of this:  {"DoAutoAddBillingItems":false,"DoAutoAddBedItem":false,"ItemList":[{ "ServiceDepartmentId":2,"ItemId":10}]"}
                            //we need to first read the value from this parameter.. 
                            bool isAutoAddBedItems = CommonFunctions.GetCoreParameterValueByKeyName_Boolean(coreDbContext, "ADT", "AutoAddBillingItems", "DoAutoAddBedItem");


                            //sud:30Apr'20--update billtxnqty only if autoaddbeditems is true..
                            if (isAutoAddBedItems == true)
                            {
                                UpdateBillTxnQuantity(newBedInfo, bedInfoId, dbContext);
                            }


                            newBedInfo.CreatedOn = DateTime.Now;
                            dbContext.PatientBedInfos.Add(newBedInfo);


                            //sud:30Apr'20--update BedChargeBilItm only if autoaddbeditems is true..
                            if (isAutoAddBedItems == true && newBedInfo.BedChargeBilItm.ItemId > 0)
                            {
                                //bed charges billing txn item
                                newBedInfo.BedChargeBilItm.RequisitionDate = System.DateTime.Now;
                                newBedInfo.BedChargeBilItm.CreatedOn = System.DateTime.Now;
                                newBedInfo.BedChargeBilItm.Quantity = 0;
                                dbContext.BillTxnItem.Add(newBedInfo.BedChargeBilItm);
                            }

                            dbContext.SaveChanges();
                            dbTransaction.Commit();
                            responseData.Status = "OK";
                            responseData.Results = GetAdtReturnData(newBedInfo.PatientBedInfoId);
                        }
                        catch (Exception ex)
                        {
                            dbTransaction.Rollback();
                            throw ex;
                        }
                    }

                }
                else if (reqType == "change-admission-info")
                {
                    PatientBedInfoVM clientBedInfo = DanpheJSONConvert.DeserializeObject<PatientBedInfoVM>(ipDataString);
                    if (clientBedInfo != null)
                    {
                        PatientBedInfo serverBedInfo = (from patbed in dbContext.PatientBedInfos
                                                        where patbed.PatientBedInfoId == clientBedInfo.PatientBedInfoId
                                                        select patbed).FirstOrDefault();
                        if (serverBedInfo != null)
                        {
                            //Hom 13 Jan, 2019
                            if (serverBedInfo.Action == "admission")
                            {
                                AdmissionModel admission = (from adm in dbContext.Admissions
                                                            where adm.PatientVisitId == serverBedInfo.PatientVisitId
                                                            select adm).FirstOrDefault();
                                VisitModel patVisit = (from visit in dbContext.Visits
                                                       where visit.PatientVisitId == serverBedInfo.PatientVisitId
                                                       select visit).FirstOrDefault();
                                if (clientBedInfo.StartedOn != null)
                                {
                                    admission.AdmissionDate = clientBedInfo.StartedOn.Value;
                                    patVisit.VisitDate = clientBedInfo.StartedOn.Value;
                                    dbContext.Entry(admission).Property(a => a.AdmissionDate).IsModified = true;
                                    dbContext.Entry(patVisit).Property(a => a.VisitDate).IsModified = true;
                                    dbContext.SaveChanges();
                                }
                            }
                            //previous bed's ended on is next bed's startedon
                            PatientBedInfo previousbedinfo = (from patbed in dbContext.PatientBedInfos
                                                              where patbed.PatientVisitId == clientBedInfo.PatientVisitId && (DbFunctions.TruncateTime(patbed.EndedOn) == DbFunctions.TruncateTime(serverBedInfo.StartedOn))
                                                              select patbed).FirstOrDefault();

                            PatientBedInfo nextbedinfo = (from patbedinfo in dbContext.PatientBedInfos
                                                          where patbedinfo.PatientVisitId == clientBedInfo.PatientVisitId && (DbFunctions.TruncateTime(patbedinfo.StartedOn) == DbFunctions.TruncateTime(serverBedInfo.EndedOn))
                                                          select patbedinfo).FirstOrDefault();
                            if (previousbedinfo != null)
                            {
                                previousbedinfo.EndedOn = clientBedInfo.StartedOn;
                                dbContext.Entry(previousbedinfo).Property(a => a.EndedOn).IsModified = true;
                            }
                            if (nextbedinfo != null)
                            {
                                nextbedinfo.StartedOn = clientBedInfo.EndedOn;
                                dbContext.Entry(nextbedinfo).Property(a => a.StartedOn).IsModified = true;
                            }
                            serverBedInfo.StartedOn = clientBedInfo.StartedOn;
                            serverBedInfo.EndedOn = clientBedInfo.EndedOn;

                            //update billingItemQty in billingtransactionItems
                            DateTime admDate = dbContext.Admissions.Where(a => a.PatientVisitId == serverBedInfo.PatientVisitId && a.PatientId == serverBedInfo.PatientId).Select(a => a.AdmissionDate).FirstOrDefault();
                            var tempTime = admDate.TimeOfDay;
                            List<PatientBedInfo> ChangedBed = (from bed in dbContext.PatientBedInfos
                                                               where bed.PatientVisitId == serverBedInfo.PatientVisitId
                                                                 && bed.BedFeatureId == serverBedInfo.BedFeatureId
                                                               select bed).ToList();
                            UpdateBedInfoQuantity(ChangedBed, tempTime);

                            if (previousbedinfo != null)
                            {
                                List<PatientBedInfo> previousBed = (from bed in dbContext.PatientBedInfos
                                                                    where bed.PatientVisitId == previousbedinfo.PatientVisitId
                                                                      && bed.BedFeatureId == previousbedinfo.BedFeatureId
                                                                    select bed).ToList();
                                UpdateBedInfoQuantity(previousBed, tempTime);
                            }
                            if (nextbedinfo != null)
                            {
                                List<PatientBedInfo> nextBed = (from bed in dbContext.PatientBedInfos
                                                                where bed.PatientVisitId == nextbedinfo.PatientVisitId
                                                                  && bed.BedFeatureId == nextbedinfo.BedFeatureId
                                                                select bed).ToList();
                                UpdateBedInfoQuantity(nextBed, tempTime);
                            }
                            dbContext.SaveChanges();
                            dbContext.Entry(serverBedInfo).Property(a => a.StartedOn).IsModified = true;
                            dbContext.Entry(serverBedInfo).Property(a => a.EndedOn).IsModified = true;
                            dbContext.SaveChanges();
                        }
                        responseData.Results = serverBedInfo;
                        responseData.Status = "OK";
                    }


                }
                else if (reqType == "change-admitting-doctor")
                {
                    UpdateAdmittingDoctorVM admittingDoc = DanpheJSONConvert.DeserializeObject<UpdateAdmittingDoctorVM>(ipDataString);
                    if (admittingDoc != null)
                    {
                        AdmissionModel admission = dbContext.Admissions.FirstOrDefault(adt => adt.PatientVisitId == admittingDoc.PatientVisitId);
                        VisitModel patVisit = dbContext.Visits.FirstOrDefault(visit => visit.PatientVisitId == admittingDoc.PatientVisitId);
                        admission.AdmittingDoctorId = admittingDoc.AdmittingDoctorId;
                        patVisit.ProviderId = admittingDoc.AdmittingDoctorId;
                        patVisit.ProviderName = admittingDoc.AdmittingDoctorName;
                        dbContext.Entry(admission).Property(a => a.AdmittingDoctorId).IsModified = true;
                        dbContext.Entry(patVisit).Property(a => a.ProviderId).IsModified = true;
                        dbContext.Entry(patVisit).Property(a => a.ProviderName).IsModified = true;
                        dbContext.SaveChanges();
                        responseData.Status = "OK";
                    }
                }
                else if (reqType == "discharge-summary")
                {
                    DischargeSummaryModel summary = DanpheJSONConvert.DeserializeObject<DischargeSummaryModel>(ipDataString);
                    dbContext.DischargeSummary.Attach(summary);
                    dbContext.Entry(summary).State = EntityState.Modified;
                    dbContext.Entry(summary).Property(x => x.CreatedOn).IsModified = false;
                    dbContext.Entry(summary).Property(x => x.CreatedBy).IsModified = false;
                    summary.ModifiedOn = System.DateTime.Now;
                    dbContext.SaveChanges();


                    if (summary.DischargeSummaryMedications.Count > 0)
                    {
                        List<DischargeSummaryMedication> medicines = dbContext.DischargeSummaryMedications.Where(a => a.DischargeSummaryId == summary.DischargeSummaryId && a.IsActive == true).ToList();
                        medicines.ForEach(a =>
                        {
                            a.IsActive = false;
                            dbContext.Entry(a).State = EntityState.Modified;
                            dbContext.Entry(a).Property(x => x.IsActive).IsModified = true;
                            dbContext.SaveChanges();
                        });

                        summary.DischargeSummaryMedications.ForEach(a =>
                        {
                            DischargeSummaryMedication medi = new DischargeSummaryMedication();
                            medi = a;
                            medi.DischargeSummaryId = summary.DischargeSummaryId;
                            medi.IsActive = true;
                            dbContext.DischargeSummaryMedications.Add(medi);
                            dbContext.SaveChanges();
                        });

                    }

                    //if (summary.BabyBirthDetails != null)
                    //{
                    //    var babydetails = dbContext.BabyBirthDetails.Where(a => a.DischargeSummaryId == summary.DischargeSummaryId).Select(a => a).ToList();
                    //    babydetails.ForEach(a =>
                    //    {
                    //        dbContext.BabyBirthDetails.Remove(a);
                    //    });
                    //    summary.BabyBirthDetails.ForEach(a =>
                    //    {
                    //        BabyBirthDetailsModel medi = new BabyBirthDetailsModel();
                    //        medi = a;
                    //        medi.DischargeSummaryId = summary.DischargeSummaryId;
                    //        dbContext.BabyBirthDetails.Add(medi);
                    //        dbContext.SaveChanges();
                    //    });
                    //}

                    responseData.Results = summary;
                    responseData.Status = "OK";
                }

                //ashim:30Sep2018
                else if (reqType == "discharge-frombilling")
                {
                    DischargeDetailVM dischargeDetail = DanpheJSONConvert.DeserializeObject<DischargeDetailVM>(ipDataString);
                    AdmissionModel admission = dbContext.Admissions.FirstOrDefault(adt => adt.PatientVisitId == dischargeDetail.PatientVisitId);
                    if (dischargeDetail != null && dischargeDetail.PatientId != 0)
                    {
                        //Transaction Begins  
                        using (var dbContextTransaction = dbContext.Database.BeginTransaction())
                        {
                            try
                            {
                                PatientBedInfo bedInfo = dbContext.PatientBedInfos
                        .Where(bed => bed.PatientVisitId == dischargeDetail.PatientVisitId)
                        .OrderByDescending(bed => bed.PatientBedInfoId).FirstOrDefault();

                                admission.AdmissionStatus = "discharged";
                                admission.DischargeDate = dischargeDetail.DischargeDate;
                                admission.BillStatusOnDischarge = dischargeDetail.BillStatus;
                                admission.DischargedBy = currentUser.EmployeeId;
                                admission.ModifiedBy = currentUser.EmployeeId;
                                admission.ModifiedOn = DateTime.Now;
                                admission.ProcedureType = dischargeDetail.ProcedureType;

                                FreeBed(bedInfo.PatientBedInfoId, dischargeDetail.DischargeDate, admission.AdmissionStatus);

                                dbContext.Entry(admission).Property(a => a.DischargedBy).IsModified = true;
                                dbContext.Entry(admission).Property(a => a.AdmissionStatus).IsModified = true;
                                dbContext.Entry(admission).Property(a => a.DischargeDate).IsModified = true;
                                dbContext.Entry(admission).Property(a => a.BillStatusOnDischarge).IsModified = true;
                                dbContext.Entry(admission).Property(a => a.ModifiedBy).IsModified = true;
                                dbContext.Entry(admission).Property(a => a.ProcedureType).IsModified = true;
                                //dbContext.Entry(admission).Property(a => a.ModifiedBy).IsModified = true;
                                dbContext.SaveChanges();
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

                //Yubraj: 20th Dec '18
                else if (reqType == "update-Procedure")
                {
                    AdmissionModel patAdms = (from patAdmission in dbContext.Admissions
                                              where patAdmission.PatientAdmissionId == AdmissionPatientId
                                              select patAdmission).FirstOrDefault();

                    if (patAdms != null)
                    {
                        patAdms.ProcedureType = ProcedureType;
                        patAdms.ModifiedBy = currentUser.EmployeeId;
                        patAdms.ModifiedOn = currentUser.ModifiedOn;
                        dbContext.Entry(patAdms).Property(a => a.ProcedureType).IsModified = true;
                        dbContext.Entry(patAdms).Property(a => a.ModifiedBy).IsModified = true;
                        dbContext.Entry(patAdms).Property(a => a.ModifiedOn).IsModified = true;

                        dbContext.SaveChanges();
                        responseData.Status = "OK";
                    }

                }
                //yubaraj--14th Nov '18 :: cancel admission
                else if (reqType == "cancel-admission")
                {
                    //not required in this case as there is nojson string passed from client side 
                    //BillingTransactionItemModel billingTransactionItem = DanpheJSONConvert.DeserializeObject<BillingTransactionItemModel>(ipDataString);
                    AdmissionCancelVM admissionCancelDetail = DanpheJSONConvert.DeserializeObject<AdmissionCancelVM>(ipDataString);
                    if (admissionCancelDetail != null && admissionCancelDetail.PatientVisitId != 0)
                    {
                        //Transaction Begins  
                        using (var dbContextTransaction = dbContext.Database.BeginTransaction())
                        {
                            try
                            {
                                //---------------------------------------------- Phase 1 --------------------------------------------
                                //============================ Update cancel in patientAdmission through patientVisitId ============================			
                                //1. Update in ADT_PatientAdmission AdmissionStatus = "cancel", ModifiedOn and ModifiedBy
                                AdmissionModel patAdms = (from patAdmission in dbContext.Admissions
                                                          join pBed in dbContext.PatientBedInfos on patAdmission.PatientVisitId equals pBed.PatientVisitId
                                                          where patAdmission.PatientVisitId == admissionCancelDetail.PatientVisitId
                                                          select patAdmission).FirstOrDefault();

                                if (patAdms != null)
                                {
                                    patAdms.AdmissionStatus = "cancel";
                                    patAdms.CancelledRemark = admissionCancelDetail.CancelledRemark;
                                    patAdms.CancelledOn = admissionCancelDetail.CancelledOn;
                                    patAdms.CancelledBy = currentUser.EmployeeId;
                                    patAdms.ModifiedBy = currentUser.EmployeeId;
                                    dbContext.Entry(patAdms).Property(a => a.AdmissionStatus).IsModified = true;
                                    dbContext.Entry(patAdms).Property(a => a.CancelledRemark).IsModified = true;
                                    dbContext.Entry(patAdms).Property(a => a.CancelledOn).IsModified = true;

                                }

                                VisitModel currentIpVisit = (from ipVisit in dbContext.Visits
                                                             where ipVisit.PatientVisitId == admissionCancelDetail.PatientVisitId
                                                             select ipVisit).FirstOrDefault();
                                if (currentIpVisit != null)
                                {
                                    currentIpVisit.BillingStatus = ENUM_BillingStatus.cancel;// "cancel";
                                    currentIpVisit.VisitStatus = ENUM_VisitStatus.cancel;//  "cancel";
                                    currentIpVisit.ModifiedOn = DateTime.Now;
                                    currentIpVisit.ModifiedBy = currentUser.EmployeeId;
                                    currentIpVisit.Remarks = "Admission Cancel: " + admissionCancelDetail.CancelledRemark;
                                    dbContext.Entry(currentIpVisit).Property(a => a.ModifiedOn).IsModified = true;
                                    dbContext.Entry(currentIpVisit).Property(a => a.ModifiedBy).IsModified = true;
                                    dbContext.Entry(currentIpVisit).Property(a => a.BillingStatus).IsModified = true;
                                    dbContext.Entry(currentIpVisit).Property(a => a.VisitStatus).IsModified = true;
                                    dbContext.Entry(currentIpVisit).Property(a => a.Remarks).IsModified = true;
                                }
                                //2.Update in ADT_TXN_PatientBedInfo table Action = "cancel" , EndedOn = canceled DateTime, Cancel Remarks
                                List<PatientBedInfo> patBedInfo = (from patBed in dbContext.PatientBedInfos
                                                                   where patBed.PatientVisitId == admissionCancelDetail.PatientVisitId
                                                                   select patBed).ToList();

                                if (patBedInfo != null)
                                {
                                    patBedInfo.ForEach(bedInfo =>
                                    {
                                        bedInfo.Action = "cancel";
                                        bedInfo.EndedOn = DateTime.Now;
                                        bedInfo.Remarks = "Admission Cancel: " + admissionCancelDetail.CancelledRemark;
                                        FreeBed(bedInfo.PatientBedInfoId, bedInfo.EndedOn, "cancel");
                                        dbContext.Entry(bedInfo).Property(a => a.PatientVisitId).IsModified = true;
                                    });
                                }

                                //3.Update in ADT_Bed IsOccupied = false
                                BedModel bedModel = (from bed in dbContext.Beds
                                                     join patBed in dbContext.PatientBedInfos on bed.BedId equals patBed.BedId
                                                     where patBed.PatientVisitId == admissionCancelDetail.PatientVisitId
                                                     select bed).FirstOrDefault();

                                //Database attach
                                //which is updated 

                                if (bedModel != null)
                                {
                                    bedModel.IsOccupied = false;
                                    bedModel.ModifiedOn = DateTime.Now;
                                    bedModel.ModifiedBy = currentUser.EmployeeId;
                                    dbContext.Entry(bedModel).Property(a => a.IsOccupied).IsModified = true;
                                    dbContext.Entry(bedModel).Property(a => a.ModifiedOn).IsModified = true;
                                    dbContext.Entry(bedModel).Property(a => a.ModifiedBy).IsModified = true;
                                    dbContext.SaveChanges();
                                }

                                //------------------------------------------ PHASE 2 ------------------------------------------------
                                //cancelling autogenerated items from BillingTransaction table
                                List<BillingTransactionItemModel> autogeneratedItems = (from bil in dbContext.BillTxnItem
                                                                                        join mstItm in dbContext.BillItemPrice on new { bil.ServiceDepartmentId, bil.ItemId } equals new { mstItm.ServiceDepartmentId, mstItm.ItemId }
                                                                                        where bil.PatientVisitId == admissionCancelDetail.PatientVisitId
                                                                                        && (mstItm.IntegrationName == "ADMISSION CHARGES (INDOOR)"
                                                                                        || mstItm.IntegrationName == "Medical and Resident officer/Nursing Charges"
                                                                                        || mstItm.IntegrationName == "Medical Record Charge")
                                                                                        select bil).ToList();
                                if (autogeneratedItems != null)
                                {
                                    autogeneratedItems.ForEach(item =>
                                    {
                                        item.BillStatus = ENUM_BillingStatus.cancel;// "cancel";
                                        item.CancelledOn = DateTime.Now;
                                        item.CancelledBy = currentUser.EmployeeId;
                                        item.CancelRemarks = "Admission cancel: " + admissionCancelDetail.CancelledRemark;
                                        dbContext.Entry(item).Property(a => a.BillStatus).IsModified = true;
                                    });

                                }

                                //cancel bed items in billiing transaciton item
                                List<BillingTransactionItemModel> bedItems = (from bill in dbContext.BillTxnItem
                                                                              join srv in dbContext.ServiceDepartment on bill.ServiceDepartmentId equals srv.ServiceDepartmentId
                                                                              where bill.PatientVisitId == admissionCancelDetail.PatientVisitId
                                                                              && srv.IntegrationName == "Bed Charges"
                                                                              select bill).ToList();
                                if (bedItems != null)
                                {

                                    bedItems.ForEach(bedItem =>
                                    {
                                        bedItem.BillStatus = ENUM_BillingStatus.cancel; //"cancel";
                                        bedItem.CancelledOn = DateTime.Now;
                                        bedItem.CancelledBy = currentUser.EmployeeId;
                                        bedItem.CancelRemarks = "Admission cancel: " + admissionCancelDetail.CancelledRemark;
                                        dbContext.Entry(bedItem).Property(a => a.BillStatus).IsModified = true;
                                    });

                                }
                                //we need to update cancel of autogenerated items in database at this point.
                                //since we need to update uncancelled items i.e lab/radiology to outpatient.
                                dbContext.SaveChanges();
                                //================ Update PaitentVisitId and VisitType in respective tables ============================
                                //  #Note:
                                //       1. BillingTransactionItems.ItemId and ADT_TXN_PatientBedInfo.FeatureId are same 
                                //Get All the BillingTransactionItems against that InpatientVisit

                                //get patient's latest outpatient visit or emergency visit
                                int? LatestVisitId = null;
                                string latestVisitType = "outpatient";
                                DateTime TodayDate = DateTime.Now;

                                VisitModel patVisit = (from visit in dbContext.Visits
                                                       where (visit.PatientVisitId == admissionCancelDetail.PatientVisitId)
                                                        && ((visit.VisitType == ENUM_VisitType.outpatient || visit.VisitType == ENUM_VisitType.emergency)
                                                       //&& ((visit.VisitType == "outpatient" || visit.VisitType == "emergency")
                                                       && (DbFunctions.TruncateTime(visit.VisitDate) == DbFunctions.TruncateTime(TodayDate)))
                                                       select visit).ToList().OrderByDescending(a => a.PatientVisitId).FirstOrDefault();
                                if (patVisit != null)
                                {
                                    LatestVisitId = patVisit.PatientVisitId;
                                    latestVisitType = patVisit.VisitType;
                                }



                                //update other items as outpatient visit item
                                List<BillingTransactionItemModel> otherBillItems = (from bil in dbContext.BillTxnItem
                                                                                    where bil.PatientVisitId == admissionCancelDetail.PatientVisitId
                                                                                    && bil.BillStatus != ENUM_BillingStatus.cancel // "cancel"
                                                                                    select bil).ToList();
                                if (otherBillItems != null)
                                {
                                    otherBillItems.ForEach(bill =>
                                    {
                                        ServiceDepartmentModel srvDept = dbContext.ServiceDepartment.Where(a => a.ServiceDepartmentId == bill.ServiceDepartmentId)
                                                .FirstOrDefault();
                                        //update patientvisitid and visittype for billing transaction item
                                        bill.PatientVisitId = LatestVisitId;
                                        bill.VisitType = latestVisitType;
                                        bill.BillingType = latestVisitType == ENUM_VisitType.emergency ? ENUM_BillingType.outpatient : latestVisitType;
                                        //bill.BillingType = latestVisitType == "emergency" ? "outpatient" : latestVisitType;
                                        bill.Remarks = "Admission cancel: " + admissionCancelDetail.CancelledRemark;
                                        dbContext.Entry(bill).Property(a => a.PatientVisitId).IsModified = true;
                                        dbContext.Entry(bill).Property(a => a.VisitType).IsModified = true;
                                        dbContext.Entry(bill).Property(a => a.Remarks).IsModified = true;

                                        //update in respective lab departments requisitions
                                        if (srvDept != null && srvDept.IntegrationName != null && srvDept.IntegrationName.ToLower() == "lab")
                                        {
                                            LabRequisitionModel labReqs = dbContext.LabRequisitions.Where(a => a.RequisitionId == bill.RequisitionId).FirstOrDefault();
                                            //update patientvisitid and visittype for billing transaction item
                                            if (labReqs != null)
                                            {
                                                labReqs.PatientVisitId = LatestVisitId;
                                                labReqs.VisitType = latestVisitType;
                                                labReqs.ModifiedBy = currentUser.EmployeeId;
                                                labReqs.ModifiedOn = DateTime.Now;
                                                dbContext.Entry(labReqs).Property(a => a.PatientVisitId).IsModified = true;
                                                dbContext.Entry(labReqs).Property(a => a.VisitType).IsModified = true;
                                                dbContext.Entry(labReqs).Property(a => a.ModifiedBy).IsModified = true;
                                                dbContext.Entry(labReqs).Property(a => a.ModifiedOn).IsModified = true;


                                            }
                                        }

                                        //update in respective radiologydepartments requisitions
                                        else if (srvDept != null && srvDept.IntegrationName != null && srvDept.IntegrationName.ToLower() == "radiology")
                                        {
                                            ImagingRequisitionModel redioReq = dbContext.ImagingRequisitions.Where(a => a.ImagingRequisitionId == bill.RequisitionId).FirstOrDefault();

                                            if (redioReq != null)
                                            {
                                                redioReq.PatientVisitId = LatestVisitId;
                                                redioReq.ModifiedBy = currentUser.EmployeeId;
                                                redioReq.ModifiedOn = DateTime.Now;
                                                dbContext.Entry(redioReq).Property(a => a.PatientVisitId).IsModified = true;
                                                dbContext.Entry(redioReq).Property(a => a.ModifiedBy).IsModified = true;
                                                dbContext.Entry(redioReq).Property(a => a.ModifiedOn).IsModified = true;
                                            }
                                        }
                                    });
                                }


                                //----------------------------------------- PHASE 3 ------------------------------------------
                                //============================ Return Deposit and Display Receipt ============================			
                                //get patient's depositbalance
                                //step:4-- if there's deposit balance, then add a return transaction to deposit table. 

                                BillingDeposit latestDeposit = (from deposit in dbContext.BillDeposit
                                                                where deposit.PatientVisitId == admissionCancelDetail.PatientVisitId
                                                                select deposit).OrderByDescending(a => a.DepositId).FirstOrDefault();

                                BillingDeposit returnDepositDetail = null;
                                if (latestDeposit != null && latestDeposit.DepositBalance != null && latestDeposit.DepositBalance > 0)
                                {
                                    EmployeeModel currentEmp = dbContext.Employees.Where(emp => emp.EmployeeId == currentUser.EmployeeId).FirstOrDefault();
                                    returnDepositDetail = new BillingDeposit()
                                    {
                                        DepositType = ENUM_BillDepositType.ReturnDeposit,// "ReturnDeposit",
                                        Remarks = "Admission cancel: " + admissionCancelDetail.CancelledRemark,
                                        Amount = latestDeposit.DepositBalance,
                                        DepositBalance = 0,
                                        ReceiptNo = BillingBL.GetDepositReceiptNo(connString),
                                        FiscalYearId = latestDeposit.FiscalYearId,
                                        CounterId = latestDeposit.CounterId,
                                        CreatedBy = latestDeposit.CreatedBy,
                                        CreatedOn = DateTime.Now,
                                        PatientId = latestDeposit.PatientId,
                                        PatientVisitId = latestDeposit.PatientVisitId,
                                        PaymentMode = latestDeposit.PaymentMode,
                                        PaymentDetails = latestDeposit.PaymentDetails,
                                        FiscalYear = BillingBL.GetFiscalYear(connString).FiscalYearFormatted,
                                        BillingUser = currentEmp.FirstName + " " + currentEmp.LastName,
                                        IsActive = true//sud:21Mar'19 -- if not active then it'll give wrong balance in Billing Transaction Page.
                                    };

                                    dbContext.BillDeposit.Add(returnDepositDetail);

                                }
                                dbContext.SaveChanges();
                                dbContextTransaction.Commit(); //end of transaction
                                responseData.Status = "OK";
                                responseData.Results = returnDepositDetail;
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
                else if (reqType == "update-birth-certificate")
                {
                    PatientCertificateModel report = DanpheJSONConvert.DeserializeObject<PatientCertificateModel>(ipDataString);
                    dbContext.PatientCertificate.Attach(report);
                    dbContext.Entry(report).State = EntityState.Modified;
                    dbContext.SaveChanges();

                    if (report.BabyBirthDetailsId > 0)
                    {
                        var baby = dbContext.BabyBirthDetails.Where(a => a.BabyBirthDetailsId == report.BabyBirthDetailsId).Select(a => a).FirstOrDefault();
                        baby.CertificateNumber = report.CertificateNumber;
                        dbContext.Entry(baby).State = EntityState.Modified;
                        dbContext.SaveChanges();
                    }
                    responseData.Status = "OK";
                }
                else if (reqType == "update-admission-reservation")
                {
                    ADTBedReservation bedReservationToUpdate = DanpheJSONConvert.DeserializeObject<ADTBedReservation>(ipDataString);
                    int newBedId = bedReservationToUpdate.BedId;

                    int minTimeBeforeCancel = 15;
                    var timeFrmParam = (from param in dbContext.CFGParameters
                                        where param.ParameterName == "MinutesBeforeAutoCancelOfReservedBed"
                                        && param.ParameterGroupName.ToLower() == "adt"
                                        select param.ParameterValue).FirstOrDefault();

                    if (!String.IsNullOrEmpty(timeFrmParam))
                    {
                        minTimeBeforeCancel = Int32.Parse(timeFrmParam);
                    }

                    using (var resTransaction = dbContext.Database.BeginTransaction())
                    {
                        try
                        {

                            var resToUpdate = (from res in dbContext.BedReservation
                                               where res.ReservedBedInfoId == bedReservationToUpdate.ReservedBedInfoId
                                               && res.IsActive == true
                                               select res).FirstOrDefault();

                            int oldBedId = resToUpdate.BedId;


                            resToUpdate.AdmissionNotes = bedReservationToUpdate.AdmissionNotes;
                            resToUpdate.RequestingDepartmentId = bedReservationToUpdate.RequestingDepartmentId;
                            resToUpdate.AdmittingDoctorId = bedReservationToUpdate.AdmittingDoctorId;
                            resToUpdate.WardId = bedReservationToUpdate.WardId;
                            resToUpdate.BedFeatureId = bedReservationToUpdate.BedFeatureId;
                            resToUpdate.BedId = bedReservationToUpdate.BedId;
                            resToUpdate.AdmissionStartsOn = bedReservationToUpdate.AdmissionStartsOn;
                            resToUpdate.ModifiedOn = bedReservationToUpdate.ModifiedOn;
                            resToUpdate.ModifiedBy = bedReservationToUpdate.ModifiedBy;

                            if (oldBedId != newBedId)
                            {
                                var bedToReserve = (from bd in dbContext.Beds
                                                    where bd.BedId == newBedId && bd.IsActive && bd.IsOccupied == false
                                                    select bd
                                             ).FirstOrDefault();

                                //if this bed is reserved then it has to be checked for autocancelled
                                if (bedToReserve.IsReserved == true)
                                {
                                    ADTBedReservation oldRes = (from bed in dbContext.BedReservation
                                                                where bed.BedId == bedToReserve.BedId
                                                                && bed.IsActive == true
                                                                select bed).FirstOrDefault();

                                    if (oldRes.AdmissionStartsOn.Subtract(System.DateTime.Now).TotalMinutes <= minTimeBeforeCancel)
                                    {
                                        oldRes.IsAutoCancelled = true;
                                        oldRes.AutoCancelledOn = System.DateTime.Now;
                                        oldRes.IsActive = false;

                                        dbContext.Entry(oldRes).Property(b => b.AutoCancelledOn).IsModified = true;
                                        dbContext.Entry(oldRes).Property(b => b.AutoCancelledOn).IsModified = true;
                                        dbContext.Entry(oldRes).Property(b => b.IsActive).IsModified = true;
                                        dbContext.SaveChanges();
                                    }
                                }


                                resToUpdate.ReservedBy = bedReservationToUpdate.ReservedBy;
                                resToUpdate.ReservedOn = bedReservationToUpdate.ReservedOn;
                                dbContext.Entry(resToUpdate).Property(a => a.ReservedOn).IsModified = true;
                                dbContext.Entry(resToUpdate).Property(a => a.ReservedBy).IsModified = true;
                            }

                            resToUpdate.ModifiedBy = currentUser.EmployeeId;
                            resToUpdate.ModifiedOn = System.DateTime.Now;

                            dbContext.Entry(resToUpdate).Property(a => a.AdmissionNotes).IsModified = true;
                            dbContext.Entry(resToUpdate).Property(a => a.RequestingDepartmentId).IsModified = true;
                            dbContext.Entry(resToUpdate).Property(a => a.WardId).IsModified = true;
                            dbContext.Entry(resToUpdate).Property(a => a.AdmittingDoctorId).IsModified = true;
                            dbContext.Entry(resToUpdate).Property(a => a.BedFeatureId).IsModified = true;
                            dbContext.Entry(resToUpdate).Property(a => a.BedId).IsModified = true;
                            dbContext.Entry(resToUpdate).Property(a => a.AdmissionStartsOn).IsModified = true;
                            dbContext.Entry(resToUpdate).Property(a => a.ModifiedBy).IsModified = true;
                            dbContext.Entry(resToUpdate).Property(a => a.ModifiedOn).IsModified = true;

                            dbContext.SaveChanges();

                            if (oldBedId != newBedId)
                            {
                                var oldBed = (from bd in dbContext.Beds
                                              where bd.BedId == oldBedId && bd.IsReserved == true
                                              select bd).FirstOrDefault();
                                oldBed.IsReserved = false;
                                oldBed.ModifiedBy = currentUser.EmployeeId;
                                oldBed.ModifiedOn = System.DateTime.Now;
                                dbContext.Entry(oldBed).Property(a => a.IsReserved).IsModified = true;
                                dbContext.Entry(oldBed).Property(a => a.ModifiedBy).IsModified = true;
                                dbContext.Entry(oldBed).Property(a => a.ModifiedOn).IsModified = true;
                                dbContext.SaveChanges();

                                var newBed = (from bd in dbContext.Beds
                                              where bd.BedId == newBedId && bd.IsOccupied == false
                                              && bd.IsActive == true
                                              select bd).FirstOrDefault();
                                newBed.IsReserved = true;
                                newBed.ModifiedBy = currentUser.EmployeeId;
                                newBed.ModifiedOn = System.DateTime.Now;
                                dbContext.Entry(newBed).Property(a => a.IsReserved).IsModified = true;
                                dbContext.Entry(newBed).Property(a => a.ModifiedBy).IsModified = true;
                                dbContext.Entry(newBed).Property(a => a.ModifiedOn).IsModified = true;

                                dbContext.SaveChanges();
                            }

                            resTransaction.Commit();

                        }
                        catch (Exception ex)
                        {
                            resTransaction.Rollback();
                            throw ex;
                        }
                    }
                    responseData.Status = "OK";
                }
                else if (reqType == "cancel-admission-reservation")
                {
                    int resIdToCancel = DanpheJSONConvert.DeserializeObject<int>(ipDataString);
                    using (var resTransaction = dbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            var resToUpdate = (from res in dbContext.BedReservation
                                               where res.ReservedBedInfoId == resIdToCancel && res.IsActive == true
                                               select res).FirstOrDefault();

                            int bedId = resToUpdate.BedId;

                            resToUpdate.IsActive = false;
                            resToUpdate.CancelledBy = currentUser.EmployeeId;
                            resToUpdate.CancelledOn = System.DateTime.Now;

                            dbContext.Entry(resToUpdate).Property(a => a.IsActive).IsModified = true;
                            dbContext.Entry(resToUpdate).Property(a => a.CancelledBy).IsModified = true;
                            dbContext.Entry(resToUpdate).Property(a => a.CancelledOn).IsModified = true;

                            dbContext.SaveChanges();

                            var currBed = (from bd in dbContext.Beds
                                           where bd.BedId == bedId && bd.IsOccupied == false
                                           && bd.IsReserved == true
                                           select bd).FirstOrDefault();

                            if (currBed != null)
                            {
                                currBed.IsReserved = false;
                                currBed.ModifiedBy = currentUser.EmployeeId;
                                currBed.ModifiedOn = System.DateTime.Now;
                                dbContext.Entry(currBed).Property(a => a.IsReserved).IsModified = true;
                                dbContext.Entry(currBed).Property(a => a.ModifiedBy).IsModified = true;
                                dbContext.Entry(currBed).Property(a => a.ModifiedOn).IsModified = true;
                            }


                            dbContext.SaveChanges();

                            resTransaction.Commit();

                        }
                        catch (Exception ex)
                        {
                            resTransaction.Rollback();
                            throw ex;
                        }
                    }
                    responseData.Status = "OK";
                }
                else if (reqType == "undo-transfer")
                {
                    int patVisitId = DanpheJSONConvert.DeserializeObject<int>(ipDataString);
                    string remarks = this.ReadQueryStringData("cancelRemarks");
                    using (var resTransaction = dbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            var resPrevBed = (from param in dbContext.CFGParameters
                                              where param.ParameterName == "ReservePreviousBedDuringTransferFromNursing"
                                              select param.ParameterValue).AsNoTracking().FirstOrDefault();

                            if (resPrevBed != null && resPrevBed == "true")
                            {

                                var dataToUpdate = (from binfo in dbContext.PatientBedInfos
                                                    where binfo.IsActive == true && binfo.PatientVisitId == patVisitId
                                                    select binfo).OrderByDescending(d => d.PatientBedInfoId).Take(2).ToList();

                                //0 th element is Latest and 1 is before that
                                //Update the bedInfo as patient was not received, so set the Latest info status to isActive=false
                                dataToUpdate[0].IsActive = false;
                                dataToUpdate[0].Remarks = remarks;
                                dataToUpdate[0].CancelledBy = currentUser.EmployeeId;
                                dataToUpdate[0].CancelledOn = System.DateTime.Now;
                                dataToUpdate[0].CancelRemarks = remarks;
                                dbContext.Entry(dataToUpdate[0]).State = EntityState.Modified;
                                dbContext.Entry(dataToUpdate[0]).Property(x => x.IsActive).IsModified = true;
                                dbContext.Entry(dataToUpdate[0]).Property(x => x.Remarks).IsModified = true;
                                dbContext.Entry(dataToUpdate[0]).Property(x => x.CancelledBy).IsModified = true;
                                dbContext.Entry(dataToUpdate[0]).Property(x => x.CancelledOn).IsModified = true;

                                //Update bed where patient was transferred but not received
                                int lastBedId = dataToUpdate[0].BedId;
                                var occupiedHolded = dbContext.Beds.Where(b => b.BedId == lastBedId).FirstOrDefault();

                                if (occupiedHolded.OnHold.HasValue && occupiedHolded.OnHold == true)
                                {
                                    occupiedHolded.IsOccupied = false;
                                    occupiedHolded.OnHold = null;
                                    occupiedHolded.HoldedOn = null;
                                }

                                dbContext.Entry(occupiedHolded).State = EntityState.Modified;
                                dbContext.Entry(occupiedHolded).Property(x => x.IsOccupied).IsModified = true;
                                dbContext.Entry(occupiedHolded).Property(x => x.OnHold).IsModified = true;
                                dbContext.Entry(occupiedHolded).Property(x => x.HoldedOn).IsModified = true;

                                //Update the bedInfo as patient was not received, so set the Previous info status to null outaction
                                dataToUpdate[1].OutAction = null;
                                dataToUpdate[1].EndedOn = null;
                                dbContext.Entry(dataToUpdate[1]).State = EntityState.Modified;
                                dbContext.Entry(dataToUpdate[1]).Property(x => x.OutAction).IsModified = true;
                                dbContext.Entry(dataToUpdate[1]).Property(x => x.EndedOn).IsModified = true;

                                //Update bed where patient was previously
                                int secondLastBedId = dataToUpdate[1].BedId;
                                var initialHolded = dbContext.Beds.Where(b => b.BedId == secondLastBedId).FirstOrDefault();
                                initialHolded.IsOccupied = true;
                                initialHolded.OnHold = null;
                                initialHolded.HoldedOn = null;
                                dbContext.Entry(initialHolded).Property(x => x.IsOccupied).IsModified = true;
                                dbContext.Entry(initialHolded).Property(x => x.OnHold).IsModified = true;
                                dbContext.Entry(initialHolded).Property(x => x.HoldedOn).IsModified = true;

                                dbContext.SaveChanges();

                            }
                            else
                            {
                                //var bedInfoToUpdate = (from res in dbContext.PatientBedInfos
                                //                       where res.PatientBedInfoId == bedInfoIdToUndo && res.IsActive == true
                                //                       select res).FirstOrDefault();

                                //int bedId = bedInfoToUpdate.BedId;
                                //bedInfoToUpdate.IsActive = false;
                                //bedInfoToUpdate.ModifiedBy = currentUser.EmployeeId;
                                //bedInfoToUpdate.ModifiedOn = System.DateTime.Now;

                                //dbContext.Entry(bedInfoToUpdate).Property(a => a.IsActive).IsModified = true;
                                //dbContext.Entry(bedInfoToUpdate).Property(a => a.ModifiedBy).IsModified = true;
                                //dbContext.Entry(bedInfoToUpdate).Property(a => a.ModifiedOn).IsModified = true;

                                //var currBed = (from bd in dbContext.Beds
                                //               where bd.BedId == bedId
                                //               select bd).FirstOrDefault();

                                //if (currBed != null)
                                //{
                                //    currBed.IsReserved = false;
                                //    currBed.ModifiedBy = currentUser.EmployeeId;
                                //    currBed.ModifiedOn = System.DateTime.Now;
                                //    dbContext.Entry(currBed).Property(a => a.IsReserved).IsModified = true;
                                //    dbContext.Entry(currBed).Property(a => a.ModifiedBy).IsModified = true;
                                //    dbContext.Entry(currBed).Property(a => a.ModifiedOn).IsModified = true;
                                //}

                                //dbContext.SaveChanges();

                            }

                            resTransaction.Commit();

                        }
                        catch (Exception ex)
                        {
                            resTransaction.Rollback();
                            throw ex;
                        }
                    }
                    responseData.Status = "OK";
                }
                else if (reqType == "receive-transfer")
                {
                    NotesModel NotesMaster = DanpheJSONConvert.DeserializeObject<NotesModel>(ipDataString);
                    int patVisitId = NotesMaster.PatientVisitId;
                    using (var resTransaction = dbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            var dataToUpdate = (from bedInfo in dbContext.PatientBedInfos
                                                where bedInfo.IsActive == true && bedInfo.PatientVisitId == patVisitId
                                                select bedInfo).OrderByDescending(d => d.PatientBedInfoId).Take(2).ToList();

                            //Update the received by detail in the Patient Bed Info
                            dataToUpdate[0].ReceivedBy = currentUser.EmployeeId;
                            dataToUpdate[0].ReceivedOn = NotesMaster.ReceivedOn;
                            dbContext.Entry(dataToUpdate[0]).State = EntityState.Modified;
                            dbContext.Entry(dataToUpdate[0]).Property(x => x.ReceivedBy).IsModified = true;
                            dbContext.Entry(dataToUpdate[0]).Property(x => x.ReceivedOn).IsModified = true;

                            //Update bed where patient was transferred to and is received
                            int lastBedId = dataToUpdate[0].BedId;
                            var occupiedHolded = dbContext.Beds.Where(b => b.BedId == lastBedId).FirstOrDefault();

                            //incase of count =1, it is the case of Admission Receive rather than Receiving the Transfer
                            if ((dataToUpdate.Count == 1) || (occupiedHolded.OnHold.HasValue && occupiedHolded.OnHold == true && occupiedHolded.IsReserved != true))
                            {
                                occupiedHolded.OnHold = null;
                                occupiedHolded.HoldedOn = null;
                            }
                            else
                            {
                                throw new Exception("Already Used by other patient! Please check again.");
                            }

                            dbContext.Entry(occupiedHolded).State = EntityState.Modified;
                            dbContext.Entry(occupiedHolded).Property(x => x.OnHold).IsModified = true;
                            dbContext.Entry(occupiedHolded).Property(x => x.HoldedOn).IsModified = true;

                            //Update the older bed info by setting to isActive False
                            //dataToUpdate[1].IsActive = false;
                            //dbContext.Entry(dataToUpdate[1]).State = EntityState.Modified;
                            //dbContext.Entry(dataToUpdate[1]).Property(x => x.IsActive).IsModified = true;

                            //Update bed from where the patient was transferred
                            if (dataToUpdate.Count > 1)
                            {
                                int secondLastBedId = dataToUpdate[1].BedId;
                                var initialHolded = dbContext.Beds.Where(b => b.BedId == secondLastBedId).FirstOrDefault();
                                initialHolded.IsOccupied = false;
                                initialHolded.OnHold = null;
                                initialHolded.HoldedOn = null;
                                dbContext.Entry(initialHolded).Property(x => x.IsOccupied).IsModified = true;
                                dbContext.Entry(initialHolded).Property(x => x.OnHold).IsModified = true;
                                dbContext.Entry(initialHolded).Property(x => x.HoldedOn).IsModified = true;
                            }

                            dbContext.SaveChanges();


                            ClinicalDbContext clinicalDbContext = new ClinicalDbContext(connString);
                            if (NotesMaster.PatientId != 0)
                            {
                                NotesMaster.CreatedOn = DateTime.Now;
                                NotesMaster.CreatedBy = currentUser.EmployeeId;
                                dbContext.Notes.Add(NotesMaster);
                                dbContext.SaveChanges();
                                var Notesid = NotesMaster.NotesId;

                                NotesMaster.FreeTextNote.NotesId = Notesid;
                                NotesMaster.FreeTextNote.PatientVisitId = NotesMaster.PatientVisitId;
                                NotesMaster.FreeTextNote.PatientId = NotesMaster.PatientId;
                                NotesMaster.FreeTextNote.CreatedBy = currentUser.EmployeeId;
                                NotesMaster.FreeTextNote.CreatedOn = DateTime.Now;
                                NotesMaster.FreeTextNote.IsActive = true;
                                clinicalDbContext.FreeText.Add(NotesMaster.FreeTextNote);
                                clinicalDbContext.SaveChanges();

                            }

                            resTransaction.Commit();

                        }
                        catch (Exception ex)
                        {
                            resTransaction.Rollback();
                            throw ex;
                        }

                        // resTransaction.Commit();
                    }
                    responseData.Status = "OK";


                }
                else
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = "Invalid request type";
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

        private void UpdateNotReceivedTransferredBed(AdmissionDbContext dbContext)
        {
            //Until the Receive is done, both transferred from and transferred in PatientBedInfo are set true
            //check for the Bed to be Free incase of transfer if Not Received or Time has exceeded the limit to hold                    
            var paramList = (from param in dbContext.CFGParameters
                             where (param.ParameterName == "ReservePreviousBedDuringTransferFromNursing"
                             || param.ParameterName == "AutoCancellationOfTransferReserveInMins")
                             select param).AsNoTracking().ToList();

            var resPrevBed = paramList.Where(v => v.ParameterName == "ReservePreviousBedDuringTransferFromNursing").Select(v => v.ParameterValue).FirstOrDefault();
            var autoCancelReserveMins = paramList.Where(v => v.ParameterName == "AutoCancellationOfTransferReserveInMins").Select(v => v.ParameterValue).FirstOrDefault();
            if (resPrevBed != null && resPrevBed == "true")
            {
                int timeInHrsBeforeCancel = 360;
                if (autoCancelReserveMins != null)
                {
                    timeInHrsBeforeCancel = Convert.ToInt32(autoCancelReserveMins);
                }
                var holdTimeBuffer = System.DateTime.Now.AddMinutes(-timeInHrsBeforeCancel);
                var dataToBeUpdated = (from bedInfo in dbContext.PatientBedInfos
                                       where bedInfo.Action == "transfer" && String.IsNullOrEmpty(bedInfo.OutAction)
                                       && (!bedInfo.ReceivedBy.HasValue && bedInfo.StartedOn.Value < holdTimeBuffer)
                                       && bedInfo.IsActive == true && bedInfo.BedOnHoldEnabled == true
                                       select bedInfo.PatientVisitId).ToList();
                if (dataToBeUpdated.Count > 0)
                {
                    foreach (var visId in dataToBeUpdated)
                    {
                        var dataToUpdate = (from binfo in dbContext.PatientBedInfos
                                            where binfo.IsActive == true && binfo.PatientVisitId == visId
                                            select binfo).OrderByDescending(d => d.PatientBedInfoId).Take(2).ToList();

                        //0 th element is Latest and 1 is before that
                        //Update the bedInfo as patient was not received, so set the Latest info status to isActive=false
                        dataToUpdate[0].IsActive = false;
                        dbContext.Entry(dataToUpdate[0]).State = EntityState.Modified;
                        dbContext.Entry(dataToUpdate[0]).Property(x => x.IsActive).IsModified = true;

                        //Update bed where patient was transferred but not received
                        int lastBedId = dataToUpdate[0].BedId;
                        var occupiedHolded = dbContext.Beds.Where(b => b.BedId == lastBedId).FirstOrDefault();

                        if (occupiedHolded.OnHold.HasValue || occupiedHolded.OnHold == true)
                        {
                            occupiedHolded.IsOccupied = false;
                            occupiedHolded.OnHold = null;
                            occupiedHolded.HoldedOn = null;
                        }

                        dbContext.Entry(occupiedHolded).State = EntityState.Modified;
                        dbContext.Entry(occupiedHolded).Property(x => x.IsOccupied).IsModified = true;
                        dbContext.Entry(occupiedHolded).Property(x => x.OnHold).IsModified = true;
                        dbContext.Entry(occupiedHolded).Property(x => x.HoldedOn).IsModified = true;

                        //Update the bedInfo as patient was not received, so set the Previous info status to null outaction
                        dataToUpdate[1].OutAction = null;
                        dataToUpdate[1].EndedOn = null;
                        dbContext.Entry(dataToUpdate[1]).State = EntityState.Modified;
                        dbContext.Entry(dataToUpdate[1]).Property(x => x.OutAction).IsModified = true;
                        dbContext.Entry(dataToUpdate[1]).Property(x => x.EndedOn).IsModified = true;

                        //Update bed where patient was previously
                        int secondLastBedId = dataToUpdate[1].BedId;
                        var initialHolded = dbContext.Beds.Where(b => b.BedId == secondLastBedId).FirstOrDefault();
                        initialHolded.IsOccupied = true;
                        initialHolded.OnHold = null;
                        initialHolded.HoldedOn = null;
                        dbContext.Entry(initialHolded).Property(x => x.IsOccupied).IsModified = true;
                        dbContext.Entry(initialHolded).Property(x => x.OnHold).IsModified = true;
                        dbContext.Entry(initialHolded).Property(x => x.HoldedOn).IsModified = true;
                    }

                    dbContext.SaveChanges();

                }
            }


        }
    }



}
