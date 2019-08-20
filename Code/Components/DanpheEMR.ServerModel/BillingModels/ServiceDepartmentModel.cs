using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class ServiceDepartmentModel
    {
        [Key]
        public int ServiceDepartmentId { get; set; }
        public string ServiceDepartmentName { get; set; }
        public string ServiceDepartmentShortName { get; set; }
        public int DepartmentId { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public string IntegrationName { get; set; }
        public bool? IsActive { get; set; }
        public int? ParentServiceDepartmentId { get; set; }
        public virtual List<BillItemPrice> BillItemPriceList { get; set; }
        public virtual DepartmentModel Department { get; set; }
    }
}