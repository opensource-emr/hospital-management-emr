using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.CommonModels
{
    public class InvoiceHeaderModel
    {
        [Key]
        public int InvoiceHeaderId { get; set; }
        public string Module { get; set; }
        public string HeaderDescription { get; set; }
        public string HospitalName { get; set; }
        public string Address { get; set; }
        public string Email { get; set; }
        public string PAN { get; set; }
        public string Telephone { get; set; }
        public string DDA { get; set; }
        public string LogoFileName { get; set; }
        public string LogoFileExtention { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
        public bool? IsActive { get; set; }

        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
        [NotMapped]
        public byte[] FileBinaryData { get; set; }
    }
}
