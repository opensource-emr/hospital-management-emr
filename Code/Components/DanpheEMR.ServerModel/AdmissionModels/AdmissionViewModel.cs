using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    //Yubaraj: 19th Nov 2018--added for Admission Cancel Pop Up page.
    //Admission Cancel view models
    public class AdmissionCancelVM
    {
        public int PatientId { get; set; }
        public int? PatientVisitId { get; set; }
        public DateTime? CancelledOn { get; set; }
        public string CancelledRemark { get; set; }
    }

    //Yubaraj: 19 th Nov 2018 -- added to get admission patient info in order to cancel patient admission
    //Admission Information View Model
    public class AdmissionInfoVM
    {
        //Patient Model
        public string PatientName { get; set; }
        public string PatientCode { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Gender { get; set; }
        //PatientVisit Model
        public string VisitCode { get; set; }
        //Admission Model
        public DateTime? AdmissionDate { get; set; }
        //Deposit Model
        public int? DepositId { get; set; }
        public double? DepositBalance { get; set; }
        //PatientBedInfo
        public string BedCode { get; set; }
        public string WardName { get; set; }

    }
    public class PatientBedInfoVM
    {
        public string WardName { get; set; }
        public int BedNumber { get; set; }
        public string BedCode { get; set; }
        public int PatientBedInfoId { get; set; }
        public int PatientVisitId { get; set; }
        public DateTime? StartedOn { get; set; }
        public DateTime? EndedOn { get; set; }
        public string Action { get; set; }
        public string PrimaryDoctor { get; set; }
        public int? SecondaryDoctorId { get; set; }
        public string SecondaryDoctor { get; set; }
    }
    public class UpdateAdmittingDoctorVM
    {
        public int PatientVisitId { get; set; }
        public int AdmittingDoctorId { get; set; }
        public string AdmittingDoctorName { get; set; }
        public int? DepartmentId { get; set; }
        public string Department { get; set; }
        public int? EmployeeId { get; set; }
        
    }

    public class ADTAutoAddItemParameterVM
    {
        public bool DoAutoAddBillingItems { get; set; }
        public bool DoAutoAddBedItem { get; set; }
        //for saving
        public List<ADTAutoAddItemVM> ItemList { get; set; }
    }
    public class ADTAutoAddItemVM
    {
        public int ServiceDepartmentId { get; set; }
        public int ItemId { get; set; }
    }
}

