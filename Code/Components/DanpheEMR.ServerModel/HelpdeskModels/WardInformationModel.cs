using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.HelpdeskModels
{
   public class WardInformationModel
    {
        [Key]
        public string WardName { get; set; }
        public int TotalBeds { get; set; }
        public int Available { get; set; }
        public int Occupied  { get; set; }

    }
}
