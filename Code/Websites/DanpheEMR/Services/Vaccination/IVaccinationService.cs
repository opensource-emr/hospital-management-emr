using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.Vaccination;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services.Vaccination
{
    public interface IVaccinationService
    {
        PatientModel AddUpdateVaccinationPatient(PatientModel patient);
        void AddUpdatePatienVaccinationDetail(PatientVaccineDetailModel vac);
        VaccinationPatientVM GetVaccinationPatientByPatientId(int id);
        List<EthnicGroupVM> GetCastEthnicGroupList();
        List<VaccPatientWithVisitInfoVM> GetAllVaccinationPatient();
        List<VaccineMasterModel> GetAllVaccinesAndDosesList(bool dosesNeeded);
        List<PatientVaccineDetailVM> GetAllVaccinesOfPatientByPatientId(int patId);
        DataTable GetAllBabyPatient(string search);

        int GetLatestVaccRegNumber(int fiscalYearId);
        dynamic GetEistingPatientWithVaccRegNumber(int fiscalYearId, int regNum);
        void UpdatePatienVaccRegNumber(int patId, int regNum, int fiscalYearId);

        VaccPatientWithVisitInfoVM GetVaccPatientWithVisitInfoByVisitId(int patientVisitId);

        VaccPatientWithVisitInfoVM PostFollowupVisit(VisitModel vis, string connString, RbacUser currentUser);


        List<dynamic> GetIntegratedVaccineReport(DateTime from, DateTime to, string gender, List<int> vaccineList);
        DataTable GetDailyAppointmentReport(DateTime fromDate, DateTime toDate, string appointmentType);
    }
}
