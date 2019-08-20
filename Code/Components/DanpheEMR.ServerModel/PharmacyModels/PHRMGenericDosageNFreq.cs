using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class PHRMGenericDosageNFreqMap
    {
        [Key]
        public int GenericDosageMapId { get; set; }
        public int? GenericId { get; set; }
        public string GenericName { get; set; }
        public string Dosage { get; set; }
        public string Route { get; set; }
        public double? Frequency { get; set; }
        public string FreqInWords { get; set; }
    }
}
