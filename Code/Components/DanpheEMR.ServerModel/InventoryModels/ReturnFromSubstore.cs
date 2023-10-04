using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel.InventoryModels
{
    public class ReturnFromSubstore
    {
        [Key]
        public int ReturnId { get; set; }
        public DateTime ReturnDate { get; set; }
        public int SourceStoreId { get; set; }
        public int TargetStoreId { get; set; }
        public string Remarks { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ReceivedBy { get; set; }
        [NotMapped]
        public string ReceivedByName { get; set; }
        public DateTime? ReceivedOn { get; set; }

        public string ReceivedRemarks { get; set; }

    }
}
