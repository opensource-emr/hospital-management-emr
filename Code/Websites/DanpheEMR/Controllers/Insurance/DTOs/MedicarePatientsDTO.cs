using DanpheEMR.Controllers.Stickers.DTOs;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace DanpheEMR.Controllers.Accounting.DTOs
{
    public class MedicarePatientList_DTO
    {
        public string MedicareNo { get; set; }
        public string Name { get; set; }
        public string Gender { get; set; }
        public string HospitalNo { get; set; }
        public string Category { get; set; }
        public string Institution { get; set; }
        public bool IsDependent { get; set; }
        public string Department { get; set; }
        public string Designation { get; set; }
        public string Relation { get; set; }
        public string InsurancePolicyNo { get; set; }
        public string Remarks { get; set; }
        public string Employee { get; set; }
        public bool IsActive { get; set; }
        public int DesignationId { get; set; }
        public DateTime DateOfBirth { get; set; }
        public int PatientId { get; set; }
        public int MedicareTypeId { get; set; }
        public int DepartmentId { get; set; }
        public int InsuranceProviderId { get; set; }
        public DateTime MedicareStartDate { get; set; }
        public int MedicareMemberId { get; set; }
        public int? ParentMedicareMemberId { get; set; }
        public bool IsIpLimitExceeded { get; set; }
        public bool IsOpLimitExceeded { get; set; }

    }

}
