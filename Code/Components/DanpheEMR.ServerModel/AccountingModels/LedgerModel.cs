
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class LedgerModel
    {
        [Key]
        public int LedgerId { get; set; }
        public int LedgerGroupId { get; set; }                        
        public string LedgerName { get; set; }                
        public int? LedgerReferenceId { get; set; }
        public string Description { get; set; }
        public int? SectionId { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public bool IsActive { get; set; }
        public bool? IsCostCenterApplicable { get; set; }
        public double? OpeningBalance { get; set; }
        public bool? DrCr { get; set; }
        public string Name { get; set; }
        public string LedgerType { get; set; }
        [NotMapped]
        public string PrimaryGroup { get; set; }
        [NotMapped]
        public string COA { get; set; }
        [NotMapped]
        public string LedgerGroupName { get; set; }
        public string Code { get; set; }
        public string PANNo { get; set; }
        public string Address { get; set; }
        public string MobileNo { get; set; }
	    public int? CreditPeriod { get; set; }
	    public decimal? TDSPercent { get; set; }
        public string LandlineNo { get; set; }

        [NotMapped]
        public int? EmployeeId { get; set; }
        [NotMapped]
        public string EmployeeName { get; set; }      
        [NotMapped]
        public string DepartmentName { get; set; }
        [NotMapped]
        public string SupplierName { get; set; }
        [NotMapped]
        public int? SupplierId { get; set; }
        [NotMapped]
        public string VendorName { get; set; }
        [NotMapped]
        public int? VendorId { get; set; }
        [NotMapped]
        public string SubCategoryName { get; set; }
        [NotMapped]
        public int? SubCategoryId { get; set; }
        [NotMapped]
        public string OrganizationName { get; set; }
        [NotMapped]
        public int? OrganizationId { get; set; }
        [NotMapped]
        public string ServiceDepartmentName { get; set; }
        [NotMapped]
        public int? ServiceDepartmentId { get; set; }
        [NotMapped]
        public int? ItemId { get; set; }
        [NotMapped]
        public string ItemName { get; set; }
        //sud-nagesh: 20June'20-- for Acc-Hospital Separation.
        public int? HospitalId { get; set; }

        [NotMapped]
        public bool? IsMapLedger { get; set; }

    }
    
}
