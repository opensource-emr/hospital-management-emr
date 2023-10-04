using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
   public class AuditTrailModel
    {
        [Key]
        public int AuditId { get; set; }
        public DateTime InsertedDate { get; set; }
        public string DbContext { get; set; }
        public string MachineUserName { get; set; }
        public string MachineName { get; set; }
        public string DomainName { get; set; }
        public string CallingMethodName { get; set; }
        public string ChangedByUserId  { get; set; }
        public string ChangedByUserName { get; set; }
        public string Table_Database { get; set; }
        public string ActionName { get; set; }
        public string Table_Name { get; set; }
        public string PrimaryKey { get; set; }
        public string ColumnValues { get; set; }
    }
}
