using System;

namespace DanpheEMR.Services.Admission.DTOs
{
    public class PatientAdmissionSlip_DTO
    {
        public string PatientName { get; set; }
        public string AgeGender { get; set; }
        public string HospitalNumber { get; set; }
        public string IpNumber { get; set; }
        public string WardNameBedNumber { get; set; }
        public string DepartmentName { get; set; }
        public string DoctorName { get; set; }
        public DateTime AdmittedOn { get; set; }
    }
}
