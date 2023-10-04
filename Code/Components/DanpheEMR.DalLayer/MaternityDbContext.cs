using DanpheEMR.Core.Parameters;
using DanpheEMR.ServerModel;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.DalLayer
{
    public class MaternityDbContext : DbContext
    {
        public DbSet<PatientModel> Patients { get; set; }
        public DbSet<AdminParametersModel> AdminParameters { get; set; }
        public DbSet<EmployeeModel> Employee { get; set; }
        public DbSet<CountrySubDivisionModel> CountrySubdivisions { get; set; }
        public DbSet<MaternityPatient> MaternityPatients { get; set; }
        public DbSet<MaternityRegister> MaternityRegister { get; set; }
        public DbSet<MaternityANC> MaternityANC { get; set; }
        public DbSet<MaternityFileUploads> MaternityFiles { get; set; }
        public DbSet<MaternityPayment> MaternityPatientPayments { get; set; }
        public DbSet<BillingFiscalYear> BillingFiscalYears { get; set; }
        public DbSet<EmpCashTransactionModel> EmpCashTransactions { get; set; }



        public MaternityDbContext(string conn) : base(conn)
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
            modelBuilder.Entity<MaternityPatient>().ToTable("MAT_Patient");
            modelBuilder.Entity<MaternityRegister>().ToTable("MAT_Register");
            modelBuilder.Entity<MaternityANC>().ToTable("MAT_MaternityANC");
            modelBuilder.Entity<MaternityFileUploads>().ToTable("MAT_FileUploads");
            modelBuilder.Entity<MaternityPayment>().ToTable("MAT_TXN_PatientPayments");
            modelBuilder.Entity<BillingFiscalYear>().ToTable("BIL_CFG_FiscalYears");
            modelBuilder.Entity<EmpCashTransactionModel>().ToTable("TXN_EmpCashTransaction");

        }

    }

}
