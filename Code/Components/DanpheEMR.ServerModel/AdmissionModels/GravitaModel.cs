using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class GravitaModel
    {
        [Key]
        public int GravitaId { get; set; }
        public string GravitaName { get; set; }
    }
}
