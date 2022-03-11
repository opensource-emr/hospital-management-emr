using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.DalLayer
{
    public class VaccinationDbContext: DbContext
    {
        public DbSet<PatientModel> Patients { get; set; }
        public DbSet<AdminParametersModel> AdminParameters { get; set; }
        public DbSet<EmployeeModel> Employee { get; set; }
        public DbSet<CountrySubDivisionModel> CountrySubdivisions { get; set; }
        public DbSet<VaccineMasterModel> VaccineMaster { get; set; }
        public DbSet<PatientVaccineDetailModel> PatientVaccineDetail { get; set; }
        public DbSet<MembershipTypeModel> MembershipTypes { get; set; }
        public DbSet<BillingFiscalYear> BillingFiscalYears { get; set; }
        public DbSet<EthnicGroupModel> EthnicGroupCast { get; set; }

        public DbSet<MunicipalityModel> Municipalities { get; set; }

        public DbSet<DepartmentModel> Departments { get; set; }//Sud:2-Oct'21 To Create a Visit.
        public DbSet<VisitModel> Visits { get; set; }
        public DbSet<RbacUser> RbacUsers { get; set; }

        public VaccinationDbContext(string conn) : base(conn)
        {
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;

        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<PatientModel>().ToTable("PAT_Patient");
            modelBuilder.Entity<AdminParametersModel>().ToTable("CORE_CFG_Parameters");
            modelBuilder.Entity<EmployeeModel>().ToTable("EMP_Employee");
            modelBuilder.Entity<CountrySubDivisionModel>().ToTable("MST_CountrySubDivision");
            modelBuilder.Entity<VaccineMasterModel>().ToTable("VACC_Vaccines");
            modelBuilder.Entity<PatientVaccineDetailModel>().ToTable("VACC_PatientVaccineDetail");
            modelBuilder.Entity<MembershipTypeModel>().ToTable("PAT_CFG_MembershipType");
            modelBuilder.Entity<BillingFiscalYear>().ToTable("BIL_CFG_FiscalYears");
            modelBuilder.Entity<EthnicGroupModel>().ToTable("MST_EthnicGroup");
            modelBuilder.Entity<MunicipalityModel>().ToTable("MST_Municipality");
            modelBuilder.Entity<DepartmentModel>().ToTable("MST_Department");
            modelBuilder.Entity<VisitModel>().ToTable("PAT_PatientVisits");
            modelBuilder.Entity<RbacUser>().ToTable("RBAC_User");
        }
    }
}
