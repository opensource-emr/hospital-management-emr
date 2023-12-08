using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Audit.EntityFramework;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.BillingModels;
using DanpheEMR.ServerModel.AppointmentModels;
using DanpheEMR.ServerModel.PatientModels;
using DanpheEMR.ServerModel.SSFModels;
using DanpheEMR.ServerModel.MedicareModels;
using DanpheEMR.ServerModel.BillingModels.Config;

namespace DanpheEMR.DalLayer
{
    public class VisitDbContext : AuditDbContext
    {
        public DbSet<VisitModel> Visits { get; set; }
        public DbSet<AppointmentModel> AppointmentModel { get; set; }

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
        public List<VitalsModel> Vitals { get; set; }
        public DbSet<PatientSchemeMapModel> PatientSchemeMaps { get; set; }
        public DbSet<BillingTransactionCreditBillStatusModel> BillingTransactionCreditBillStatuses { get; set; }
        public DbSet<Rank> Ranks { get; set; }
        public DbSet<SSFClaimResponseDetails> SSFClaimResponseDetails { get; set; }

        public DbSet<MedicareMember> MedicareMembers { get; set; } //Krishna:8th,Jan'23
        public DbSet<MedicareMemberBalance> MedicareMemberBalances { get; set; } //Krishna:8th,Jan'23
        public DbSet<BillingSchemeModel> BillingSchemes { get; set; } 
        public DbSet<CreditOrganizationModel> CreditOrganizations { get; set; } 
        public DbSet<CfgParameterModel> CFGParameters { get; set; }
        public DbSet<GuarantorModel> Guarantor { get; set; }
        public DbSet<BillingSubSchemeModel> BillingSubSchemes { get; set; }
        public DbSet<EmpCashTransactionModel> EmpCashTransactions { get; set; }
        public DbSet<EmergencyPatientModel> EmergencyPatients { get; set; }
        public DbSet<PriceCategoryModel> PriceCategories { get; set; }
        public VisitDbContext(string conn) : base(conn)
        {
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;
        }
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {

            modelBuilder.Entity<PatientModel>().ToTable("PAT_Patient");
            modelBuilder.Entity<VisitModel>().ToTable("PAT_PatientVisits");
            modelBuilder.Entity<AppointmentModel>().ToTable("PAT_Appointment");
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
            modelBuilder.Entity<BillServiceItemModel>().ToTable("BIL_MST_ServiceItem");
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
            modelBuilder.Entity<VitalsModel>().ToTable("CLN_PatientVitals");
            modelBuilder.Entity<PatientSchemeMapModel>().ToTable("PAT_MAP_PatientSchemes");
            modelBuilder.Entity<BillingTransactionCreditBillStatusModel>().ToTable("BIL_TXN_CreditBillStatus");
            modelBuilder.Entity<Rank>().ToTable("PAT_APF_Rank");
            modelBuilder.Entity<SSFClaimResponseDetails>().ToTable("PAT_SSFClaimResponseDetails");


            modelBuilder.Entity<MedicareMember>().ToTable("INS_MedicareMember");
            modelBuilder.Entity<MedicareMemberBalance>().ToTable("INS_MedicareMemberBalance");
            modelBuilder.Entity<BillMapPriceCategoryServiceItemModel>().ToTable("BIL_MAP_PriceCategoryServiceItem");
            modelBuilder.Entity<BillingSchemeModel>().ToTable("BIL_CFG_Scheme");
            modelBuilder.Entity<CreditOrganizationModel>().ToTable("BIL_MST_Credit_Organization");
            modelBuilder.Entity<CfgParameterModel>().ToTable("CORE_CFG_Parameters");
            modelBuilder.Entity<GuarantorModel>().ToTable("PAT_PatientGurantorInfo");
            modelBuilder.Entity<BillingSubSchemeModel>().ToTable("BIL_CFG_SubScheme");
            modelBuilder.Entity<EmpCashTransactionModel>().ToTable("TXN_EmpCashTransaction");
            modelBuilder.Entity<EmergencyPatientModel>().ToTable("ER_Patient");
            modelBuilder.Entity<PriceCategoryModel>().ToTable("BIL_CFG_PriceCategory");

        }
        public DbSet<PatientModel> Patients { get; set; }
        public DbSet<AdmissionModel> Admissions { get; set; }
        public DbSet<DepartmentModel> Departments { get; set; }
        public DbSet<BillServiceItemModel> BillServiceItems { get; set; }
        public DbSet<BillMapPriceCategoryServiceItemModel> BillPriceCategoryServiceItems { get; set; } //Krishna: 25th,Jul,22
    }

}

