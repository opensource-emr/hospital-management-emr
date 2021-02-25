using DanpheEMR.DalLayer;
using System;
using System.Collections.Generic;
using System.Data.Entity;
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
        public static async Task<GetInvoiceReceiptByInvoiceIdViewModel> GetInvoiceReceiptByInvoiceIdAsync(this PharmacyDbContext db, int invoiceId)
        {
            var invoiceDetail = await (from inv in db.PHRMInvoiceTransaction.Where(i => i.InvoiceId == invoiceId)
                                 from pat in db.PHRMPatient.Where(p => p.PatientId == inv.PatientId)
                                 from countryd in db.CountrySubDivision.Where(c => c.CountrySubDivisionId == pat.CountrySubDivisionId)
                                 from fy in db.BillingFiscalYear.Where(f => f.FiscalYearId == inv.FiscalYearId)
                                 from createdByUser in db.Users.Where(u => u.EmployeeId == inv.CreatedBy)
                                 from depo in db.DepositModel.Where(d => d.TransactionId == inv.InvoiceId).DefaultIfEmpty()
                                 from creditOrg in db.CreditOrganizations.Where(c => c.OrganizationId == inv.OrganizationId).DefaultIfEmpty()
                                 select new GetInvoiceReceiptDTO
                                 {
                                     InvoicePrintId = inv.InvoicePrintId,
                                     ReceiptNo = inv.InvoiceId,
                                     ReceiptDate = inv.CreateOn,
                                     TotalQuantity = inv.TotalQuantity,
                                     DepositDeductAmount = (depo != null) ? depo.DepositAmount : 0,
                                     Tender = inv.Tender,
                                     PaymentMode = inv.PaymentMode,
                                     Change = inv.Change,
                                     DepositBalance = (depo != null) ? depo.DepositBalance : 0,
                                     Remarks = inv.Remark,
                                     CreditOrganizationName = (creditOrg == null) ? null : creditOrg.OrganizationName,
                                     UserName = createdByUser.UserName,
                                     ReceiptPrintNo = inv.InvoicePrintId,
                                     PrintCount = inv.PrintCount,
                                     IsReturned = inv.IsReturn,
                                     CurrentFinYear = fy.FiscalYearFormatted,
                                     SubTotal = inv.SubTotal,
                                     DiscountAmount = inv.DiscountAmount,
                                     TotalAmount = inv.TotalAmount,
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
                                         PANNumber = pat.PANNumber,
                                         Address = pat.Address,
                                         DateOfBirth = pat.DateOfBirth,
                                         Gender = pat.Gender,
                                         PatientCode = pat.PatientCode
                                     }
                                 }).FirstOrDefaultAsync();
            invoiceDetail.InvoiceItems = await (from invitm in db.PHRMInvoiceTransactionItems.Where(I => I.InvoiceId == invoiceId && I.Quantity > 0)
                                          select new GetInvoiceReceiptItemDTO
                                          {
                                              ItemId = invitm.ItemId,
                                              Quantity = invitm.Quantity,
                                              ItemName = invitm.ItemName,
                                              BatchNo = invitm.BatchNo,
                                              ExpiryDate = invitm.ExpiryDate,
                                              MRP = invitm.MRP,
                                              FreeQuantity = invitm.FreeQuantity,
                                              SubTotal = invitm.SubTotal,
                                              VATPercentage = invitm.VATPercentage,
                                              TotalAmount = invitm.TotalAmount,
                                              DiscountPercentage = invitm.DiscountPercentage,
                                              BilItemStatus = invitm.BilItemStatus,
                                              TotalDisAmt = invitm.TotalDisAmt
                                          }).OrderBy(x => x.ItemName).ToListAsync();
            return new GetInvoiceReceiptByInvoiceIdViewModel() { pharmacyReceipt = invoiceDetail };
        }
    }
    public class GetInvoiceReceiptDTO
    {
        public int InvoicePrintId { get; set; }
        public int ReceiptNo { get; set; }
        public DateTime? ReceiptDate { get; set; }
        public double? TotalQuantity { get; set; }
        public double? DepositDeductAmount { get; set; }
        public decimal? Tender { get; set; }
        public string PaymentMode { get; set; }
        public decimal? Change { get; set; }
        public double? DepositBalance { get; set; }
        public string Remarks { get; set; }
        public string CreditOrganizationName { get; set; }
        public string UserName { get; set; }
        public int ReceiptPrintNo { get; set; }
        public int? PrintCount { get; set; }
        public bool? IsReturned { get; set; }
        public string CurrentFinYear { get; set; }
        public decimal? SubTotal { get; set; }
        public decimal? DiscountAmount { get; set; }
        public decimal? TotalAmount { get; set; }
        public GetInvoiceReceiptPatientDTO Patient { get; set; }
        public IList<GetInvoiceReceiptItemDTO> InvoiceItems { get; set; }
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
    }
}
