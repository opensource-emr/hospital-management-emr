using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.InventoryModels
{
    public class InventoryChargesMasterModel
    {
        [Key]
        public int ChargeId { get; set; }
        public string ChargeName { get; set; }
        public bool IsVATApplicable { get; set; }
        public decimal VATPercentage { get; set; }
        public bool IsActive { get; set; }
        public bool IsDefault { get; set; }
        public string Description { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
    }
}
