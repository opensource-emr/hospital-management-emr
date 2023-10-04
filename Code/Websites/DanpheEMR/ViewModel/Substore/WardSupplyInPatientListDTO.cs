using System;

namespace DanpheEMR.ViewModel.Substore
{
    /// <summary> The output class for InPatientList Endpoint in WardSupply Controller </summary>
    public class WardSupplyInPatientListDTO
    {
        public int PatientId { get; set; }
        public string PatientCode { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Age { get; set; }
        public string Address { get; set; }
        public string PhoneNumber { get; set; }
        public string VisitCode { get; set; }
        public int PatientVisitId { get; set; }
        public int WardId { get; set; }
        public string ShortName { get; set; }
    }
}