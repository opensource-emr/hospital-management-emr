using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.MedicalRecords;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Controllers
{
    public class MedicalRecordsController : CommonController
    {
        private readonly MedicalRecordsDbContext _mrDbContext;
        private readonly BillingDbContext _billingDbContext;
        public MedicalRecordsController(IOptions<MyConfiguration> _config) : base(_config)
        {
            _mrDbContext = new MedicalRecordsDbContext(base.connString);
        }
        [HttpGet]
        [Route("MRMasterData")]
        public IActionResult MRMasterData()
        {
            // if (reqType == "getMasterDataForMREntry")

            Func<object> func = () => GetMRMasterData();
            return InvokeHttpGetFunction(func);


        }

        [HttpGet]
        [Route("PatientTests")]
        public IActionResult PatientTests(int patientId, int patientVisitId)
        {
            // else if (reqType == "pat-tests")

            Func<object> func = () => GetPatientTests(patientId, patientVisitId);
            return InvokeHttpGetFunction(func);


        }

        [HttpGet]
        [Route("PatientMrDetails")]
        public IActionResult MRDetailsOfPatient(int medicalRecordId, int patientVisitId)
        {
            //  else if (reqType == "pat-mr-with-masterdata")

            Func<object> func = () => GetMRDetailsOfPatient(medicalRecordId, patientVisitId);
            return InvokeHttpGetFunction(func);


        }

        [HttpGet]
        [Route("Births")]
        public IActionResult BirthList(DateTime FromDate, DateTime ToDate)
        {
            //else if (reqType == "birth-list")

            Func<object> func = () => GetBirthList(FromDate, ToDate);
            return InvokeHttpGetFunction(func);


        }

        [HttpGet]
        [Route("DeathPatients")]
        public IActionResult Deaths(DateTime FromDate, DateTime ToDate)
        {
            // else if (reqType == "death-list")

            Func<object> func = () => GetDeathList(FromDate, ToDate);
            return InvokeHttpGetFunction(func);


        }

        [HttpGet]
        [Route("BirthCertificateDetail")]
        public IActionResult BirthCertificateDetail(int birthDetailId)
        {
            //  else if (reqType == "birth-certificate-detail")

            Func<object> func = () => GetBirthCertificateDetail(birthDetailId);
            return InvokeHttpGetFunction(func);


        }

        [HttpGet]
        [Route("DeathCertificateDetail")]
        public IActionResult DeathCertificateDetail(int deathDetailId)
        {
            //  else if (reqType == "death-certificate-detail")

            Func<object> func = () => GetDeathCertificateDetail(deathDetailId);
            return InvokeHttpGetFunction(func);


        }


        [HttpGet]
        [Route("OutPatientsVisitInfo")]
        public async Task<ActionResult> OutPatientsVisitInfo(DateTime fromDate, DateTime toDate)
        {
            //  else if (reqType == "death-certificate-detail")

            Func<Task<object>> func = async () => await GetOutpatientsListWithVisitInfo(fromDate, toDate);
            return await InvokeHttpGetFunctionAsync(func);


        }
        [HttpGet]
        [Route("ICD10ReportingGroup")]
        public async Task<ActionResult> GetICD10ReportingGroup()
        {
            //Change Route from GetICD10ReportingGroup to ICD10ReportingGroup and remove BoilerPlate code

            Func<Task<object>> func = async () => await _mrDbContext.ICDReportingGroups
                                                            .Where(repoGrp => repoGrp.IsActive == true)
                                                            .OrderBy(a => a.ReportingGroupName).ToListAsync();
            return await InvokeHttpGetFunctionAsync(func);

        }

        [HttpGet]
        [Route("ICD10DiseaseGroup")]
        public async Task<ActionResult> GetICD10DiseaseGroup()
        {
            //Change Route from GetICD10DiseaseGroup to ICD10DiseaseGroup and remove BoilerPlate code

            Func<Task<object>> func = async () => await (from dg in _mrDbContext.ICDDiseaseGroups
                                                         where dg.IsActive == true
                                                         select dg).ToListAsync();
            return await InvokeHttpGetFunctionAsync(func);

        }

        [HttpGet]
        [Route("BirthCertificateNumbers")]
        public async Task<ActionResult> AllBirthCertificateNumbers()
        {
            //Change Route from GetAllBirthCertificateNumbers to AllBirthCertificateNumbers and remove BoilerPlate code

            Func<Task<object>> func = async () => await (from brthc in _mrDbContext.BabyBirthDetails
                                                         where brthc.IsActive == true && brthc.CertificateNumber != null
                                                         select new
                                                         {
                                                             CertificateNumber = brthc.CertificateNumber,
                                                             BabyBirthDetailsId = brthc.BabyBirthDetailsId
                                                         }).Distinct().ToListAsync();
            return await InvokeHttpGetFunctionAsync(func);

        }
        private object GetDeathCertificateDetail(int deathDetailId)
        {
            var deathCertificateData = (from deathDetail in _mrDbContext.DeathDetails
                                        join pat in _mrDbContext.Patient on deathDetail.PatientId equals pat.PatientId
                                        join country in _mrDbContext.Countries on pat.CountryId equals country.CountryId
                                        join subdiv in _mrDbContext.CountrySubdivisions on pat.CountrySubDivisionId equals subdiv.CountrySubDivisionId
                                        where deathDetail.DeathId == deathDetailId
                                        select new
                                        {
                                            DeathId = deathDetail.DeathId,
                                            FiscalYearFormatted = deathDetail.FiscalYear.FiscalYearFormatted,
                                            CertificateNumber = deathDetail.CertificateNumber,
                                            Sex = pat.Gender,
                                            DateOfBirth = pat.DateOfBirth,
                                            DeathDate = deathDetail.DeathDate,
                                            DeathTime = deathDetail.DeathTime,
                                            Age = deathDetail.Age,
                                            FatherName = deathDetail.FatherName,
                                            MotherName = deathDetail.MotherName,
                                            Country = country.CountryName,
                                            CountrySubDivision = subdiv.CountrySubDivisionName,
                                            CertifiedBy = deathDetail.CertifiedBy,
                                            CauseOfDeath = deathDetail.CauseOfDeath,
                                            Address = pat.Address,
                                            SpouseOf = deathDetail.SpouseOf,
                                            PrintedBy = deathDetail.PrintedBy,
                                            PrintCount = deathDetail.PrintCount,
                                            ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName
                                        }).FirstOrDefault(); ;

            return deathCertificateData;
        }
        private object GetBirthCertificateDetail(int birthDetailId)
        {
            var birthCertificateData = (from brthDetail in _mrDbContext.BabyBirthDetails
                                        join pat in _mrDbContext.Patient on brthDetail.PatientId equals pat.PatientId
                                        join brthCondition in _mrDbContext.BabyBirthConditions on brthDetail.BirthConditionId equals brthCondition.BabyBirthConditionId
                                        join country in _mrDbContext.Countries on pat.CountryId equals country.CountryId
                                        join subdiv in _mrDbContext.CountrySubdivisions on pat.CountrySubDivisionId equals subdiv.CountrySubDivisionId
                                        join mun in _mrDbContext.Municipality on pat.MunicipalityId equals mun.MunicipalityId into m
                                        from municipality in m.DefaultIfEmpty()
                                        join mr in _mrDbContext.MedicalRecords on brthDetail.PatientId equals mr.PatientId into mrG
                                        from mrLJ in mrG.DefaultIfEmpty()
                                        where brthDetail.BabyBirthDetailsId == birthDetailId
                                        select new
                                        {
                                            BabyBirthDetailsId = brthDetail.BabyBirthDetailsId,
                                            FiscalYearId = brthDetail.FiscalYearId,
                                            FiscalYearFormatted = brthDetail.FiscalYear.FiscalYearFormatted,
                                            CertificateNumber = brthDetail.CertificateNumber,
                                            Sex = brthDetail.Sex,
                                            BirthDate = brthDetail.BirthDate,
                                            BirthTime = brthDetail.BirthTime,
                                            WeightOfBaby = brthDetail.WeightOfBaby,
                                            BirthNumberType = brthDetail.BirthNumberType,
                                            PrintedBy = brthDetail.PrintedBy,
                                            PrintCount = brthDetail.PrintCount,
                                            FathersName = brthDetail.FathersName,
                                            PatientId = brthDetail.PatientId,
                                            IssuedBy = brthDetail.IssuedBy,
                                            CertifiedBy = brthDetail.CertifiedBy,
                                            BirthType = brthDetail.BirthType,
                                            ConditionAtBirth = brthCondition.BirthConditionType,

                                            MotherName = pat.FirstName + " " + (String.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                            Address = pat.Address,
                                            Municipality = municipality.MunicipalityName,
                                            Country = country.CountryName,
                                            CountrySubDivision = subdiv.CountrySubDivisionName,
                                            // by default, number of babies will be 1
                                            NumberOfBabies = mrLJ == null ? 1 : mrLJ.NumberOfBabies,
                                            CertificateIssuedDate = brthDetail.CreatedOn
                                        }).FirstOrDefault();
            return birthCertificateData;

        }
        private object GetDeathList(DateTime FromDate, DateTime ToDate)
        {
            var filterByDate = true;
            if (FromDate == null || ToDate == null)
            {
                filterByDate = false;
            }
            var deathList = (from death in _mrDbContext.DeathDetails
                             join pat in _mrDbContext.Patient on death.PatientId equals pat.PatientId
                             where death.IsActive == true
                             && (filterByDate ? (DbFunctions.TruncateTime(death.DeathDate) >= FromDate && DbFunctions.TruncateTime(death.DeathDate) <= ToDate) : true)
                             //orderby death.DeathId descending
                             select new
                             {
                                 DeathId = death.DeathId,
                                 DeathDate = death.DeathDate,
                                 DeathTime = death.DeathTime,
                                 CertificateNumber = death.CertificateNumber,
                                 PatientId = death.PatientId,
                                 PatientVisitId = death.PatientVisitId,
                                 MedicalRecordId = death.MedicalRecordId,
                                 FatherName = death.FatherName,
                                 MotherName = death.MotherName,
                                 SpouseOf = death.SpouseOf,
                                 VisitCode = death.VisitCode,
                                 CauseOfDeath = death.CauseOfDeath,
                                 IsActive = death.IsActive,
                                 Age = death.Age,
                                 FiscalYearId = death.FiscalYear.FiscalYearId,
                                 //FiscalYear= death.FiscalYear.FiscalYearFormatted,
                                 ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName
                             }).ToList().OrderByDescending(o => o.DeathId);
            return deathList;
        }
        private object GetBirthList(DateTime FromDate, DateTime ToDate)
        {
            var filterByDate = true;
            if (FromDate == null || ToDate == null)
            {
                filterByDate = false;
            }
            var birthList = (from brth in _mrDbContext.BabyBirthDetails
                             join pat in _mrDbContext.Patient on brth.PatientId equals pat.PatientId
                             where brth.IsActive == true
                             && (filterByDate ? (DbFunctions.TruncateTime(brth.BirthDate) >= FromDate && DbFunctions.TruncateTime(brth.BirthDate) <= ToDate) : true)
                             select new
                             {
                                 BabyBirthDetailsId = brth.BabyBirthDetailsId,
                                 CertificateNumber = brth.CertificateNumber,
                                 Sex = brth.Sex,
                                 FathersName = brth.FathersName,
                                 WeightOfBaby = brth.WeightOfBaby,
                                 BirthDate = brth.BirthDate,
                                 BirthTime = brth.BirthTime,
                                 DischargeSummaryId = brth.DischargeSummaryId,
                                 NumberOfBabies = 1,
                                 PatientId = brth.PatientId,
                                 PatientVisitId = brth.PatientVisitId,
                                 MedicalRecordId = brth.MedicalRecordId,
                                 CreatedBy = brth.CreatedBy,
                                 ModifiedBy = brth.ModifiedBy,
                                 CreatedOn = brth.CreatedOn,
                                 ModifiedOn = brth.ModifiedOn,
                                 IsActive = brth.IsActive,
                                 IssuedBy = brth.IssuedBy,
                                 FiscalYearId = brth.FiscalYear.FiscalYearId,
                                 CertifiedBy = brth.CertifiedBy,
                                 ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName
                             }).ToList().OrderByDescending(o => o.CreatedOn);
            return birthList;
        }

        private object GetMRDetailsOfPatient(int medicalRecordId, int patientVisitId)
        {

            MedicalRecordModel medicalRecordOfPatient = new MedicalRecordModel();
            medicalRecordOfPatient = (from mr in _mrDbContext.MedicalRecords
                                      where mr.MedicalRecordId == medicalRecordId
                                      select mr).FirstOrDefault();

            int PatientId = medicalRecordOfPatient.PatientId;

            medicalRecordOfPatient.DeathDetail = (from dth in _mrDbContext.DeathDetails
                                                  where (dth.PatientId == PatientId &&
                                                  dth.PatientVisitId == patientVisitId) && dth.IsActive == true
                                                  select dth).FirstOrDefault();

            medicalRecordOfPatient.BabyBirthDetails = (from brth in _mrDbContext.BabyBirthDetails
                                                       where brth.MedicalRecordId == medicalRecordId
                                                       && brth.PatientVisitId == patientVisitId
                                                       && brth.IsActive == true
                                                       select brth).ToList();

            if (medicalRecordOfPatient.DeathDetail != null)
            {
                medicalRecordOfPatient.ShowDeathCertDetail = true;
            }
            else { medicalRecordOfPatient.ShowDeathCertDetail = false; }
            if (medicalRecordOfPatient.BabyBirthDetails.Count > 0)
            {
                medicalRecordOfPatient.ShowBirthCertDetail = true;
            }
            else { medicalRecordOfPatient.ShowBirthCertDetail = false; }

            medicalRecordOfPatient.AllTestList = DanpheJSONConvert.DeserializeObject<List<PatLabtestSummaryModel>>(medicalRecordOfPatient.AllTests);
            //medicalRecordOfPatient.ICDCodeList = DanpheJSONConvert.DeserializeObject<List<ICD10CodeModel>>(medicalRecordOfPatient.ICDCode);
            medicalRecordOfPatient.ICDCodeList = (from icd in _mrDbContext.ICD10Code
                                                  join d in _mrDbContext.InpatientDiagnosis on icd.ICD10ID equals d.ICD10ID
                                                  where d.MedicalRecordId == medicalRecordId && d.IsActive == true
                                                  select icd
                                                  ).ToList();

            var allDischargeType = GetAllDischargeTypeMasterData(_mrDbContext);

            var allOperationType = _mrDbContext.OperationTypes.ToList();

            var allBirthConditions = _mrDbContext.BabyBirthConditions.ToList();

            var labTestListOfPat = (from req in _mrDbContext.LabRequisitions
                                    join test in _mrDbContext.LabTests on req.LabTestId equals test.LabTestId
                                    where req.PatientId == medicalRecordOfPatient.PatientId && req.PatientVisitId == medicalRecordOfPatient.PatientVisitId
                                    select new
                                    {
                                        TestId = (int)test.LabTestId,
                                        RequisitionId = (int)req.RequisitionId,
                                        TestName = req.LabTestName,
                                        TestCode = test.LabTestCode,
                                        Department = "lab",
                                        IsSelected = false
                                    }).ToList();

            var radTestListOfPat = (from req in _mrDbContext.ImagingRequisitions
                                    join test in _mrDbContext.ImagingItems on req.ImagingRequisitionId equals test.ImagingItemId
                                    where req.PatientId == medicalRecordOfPatient.PatientId && req.PatientVisitId == medicalRecordOfPatient.PatientVisitId
                                    select new
                                    {
                                        TestId = test.ImagingItemId,
                                        RequisitionId = req.ImagingRequisitionId,
                                        TestName = test.ImagingItemName,
                                        TestCode = test.ProcedureCode,
                                        Department = "radiology",
                                        IsSelected = false
                                    }).ToList();

            var gravitaList = _mrDbContext.Gravita.ToList();
            var allTestOfPat = labTestListOfPat.Union(radTestListOfPat);

            var mrDetailsWithMasterData = new
            {
                MedicalRecordOfPatient = medicalRecordOfPatient,
                AllDischargeType = allDischargeType,
                AllOperationType = allOperationType,
                AllBirthConditions = allBirthConditions,
                AllGravita = gravitaList,
                AllTestList = allTestOfPat
            };
            return mrDetailsWithMasterData;
        }

        private object GetPatientTests(int patientId, int patientVisitId)
        {
            var labTestListOfPat = (from req in _mrDbContext.LabRequisitions
                                    join test in _mrDbContext.LabTests on req.LabTestId equals test.LabTestId
                                    where req.PatientId == patientId && req.PatientVisitId == patientVisitId
                                    select new
                                    {
                                        TestId = (int)test.LabTestId,
                                        RequisitionId = (int)req.RequisitionId,
                                        TestName = req.LabTestName,
                                        TestCode = test.LabTestCode,
                                        Department = "lab",
                                        IsSelected = false
                                    }).ToList();

            var MrPatDetail = (from mr in _mrDbContext.MedicalRecords
                               join discharTyp in _mrDbContext.DischargeType on mr.DischargeTypeId equals discharTyp.DischargeTypeId
                               where mr.PatientId == patientId && discharTyp.DischargeTypeName.ToLower() == "death"
                               select mr).ToList();

            bool IsPatDead = false;
            bool IsDeadOnDifferentVisit = false;

            if (MrPatDetail.Count > 0)
            {
                IsPatDead = true;
                var DeadOnSameVisit = MrPatDetail.Find(mrp => mrp.PatientVisitId == patientVisitId);
                if (DeadOnSameVisit == null) IsDeadOnDifferentVisit = true;
                else IsDeadOnDifferentVisit = false;

            }

            var radTestListOfPat = (from req in _mrDbContext.ImagingRequisitions
                                    join test in _mrDbContext.ImagingItems on req.ImagingRequisitionId equals test.ImagingItemId
                                    where req.PatientId == patientId && req.PatientVisitId == patientVisitId
                                    select new
                                    {
                                        TestId = test.ImagingItemId,
                                        RequisitionId = req.ImagingRequisitionId,
                                        TestName = test.ImagingItemName,
                                        TestCode = test.ProcedureCode,
                                        Department = "radiology",
                                        IsSelected = false
                                    }).ToList();

            var allTests = labTestListOfPat.Union(radTestListOfPat);
            var patientLabTests = new
            {
                DeathDetailsObj = new { IsPatDead, IsDeadOnDifferentVisit },
                AllTest = allTests,
            };
            return patientLabTests;

        }
        private object GetMRMasterData()
        {
            //if (reqType == "getMasterDataForMREntry")            
            var allDischargeType = GetAllDischargeTypeMasterData(_mrDbContext);
            var allOperationType = _mrDbContext.OperationTypes.ToList();
            var allBirthConditions = _mrDbContext.BabyBirthConditions.ToList();
            var gravitaList = _mrDbContext.Gravita.ToList();
            var MrMasterData = new { AllDischargeType = allDischargeType, AllOperationType = allOperationType, AllBirthConditions = allBirthConditions, AllGravita = gravitaList };
            return MrMasterData;
        }
        private async Task<object> GetOutpatientsListWithVisitInfo(DateTime fromDate, DateTime toDate)
        {
            var results = await (from patVisit in _mrDbContext.PatientVisits
                                 join pat in _mrDbContext.Patient on patVisit.PatientId equals pat.PatientId
                                 join dpart in _mrDbContext.Department on patVisit.DepartmentId equals dpart.DepartmentId
                                 where patVisit.VisitType == "outpatient" && patVisit.IsActive == true
                                    && patVisit.BillingStatus != "returned"
                                    && (DbFunctions.TruncateTime(patVisit.VisitDate) >= DbFunctions.TruncateTime(fromDate)
                                    && DbFunctions.TruncateTime(patVisit.VisitDate) <= DbFunctions.TruncateTime(toDate))
                                 select new
                                 {
                                     pat.PatientId,
                                     pat.PatientCode,
                                     pat.Gender,
                                     pat.Age,
                                     pat.PhoneNumber,
                                     pat.Address,
                                     PatientName = pat.ShortName,
                                     patVisit.PatientVisitId,
                                     patVisit.VisitCode,
                                     patVisit.VisitDate,
                                     patVisit.PerformerName,
                                     patVisit.PerformerId,
                                     dpart.DepartmentName,
                                     dpart.DepartmentId,
                                     FinalDiagnosisCount = _mrDbContext.FinalDiagnosis.Count(a => a.PatientVisitId == patVisit.PatientVisitId && pat.PatientId == a.PatientId && a.IsActive == true),
                                     FinalDiagnosis = (from fd in _mrDbContext.FinalDiagnosis
                                                       join icd in _mrDbContext.ICD10Code on fd.ICD10ID equals icd.ICD10ID
                                                       where fd.PatientVisitId == patVisit.PatientVisitId && fd.PatientId == pat.PatientId && fd.IsActive == true
                                                       select new
                                                       {
                                                           icd.ICD10Description,
                                                           icd.ICD10Code
                                                       }
                                                      ).ToList()
                                 }
                                    ).ToListAsync();
            return results;
        }



        //[HttpGet]
        //public string Get(string reqType,
        //   int patientId,
        //   int patientVisitId,
        //   int birthDetailId,
        //   int deathDetailId,
        //   int medicalRecordId,
        //   int employeeId,
        //   string visitType,
        //   DateTime FromDate,
        //   DateTime ToDate)
        //{
        //    DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        //    try
        //    {
        //        MedicalRecordsDbContext dbContext = new MedicalRecordsDbContext(base.connString);
        //        BillingDbContext billingDbContext = new BillingDbContext(base.connString);

        //if (reqType == "getMasterDataForMREntry")
        //{
        //    var allDischargeType = GetAllDischargeTypeMasterData(dbContext);

        //    var allOperationType = dbContext.OperationTypes.ToList();

        //    var allBirthConditions = dbContext.BabyBirthConditions.ToList();

        //    var gravitaList = dbContext.Gravita.ToList();

        //    //var allDoctors = dbContext.Employees.Where(e => e.IsActive == true).ToList(), AllDoctors = allDoctors;

        //    responseData.Status = "OK";
        //    responseData.Results = new { AllDischargeType = allDischargeType, AllOperationType = allOperationType, AllBirthConditions = allBirthConditions, AllGravita = gravitaList };
        //}
        //else if (reqType == "pat-tests")
        //{
        //    var labTestListOfPat = (from req in dbContext.LabRequisitions
        //                            join test in dbContext.LabTests on req.LabTestId equals test.LabTestId
        //                            where req.PatientId == patientId && req.PatientVisitId == patientVisitId
        //                            select new
        //                            {
        //                                TestId = (int)test.LabTestId,
        //                                RequisitionId = (int)req.RequisitionId,
        //                                TestName = req.LabTestName,
        //                                TestCode = test.LabTestCode,
        //                                Department = "lab",
        //                                IsSelected = false
        //                            }).ToList();

        //    var MrPatDetail = (from mr in dbContext.MedicalRecords
        //                       join discharTyp in dbContext.DischargeType on mr.DischargeTypeId equals discharTyp.DischargeTypeId
        //                       where mr.PatientId == patientId && discharTyp.DischargeTypeName.ToLower() == "death"
        //                       select mr).ToList();

        //    bool IsPatDead = false;
        //    bool IsDeadOnDifferentVisit = false;

        //    if (MrPatDetail.Count > 0)
        //    {
        //        IsPatDead = true;
        //        var DeadOnSameVisit = MrPatDetail.Find(mrp => mrp.PatientVisitId == patientVisitId);
        //        if (DeadOnSameVisit == null) IsDeadOnDifferentVisit = true;
        //        else IsDeadOnDifferentVisit = false;

        //    }

        //    var radTestListOfPat = (from req in dbContext.ImagingRequisitions
        //                            join test in dbContext.ImagingItems on req.ImagingRequisitionId equals test.ImagingItemId
        //                            where req.PatientId == patientId && req.PatientVisitId == patientVisitId
        //                            select new
        //                            {
        //                                TestId = test.ImagingItemId,
        //                                RequisitionId = req.ImagingRequisitionId,
        //                                TestName = test.ImagingItemName,
        //                                TestCode = test.ProcedureCode,
        //                                Department = "radiology",
        //                                IsSelected = false
        //                            }).ToList();

        //    var allTests = labTestListOfPat.Union(radTestListOfPat);
        //    responseData.Results = new
        //    {
        //        DeathDetailsObj = new { IsPatDead, IsDeadOnDifferentVisit },
        //        AllTest = allTests,
        //    };
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "pat-mr-with-masterdata")
        //{
        //    if (medicalRecordId > 0)
        //    {
        //        MedicalRecordModel medicalRecordOfPatient = new MedicalRecordModel();
        //        medicalRecordOfPatient = (from mr in dbContext.MedicalRecords
        //                                  where mr.MedicalRecordId == medicalRecordId
        //                                  select mr).FirstOrDefault();

        //        int PatientId = medicalRecordOfPatient.PatientId;

        //        medicalRecordOfPatient.DeathDetail = (from dth in dbContext.DeathDetails
        //                                              where (dth.PatientId == PatientId &&
        //                                              dth.PatientVisitId == patientVisitId) && dth.IsActive == true
        //                                              select dth).FirstOrDefault();

        //        medicalRecordOfPatient.BabyBirthDetails = (from brth in dbContext.BabyBirthDetails
        //                                                   where brth.MedicalRecordId == medicalRecordId
        //                                                   && brth.PatientVisitId == patientVisitId
        //                                                   && brth.IsActive == true
        //                                                   select brth).ToList();

        //        if (medicalRecordOfPatient.DeathDetail != null)
        //        {
        //            medicalRecordOfPatient.ShowDeathCertDetail = true;
        //        }
        //        else { medicalRecordOfPatient.ShowDeathCertDetail = false; }
        //        if (medicalRecordOfPatient.BabyBirthDetails.Count > 0)
        //        {
        //            medicalRecordOfPatient.ShowBirthCertDetail = true;
        //        }
        //        else { medicalRecordOfPatient.ShowBirthCertDetail = false; }

        //        medicalRecordOfPatient.AllTestList = DanpheJSONConvert.DeserializeObject<List<PatLabtestSummaryModel>>(medicalRecordOfPatient.AllTests);
        //        //medicalRecordOfPatient.ICDCodeList = DanpheJSONConvert.DeserializeObject<List<ICD10CodeModel>>(medicalRecordOfPatient.ICDCode);
        //        medicalRecordOfPatient.ICDCodeList = (from icd in dbContext.ICD10Code
        //                                              join d in dbContext.InpatientDiagnosis on icd.ICD10ID equals d.ICD10ID
        //                                              where d.MedicalRecordId == medicalRecordId && d.IsActive == true
        //                                              select icd
        //                                              ).ToList();

        //        var allDischargeType = GetAllDischargeTypeMasterData(dbContext);

        //        var allOperationType = dbContext.OperationTypes.ToList();

        //        var allBirthConditions = dbContext.BabyBirthConditions.ToList();

        //        var labTestListOfPat = (from req in dbContext.LabRequisitions
        //                                join test in dbContext.LabTests on req.LabTestId equals test.LabTestId
        //                                where req.PatientId == medicalRecordOfPatient.PatientId && req.PatientVisitId == medicalRecordOfPatient.PatientVisitId
        //                                select new
        //                                {
        //                                    TestId = (int)test.LabTestId,
        //                                    RequisitionId = (int)req.RequisitionId,
        //                                    TestName = req.LabTestName,
        //                                    TestCode = test.LabTestCode,
        //                                    Department = "lab",
        //                                    IsSelected = false
        //                                }).ToList();

        //        var radTestListOfPat = (from req in dbContext.ImagingRequisitions
        //                                join test in dbContext.ImagingItems on req.ImagingRequisitionId equals test.ImagingItemId
        //                                where req.PatientId == medicalRecordOfPatient.PatientId && req.PatientVisitId == medicalRecordOfPatient.PatientVisitId
        //                                select new
        //                                {
        //                                    TestId = test.ImagingItemId,
        //                                    RequisitionId = req.ImagingRequisitionId,
        //                                    TestName = test.ImagingItemName,
        //                                    TestCode = test.ProcedureCode,
        //                                    Department = "radiology",
        //                                    IsSelected = false
        //                                }).ToList();

        //        var gravitaList = dbContext.Gravita.ToList();
        //        var allTestOfPat = labTestListOfPat.Union(radTestListOfPat);

        //        responseData.Results = new
        //        {
        //            MedicalRecordOfPatient = medicalRecordOfPatient,
        //            AllDischargeType = allDischargeType,
        //            AllOperationType = allOperationType,
        //            AllBirthConditions = allBirthConditions,
        //            AllGravita = gravitaList,
        //            AllTestList = allTestOfPat
        //        };
        //        responseData.Status = "OK";
        //    }
        //}
        //else if (reqType == "birth-list")
        //{
        //    var filterByDate = true;
        //    if (FromDate == null || ToDate == null) { filterByDate = false; }
        //    var birthList = (from brth in dbContext.BabyBirthDetails
        //                     join pat in dbContext.Patient on brth.PatientId equals pat.PatientId
        //                     where brth.IsActive == true
        //                     && (filterByDate ? (DbFunctions.TruncateTime(brth.BirthDate) >= FromDate && DbFunctions.TruncateTime(brth.BirthDate) <= ToDate) : true)
        //                     select new
        //                     {
        //                         BabyBirthDetailsId = brth.BabyBirthDetailsId,
        //                         CertificateNumber = brth.CertificateNumber,
        //                         Sex = brth.Sex,
        //                         FathersName = brth.FathersName,
        //                         WeightOfBaby = brth.WeightOfBaby,
        //                         BirthDate = brth.BirthDate,
        //                         BirthTime = brth.BirthTime,
        //                         DischargeSummaryId = brth.DischargeSummaryId,
        //                         NumberOfBabies = 1,
        //                         PatientId = brth.PatientId,
        //                         PatientVisitId = brth.PatientVisitId,
        //                         MedicalRecordId = brth.MedicalRecordId,
        //                         CreatedBy = brth.CreatedBy,
        //                         ModifiedBy = brth.ModifiedBy,
        //                         CreatedOn = brth.CreatedOn,
        //                         ModifiedOn = brth.ModifiedOn,
        //                         IsActive = brth.IsActive,
        //                         IssuedBy = brth.IssuedBy,
        //                         FiscalYearId = brth.FiscalYear.FiscalYearId,
        //                         CertifiedBy = brth.CertifiedBy,
        //                         ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName
        //                     }).ToList().OrderByDescending(o => o.CreatedOn);

        //    responseData.Status = "OK";
        //    responseData.Results = birthList;
        //}

        //else if (reqType == "death-list")
        //{
        //    var filterByDate = true;
        //    if (FromDate == null || ToDate == null) { filterByDate = false; }
        //    var deathList = (from death in dbContext.DeathDetails
        //                     join pat in dbContext.Patient on death.PatientId equals pat.PatientId
        //                     where death.IsActive == true
        //                     && (filterByDate ? (DbFunctions.TruncateTime(death.DeathDate) >= FromDate && DbFunctions.TruncateTime(death.DeathDate) <= ToDate) : true)
        //                     //orderby death.DeathId descending
        //                     select new
        //                     {
        //                         DeathId = death.DeathId,
        //                         DeathDate = death.DeathDate,
        //                         DeathTime = death.DeathTime,
        //                         CertificateNumber = death.CertificateNumber,
        //                         PatientId = death.PatientId,
        //                         PatientVisitId = death.PatientVisitId,
        //                         MedicalRecordId = death.MedicalRecordId,
        //                         FatherName = death.FatherName,
        //                         MotherName = death.MotherName,
        //                         SpouseOf = death.SpouseOf,
        //                         VisitCode = death.VisitCode,
        //                         CauseOfDeath = death.CauseOfDeath,
        //                         IsActive = death.IsActive,
        //                         Age = death.Age,
        //                         FiscalYearId = death.FiscalYear.FiscalYearId,
        //                         //FiscalYear= death.FiscalYear.FiscalYearFormatted,
        //                         ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName
        //                     }).ToList().OrderByDescending(o => o.DeathId);

        //    responseData.Status = "OK";
        //    responseData.Results = deathList;
        //}
        //else if (reqType == "birth-certificate-detail")
        //{
        //    if (birthDetailId > 0)
        //    {
        //        var birthCertificateData = (from brthDetail in dbContext.BabyBirthDetails
        //                                    join pat in dbContext.Patient on brthDetail.PatientId equals pat.PatientId
        //                                    join brthCondition in dbContext.BabyBirthConditions on brthDetail.BirthConditionId equals brthCondition.BabyBirthConditionId
        //                                    join country in dbContext.Countries on pat.CountryId equals country.CountryId
        //                                    join subdiv in dbContext.CountrySubdivisions on pat.CountrySubDivisionId equals subdiv.CountrySubDivisionId
        //                                    join mun in dbContext.Municipality on pat.MunicipalityId equals mun.MunicipalityId into m
        //                                    from municipality in m.DefaultIfEmpty()
        //                                    join mr in dbContext.MedicalRecords on brthDetail.PatientId equals mr.PatientId into mrG
        //                                    from mrLJ in mrG.DefaultIfEmpty()
        //                                    where brthDetail.BabyBirthDetailsId == birthDetailId
        //                                    select new
        //                                    {
        //                                        BabyBirthDetailsId = brthDetail.BabyBirthDetailsId,
        //                                        FiscalYearId = brthDetail.FiscalYearId,
        //                                        FiscalYearFormatted = brthDetail.FiscalYear.FiscalYearFormatted,
        //                                        CertificateNumber = brthDetail.CertificateNumber,
        //                                        Sex = brthDetail.Sex,
        //                                        BirthDate = brthDetail.BirthDate,
        //                                        BirthTime = brthDetail.BirthTime,
        //                                        WeightOfBaby = brthDetail.WeightOfBaby,
        //                                        BirthNumberType = brthDetail.BirthNumberType,
        //                                        PrintedBy = brthDetail.PrintedBy,
        //                                        PrintCount = brthDetail.PrintCount,
        //                                        FathersName = brthDetail.FathersName,
        //                                        PatientId = brthDetail.PatientId,
        //                                        IssuedBy = brthDetail.IssuedBy,
        //                                        CertifiedBy = brthDetail.CertifiedBy,
        //                                        BirthType = brthDetail.BirthType,
        //                                        ConditionAtBirth = brthCondition.BirthConditionType,

        //                                        MotherName = pat.FirstName + " " + (String.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
        //                                        Address = pat.Address,
        //                                        Municipality = municipality.MunicipalityName,
        //                                        Country = country.CountryName,
        //                                        CountrySubDivision = subdiv.CountrySubDivisionName,
        //                                        // by default, number of babies will be 1
        //                                        NumberOfBabies = mrLJ == null ? 1 : mrLJ.NumberOfBabies,
        //                                        CertificateIssuedDate = brthDetail.CreatedOn
        //                                    }).FirstOrDefault();
        //        responseData.Status = "OK";
        //        responseData.Results = birthCertificateData;
        //    }
        //}
        //else if (reqType == "death-certificate-detail")
        //{
        //    if (deathDetailId > 0)
        //    {
        //        var deathCertificateData = (from deathDetail in dbContext.DeathDetails
        //                                    join pat in dbContext.Patient on deathDetail.PatientId equals pat.PatientId
        //                                    join country in dbContext.Countries on pat.CountryId equals country.CountryId
        //                                    join subdiv in dbContext.CountrySubdivisions on pat.CountrySubDivisionId equals subdiv.CountrySubDivisionId
        //                                    where deathDetail.DeathId == deathDetailId
        //                                    select new
        //                                    {
        //                                        DeathId = deathDetail.DeathId,
        //                                        FiscalYearFormatted = deathDetail.FiscalYear.FiscalYearFormatted,
        //                                        CertificateNumber = deathDetail.CertificateNumber,
        //                                        Sex = pat.Gender,
        //                                        DateOfBirth = pat.DateOfBirth,
        //                                        DeathDate = deathDetail.DeathDate,
        //                                        DeathTime = deathDetail.DeathTime,
        //                                        Age = deathDetail.Age,
        //                                        FatherName = deathDetail.FatherName,
        //                                        MotherName = deathDetail.MotherName,
        //                                        Country = country.CountryName,
        //                                        CountrySubDivision = subdiv.CountrySubDivisionName,
        //                                        CertifiedBy = deathDetail.CertifiedBy,
        //                                        CauseOfDeath = deathDetail.CauseOfDeath,
        //                                        Address = pat.Address,
        //                                        SpouseOf = deathDetail.SpouseOf,
        //                                        PrintedBy = deathDetail.PrintedBy,
        //                                        PrintCount = deathDetail.PrintCount,
        //                                        ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName
        //                                    }).FirstOrDefault();

        //        //deathCertificateData.Age = GetAgeBetweenTwoDates(Convert.ToDateTime(deathCertificateData.DateOfBirth), Convert.ToDateTime(deathCertificateData.DeathDate);

        //        responseData.Status = "OK";
        //        responseData.Results = deathCertificateData;
        //    }
        //}
        //    }
        //    catch (Exception ex)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
        //    }
        //    return DanpheJSONConvert.SerializeObject(responseData, true);
        //}

        //[HttpGet("OutpatientsListWithVisitInfo/{fromDate}/{toDate}")]
        //public async Task<ActionResult> OutpatientsListWithVisitInfo([FromRoute] DateTime fromDate, [FromRoute] DateTime toDate)
        //{

        //    var results = await (from patVisit in _mrDbContext.PatientVisits
        //                         join pat in _mrDbContext.Patient on patVisit.PatientId equals pat.PatientId
        //                         join dpart in _mrDbContext.Department on patVisit.DepartmentId equals dpart.DepartmentId
        //                         where patVisit.VisitType == "outpatient" && patVisit.IsActive == true
        //                            && patVisit.BillingStatus != "returned"
        //                            && (DbFunctions.TruncateTime(patVisit.VisitDate) >= DbFunctions.TruncateTime(fromDate)
        //                            && DbFunctions.TruncateTime(patVisit.VisitDate) <= DbFunctions.TruncateTime(toDate))
        //                         select new
        //                         {
        //                             pat.PatientId,
        //                             pat.PatientCode,
        //                             pat.Gender,
        //                             pat.Age,
        //                             pat.PhoneNumber,
        //                             pat.Address,
        //                             PatientName = pat.ShortName,
        //                             patVisit.PatientVisitId,
        //                             patVisit.VisitCode,
        //                             patVisit.VisitDate,
        //                             patVisit.PerformerName,
        //                             patVisit.PerformerId,
        //                             dpart.DepartmentName,
        //                             dpart.DepartmentId,
        //                             FinalDiagnosisCount = _mrDbContext.FinalDiagnosis.Count(a => a.PatientVisitId == patVisit.PatientVisitId && pat.PatientId == a.PatientId && a.IsActive == true),
        //                             FinalDiagnosis = (from fd in _mrDbContext.FinalDiagnosis
        //                                               join icd in _mrDbContext.ICD10Code on fd.ICD10ID equals icd.ICD10ID
        //                                               where fd.PatientVisitId == patVisit.PatientVisitId && fd.PatientId == pat.PatientId && fd.IsActive == true
        //                                               select new
        //                                               {
        //                                                   icd.ICD10Description,
        //                                                   icd.ICD10Code
        //                                               }
        //                                              ).ToList()
        //                         }
        //                         ).ToListAsync();
        //return results;
        //}


        //[HttpGet("GetICD10ReportingGroup")]
        //public async Task<ActionResult> GetICD10ReportingGroup()
        //{
        //    DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        //    try
        //    {
        //        // create new instance of dbContext by passing connection string
        //        MedicalRecordsDbContext dbContext = new MedicalRecordsDbContext(connString);

        //        var results = await (from repoG in dbContext.ICDReportingGroups
        //                             where repoG.IsActive == true
        //                             select repoG).OrderBy(a => a.ReportingGroupName).ToListAsync();

        //        responseData.Status = "OK";
        //        responseData.Results = results;
        //    }
        //    catch (Exception ex)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = "Error: " + ex.ToString();
        //        return BadRequest(responseData);
        //    }

        //    return Ok(responseData);
        //}

        //[HttpGet("GetICD10DiseaseGroup")]
        //public async Task<ActionResult> GetICD10DiseaseGroup()
        //{
        //    DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        //    try
        //    {
        //        // create new instance of dbContext by passing connection string
        //        MedicalRecordsDbContext dbContext = new MedicalRecordsDbContext(connString);

        //        var results = await (from dg in dbContext.ICDDiseaseGroups
        //                             where dg.IsActive == true
        //                             select dg).ToListAsync();

        //        responseData.Status = "OK";
        //        responseData.Results = results;
        //    }
        //    catch (Exception ex)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = "Error: " + ex.ToString();
        //        return BadRequest(responseData);
        //    }

        //    return Ok(responseData);
        //}

        //[HttpGet("GetAllBirthCertificateNumbers")]
        //public async Task<ActionResult> GetAllBirthCertificateNumbers()
        //{
        //    DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        //    try
        //    {
        //        MedicalRecordsDbContext dbContext = new MedicalRecordsDbContext(connString);
        //        var results = await (from brthc in dbContext.BabyBirthDetails
        //                             where brthc.IsActive == true && brthc.CertificateNumber != null
        //                             select new
        //                             {
        //                                 CertificateNumber = brthc.CertificateNumber,
        //                                 BabyBirthDetailsId = brthc.BabyBirthDetailsId
        //                             }).Distinct().ToListAsync();
        //        responseData.Status = "OK";
        //        responseData.Results = results;

        //    }

        //    catch (Exception ex)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = "Error: " + ex.ToString();
        //        return BadRequest(responseData);
        //    }
        //    return Ok(responseData);
        //}
        [HttpGet]
        [Route("MRFileNumbers")]
        public async Task<ActionResult> GetMRFileNumbers()
        {
            Func<Task<object>> func = async () => await (from mrFileNumbers in _mrDbContext.MedicalRecords
                                                         select new
                                                         {
                                                             MRFileNumbers = mrFileNumbers.FileNumber
                                                         }).Distinct().ToListAsync();
            return await InvokeHttpGetFunctionAsync(func);
        }


        [HttpGet]
        [Route("DeathCertificatesNumbers")]
        public async Task<ActionResult> DeathCertificateNumbers()
        {
            Func<Task<object>> func = async () => await (from deathDetails in _mrDbContext.DeathDetails
                                                         where deathDetails.IsActive == true && deathDetails.CertificateNumber != null
                                                         select new
                                                         {
                                                             CertificateNumber = deathDetails.CertificateNumber
                                                         }).Distinct().ToListAsync();
            return await InvokeHttpGetFunctionAsync(func);
        }

        [HttpGet]
        [Route("ICD10List")]
        public async Task<ActionResult> GetICD10List()
        {

            //take only active ICD rows
            Func<Task<object>> func = async () => await (from icd in _mrDbContext.ICD10Code
                                                         where icd.Active == true
                                                         select icd).ToListAsync();
            return await InvokeHttpGetFunctionAsync(func);
        }

        [HttpGet]
        [Route("OutpatientDiagnosis/{patId}/{patVisitId}")]
        public async Task<ActionResult> GetOutpatientDiagnosisByVisitId([FromRoute] int patId, [FromRoute] int patVisitId)
        {

            //Note: this is used to get final diagnosis details for patient in MR Outpatient list and Emergency List

            Func<Task<object>> func = async () => await (from diag in _mrDbContext.FinalDiagnosis
                                                         join icd10 in _mrDbContext.ICD10Code on diag.ICD10ID equals icd10.ICD10ID
                                                         where diag.PatientVisitId == patVisitId && diag.PatientId == patId && diag.IsActive == true
                                                         select new
                                                         {
                                                             icd10.ICD10Code,
                                                             icd10.ICD10Description,
                                                             diag.IsPatientReferred,
                                                             diag.ReferredBy

                                                         }
                                 ).ToListAsync();
            return await InvokeHttpGetFunctionAsync(func);
        }


        [HttpGet]
        [Route("BabyDetails/{patientId}")]
        public async Task<ActionResult> GetBabyDetailsByMotherId([FromRoute] int patientId)
        {
            Func<Task<object>> func = async () => await (from mother in _mrDbContext.BabyBirthDetails
                                                         join con in _mrDbContext.BabyBirthConditions on mother.BirthConditionId equals con.BabyBirthConditionId
                                                         where mother.IsActive == true && mother.PatientId == patientId
                                                         select new
                                                         {
                                                             mother.PatientId,
                                                             mother.BabyBirthDetailsId,
                                                             mother.CertificateNumber,
                                                             mother.Sex,
                                                             mother.WeightOfBaby,
                                                             mother.FathersName,

                                                             mother.BirthDate,
                                                             mother.BirthTime,
                                                             mother.BirthConditionId,
                                                             con.BirthConditionType
                                                         }).ToListAsync();
            return await InvokeHttpGetFunctionAsync(func);
        }

        [HttpGet]
        [Route("FemalePatientsVisitDetails/{search}")]
        public ActionResult GetFemalePatientsVisitDetails([FromRoute] string search)

        {


            Func<object> func = () => DALFunctions.GetDataTableFromStoredProc("SP_MR_BirthList_FemalePatientsListWithVisitinformation",
                new List<SqlParameter>() { new SqlParameter("@SearchTxt", search) }, _mrDbContext);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("SearchDeadPatient/{searchTxt}")]
        public ActionResult GetPatientListWithVisitsId([FromRoute] string searchTxt)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {

                DataTable dt = DALFunctions.GetDataTableFromStoredProc("SP_MR_PatientsListWithVisitId",
                    new List<SqlParameter>() { new SqlParameter("@SearchTxt", searchTxt) }, _mrDbContext);
                responseData.Results = dt;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Error: " + ex.ToString();
                return BadRequest(responseData);
            }

            return Ok(responseData);
        }

        [HttpGet]
        [Route("DeadPatients")]
        public async Task<ActionResult> GetDeadPatients()
        {
            Func<Task<object>> func = async () => await (from dp in _mrDbContext.DeathDetails
                                                         where dp.PatientId > 0 && dp.IsActive == true
                                                         select new
                                                         {
                                                             dp.DeathId,
                                                             dp.PatientId,
                                                             dp.CertificateNumber,
                                                             dp.DeathTime,
                                                             dp.DeathDate
                                                         }).Distinct().ToListAsync();

            return await InvokeHttpGetFunctionAsync(func);
        }


        [HttpGet]
        [Route("PatientDeathDetail/{PatientId}")]
        public async Task<ActionResult> GetPatientDeathDetail([FromRoute] int PatientId)
        {
            Func<Task<object>> func = async () => await (from dp in _mrDbContext.DeathDetails
                                                         where dp.PatientId == PatientId && dp.IsActive == true
                                                         select new
                                                         {
                                                             dp.DeathId,
                                                             dp.PatientId,
                                                             dp.CertificateNumber,
                                                             dp.DeathTime,
                                                             dp.DeathDate
                                                         }).FirstOrDefaultAsync();
            return await InvokeHttpGetFunctionAsync(func);
        }

        [HttpPost]
        [Route("PatientMedicalRecord")]
        public IActionResult PostMedicalrecord()
        {
            //   if (reqType == "post-patient-medicalrecord")
            string ipStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => AddPatientMedicalRecord(ipStr, currentUser);
            return InvokeHttpPostFunction(func);

        }
        private object AddPatientMedicalRecord(string ipStr, RbacUser currentUser)
        {
            MedicalRecordModel medicalRecordOfPatient = DanpheJSONConvert.DeserializeObject<MedicalRecordModel>(ipStr);
            using (var medicalRecTransaction = _mrDbContext.Database.BeginTransaction())
            {
                try
                {
                    var dateOfBirth = (from pat in _mrDbContext.Patient
                                       where pat.PatientId == medicalRecordOfPatient.PatientId
                                       select pat.DateOfBirth).FirstOrDefault();

                    medicalRecordOfPatient.CreatedBy = currentUser.EmployeeId;
                    medicalRecordOfPatient.CreatedOn = DateTime.Now;
                    _mrDbContext.MedicalRecords.Add(medicalRecordOfPatient);
                    _mrDbContext.SaveChanges();

                    if (medicalRecordOfPatient.ShowBirthCertDetail == true)
                    {
                        foreach (var brthCert in medicalRecordOfPatient.BabyBirthDetails)
                        {
                            brthCert.MedicalRecordId = medicalRecordOfPatient.MedicalRecordId;
                            brthCert.CreatedBy = currentUser.EmployeeId;
                            brthCert.CreatedOn = DateTime.Now;
                            brthCert.IsActive = true;
                            brthCert.FiscalYearId = GetFiscalYear(brthCert.BirthDate.Date).FiscalYearId;

                            _mrDbContext.BabyBirthDetails.Add(brthCert);
                            _mrDbContext.SaveChanges();
                        }
                    }
                    if (medicalRecordOfPatient.ICDCodeList.Count > 0)
                    {
                        foreach (var icd in medicalRecordOfPatient.ICDCodeList)
                        {
                            InpatientDiagnosisModel diagnosis = new InpatientDiagnosisModel();

                            diagnosis.PatientId = medicalRecordOfPatient.PatientId;
                            diagnosis.PatientVisitId = medicalRecordOfPatient.PatientVisitId;
                            diagnosis.MedicalRecordId = medicalRecordOfPatient.MedicalRecordId;
                            diagnosis.ICD10ID = icd.ICD10ID;
                            diagnosis.ICD10Code = icd.ICD10Code;
                            diagnosis.ICD10Name = icd.ICD10Description;
                            diagnosis.CreatedBy = currentUser.EmployeeId;
                            diagnosis.CreatedOn = DateTime.Now;
                            diagnosis.IsActive = true;
                            _mrDbContext.InpatientDiagnosis.Add(diagnosis);
                            _mrDbContext.SaveChanges();
                        }
                    }

                    if (medicalRecordOfPatient.ShowDeathCertDetail == true)
                    {

                        medicalRecordOfPatient.DeathDetail.MedicalRecordId = medicalRecordOfPatient.MedicalRecordId;
                        medicalRecordOfPatient.DeathDetail.CreatedBy = currentUser.EmployeeId;
                        medicalRecordOfPatient.DeathDetail.CreatedOn = DateTime.Now;
                        medicalRecordOfPatient.DeathDetail.DeathDate = medicalRecordOfPatient.DeathDetail.DeathDate;
                        medicalRecordOfPatient.DeathDetail.IsActive = true;
                        medicalRecordOfPatient.DeathDetail.FiscalYearId = GetFiscalYear(medicalRecordOfPatient.DeathDetail.DeathDate).FiscalYearId;
                        medicalRecordOfPatient.DeathDetail.Age = GetAgeBetweenTwoDates(Convert.ToDateTime(dateOfBirth.Value), medicalRecordOfPatient.DeathDetail.DeathDate);
                        _mrDbContext.DeathDetails.Add(medicalRecordOfPatient.DeathDetail);
                        _mrDbContext.SaveChanges();
                    }
                    medicalRecTransaction.Commit();
                    return medicalRecordOfPatient;
                }
                catch (Exception ex)
                {
                    medicalRecTransaction.Rollback();
                    throw (ex);
                }

            }
        }
        //[HttpPost]// POST api/values
        //public string Post()
        //{
        //    DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        //    try
        //    {
        //        string reqType = this.ReadQueryStringData("reqType");
        //        string ipStr = this.ReadPostData();
        //        MedicalRecordsDbContext mrDbContext = new MedicalRecordsDbContext(connString);
        //        RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

        //        if (reqType == "post-patient-medicalrecord")
        //        {
        //            MedicalRecordModel medicalRecordOfPatient = DanpheJSONConvert.DeserializeObject<MedicalRecordModel>(ipStr);
        //            using (var medicalRecTransaction = mrDbContext.Database.BeginTransaction())
        //            {
        //                try
        //                {
        //                    var dateOfBirth = (from pat in mrDbContext.Patient
        //                                       where pat.PatientId == medicalRecordOfPatient.PatientId
        //                                       select pat.DateOfBirth).FirstOrDefault();

        //                    medicalRecordOfPatient.CreatedBy = currentUser.EmployeeId;
        //                    medicalRecordOfPatient.CreatedOn = DateTime.Now;
        //                    mrDbContext.MedicalRecords.Add(medicalRecordOfPatient);
        //                    mrDbContext.SaveChanges();

        //                    if (medicalRecordOfPatient.ShowBirthCertDetail == true)
        //                    {
        //                        foreach (var brthCert in medicalRecordOfPatient.BabyBirthDetails)
        //                        {
        //                            brthCert.MedicalRecordId = medicalRecordOfPatient.MedicalRecordId;
        //                            brthCert.CreatedBy = currentUser.EmployeeId;
        //                            brthCert.CreatedOn = DateTime.Now;
        //                            brthCert.IsActive = true;
        //                            brthCert.FiscalYearId = GetFiscalYear(brthCert.BirthDate.Date).FiscalYearId;

        //                            mrDbContext.BabyBirthDetails.Add(brthCert);
        //                            mrDbContext.SaveChanges();
        //                        }
        //                    }
        //                    if (medicalRecordOfPatient.ICDCodeList.Count > 0)
        //                    {
        //                        foreach (var icd in medicalRecordOfPatient.ICDCodeList)
        //                        {
        //                            InpatientDiagnosisModel diagnosis = new InpatientDiagnosisModel();

        //                            diagnosis.PatientId = medicalRecordOfPatient.PatientId;
        //                            diagnosis.PatientVisitId = medicalRecordOfPatient.PatientVisitId;
        //                            diagnosis.MedicalRecordId = medicalRecordOfPatient.MedicalRecordId;
        //                            diagnosis.ICD10ID = icd.ICD10ID;
        //                            diagnosis.ICD10Code = icd.ICD10Code;
        //                            diagnosis.ICD10Name = icd.ICD10Description;
        //                            diagnosis.CreatedBy = currentUser.EmployeeId;
        //                            diagnosis.CreatedOn = DateTime.Now;
        //                            diagnosis.IsActive = true;

        //                            mrDbContext.InpatientDiagnosis.Add(diagnosis);
        //                            mrDbContext.SaveChanges();
        //                        }
        //                    }

        //                    if (medicalRecordOfPatient.ShowDeathCertDetail == true)
        //                    {

        //                        medicalRecordOfPatient.DeathDetail.MedicalRecordId = medicalRecordOfPatient.MedicalRecordId;
        //                        medicalRecordOfPatient.DeathDetail.CreatedBy = currentUser.EmployeeId;
        //                        medicalRecordOfPatient.DeathDetail.CreatedOn = DateTime.Now;
        //                        medicalRecordOfPatient.DeathDetail.DeathDate = medicalRecordOfPatient.DeathDetail.DeathDate;
        //                        medicalRecordOfPatient.DeathDetail.IsActive = true;
        //                        medicalRecordOfPatient.DeathDetail.FiscalYearId = GetFiscalYear(medicalRecordOfPatient.DeathDetail.DeathDate).FiscalYearId;
        //                        medicalRecordOfPatient.DeathDetail.Age = GetAgeBetweenTwoDates(Convert.ToDateTime(dateOfBirth.Value), medicalRecordOfPatient.DeathDetail.DeathDate);
        //                        mrDbContext.DeathDetails.Add(medicalRecordOfPatient.DeathDetail);
        //                        mrDbContext.SaveChanges();
        //                    }



        //                    medicalRecTransaction.Commit();
        //                    responseData.Results = medicalRecordOfPatient;
        //                }
        //                catch (Exception ex)
        //                {
        //                    medicalRecTransaction.Rollback();
        //                    responseData.Status = "Failed";
        //                    responseData.Results = ex.Message + " exception details:" + ex.ToString();
        //                    throw (ex);
        //                }


        //            }

        //        }
        //        responseData.Status = "OK";
        //    }
        //    catch (Exception ex)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
        //    }
        //    return DanpheJSONConvert.SerializeObject(responseData, true);
        //}

        [HttpPost]
        [Route("BirthDetails")]
        public ActionResult AddBirthDetails()
        {

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                //read data as string from post
                string strData = this.ReadPostData();

                //get current user from HttpContext.Session to save created by field
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

                // deserialization
                List<BabyBirthDetailsModel> babyBirthDetails = DanpheJSONConvert.DeserializeObject<List<BabyBirthDetailsModel>>(strData);

                babyBirthDetails.ForEach(a =>
                {
                    BabyBirthDetailsModel birthDetail = new BabyBirthDetailsModel();

                    birthDetail = a;
                    birthDetail.CreatedBy = currentUser.EmployeeId;
                    birthDetail.CreatedOn = DateTime.Now;
                    birthDetail.IsActive = true;
                    birthDetail.FiscalYearId = GetFiscalYear(a.BirthDate.Date).FiscalYearId;

                    //birthDetail.FiscalYear = GetFiscalYear(a.BirthDate.Date).FiscalYearFormatted;

                    birthDetail.PatientVisitId = _mrDbContext.PatientVisits.Where(p => p.PatientId == a.PatientId).Max(pv => pv.PatientVisitId);

                    _mrDbContext.BabyBirthDetails.Add(birthDetail);

                });

                _mrDbContext.SaveChanges();

                responseData.Status = "OK";
                responseData.Results = babyBirthDetails;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Error: " + ex.ToString();
                return BadRequest(responseData);
            }

            return Ok(responseData);

        }


        [HttpPost]
        [Route("AddDeathDetails")]
        public ActionResult AddDeathDetails()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                //read data as string from post
                string strData = this.ReadPostData();

                //get current user from HttpContext.Session to save created by field
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

                // deserialization
                DeathDetailsModel deathDetails = DanpheJSONConvert.DeserializeObject<DeathDetailsModel>(strData);

                deathDetails.CreatedBy = currentUser.EmployeeId;
                deathDetails.CreatedOn = DateTime.Now;
                deathDetails.IsActive = true;
                deathDetails.FiscalYearId = GetFiscalYear(deathDetails.DeathDate.Date).FiscalYearId;
                deathDetails.PatientVisitId = _mrDbContext.PatientVisits.Where(a => a.PatientId == deathDetails.PatientId).Max(a => a.PatientVisitId);

                _mrDbContext.DeathDetails.Add(deathDetails);
                _mrDbContext.SaveChanges();

                responseData.Status = "OK";
                responseData.Results = deathDetails;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Error: " + ex.ToString();
                return BadRequest(responseData);
            }

            return Ok(responseData);

        }


        [HttpPost]
        [Route("FinalDiagnosis")]
        public ActionResult PostFinalDiagnosis()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                //read data as string from post
                string strData = this.ReadPostData();

                //get current user from HttpContext.Session to save created by field
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

                // deserialization
                List<FinalDiagnosisModel> finalDiagnosis = DanpheJSONConvert.DeserializeObject<List<FinalDiagnosisModel>>(strData);

                int patId = finalDiagnosis[0].PatientId;
                int patVisitId = finalDiagnosis[0].PatientVisitId;
                bool IsPatientReferred = finalDiagnosis[0].IsPatientReferred;
                string ReferredBy = finalDiagnosis[0].ReferredBy;

                // here 2
                //Getting previous data of respective visist if existed
                var previousData = _mrDbContext.FinalDiagnosis.Where(a => a.PatientId == patId && a.PatientVisitId == patVisitId && a.IsActive == true).ToList();


                List<FinalDiagnosisModel> RemovedFinalDiagnosis = new List<FinalDiagnosisModel>();
                List<FinalDiagnosisModel> OnlyNewFinalDiagnosis = new List<FinalDiagnosisModel>();

                if (previousData.Count > 0)
                {
                    if ((previousData[0].IsPatientReferred != IsPatientReferred) || (previousData[0].ReferredBy != ReferredBy))
                    {
                        foreach (var rfd in previousData)
                        {
                            var dia = _mrDbContext.FinalDiagnosis.FirstOrDefault(fd => fd.FinalDiagnosisId == rfd.FinalDiagnosisId);
                            if (dia != null)
                            {
                                dia.IsPatientReferred = IsPatientReferred;
                                dia.ReferredBy = ReferredBy;
                                _mrDbContext.FinalDiagnosis.Attach(dia);
                                _mrDbContext.Entry(dia).Property(p => p.IsActive).IsModified = true;
                                _mrDbContext.Entry(dia).Property(p => p.ReferredBy).IsModified = true;
                                _mrDbContext.Entry(dia).Property(p => p.IsPatientReferred).IsModified = true;
                                _mrDbContext.SaveChanges();
                            }
                        }
                    }
                    OnlyNewFinalDiagnosis = finalDiagnosis.Except(previousData).ToList();

                    RemovedFinalDiagnosis = previousData.Except(finalDiagnosis).ToList();

                    //previousData.ForEach(a => { dbContext.FinalDiagnosis.Remove(a); });

                }
                else
                {
                    // if there is no old diagnosis then all data are new

                    OnlyNewFinalDiagnosis = finalDiagnosis;
                }

                // Adding new diagnosis
                OnlyNewFinalDiagnosis.ForEach(a =>
                {
                    FinalDiagnosisModel fd = new FinalDiagnosisModel();

                    fd = a;
                    fd.CreatedBy = currentUser.EmployeeId;
                    fd.CreatedOn = DateTime.Now;
                    fd.IsActive = true;
                    fd.IsPatientReferred = IsPatientReferred;
                    fd.ReferredBy = ReferredBy;


                    _mrDbContext.FinalDiagnosis.Add(fd);

                });

                // Set IsActive = false to Removed diagnosis
                if (RemovedFinalDiagnosis.Count > 0)
                {
                    foreach (var rfd in RemovedFinalDiagnosis)
                    {
                        var dia = _mrDbContext.FinalDiagnosis.FirstOrDefault(fd => fd.FinalDiagnosisId == rfd.FinalDiagnosisId);
                        if (dia != null)
                        {
                            dia.IsActive = false;
                            dia.IsPatientReferred = finalDiagnosis[0].IsPatientReferred;
                            dia.ReferredBy = finalDiagnosis[0].ReferredBy;
                            _mrDbContext.FinalDiagnosis.Attach(dia);
                            _mrDbContext.Entry(dia).Property(p => p.IsActive).IsModified = true;
                            _mrDbContext.Entry(dia).Property(p => p.IsPatientReferred).IsModified = true;
                            _mrDbContext.Entry(dia).Property(p => p.ReferredBy).IsModified = true;
                            _mrDbContext.SaveChanges();
                        }
                    }
                }

                _mrDbContext.SaveChanges();

                responseData.Status = "OK";
                responseData.Results = finalDiagnosis;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Error: " + ex.ToString();
                return BadRequest(responseData);
            }

            return Ok(responseData);

        }

        [HttpPut]
        [Route("Birthdetail")]
        public IActionResult PutBirthdetail()
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string ipDataString = this.ReadPostData();
            // if (reqType == "update-birthdetail")
            Func<object> func = () => UpdateBirthDetail(ipDataString, currentUser);
            return InvokeHttpPutFunction(func);

        }

        [HttpPut]
        [Route("MedicalRecord")]
        public IActionResult PutMedicalRecord()
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string ipDataString = this.ReadPostData();
            // if (reqType == "update-patient-medicalrecord")
            Func<object> func = () => UpdateMedicalRecord(ipDataString, currentUser);
            return InvokeHttpPutFunction(func);

        }

        [HttpPut]
        [Route("BirthCertificateDetail")]
        public IActionResult PutBirthCertificateDetail()
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string ipDataString = this.ReadPostData();
            // if (reqType == "update-birth-certificate-detail")
            Func<object> func = () => UpdateBirthCertificateDetail(ipDataString, currentUser);
            return InvokeHttpPutFunction(func);

        }

        [HttpPut]
        [Route("DeathCertificateDetail")]
        public IActionResult PutDeathCertificateDetail()
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string ipStr = this.ReadPostData();
            // if (reqType == "update-death-certificate-detail")
            Func<object> func = () => UpdateDeathCertificateDetail(ipStr, currentUser);
            return InvokeHttpPutFunction(func);

        }
        [HttpPut]
        [Route("BirthCertificatePrintCount")]
        public IActionResult PutBirthCertificatePrintCount()
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string ipStr = this.ReadPostData();
            //else if (reqType == "update-birth-cert-printcount")
            Func<object> func = () => UpdateBirthCertificatePrintCount(ipStr, currentUser);
            return InvokeHttpPutFunction(func);

        }
        [HttpPut]
        [Route("DeathCertificatePrintCount")]
        public IActionResult PutDeathCertificatePrintCount()
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string ipStr = this.ReadPostData();
            // else if (reqType == "update-death-cert-printcount")
            Func<object> func = () => UpdateDeathCertificatePrintCount(ipStr, currentUser);
            return InvokeHttpPutFunction(func);

        }
        [HttpPut]
        [Route("DeathDetail")]
        public IActionResult PutUpdateDeathDetail()
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string ipStr = this.ReadPostData();
            //else if (reqType == "update-death-details")
            Func<object> func = () => UpdateDeathDetail(ipStr, currentUser);
            return InvokeHttpPutFunction(func);

        }
        private object UpdateDeathDetail(string ipStr, RbacUser currentUser)
        {
            DeathDetailsModel deathDetails = DanpheJSONConvert.DeserializeObject<DeathDetailsModel>(ipStr);
            var deathDetail = _mrDbContext.DeathDetails.Where(d =>
            d.DeathId == deathDetails.DeathId).FirstOrDefault();
            deathDetail.DeathTime = deathDetails.DeathTime;
            deathDetail.DeathDate = deathDetails.DeathDate;
            deathDetail.CertificateNumber = deathDetails.CertificateNumber;
            deathDetail.ModifiedOn = System.DateTime.Now;
            deathDetail.ModifiedBy = currentUser.EmployeeId;

            _mrDbContext.Entry(deathDetail).Property(x => x.DeathTime).IsModified = true;
            _mrDbContext.Entry(deathDetail).Property(x => x.DeathDate).IsModified = true;
            _mrDbContext.Entry(deathDetail).Property(x => x.CertificateNumber).IsModified = true;
            _mrDbContext.Entry(deathDetail).Property(x => x.ModifiedBy).IsModified = true;
            _mrDbContext.Entry(deathDetail).Property(x => x.ModifiedOn).IsModified = true;
            _mrDbContext.SaveChanges();
            return deathDetail;
        }
        private object UpdateDeathCertificatePrintCount(string ipStr, RbacUser currentUser)
        {
            DeathDetailsModel deathDetail = DanpheJSONConvert.DeserializeObject<DeathDetailsModel>(ipStr);

            var death = _mrDbContext.DeathDetails.Where(d =>
            d.DeathId == deathDetail.DeathId).FirstOrDefault();

            death.PrintedBy = currentUser.EmployeeId;
            death.PrintCount = death.PrintCount + 1;
            death.PrintedOn = System.DateTime.Now;

            _mrDbContext.Entry(death).Property(x => x.PrintedBy).IsModified = true;
            _mrDbContext.Entry(death).Property(x => x.PrintCount).IsModified = true;
            _mrDbContext.Entry(death).Property(x => x.PrintedOn).IsModified = true;

            _mrDbContext.SaveChanges();
            return deathDetail;
        }
        private object UpdateBirthCertificatePrintCount(string ipStr, RbacUser currentUser)
        {
            BabyBirthDetailsModel birthDetail = DanpheJSONConvert.DeserializeObject<BabyBirthDetailsModel>(ipStr);

            var birth = _mrDbContext.BabyBirthDetails.Where(b =>
            b.BabyBirthDetailsId == birthDetail.BabyBirthDetailsId).FirstOrDefault();

            birth.PrintedBy = currentUser.EmployeeId;
            birth.PrintCount = birthDetail.PrintCount + 1;
            birth.PrintedOn = System.DateTime.Now;

            _mrDbContext.Entry(birth).Property(x => x.PrintedBy).IsModified = true;
            _mrDbContext.Entry(birth).Property(x => x.PrintCount).IsModified = true;
            _mrDbContext.Entry(birth).Property(x => x.PrintedOn).IsModified = true;

            _mrDbContext.SaveChanges();
            return birthDetail;
        }
        private object UpdateDeathCertificateDetail(string ipStr, RbacUser currentUser)
        {
            DeathDetailsModel deathDetail = DanpheJSONConvert.DeserializeObject<DeathDetailsModel>(ipStr);

            var death = _mrDbContext.DeathDetails.Where(d =>
            d.DeathId == deathDetail.DeathId).FirstOrDefault();

            death.PrintedBy = currentUser.EmployeeId;
            death.PrintCount = deathDetail.PrintCount + 1;
            death.CertifiedBy = deathDetail.CertifiedBy;
            death.FatherName = deathDetail.FatherName;
            death.MotherName = deathDetail.MotherName;
            death.SpouseOf = deathDetail.SpouseOf;
            death.CauseOfDeath = deathDetail.CauseOfDeath;
            death.PrintedOn = System.DateTime.Now;

            _mrDbContext.Entry(death).Property(x => x.PrintedBy).IsModified = true;
            _mrDbContext.Entry(death).Property(x => x.PrintCount).IsModified = true;
            _mrDbContext.Entry(death).Property(x => x.PrintedOn).IsModified = true;
            _mrDbContext.Entry(death).Property(x => x.FatherName).IsModified = true;
            _mrDbContext.Entry(death).Property(x => x.CertifiedBy).IsModified = true;
            _mrDbContext.Entry(death).Property(x => x.SpouseOf).IsModified = true;
            _mrDbContext.Entry(death).Property(x => x.CauseOfDeath).IsModified = true;
            _mrDbContext.Entry(death).Property(x => x.MotherName).IsModified = true;

            _mrDbContext.SaveChanges();
            return death;
        }
        private object UpdateBirthCertificateDetail(string ipStr, RbacUser currentUser)
        {
            BabyBirthDetailsModel birthDetail = DanpheJSONConvert.DeserializeObject<BabyBirthDetailsModel>(ipStr);

            var birth = _mrDbContext.BabyBirthDetails.Where(b =>
            b.BabyBirthDetailsId == birthDetail.BabyBirthDetailsId).FirstOrDefault();

            birth.PrintedBy = currentUser.EmployeeId;
            birth.PrintCount = birthDetail.PrintCount + 1;
            birth.IssuedBy = birthDetail.IssuedBy;
            birth.CertifiedBy = birthDetail.CertifiedBy;
            birth.BirthType = birthDetail.BirthType;
            birth.FathersName = birthDetail.FathersName;
            birth.BirthNumberType = birthDetail.BirthNumberType;
            birth.PrintedOn = System.DateTime.Now;

            _mrDbContext.Entry(birth).Property(x => x.PrintedBy).IsModified = true;
            _mrDbContext.Entry(birth).Property(x => x.PrintCount).IsModified = true;
            _mrDbContext.Entry(birth).Property(x => x.PrintedOn).IsModified = true;
            _mrDbContext.Entry(birth).Property(x => x.IssuedBy).IsModified = true;
            _mrDbContext.Entry(birth).Property(x => x.FathersName).IsModified = true;
            _mrDbContext.Entry(birth).Property(x => x.CertifiedBy).IsModified = true;
            _mrDbContext.Entry(birth).Property(x => x.BirthType).IsModified = true;
            _mrDbContext.Entry(birth).Property(x => x.BirthNumberType).IsModified = true;
            _mrDbContext.SaveChanges();
            return birthDetail;
        }

        private object UpdateBirthDetail(string ipStr, RbacUser currentUser)
        {
            BabyBirthDetailsModel birthDetail = DanpheJSONConvert.DeserializeObject<BabyBirthDetailsModel>(ipStr);
            var birthDetailToUpdtae = _mrDbContext.BabyBirthDetails.Where(b => b.BabyBirthDetailsId == birthDetail.BabyBirthDetailsId).FirstOrDefault();
            if (birthDetailToUpdtae != null)
            {
                birthDetailToUpdtae.BirthDate = birthDetail.BirthDate;
                birthDetailToUpdtae.BirthTime = birthDetail.BirthTime;
                birthDetailToUpdtae.CertificateNumber = birthDetail.CertificateNumber;
                birthDetailToUpdtae.FathersName = birthDetail.FathersName;
                birthDetailToUpdtae.WeightOfBaby = birthDetail.WeightOfBaby;
                birthDetailToUpdtae.Sex = birthDetail.Sex;
                birthDetailToUpdtae.ModifiedOn = DateTime.Now;
                birthDetailToUpdtae.ModifiedBy = currentUser.EmployeeId;
                birthDetailToUpdtae.IsActive = true;

                birthDetailToUpdtae.FiscalYearId = GetFiscalYear(birthDetail.BirthDate.Date).FiscalYearId;

                _mrDbContext.Entry(birthDetailToUpdtae).Property(x => x.BirthDate).IsModified = true;
                _mrDbContext.Entry(birthDetailToUpdtae).Property(x => x.BirthTime).IsModified = true;
                _mrDbContext.Entry(birthDetailToUpdtae).Property(x => x.CertificateNumber).IsModified = true;
                _mrDbContext.Entry(birthDetailToUpdtae).Property(x => x.FathersName).IsModified = true;
                _mrDbContext.Entry(birthDetailToUpdtae).Property(x => x.WeightOfBaby).IsModified = true;
                _mrDbContext.Entry(birthDetailToUpdtae).Property(x => x.Sex).IsModified = true;
                _mrDbContext.Entry(birthDetailToUpdtae).Property(x => x.ModifiedBy).IsModified = true;
                _mrDbContext.Entry(birthDetailToUpdtae).Property(x => x.ModifiedOn).IsModified = true;
                _mrDbContext.Entry(birthDetailToUpdtae).Property(x => x.IsActive).IsModified = true;
                _mrDbContext.Entry(birthDetailToUpdtae).Property(x => x.FiscalYearId).IsModified = true;

                _mrDbContext.SaveChanges();
                return birthDetailToUpdtae;

            }
            else
            {
                throw new ArgumentNullException("Birth Details provided is null");
            }
        }


        private object UpdateMedicalRecord(string ipStr, RbacUser currentUser)
        {
            MedicalRecordModel medicalRecordOfPatient = DanpheJSONConvert.DeserializeObject<MedicalRecordModel>(ipStr);
            var mrToUpdate = (from mr in _mrDbContext.MedicalRecords
                              where mr.MedicalRecordId == medicalRecordOfPatient.MedicalRecordId
                              select mr).FirstOrDefault();
            if (mrToUpdate != null)
            {
                using (var medicalRecordTransaction = _mrDbContext.Database.BeginTransaction())
                {
                    try
                    {
                        var dateOfBirth = (from pat in _mrDbContext.Patient
                                           where pat.PatientId == medicalRecordOfPatient.PatientId
                                           select pat.DateOfBirth).FirstOrDefault();

                        var rec = (from mrec in _mrDbContext.MedicalRecords
                                   where mrec.MedicalRecordId == medicalRecordOfPatient.MedicalRecordId
                                   select mrec).FirstOrDefault();

                        rec.FileNumber = medicalRecordOfPatient.FileNumber;
                        rec.DischargeTypeId = medicalRecordOfPatient.DischargeTypeId;
                        rec.DischargeConditionId = medicalRecordOfPatient.DischargeConditionId;

                        //Case
                        rec.CaseMain = medicalRecordOfPatient.CaseMain;
                        rec.CaseSub = medicalRecordOfPatient.CaseSub;

                        // Referral Details
                        rec.ReferredDate = medicalRecordOfPatient.ReferredDate;
                        rec.ReferredTime = medicalRecordOfPatient.ReferredTime;

                        // Death Details
                        rec.DeathPeriodTypeId = medicalRecordOfPatient.DeathPeriodTypeId;

                        // Delivery Details
                        rec.DeliveryTypeId = medicalRecordOfPatient.DeliveryTypeId;
                        rec.NumberOfBabies = medicalRecordOfPatient.NumberOfBabies;


                        // Gravida 
                        rec.GravitaId = medicalRecordOfPatient.GravitaId;
                        rec.GestationalWeek = medicalRecordOfPatient.GestationalWeek;
                        rec.GestationalDay = medicalRecordOfPatient.GestationalDay;
                        //rec.GestationalUnit = medicalRecordOfPatient.GestationalUnit;
                        rec.BloodLost = medicalRecordOfPatient.BloodLost;
                        rec.BloodLostUnit = medicalRecordOfPatient.BloodLostUnit;


                        // operation details
                        rec.IsOperationConducted = medicalRecordOfPatient.IsOperationConducted;
                        rec.OperationTypeId = medicalRecordOfPatient.OperationTypeId;
                        rec.OperatedByDoctor = medicalRecordOfPatient.OperatedByDoctor;
                        rec.OperationDiagnosis = medicalRecordOfPatient.OperationDiagnosis;
                        rec.OperationDate = medicalRecordOfPatient.OperationDate;


                        // others details
                        rec.Remarks = medicalRecordOfPatient.Remarks;
                        rec.ModifiedBy = currentUser.EmployeeId;
                        rec.ModifiedOn = DateTime.Now;


                        // diagnosis details
                        rec.AllTests = medicalRecordOfPatient.AllTests;

                        // Cases of Diagnosis
                        // Case 1 : Newly added diagnosis
                        // Case 2 : Not changed diagnosis
                        // Case 3 : Removed diagnosis

                        // previously added diagnosis
                        var OldIcd10List = (
                                            from icd in _mrDbContext.ICD10Code
                                            join d in _mrDbContext.InpatientDiagnosis on icd.ICD10ID equals d.ICD10ID
                                            where d.MedicalRecordId == medicalRecordOfPatient.MedicalRecordId && d.IsActive == true
                                            select icd).ToList();

                        List<ICD10CodeModel> OnlyNewDiagnosis = new List<ICD10CodeModel>();
                        List<ICD10CodeModel> RemovedDiagnosis = new List<ICD10CodeModel>();

                        if (OldIcd10List.Count > 0)
                        {
                            //get only new diagnosis
                            OnlyNewDiagnosis = medicalRecordOfPatient.ICDCodeList.Except(OldIcd10List).ToList();

                            // get removed diagnosis;
                            RemovedDiagnosis = OldIcd10List.Except(medicalRecordOfPatient.ICDCodeList).ToList();
                        }
                        else
                        {
                            OnlyNewDiagnosis = medicalRecordOfPatient.ICDCodeList; // if there is no old diagnosis then all are new diagnosis
                        }
                        // Do noting for Not-Changed-Diagnosis

                        // Adding New Diagnosis
                        foreach (var icd in OnlyNewDiagnosis)
                        {
                            InpatientDiagnosisModel diagnosis = new InpatientDiagnosisModel();

                            diagnosis.PatientId = medicalRecordOfPatient.PatientId;
                            diagnosis.PatientVisitId = medicalRecordOfPatient.PatientVisitId;
                            diagnosis.MedicalRecordId = medicalRecordOfPatient.MedicalRecordId;
                            diagnosis.ICD10ID = icd.ICD10ID;
                            diagnosis.ICD10Code = icd.ICD10Code;
                            diagnosis.ICD10Name = icd.ICD10Description;
                            diagnosis.CreatedBy = currentUser.EmployeeId;
                            diagnosis.CreatedOn = DateTime.Now;
                            diagnosis.IsActive = true;

                            _mrDbContext.InpatientDiagnosis.Add(diagnosis);
                            _mrDbContext.SaveChanges();
                        }

                        // Making IsActive false to Removed Diagnosis
                        foreach (var rIcd in RemovedDiagnosis)
                        {
                            var rdiagnosis = _mrDbContext.InpatientDiagnosis
                                .Where(rd => rd.MedicalRecordId == medicalRecordOfPatient.MedicalRecordId && rd.ICD10ID == rIcd.ICD10ID).FirstOrDefault();

                            if (rdiagnosis != null)
                            {
                                rdiagnosis.IsActive = false;
                                _mrDbContext.InpatientDiagnosis.Attach(rdiagnosis);
                                _mrDbContext.Entry(rdiagnosis).Property(b => b.IsActive).IsModified = true;
                                _mrDbContext.SaveChanges();
                            }

                        }

                        _mrDbContext.Entry(rec).Property(b => b.MedicalRecordId).IsModified = false;
                        _mrDbContext.Entry(rec).Property(b => b.PatientId).IsModified = false;
                        _mrDbContext.Entry(rec).Property(b => b.PatientVisitId).IsModified = false;
                        _mrDbContext.Entry(rec).Property(b => b.CreatedBy).IsModified = false;
                        _mrDbContext.Entry(rec).Property(b => b.CreatedOn).IsModified = false;

                        _mrDbContext.SaveChanges();

                        if (medicalRecordOfPatient.ShowBirthCertDetail == true && medicalRecordOfPatient.BabyBirthDetails != null)
                        {
                            foreach (var brthCert in medicalRecordOfPatient.BabyBirthDetails)
                            {
                                int brthId = brthCert.BabyBirthDetailsId;
                                if (brthId > 0)
                                {
                                    var bdt = (from birth in _mrDbContext.BabyBirthDetails
                                               where birth.BabyBirthDetailsId == brthId
                                               select birth).FirstOrDefault();

                                    bdt.ModifiedBy = currentUser.EmployeeId;
                                    bdt.ModifiedOn = DateTime.Now;
                                    bdt.Sex = brthCert.Sex;
                                    bdt.DischargeSummaryId = brthCert.DischargeSummaryId;
                                    bdt.CertificateNumber = brthCert.CertificateNumber;
                                    bdt.BirthDate = brthCert.BirthDate;
                                    bdt.BirthTime = brthCert.BirthTime;
                                    bdt.FathersName = brthCert.FathersName;
                                    bdt.BirthConditionId = brthCert.BirthConditionId;
                                    bdt.WeightOfBaby = brthCert.WeightOfBaby;
                                    bdt.IsActive = true;

                                    bdt.FiscalYearId = GetFiscalYear(brthCert.BirthDate).FiscalYearId;

                                    _mrDbContext.Entry(bdt).Property(p => p.IssuedBy).IsModified = false;
                                    _mrDbContext.Entry(bdt).Property(p => p.CertifiedBy).IsModified = false;
                                    _mrDbContext.Entry(bdt).Property(p => p.CreatedBy).IsModified = false;
                                    _mrDbContext.Entry(bdt).Property(p => p.CreatedOn).IsModified = false;
                                    _mrDbContext.Entry(bdt).Property(p => p.PatientId).IsModified = false;
                                    _mrDbContext.Entry(bdt).Property(p => p.PatientVisitId).IsModified = false;
                                    _mrDbContext.Entry(bdt).Property(p => p.BabyBirthDetailsId).IsModified = false;
                                    _mrDbContext.Entry(bdt).Property(p => p.MedicalRecordId).IsModified = false;
                                    _mrDbContext.Entry(bdt).Property(p => p.BirthNumberType).IsModified = false;
                                    _mrDbContext.Entry(bdt).Property(p => p.PrintCount).IsModified = false;
                                    _mrDbContext.Entry(bdt).Property(p => p.PrintedBy).IsModified = false;
                                    _mrDbContext.Entry(bdt).Property(p => p.IssuedBy).IsModified = false;
                                    _mrDbContext.Entry(bdt).Property(p => p.CertifiedBy).IsModified = false;

                                    _mrDbContext.SaveChanges();
                                }
                                else
                                {
                                    brthCert.CreatedBy = currentUser.EmployeeId;
                                    brthCert.CreatedOn = DateTime.Now;
                                    brthCert.IsActive = true;
                                    brthCert.MedicalRecordId = medicalRecordOfPatient.MedicalRecordId;
                                    brthCert.FiscalYearId = GetFiscalYear(brthCert.BirthDate.Date).FiscalYearId;

                                    _mrDbContext.BabyBirthDetails.Add(brthCert);
                                    _mrDbContext.SaveChanges();
                                }
                            }
                        }
                        else
                        {
                            foreach (var brthCert in medicalRecordOfPatient.BabyBirthDetails)
                            {
                                int brthId = brthCert.BabyBirthDetailsId;
                                if (brthId > 0)
                                {
                                    var brthDet = (from brt in _mrDbContext.BabyBirthDetails
                                                   where brt.BabyBirthDetailsId == brthId
                                                   select brt).FirstOrDefault();
                                    brthDet.ModifiedBy = currentUser.EmployeeId;
                                    brthDet.ModifiedOn = DateTime.Now;
                                    brthDet.IsActive = false;
                                    _mrDbContext.Entry(brthDet).Property(b => b.IsActive).IsModified = true;
                                    _mrDbContext.Entry(brthDet).Property(b => b.ModifiedOn).IsModified = true;
                                    _mrDbContext.Entry(brthDet).Property(b => b.ModifiedBy).IsModified = true;
                                    _mrDbContext.SaveChanges();
                                }
                            }
                        }

                        if (medicalRecordOfPatient.ShowDeathCertDetail == true)
                        {
                            if (medicalRecordOfPatient.DeathDetail.DeathId > 0)
                            {
                                var death = (from dth in _mrDbContext.DeathDetails
                                             where dth.DeathId == medicalRecordOfPatient.DeathDetail.DeathId
                                             select dth).FirstOrDefault();

                                death.CertificateNumber = medicalRecordOfPatient.DeathDetail.CertificateNumber;
                                death.DeathDate = medicalRecordOfPatient.DeathDetail.DeathDate;
                                death.FiscalYearId = GetFiscalYear(death.DeathDate).FiscalYearId;
                                death.DeathTime = medicalRecordOfPatient.DeathDetail.DeathTime;
                                death.Age = GetAgeBetweenTwoDates(Convert.ToDateTime(dateOfBirth.Value), medicalRecordOfPatient.DeathDetail.DeathDate);
                                death.ModifiedBy = medicalRecordOfPatient.DeathDetail.ModifiedBy;
                                death.ModifiedOn = medicalRecordOfPatient.DeathDetail.ModifiedOn;
                                death.IsActive = true;

                                _mrDbContext.Entry(death).Property(b => b.IsActive).IsModified = true;
                                _mrDbContext.Entry(death).Property(b => b.ModifiedOn).IsModified = true;
                                _mrDbContext.Entry(death).Property(b => b.Age).IsModified = true;
                                _mrDbContext.Entry(death).Property(b => b.FiscalYearId).IsModified = true;
                                _mrDbContext.Entry(death).Property(b => b.ModifiedBy).IsModified = true;
                                _mrDbContext.Entry(death).Property(b => b.CertificateNumber).IsModified = true;
                                _mrDbContext.Entry(death).Property(b => b.DeathTime).IsModified = true;
                                _mrDbContext.Entry(death).Property(b => b.DeathDate).IsModified = true;
                                _mrDbContext.SaveChanges();
                            }
                            else
                            {
                                medicalRecordOfPatient.DeathDetail.MedicalRecordId = medicalRecordOfPatient.MedicalRecordId;
                                medicalRecordOfPatient.DeathDetail.CreatedBy = currentUser.EmployeeId;
                                medicalRecordOfPatient.DeathDetail.CreatedOn = DateTime.Now;
                                medicalRecordOfPatient.DeathDetail.IsActive = true;
                                medicalRecordOfPatient.DeathDetail.FiscalYearId = GetFiscalYear(medicalRecordOfPatient.DeathDetail.DeathDate).FiscalYearId;
                                medicalRecordOfPatient.DeathDetail.Age = GetAgeBetweenTwoDates(Convert.ToDateTime(dateOfBirth.Value), medicalRecordOfPatient.DeathDetail.DeathDate);
                                _mrDbContext.DeathDetails.Add(medicalRecordOfPatient.DeathDetail);
                                _mrDbContext.SaveChanges();
                            }


                        }
                        else
                        {
                            if (medicalRecordOfPatient.DeathDetail != null && medicalRecordOfPatient.DeathDetail.DeathId > 0)
                            {
                                var death = (from dth in _mrDbContext.DeathDetails
                                             where dth.DeathId == medicalRecordOfPatient.DeathDetail.DeathId
                                             select dth).FirstOrDefault();

                                death.ModifiedBy = currentUser.ModifiedBy;
                                death.ModifiedOn = DateTime.Now;
                                death.IsActive = false;

                                _mrDbContext.Entry(death).Property(b => b.IsActive).IsModified = true;
                                _mrDbContext.Entry(death).Property(b => b.ModifiedOn).IsModified = true;
                                _mrDbContext.Entry(death).Property(b => b.ModifiedBy).IsModified = true;
                                _mrDbContext.SaveChanges();
                            }

                        }

                        medicalRecordTransaction.Commit();
                        return medicalRecordOfPatient;
                    }
                    catch (Exception ex)
                    {
                        medicalRecordTransaction.Rollback();
                        throw (ex);
                    }
                }
            }
            else
            {
                throw new ArgumentNullException("Medical record is empty");
            }
        }
        //[HttpPut]
        //public string Put(string reqType)
        //{
        //    string ipStr = this.ReadPostData();
        //    DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        //    MedicalRecordsDbContext mrDbContext = new MedicalRecordsDbContext(connString);
        //    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
        //    try
        //    {
        //if (reqType == "update-birthdetail")
        //{
        //    BabyBirthDetailsModel birthDetail = DanpheJSONConvert.DeserializeObject<BabyBirthDetailsModel>(ipStr);
        //    var birthDetailToUpdtae = mrDbContext.BabyBirthDetails.Where(b => b.BabyBirthDetailsId == birthDetail.BabyBirthDetailsId).FirstOrDefault();
        //    if (birthDetailToUpdtae != null)
        //    {
        //        birthDetailToUpdtae.BirthDate = birthDetail.BirthDate;
        //        birthDetailToUpdtae.BirthTime = birthDetail.BirthTime;
        //        birthDetailToUpdtae.CertificateNumber = birthDetail.CertificateNumber;
        //        birthDetailToUpdtae.FathersName = birthDetail.FathersName;
        //        birthDetailToUpdtae.WeightOfBaby = birthDetail.WeightOfBaby;
        //        birthDetailToUpdtae.Sex = birthDetail.Sex;
        //        birthDetailToUpdtae.ModifiedOn = DateTime.Now;
        //        birthDetailToUpdtae.ModifiedBy = currentUser.EmployeeId;
        //        birthDetailToUpdtae.IsActive = true;

        //        birthDetailToUpdtae.FiscalYearId = GetFiscalYear(birthDetail.BirthDate.Date).FiscalYearId;

        //        mrDbContext.Entry(birthDetailToUpdtae).Property(x => x.BirthDate).IsModified = true;
        //        mrDbContext.Entry(birthDetailToUpdtae).Property(x => x.BirthTime).IsModified = true;
        //        mrDbContext.Entry(birthDetailToUpdtae).Property(x => x.CertificateNumber).IsModified = true;
        //        mrDbContext.Entry(birthDetailToUpdtae).Property(x => x.FathersName).IsModified = true;
        //        mrDbContext.Entry(birthDetailToUpdtae).Property(x => x.WeightOfBaby).IsModified = true;
        //        mrDbContext.Entry(birthDetailToUpdtae).Property(x => x.Sex).IsModified = true;
        //        mrDbContext.Entry(birthDetailToUpdtae).Property(x => x.ModifiedBy).IsModified = true;
        //        mrDbContext.Entry(birthDetailToUpdtae).Property(x => x.ModifiedOn).IsModified = true;
        //        mrDbContext.Entry(birthDetailToUpdtae).Property(x => x.IsActive).IsModified = true;
        //        mrDbContext.Entry(birthDetailToUpdtae).Property(x => x.FiscalYearId).IsModified = true;

        //        mrDbContext.SaveChanges();

        //        responseData.Status = "OK";
        //        responseData.Results = birthDetailToUpdtae;

        //    }
        //}
        //else if (reqType == "update-patient-medicalrecord")
        //{
        //    MedicalRecordModel medicalRecordOfPatient = DanpheJSONConvert.DeserializeObject<MedicalRecordModel>(ipStr);
        //    var mrToUpdate = (from mr in mrDbContext.MedicalRecords
        //                      where mr.MedicalRecordId == medicalRecordOfPatient.MedicalRecordId
        //                      select mr).FirstOrDefault();
        //    if (mrToUpdate != null)
        //    {
        //        using (var medicalRecordTransaction = mrDbContext.Database.BeginTransaction())
        //        {
        //            try
        //            {
        //                var dateOfBirth = (from pat in mrDbContext.Patient
        //                                   where pat.PatientId == medicalRecordOfPatient.PatientId
        //                                   select pat.DateOfBirth).FirstOrDefault();

        //                var rec = (from mrec in mrDbContext.MedicalRecords
        //                           where mrec.MedicalRecordId == medicalRecordOfPatient.MedicalRecordId
        //                           select mrec).FirstOrDefault();

        //                rec.FileNumber = medicalRecordOfPatient.FileNumber;
        //                rec.DischargeTypeId = medicalRecordOfPatient.DischargeTypeId;
        //                rec.DischargeConditionId = medicalRecordOfPatient.DischargeConditionId;

        //                //Case
        //                rec.CaseMain = medicalRecordOfPatient.CaseMain;
        //                rec.CaseSub = medicalRecordOfPatient.CaseSub;

        //                // Referral Details
        //                rec.ReferredDate = medicalRecordOfPatient.ReferredDate;
        //                rec.ReferredTime = medicalRecordOfPatient.ReferredTime;

        //                // Death Details
        //                rec.DeathPeriodTypeId = medicalRecordOfPatient.DeathPeriodTypeId;

        //                // Delivery Details
        //                rec.DeliveryTypeId = medicalRecordOfPatient.DeliveryTypeId;
        //                rec.NumberOfBabies = medicalRecordOfPatient.NumberOfBabies;


        //                // Gravida 
        //                rec.GravitaId = medicalRecordOfPatient.GravitaId;
        //                rec.GestationalWeek = medicalRecordOfPatient.GestationalWeek;
        //                rec.GestationalDay = medicalRecordOfPatient.GestationalDay;
        //                //rec.GestationalUnit = medicalRecordOfPatient.GestationalUnit;
        //                rec.BloodLost = medicalRecordOfPatient.BloodLost;
        //                rec.BloodLostUnit = medicalRecordOfPatient.BloodLostUnit;


        //                // operation details
        //                rec.IsOperationConducted = medicalRecordOfPatient.IsOperationConducted;
        //                rec.OperationTypeId = medicalRecordOfPatient.OperationTypeId;
        //                rec.OperatedByDoctor = medicalRecordOfPatient.OperatedByDoctor;
        //                rec.OperationDiagnosis = medicalRecordOfPatient.OperationDiagnosis;
        //                rec.OperationDate = medicalRecordOfPatient.OperationDate;


        //                // others details
        //                rec.Remarks = medicalRecordOfPatient.Remarks;
        //                rec.ModifiedBy = currentUser.EmployeeId;
        //                rec.ModifiedOn = DateTime.Now;


        //                // diagnosis details
        //                rec.AllTests = medicalRecordOfPatient.AllTests;

        //                // Cases of Diagnosis
        //                // Case 1 : Newly added diagnosis
        //                // Case 2 : Not changed diagnosis
        //                // Case 3 : Removed diagnosis

        //                // previously added diagnosis
        //                var OldIcd10List = (
        //                                    from icd in mrDbContext.ICD10Code
        //                                    join d in mrDbContext.InpatientDiagnosis on icd.ICD10ID equals d.ICD10ID
        //                                    where d.MedicalRecordId == medicalRecordOfPatient.MedicalRecordId && d.IsActive == true
        //                                    select icd).ToList();

        //                List<ICD10CodeModel> OnlyNewDiagnosis = new List<ICD10CodeModel>();
        //                List<ICD10CodeModel> RemovedDiagnosis = new List<ICD10CodeModel>();

        //                if (OldIcd10List.Count > 0)
        //                {
        //                    //get only new diagnosis
        //                    OnlyNewDiagnosis = medicalRecordOfPatient.ICDCodeList.Except(OldIcd10List).ToList();

        //                    // get removed diagnosis;
        //                    RemovedDiagnosis = OldIcd10List.Except(medicalRecordOfPatient.ICDCodeList).ToList();
        //                }
        //                else
        //                {
        //                    OnlyNewDiagnosis = medicalRecordOfPatient.ICDCodeList; // if there is no old diagnosis then all are new diagnosis
        //                }
        //                // Do noting for Not-Changed-Diagnosis

        //                // Adding New Diagnosis
        //                foreach (var icd in OnlyNewDiagnosis)
        //                {
        //                    InpatientDiagnosisModel diagnosis = new InpatientDiagnosisModel();

        //                    diagnosis.PatientId = medicalRecordOfPatient.PatientId;
        //                    diagnosis.PatientVisitId = medicalRecordOfPatient.PatientVisitId;
        //                    diagnosis.MedicalRecordId = medicalRecordOfPatient.MedicalRecordId;
        //                    diagnosis.ICD10ID = icd.ICD10ID;
        //                    diagnosis.ICD10Code = icd.ICD10Code;
        //                    diagnosis.ICD10Name = icd.ICD10Description;
        //                    diagnosis.CreatedBy = currentUser.EmployeeId;
        //                    diagnosis.CreatedOn = DateTime.Now;
        //                    diagnosis.IsActive = true;

        //                    mrDbContext.InpatientDiagnosis.Add(diagnosis);
        //                    mrDbContext.SaveChanges();
        //                }

        //                // Making IsActive false to Removed Diagnosis
        //                foreach (var rIcd in RemovedDiagnosis)
        //                {
        //                    var rdiagnosis = mrDbContext.InpatientDiagnosis
        //                        .Where(rd => rd.MedicalRecordId == medicalRecordOfPatient.MedicalRecordId && rd.ICD10ID == rIcd.ICD10ID).FirstOrDefault();

        //                    if (rdiagnosis != null)
        //                    {
        //                        rdiagnosis.IsActive = false;
        //                        mrDbContext.InpatientDiagnosis.Attach(rdiagnosis);
        //                        mrDbContext.Entry(rdiagnosis).Property(b => b.IsActive).IsModified = true;
        //                        mrDbContext.SaveChanges();
        //                    }

        //                }

        //                mrDbContext.Entry(rec).Property(b => b.MedicalRecordId).IsModified = false;
        //                mrDbContext.Entry(rec).Property(b => b.PatientId).IsModified = false;
        //                mrDbContext.Entry(rec).Property(b => b.PatientVisitId).IsModified = false;
        //                mrDbContext.Entry(rec).Property(b => b.CreatedBy).IsModified = false;
        //                mrDbContext.Entry(rec).Property(b => b.CreatedOn).IsModified = false;

        //                mrDbContext.SaveChanges();

        //                if (medicalRecordOfPatient.ShowBirthCertDetail == true && medicalRecordOfPatient.BabyBirthDetails != null)
        //                {
        //                    foreach (var brthCert in medicalRecordOfPatient.BabyBirthDetails)
        //                    {
        //                        int brthId = brthCert.BabyBirthDetailsId;
        //                        if (brthId > 0)
        //                        {
        //                            var bdt = (from birth in mrDbContext.BabyBirthDetails
        //                                       where birth.BabyBirthDetailsId == brthId
        //                                       select birth).FirstOrDefault();

        //                            bdt.ModifiedBy = currentUser.EmployeeId;
        //                            bdt.ModifiedOn = DateTime.Now;
        //                            bdt.Sex = brthCert.Sex;
        //                            bdt.DischargeSummaryId = brthCert.DischargeSummaryId;
        //                            bdt.CertificateNumber = brthCert.CertificateNumber;
        //                            bdt.BirthDate = brthCert.BirthDate;
        //                            bdt.BirthTime = brthCert.BirthTime;
        //                            bdt.FathersName = brthCert.FathersName;
        //                            bdt.BirthConditionId = brthCert.BirthConditionId;
        //                            bdt.WeightOfBaby = brthCert.WeightOfBaby;
        //                            bdt.IsActive = true;

        //                            bdt.FiscalYearId = GetFiscalYear(brthCert.BirthDate).FiscalYearId;

        //                            mrDbContext.Entry(bdt).Property(p => p.IssuedBy).IsModified = false;
        //                            mrDbContext.Entry(bdt).Property(p => p.CertifiedBy).IsModified = false;
        //                            mrDbContext.Entry(bdt).Property(p => p.CreatedBy).IsModified = false;
        //                            mrDbContext.Entry(bdt).Property(p => p.CreatedOn).IsModified = false;
        //                            mrDbContext.Entry(bdt).Property(p => p.PatientId).IsModified = false;
        //                            mrDbContext.Entry(bdt).Property(p => p.PatientVisitId).IsModified = false;
        //                            mrDbContext.Entry(bdt).Property(p => p.BabyBirthDetailsId).IsModified = false;
        //                            mrDbContext.Entry(bdt).Property(p => p.MedicalRecordId).IsModified = false;
        //                            mrDbContext.Entry(bdt).Property(p => p.BirthNumberType).IsModified = false;
        //                            mrDbContext.Entry(bdt).Property(p => p.PrintCount).IsModified = false;
        //                            mrDbContext.Entry(bdt).Property(p => p.PrintedBy).IsModified = false;
        //                            mrDbContext.Entry(bdt).Property(p => p.IssuedBy).IsModified = false;
        //                            mrDbContext.Entry(bdt).Property(p => p.CertifiedBy).IsModified = false;

        //                            mrDbContext.SaveChanges();
        //                        }
        //                        else
        //                        {
        //                            brthCert.CreatedBy = currentUser.EmployeeId;
        //                            brthCert.CreatedOn = DateTime.Now;
        //                            brthCert.IsActive = true;
        //                            brthCert.MedicalRecordId = medicalRecordOfPatient.MedicalRecordId;
        //                            brthCert.FiscalYearId = GetFiscalYear(brthCert.BirthDate.Date).FiscalYearId;

        //                            mrDbContext.BabyBirthDetails.Add(brthCert);
        //                            mrDbContext.SaveChanges();
        //                        }
        //                    }
        //                }
        //                else
        //                {
        //                    foreach (var brthCert in medicalRecordOfPatient.BabyBirthDetails)
        //                    {
        //                        int brthId = brthCert.BabyBirthDetailsId;
        //                        if (brthId > 0)
        //                        {
        //                            var brthDet = (from brt in mrDbContext.BabyBirthDetails
        //                                           where brt.BabyBirthDetailsId == brthId
        //                                           select brt).FirstOrDefault();
        //                            brthDet.ModifiedBy = currentUser.EmployeeId;
        //                            brthDet.ModifiedOn = DateTime.Now;
        //                            brthDet.IsActive = false;
        //                            mrDbContext.Entry(brthDet).Property(b => b.IsActive).IsModified = true;
        //                            mrDbContext.Entry(brthDet).Property(b => b.ModifiedOn).IsModified = true;
        //                            mrDbContext.Entry(brthDet).Property(b => b.ModifiedBy).IsModified = true;
        //                            mrDbContext.SaveChanges();
        //                        }
        //                    }
        //                }

        //                if (medicalRecordOfPatient.ShowDeathCertDetail == true)
        //                {
        //                    if (medicalRecordOfPatient.DeathDetail.DeathId > 0)
        //                    {
        //                        var death = (from dth in mrDbContext.DeathDetails
        //                                     where dth.DeathId == medicalRecordOfPatient.DeathDetail.DeathId
        //                                     select dth).FirstOrDefault();

        //                        death.CertificateNumber = medicalRecordOfPatient.DeathDetail.CertificateNumber;
        //                        death.DeathDate = medicalRecordOfPatient.DeathDetail.DeathDate;
        //                        death.FiscalYearId = GetFiscalYear(death.DeathDate).FiscalYearId;
        //                        death.DeathTime = medicalRecordOfPatient.DeathDetail.DeathTime;
        //                        death.Age = GetAgeBetweenTwoDates(Convert.ToDateTime(dateOfBirth.Value), medicalRecordOfPatient.DeathDetail.DeathDate);
        //                        death.ModifiedBy = medicalRecordOfPatient.DeathDetail.ModifiedBy;
        //                        death.ModifiedOn = medicalRecordOfPatient.DeathDetail.ModifiedOn;
        //                        death.IsActive = true;

        //                        mrDbContext.Entry(death).Property(b => b.IsActive).IsModified = true;
        //                        mrDbContext.Entry(death).Property(b => b.ModifiedOn).IsModified = true;
        //                        mrDbContext.Entry(death).Property(b => b.Age).IsModified = true;
        //                        mrDbContext.Entry(death).Property(b => b.FiscalYearId).IsModified = true;
        //                        mrDbContext.Entry(death).Property(b => b.ModifiedBy).IsModified = true;
        //                        mrDbContext.Entry(death).Property(b => b.CertificateNumber).IsModified = true;
        //                        mrDbContext.Entry(death).Property(b => b.DeathTime).IsModified = true;
        //                        mrDbContext.Entry(death).Property(b => b.DeathDate).IsModified = true;

        //                        mrDbContext.SaveChanges();
        //                    }
        //                    else
        //                    {
        //                        medicalRecordOfPatient.DeathDetail.MedicalRecordId = medicalRecordOfPatient.MedicalRecordId;
        //                        medicalRecordOfPatient.DeathDetail.CreatedBy = currentUser.EmployeeId;
        //                        medicalRecordOfPatient.DeathDetail.CreatedOn = DateTime.Now;
        //                        medicalRecordOfPatient.DeathDetail.IsActive = true;
        //                        medicalRecordOfPatient.DeathDetail.FiscalYearId = GetFiscalYear(medicalRecordOfPatient.DeathDetail.DeathDate).FiscalYearId;
        //                        medicalRecordOfPatient.DeathDetail.Age = GetAgeBetweenTwoDates(Convert.ToDateTime(dateOfBirth.Value), medicalRecordOfPatient.DeathDetail.DeathDate);
        //                        mrDbContext.DeathDetails.Add(medicalRecordOfPatient.DeathDetail);
        //                        mrDbContext.SaveChanges();
        //                    }


        //                }
        //                else
        //                {
        //                    if (medicalRecordOfPatient.DeathDetail != null && medicalRecordOfPatient.DeathDetail.DeathId > 0)
        //                    {
        //                        var death = (from dth in mrDbContext.DeathDetails
        //                                     where dth.DeathId == medicalRecordOfPatient.DeathDetail.DeathId
        //                                     select dth).FirstOrDefault();

        //                        death.ModifiedBy = currentUser.ModifiedBy;
        //                        death.ModifiedOn = DateTime.Now;
        //                        death.IsActive = false;

        //                        mrDbContext.Entry(death).Property(b => b.IsActive).IsModified = true;
        //                        mrDbContext.Entry(death).Property(b => b.ModifiedOn).IsModified = true;
        //                        mrDbContext.Entry(death).Property(b => b.ModifiedBy).IsModified = true;

        //                        mrDbContext.SaveChanges();
        //                    }

        //                }

        //                medicalRecordTransaction.Commit();
        //                responseData.Status = "OK";
        //                responseData.Results = medicalRecordOfPatient;
        //            }
        //            catch (Exception ex)
        //            {
        //                medicalRecordTransaction.Rollback();
        //                throw (ex);
        //            }
        //        }
        //    }
        //}
        //else if (reqType == "update-birth-certificate-detail")
        //{
        //    BabyBirthDetailsModel birthDetail = DanpheJSONConvert.DeserializeObject<BabyBirthDetailsModel>(ipStr);

        //    var birth = mrDbContext.BabyBirthDetails.Where(b =>
        //    b.BabyBirthDetailsId == birthDetail.BabyBirthDetailsId).FirstOrDefault();

        //    birth.PrintedBy = currentUser.EmployeeId;
        //    birth.PrintCount = birthDetail.PrintCount + 1;
        //    birth.IssuedBy = birthDetail.IssuedBy;
        //    birth.CertifiedBy = birthDetail.CertifiedBy;
        //    birth.BirthType = birthDetail.BirthType;
        //    birth.FathersName = birthDetail.FathersName;
        //    birth.BirthNumberType = birthDetail.BirthNumberType;
        //    birth.PrintedOn = System.DateTime.Now;

        //    mrDbContext.Entry(birth).Property(x => x.PrintedBy).IsModified = true;
        //    mrDbContext.Entry(birth).Property(x => x.PrintCount).IsModified = true;
        //    mrDbContext.Entry(birth).Property(x => x.PrintedOn).IsModified = true;
        //    mrDbContext.Entry(birth).Property(x => x.IssuedBy).IsModified = true;
        //    mrDbContext.Entry(birth).Property(x => x.FathersName).IsModified = true;
        //    mrDbContext.Entry(birth).Property(x => x.CertifiedBy).IsModified = true;
        //    mrDbContext.Entry(birth).Property(x => x.BirthType).IsModified = true;
        //    mrDbContext.Entry(birth).Property(x => x.BirthNumberType).IsModified = true;

        //    mrDbContext.SaveChanges();
        //    responseData.Status = "OK";
        //    responseData.Results = birthDetail;

        //}
        //else if (reqType == "update-death-certificate-detail")
        //{
        //    DeathDetailsModel deathDetail = DanpheJSONConvert.DeserializeObject<DeathDetailsModel>(ipStr);

        //    var death = mrDbContext.DeathDetails.Where(d =>
        //    d.DeathId == deathDetail.DeathId).FirstOrDefault();

        //    death.PrintedBy = currentUser.EmployeeId;
        //    death.PrintCount = deathDetail.PrintCount + 1;
        //    death.CertifiedBy = deathDetail.CertifiedBy;
        //    death.FatherName = deathDetail.FatherName;
        //    death.MotherName = deathDetail.MotherName;
        //    death.SpouseOf = deathDetail.SpouseOf;
        //    death.CauseOfDeath = deathDetail.CauseOfDeath;
        //    death.PrintedOn = System.DateTime.Now;

        //    mrDbContext.Entry(death).Property(x => x.PrintedBy).IsModified = true;
        //    mrDbContext.Entry(death).Property(x => x.PrintCount).IsModified = true;
        //    mrDbContext.Entry(death).Property(x => x.PrintedOn).IsModified = true;
        //    mrDbContext.Entry(death).Property(x => x.FatherName).IsModified = true;
        //    mrDbContext.Entry(death).Property(x => x.CertifiedBy).IsModified = true;
        //    mrDbContext.Entry(death).Property(x => x.SpouseOf).IsModified = true;
        //    mrDbContext.Entry(death).Property(x => x.CauseOfDeath).IsModified = true;
        //    mrDbContext.Entry(death).Property(x => x.MotherName).IsModified = true;

        //    mrDbContext.SaveChanges();
        //    responseData.Status = "OK";
        //    responseData.Results = death;
        //}
        //else if (reqType == "update-birth-cert-printcount")
        //{
        //    BabyBirthDetailsModel birthDetail = DanpheJSONConvert.DeserializeObject<BabyBirthDetailsModel>(ipStr);

        //    var birth = mrDbContext.BabyBirthDetails.Where(b =>
        //    b.BabyBirthDetailsId == birthDetail.BabyBirthDetailsId).FirstOrDefault();

        //    birth.PrintedBy = currentUser.EmployeeId;
        //    birth.PrintCount = birthDetail.PrintCount + 1;
        //    birth.PrintedOn = System.DateTime.Now;

        //    mrDbContext.Entry(birth).Property(x => x.PrintedBy).IsModified = true;
        //    mrDbContext.Entry(birth).Property(x => x.PrintCount).IsModified = true;
        //    mrDbContext.Entry(birth).Property(x => x.PrintedOn).IsModified = true;

        //    mrDbContext.SaveChanges();

        //    responseData.Status = "OK";
        //    responseData.Results = birthDetail;
        //}
        //else if (reqType == "update-death-cert-printcount")
        //{
        //    DeathDetailsModel deathDetail = DanpheJSONConvert.DeserializeObject<DeathDetailsModel>(ipStr);

        //    var death = mrDbContext.DeathDetails.Where(d =>
        //    d.DeathId == deathDetail.DeathId).FirstOrDefault();

        //    death.PrintedBy = currentUser.EmployeeId;
        //    death.PrintCount = death.PrintCount + 1;
        //    death.PrintedOn = System.DateTime.Now;

        //    mrDbContext.Entry(death).Property(x => x.PrintedBy).IsModified = true;
        //    mrDbContext.Entry(death).Property(x => x.PrintCount).IsModified = true;
        //    mrDbContext.Entry(death).Property(x => x.PrintedOn).IsModified = true;

        //    mrDbContext.SaveChanges();

        //    responseData.Status = "OK";
        //    responseData.Results = deathDetail;
        //}
        //else if (reqType == "update-death-details")
        //{
        //    DeathDetailsModel deathDetails = DanpheJSONConvert.DeserializeObject<DeathDetailsModel>(ipStr);
        //    var deathDetail = mrDbContext.DeathDetails.Where(d =>
        //    d.DeathId == deathDetails.DeathId).FirstOrDefault();
        //    deathDetail.DeathTime = deathDetails.DeathTime;
        //    deathDetail.DeathDate = deathDetails.DeathDate;
        //    deathDetail.CertificateNumber = deathDetails.CertificateNumber;
        //    deathDetail.ModifiedOn = System.DateTime.Now;
        //    deathDetail.ModifiedBy = currentUser.EmployeeId;

        //    mrDbContext.Entry(deathDetail).Property(x => x.DeathTime).IsModified = true;
        //    mrDbContext.Entry(deathDetail).Property(x => x.DeathDate).IsModified = true;
        //    mrDbContext.Entry(deathDetail).Property(x => x.CertificateNumber).IsModified = true;
        //    mrDbContext.Entry(deathDetail).Property(x => x.ModifiedBy).IsModified = true;
        //    mrDbContext.Entry(deathDetail).Property(x => x.ModifiedOn).IsModified = true;
        //    mrDbContext.SaveChanges();
        //    responseData.Status = "OK";
        //}
        //    }
        //    catch (Exception ex)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
        //    }

        //    return DanpheJSONConvert.SerializeObject(responseData, true);
        //}

        private BillingFiscalYear GetFiscalYear(DateTime date)
        {
            MedicalRecordsDbContext mrDbContext = new MedicalRecordsDbContext(base.connString);

            var fsYear = mrDbContext.BillingFiscalYears.Where(fsc => fsc.StartYear <= date && fsc.EndYear >= date).FirstOrDefault();
            if (fsYear != null)
            {
                return fsYear;
            }
            else
            {
                throw new Exception("Fiscal Year not Set.");
            }
        }

        private string GetAgeBetweenTwoDates(DateTime start, DateTime end)
        {
            var diff = new DateTime(end.Subtract(start).Ticks);
            var year = diff.Year - 1;
            var month = diff.Month - 1;
            var days = diff.Day;
            if (year > 0) { return year + " " + "years"; }
            else
            {
                if (month > 0)
                {
                    return month + " " + "months";
                }
                else
                {
                    return days + "days";
                }
            }
        }

        private object GetAllDischargeTypeMasterData(MedicalRecordsDbContext dbContext)
        {
            var allDischargeType = (from disType in dbContext.DischargeType
                                    where disType.IsActive == true
                                    select new
                                    {
                                        DischargeTypeId = disType.DischargeTypeId,
                                        DischargeTypeName = disType.DischargeTypeName,
                                        Description = disType.Description,
                                        CreatedBy = disType.CreatedBy,
                                        CreatedOn = disType.CreatedOn,
                                        ModifiedBy = disType.ModifiedBy,
                                        ModifiedOn = disType.ModifiedOn,
                                        DeathTypes = (from death in dbContext.DeathTypes
                                                      where death.DischargeTypeId == disType.DischargeTypeId
                                                      select new
                                                      {
                                                          DeathTypeId = death.DeathTypeId,
                                                          DeathType = death.DeathType
                                                      }).ToList(),
                                        DischargeConditionTypes = (from d in dbContext.DischargeConditionTypes
                                                                   where d.DischargeTypeId == disType.DischargeTypeId
                                                                   select new
                                                                   {
                                                                       DischargeConditionId = d.DischargeConditionId,
                                                                       Condition = d.Condition,
                                                                       CurrentConditionTypes = dbContext.DeliveryTypes.Where(a => a.DischargeConditionId == d.DischargeConditionId).ToList()
                                                                   }).ToList()
                                    }).ToList();

            return allDischargeType;
        }

        private int GetLatestDeathCertNumber(int fiscalYearId)
        {
            MedicalRecordsDbContext mrDbContext = new MedicalRecordsDbContext(base.connString);
            DateTime currentDate = DateTime.Now.Date;
            if (fiscalYearId == 0)
            {
                var fiscalYear = GetFiscalYear(currentDate);
                if (fiscalYear != null)
                {
                    fiscalYearId = fiscalYear.FiscalYearId;
                }
                else
                {
                    throw new Exception(string.Format("Fiscal Year Not Set"));
                }
            }

            var certificateNo = mrDbContext.DeathDetails.Where(d => d.CertificateNumber != null && d.FiscalYearId == fiscalYearId).Max(m => m.CertificateNumber) ?? 0;
            certificateNo++;
            return certificateNo;

        }


        [HttpGet]
        [Route("LatestDeathCertificateNumber")]
        public IActionResult GetLatestDeathCertificateNumber(int fiscalYearId = 0)
        {
            try
            {
                var deathCertificateNum = GetLatestDeathCertNumber(fiscalYearId);
                return Ok(deathCertificateNum);
            }
            catch (Exception ex)
            {
                var responseData = "Failed";
                return Ok(ex);
            }

        }

        [HttpGet]
        [Route("ICDReportingGroupForEmergencyPatient")]
        public async Task<ActionResult> GetICDReportingGroupForEmergencyPatient()
        {
            //DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            //try
            //{
            //    MedicalRecordsDbContext mrDbContext = new MedicalRecordsDbContext(connString);
            Func<Task<object>> func = async () => await (from emerReportingGroup in _mrDbContext.ICDEmergencyReportingGroup
                                                         where emerReportingGroup.IsActive == true
                                                         select emerReportingGroup).OrderBy(a => a.EMER_ReportingGroupName).ToListAsync();
            return await InvokeHttpGetFunctionAsync(func);
            //responseData.Results = result;
            //responseData.Status = "OK";
            //return Ok(responseData);

            //}
            //catch (Exception ex)
            //{
            //    responseData.Status = "Failed";
            //    responseData.ErrorMessage = "Error: " + ex.ToString();
            //    return BadRequest(responseData);
            //}

        }

        [HttpGet]
        [Route("ICDDiseaseGroupForEmergencyPatient")]
        public async Task<ActionResult> GetICDEmergencyDiseaseGroup()
        {
            Func<Task<object>> func = async () => await (from emerDisease in _mrDbContext.ICDEmergencyDiseaseGroup
                                                         where emerDisease.IsActive == true
                                                         select emerDisease).OrderBy(d => d.EMER_ReportingGroupId).ToListAsync();
            return await InvokeHttpGetFunctionAsync(func);
        }

        [HttpGet]
        [Route("EmergencyPatientsListWithVisitInfo/{fromDate}/{toDate}")]
        public async Task<ActionResult> GetEmergencyPatientsListWithVisitInfo([FromRoute] DateTime fromDate, [FromRoute] DateTime toDate)
        {

            Func<Task<object>> func = async () => await GetEmergencyPatientsVisitDetails(fromDate, toDate);
            return await InvokeHttpGetFunctionAsync(func);
        }
        private async Task<object> GetEmergencyPatientsVisitDetails(DateTime fromDate, DateTime toDate)
        {
            var emergencyPatientsData = await (from patVisit in _mrDbContext.PatientVisits
                                               join pat in _mrDbContext.Patient on patVisit.PatientId equals pat.PatientId
                                               join dept in _mrDbContext.Department on patVisit.DepartmentId equals dept.DepartmentId
                                               where patVisit.VisitType == "emergency" && patVisit.BillingStatus != "returned"
                                               && patVisit.IsActive == true
                                               && (DbFunctions.TruncateTime(patVisit.VisitDate) >= DbFunctions.TruncateTime(fromDate)
                                               && DbFunctions.TruncateTime(patVisit.VisitDate) <= DbFunctions.TruncateTime(toDate))
                                               select new
                                               {
                                                   pat.PatientId,
                                                   pat.PatientCode,
                                                   pat.Gender,
                                                   pat.PhoneNumber,
                                                   pat.Address,
                                                   pat.Age,
                                                   PatientName = pat.ShortName,
                                                   patVisit.PatientVisitId,
                                                   patVisit.VisitCode,
                                                   patVisit.VisitDate,
                                                   patVisit.PerformerId,
                                                   patVisit.PerformerName,
                                                   dept.DepartmentId,
                                                   dept.DepartmentName,
                                                   FinalDiagnosisCount = _mrDbContext.EmergencyFinalDiagnosis.Count(a => a.PatientVisitId == patVisit.PatientVisitId && pat.PatientId == patVisit.PatientId && patVisit.IsActive == true),
                                                   FinalDiagnosis = (from fd in _mrDbContext.EmergencyFinalDiagnosis
                                                                     join dg in _mrDbContext.ICDEmergencyDiseaseGroup on fd.EMER_DiseaseGroupId equals dg.EMER_DiseaseGroupId
                                                                     where patVisit.PatientVisitId == fd.PatientVisitId && patVisit.PatientId == fd.PatientId && fd.IsActive == true
                                                                     select new
                                                                     {
                                                                         dg.ICDCode,
                                                                         dg.EMER_DiseaseGroupName
                                                                     }).ToList()
                                               }).ToListAsync();
            return emergencyPatientsData;
        }
        [HttpGet]
        [Route("EmergencyPatientDiagnosisDetail/{patId}/{patVisitId}")]
        public async Task<ActionResult> GetEmergencyPatientDiagnosisDetail([FromRoute] int patId, [FromRoute] int patVisitId)
        {
            Func<Task<object>> func = async () => await (from erFinalDig in _mrDbContext.EmergencyFinalDiagnosis
                                                         join disg in _mrDbContext.ICDEmergencyDiseaseGroup on erFinalDig.EMER_DiseaseGroupId equals disg.EMER_DiseaseGroupId
                                                         where erFinalDig.PatientVisitId == patVisitId && erFinalDig.PatientId == patId && erFinalDig.IsActive == true
                                                         select new
                                                         {
                                                             disg.EMER_DiseaseGroupId,
                                                             disg.EMER_DiseaseGroupName,
                                                             erFinalDig.IsPatientReferred,
                                                             erFinalDig.ReferredBy,
                                                             erFinalDig.ReferredTo,
                                                             ICDCode = disg.ICDCode

                                                         }
                                     ).ToListAsync();
            return await InvokeHttpGetFunctionAsync(func);
        }

        [HttpPost]
        [Route("PostEmergencyFinalDiagnosis")]
        public IActionResult PostEmergencyFinalDiagnosis()
        {
            string strData = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => PostFinalDiagnosisForEmergencyPatient(strData, currentUser);
            return InvokeHttpPostFunction(func);
        }
        private object PostFinalDiagnosisForEmergencyPatient(string strData, RbacUser currentUser)
        {

            List<EmergencyFinalDiagnosisModel> finalErDiagnosis = DanpheJSONConvert.DeserializeObject<List<EmergencyFinalDiagnosisModel>>(strData);

            int patId = finalErDiagnosis[0].PatientId;
            int patVisitId = finalErDiagnosis[0].PatientVisitId;
            bool IsPatientReferred = finalErDiagnosis[0].IsPatientReferred;
            string ReferredBy = finalErDiagnosis[0].ReferredBy;
            string ReferredTo = finalErDiagnosis[0].ReferredTo;

            // here 2
            //Getting previous data of respective visist if existed
            var previousData = _mrDbContext.EmergencyFinalDiagnosis.Where(a => a.PatientId == patId && a.PatientVisitId == patVisitId && a.IsActive == true).ToList();


            List<EmergencyFinalDiagnosisModel> RemovedFinalDiagnosis = new List<EmergencyFinalDiagnosisModel>();
            List<EmergencyFinalDiagnosisModel> OnlyNewFinalDiagnosis = new List<EmergencyFinalDiagnosisModel>();

            if (previousData.Count > 0)
            {
                if ((previousData[0].IsPatientReferred != IsPatientReferred) || (previousData[0].ReferredBy != ReferredBy))
                {
                    foreach (var rfd in previousData)
                    {
                        var dia = _mrDbContext.EmergencyFinalDiagnosis.FirstOrDefault(fd => fd.FinalDiagnosisId == rfd.FinalDiagnosisId);
                        if (dia != null)
                        {
                            dia.IsPatientReferred = IsPatientReferred;
                            dia.ReferredBy = ReferredBy;
                            dia.ReferredTo = ReferredTo;
                            _mrDbContext.EmergencyFinalDiagnosis.Attach(dia);
                            _mrDbContext.Entry(dia).Property(p => p.IsActive).IsModified = true;
                            _mrDbContext.Entry(dia).Property(p => p.ReferredBy).IsModified = true;
                            _mrDbContext.Entry(dia).Property(p => p.IsPatientReferred).IsModified = true;
                            _mrDbContext.SaveChanges();
                        }
                    }
                }
                OnlyNewFinalDiagnosis = finalErDiagnosis.Except(previousData).ToList();

                RemovedFinalDiagnosis = previousData.Except(finalErDiagnosis).ToList();

            }
            else
            {
                // if there is no old diagnosis then all data are new

                OnlyNewFinalDiagnosis = finalErDiagnosis;
            }

            // Adding new diagnosis
            OnlyNewFinalDiagnosis.ForEach(a =>
            {
                EmergencyFinalDiagnosisModel fd = new EmergencyFinalDiagnosisModel();

                fd = a;
                fd.CreatedBy = currentUser.EmployeeId;
                fd.CreatedOn = DateTime.Now;
                fd.IsActive = true;
                fd.IsPatientReferred = IsPatientReferred;
                fd.ReferredBy = ReferredBy;
                fd.ReferredTo = ReferredTo;


                _mrDbContext.EmergencyFinalDiagnosis.Add(fd);

            });

            // Set IsActive = false to Removed diagnosis
            if (RemovedFinalDiagnosis.Count > 0)
            {
                foreach (var rfd in RemovedFinalDiagnosis)
                {
                    var dia = _mrDbContext.EmergencyFinalDiagnosis.FirstOrDefault(fd => fd.FinalDiagnosisId == rfd.FinalDiagnosisId);
                    if (dia != null)
                    {
                        dia.IsActive = false;
                        dia.IsPatientReferred = finalErDiagnosis[0].IsPatientReferred;
                        dia.ReferredBy = finalErDiagnosis[0].ReferredBy;
                        _mrDbContext.EmergencyFinalDiagnosis.Attach(dia);
                        _mrDbContext.Entry(dia).Property(p => p.IsActive).IsModified = true;
                        _mrDbContext.Entry(dia).Property(p => p.IsPatientReferred).IsModified = true;
                        _mrDbContext.Entry(dia).Property(p => p.ReferredBy).IsModified = true;
                        _mrDbContext.SaveChanges();
                    }
                }
            }

            _mrDbContext.SaveChanges();
            return finalErDiagnosis;

        }

        [HttpGet]
        [Route("DischargedPatients")]
        public ActionResult DischargedPatients(string fromDate, string toDate)
        {
            Func<object> func = () => DALFunctions.GetDataTableFromStoredProc("SP_MR_GetDischargedPatientInfo",
               new List<SqlParameter>() { new SqlParameter("@FromDate", fromDate), new SqlParameter("@ToDate", toDate) }
               , _mrDbContext);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("EthnicGroupStatisticsReports")]
        public IActionResult EthnicGroupStatisticsReports(string fromDate, string toDate)
        {
            Func<object> func = () => GetEthnicGroupStatisticsReports(fromDate, toDate);
            return InvokeHttpGetFunction(func);
        }

        private object GetEthnicGroupStatisticsReports(string fromDate, string toDate)

        {
            try
            {
                List<SqlParameter> parameters = new List<SqlParameter>
                {
                 new SqlParameter("@FromDate", fromDate),
                 new SqlParameter("@ToDate", toDate)
                };

                DataSet result = DALFunctions.GetDatasetFromStoredProc("SP_MR_EthnicGroupReport", parameters, _mrDbContext);
                return new
                {
                    InPatientEthnicGroupStatisticsReports = result.Tables[0],
                    OutPatientEthnicGroupStatisticsReports = result.Tables[1]
                };
            }
            catch (Exception ex)
            {
                throw new Exception(ex + "Couldn't get the Ethnic group wise data.");
            }
        }

    }
}

