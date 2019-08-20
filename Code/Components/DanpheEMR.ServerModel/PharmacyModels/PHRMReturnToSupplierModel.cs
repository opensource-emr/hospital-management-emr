using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class PHRMReturnToSupplierModel
    {
        [Key]
        public int ReturnToSupplierId { get; set; }
        public string CreditNoteId { get; set; }
        public int? CreditNotePrintId { get; set; }
        public int? SupplierId { get; set; }
        public DateTime ReturnDate { get; set; }
        public decimal SubTotal { get; set; }
        public decimal VATAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public string Remarks { get; set; }
        public bool? IsTransferredToACC { get; set; }
        public virtual List<PHRMReturnToSupplierItemsModel> returnToSupplierItems { get; set; }
    }  
}
