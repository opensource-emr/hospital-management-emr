using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class IpWristBandInfoVM
    {
        public string PatientCode { get; set; }
        public string PatientName { get; set; }
        public string DateOfBirth { get; set; }
        public string Gender { get; set; }
        public string BloodGroup { get; set; }
        public string Address { get; set; }
        public string PhoneNumber { get; set; }
        public string AdmittingDoctor { get; set; }
        public string AdmissionDate { get; set; }
        public string InPatientNo { get; set; }
        public string Ward { get; set; }
        public string BedCode { get; set; }

    }
}
