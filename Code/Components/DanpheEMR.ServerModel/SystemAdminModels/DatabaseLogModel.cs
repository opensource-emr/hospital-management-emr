using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class DatabaseLogModel
    {
        [Key]
        public int DBLogId { get; set; }
        public string FileName { get; set; }
        public string FolderPath { get; set; }
        public string DatabaseName { get; set; }
        public string DatabaseVersion { get; set; }
        public Boolean? IsDBRestorable { get; set; }
        public string Action { get; set; }
        public string ActionType { get; set; }
        public string Status  { get; set; }
        public string MessageDetail { get; set; }
        public string Remarks { get; set; }
        public int?  CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? DeleteOn { get; set; }
        public Boolean? IsActive { get; set; }     		
    }
}
