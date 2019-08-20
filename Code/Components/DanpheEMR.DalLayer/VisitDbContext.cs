using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DanpheEMR.ServerModel;

namespace DanpheEMR.DalLayer
{
    public class VisitDbContext : DbContext
    {
        public DbSet<VisitModel> Visits { get; set; }
        public DbSet<EmployeeModel> Employees { get; set; }

        //ashim: 22Aug2018 : moved from PatientDbContext. Now Visit Create is using VisitDbContext instead of PatientDbContext
        public DbSet<BillingTransactionModel> BillingTransactions { get; set; }
        public DbSet<BillingTransactionItemModel> BillingTransactionsItems { get; set; }
        public DbSet<LabRequisitionModel> LabRequisitions { get; set; } // Hom 30 Jan'19
        public DbSet<ImagingRequisitionModel> RadiologyImagingRequisitions { get; set; }// Hom 30 Jan'19
        //start: sud-14May for InvoiceReturn of VisitModule -- needs revision.
        public DbSet<BillInvoiceReturnModel> BillReturns { get; set; }
        //end: sud-14May for InvoiceReturn of VisitModule -- needs revision.

        public DbSet<CountrySubDivisionModel> CountrySubdivisions { get; set; }//sud:14May'18
        public DbSet<CountryModel> Countries { get; set; }//sud:14May'18

        public DbSet<ServiceDepartmentModel> ServiceDepartments { get; set; }

        public VisitDbContext(string conn) : base(conn)
        {
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;
        }
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {

            modelBuilder.Entity<PatientModel>().ToTable("PAT_Patient");
            modelBuilder.Entity<VisitModel>().ToTable("PAT_PatientVisits");
            modelBuilder.Entity<AdmissionModel>().ToTable("ADT_PatientAdmission");

            // Patient and visit mappings
            modelBuilder.Entity<VisitModel>()
                   .HasRequired<PatientModel>(a => a.Patient)
                   .WithMany(a => a.Visits)
                    .HasForeignKey(s => s.PatientId);


            //Admission and visit

            modelBuilder.Entity<AdmissionModel>()
                .HasKey(t => t.PatientVisitId);
            modelBuilder.Entity<VisitModel>()
                .HasOptional<AdmissionModel>(a => a.Admission)
                .WithRequired(a => a.Visit);

            modelBuilder.Entity<EmployeeModel>().ToTable("EMP_Employee");
            modelBuilder.Entity<DepartmentModel>().ToTable("MST_Department");
            modelBuilder.Entity<BillItemPrice>().ToTable("BIL_CFG_BillItemPrice");
            modelBuilder.Entity<LabRequisitionModel>().ToTable("LAB_TestRequisition");
            modelBuilder.Entity<ServiceDepartmentModel>().ToTable("BIL_MST_ServiceDepartment");
            modelBuilder.Entity<BillingTransactionModel>().ToTable("BIL_TXN_BillingTransaction");
            modelBuilder.Entity<BillingTransactionItemModel>().ToTable("BIL_TXN_BillingTransactionItems");
            modelBuilder.Entity<ImagingRequisitionModel>().ToTable("RAD_PatientImagingRequisition");
            modelBuilder.Entity<BillingTransactionItemModel>()
                  .HasRequired<BillingTransactionModel>(s => s.BillingTransaction) // Address entity requires Patient
                  .WithMany(s => s.BillingTransactionItems) // Patient entity includes many Addresses entities
                   .HasForeignKey(s => s.BillingTransactionId);

            modelBuilder.Entity<BillInvoiceReturnModel>().ToTable("BIL_TXN_InvoiceReturn");//added sud: 14May--needs revision
            modelBuilder.Entity<CountrySubDivisionModel>().ToTable("MST_CountrySubDivision");//added sud: 14May

            modelBuilder.Entity<CountryModel>().ToTable("MST_Country");//added: sud:3June'18

        }
        public DbSet<PatientModel> Patients { get; set; }
        public DbSet<AdmissionModel> Admissions { get; set; }
        public DbSet<DepartmentModel> Departments { get; set; }
        public DbSet<BillItemPrice> BillItemPrice { get; set; }
    }

}

