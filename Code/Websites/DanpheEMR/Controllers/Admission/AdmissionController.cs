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

using DanpheEMR.Core;
using DanpheEMR.Core.Parameters;
using System.Threading.Tasks;

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
                                      Department = department.DepartmentName,
                                      GuardianName = admission.CareOfPersonName,
                                      GuardianRelation = admission.CareOfPersonRelation,
                                      BedInformation = (from bedInfos in dbContext.PatientBedInfos
                                                        where bedInfos.PatientVisitId == admission.Visit.PatientVisitId
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
                        responseData.Results = result.OrderByDescending(r => r.AdmittedDate);
                    else if (admissionStatus == "discharged")
                    {
                        responseData.Results = result.OrderByDescending(r => r.DischargedDate);
                    }
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
                                          where patientinfo.PatientVisitId == patientVisitId
                                          select new PatientBedInfoVM
                                          {
                                              WardName = ward.WardName,
                                              StartedOn = patientinfo.StartedOn,
                                              EndedOn = patientinfo.EndedOn,
                                              BedNumber = bed.BedNumber,
                                              BedCode = bed.BedCode,
                                              PatientBedInfoId = patientinfo.PatientBedInfoId,
                                              PatientVisitId = patientinfo.PatientVisitId,
                                              Action = patientinfo.Action
                                          }).Distinct().OrderByDescending(a => a.StartedOn).ToList();

                    responseData.Results = patientBedInfo;
                    responseData.Status = "OK";
                }
                //used in nursing module.
                else if (reqType == "getAdmittedList")
                {
                    if (search == null)
                    {  // Vikas: 17th June 2019 :added real time search.
                        var result = (from admission in dbContext.Admissions.Include(a => a.Visit.Patient)
                                      where admission.AdmissionStatus == "admitted"
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
                                          BedInformation = (from bedInfos in dbContext.PatientBedInfos
                                                            where bedInfos.PatientVisitId == admission.Visit.PatientVisitId
                                                            select new
                                                            {
                                                                BedFeature = bedInfos.BedFeature.BedFeatureName,
                                                                BedCode = bedInfos.Bed.BedCode,
                                                                StartedOn = bedInfos.StartedOn,
                                                            }).OrderByDescending(a => a.StartedOn).FirstOrDefault()

                                      }).OrderByDescending(r => r.AdmittedDate).Take(200).ToList();

                        responseData.Results = result;
                        responseData.Status = "OK";
                    }
                    else
                    {
                        var result = (from admission in dbContext.Admissions.Include(a => a.Visit.Patient)
                                      where admission.AdmissionStatus == "admitted" &&
                                      (admission.Visit.Patient.FirstName + " " + (string.IsNullOrEmpty(admission.Visit.Patient.MiddleName) ? "" : admission.Visit.Patient.MiddleName + " ")
                                      + admission.Visit.Patient.LastName + admission.Visit.Patient.PatientCode + admission.Visit.Patient.PhoneNumber).Contains(search)
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
                                          BedInformation = (from bedInfos in dbContext.PatientBedInfos
                                                            where bedInfos.PatientVisitId == admission.Visit.PatientVisitId
                                                            select new
                                                            {
                                                                BedFeature = bedInfos.BedFeature.BedFeatureName,
                                                                BedCode = bedInfos.Bed.BedCode,
                                                                StartedOn = bedInfos.StartedOn,
                                                            }).OrderByDescending(a => a.StartedOn).FirstOrDefault()

                                      }).ToList().OrderByDescending(r => r.AdmittedDate);
                        responseData.Results = result;
                        responseData.Status = "OK";
                    }
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
                                where bItm.PatientId == patientId && bItm.BillStatus == "provisional"
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
                                       DoctorInchargeNMC = incharge.MedCertificationNo,
                                       ResidenceDrNMC = residenceDr.MedCertificationNo,
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

                    var availableBeds = (from bed in dbContext.Beds
                                         join bedFeatureMap in dbContext.BedFeaturesMaps on bed.BedId equals bedFeatureMap.BedId
                                         where (
                                            bedFeatureMap.WardId == wardId &&
                                            bedFeatureMap.BedFeatureId == bedFeatureId &&
                                            bed.IsActive == true && bed.IsOccupied == false &&
                                            bedFeatureMap.IsActive == true)
                                         select bed).ToList();

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
                                              where (bedFeaturesMap.BedId == bedId && bedFeaturesMap.IsActive == true && bedFeaturesMap.BedFeatureId != bedFeatureId)
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
                                                BedInformations = (from bedInfos in dbContext.PatientBedInfos
                                                                   join bedFeature in dbContext.BedFeatures on bedInfos.BedFeatureId equals bedFeature.BedFeatureId
                                                                   join bed in dbContext.Beds on bedInfos.BedId equals bed.BedId
                                                                   where bedInfos.PatientVisitId == visit.PatientVisitId
                                                                   select new
                                                                   {
                                                                       BedCode = bed.BedCode,
                                                                       BedFeature = bedFeature.BedFeatureName,
                                                                       StartDate = bedInfos.StartedOn,
                                                                       EndDate = bedInfos.EndedOn,
                                                                       BedPrice = bedInfos.BedPrice,
                                                                       Action = bedInfos.Action,
                                                                       //calculated in clientSide
                                                                       Days = 0,
                                                                   }).ToList()
                                            }).ToList();
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
                                              BedInformations = (from bedInfos in dbContext.PatientBedInfos
                                                                 join bedFeature in dbContext.BedFeatures on bedInfos.BedFeatureId equals bedFeature.BedFeatureId
                                                                 join bed in dbContext.Beds on bedInfos.BedId equals bed.BedId
                                                                 join ward in dbContext.Wards on bed.WardId equals ward.WardId
                                                                 where bedInfos.PatientVisitId == visit.PatientVisitId
                                                                 select new
                                                                 {
                                                                     WardName = ward.WardName,
                                                                     BedCode = bed.BedCode,
                                                                     BedFeature = bedFeature.BedFeatureName,
                                                                     StartDate = bedInfos.StartedOn,
                                                                     EndDate = bedInfos.EndedOn,
                                                                     BedPrice = bedInfos.BedPrice,
                                                                     Action = bedInfos.Action,
                                                                     //calculated in clientSide
                                                                     Days = 0,
                                                                 }).ToList()
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
                                                     where bedInfo.PatientVisitId == patientVisitId
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
                        PatAddress =(from add in dbContext.Address.AsEnumerable() where add.PatientId == patientId select new {
                            Street = add.Street1.ToString(),
                            Country = countryList.Where(c => c.CountryId == add.CountryId).Select(p => p.CountryName).FirstOrDefault(),
                            CountryDivision = countrySubDivList.Where(c => c.CountrySubDivisionId == add.CountrySubDivisionId).Select(o => o.CountrySubDivisionName).FirstOrDefault(),
                            Zip = add.ZipCode
                        }).ToList().FirstOrDefault(),
                    };
                    responseData.Results = result;
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

                    if (summary.BabyBirthDetails.Count > 0)
                    {
                        summary.BabyBirthDetails.ForEach(a =>
                        {
                            a.DischargeSummaryId = summaryId;
                            dbContext.BabyBirthDetails.Add(a);
                            dbContext.SaveChanges();
                        });
                    }
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
                else if(reqType == "patient-birth-certificate"){
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
                    int bedId = admissionFromClient.PatientBedInfos[0].BedId;
                    BedModel selBed = admissionDb.Beds.Where(b => b.BedId == bedId).FirstOrDefault();
                    if (selBed != null)
                    {
                        selBed.IsOccupied = true;
                        selBed.ModifiedBy = currentUser.EmployeeId;
                        selBed.ModifiedOn = currentDate;
                        admissionDb.Beds.Attach(selBed);
                        admissionDb.Entry(selBed).Property(a => a.IsOccupied).IsModified = true;
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
                            returnOutPat.DepositType = "ReturnDeposit";
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

                            InPatDeposit.DepositType = "Deposit";
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
                        currentDate);

                    foreach (BillingTransactionItemModel itm in admissionBillItems)
                    {
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
            billTxnItem.BillStatus = "provisional";
            billTxnItem.CounterId = counterId;
            billTxnItem.CounterDay = currentDate;
            billTxnItem.BillingType = "inpatient";
            billTxnItem.ProcedureCode = item.ProcedureCode;
            billTxnItem.CreatedBy = userId;
            billTxnItem.VisitType = "inpatient";
            billTxnItem.CreatedOn = currentDate;
            billTxnItem.RequisitionDate = currentDate;

            billTxnItem.Tax = 0;
            billTxnItem.TaxableAmount = 0;
            billTxnItem.TaxPercent = 0;
            billTxnItem.DiscountAmount = 0;
            billTxnItem.DiscountPercent = 0;
            billTxnItem.DiscountPercentAgg = 0;
            billTxnItem.ProvisionalFiscalYearId =ProvFiscalYearId;
            billTxnItem.ProvisionalReceiptNo = ProvReceiptNo;
            return billTxnItem;
        }

        private void FreeBed(int bedInfoId, DateTime? endedOn)
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
        private void UpdateBillTxnQuantity(PatientBedInfo newBedInfo, int bedInfoId)
        {
            try
            {
                AdmissionDbContext dbContext = new AdmissionDbContext(base.connString);
                PatientBedInfo bedInfo = dbContext.PatientBedInfos
                         .Where(b => b.PatientBedInfoId == bedInfoId)
                         .FirstOrDefault();
                BillingTransactionItemModel txnitm = dbContext.BillTxnItem
                       .Where(itm => itm.PatientId == newBedInfo.PatientId && itm.PatientVisitId == newBedInfo.PatientVisitId
                                && itm.ItemId == bedInfo.BedFeatureId).FirstOrDefault();

                BillingTransactionItemModel txnitmForSameBed = dbContext.BillTxnItem
                   .Where(itm => itm.PatientId == newBedInfo.PatientId && itm.PatientVisitId == newBedInfo.PatientVisitId
                            && itm.ItemId == newBedInfo.BedFeatureId).FirstOrDefault();
                //Update qty for same BedfeatureId
                if (newBedInfo.IsExistBedFeatureId == true)
                {
                    txnitmForSameBed.Quantity = txnitmForSameBed.Quantity + 1;
                    txnitmForSameBed.SubTotal = txnitmForSameBed.Quantity * txnitmForSameBed.Price;
                    txnitmForSameBed.DiscountAmount = (txnitmForSameBed.SubTotal * txnitmForSameBed.DiscountPercent) / 100;
                    txnitmForSameBed.TotalAmount = txnitmForSameBed.SubTotal - txnitmForSameBed.DiscountAmount;
                    dbContext.Entry(txnitmForSameBed).State = EntityState.Modified;
                    dbContext.Entry(txnitmForSameBed).Property(a => a.SubTotal).IsModified = true;
                    dbContext.Entry(txnitmForSameBed).Property(a => a.DiscountAmount).IsModified = true;
                    dbContext.Entry(txnitmForSameBed).Property(a => a.TotalAmount).IsModified = true;
                    dbContext.Entry(txnitmForSameBed).Property(x => x.Quantity).IsModified = true;
                    dbContext.SaveChanges();
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
                        txnitm.Quantity = txnitm.Quantity + (int)qty.TotalDays - 1;
                    }
                    else
                    {
                        txnitm.Quantity = (int)qty.TotalDays;
                    }
                }
                else
                {
                    qty = bedInfo.EndedOn.Value.Subtract(bedInfo.StartedOn.Value);
                    if (checkBedFeatureId.Count > 1)
                    {
                        txnitm.Quantity = txnitm.Quantity + (int)qty.TotalDays - 1;
                    }
                    else
                    {
                        txnitm.Quantity = (int)qty.TotalDays;
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
                    cancelDischarge.BillingTransactionId = admissionDbContext.BillingTransactions.Where(c => c.PatientVisitId == cancelDischarge.PatientVisitId).Select(a => a.BillingTransactionId).FirstOrDefault();
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
                            adv.DepositType = "depositcancel";
                            admissionDbContext.Entry(adv).State = EntityState.Modified;
                            admissionDbContext.Entry(adv).Property(a => a.DepositType).IsModified = true;
                        });
                        admissionDbContext.SaveChanges();
                    }

                    //restoring BillingTransactionItems
                    var billtxnitm = admissionDbContext.BillTxnItem.Where(a => a.PatientVisitId == cancelDischarge.PatientVisitId && a.ReturnStatus != true).Select(a => a).OrderBy(a => a.BillingTransactionItemId).ToList();
                    if (billtxnitm.Count > 0)
                    {
                        var tempTxnId = billtxnitm.Select(a => a.BillingTransactionId).Distinct().FirstOrDefault();
                        var billtxn = admissionDbContext.BillingTransactions.Where(a => a.BillingTransactionId == tempTxnId).Select(a => a).FirstOrDefault();

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
                            billingtxn.BillStatus = "provisional";
                            billingtxn.PaidDate = null;
                            billingtxn.BillingTransactionId = null;
                            billingtxn.ReturnQuantity = null;
                            billingtxn.ReturnStatus = null;
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

                //we need to update the transaction id on the Deposit Table 
                if (reqType == "discharge")
                {
                    AdmissionModel clientAdt = DanpheJSONConvert.DeserializeObject<AdmissionModel>(ipDataString);
                    FreeBed(bedInfoId, clientAdt.DischargeDate);
                    dbContext.Admissions.Attach(clientAdt);
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
                    PatientBedInfo newBedInfo = DanpheJSONConvert.DeserializeObject<PatientBedInfo>(ipDataString);
                    FreeBed(bedInfoId, newBedInfo.StartedOn);
                    UpdateBillTxnQuantity(newBedInfo, bedInfoId);
                    newBedInfo.CreatedOn = DateTime.Now;
                    dbContext.PatientBedInfos.Add(newBedInfo);
                    UpdateIsOccupiedStatus(newBedInfo.BedId, true);
                    if (newBedInfo.BedChargeBilItm.ItemId > 0)
                    {
                        //bed charges billing txn item
                        newBedInfo.BedChargeBilItm.RequisitionDate = System.DateTime.Now;
                        newBedInfo.BedChargeBilItm.CreatedOn = System.DateTime.Now;
                        dbContext.BillTxnItem.Add(newBedInfo.BedChargeBilItm);
                    }
                    dbContext.SaveChanges();
                    responseData.Status = "OK";
                    responseData.Results = GetAdtReturnData(newBedInfo.PatientBedInfoId);
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

                    if(summary.DischargeSummaryMedications.Count > 0)
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

                    if (summary.BabyBirthDetails.Count > 0)
                    {
                        var babydetails = dbContext.BabyBirthDetails.Where(a => a.DischargeSummaryId == summary.DischargeSummaryId).Select(a => a).ToList();
                        summary.BabyBirthDetails.ForEach(a =>
                        {
                            var temp = babydetails.Where(c => c.BabyBirthDetailsId == a.BabyBirthDetailsId).Select(x => x).FirstOrDefault();
                            if (temp.BabyBirthDetailsId > 0)
                            {
                                dbContext.BabyBirthDetails.Attach(a);
                                dbContext.Entry(a).State = EntityState.Modified;
                                dbContext.SaveChanges();
                            }
                            else
                            {
                                BabyBirthDetailsModel medi = new BabyBirthDetailsModel();
                                medi = a;
                                medi.DischargeSummaryId = summary.DischargeSummaryId;
                                dbContext.BabyBirthDetails.Add(medi);
                                dbContext.SaveChanges();
                            }

                        });
                    }

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

                                FreeBed(bedInfo.PatientBedInfoId, dischargeDetail.DischargeDate);

                                admission.AdmissionStatus = "discharged";
                                admission.DischargeDate = dischargeDetail.DischargeDate;
                                admission.BillStatusOnDischarge = dischargeDetail.BillStatus;
                                admission.DischargedBy = currentUser.EmployeeId;
                                admission.ModifiedBy = currentUser.EmployeeId;
                                admission.ModifiedOn = DateTime.Now;
                                admission.ProcedureType = dischargeDetail.ProcedureType;

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
                                    currentIpVisit.BillingStatus = "cancel";
                                    currentIpVisit.VisitStatus = "cancel";
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
                                        FreeBed(bedInfo.PatientBedInfoId, bedInfo.EndedOn);
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
                                        item.BillStatus = "cancel";
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
                                        bedItem.BillStatus = "cancel";
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
                                                       && ((visit.VisitType == "outpatient" || visit.VisitType == "emergency")
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
                                                                                    && bil.BillStatus != "cancel"
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
                                        bill.BillingType = latestVisitType == "emergency" ? "outpatient" : latestVisitType;
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
                                        DepositType = "ReturnDeposit",
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
                else if (reqType == "update-birth-certificate") {
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
    }
}
