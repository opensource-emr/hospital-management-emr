using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
   public  class ReturnToVendorModel   {

        [Key]
        public int ReturnToVendorId { get; set; }
        public DateTime ReturnDate { get; set; }
        public int VendorId { get; set; }
        public decimal SubTotal { get; set; }
        public decimal VATTotal { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public int CreditNoteId { get; set; }
        public int? CreditNotePrintNo { get; set; }
        public string Remarks { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }

        [NotMapped]
        public List <ReturnToVendorItemsModel> itemsToReturn { get; set;}
        public int StoreId { get; set; }
    }
}
