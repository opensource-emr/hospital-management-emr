using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.InventoryModels
{
   public class Horizontal
    {
        [Key]
        public int HorizontalId { get; set; }
        public string HorizontalName { get; set; }
    }
}
