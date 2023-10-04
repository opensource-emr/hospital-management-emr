using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class IOPModel
    {
        [Key]
        public int Id { get; set; }
        public int MasterId { get; set; }
        public string OD { get; set; }
        public string OS { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
    }
}