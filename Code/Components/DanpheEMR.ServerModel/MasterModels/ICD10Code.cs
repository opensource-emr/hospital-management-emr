using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class ICD10CodeModel
    {
        [Key]
        public int ICD10ID { get; set; }
        public string ICDShortCode { get; set; }
        public string ICD10Code { get; set; }
        public string ICD10Description { get; set; }
        public Boolean ValidForCoding { get; set; }
    }
}
