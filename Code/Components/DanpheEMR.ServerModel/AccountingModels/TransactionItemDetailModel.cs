using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class TransactionItemDetailModel
    {
        [Key]
        public int TransactionItemDetailId { get; set; }
        public int? TransactionItemId { get; set; }
        //public int? PatientId { get; set; }
        public double? Amount { get; set; }
        public string Description { get; set; }
        //public int? VendorId { get; set; }
        //public int? SupplierId { get; set; }
        public int? ReferenceId { get; set; }
        public string ReferenceType { get; set; }
    }
}
