
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class CostCenterItemModel
    {
        [Key]
        public int CostCenterItemId { get; set; }
        public string CostCenterItemName { get; set; }
        public string Description { get; set; }
        public DateTime CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public bool IsActive { get; set; }
        //sud-nagesh: 20June'20-- for Acc-Hospital Separation.
        public int? HospitalId { get; set; }
    }

    public class CostCenterModel
    {
        [Key]
        public int CostCenterId { get; set; }
        public string CostCenterCode { get; set; }
        public string BusinessCenterName { get; set; }
        public string CostCenterName { get; set; }
        public string Description { get; set; }
        public int? ParentCostCenterId { get; set; }
        public int HierarchyLevel { get; set; }
        public bool IsActive { get; set; }
        public bool IsDefault { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
    
       
       }

    public class CostCenterModelDTO
    {
        public int CostCenterId { get; set; }
        public string CostCenterCode { get; set; }
        public string BusinessCenterName { get; set; }
        public string CostCenterName { get; set; }
        public string Description { get; set; }
        public int? ParentCostCenterId { get; set; }
        public int HierarchyLevel { get; set; }
        public bool IsActive { get; set; }
        public bool IsDefualt { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }

        public string ParentCostCenterName { get; set; }


    }
}
