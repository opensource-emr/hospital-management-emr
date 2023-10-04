using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class HemodialysisModel
    {
        [Key]
        public int HemodialysisRecordId { get; set; }

        //[Key, ForeignKey("Visit")]
        public int PatientId { get; set; }
        public int PatientVisitId { get; set; }
        public string Diagnosis { get; set; }
        public string Schedule { get; set; }
        public DateTime NextHD { get; set; }
        public DateTime CurrentHdDate { get; set; }
        public string IdNo { get; set; }
        public string HdNo { get; set; }

        public string TreatmentOrder_DryWeight { get; set; }
        public string TreatmentOrder_DialysisFlow { get; set; }
        public string TreatmentOrder_Blood { get; set; }
        public string TreatmentOrder_TimeInMin { get; set; }
        public string TreatmentOrder_UsedNo { get; set; }
        public string TreatmentOrder_BloodTransfusion { get; set; }
        public string TreatmentOrder_HeparineSaline_Circulation { get; set; }
        public string TreatmentOrder_HeparineSaline_Bolus { get; set; }
        public string TreatmentOrder_HeparineSaline_Continuous { get; set; }

        public Boolean VascularAccess_AVF { get; set; }
        public Boolean VascularAccess_Subclavian { get; set; }
        public Boolean VascularAccess_Jugular { get; set; }
        public Boolean VascularAccess_FemoralCatheter { get; set; }
        public Boolean VascularAccess_PermCath { get; set; }

        public string BloodTrans_BloodGroup { get; set; }
        public string BloodTrans_Today { get; set; }
        public string BloodTrans_BagNo { get; set; }
        public Boolean BloodTrans_NextBT { get; set; }
        public DateTime BloodTrans_CollectionDate { get; set; }
        public DateTime BloodTrans_ExpDate { get; set; }

        public string TreatmentData_PreWeight { get; set; }
        public string TreatmentData_PostWeight { get; set; }
        public string TreatmentData_PreTemperature { get; set; }
        public string TreatmentData_PostTemperature { get; set; }
        public string TreatmentData_PrePulse { get; set; }
        public string TreatmentData_PostPulse { get; set; }
        public string TreatmentData_PreStandBp { get; set; }
        public string TreatmentData_PostStandBp { get; set; }
        public string TreatmentData_PreSitBp { get; set; }
        public string TreatmentData_PostSitBp { get; set; }
        public string TreatmentData_UfGoal { get; set; }
        public string TreatmentData_MachineNo { get; set; }
        public string TreatmentData_Machine_Conductivity { get; set; }
        public string TreatmentData_Machine_Temperature { get; set; }
        public string TreatmentData_Machine_MachineCheck { get; set; }
        public string TreatmentData_Initials { get; set; }
        public string TreatmentData_PreLab { get; set; }
        public string TreatmentData_PostLab { get; set; }
        public string TreatmentData_Hb_PcV { get; set; }
        public string TreatmentData_BloodSugar { get; set; }
        public string TreatmentData_TimeOn { get; set; }
        public string TreatmentData_TimeOn_By { get; set; }
        public string TreatmentData_TimeOff { get; set; }
        public string TreatmentData_TimeOff_By { get; set; }

        public string OnExamination_Pallor { get; set; }
        public string OnExamination_Ictercus { get; set; }
        public string OnExamination_JVP { get; set; }
        public string OnExamination_Rash { get; set; }
        public string OnExamination_Lymphnode { get; set; }
        public string OnExamination_Chest { get; set; }
        public string OnExamination_CVS { get; set; }
        public string OnExamination_PA { get; set; }
        public string OnExamination_SPo2 { get; set; }
        public string OnExamination_Others { get; set; }

        public string ChiefComplaint { get; set; }
        public string Comments_Drugs { get; set; }
        public string PostDialysisAssesment { get; set; }

        public string TotalBloodVolume { get; set; }
        public string TotalHeparin_Saline { get; set; }
        public string TotalFluidRemoved { get; set; }
        public string WeightDifference { get; set; }
        public string PtSentToHospital { get; set; }
        public string PtSentToHome { get; set; }
        public Boolean IsDialyzerDiscard { get; set; }

        public Boolean IsSubmitted { get; set; }
        public DateTime IsSubmittedOn { get; set; }

        public string CheckedByName { get; set; }
        public string VerifiedByName { get; set; }

        public string SignatoryName_1 { get; set; }
        public string SignatoryName_2 { get; set; }

        public DateTime CreatedOn { get; set; }
        public int CreatedBy { get; set; }

        public DateTime ModifiedOn { get; set; }
        public int ModifiedBy { get; set; }

        public Boolean IsActive { get; set; }

        
    }
}
