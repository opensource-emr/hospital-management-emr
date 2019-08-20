using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
  public class PHRMCounter
    {
       [Key]
        public int CounterId { get; set; }
        public string CounterName { get; set; }
        public string CounterType { get; set; }
        public DateTime? BeginningDate { get; set; }
        public DateTime? ClosingDate { get; set; }
        public int? StoreId { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
    }
}
