using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
  public class PurchaseOrderModel
    {
        [Key]
        public int PurchaseOrderId { get; set; }
        public int VendorId { get; set; }        
        public DateTime? PoDate { get; set; }
        public string POStatus { get; set; }
        public decimal SubTotal { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal VAT { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public string PORemark { get; set; }
        public string TermsConditions { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public virtual List<PurchaseOrderItemsModel> PurchaseOrderItems { get; set; }
        public VendorMasterModel Vendor { get; set; }
        [NotMapped]
        public string VendorName { get; set; }



    }
}
