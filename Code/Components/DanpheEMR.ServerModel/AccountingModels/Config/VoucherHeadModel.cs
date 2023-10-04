using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    public class VoucherHeadModel
    {
        [Key]
        public int VoucherHeadId { get; set; }
        public string VoucherHeadName { get; set; }
        public string Description { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public bool IsActive { get; set; }
        public bool IsDefault { get; set; }
        //sud-nagesh: 20June'20-- for Acc-Hospital Separation.
        public int? HospitalId { get; set; }
    }
}





