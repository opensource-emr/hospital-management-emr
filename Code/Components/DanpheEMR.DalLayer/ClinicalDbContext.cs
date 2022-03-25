using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DanpheEMR.ServerModel;
using System.Data.Entity;
using DanpheEMR.ServerModel.ClinicalModels;

namespace DanpheEMR.DalLayer
{
    public class ClinicalDbContext : DbContext
    {
        public DbSet<VitalsModel> Vitals { get; set; }
        public DbSet<AllergyModel> Allergy { get; set; }
        public DbSet<HomeMedicationModel> HomeMedications { get; set; }
        public DbSet<InputOutputModel> InputOutput { get; set; }
        public DbSet<MedicationPrescriptionModel> MedicationPrescriptions { get; set; }
        
        public DbSet<ActiveMedicalProblem> ActiveMedical { get; set; }

        public DbSet<PastMedicalProblem> PastMedicals { get; set; }
        public DbSet<FamilyHistory> FamilyHistory { get; set; }
        public DbSet<SocialHistory> SocialHistory { get; set; }
        public DbSet<SurgicalHistory> SurgicalHistory { get; set; }
        public DbSet<NotesModel> Notes { get; set; }
        public DbSet<ObjectiveNoteModel> ObjectiveNotes { get; set; }
        public DbSet<SubjectiveNoteModel> SubjectiveNotes { get; set; }
        public DbSet<EmployeeModel> Employee { get; set; }
        public DbSet<VisitModel> Visit { get; set; }



        public DbSet<ClinicalDiagnosisModel> ClinicalDiagnosis { get; set; }
        public DbSet<LabRequisitionModel> LabRequisitions { get; set; }
        public DbSet<ImagingRequisitionModel> ImagingRequisitions { get; set; }
        public DbSet<PHRMPrescriptionItemModel> PHRMPrescriptionItems { get; set; }
        public DbSet<BillItemRequisition> BillItemRequisitions { get; set; }
        public DbSet<BillItemPrice> BillItemPrices { get; set; }
        public DbSet<ServiceDepartmentModel> ServiceDepartments { get; set; }
        public DbSet<DepartmentModel> Departments { get; set; }
        //Clinical Eye
        public DbSet<PatientImagesModel> PatientImages { get; set; }
        public DbSet<EyeModel> ClinicalEyeMaster { get; set; }
        public DbSet<RefractionModel> Refration { get; set; }
        public DbSet<AblationProfileModel> AblationProfile { get; set; }
        public DbSet<LaserDataEntryModel> LaserData { get; set; }
        public DbSet<PreOPPachymetryModel> PreOpPachymetry { get; set; }
        public DbSet<LASIKRSTModel> LasikRST { get; set; }
        public DbSet<SMILESSettingsModel> SmileSetting { get; set; }
        public DbSet<PachymetryModel> Pachymetry { get; set; }
        public DbSet<WavefrontModel> Wavefront { get; set; }
        public DbSet<ORAModel> ORA { get; set; }
        public DbSet<SmileIncisionsModel> SmileIncision { get; set; }
        public DbSet<EyeVisuMaxsModel> VisuMax { get; set; }
        public DbSet<OperationNotesModel> OperationNotes { get; set; }
        //  Precription-Slip 
        public DbSet<PrescriptionSlipModel> ClinicalPrescriptionSlipMaster { get; set; }
        public DbSet<AcceptanceModel> Acceptance { get; set; }
        public DbSet<DilateModel> Dilate { get; set; }
        public DbSet<HistoryModel> History { get; set; }
        public DbSet<IOPModel> IOP { get; set; }
        public DbSet<PlupModel> Plup { get; set; }
        public DbSet<RetinoscopyModel> Retinoscopy { get; set; }
        public DbSet<SchrimeModel> Schrime { get; set; }
        public DbSet<TBUTModel> TBUT { get; set; }
        public DbSet<VaUnaidedModel> Vaunaided { get; set; }
        public DbSet<FinalClassModel> FinalClass { get; set; }
         
        public DbSet<AdviceDiagnosisModel> AdviceDiagnosis { get; set; }
        public DbSet<EyeScanModel> EyeScan { get; set; }
        public DbSet<PatientModel> Patients { get; set; }

        public DbSet<ReferralSource> ReferralSource { get; set;}
        public DbSet<PHRMItemMasterModel> PHRMItemMaster { get; set;}
        public DbSet<CfgParameterModel> CFGParameters { get; set; }

         //public DbSet<FreeNotesModel> FreeNotes { get; set; }
        public DbSet<FreeTextNoteModel> FreeText { get; set; }
        public DbSet<EmergencyNoteModel> EmergencyNote { get; set; }
        public DbSet<ProcedureNoteModel> ProcedureNote { get; set; }
        public DbSet<ProgressNoteModel> ProgressNote { get; set; }

        public DbSet<DischargeSummaryModel> DischargeSummaryNote { get; set; }
        public DbSet<DischargeSummaryMedication> DischargeSummaryMedications { get; set; }
        public DbSet<NoteTypeModel> NoteType { get; set; }
        public DbSet<TemplateNoteModel> TemplateNotes { get; set; }
        public DbSet<ICD10CodeModel> ICD10 { get; set; }

