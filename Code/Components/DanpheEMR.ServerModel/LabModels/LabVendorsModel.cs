
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class LabVendorsModel
    {
        [Key]
        public int LabVendorId { get; set; }
        public string VendorCode { get; set; }
        public string VendorName { get; set; }
        public bool IsExternal { get; set; }
        public string ContactAddress { get; set; }
        public string ContactNo { get; set; }
        public string Email { get; set; }
        public string Remarks { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public bool IsActive { get; set; }
        public bool IsDefault { get; set; }
    }
}
