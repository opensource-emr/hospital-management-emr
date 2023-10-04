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

        public int WardId { get; set; }
        public string WardName { get; set; }
        public int Total { get; set; }
        public int Vacant { get; set; }
        public int Occupied  { get; set; }
        public int Reserved { get; set; }
    }
}