        public DbSet<PatientClinicalInfo> PatientClinicalInfos { get; set; }
        public DbSet<PrescriptionNotesModel> ClinicalPrescriptionNote { get; set; }
        public DbSet<PatientVisitNote> PatientVisitNotes { get; set; }



        public ClinicalDbContext(string conn) : base(conn)
        {
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;
        }
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {

            modelBuilder.Entity<VitalsModel>().ToTable("CLN_PatientVitals");
            modelBuilder.Entity<AllergyModel>().ToTable("CLN_Allergies");
            modelBuilder.Entity<InputOutputModel>().ToTable("CLN_InputOutput");
            modelBuilder.Entity<HomeMedicationModel>().ToTable("CLN_HomeMedications");
            modelBuilder.Entity<MedicationPrescriptionModel>().ToTable("CLN_MedicationPrescription");

            modelBuilder.Entity<ActiveMedicalProblem>().ToTable("CLN_ActiveMedicals");
            modelBuilder.Entity<PastMedicalProblem>().ToTable("CLN_PastMedicals");

            modelBuilder.Entity<FamilyHistory>().ToTable("CLN_FamilyHistory");
            modelBuilder.Entity<SocialHistory>().ToTable("CLN_SocialHistory");
            modelBuilder.Entity<SurgicalHistory>().ToTable("CLN_SurgicalHistory");
            modelBuilder.Entity<ReferralSource>().ToTable("CLN_ReferralSource");

            modelBuilder.Entity<NotesModel>().ToTable("CLN_Notes");
            modelBuilder.Entity<ObjectiveNoteModel>().ToTable("CLN_Notes_Objective");
            modelBuilder.Entity<SubjectiveNoteModel>().ToTable("CLN_Notes_Subjective");
            modelBuilder.Entity<EmployeeModel>().ToTable("EMP_Employee");
            modelBuilder.Entity<VisitModel>().ToTable("PAT_PatientVisits");

            modelBuilder.Entity<ClinicalDiagnosisModel>().ToTable("CLN_Diagnosis");
            modelBuilder.Entity<LabRequisitionModel>().ToTable("LAB_TestRequisition");
            modelBuilder.Entity<ImagingRequisitionModel>().ToTable("RAD_PatientImagingRequisition");
            modelBuilder.Entity<PHRMPrescriptionItemModel>().ToTable("PHRM_PrescriptionItems");
            modelBuilder.Entity<BillItemRequisition>().ToTable("BIL_BillItemRequisition");
            modelBuilder.Entity<BillItemPrice>().ToTable("BIL_CFG_BillItemPrice");
            modelBuilder.Entity<ServiceDepartmentModel>().ToTable("BIL_MST_ServiceDepartment");
            modelBuilder.Entity<PatientImagesModel>().ToTable("CLN_PAT_Images");
            modelBuilder.Entity<EyeScanModel>().ToTable("CLN_EyeScanImages");
            modelBuilder.Entity<DepartmentModel>().ToTable("MST_Department");

            //Clinical Eye Model
            modelBuilder.Entity<EyeModel>().ToTable("CLN_MST_EYE");
            modelBuilder.Entity <RefractionModel>().ToTable("CLN_EYE_Refraction");
            modelBuilder.Entity <AblationProfileModel>().ToTable("CLN_EYE_Ablation_Profile");
            modelBuilder.Entity <LaserDataEntryModel>().ToTable("CLN_EYE_Laser_DataEntry");
            modelBuilder.Entity <PreOPPachymetryModel>().ToTable("CLN_EYE_PreOP_Pachymetry");
            modelBuilder.Entity <LASIKRSTModel>().ToTable("CLN_EYE_LasikRST");
            modelBuilder.Entity <SMILESSettingsModel>().ToTable("CLN_EYE_Smile_Setting");
            modelBuilder.Entity <PachymetryModel>().ToTable("CLN_EYE_Pachymetry");
            modelBuilder.Entity <WavefrontModel>().ToTable("CLN_EYE_Wavefront");
            modelBuilder.Entity <ORAModel>().ToTable("CLN_EYE_ORA");
            modelBuilder.Entity <SmileIncisionsModel>().ToTable("CLN_EYE_Smile_Incisions");
            modelBuilder.Entity <EyeVisuMaxsModel>().ToTable("CLN_EYE_VisuMax");
            modelBuilder.Entity<OperationNotesModel>().ToTable("CLN_EYE_OperationNotes");

            //PrecsriptionSlip Model
            modelBuilder.Entity<PrescriptionSlipModel>().ToTable("CLN_MST_PrescriptionSlip");
            modelBuilder.Entity<AcceptanceModel>().ToTable("CLN_PrescriptionSlip_Acceptance");
            modelBuilder.Entity<DilateModel>().ToTable("CLN_PrescriptionSlip_Dilate");
            modelBuilder.Entity<HistoryModel>().ToTable("CLN_PrescriptionSlip_History");
            modelBuilder.Entity<TBUTModel>().ToTable("CLN_PrescriptionSlip_TBUT");
            modelBuilder.Entity<IOPModel>().ToTable("CLN_PrescriptionSlip_IOP");
            modelBuilder.Entity<PlupModel>().ToTable("CLN_PrescriptionSlip_Plup");
            modelBuilder.Entity<RetinoscopyModel>().ToTable("CLN_PrescriptionSlip_Retinoscopy");
            modelBuilder.Entity<SchrimeModel>().ToTable("CLN_PrescriptionSlip_Schrime");
            modelBuilder.Entity<VaUnaidedModel>().ToTable("CLN_PrescriptionSlip_VaUnaided");
            modelBuilder.Entity<AdviceDiagnosisModel>().ToTable("CLN_PrescriptionSlip_AdviceDiagnosis");
            modelBuilder.Entity<FinalClassModel>().ToTable("CLN_PrescriptionSlip_FinalClass");
            modelBuilder.Entity<PatientModel>().ToTable("PAT_Patient");
            modelBuilder.Entity<PHRMItemMasterModel>().ToTable("PHRM_MST_Item");

            // Template-notes
            modelBuilder.Entity<FreeTextNoteModel>().ToTable("CLN_Notes_FreeText");
            modelBuilder.Entity<ProcedureNoteModel>().ToTable("CLN_Notes_Procedure");
            modelBuilder.Entity<EmergencyNoteModel>().ToTable("CLN_Notes_Emergency");
            modelBuilder.Entity<ProgressNoteModel>().ToTable("CLN_Notes_Progress");

            modelBuilder.Entity<DischargeSummaryModel>().ToTable("ADT_DischargeSummary");
            modelBuilder.Entity<DischargeSummaryMedication>().ToTable("ADT_DischargeSummaryMedication");
            modelBuilder.Entity<NoteTypeModel>().ToTable("CLN_MST_NoteType");
            modelBuilder.Entity<TemplateNoteModel>().ToTable("CLN_Template");
            modelBuilder.Entity<ICD10CodeModel>().ToTable("MST_ICD10");
            modelBuilder.Entity<PatientClinicalInfo>().ToTable("CLN_KV_PatientClinical_Info");
            modelBuilder.Entity<PrescriptionNotesModel>().ToTable("CLN_Notes_PrescriptionNote");
            modelBuilder.Entity<PatientVisitNote>().ToTable("CLN_PatientVisit_Notes");


            modelBuilder.Entity<CfgParameterModel>().ToTable("CORE_CFG_Parameters");
            //Vitals and visit mappings
            modelBuilder.Entity<VitalsModel>()
                        .HasRequired<VisitModel>(a => a.Visit)
                        .WithMany(a => a.Vitals)
                        .HasForeignKey(a => a.PatientVisitId);

            // Patient and Allergy mapping
            modelBuilder.Entity<AllergyModel>()
                   .HasRequired<PatientModel>(a => a.Patient)
                   .WithMany(a => a.Allergies)
                    .HasForeignKey(s => s.PatientId);

            //Vitals and inputoutput mappings
            modelBuilder.Entity<InputOutputModel>()
                        .HasRequired<VisitModel>(a => a.Visit)
                        .WithMany(a => a.InputOutput)
                        .HasForeignKey(a => a.PatientVisitId);

            // Patient and MedicationPrescription
            modelBuilder.Entity<MedicationPrescriptionModel>()
                .HasRequired<PatientModel>(m => m.Patient)
                .WithMany(p => p.MedicationPrescriptions)
                .HasForeignKey(m => m.PatientId);

            // Patient and HomeMedications
            modelBuilder.Entity<HomeMedicationModel>()
                .HasRequired<PatientModel>(h => h.Patient)
                .WithMany(p => p.HomeMedication)
                .HasForeignKey(h => h.PatientId);


            // Patient and activemedical mappings
            modelBuilder.Entity<ActiveMedicalProblem>()
                   .HasRequired<PatientModel>(a => a.Patient)
                   .WithMany(a => a.Problems)
                    .HasForeignKey(s => s.PatientId);

            // Patient and pastMedical list mappings
            modelBuilder.Entity<PastMedicalProblem>()
                   .HasRequired<PatientModel>(a => a.Patient)
                   .WithMany(a => a.PastMedicals)
                    .HasForeignKey(s => s.PatientId);

            //Patient and FamilyHistory list mappings
            modelBuilder.Entity<FamilyHistory>()
                   .HasRequired<PatientModel>(a => a.Patient)
                   .WithMany(a => a.FamilyHistory)
                    .HasForeignKey(s => s.PatientId);

            //Patient and SurgicalHistory list mappings=
            modelBuilder.Entity<SurgicalHistory>()
                   .HasRequired<PatientModel>(a => a.Patient)
                   .WithMany(a => a.SurgicalHistory)
                    .HasForeignKey(s => s.PatientId);

            //Patient and SocialHistory list mappings
            modelBuilder.Entity<SocialHistory>()
                   .HasRequired<PatientModel>(a => a.Patient)
                   .WithMany(a => a.SocialHistory)
                    .HasForeignKey(s => s.PatientId);
        }
    }

}

