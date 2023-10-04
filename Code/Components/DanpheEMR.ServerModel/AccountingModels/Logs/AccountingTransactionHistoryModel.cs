using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.AccountingModels
{
    public class AccountingTransactionHistoryModel
    {
        [Key]
        public int Id { get; set; }
        public DateTime? TransactionDate { get; set; }
        public DateTime? SyncedOn { get; set; }
        public int SyncedBy { get; set; }
        public int? SectionId { get; set; }
        public string TransactionType { get; set; }
    }
}
