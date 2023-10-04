using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class MedicationModel
    {
        [Key]
        public int MedicineId { get; set; }
        public string MedicineName { get; set; }
    }
}
