using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DanpheEMR.ServerModel;

namespace DanpheEMR.DalLayer
{
    //public class PatientDbContext : CommonDbContext
    public class PatientDbContext : DbContext
    {
        public DbSet<PatientModel> Patients { get; set; }
        public DbSet<MembershipTypeModel> MembershipTypes { get; set; }
        public DbSet<PatientMembershipModel> PatientMemberships { get; set; }
        public DbSet<AppointmentModel> Appointments { get; set; }
        public DbSet<VisitModel> Visits { get; set; }
        public DbSet<PatientFilesModel> PatientFiles { get; set; }
        public DbSet<CountrySubDivisionModel> CountrySubdivisions { get; set; }//sud:14May'18
        public DbSet<CountryModel> Countries { get; set; }//sud:14May'18

        public DbSet<AdmissionModel> Admissions { get; set; }//sud:3June'18
        public DbSet<HealthCardInfoModel> PATHealthCard { get; set; }
        public DbSet<NeighbourhoodCardModel> PATNeighbourhoodCard { get; set; }
        public DbSet<EmployeeModel> Employee { get; set; }
        public DbSet<InsuranceProviderModel> InsuranceProviders { get; set; } //Yubraj:22nd Feb 2019
        public DbSet<InsuranceModel> Insurances { get; set; } //Yubraj:22nd Feb 2019
        public PatientDbContext(string conn) : base(conn)
        {
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;

        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<PatientFilesModel>().ToTable("PAT_PatientFiles");

            // Patient mapping
            modelBuilder.Entity<PatientModel>().ToTable("PAT_Patient");
            // Patient address mapping
            modelBuilder.Entity<AddressModel>().ToTable("PAT_PatientAddress");
            modelBuilder.Entity<AddressModel>()
                   .HasRequired<PatientModel>(s => s.Patient) // Address entity requires Patient
                   .WithMany(s => s.Addresses) // Patient entity includes many Addresses entities
                    .HasForeignKey(s => s.PatientId);

            // Patient and insurance mapping
            modelBuilder.Entity<InsuranceModel>().ToTable("PAT_PatientInsuranceInfo");
            modelBuilder.Entity<InsuranceModel>()
                   .HasRequired<PatientModel>(a => a.Patient) // Insurance entity requires Patient
                   .WithMany(a => a.Insurances) // Patient entity includes many Insurance entities
                    .HasForeignKey(s => s.PatientId);

            modelBuilder.Entity<KinModel>().ToTable("PAT_PatientKinOrEmergencyContacts");
            modelBuilder.Entity<KinModel>()
                   .HasRequired<PatientModel>(a => a.Patient)
                   .WithMany(a => a.KinEmergencyContacts)
                    .HasForeignKey(s => s.PatientId);

            // Patient and Gurantor 
            modelBuilder.Entity<GuarantorModel>().ToTable("PAT_PatientGurantorInfo");
            modelBuilder.Entity<GuarantorModel>()
                            .HasKey(t => t.PatientId);
            modelBuilder.Entity<PatientModel>()
                .HasOptional<GuarantorModel>(a => a.Guarantor);

            //Patient with Visit
            modelBuilder.Entity<VisitModel>().ToTable("PAT_PatientVisits");
            modelBuilder.Entity<AdmissionModel>().ToTable("ADT_PatientAdmission");//sud: 3June'18
            // Patient and visit mappings
            modelBuilder.Entity<VisitModel>()
                   .HasRequired<PatientModel>(a => a.Patient)
                   .WithMany(a => a.Visits)
                    .HasForeignKey(s => s.PatientId);


            // Patient and Allergy mapping
            modelBuilder.Entity<AllergyModel>().ToTable("CLN_Allergies");
            modelBuilder.Entity<AllergyModel>()
                   .HasRequired<PatientModel>(a => a.Patient) // Allergy entity requires Patient
                   .WithMany(a => a.Allergies) // Patient entity includes many Allergy entities
                    .HasForeignKey(s => s.PatientId);

            // Patient and problem list mappings
            modelBuilder.Entity<ActiveMedicalProblem>().ToTable("CLN_ActiveMedicals");
            modelBuilder.Entity<ActiveMedicalProblem>()
                   .HasRequired<PatientModel>(a => a.Patient) // ProblemList entity requires Patient
                   .WithMany(a => a.Problems) // Patient entity includes many ProblemList entities
                    .HasForeignKey(s => s.PatientId);

            // Patient and pastMedical list mappings
            modelBuilder.Entity<PastMedicalProblem>().ToTable("CLN_PastMedicals");
            modelBuilder.Entity<PastMedicalProblem>()
                   .HasRequired<PatientModel>(a => a.Patient) // ProblemList entity requires Patient
                   .WithMany(a => a.PastMedicals) // Patient entity includes many ProblemList entities
                    .HasForeignKey(s => s.PatientId);

            modelBuilder.Entity<ImagingReportModel>().ToTable("RAD_PatientImagingReport");
            modelBuilder.Entity<ImagingReportModel>()
                   .HasRequired<PatientModel>(a => a.Patient) // imagingreport requires patient
                   .WithMany(a => a.ImagingReports) // Patient entity includes many imagingreports
                   .HasForeignKey(s => s.PatientId);

            modelBuilder.Entity<ImagingRequisitionModel>().ToTable("RAD_PatientImagingRequisition");
            modelBuilder.Entity<ImagingRequisitionModel>()
                   .HasRequired<PatientModel>(a => a.Patient) // imagingreport requires patient
                   .WithMany(a => a.ImagingItemRequisitions) // Patient entity includes many imagingreports
                   .HasForeignKey(s => s.PatientId);
            //LAB Results
            modelBuilder.Entity<LabRequisitionModel>().ToTable("LAB_TestRequisition");
            //modelBuilder.Entity<LabTestModel>().ToTable("LAB_LabTests");


            // Patient and vitals mapping
            modelBuilder.Entity<VitalsModel>().ToTable("CLN_PatientVitals");
            modelBuilder.Entity<VitalsModel>()
                   .HasRequired<VisitModel>(a => a.Visit) // Allergy entity requires Patient
                   .WithMany(a => a.Vitals) // Patient entity includes many Allergy entities
                    .HasForeignKey(s => s.PatientVisitId);

            modelBuilder.Entity<NotesModel>().ToTable("CLN_Notes");
          

            modelBuilder.Entity<MedicationPrescriptionModel>().ToTable("CLN_MedicationPrescription");
            modelBuilder.Entity<MedicationPrescriptionModel>()
                    .HasRequired<PatientModel>(a => a.Patient) // Allergy entity requires Patient
                    .WithMany(a => a.MedicationPrescriptions) // Patient entity includes many Allergy entities
                     .HasForeignKey(s => s.PatientId);

            modelBuilder.Entity<HomeMedicationModel>().ToTable("CLN_HomeMedications");
            modelBuilder.Entity<HomeMedicationModel>()
                    .HasRequired<PatientModel>(a => a.Patient)
                    .WithMany(a => a.HomeMedication)
                     .HasForeignKey(s => s.PatientId);

            modelBuilder.Entity<SocialHistory>().ToTable("CLN_SocialHistory");
            modelBuilder.Entity<SocialHistory>()
                    .HasRequired<PatientModel>(a => a.Patient)
                    .WithMany(a => a.SocialHistory)
                     .HasForeignKey(s => s.PatientId);

            modelBuilder.Entity<PatientMembershipModel>().ToTable("PAT_PatientMembership");
            //modelBuilder.Entity<PatientMembershipModel>()
            //       .HasRequired<PatientModel>(a => a.Patient)
            //       .WithMany(a => a.MembershipTypeId)
            //        .HasForeignKey(s => s.PatientId);

            modelBuilder.Entity<MembershipTypeModel>().ToTable("PAT_CFG_MembershipType");

            modelBuilder.Entity<AppointmentModel>().ToTable("PAT_Appointment");
            modelBuilder.Entity<PatientModel>()
               .HasOptional<CountrySubDivisionModel>(p => p.CountrySubDivision);
            modelBuilder.Entity<CountrySubDivisionModel>().ToTable("MST_CountrySubDivision");//added sud: 14May

            modelBuilder.Entity<CountryModel>().ToTable("MST_Country");//added: sud:3June'18

            modelBuilder.Entity<PatientModel>()
               .HasOptional<CountrySubDivisionModel>(p => p.CountrySubDivision);
            modelBuilder.Entity<HealthCardInfoModel>().ToTable("PAT_HealthCardInfo");   //added ramavtar:21Aug'18

            modelBuilder.Entity<InsuranceProviderModel>().ToTable("INS_CFG_InsuranceProviders");
            modelBuilder.Entity<EmployeeModel>().ToTable("EMP_Employee");
            modelBuilder.Entity<NeighbourhoodCardModel>().ToTable("PAT_NeighbourhoodCardDetail");
        }
    }
}