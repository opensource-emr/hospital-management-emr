using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class EmailSendDetailModel
    {
        [Key]
        public int SendId { get; set; }
        public int SendBy { get; set; }
        public string SendToEmail { get; set; }
        public string EmailSubject { get; set; }
        public DateTime SendOn { get; set; }
    }
}
