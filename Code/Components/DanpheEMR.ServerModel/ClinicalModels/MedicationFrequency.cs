using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class MedicationFrequency
    {
            [Key]
            public int FrequencyId { get; set; }
            public string Type { get; set; }
    }
}
