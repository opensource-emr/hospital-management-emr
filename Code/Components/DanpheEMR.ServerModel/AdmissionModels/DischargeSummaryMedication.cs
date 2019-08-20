using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class DischargeSummaryMedication
    {
        [Key]
        public int DischargeSummaryMedicationId { get; set; }
        public int DischargeSummaryId { get; set; }
        public int OldNewMedicineType { get; set; }
        public string Medicine { get; set; }
        public int FrequencyId { get; set; }
        public string Notes { get; set; }
        public bool? IsActive { get; set; }
     }
}
