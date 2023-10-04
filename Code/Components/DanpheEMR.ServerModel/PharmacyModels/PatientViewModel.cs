using Newtonsoft.Json;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace DanpheEMR.ServerModel.PharmacyModels
{
    public class PatientViewModel
    {
        public int PatientId { get; set; }
        public string PatientName { get; set; }
        public string PatientType { get; set; }
        public string HospitalNo { get; set; }
        public int? PriceCategoryId { get; set; }
        public int? PatientMapPriceCategoryId { get; set; }
        public decimal? CoPaymentCashPercent { get; set; }
        public decimal? CoPaymentCreditPercent { get; set; }
        public bool IsCoPayment { get; set; }
        public string PriceCategoryName { get; set; }
        public string VisitType { get; set; }
        public static PatientViewModel MapDataTableToSingleObject(DataTable patientViewModelData)
        {
            PatientViewModel patientViewModel = new PatientViewModel();
            if (patientViewModelData != null)
            {
                string strPatData = JsonConvert.SerializeObject(patientViewModelData);
                List<PatientViewModel> patviewModelData = JsonConvert.DeserializeObject<List<PatientViewModel>>(strPatData);
                if (patviewModelData != null && patviewModelData.Count > 0)
                {
                    patientViewModel = patviewModelData.First();
                }
            }
            return patientViewModel;
        }
    }

    public class InvoiceItemDetailToBeReturn
    {
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public string BatchNo { get; set; }
        public decimal SalePrice { get; set; }
        public decimal SoldQty { get; set; }
        public decimal ReturnedQty { get; set; }
        public decimal PreviouslyReturnedQty { get; set; }
        public decimal SubTotal { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal DiscountPercentage { get; set; }
        public decimal VATPercentage { get; set; }
        public decimal VATAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public int? PriceCategoryId { get; set; }
        public string BillNo { get; set; }
        public int InvoiceId { get; set; }
        public int InvoiceItemId { get; set; }
        public string FiscalYearName { get; set; }
        public int FiscalYearId { get; set; }
    }

}
