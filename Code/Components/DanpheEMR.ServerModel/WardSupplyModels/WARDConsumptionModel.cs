using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class WARDConsumptionModel
    {
        [Key]
        public int ConsumptionId { get; set; }

        public int WardId { get; set; }

        public int? InvoiceId { get; set; }

        public int InvoiceItemId { get; set; }

        public int PatientId { get; set; }

        public int ItemId { get; set; }

        public int? VisitId { get; set; }

        public string ItemName { get; set; }

        public string BatchNo { get; set; }

        public DateTime ExpiryDate { get; set; }

        public int Quantity { get; set; }

        public decimal MRP { get; set; }

        public decimal SubTotal { get; set; }

        public string Remark { get; set; }

        public int CreatedBy { get; set; }

        public DateTime? CreatedOn { get; set; }
        
        [NotMapped]
        public int CounterId { get; set; }
    }
}
