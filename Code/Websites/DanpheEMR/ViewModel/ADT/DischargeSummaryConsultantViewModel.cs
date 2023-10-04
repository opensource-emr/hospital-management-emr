using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.ViewModel.ADT
{
    public class DischargeSummaryConsultantViewModel
    {
        public int? dischargeSummaryId { get; set; }
        public int consultantId { get; set; }
        public string consultantName { get; set; }
        public string consultantNMC { get; set; }
        public string consultantLongSignature { get; set; }
        public string consultantSignImgPath { get; set; }
        public string consultantDepartmentName { get; set; }
    }
}
