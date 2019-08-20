using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
   public class PHRMPurchaseOrderItemsModel
    {
        [Key]
        public int PurchaseOrderItemId { get; set; }
        public int ItemId { get; set; }    
        public int PurchaseOrderId { get; set; }
        public double Quantity { get; set; }
        public decimal StandaredPrice { get; set; }

        public double ReceivedQuantity { get; set; }
        public double PendingQuantity { get; set; }
        public decimal SubTotal { get; set; }
        public decimal VATAmount { get; set; }
        public decimal TotalAmount { get; set; }

        public int DeliveryDays { get; set; }
        public string AuthorizedRemark { get; set; }
        public string Remarks { get; set; }
        public string POItemStatus { get; set; }
        public int? AuthorizedBy { get; set; }
        public DateTime? AuthorizedOn { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        
        

       /// public PHRMPurchaseOrderModel PHRMPurchaseOrder { get; set; }
        ////public virtual PHRMItemMasterModel PHRMItem { get; set; }
        public virtual PHRMItemMasterModel PHRMItemMaster { get; set; }
    }
}
