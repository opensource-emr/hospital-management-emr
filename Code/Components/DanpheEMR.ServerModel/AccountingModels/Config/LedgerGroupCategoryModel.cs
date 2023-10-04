
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class LedgerGroupCategoryModel
    {
        [Key]
        public int LedgerGroupCategoryId { get; set; }
        public string LedgerGroupCategoryName { get; set; }
        public int ChartOfAccountId { get; set; }
        public string Description { get; set; }
        public DateTime CreatedOn { get; set; }
        public bool IsDebit { get; set; }
        public int CreatedBy { get; set; }
        public bool IsActive { get; set; }
        
    }
}
