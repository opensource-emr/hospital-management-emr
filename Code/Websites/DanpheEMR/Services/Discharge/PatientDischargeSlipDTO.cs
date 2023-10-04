using System;

namespace DanpheEMR.Services.Discharge
{
    public class PatientDischargeSlip_DTO
    {
        public string PatientName { get; set; }
        public string AgeGender { get; set; }
        public string HospitalNumber { get; set; }
        public string IpNumber { get; set; }
        public string WardNameBedNumber { get; set; }
        public string DepartmentName { get; set; }
        public string DoctorName { get; set; }
        public DateTime AdmittedOn { get; set; }
        public DateTime DischargedOn { get; set; }

    }
}
