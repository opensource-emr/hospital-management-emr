using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class TransactionLinkModel
    {
        [Key]
        public int AccountingTxnLinkId { get; set; }
        public int? TransactionId { get; set; }
        public string ReferenceId { get; set; }      
        [NotMapped]
        public int? TransferStatus { get; set; }
    }  
}
