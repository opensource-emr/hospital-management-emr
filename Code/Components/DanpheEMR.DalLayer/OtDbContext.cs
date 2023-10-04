using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DanpheEMR.ServerModel;

namespace DanpheEMR.DalLayer
{
    public class OtDbContext : DbContext
    {
        public DbSet<OtBookingListModel> OtBookingList { get; set; }
        public DbSet<OTTeamsModel> OtTeamDetails { get; set; }
        public DbSet<OtCheckListInfoModel> OtCheckList { get; set; }
        public DbSet<OTSummaryModel> OtSummary { get; set; }
        public DbSet<PatientModel> Patient { get; set; }
        public DbSet<VisitModel> Visit { get; set; }
        public DbSet<EmployeeModel> Employees { get; set; }


        public OtDbContext(string conn) : base(conn)
        {
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<OtBookingListModel>().ToTable("OT_TXN_BookingDetails");
            modelBuilder.Entity<OTTeamsModel>().ToTable("OT_TXN_OtTeamsInfo");
            modelBuilder.Entity<OtCheckListInfoModel>().ToTable("OT_TXN_CheckListInfo");
            modelBuilder.Entity<OTSummaryModel>().ToTable("OT_TXN_Summary");
            modelBuilder.Entity<PatientModel>().ToTable("PAT_Patient");
            modelBuilder.Entity<EmployeeModel>().ToTable("EMP_Employee");
            modelBuilder.Entity<VisitModel>().ToTable("PAT_PatientVisits");

        }

    }
}
