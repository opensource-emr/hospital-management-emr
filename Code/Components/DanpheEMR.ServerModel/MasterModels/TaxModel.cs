using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class TaxModel
    {
        [Key]
        public int TaxId { get; set; }
        public string TaxName { get; set; }
        public double TaxPercentage { get; set; }
        public string TaxLabel { get; set; }
        public string Description { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
    }
}
