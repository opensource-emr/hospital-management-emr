using DanpheEMR.ServerModel.LabModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class LISComponentMasterVM : LISMachineMaster
    {
        public int LISComponentMasterId { get; set; }
        public string ComponentName { get; set; }
        public string ComponentDisplayName { get; set; }
    }

    public class LISMachineMaster
    {
        public int MachineId { get; set; }
        public string MachineName { get; set; }
        public string MachineCode { get; set; }
        public string ModelName { get; set; }
    }

    public class LISMasterData
    {
        public List<LISComponentMasterVM> LISComponentList { get; set; }
        public List<LISMachineMaster> LISMachineMasterList { get; set; }
    }

    public class ComponentMasterToMap
    {
        public int ComponentId { get; set; }
        public string ComponentName { get; set; }
        public string DisplayName { get; set; }
    }

    public class MachineResults
    {
        public int LISComponentResultId { get; set; }
        public int LISComponentId { get; set; }
        public long BarcodeNumber { get; set; }
        public string Value { get; set; }
        public string Unit { get; set; }
        public string LISComponentName { get; set; }
    }

    public class MachineResultsVM
    {
        public int LISComponentResultId { get; set; }
        public int LISComponentId { get; set; }
        public long LabTestId { get; set; }
        public long RequisitionId { get; set; }
        public long BarCodeNumber { set; get; }
        public int PatientId { get; set; }
        public int? TemplateId { get; set; }
        public int? PatientVisitId { get; set; }
        public string LabTestName { get; set; }
        public string RunNumber { get; set; }
        public string HospitalNumber { get; set; }
        public string LISComponentName { get; set; }
        public string VisitType { get; set; }        
        public string AbnormalType { get; set; }        
        public string PatientName { get; set; }        
        public string Gender { get; set; }        
        public string Age { get; set; }        
        public DateTime? DateOfBirth { get; set; }        
        public string Value { get; set; }        
        public int ConversionFactor { get; set; }        
        public string MachineUnit { get; set; }      
        public bool IsSelected { get; set; }
        public bool IsValueValid { get; set; }
        public int? CreatedBy { get; set; }
        public bool? IsAbnormal { get; set; }
        public DateTime? CreatedOn { get; set; }
        public LabTestJSONComponentModel Component { get; set; }
    }

    public class MachineResultsFormatted
    {
        public long BarCodeNumber { get; set; }
        public string HospitalNumber { get; set; }
        public int PatientId { get; set; }
        public long LabTestId { get; set; }
        public string LabTestName { get; set; }
        public string PatientName { get; set; }
        public string RunNumber { get; set; }
        public List<MachineResultsVM> Data { get; set; }                                   
    }
}
