using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.ViewModel.ADT
{
    public class GetAdmittedList_ResultFromSP_VM
    {
        public string VisitCode { get; set; }
        public int PatientVisitId { get; set; }
        public int PatientId { get; set; }
        public int PatientAdmissionId { get; set; }
        public DateTime AdmittedDate { get; set; }
        public DateTime? DischargedDate { get; set; }
        public int? DischargedBy { get; set; }
        public string PatientCode { get; set; }
        public int? AdmittingDoctorId { get; set; }
        public string AdmittingDoctorName { get; set; }
        public string Address { get; set; }
        public string AdmissionStatus { get; set; }
        public string BillStatusOnDischarge { get; set; }
        public string Name { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string PhoneNumber { get; set; }
        public string Gender { get; set; }
        public bool? IsSubmitted { get; set; }
        public int DischargeSummaryId { get; set; }
        public int DepartmentId { get; set; }
        public string Department { get; set; }
        public string GuardianName { get; set; }
        public string GuardianRelation { get; set; }
        public bool IsPoliceCase { get; set; }
        public bool? IsInsurancePatient { get; set; }
        public int BedId { get; set; }
        public int PatientBedInfoId { get; set; }
        public int WardId { get; set; }
        public string Ward { get; set; }
        public int BedFeatureId { get; set; }
        public string Action { get; set; }
        public string BedFeature { get; set; }
        public string BedCode { get; set; }
        public int BedNumber { get; set; }
        public DateTime? StartedOn { get; set; }
        public bool? BedOnHoldEnabled { get; set; }
        public int? ReceivedBy { get; set; }

        public static List<GetAdmittedListVm> MapDataTableToSingleObject(DataTable admittedListDataTable)
        {
            List<GetAdmittedListVm> retObj = new List<GetAdmittedListVm>();
            if (admittedListDataTable != null)
            {
                string str_AdmittedList = JsonConvert.SerializeObject(admittedListDataTable);
                //Datatable contains array, we need to deserialize into list then take the first one.
                List<GetAdmittedList_ResultFromSP_VM> admittedList = JsonConvert.DeserializeObject<List<GetAdmittedList_ResultFromSP_VM>>(str_AdmittedList);
                if (admittedList != null && admittedList.Count > 0)
                {
                    retObj = GetAdmittedListVm.ConvertList_GetAdmittedList_ResultFromSP_VM_To_GetAdmittedListVm(admittedList);
                }
            }
            return retObj;
        }
    }
    public class GetAdmittedListVm
    {
        public string VisitCode { get; set; }
        public int PatientVisitId { get; set; }
        public int PatientId { get; set; }
        public int PatientAdmissionId { get; set; }
        public DateTime AdmittedDate { get; set; }
        public DateTime? DischargedDate { get; set; }
        public int? DischargedBy { get; set; }
        public string PatientCode { get; set; }
        public int? AdmittingDoctorId { get; set; }
        public string AdmittingDoctorName { get; set; }
        public string Address { get; set; }
        public string AdmissionStatus { get; set; }
        public string BillStatusOnDischarge { get; set; }
        public string Name { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string PhoneNumber { get; set; }
        public string Gender { get; set; }
        public bool? IsSubmitted { get; set; }
        public int DischargeSummaryId { get; set; }
        public int DepartmentId { get; set; }
        public string Department { get; set; }
        public string GuardianName { get; set; }
        public string GuardianRelation { get; set; }
        public bool IsPoliceCase { get; set; }
        public bool? IsInsurancePatient { get; set; }
        public GetAdmittedListBedInfoVm BedInformation { get; set; } = new GetAdmittedListBedInfoVm();

        public GetAdmittedListVm() { }
        public static List<GetAdmittedListVm> ConvertList_GetAdmittedList_ResultFromSP_VM_To_GetAdmittedListVm(List<GetAdmittedList_ResultFromSP_VM> admittedListFromSP)
        {
            //To format the data as per the need in Frontend....
            var admittedList = new List<GetAdmittedListVm>();
            foreach (var admittedPatient in admittedListFromSP)
            {
                var newAdmittedPat = new GetAdmittedListVm();

                newAdmittedPat.VisitCode = admittedPatient.VisitCode;
                newAdmittedPat.PatientVisitId = admittedPatient.PatientVisitId;
                newAdmittedPat.PatientId = admittedPatient.PatientId;
                newAdmittedPat.PatientAdmissionId = admittedPatient.PatientAdmissionId;
                newAdmittedPat.AdmittedDate = admittedPatient.AdmittedDate;
                newAdmittedPat.DischargedDate = admittedPatient.DischargedDate;
                newAdmittedPat.DischargedBy = admittedPatient.DischargedBy;
                newAdmittedPat.PatientCode = admittedPatient.PatientCode;
                newAdmittedPat.AdmittingDoctorId = admittedPatient.AdmittingDoctorId;
                newAdmittedPat.AdmittingDoctorName = admittedPatient.AdmittingDoctorName;
                newAdmittedPat.Address = admittedPatient.Address;
                newAdmittedPat.AdmissionStatus = admittedPatient.AdmissionStatus;
                newAdmittedPat.BillStatusOnDischarge = admittedPatient.BillStatusOnDischarge;
                newAdmittedPat.Name = admittedPatient.Name;
                newAdmittedPat.DateOfBirth = admittedPatient.DateOfBirth;
                newAdmittedPat.PhoneNumber = admittedPatient.PhoneNumber;
                newAdmittedPat.Gender = admittedPatient.Gender;
                newAdmittedPat.IsSubmitted = admittedPatient.IsSubmitted;
                newAdmittedPat.DischargeSummaryId = admittedPatient.DischargeSummaryId;
                newAdmittedPat.DepartmentId = admittedPatient.DepartmentId;
                newAdmittedPat.Department = admittedPatient.Department;
                newAdmittedPat.GuardianName = admittedPatient.GuardianName;
                newAdmittedPat.GuardianRelation = admittedPatient.GuardianRelation;
                newAdmittedPat.IsPoliceCase = admittedPatient.IsPoliceCase;
                newAdmittedPat.IsInsurancePatient = admittedPatient.IsInsurancePatient;
                newAdmittedPat.BedInformation.BedId = admittedPatient.BedId;
                newAdmittedPat.BedInformation.PatientBedInfoId = admittedPatient.PatientBedInfoId;
                newAdmittedPat.BedInformation.WardId = admittedPatient.WardId;
                newAdmittedPat.BedInformation.Ward = admittedPatient.Ward;
                newAdmittedPat.BedInformation.BedFeatureId = admittedPatient.BedFeatureId;
                newAdmittedPat.BedInformation.Action = admittedPatient.Action;
                newAdmittedPat.BedInformation.BedFeature = admittedPatient.BedFeature;
                newAdmittedPat.BedInformation.BedCode = admittedPatient.BedCode;
                newAdmittedPat.BedInformation.BedNumber = admittedPatient.BedNumber;
                newAdmittedPat.BedInformation.StartedOn = admittedPatient.StartedOn;
                newAdmittedPat.BedInformation.BedOnHoldEnabled = admittedPatient.BedOnHoldEnabled;
                newAdmittedPat.BedInformation.ReceivedBy = admittedPatient.ReceivedBy;

                admittedList.Add(newAdmittedPat);
            }

            return admittedList;
        }
    }


    public class GetAdmittedListBedInfoVm
    {
        public int BedId { get; set; }
        public int PatientBedInfoId { get; set; }
        public int WardId { get; set; }
        public string Ward { get; set; }
        public int BedFeatureId { get; set; }
        public string Action { get; set; }
        public string BedFeature { get; set; }
        public string BedCode { get; set; }
        public int BedNumber { get; set; }
        public DateTime? StartedOn { get; set; }
        public bool? BedOnHoldEnabled { get; set; }
        public int? ReceivedBy { get; set; }
    }
}
