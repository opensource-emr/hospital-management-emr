using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.HelpdeskModels
{
    public class BedInformationModel    
    {
        [Key]
        public int BedNumber { get; set; }
        public double? BedPrice { get; set; }
        public string BedFeatureName { get; set; }
        public bool IsOccupied { get; set; }
        public string WardName { get; set; }

    }
}
