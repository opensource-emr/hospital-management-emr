using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.PatientModels;
using DanpheEMR.ServerModel.SSFModels;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.DalLayer
{
    public class SSFDbContext : DbContext
    {
        public DbSet<AdminParametersModel> AdminParameters { get; set; }
        public DbSet<SSFClaimResponseDetails> SSFClaimResponseDetail { get; set; }
        public DbSet<PatientSchemeMapModel> PatientSchemeMaps { get; set; }
        public DbSet<VisitModel> Visits { get; set; }
        public DbSet<SSFClaimBookingModel> SSFClaimBookings { get; set; }
        public SSFDbContext(string conn) : base(conn)
        {
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;

        }
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<AdminParametersModel>().ToTable("CORE_CFG_Parameters");
            modelBuilder.Entity<SSFClaimResponseDetails>().ToTable("PAT_SSFClaimResponseDetails");
            modelBuilder.Entity<PatientSchemeMapModel>().ToTable("PAT_MAP_PatientSchemes");
            modelBuilder.Entity<VisitModel>().ToTable("PAT_PatientVisits");
            modelBuilder.Entity<SSFClaimBookingModel>().ToTable("PAT_SSF_ClaimBooking");
        }
    }
}
