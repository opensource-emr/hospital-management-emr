using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.MedicareModels
{
    public class MedicareTypes
    {
        [Key]
        public int MedicareTypeId { get; set; }
        public int? LedgerId { get; set; }
        public string MedicareTypeName { get; set; }
        public decimal OpCreditAmount { get; set; }
        public decimal IpCreditAmount { get; set; }
        public Boolean IsActive { get; set; }
        public DateTime CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
    }
}
