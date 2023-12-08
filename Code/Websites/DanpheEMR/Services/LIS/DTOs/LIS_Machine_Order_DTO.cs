using System;

namespace DanpheEMR.Services.LIS.DTOs
{
    public class LIS_Machine_Order_DTO
    {
        public string BarCodeNumber { get; set; }
        public string MachineComponentName { get; set; }
        public string PatientCode { get; set; }
        public string PatientName { get; set; }
        public string Gender { get; set; }
        public string SpecimenType { get; set; }
        public int MachineId { get; set; }
        public string MachineName { get; set; }
        public DateTime CreatedOn { get; set; }
    }
}
