using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class DeathTypeModel
    {
        [Key]
        public int DeathTypeId { get; set; }
        public string DeathType { get; set; }
    }
}
