using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    public class BillItemRequisition
    {
        [Key]
        public Int64 BillItemRequisitionId { get; set; }
        public Int64? RequisitionId { get; set; }
        public int PatientId { get; set; }
        public int PatientVisitId { get; set; }
        public int ServiceDepartmentId { get; set; }
        public int ItemId { get; set; }
        public int ProviderId { get; set; }
        public string ItemName { get; set; }
        public double Quantity { get; set; }
        public string ProcedureCode { get; set; }

        public string BillStatus { get; set; }
        public string DepartmentName { get; set; }
        public double? Price { get; set; }
        [NotMapped]
        public string ServiceDepartment { get; set; }
        //createdby will be employeeId of the current user.
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }

        public virtual PatientModel Patient { get; set; }
        public int? AssignedTo { get; set; }//added: sud-20May'18
        //public virtual VisitModel Visit { get; set; }



    }
}
