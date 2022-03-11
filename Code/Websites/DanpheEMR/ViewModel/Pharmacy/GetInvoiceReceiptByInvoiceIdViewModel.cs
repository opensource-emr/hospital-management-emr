using DanpheEMR.DalLayer;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.ViewModel.Pharmacy
{
    public class GetInvoiceReceiptByInvoiceIdViewModel
    {
        public GetInvoiceReceiptDTO pharmacyReceipt { get; set; }
    }
    public static class GetInvoiceReceiptByInvoiceIdFunc
    {
        public static GetInvoiceReceiptByInvoiceIdViewModel GetInvoiceReceiptByInvoiceId(this PharmacyDbContext db, int invoiceId)
        {
            var invoiceDetail = (from inv in db.PHRMInvoiceTransaction.Where(i => i.InvoiceId == invoiceId)
                                 from pat in db.PHRMPatient.Where(p => p.PatientId == inv.PatientId)
                                 from provider in db.Employees.Where(p => p.EmployeeId == inv.ProviderId).DefaultIfEmpty()
                                 from countryd in db.CountrySubDivision.Where(c => c.CountrySubDivisionId == pat.CountrySubDivisionId)
                                 from fy in db.PharmacyFiscalYears.Where(f => f.FiscalYearId == inv.FiscalYearId)
                                 from createdByUser in db.Users.Where(u => u.EmployeeId == inv.CreatedBy)
                                 from depo in db.DepositModel.Where(d => d.TransactionId == inv.InvoiceId).DefaultIfEmpty()
                                 from creditOrg in db.CreditOrganizations.Where(c => c.OrganizationId == inv.OrganizationId).DefaultIfEmpty()
                                 select new GetInvoiceReceiptDTO
                                 {
                                     InvoicePrintId = inv.InvoicePrintId,
                                     ReceiptNo = inv.InvoiceId,
                                     ClaimCode = inv.ClaimCode,
                                     ReceiptDate = inv.CreateOn,
                                     TotalQuantity = inv.TotalQuantity,
                                     DepositDeductAmount = (depo != null) ? depo.DepositAmount : 0,
                                     Tender = inv.Tender,
                                     PaymentMode = inv.PaymentMode,
                                     Change = inv.Change,
                                     DepositBalance = (depo != null) ? depo.DepositBalance : 0,
                                     Remarks = inv.Remark,
                                     CreditOrganizationName = (creditOrg == null) ? null : creditOrg.OrganizationName,
                                     BillingUser = createdByUser.UserName,
                                     ReceiptPrintNo = inv.InvoicePrintId,
                                     PrintCount = inv.PrintCount,
                                     IsReturned = inv.IsReturn,
                                     CurrentFinYear = fy.FiscalYearName,
                                     SubTotal = inv.SubTotal,
                                     DiscountAmount = inv.DiscountAmount,
                                     VATPercentage = 0,
                                     VATAmount = inv.VATAmount,
                                     TotalAmount = inv.TotalAmount,
                                     ProviderName = (provider != null) ? provider.FullName : null,
                                     ProviderNMCNumber = (provider != null) ? provider.MedCertificationNo : null,
                                     StoreId = inv.StoreId,
                                     Patient = new GetInvoiceReceiptPatientDTO
                                     {
                                         PatientId = pat.PatientId,
                                         FirstName = pat.FirstName,
                                         MiddleName = pat.MiddleName,
                                         LastName = pat.LastName,
                                         ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                         PhoneNumber = pat.PhoneNumber,
                                         CountrySubDivisionName = countryd.CountrySubDivisionName,
                                         Age = pat.Age,
                                         NSHINumber = pat.Ins_NshiNumber,
                                         PANNumber = (pat != null) ? pat.PANNumber : null,
                                         Address = pat.Address,
                                         DateOfBirth = pat.DateOfBirth,
                                         Gender = pat.Gender,
                                         PatientCode = pat.PatientCode
                                     },

                                 }).FirstOrDefault();


            invoiceDetail.InvoiceItems = (from IItem in db.PHRMInvoiceTransactionItems.Where(I => I.InvoiceId == invoiceId && I.Quantity > 0)
                                          from I in db.PHRMItemMaster.Where(i => i.ItemId == IItem.ItemId)
                                          from G in db.PHRMGenericModel.Where(g => g.GenericId == I.GenericId).DefaultIfEmpty()
                                          select new GetInvoiceReceiptItemDTO
                                          {
                                              ItemId = IItem.ItemId,
                                              Quantity = IItem.Quantity,
                                              ItemName = IItem.ItemName,
                                              BatchNo = IItem.BatchNo,
                                              ExpiryDate = IItem.ExpiryDate,
                                              MRP = IItem.MRP,
                                              FreeQuantity = IItem.FreeQuantity,
                                              SubTotal = IItem.SubTotal,
                                              VATPercentage = IItem.VATPercentage,
                                              VATAmount = IItem.VATAmount,
                                              DiscountPercentage = IItem.DiscountPercentage,
                                              TotalAmount = IItem.TotalAmount,
                                              BilItemStatus = IItem.BilItemStatus,
                                              TotalDisAmt = IItem.TotalDisAmt,
                                              GenericName = (G != null) ? G.GenericName : "N/A"
                                          }).ToList(); //OrderBy ItemName removed for LPH;
            // for taxable and non taxable amount
            invoiceDetail.TaxableAmount = invoiceDetail.InvoiceItems.Where(a => a.VATAmount > 0).Sum(a => a.SubTotal - a.TotalDisAmt);
            invoiceDetail.NonTaxableAmount = invoiceDetail.InvoiceItems.Where(a => a.VATAmount <= 0).Sum(a => a.SubTotal ?? 0 - a.TotalDisAmt ?? 0);
            invoiceDetail.VATPercentage = (invoiceDetail.TaxableAmount) == 0 ? 0 : (invoiceDetail.VATAmount * 100) / (invoiceDetail.TaxableAmount);
            return new GetInvoiceReceiptByInvoiceIdViewModel() { pharmacyReceipt = invoiceDetail };
        }
    }
    public class GetInvoiceReceiptDTO
    {
        public int InvoicePrintId { get; set; }
        public int ReceiptNo { get; set; }
        public Int64? ClaimCode { get; set; }
        public DateTime? ReceiptDate { get; set; }
        public double? TotalQuantity { get; set; }
        public double? DepositDeductAmount { get; set; }
        public decimal? Tender { get; set; }
        public string PaymentMode { get; set; }
        public decimal? Change { get; set; }
        public double? DepositBalance { get; set; }
        public string Remarks { get; set; }
        public string CreditOrganizationName { get; set; }
        public string BillingUser { get; set; }
        public int ReceiptPrintNo { get; set; }
        public int? PrintCount { get; set; }
        public bool? IsReturned { get; set; }
        public string CurrentFinYear { get; set; }
        public decimal? SubTotal { get; set; }
        public decimal? DiscountAmount { get; set; }
        public decimal? VATAmount { get; set; }
        public decimal? TotalAmount { get; set; }
        public string ProviderName { get; set; }
        public string ProviderNMCNumber { get; set; }
        public GetInvoiceReceiptPatientDTO Patient { get; set; }
        public IList<GetInvoiceReceiptItemDTO> InvoiceItems { get; set; }
        public decimal? VATPercentage { get; set; }
        public decimal? TaxableAmount { get; set; }
        public decimal? NonTaxableAmount { get; set; }
        public int StoreId { get; set; }
    }

    public class GetInvoiceReceiptPatientDTO
    {
        public int PatientId { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string ShortName { get; set; }
        public string PhoneNumber { get; set; }
        public string CountrySubDivisionName { get; set; }
        public string Age { get; set; }
        public string NSHINumber { get; set; }
        public string PANNumber { get; set; }
        public string Address { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Gender { get; set; }
        public string PatientCode { get; set; }
    }
    public class GetInvoiceReceiptItemDTO
    {
        public int? ItemId { get; set; }
        public double? Quantity { get; set; }
        public string ItemName { get; set; }
        public string BatchNo { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public decimal? MRP { get; set; }
        public double? FreeQuantity { get; set; }
        public decimal? SubTotal { get; set; }
        public double? VATPercentage { get; set; }
        public double? DiscountPercentage { get; set; }
        public decimal? TotalAmount { get; set; }
        public string BilItemStatus { get; set; }
        public decimal? TotalDisAmt { get; set; }
        public string GenericName { get; set; }
        public decimal? VATAmount { get; set; }
    }
}
