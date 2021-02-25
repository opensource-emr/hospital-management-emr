using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class AuditTableDisplayName
    {
        [Key]
        public int AuditTableDisplayNameId { get; set; }
        public string DisplayName { get; set; }
        public string TableName { get; set; }
        public bool IsActive { get; set; }
    }
}
