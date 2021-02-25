using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Controllers
{
    public class MedicalRecordsController : CommonController
    {
        public MedicalRecordsController(IOptions<MyConfiguration> _config) : base(_config)
        {
            
        }

        [HttpGet]
        public string Get(string reqType,
           int patientId,
           int patientVisitId,
           int birthDetailId,
           int deathDetailId,
           int medicalRecordId,
           int employeeId,
           string visitType,
           DateTime FromDate,
           DateTime ToDate)
        {
             DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                MedicalRecordsDbContext dbContext = new MedicalRecordsDbContext(base.connString);
                BillingDbContext billingDbContext = new BillingDbContext(base.connString);

                if (reqType == "getMasterDataForMREntry")
                {
                    var allDischargeType = GetAllDischargeTypeMasterData(dbContext);
                                    
                    var allOperationType = dbContext.OperationTypes.ToList();

                    var allBirthConditions = dbContext.BabyBirthConditions.ToList();

                    var gravitaList = dbContext.Gravita.ToList();

                    //var allDoctors = dbContext.Employees.Where(e => e.IsActive == true).ToList(), AllDoctors = allDoctors;

                    responseData.Status = "OK";
                    responseData.Results = new { AllDischargeType = allDischargeType, AllOperationType = allOperationType, AllBirthConditions = allBirthConditions, AllGravita = gravitaList };
                }
                else if (reqType == "pat-tests")
                {
                    var labTestListOfPat = (from req in dbContext.LabRequisitions
                                            join test in dbContext.LabTests on req.LabTestId equals test.LabTestId
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

                    var radTestListOfPat = (from req in dbContext.ImagingRequisitions
                                            join test in dbContext.ImagingItems on req.ImagingRequisitionId equals test.ImagingItemId
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

                    responseData.Status = "OK";
                    responseData.Results = allTests;
                }
                else if(reqType == "pat-mr-with-masterdata")
                {
                    if(medicalRecordId > 0)
                    {
                        MedicalRecordModel medicalRecordOfPatient = new MedicalRecordModel();
                        medicalRecordOfPatient = (from mr in dbContext.MedicalRecords
                                                  where mr.MedicalRecordId == medicalRecordId
                                                  select mr).FirstOrDefault();
                        medicalRecordOfPatient.DeathDetail = (from dth in dbContext.DeathDetails
                                                              where dth.MedicalRecordId.HasValue
                                                              && (dth.MedicalRecordId.Value == medicalRecordId ||
                                                              dth.PatientVisitId == patientVisitId) && dth.IsActive == true
                                                              select dth).FirstOrDefault();
                        medicalRecordOfPatient.BabyBirthDetails = (from brth in dbContext.BabyBirthDetails
                                                                    where brth.MedicalRecordId.HasValue
                                                                    && (brth.MedicalRecordId.Value == medicalRecordId || brth.PatientVisitId == patientVisitId) && brth.IsActive == true
                                                                    select brth).ToList();

                        if(medicalRecordOfPatient.DeathDetail != null)
                        {
                            medicalRecordOfPatient.ShowDeathCertDetail = true;
                        } else { medicalRecordOfPatient.ShowDeathCertDetail = false; }
                        if (medicalRecordOfPatient.BabyBirthDetails.Count > 0)
                        {
                            medicalRecordOfPatient.ShowBirthCertDetail = true;
                        } else { medicalRecordOfPatient.ShowBirthCertDetail = false; }

                        medicalRecordOfPatient.AllTestList = DanpheJSONConvert.DeserializeObject<List<PatLabtestSummaryModel>>(medicalRecordOfPatient.AllTests);
                        medicalRecordOfPatient.ICDCodeList = DanpheJSONConvert.DeserializeObject<List<ICD10CodeModel>>(medicalRecordOfPatient.ICDCode);

                        var allDischargeType = GetAllDischargeTypeMasterData(dbContext);

                        var allOperationType = dbContext.OperationTypes.ToList();

                        var allBirthConditions = dbContext.BabyBirthConditions.ToList();
                       
                        var labTestListOfPat = (from req in dbContext.LabRequisitions
                                                join test in dbContext.LabTests on req.LabTestId equals test.LabTestId
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

                        var radTestListOfPat = (from req in dbContext.ImagingRequisitions
                                                join test in dbContext.ImagingItems on req.ImagingRequisitionId equals test.ImagingItemId
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

                        var gravitaList = dbContext.Gravita.ToList();
                        var allTestOfPat = labTestListOfPat.Union(radTestListOfPat);

                        responseData.Results = new { MedicalRecordOfPatient = medicalRecordOfPatient, AllDischargeType = allDischargeType,
                            AllOperationType = allOperationType, AllBirthConditions = allBirthConditions, AllGravita = gravitaList,
                            AllTestList = allTestOfPat}; 
                        responseData.Status = "OK";
                    }
                }
                else if(reqType == "birth-list")
                {
                    var filterByDate = true;
                    if (FromDate == null || ToDate == null){filterByDate = false;}
                    var birthList = (from brth in dbContext.BabyBirthDetails
                                     join pat in dbContext.Patient on brth.PatientId equals pat.PatientId
                                     where brth.IsActive == true
                                     && (filterByDate ? (DbFunctions.TruncateTime(brth.BirthDate) >= FromDate && DbFunctions.TruncateTime(brth.BirthDate) <= ToDate) :true )
                                     select new {
                                         BabyBirthDetailsId = brth.BabyBirthDetailsId,
                                         CertificateNumber = brth.CertificateNumber,
                                         Sex = brth.Sex,
                                         FathersName = brth.FathersName,
                                         WeightOfBaby = brth.WeightOfBaby,
                                         BirthDate = brth.BirthDate,
                                         BirthTime = brth.BirthTime,
                                         DischargeSummaryId = brth.DischargeSummaryId,
                                         NumberOfBabies = brth.NumberOfBabies,
                                         PatientId = brth.PatientId,
                                         PatientVisitId = brth.PatientVisitId,
                                         MedicalRecordId = brth.MedicalRecordId,
                                         CreatedBy = brth.CreatedBy,
                                         ModifiedBy = brth.ModifiedBy,
                                         CreatedOn = brth.CreatedOn,
                                         ModifiedOn = brth.ModifiedOn,
                                         IsActive = brth.IsActive,
                                         IssuedBy = brth.IssuedBy,
                                         CertifiedBy = brth.CertifiedBy,
                                         ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName
                                     }).ToList();

                    responseData.Status = "OK";
                    responseData.Results = birthList;
                }
                else if(reqType == "death-list")
                {
                    var filterByDate = true;
                    if (FromDate == null || ToDate == null) { filterByDate = false; }
                    var deathList = (from death in dbContext.DeathDetails
                                     join pat in dbContext.Patient on death.PatientId equals pat.PatientId
                                     where death.IsActive == true
                                     && (filterByDate ? (DbFunctions.TruncateTime(death.DeathDate) >= FromDate && DbFunctions.TruncateTime(death.DeathDate) <= ToDate) : true)
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
                                         FiscalYear = death.FiscalYear,
                                         ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName
                                     }).ToList();

                    responseData.Status = "OK";
                    responseData.Results = deathList;
                }
                else if(reqType == "birth-certificate-detail")
                {                    
                    if(birthDetailId > 0)
                    {
                        //return billingDbContext.BillingFiscalYears.Where(fsc => fsc.StartYear <= currentDate && fsc.EndYear >= currentDate).FirstOrDefault();
                        var birthCertificateData = (from brthDetail in dbContext.BabyBirthDetails
                                                    join pat in dbContext.Patient on brthDetail.PatientId equals pat.PatientId
                                                    join country in dbContext.Countries on pat.CountryId equals country.CountryId
                                                    join subdiv in dbContext.CountrySubdivisions on pat.CountrySubDivisionId equals subdiv.CountrySubDivisionId
                                                    where brthDetail.BabyBirthDetailsId == birthDetailId
                                                    select new
                                                    {
                                                        BabyBirthDetailsId = brthDetail.BabyBirthDetailsId,
                                                        FiscalYear = brthDetail.FiscalYear,
                                                        CertificateNumber = brthDetail.CertificateNumber,
                                                        Sex = brthDetail.Sex,
                                                        BirthDate = brthDetail.BirthDate,
                                                        BirthTime = brthDetail.BirthTime,
                                                        WeightOfBaby = brthDetail.WeightOfBaby,
                                                        NumberOfBabies = brthDetail.NumberOfBabies,
                                                        FathersName = brthDetail.FathersName,
                                                        MotherName = pat.FirstName + " " + (String.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                                        Country = country.CountryName,
                                                        CountrySubDivision = subdiv.CountrySubDivisionName,
                                                        IssuedBy = brthDetail.IssuedBy,
                                                        CertifiedBy = brthDetail.CertifiedBy,
                                                        BirthType = brthDetail.BirthType,
                                                        Address = pat.Address,
                                                        BirthNumberType = brthDetail.BirthNumberType,
                                                        PrintedBy = brthDetail.PrintedBy,
                                                        PrintCount = brthDetail.PrintCount
                                                    }).FirstOrDefault();
                        responseData.Status = "OK";
                        responseData.Results = birthCertificateData;
                    }
                }
                else if(reqType == "death-certificate-detail")
                {
                    if (deathDetailId > 0)
                    {
                        var deathCertificateData = (from deathDetail in dbContext.DeathDetails
                                                    join pat in dbContext.Patient on deathDetail.PatientId equals pat.PatientId
                                                    join country in dbContext.Countries on pat.CountryId equals country.CountryId
                                                    join subdiv in dbContext.CountrySubdivisions on pat.CountrySubDivisionId equals subdiv.CountrySubDivisionId
                                                    where deathDetail.DeathId == deathDetailId
                                                    select new
                                                    {
                                                        DeathId = deathDetail.DeathId,
                                                        FiscalYear = deathDetail.FiscalYear,
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
                                                    }).FirstOrDefault();

                        //deathCertificateData.Age = GetAgeBetweenTwoDates(Convert.ToDateTime(deathCertificateData.DateOfBirth), Convert.ToDateTime(deathCertificateData.DeathDate);

                        responseData.Status = "OK";
                        responseData.Results = deathCertificateData;
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

        [HttpPost]// POST api/values
        public string Post()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                string reqType = this.ReadQueryStringData("reqType");
                string ipStr = this.ReadPostData();
                MedicalRecordsDbContext mrDbContext = new MedicalRecordsDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

                if(reqType == "post-patient-medicalrecord")
                {
                    MedicalRecordModel medicalRecordOfPatient = DanpheJSONConvert.DeserializeObject<MedicalRecordModel>(ipStr);
                    using(var medicalRecTransaction = mrDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            var dateOfBirth = (from pat in mrDbContext.Patient
                                           where pat.PatientId == medicalRecordOfPatient.PatientId
                                           select pat.DateOfBirth).FirstOrDefault();

                            medicalRecordOfPatient.CreatedBy = currentUser.EmployeeId;
                            medicalRecordOfPatient.CreatedOn = DateTime.Now;
                            mrDbContext.MedicalRecords.Add(medicalRecordOfPatient);
                            mrDbContext.SaveChanges();

                            if (medicalRecordOfPatient.ShowBirthCertDetail == true)
                            {
                                foreach (var brthCert in medicalRecordOfPatient.BabyBirthDetails)
                                {
                                    brthCert.MedicalRecordId = medicalRecordOfPatient.MedicalRecordId;
                                    brthCert.CreatedBy = currentUser.EmployeeId;
                                    brthCert.CreatedOn = DateTime.Now;
                                    brthCert.IsActive = true;
                                    brthCert.FiscalYear = GetFiscalYear(brthCert.BirthDate.Date);                                   

                                    mrDbContext.BabyBirthDetails.Add(brthCert);
                                    mrDbContext.SaveChanges();
                                }
                            }

                            if (medicalRecordOfPatient.ShowDeathCertDetail == true)
                            {
                                medicalRecordOfPatient.DeathDetail.MedicalRecordId = medicalRecordOfPatient.MedicalRecordId;
                                medicalRecordOfPatient.DeathDetail.CreatedBy = currentUser.EmployeeId;
                                medicalRecordOfPatient.DeathDetail.CreatedOn = DateTime.Now;
                                medicalRecordOfPatient.DeathDetail.DeathDate = medicalRecordOfPatient.DeathDetail.DeathDate;
                                medicalRecordOfPatient.DeathDetail.IsActive = true;
                                medicalRecordOfPatient.DeathDetail.FiscalYear = GetFiscalYear(medicalRecordOfPatient.DeathDetail.DeathDate);
                                medicalRecordOfPatient.DeathDetail.Age = GetAgeBetweenTwoDates(Convert.ToDateTime(dateOfBirth.Value), medicalRecordOfPatient.DeathDetail.DeathDate);
                                mrDbContext.DeathDetails.Add(medicalRecordOfPatient.DeathDetail);
                                mrDbContext.SaveChanges();
                            }

                            medicalRecTransaction.Commit();
                            responseData.Results = medicalRecordOfPatient;
                        }
                        catch (Exception ex)
                        {
                            medicalRecTransaction.Rollback();
                            responseData.Status = "Failed";
                            responseData.Results = ex.Message + " exception details:" + ex.ToString();
                            throw (ex);
                        }
                       

                    }                   

                } 
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        [HttpPut]
        public string Put(string reqType)
        {
            string ipStr = this.ReadPostData();
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            MedicalRecordsDbContext mrDbContext = new MedicalRecordsDbContext(connString);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                if (reqType == "update-birthdetail") {
                    BabyBirthDetailsModel birthDetail = DanpheJSONConvert.DeserializeObject<BabyBirthDetailsModel>(ipStr);
                    var birthDetailToUpdtae = mrDbContext.BabyBirthDetails.Where(b => b.BabyBirthDetailsId == birthDetail.BabyBirthDetailsId).FirstOrDefault();
                    if(birthDetailToUpdtae != null)
                    {
                        birthDetailToUpdtae.BirthDate = birthDetail.BirthDate;
                        birthDetailToUpdtae.BirthTime = birthDetail.BirthTime;
                        birthDetailToUpdtae.CertificateNumber = birthDetail.CertificateNumber;
                        birthDetailToUpdtae.FathersName = birthDetail.FathersName;
                        birthDetailToUpdtae.NumberOfBabies = birthDetail.NumberOfBabies;
                        birthDetailToUpdtae.WeightOfBaby = birthDetail.WeightOfBaby;
                        birthDetailToUpdtae.Sex = birthDetail.Sex;
                        birthDetailToUpdtae.ModifiedOn = DateTime.Now;
                        birthDetailToUpdtae.ModifiedBy = currentUser.EmployeeId;
                        birthDetailToUpdtae.IsActive = true;
                       
                        birthDetailToUpdtae.FiscalYear = GetFiscalYear(birthDetail.BirthDate.Date);

                        mrDbContext.Entry(birthDetailToUpdtae).Property(x => x.BirthDate).IsModified = true;
                        mrDbContext.Entry(birthDetailToUpdtae).Property(x => x.BirthTime).IsModified = true;
                        mrDbContext.Entry(birthDetailToUpdtae).Property(x => x.CertificateNumber).IsModified = true;
                        mrDbContext.Entry(birthDetailToUpdtae).Property(x => x.FathersName).IsModified = true;
                        mrDbContext.Entry(birthDetailToUpdtae).Property(x => x.NumberOfBabies).IsModified = true;
                        mrDbContext.Entry(birthDetailToUpdtae).Property(x => x.WeightOfBaby).IsModified = true;
                        mrDbContext.Entry(birthDetailToUpdtae).Property(x => x.Sex).IsModified = true;
                        mrDbContext.Entry(birthDetailToUpdtae).Property(x => x.ModifiedBy).IsModified = true;
                        mrDbContext.Entry(birthDetailToUpdtae).Property(x => x.ModifiedOn).IsModified = true;
                        mrDbContext.Entry(birthDetailToUpdtae).Property(x => x.IsActive).IsModified = true;
                        mrDbContext.Entry(birthDetailToUpdtae).Property(x => x.FiscalYear).IsModified = true;

                        mrDbContext.SaveChanges();

                        responseData.Status = "OK";
                        responseData.Results = birthDetailToUpdtae;

                    }
                }
                else if(reqType == "update-patient-medicalrecord")
                {
                    MedicalRecordModel medicalRecordOfPatient = DanpheJSONConvert.DeserializeObject<MedicalRecordModel>(ipStr);
                    var mrToUpdate = (from mr in mrDbContext.MedicalRecords
                                      where mr.MedicalRecordId == medicalRecordOfPatient.MedicalRecordId
                                      select mr).FirstOrDefault();
                    if(mrToUpdate != null)
                    {
                        using (var medicalRecordTransaction = mrDbContext.Database.BeginTransaction())
                        {
                            try
                            {
                                var dateOfBirth = (from pat in mrDbContext.Patient
                                                   where pat.PatientId == medicalRecordOfPatient.PatientId
                                                   select pat.DateOfBirth).FirstOrDefault();

                                var rec = (from mrec in mrDbContext.MedicalRecords
                                           where mrec.MedicalRecordId == medicalRecordOfPatient.MedicalRecordId
                                           select mrec).FirstOrDefault();


                                rec.DischargeTypeId = medicalRecordOfPatient.DischargeTypeId;
                                rec.DischargeConditionId = medicalRecordOfPatient.DischargeConditionId;
                                rec.BabyBirthConditionId = medicalRecordOfPatient.BabyBirthConditionId;
                                rec.DeathPeriodTypeId = medicalRecordOfPatient.DeathPeriodTypeId;
                                rec.OperationTypeId = medicalRecordOfPatient.OperationTypeId;
                                rec.OperatedByDoctor = medicalRecordOfPatient.OperatedByDoctor;
                                rec.OperationDiagnosis = medicalRecordOfPatient.OperationDiagnosis;
                                rec.OperationDate = medicalRecordOfPatient.OperationDate;
                                rec.IsOperationConducted = medicalRecordOfPatient.IsOperationConducted;
                                rec.Remarks = medicalRecordOfPatient.Remarks;
                                rec.AllTests = medicalRecordOfPatient.AllTests;
                                rec.ICDCode = medicalRecordOfPatient.ICDCode;
                                rec.GravitaId = medicalRecordOfPatient.GravitaId;
                                rec.GestationalWeek = medicalRecordOfPatient.GestationalWeek;                               
                                rec.ModifiedBy = currentUser.EmployeeId;
                                rec.ModifiedOn = DateTime.Now;
                                rec.FileNumber = medicalRecordOfPatient.FileNumber;


                                mrDbContext.Entry(rec).Property(b => b.MedicalRecordId).IsModified = false;
                                mrDbContext.Entry(rec).Property(b => b.PatientId).IsModified = false;
                                mrDbContext.Entry(rec).Property(b => b.PatientVisitId).IsModified = false;
                                mrDbContext.Entry(rec).Property(b => b.CreatedBy).IsModified = false;
                                mrDbContext.Entry(rec).Property(b => b.CreatedOn).IsModified = false;

                                mrDbContext.SaveChanges();

                                if (medicalRecordOfPatient.ShowBirthCertDetail == true && medicalRecordOfPatient.BabyBirthDetails != null)
                                {
                                    foreach (var brthCert in medicalRecordOfPatient.BabyBirthDetails)
                                    {
                                        int brthId = brthCert.BabyBirthDetailsId;
                                        if(brthId > 0)
                                        {
                                            var bdt = (from birth in mrDbContext.BabyBirthDetails
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
                                            bdt.NumberOfBabies = brthCert.NumberOfBabies;
                                            bdt.WeightOfBaby = brthCert.WeightOfBaby;
                                            bdt.IsActive = true;
                                            
                                            bdt.FiscalYear = GetFiscalYear(brthCert.BirthDate);

                                            mrDbContext.Entry(bdt).Property(p => p.IssuedBy).IsModified = false;
                                            mrDbContext.Entry(bdt).Property(p => p.CertifiedBy).IsModified = false;
                                            mrDbContext.Entry(bdt).Property(p => p.CreatedBy).IsModified = false;
                                            mrDbContext.Entry(bdt).Property(p => p.CreatedOn).IsModified = false;
                                            mrDbContext.Entry(bdt).Property(p => p.PatientId).IsModified = false;
                                            mrDbContext.Entry(bdt).Property(p => p.PatientVisitId).IsModified = false;
                                            mrDbContext.Entry(bdt).Property(p => p.BabyBirthDetailsId).IsModified = false;
                                            mrDbContext.Entry(bdt).Property(p => p.MedicalRecordId).IsModified = false;
                                            mrDbContext.Entry(bdt).Property(p => p.BirthNumberType).IsModified = false;
                                            mrDbContext.Entry(bdt).Property(p => p.PrintCount).IsModified = false;
                                            mrDbContext.Entry(bdt).Property(p => p.PrintedBy).IsModified = false;
                                            mrDbContext.Entry(bdt).Property(p => p.IssuedBy).IsModified = false;
                                            mrDbContext.Entry(bdt).Property(p => p.CertifiedBy).IsModified = false;

                                            mrDbContext.SaveChanges();
                                        } else
                                        {
                                            brthCert.CreatedBy = currentUser.EmployeeId;
                                            brthCert.CreatedOn = DateTime.Now;
                                            brthCert.IsActive = true;
                                            brthCert.MedicalRecordId = medicalRecordOfPatient.MedicalRecordId;
                                            brthCert.FiscalYear = GetFiscalYear(brthCert.BirthDate.Date);

                                            mrDbContext.BabyBirthDetails.Add(brthCert);
                                            mrDbContext.SaveChanges();
                                        }
                                    }
                                } else
                                {
                                    foreach (var brthCert in medicalRecordOfPatient.BabyBirthDetails)
                                    {
                                        int brthId = brthCert.BabyBirthDetailsId;
                                        if (brthId > 0)
                                        {
                                            var brthDet = (from brt in mrDbContext.BabyBirthDetails
                                                           where brt.BabyBirthDetailsId == brthId
                                                           select brt).FirstOrDefault();
                                            brthDet.ModifiedBy = currentUser.EmployeeId;
                                            brthDet.ModifiedOn = DateTime.Now;
                                            brthDet.IsActive = false;
                                            mrDbContext.Entry(brthDet).Property(b => b.IsActive).IsModified = true;
                                            mrDbContext.Entry(brthDet).Property(b => b.ModifiedOn).IsModified = true;
                                            mrDbContext.Entry(brthDet).Property(b => b.ModifiedBy).IsModified = true;
                                            mrDbContext.SaveChanges();
                                        }
                                    }
                                }

                                if (medicalRecordOfPatient.ShowDeathCertDetail == true)
                                {
                                    if (medicalRecordOfPatient.DeathDetail.DeathId > 0)
                                    {
                                        var death = (from dth in mrDbContext.DeathDetails
                                                     where dth.DeathId == medicalRecordOfPatient.DeathDetail.DeathId
                                                     select dth).FirstOrDefault();

                                        death.CertificateNumber = medicalRecordOfPatient.DeathDetail.CertificateNumber;
                                        death.DeathDate = medicalRecordOfPatient.DeathDetail.DeathDate;
                                        death.FiscalYear = GetFiscalYear(death.DeathDate);
                                        death.DeathTime = medicalRecordOfPatient.DeathDetail.DeathTime;
                                        death.Age = GetAgeBetweenTwoDates(Convert.ToDateTime(dateOfBirth.Value), medicalRecordOfPatient.DeathDetail.DeathDate);
                                        death.ModifiedBy = medicalRecordOfPatient.DeathDetail.ModifiedBy;
                                        death.ModifiedOn = medicalRecordOfPatient.DeathDetail.ModifiedOn;
                                        death.IsActive = true;

                                        mrDbContext.Entry(death).Property(b => b.IsActive).IsModified = true;
                                        mrDbContext.Entry(death).Property(b => b.ModifiedOn).IsModified = true;
                                        mrDbContext.Entry(death).Property(b => b.Age).IsModified = true;
                                        mrDbContext.Entry(death).Property(b => b.FiscalYear).IsModified = true;
                                        mrDbContext.Entry(death).Property(b => b.ModifiedBy).IsModified = true;
                                        mrDbContext.Entry(death).Property(b => b.CertificateNumber).IsModified = true;
                                        mrDbContext.Entry(death).Property(b => b.DeathTime).IsModified = true;
                                        mrDbContext.Entry(death).Property(b => b.DeathDate).IsModified = true;

                                        mrDbContext.SaveChanges();
                                    }
                                    else
                                    {                                        
                                        medicalRecordOfPatient.DeathDetail.MedicalRecordId = medicalRecordOfPatient.MedicalRecordId;
                                        medicalRecordOfPatient.DeathDetail.CreatedBy = currentUser.EmployeeId;
                                        medicalRecordOfPatient.DeathDetail.CreatedOn = DateTime.Now;
                                        medicalRecordOfPatient.DeathDetail.IsActive = true;
                                        medicalRecordOfPatient.DeathDetail.FiscalYear = GetFiscalYear(medicalRecordOfPatient.DeathDetail.DeathDate);
                                        medicalRecordOfPatient.DeathDetail.Age = GetAgeBetweenTwoDates(Convert.ToDateTime(dateOfBirth.Value), medicalRecordOfPatient.DeathDetail.DeathDate);
                                        mrDbContext.DeathDetails.Add(medicalRecordOfPatient.DeathDetail);
                                        mrDbContext.SaveChanges();
                                    }
                                   
                                    
                                }
                                else
                                {
                                    if (medicalRecordOfPatient.DeathDetail != null && medicalRecordOfPatient.DeathDetail.DeathId > 0)
                                    {
                                        var death = (from dth in mrDbContext.DeathDetails
                                                     where dth.DeathId == medicalRecordOfPatient.DeathDetail.DeathId
                                                     select dth).FirstOrDefault();

                                        death.ModifiedBy = currentUser.ModifiedBy;
                                        death.ModifiedOn = DateTime.Now;
                                        death.IsActive = false;

                                        mrDbContext.Entry(death).Property(b => b.IsActive).IsModified = true;
                                        mrDbContext.Entry(death).Property(b => b.ModifiedOn).IsModified = true;
                                        mrDbContext.Entry(death).Property(b => b.ModifiedBy).IsModified = true;

                                        mrDbContext.SaveChanges();
                                    }
                                    
                                }

                                medicalRecordTransaction.Commit();
                                responseData.Status = "OK";
                                responseData.Results = medicalRecordOfPatient;
                            }
                            catch (Exception ex)
                            {
                                medicalRecordTransaction.Rollback();
                                throw (ex);
                            }
                        }
                    }
                }
                else if(reqType == "update-birth-certificate-detail")
                {
                    BabyBirthDetailsModel birthDetail = DanpheJSONConvert.DeserializeObject<BabyBirthDetailsModel>(ipStr);

                    var birth = mrDbContext.BabyBirthDetails.Where(b => 
                    b.BabyBirthDetailsId == birthDetail.BabyBirthDetailsId).FirstOrDefault();

                    birth.PrintedBy = currentUser.EmployeeId;
                    birth.PrintCount = birthDetail.PrintCount + 1;
                    birth.IssuedBy = birthDetail.IssuedBy;
                    birth.CertifiedBy = birthDetail.CertifiedBy;
                    birth.BirthType = birthDetail.BirthType;
                    birth.BirthNumberType = birthDetail.BirthNumberType;
                    birth.PrintedOn = System.DateTime.Now;

                    mrDbContext.Entry(birth).Property(x => x.PrintedBy).IsModified = true;
                    mrDbContext.Entry(birth).Property(x => x.PrintCount).IsModified = true;
                    mrDbContext.Entry(birth).Property(x => x.PrintedOn).IsModified = true;
                    mrDbContext.Entry(birth).Property(x => x.IssuedBy).IsModified = true;
                    mrDbContext.Entry(birth).Property(x => x.CertifiedBy).IsModified = true;
                    mrDbContext.Entry(birth).Property(x => x.BirthType).IsModified = true;
                    mrDbContext.Entry(birth).Property(x => x.BirthNumberType).IsModified = true;

                    mrDbContext.SaveChanges();
                    responseData.Status = "OK";
                    responseData.Results = birthDetail;

                }
                else if(reqType == "update-death-certificate-detail")
                {
                    DeathDetailsModel deathDetail = DanpheJSONConvert.DeserializeObject<DeathDetailsModel>(ipStr);

                    var death = mrDbContext.DeathDetails.Where(d =>
                    d.DeathId == deathDetail.DeathId).FirstOrDefault();

                    death.PrintedBy = currentUser.EmployeeId;
                    death.PrintCount = deathDetail.PrintCount + 1;
                    death.CertifiedBy = deathDetail.CertifiedBy;
                    death.FatherName = deathDetail.FatherName;
                    death.MotherName = deathDetail.MotherName;
                    death.SpouseOf = deathDetail.SpouseOf;
                    death.CauseOfDeath = deathDetail.CauseOfDeath;
                    death.PrintedOn = System.DateTime.Now;

                    mrDbContext.Entry(death).Property(x => x.PrintedBy).IsModified = true;
                    mrDbContext.Entry(death).Property(x => x.PrintCount).IsModified = true;
                    mrDbContext.Entry(death).Property(x => x.PrintedOn).IsModified = true;
                    mrDbContext.Entry(death).Property(x => x.FatherName).IsModified = true;
                    mrDbContext.Entry(death).Property(x => x.CertifiedBy).IsModified = true;
                    mrDbContext.Entry(death).Property(x => x.SpouseOf).IsModified = true;
                    mrDbContext.Entry(death).Property(x => x.CauseOfDeath).IsModified = true;
                    mrDbContext.Entry(death).Property(x => x.MotherName).IsModified = true;

                    mrDbContext.SaveChanges();
                    responseData.Status = "OK";
                    responseData.Results = death;
                }
                else if(reqType == "update-birth-cert-printcount")
                {
                    BabyBirthDetailsModel birthDetail = DanpheJSONConvert.DeserializeObject<BabyBirthDetailsModel>(ipStr);

                    var birth = mrDbContext.BabyBirthDetails.Where(b =>
                    b.BabyBirthDetailsId == birthDetail.BabyBirthDetailsId).FirstOrDefault();

                    birth.PrintedBy = currentUser.EmployeeId;
                    birth.PrintCount = birthDetail.PrintCount + 1;
                    birth.PrintedOn = System.DateTime.Now;

                    mrDbContext.Entry(birth).Property(x => x.PrintedBy).IsModified = true;
                    mrDbContext.Entry(birth).Property(x => x.PrintCount).IsModified = true;
                    mrDbContext.Entry(birth).Property(x => x.PrintedOn).IsModified = true;

                    mrDbContext.SaveChanges();

                    responseData.Status = "OK";
                    responseData.Results = birthDetail;
                }
                else if (reqType == "update-death-cert-printcount")
                {
                    DeathDetailsModel deathDetail = DanpheJSONConvert.DeserializeObject<DeathDetailsModel>(ipStr);

                    var death = mrDbContext.DeathDetails.Where(d =>
                    d.DeathId == deathDetail.DeathId).FirstOrDefault();

                    death.PrintedBy = currentUser.EmployeeId;
                    death.PrintCount = death.PrintCount + 1;
                    death.PrintedOn = System.DateTime.Now;

                    mrDbContext.Entry(death).Property(x => x.PrintedBy).IsModified = true;
                    mrDbContext.Entry(death).Property(x => x.PrintCount).IsModified = true;
                    mrDbContext.Entry(death).Property(x => x.PrintedOn).IsModified = true;

                    mrDbContext.SaveChanges();

                    responseData.Status = "OK";
                    responseData.Results = deathDetail;
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }

            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        public string GetFiscalYear(DateTime date)
        {
            MedicalRecordsDbContext mrDbContext = new MedicalRecordsDbContext(base.connString);
            var fsYear = mrDbContext.BillingFiscalYears.Where(fsc => fsc.StartYear <= date && fsc.EndYear >= date).FirstOrDefault();
            if (fsYear != null)
            {
                return fsYear.FiscalYearFormatted;
            } else { return null; }
        }

        public string GetAgeBetweenTwoDates(DateTime start, DateTime end)
        {
            var diff = new DateTime(end.Subtract(start).Ticks);
            var year = diff.Year - 1;
            var month = diff.Month - 1;
            var days = diff.Day;
            if (year > 0) { return year + " " + "years"; }
            else {
                if(month > 0)
                {
                    return month + " " + "months";
                } else
                {
                    return days + "days";
                }
            }
        }

        public object GetAllDischargeTypeMasterData(MedicalRecordsDbContext dbContext)
        {
          var allDischargeType =  (from disType in dbContext.DischargeType
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
    }
}

