using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel
{
    public class PHRMTAXModel
    {
        [Key]
        public int TAXId { get; set; }
        public string TAXName { get; set; }
        public double TAXPercentage { get; set; }
        public string Description { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
    }
}
