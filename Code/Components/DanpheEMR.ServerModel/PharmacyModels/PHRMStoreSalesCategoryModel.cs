using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
namespace DanpheEMR.ServerModel {
    public class PHRMStoreSalesCategoryModel
    {
        [Key]
        public int SalesCategoryId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public bool IsBatchApplicable { get; set; }
        public bool IsExpiryApplicable { get; set; }
        public bool IsActive { get; set; }
    }
}