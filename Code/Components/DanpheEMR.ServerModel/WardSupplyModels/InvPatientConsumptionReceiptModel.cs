using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    public class InvPatientConsumptionReceiptModel
    {
        [Key]
        public int ConsumptionReceiptId { get; set; }
        public int ConsumptionReceiptNo { get; set; }
        public DateTime ConsumptionDate { get; set; }
        public int PatientId { get; set; }
        public int StoreId { get; set; }
        public string Remarks { get; set; }
        public bool? IsCancel { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }

        [NotMapped]
        public List<WARDInventoryConsumptionModel> ConsumptionList { get; set; }
    }
}
