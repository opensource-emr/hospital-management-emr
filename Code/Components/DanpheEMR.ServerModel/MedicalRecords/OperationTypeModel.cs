using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class OperationTypeModel
    {
        [Key]
        public int OperationId { get; set; }
        public string OperationName { get; set; }       
    }
}
