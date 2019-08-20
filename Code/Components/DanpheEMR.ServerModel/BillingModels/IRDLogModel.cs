using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class IRDLogModel
    {
        [Key]
        public int LogId { get; set; }
        public string JsonData { get; set; }
        public string Status { get; set; }
        public string ResponseMessage { get; set; }
        public string BillType { get; set; }
        public string UrlInfo { get; set; }
        public string ErrorMessage { get; set; }
        public DateTime? CreatedOn { get; set; }       
    }
}
