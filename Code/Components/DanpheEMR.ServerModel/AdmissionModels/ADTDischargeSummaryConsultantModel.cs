using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.AdmissionModels
{
    
        public class ADTDischargeSummaryConsultantModel
        {
            [Key]
            public int id { get; set; }
            public int DischargeSummaryId { get; set; }
            public int PatientVisitId { get; set; }
            public int PatientId { get; set; }
            public int ConsultantId { get; set; }

        
    }
}
