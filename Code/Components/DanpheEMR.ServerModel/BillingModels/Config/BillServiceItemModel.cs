using DanpheEMR.ServerModel.BillingModels;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    public class BillServiceItemModel
    {
        [Key]
        public int ServiceItemId { get; set; }
        public int ServiceDepartmentId { get; set; }
        public int IntegrationItemId { get; set; }
        public string IntegrationName { get; set; }
        public string ItemCode { get; set; } //yub 24th sept '18
        public string ItemName { get; set; }
        public bool IsTaxApplicable { get; set; }
        public string Description { get; set; }
        public int? DisplaySeq { get; set; }//sud: 26July'18
        public bool IsDoctorMandatory { get; set; } //yub 24th sept '18
        public bool IsOT { get; set; }
        public bool IsProc { get; set; }
        public int? ServiceCategoryId { get; set; } //new column (need to have a FK relation with ServiceCategory table)
        public bool AllowMultipleQty { get; set; } //pratik 18th oct '19
        public string DefaultDoctorList { get; set; }
        public bool IsValidForReporting { get; set; }//pratik:7Aug2020
        public bool IsErLabApplicable { get; set; }//pratik:9Feb'21
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public bool IsActive { get; set; }

        public bool IsIncentiveApplicable { get; set; }

        //Krishna, 16thFeb'23 We might need these NotMapped properties, Need to check their references and proceed accordingly
        [NotMapped]
        public string ServiceDepartmentName { get; set; }
        [NotMapped]
        public List<BillMapPriceCategoryServiceItemModel> BilCfgItemsVsPriceCategoryMap { get; set; }



    }

    public class BillItemPrice_Old_16thFeb_23
    {
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
        public bool? IsZeroPriceAllowed { get; set; }//pratik:28Jan'21
        public bool? IsErLabApplicable { get; set; }//pratik:9Feb'21


        [NotMapped]
        public string ServiceDepartmentName { get; set; }
        [NotMapped]
        public List<BillMapPriceCategoryServiceItemModel> BilCfgItemsVsPriceCategoryMap { get; set; }
        public bool? IsPriceChangeAllowed { get; set; } //Krishna: 2ndNov'22

        //Sud:13Jan'22--initializing the constructor with Default Values.
        public BillItemPrice_Old_16thFeb_23()
        {
            IsPriceChangeAllowed = true;
        }

    }

}
