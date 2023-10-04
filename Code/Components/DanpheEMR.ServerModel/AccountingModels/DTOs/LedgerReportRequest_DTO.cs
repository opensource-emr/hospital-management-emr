using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.AccountingModels.DTOs
{
    public class LedgerReportRequest_DTO
    {
        public List<int> LedgerIds;
        public DateTime FromDate;
        public DateTime ToDate;
        public int FiscalYearId;
        public int CostCenterId;
    }
}
