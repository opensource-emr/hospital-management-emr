using System;

namespace DanpheEMR.Services.BillSettings.DTOs
{
    public class DepositHead_DTO
    {
        public int DepositHeadId { get; set; }
        public string DepositHeadCode { get; set; }
        public string DepositHeadName { get; set; }
        public bool IsDefault { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
    }
}
