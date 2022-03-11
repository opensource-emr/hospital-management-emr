using DanpheEMR.Controllers;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.Vaccination;
using DanpheEMR.Utilities;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services.Vaccination
{
    public class VaccinationService : IVaccinationService
    {
        public VaccinationDbContext vaccinationDbContext;
        public string connStr;
        public VaccinationService(IOptions<MyConfiguration> _config)
        {
            this.connStr = _config.Value.Connectionstring;
            vaccinationDbContext = new VaccinationDbContext(connStr);
        }

        public void AddUpdatePatienVaccinationDetail(PatientVaccineDetailModel vac)
        {
            if (vac.PatientVaccineId == 0)
            {
                vaccinationDbContext.PatientVaccineDetail.Add(vac);
            }
            else
            {
                var selectedPatVaccDetail = vaccinationDbContext.PatientVaccineDetail.Where(p => (p.PatientVaccineId == vac.PatientVaccineId)).FirstOrDefault();
                vaccinationDbContext.PatientVaccineDetail.Attach(selectedPatVaccDetail);
                selectedPatVaccDetail.VaccineDate = vac.VaccineDate;
                selectedPatVaccDetail.VaccineId = vac.VaccineId;
                selectedPatVaccDetail.DoseNumber = vac.DoseNumber;
                selectedPatVaccDetail.Remarks = vac.Remarks;
            }
            vaccinationDbContext.SaveChanges();
        }

        public PatientModel AddUpdateVaccinationPatient(PatientModel patient)
        {
            DateTime currentDate = DateTime.Now.Date;
            var regAutoIncreamentEnabledParam = vaccinationDbContext.AdminParameters.Where(p => (p.ParameterName == "AutoIncreamentRegNumber")
                                                    && (p.ParameterGroupName.ToLower() == "vaccination")).Select(s => s.ParameterValue).FirstOrDefault() ?? "false";


            bool isVaccAutoIncreamentOfRegNumEnabled = false;
            if ((regAutoIncreamentEnabledParam.Trim().ToLower() == "true") || (regAutoIncreamentEnabledParam.Trim().ToLower() == "1"))
            {
                isVaccAutoIncreamentOfRegNumEnabled = true;
            }

            var vaccRegdNum = patient.VaccinationRegNo;

            var fiscalYear = GetFiscalYearByDate(currentDate);
            int fiscalYearId = fiscalYear.FiscalYearId;
            var regNumExist = false;

            if (isVaccAutoIncreamentOfRegNumEnabled)
            {
                vaccRegdNum = vaccinationDbContext.Patients.Where(p => (p.IsVaccinationPatient.HasValue
                                && (p.IsVaccinationPatient == true)) && p.VaccinationRegNo.HasValue
                                && p.VaccinationFiscalYearId == fiscalYearId).Max(m => m.VaccinationRegNo) ?? 0;
                vaccRegdNum++;
            }
            else
            {
                var patientId = patient.PatientId;
                //if there is patientId then fiscalyearId can be null or not
                bool hasFiscalYear = patient.VaccinationFiscalYearId.HasValue && (patient.VaccinationFiscalYearId > 0);
                var existingFiscalYear = patient.VaccinationFiscalYearId;

                var patWithRegNumber = vaccinationDbContext.Patients.Where(p => (p.IsVaccinationPatient.HasValue && ((patientId > 0) ? (p.PatientId != patientId) : true)
                                 && (p.IsVaccinationPatient == true)) && p.VaccinationRegNo.HasValue && (p.VaccinationRegNo == vaccRegdNum)
                                 && (hasFiscalYear ? (p.VaccinationFiscalYearId == existingFiscalYear) : (p.VaccinationFiscalYearId == fiscalYearId))
                                 ).Select(m => m.VaccinationRegNo).FirstOrDefault();
                regNumExist = patWithRegNumber.HasValue ? true : false;
            }

            if (!isVaccAutoIncreamentOfRegNumEnabled && regNumExist)
            {
                throw new Exception("This registration number is already registered");
            }

            if (!isVaccAutoIncreamentOfRegNumEnabled && !(patient.VaccinationRegNo > 0))
            {
                throw new Exception("This registration number should be greater than 0");
            }



            if (!String.IsNullOrEmpty(patient.ShortName))
            {
                if (patient.PatientId > 0)
                {
                    patient.MiddleName = "";
                    patient.ShortName = patient.ShortName.Trim();
                    var splitted = patient.ShortName.Split(' ');
                    patient.FirstName = splitted[0];
                    patient.LastName = (splitted.Length > 1) ? splitted[splitted.Length - 1] : " ";
                    for (var i = 1; i < (splitted.Length - 1); i++)
                    {
                        if (!String.IsNullOrEmpty(splitted[i]))
                        {
                            patient.MiddleName = patient.MiddleName + splitted[i] + " ";
                        }
                    }
                    patient.MiddleName = String.IsNullOrEmpty(patient.MiddleName) ? null : patient.MiddleName;  //this is to make middlename null if it is empty
                }
                else
                {
                    patient.MiddleName = " ";
                    patient.FirstName = patient.ShortName;
                    patient.LastName = " ";
                }
            }
            PatientModel tempPat;
            //add case
            if (patient.PatientId == 0)
            {
                var membership = vaccinationDbContext.MembershipTypes.Where(i => i.MembershipTypeName == "General").FirstOrDefault();
                patient.MembershipTypeId = membership.MembershipTypeId;
                NewPatientUniqueNumbersVM newPatientNumber = PatientBL.GetPatNumberNCodeForNewPatient(connStr);
                patient.VaccinationRegNo = vaccRegdNum;
                patient.PatientNo = newPatientNumber.PatientNo;
                patient.PatientCode = newPatientNumber.PatientCode;
                patient.IsActive = true;
                patient.IsVaccinationPatient = true;
                patient.IsVaccinationActive = true;//sud:2-Oct'21--earlier this value wasn't saved in create..
                patient.VaccinationFiscalYearId = fiscalYearId;
                vaccinationDbContext.Patients.Add(patient);
                tempPat = patient;
                vaccinationDbContext.SaveChanges();
                //After the patient is added we need to create a new visit against Immunization department..

                VisitModel immunVisiObj = GetNewVisitObjForImmunization(patient, vaccinationDbContext, this.connStr);
                vaccinationDbContext.Visits.Add(immunVisiObj);
                vaccinationDbContext.SaveChanges();
            }
            //update case
            else
            {
                var selectedPat = vaccinationDbContext.Patients.Where(p => (p.PatientId == patient.PatientId)).FirstOrDefault();
                vaccinationDbContext.Patients.Attach(selectedPat);
                if (!selectedPat.MembershipTypeId.HasValue || (selectedPat.MembershipTypeId == 0))
                {
                    var membership = vaccinationDbContext.MembershipTypes.Where(i => i.MembershipTypeName == "General").FirstOrDefault();
                    selectedPat.MembershipTypeId = membership.MembershipTypeId;
                }
                if ((!selectedPat.VaccinationRegNo.HasValue || (selectedPat.VaccinationRegNo == 0)) || !isVaccAutoIncreamentOfRegNumEnabled)
                {
                    selectedPat.VaccinationRegNo = vaccRegdNum;
                }
                selectedPat.ShortName = patient.ShortName;
                selectedPat.FirstName = patient.FirstName;
                selectedPat.LastName = patient.LastName;
                selectedPat.MiddleName = patient.MiddleName;
                selectedPat.ShortName = patient.ShortName;
                selectedPat.Age = patient.Age;
                selectedPat.DateOfBirth = patient.DateOfBirth;
                selectedPat.Gender = patient.Gender;
                selectedPat.MotherName = patient.MotherName;
                selectedPat.FatherName = patient.FatherName;
                selectedPat.Address = patient.Address;
                selectedPat.PhoneNumber = patient.PhoneNumber;
                selectedPat.EthnicGroup = patient.EthnicGroup;
                selectedPat.CountryId = patient.CountryId;
                selectedPat.CountrySubDivisionId = patient.CountrySubDivisionId;
                //selectedPat.CreatedOn = System.DateTime.Now;
                selectedPat.IsVaccinationPatient = true;
                selectedPat.IsVaccinationActive = true;
                selectedPat.ModifiedBy = patient.ModifiedBy;
                selectedPat.ModifiedOn = patient.ModifiedOn;
                tempPat = selectedPat;
                vaccinationDbContext.SaveChanges();
            }


            return tempPat;
        }



        //sud:2-Oct'21--Revised implementation after adding vaccination patient in Visit Table
        public List<VaccPatientWithVisitInfoVM> GetAllVaccinationPatient()
        {
            List<VaccPatientWithVisitInfoVM> allVaccPatList = vaccinationDbContext.Database.SqlQuery<VaccPatientWithVisitInfoVM>("SP_VACC_GetAllVaccinationPatInfo").ToList();
            return allVaccPatList;
        }


        //public List<VaccinationPatientVM> GetAllVaccinationPatient()
        //{
        //    var today = System.DateTime.Today;
        //    return vaccinationDbContext.Patients.Where(p => (p.IsVaccinationPatient.HasValue && (p.IsVaccinationPatient == true)))
        //                                .Select(v => new VaccinationPatientVM
        //                                {
        //                                    PatientId = v.PatientId,
        //                                    ShortName = v.ShortName,
        //                                    DateOfBirth = v.DateOfBirth.HasValue ? v.DateOfBirth.Value : today,
        //                                    EthnicGroup = v.EthnicGroup,
        //                                    FatherName = v.FatherName,
        //                                    MotherName = v.MotherName,
        //                                    VaccinationRegNo = v.VaccinationRegNo.Value,
        //                                    PhoneNumber = v.PhoneNumber,
        //                                    Gender = v.Gender,
        //                                    Address = v.Address,
        //                                    PatientCode = v.PatientCode,
        //                                    VaccinationFiscalYearId = v.VaccinationFiscalYearId
        //                                }).OrderByDescending(p => p.PatientId).ToList();
        //}


        public List<VaccineMasterModel> GetAllVaccinesAndDosesList(bool dosesNeeded)
        {
            var allDoses = CommonFunctions.GetDosesNumberArray();
            var data = vaccinationDbContext.VaccineMaster.Where(v => v.IsActive).ToList();
            if (dosesNeeded)
            {
                foreach (var item in data)
                {
                    item.DoseDetail = allDoses.Where(d => d.Id <= item.NumberOfDoses).ToList();
                }
            }
            return data;
        }

        public List<PatientVaccineDetailVM> GetAllVaccinesOfPatientByPatientId(int patId)
        {
            var allDoses = CommonFunctions.GetDosesNumberArray();
            var data = (from vacc in vaccinationDbContext.PatientVaccineDetail
                        join vmas in vaccinationDbContext.VaccineMaster on vacc.VaccineId equals vmas.VaccineId
                        join emp in vaccinationDbContext.Employee on vacc.CreatedBy equals emp.EmployeeId
                        where vacc.PatientId == patId
                        select new PatientVaccineDetailVM
                        {
                            DoseNumber = vacc.DoseNumber,
                            PatientId = vacc.PatientId,
                            PatientVaccineId = vacc.PatientVaccineId,
                            EnteredBy = emp.FullName,
                            Remarks = vacc.Remarks,
                            VaccineName = vmas.VaccineName,
                            VaccineId = vmas.VaccineId,
                            DoseNumberStr = "",
                            VaccineDate = vacc.VaccineDate
                        }).ToList();

            foreach (var item in data)
            {
                item.DoseNumberStr = allDoses.Where(d => d.Id == item.DoseNumber).FirstOrDefault()?.NumberInfo;
            }
            return data;

        }

        public VaccinationPatientVM GetVaccinationPatientByPatientId(int id)
        {
            return vaccinationDbContext.Patients.Where(p => (p.PatientId == id)).Select(v => new VaccinationPatientVM
            {
                PatientId = v.PatientId,
                ShortName = v.ShortName,
                DateOfBirth = v.DateOfBirth.Value,
                EthnicGroup = v.EthnicGroup,
                FatherName = v.FatherName,
                MotherName = v.MotherName,
                VaccinationRegNo = v.VaccinationRegNo,
                PhoneNumber = v.PhoneNumber,
                Gender = v.Gender,
                Address = v.Address,
                PatientCode = v.PatientCode,
                CountrySubDivisionId = v.CountrySubDivisionId,
                CountryId = v.CountryId,
                VaccinationFiscalYearId = v.VaccinationFiscalYearId,
                MunicipalityId = v.MunicipalityId
            }).FirstOrDefault();
        }

        public DataTable GetAllBabyPatient(string search)
        {
            DataTable dt = DALFunctions.GetDataTableFromStoredProc("SP_Vaccination_Baby_PatientList",
                        new List<SqlParameter>() { new SqlParameter("@SearchTxt", search) }, vaccinationDbContext);
            return dt;
        }
        public int GetLatestVaccRegNumber(int fiscalYearId)
        {
            DateTime currentDate = DateTime.Now.Date;
            if (fiscalYearId == 0)
            {
                var fiscalYear = GetFiscalYearByDate(currentDate);
                if (fiscalYear != null)
                {
                    fiscalYearId = fiscalYear.FiscalYearId;
                }
                else
                {
                    throw new Exception(string.Format("Fiscal Year Not Set"));
                }
            }

            var vaccRegdNum = vaccinationDbContext.Patients.Where(p => (p.IsVaccinationPatient.HasValue
                                && (p.IsVaccinationPatient == true)) && p.VaccinationRegNo.HasValue
                                && (p.VaccinationFiscalYearId == fiscalYearId)).Max(m => m.VaccinationRegNo) ?? 0;
            vaccRegdNum++;
            return vaccRegdNum;
        }

        public void UpdatePatienVaccRegNumber(int patId, int regNum, int selectedFiscalYearId)
        {
            if (selectedFiscalYearId > 0)
            {

                var patient = vaccinationDbContext.Patients.Where(p => p.PatientId == patId).FirstOrDefault();

                var patWithRegNumber = vaccinationDbContext.Patients.Where(p => (
                                        p.IsVaccinationPatient.HasValue && (p.PatientId != patId)
                                        && (p.IsVaccinationPatient == true) && p.VaccinationRegNo.HasValue && (p.VaccinationRegNo == regNum)
                                        && (p.VaccinationFiscalYearId == selectedFiscalYearId)
                                     )).Select(m => new { m.VaccinationRegNo, m.ShortName }).FirstOrDefault();

                if (patWithRegNumber == null)
                {
                    if (patient != null)
                    {
                        patient.VaccinationRegNo = regNum;
                        patient.VaccinationFiscalYearId = selectedFiscalYearId;
                        vaccinationDbContext.SaveChanges();
                    }
                }
                else
                {
                    throw new Exception("This registration number is already used for " + patWithRegNumber.ShortName);
                }
            }
            else
            {
                throw new Exception(string.Format("Fiscal Year Not Set"));
            }
        }

        public BillingFiscalYear GetFiscalYearByDate(DateTime date)
        {
            var fiscalYear = vaccinationDbContext.BillingFiscalYears.Where(fsc => fsc.StartYear <= date && fsc.EndYear >= date).FirstOrDefault();
            if (fiscalYear != null)
            {
                return fiscalYear;
            }
            else
            {
                throw new Exception("Fiscal Year not Set.");
            }
        }

        public dynamic GetEistingPatientWithVaccRegNumber(int fiscalYearId, int regNum)
        {
            if ((fiscalYearId == 0) || (regNum == 0)) { throw new Exception("Select proper Fiscal Year and registration number"); }
            var data = vaccinationDbContext.Patients.AsNoTracking().Where(p => (p.VaccinationFiscalYearId == fiscalYearId) && (p.VaccinationRegNo == regNum))
                        .Select(s => new { s.PatientCode, s.ShortName, s.PatientId, s.VaccinationFiscalYearId, s.VaccinationRegNo }).FirstOrDefault();
            return data;
        }
        public List<EthnicGroupVM> GetCastEthnicGroupList()
        {
            var dataList = (from ethnic in vaccinationDbContext.EthnicGroupCast
                            where ethnic.IsActive == true
                            select new EthnicGroupVM
                            {
                                EthnicGroupId = ethnic.EthnicGroupId,
                                EthnicGroup = ethnic.EthnicGroup,
                                CastKeyWords = ethnic.CastKeyWords
                            }).ToList();

            return dataList;
        }


        //below function needs 
        public VisitModel GetNewVisitObjForImmunization(PatientModel pat, VaccinationDbContext vaccinationDbContext, string connString)
        {
            var immunizationDeptName = vaccinationDbContext.AdminParameters.Where(p => (p.ParameterName.ToLower() == "immunizationdeptname")
                                                    && (p.ParameterGroupName.ToLower() == "common")).FirstOrDefault().ParameterValue;

            DepartmentModel immunDeptObj = vaccinationDbContext.Departments.Where(d => d.DepartmentName == immunizationDeptName).FirstOrDefault();

            VisitModel vis = new VisitModel()
            {
                PatientId = pat.PatientId,
                VisitDate = DateTime.Now,
                VisitTime = DateTime.Now.TimeOfDay,//this gives only time of the day.. 
                DepartmentId = immunDeptObj.DepartmentId,
                VisitType = "outpatient",
                VisitStatus = "initiated",
                AppointmentType = "New",
                VisitDuration = 0,
                VisitCode = VisitBL.CreateNewPatientVisitCode("outpatient", connString),//Need to create using common functionality
                BillingStatus = "free", // 
                IsVisitContinued = false,//this will later be updated after followup.
                CreatedOn = DateTime.Now,
                CreatedBy = pat.CreatedBy,
                IsActive = true
            };

            return vis;
        }


        public VaccPatientWithVisitInfoVM GetVaccPatientWithVisitInfoByVisitId(int patientVisitId)
        {
            var patWithVisitInfo = (from vis in vaccinationDbContext.Visits
                                    where vis.PatientVisitId == patientVisitId
                                    join pat in vaccinationDbContext.Patients
                                    on vis.PatientId equals pat.PatientId
                                    join dist in vaccinationDbContext.CountrySubdivisions
                                    on pat.CountrySubDivisionId equals dist.CountrySubDivisionId
                                    join dep in vaccinationDbContext.Departments
                                    on vis.DepartmentId equals dep.DepartmentId
                                    join usr in vaccinationDbContext.RbacUsers on vis.CreatedBy equals usr.EmployeeId

                                    select new VaccPatientWithVisitInfoVM()
                                    {
                                        PatientId = pat.PatientId,
                                        PatientName = pat.ShortName,
                                        PatientCode = pat.PatientCode,
                                        DateOfBirth = pat.DateOfBirth,
                                        Gender = pat.Gender,
                                        DistrictName = dist.CountrySubDivisionName,
                                        Address = pat.Address,
                                        MotherName = pat.MotherName,
                                        VaccinationRegNo = pat.VaccinationRegNo,
                                        DepartmentName = dep.DepartmentName,
                                        PatientVisitId = vis.PatientVisitId,
                                        VisitDate = vis.VisitDate,
                                        VisitTime = vis.VisitTime,
                                        EthnicGroup = pat.EthnicGroup,
                                        FatherName = pat.FatherName,
                                        UserName = usr.UserName
                                    }).FirstOrDefault();

            if (patWithVisitInfo != null)
            {
                patWithVisitInfo.VisitDateTime = patWithVisitInfo.VisitDate.Value.Date + patWithVisitInfo.VisitTime.Value;
            }

            return patWithVisitInfo;
        }


        public VaccPatientWithVisitInfoVM PostFollowupVisit(VisitModel vis, string connString, RbacUser currentUser)
        {
            var immunizationDeptName = vaccinationDbContext.AdminParameters.Where(p => (p.ParameterName.ToLower() == "immunizationdeptname")
                                                   && (p.ParameterGroupName.ToLower() == "common")).FirstOrDefault().ParameterValue;

            DepartmentModel immunDeptObj = vaccinationDbContext.Departments.Where(d => d.DepartmentName == immunizationDeptName).FirstOrDefault();


            vis.VisitCode = VisitBL.CreateNewPatientVisitCode(vis.VisitType, connString);
            vis.DepartmentId = immunDeptObj.DepartmentId;
            vis.CreatedBy = currentUser.EmployeeId;
            vaccinationDbContext.Visits.Add(vis);
            vaccinationDbContext.SaveChanges();

            //need to update isvisitcontinued status to its parent visit.
            VisitModel parentVisit = vaccinationDbContext.Visits
                       .Where(v => v.PatientVisitId == vis.ParentVisitId)
                       .FirstOrDefault<VisitModel>();
            if (parentVisit != null)
            {
                parentVisit.IsVisitContinued = true;
                vaccinationDbContext.Entry(parentVisit).Property(b => b.IsVisitContinued).IsModified = true;
                vaccinationDbContext.SaveChanges();
            }

            //after all saved, return the vaccination visit info.. 
            VaccPatientWithVisitInfoVM retObj = GetVaccPatientWithVisitInfoByVisitId(vis.PatientVisitId);
            return retObj;
        }


        public List<dynamic> GetIntegratedVaccineReport(DateTime fromDate, DateTime toDate, string gender, List<int> vaccineList)
        {
            bool applyGenderFilter = !(gender.ToLower() == "all");
            var today = System.DateTime.Now;
            var data = (from pat in vaccinationDbContext.Patients.AsNoTracking()
                        where pat.IsVaccinationPatient.HasValue && (pat.IsVaccinationPatient == true)
                        join patVac in vaccinationDbContext.PatientVaccineDetail.AsNoTracking() on pat.PatientId equals patVac.PatientId
                        join vac in vaccinationDbContext.VaccineMaster.AsNoTracking() on patVac.VaccineId equals vac.VaccineId
                        where ((DbFunctions.TruncateTime(patVac.VaccineDate) >= fromDate) && (DbFunctions.TruncateTime(patVac.VaccineDate) <= toDate)
                        && (applyGenderFilter ? gender.ToLower() == pat.Gender.ToLower() : true)
                        && vaccineList.Contains(patVac.VaccineId)
                        )
                        select new
                        {
                            ShortName = pat.ShortName,
                            DateOfBirth = pat.DateOfBirth.HasValue ? pat.DateOfBirth.Value : today,
                            EthnicGroup = pat.EthnicGroup,
                            FatherName = pat.FatherName,
                            MotherName = pat.MotherName,
                            VaccinationRegNo = pat.VaccinationRegNo.Value,
                            PhoneNumber = pat.PhoneNumber,
                            Gender = pat.Gender,
                            Address = pat.Address,
                            PatientCode = pat.PatientCode,
                            VaccineName = vac.VaccineName,
                            DoseNumber = patVac.DoseNumber,
                            VaccinationDate = patVac.VaccineDate,
                            Age = pat.Age,
                        }).ToList<dynamic>();

            return data;
        }

        public DataTable GetDailyAppointmentReport(DateTime fromDate, DateTime toDate, string appointmentType)
        {

            List<SqlParameter> paramList = new List<SqlParameter>() {
                    new SqlParameter("@FromDate", fromDate),
                    new SqlParameter("@ToDate", toDate),
                    new SqlParameter("@AppointmentType",appointmentType)
                };
            DataTable apptReportData = DALFunctions.GetDataTableFromStoredProc("SP_Report_VACC_DailyAppointmentReport", paramList, vaccinationDbContext);
            return apptReportData;
        }

    }
}
