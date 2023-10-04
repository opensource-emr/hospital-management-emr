using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.AppointmentModels
{
    public class Rank
    {
        [Key]
        public int RankId { get; set; }
        public string RankName { get; set; }
        public bool IsActive { get; set; }
    }

    public class RankNameDTO
    {
        public string Rank { get; set; }
    }
}
