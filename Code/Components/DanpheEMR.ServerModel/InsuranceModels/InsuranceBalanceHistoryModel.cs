using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class InsuranceBalanceHistoryModel
    {
        [Key]
        public int HistoryId { get; set; }
        public int? PatientId { get; set; }
        public decimal? PreviousAmount { get; set; }
        public decimal? UpdatedAmount { get; set; }
        public string Remark { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        [NotMapped]
        public int? InsuranceProviderId {get; set;}
        
    }
}
