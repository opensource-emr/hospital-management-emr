using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DanpheEMR.ServerModel;
using System.Data.Entity;

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
        public DbSet<PatientImagesModel> PatientImages { get; set; }




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

