using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class PHRMItemTypeModel
    {
        [Key]
        public int ItemTypeId { get; set; }
        public int CategoryId { get; set; }
        public string ItemTypeName { get; set; }
        public string Description { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public bool IsActive { get; set; }
        public virtual List<PHRMItemMasterModel> Items { get; set; }
    }
}
