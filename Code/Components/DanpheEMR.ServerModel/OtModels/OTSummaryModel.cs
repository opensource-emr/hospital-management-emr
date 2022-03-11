using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class OTSummaryModel
    {
        [Key]
        public int OTSummaryId { get; set; }
        public int OTTeamId { get; set; }
        public int OTBookingId { get; set; }
        public string PreOperationDiagnosis { get; set; }
        public string PostOperationDiagnosis { get; set; }
        public string Anesthesia { get; set; }
        public float OTCharge { get; set; }
        public string OTDescription { get; set; }
        public string Category { get; set; }
        public string SignatureOfNurse { get; set; }
    }
}
