using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DanpheEMR.Jobs.IRDNepal;
using DanpheEMR.ServerModel;

namespace DanpheEMR.Jobs.IRDNepal
{
    class IRDNepalDbContext:DbContext
    {
        public IRDNepalDbContext(string conn) : base(conn)
        {
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;
        }


        public DbSet<IRD_Common_InvoiceModel> IrdCommonInvoiceSets { get; set; }
        public DbSet<BillingTransactionModel> BillingTransactions { get; set; }
        public DbSet<BillReturnRequestModel> BillReturnRequests { get; set; }
      

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<IRD_Common_InvoiceModel>().ToTable("IRD_Sync_Invoices_Common");
            modelBuilder.Entity<BillingTransactionModel>().ToTable("BIL_TXN_BillingTransaction");
            modelBuilder.Entity<BillReturnRequestModel>().ToTable("BIL_TXN_BillingReturn");
            modelBuilder.Entity<PatientModel>().ToTable("PAT_Patient");
        }

    }
}
