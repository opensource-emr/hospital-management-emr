using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace DanpheEMR.ServerModel
{

    public class ImagingRequisitionModel
    {
        [Key]
        public int ImagingRequisitionId { get; set; }
        public int? PatientVisitId { get; set; }
        public int PatientId { get; set; }
        public string ProviderName { get; set; }
        public int? ImagingTypeId { get; set; }
        public string ImagingTypeName { get; set; }
        public int? ImagingItemId { get; set; }
        public string ImagingItemName { get; set; }
        public string ProcedureCode { get; set; }
        public DateTime? ImagingDate { get; set; }
        public string RequisitionRemarks { get; set; }
        public string OrderStatus { get; set; }
        public int? ProviderId { get; set; }
        public string BillingStatus { get; set; }
        public string Urgency { get; set; }

        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }

        public int? DiagnosisId { get; set; }

        public string WardName { get; set; }
                
        public bool IsActive { get; set; }        

        public virtual VisitModel Visit { get; set; }       

        public virtual PatientModel Patient { get; set; }
        
        public virtual ImagingReportModel ImagingReport { get; set; }
       //[NotMapped]
       //required for billing for listing the imaging items <dinesh:19Jan'17>
        public virtual RadiologyImagingItemModel ImagingItem { get; set; }
        public bool? HasInsurance { get; set; }
        public bool? IsScanned { get; set; }
        public int? ScannedBy { get; set; }
        public DateTime? ScannedOn { get; set; }
        public string ScanRemarks { get; set; }
    }  
    
    public class RadiologyScanDoneDetail
    {
        public int ImagingRequisitionId { get; set; }
        public string ScannedOn { get; set; }
        public string Remarks { get; set; }
        public string PatientCode { get; set; }
        public string ShortName { get; set; }
    }
}
