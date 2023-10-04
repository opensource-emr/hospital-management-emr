using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class IntegrationModel
    {
        [Key]
        public string IntegrationName { get; set; }
        public int IntegrationNameID { get; set; }
    }
}
