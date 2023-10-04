using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class WARDTransactionModel
    {
        [Key]
        public int TransactionId { get; set; }

        public int? WardId { get; set; }
        public int? StoreId { get; set; }

        public int ItemId { get; set; }
        
        public int Quantity { get; set; }
        
        //foreign key
        public int StockId { get; set; }

        public string TransactionType { get; set; }

        public decimal? Price { get; set; }

        public string CreatedBy { get; set; }

        public DateTime CreatedOn { get; set; }

        public string Remarks { get; set; }

        public Boolean IsWard { get; set; }

        public int newWardId { get; set; }
        public string ReceivedBy { get; set; }

        public string InOut { get; set; }
    }
}

