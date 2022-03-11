using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
  public class PHRMPurchaseOrderModel
    {
        [Key]
        public int PurchaseOrderId { get; set; }
        public int SupplierId { get; set; }   
        public int FiscalYearId { get; set; }
        public int? PurchaseOrderNo { get; set; }
        public DateTime? PODate { get; set; }
        public string POStatus { get; set; }
        public decimal SubTotal { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal VATAmount { get; set; }
        public string DeliveryAddress { get; set; }
        public string Remarks { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public int? TermsId { get; set; } //sanjit: 18May'20 to add dynamic terms id.
        public virtual List<PHRMPurchaseOrderItemsModel> PHRMPurchaseOrderItems { get; set; }
        public virtual PHRMSupplierModel PHRMSupplier  { get; set; }
        ////public virtual PHRMCompanyModel PHRMCompany { get; set; }
       
        [NotMapped]
        public string SupplierName { get; set; }
        [NotMapped]
        public string TermText { get; set; }
    }
}
