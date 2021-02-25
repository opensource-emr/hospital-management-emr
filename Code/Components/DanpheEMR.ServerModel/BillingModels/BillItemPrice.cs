using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class BillItemPrice
    {
        [Key]
        public int BillItemPriceId { get; set; }
        public int ServiceDepartmentId { get; set; }
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public string ProcedureCode { get; set; }
        public double? Price { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public bool? IsActive { get; set; }
        public string IntegrationName { get; set; }

        public bool? TaxApplicable { get; set; }
        public string Description { get; set; }
        public bool? DiscountApplicable { get; set; }

        public bool? IsDoctorMandatory { get; set; } //yub 24th sept '18
        public string ItemCode { get; set; } //yub 24th sept '18

        public int? DisplaySeq { get; set; }//sud: 26July'18

        public bool? HasAdditionalBillingItems { get; set; } //Hom: 23 Jan'19
        public bool InsuranceApplicable { get; set; }
        public double? GovtInsurancePrice { get; set; }
        public bool IsInsurancePackage { get; set; }

        public bool? IsFractionApplicable { get; set; } //mahesh 8th feb'19


        public double? EHSPrice { get; set; }//sud:24Feb'19--New prices required.
        public double? SAARCCitizenPrice { get; set; }//sud:24Feb'19--New prices required.
        public double? ForeignerPrice { get; set; }//sud:24Feb'19--New prices required.
        public double? InsForeignerPrice { get; set; }//Pratik:8Nov'19--New prices required.

        public bool? IsNormalPriceApplicable { get; set; }//sud:18Apr'19--For Normal price 
        public bool? IsEHSPriceApplicable { get; set; }//sud:18Apr'19--For Normal price 
        public bool? IsForeignerPriceApplicable { get; set; }//sud:18Apr'19--For Normal price 
        public bool? IsSAARCPriceApplicable { get; set; }//sud:18Apr'19--For Normal price 
        public bool? IsInsForeignerPriceApplicable { get; set; }//Pratik:8Nov'19--For Normal price 

        public bool? IsOT { get; set; }
        public bool? IsProc { get; set; }
        public string Category { get; set; }

        public bool? AllowMultipleQty { get; set; } //pratik 18th oct '19
        public string DefaultDoctorList { get; set; }
        public bool? IsValidForReporting { get; set; }//pratik:7Aug2020


        [NotMapped]
        public string ServiceDepartmentName { get; set; }

    }
}
