using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class InventoryTermsModel
    {
        [Key]
        public int TermsId { get; set; }
        public string Text { get; set; }
        public string Type { get; set; }
        public string ShortName { get; set; }
        public int OrderBy { get; set; }
        public bool IsActive { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int TermsApplicationEnumId { get; set; }
    }
}
