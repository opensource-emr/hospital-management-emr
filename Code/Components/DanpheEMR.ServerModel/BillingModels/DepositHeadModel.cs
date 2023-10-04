using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.BillingModels
{
    public class DepositHeadModel
    {
        [Key]
        public int DepositHeadId { get; set; }
        public string DepositHeadCode { get; set; }
        public string DepositHeadName { get; set; }
        public bool IsDefault { get; set; }
        public string Description { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }

    }
}
