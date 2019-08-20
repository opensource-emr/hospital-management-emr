using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class DepartmentModel
    {
        [Key]
        public int DepartmentId { get; set; }
        public string DepartmentCode { get; set; }
        public string DepartmentName { get; set; }
        public string Description { get; set; }
        public int? DepartmentHead { get; set; }
        public bool IsActive { get; set; }
        public bool IsAppointmentApplicable { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ParentDepartmentId { get; set; }

        [NotMapped]
        //combination of firstname and last name for search purpose, it's not mapped with the database.
        public string ParentDepartmentName { get; set; }

    }
}
