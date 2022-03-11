using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DanpheEMR.ServerModel;

namespace DanpheEMR.DalLayer
{
    public class SocialServiceUnitDbContext : DbContext
    {

        public DbSet<PatientModel> Patients { get; set; }
        public DbSet<SSU_InformationModel> SSU_Information { get; set; }
        public DbSet<CountryModel> Countries { get; set; }
        public DbSet<CountrySubDivisionModel> CountrySubdivisions { get; set; }
        public DbSet<VisitModel> Visits { get; set; }
        public DbSet<AdmissionModel> Admissions { get; set; }
        public DbSet<ADTBedReservation> BedReservation { get; set; }
        public DbSet<PatientBedInfo> PatientBedInfos { get; set; }
        public DbSet<WardModel> Wards { get; set; }
        public DbSet<BedModel> Beds { get; set; }
        public DbSet<EmergencyPatientModel> EmergencyPatient { get; set; }
        public DbSet<MembershipTypeModel> MembershipTypes { get; set; }
        public DbSet<MunicipalityModel> Municipalities { get; set; }

        public SocialServiceUnitDbContext(string conn) : base(conn)
        {
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;
        }
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<VisitModel>().ToTable("PAT_PatientVisits");
            modelBuilder.Entity<AdmissionModel>().ToTable("ADT_PatientAdmission");//sud: 3June'18
            // Patient and visit mappings
            modelBuilder.Entity<VisitModel>()
                   .HasRequired<PatientModel>(a => a.Patient)
                   .WithMany(a => a.Visits)
                    .HasForeignKey(s => s.PatientId);
            modelBuilder.Entity<PatientModel>().ToTable("PAT_Patient").HasOptional<CountrySubDivisionModel>(p => p.CountrySubDivision);
            modelBuilder.Entity<SSU_InformationModel>().ToTable("PAT_SSU_Information");
            modelBuilder.Entity<CountrySubDivisionModel>().ToTable("MST_CountrySubDivision");
            modelBuilder.Entity<CountryModel>().ToTable("MST_Country");
            modelBuilder.Entity<ADTBedReservation>().ToTable("ADT_BedReservation");
            modelBuilder.Entity<PatientBedInfo>().ToTable("ADT_TXN_PatientBedInfo");
            modelBuilder.Entity<WardModel>().ToTable("ADT_MST_Ward");
            modelBuilder.Entity<BedModel>().ToTable("ADT_Bed");
            modelBuilder.Entity<EmergencyPatientModel>().ToTable("ER_Patient");
            modelBuilder.Entity<MembershipTypeModel>().ToTable("PAT_CFG_MembershipType");
            modelBuilder.Entity<MunicipalityModel>().ToTable("MST_Municipality");

        }
    }    
}

