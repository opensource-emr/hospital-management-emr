using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class PatLabtestSummaryModel
    {
        public int TestId { get; set; }
        public int RequisitionId { get; set; }
        public string TestName { get; set; }
        public string TestCode { get; set; }
        public string Department { get; set; }
        public bool? IsSelected { get; set; }
    }
}
