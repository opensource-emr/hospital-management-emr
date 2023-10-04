using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.AccountingModels.DTOs
{
    public class ConsultantLedger_DTO
    {
        public int EmployeeId { get; set; }
        public string FullName {get;set; }
        public int LedgerId { get; set; }
        public string LedgerType { get;set; }
        public int? SubLedgerId { get; set; }
    }
}
