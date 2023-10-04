using DanpheEMR.ServerModel.BillingModels;
using System.Collections.Generic;
using System;

namespace DanpheEMR.Services.BillSettings.DTOs
{
    public class ServiceItem_DTO
    {
        public int ServiceDepartmentId { get; set; }
        public string ItemName { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public string IntegrationName { get; set; }
        public int IntegrationItemId { get; set; }
        public bool IsTaxApplicable { get; set; }
        public string Description { get; set; }
        public bool IsDoctorMandatory { get; set; }
        public string ItemCode { get; set; }
        public bool IsOT { get; set; }
        public bool IsProc { get; set; }
        public int ServiceCategoryId { get; set; }
        public bool AllowMultipleQty { get; set; }
        public string DefaultDoctorList { get; set; }
        public bool IsValidForReporting { get; set; }
        public bool IsErLabApplicable { get; set; }
        public int ServiceItemId { get; set; }
        public int ItemId { get; set; }
        public bool IsActive { get; set; }
        public int? DisplaySeq { get; set; }

        public List<BillPriceCategoryServiceItemsDTO> BilCfgItemsVsPriceCategoryMap { get; set; }
    }

  public class BillPriceCategoryServiceItemsDTO
    {
        public int PriceCategoryServiceItemMapId { get; set; }
        public int PriceCatMapId { get; set; }
        public int PriceCategoryId { get; set; }
        public int ServiceItemId { get; set; }
        public int ServiceDepartmentId { get; set; }
        public decimal Price { get; set; }
        public Boolean IsDiscountApplicable { get; set; }
        public string ItemLegalCode { get; set; }
        public string ItemLegalName { get; set; }
        public Boolean IsActive { get; set; }
        public bool IsPriceChangeAllowed { get; set; }
        public bool IsZeroPriceAllowed { get; set; }
        public bool IsIncentiveApplicable { get; set; }
        public bool HasAdditionalBillingItems { get; set; }
        public int ItemId { get; set; }
    }
}
