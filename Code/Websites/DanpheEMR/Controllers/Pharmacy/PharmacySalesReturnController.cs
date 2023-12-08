using DanpheEMR.Controllers.Billing;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.PharmacyModels;
using DanpheEMR.Services.Dispensary.DTOs.PharmacyInvoiceReceipt;
using DanpheEMR.Services.SSF.DTO;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using System.Transactions;
using DataTable = System.Data.DataTable;

namespace DanpheEMR.Controllers.Pharmacy
{

    public class PharmacySalesReturnController : CommonController
    {
        private readonly PharmacyDbContext _pharmacyDbContext;
        private readonly BillingDbContext _billingDbContext;
        private readonly MasterDbContext _masterDbContext;
        bool realTimeRemoteSyncEnabled = false;
        bool RealTimeSSFClaimBooking = false;
        public PharmacySalesReturnController(IOptions<MyConfiguration> _config) : base(_config)
        {
            realTimeRemoteSyncEnabled = _config.Value.RealTimeRemoteSyncEnabled;
            RealTimeSSFClaimBooking = _config.Value.RealTimeSSFClaimBooking;
            _pharmacyDbContext = new PharmacyDbContext(connString);
            _billingDbContext = new BillingDbContext(connString);
            _masterDbContext = new MasterDbContext(connString);

        }

        [HttpGet]
        [Route("CreditNotes")]
        public IActionResult GetCreditNotes(DateTime fromDate, DateTime toDate, int dispensaryId)
        {
            //else if(reqType=="getsalereturnlist")
            List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@FromDate", fromDate),
                        new SqlParameter("@ToDate", toDate),
                        new SqlParameter("@StoreId", dispensaryId)
                    };

            Func<object> func = () => DALFunctions.GetDataTableFromStoredProc("SP_PHRM_GetReturnInvoicesBetweenDateRange", paramList, _pharmacyDbContext);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("CreditNoteInfo")]
        public IActionResult CreditNoteInfo(int invoiceReturnId)
        {
            //else if (reqType=="getsalereturninvoiceitemsbyid")
            Func<object> func = () => GetCreditNoteInfo(invoiceReturnId);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("CreditNotesInfo")]
        public IActionResult CreditNotesInfo(int invoiceId)
        {
            Func<object> func = () => GetCreditNotesInfo(invoiceId);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("InvoiceAndItemsDetailForReturn")]
        public IActionResult GetReturnFromCustomerDataByInvoiceId(int invoicePrintId, int fiscalYearId, int storeId)
        {
            //else if (reqType == "getReturnFromCustDataModelByInvId")

            Func<object> func = () => GetReturnFromCustomerInvoiceDataByInvoiceId(invoicePrintId, fiscalYearId, storeId);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("ProvisionalReturns")]
        public IActionResult ProvisionalReturns(DateTime fromDate, DateTime toDate, int storeId)
        {
            Func<object> func = () => GetProvisionalReturns(fromDate, toDate, storeId);
            return InvokeHttpGetFunction(func);
        }

        private object GetProvisionalReturns(DateTime FromDate, DateTime ToDate, int StoreId)
        {
            var provisionalReturns = (from provRetItm in _pharmacyDbContext.ProvisionalReturnItems
                                      join pat in _pharmacyDbContext.PHRMPatient on provRetItm.PatientId equals pat.PatientId
                                      where provRetItm.StoreId == StoreId && DbFunctions.TruncateTime(provRetItm.CreatedOn) >= DbFunctions.TruncateTime(FromDate) && DbFunctions.TruncateTime(provRetItm.CreatedOn) <= DbFunctions.TruncateTime(ToDate)
                                      group new { provRetItm, pat } by new
                                      {
                                          pat.PatientCode,
                                          PatientName = pat.ShortName,
                                          provRetItm.CancellationReceiptNo,
                                          provRetItm.VisitType,
                                          provRetItm.ReferenceProvisionalReceiptNo,
                                          pat.PhoneNumber,
                                          pat.DateOfBirth,
                                          pat.Gender,
                                      } into grp
                                      select new
                                      {
                                          grp.Key.PatientCode,
                                          grp.Key.PatientName,
                                          ContactNo = grp.Key.PhoneNumber,
                                          grp.Key.DateOfBirth,
                                          grp.Key.Gender,
                                          grp.Key.ReferenceProvisionalReceiptNo,
                                          grp.Key.CancellationReceiptNo,
                                          SubTotal = grp.Sum(x => x.provRetItm.SubTotal),
                                          DiscountAmount = grp.Sum(x => x.provRetItm.DiscountAmount),
                                          TotalAmount = grp.Sum(x => x.provRetItm.TotalAmount),
                                          grp.Key.VisitType,
                                          LastReturnDate = grp.Max(a => a.provRetItm.CreatedOn)
                                      }).ToList();

            return provisionalReturns;
        }


        [HttpGet]
        [Route("PatientProvisionalReturnItems")]
        public IActionResult PatientProvisionalReturnItems(int patientId)
        {
            //else if (reqType == "provisional-return-duplicate-print")


            var provCanceltxn = ENUM_PHRM_StockTransactionType.ProvisionalCancelItem;
            Func<object> func = () => (from invItm in _pharmacyDbContext.PHRMInvoiceTransactionItems
                                       join stkTxn in _pharmacyDbContext.StockTransactions on invItm.InvoiceItemId equals stkTxn.ReferenceNo
                                       join patient in _pharmacyDbContext.PHRMPatient on invItm.PatientId equals patient.PatientId
                                       where patient.PatientId == patientId && stkTxn.TransactionType == provCanceltxn
                                       select new
                                       {
                                           TotalAmount = (double)stkTxn.SalePrice * stkTxn.InQty,
                                           ItemName = invItm.ItemName,
                                           ReturnQty = stkTxn.InQty,
                                           CreatedOn = stkTxn.CreatedOn
                                       }).ToList().OrderByDescending(b => b.CreatedOn);
            return InvokeHttpGetFunction<object>(func);
        }


        [HttpGet("ItemListForManualReturn")]
        public IActionResult GetItemListForManualReturn()
        {
            Func<object> func = () => _pharmacyDbContext.PHRMItemMaster.Join(_pharmacyDbContext.PHRMGenericModel, item => item.GenericId, generic => generic.GenericId, (item, generic) => new { item.ItemId, item.ItemName, generic.GenericName }).ToList();
            return InvokeHttpGetFunction<object>(func);
        }
        [HttpGet]
        [Route("MultipleInvoiceItemsToReturn")]
        public async Task<IActionResult> GetMultipleInvoiceItemToReturn(string HospitalNo, string PaymentMode, DateTime FromDate, DateTime ToDate, int StoreId, int? SchemeId)
        {
            Func<Task<object>> func = () => GetMultipleInvoiceItemsToReturn(HospitalNo, PaymentMode, FromDate, ToDate, StoreId, SchemeId);
            return await InvokeHttpGetFunctionAsync<object>(func);

        }
        private async Task<object> GetMultipleInvoiceItemsToReturn(string HospitalNo, string PaymentMode, DateTime FromDate, DateTime ToDate, int StoreId, int? SchemeId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@HospitalNo", HospitalNo),
                        new SqlParameter("@PaymentMode", PaymentMode),
                        new SqlParameter("@FromDate", FromDate),
                        new SqlParameter("@ToDate", ToDate),
                        new SqlParameter("@StoreId", StoreId),
                        new SqlParameter("@SchemeId", SchemeId),
                    };
            DataSet invoiceItemDetailsToReturn = await Task.Run(() => DALFunctions.GetDatasetFromStoredProc("SP_PHRM_InvoiceItemDetailsToReturnByHospitalNo", paramList, _pharmacyDbContext));
            DataTable patientInfo = invoiceItemDetailsToReturn.Tables[0];
            DataTable schemeDetails = invoiceItemDetailsToReturn.Tables[1];
            DataTable invoiceItemDetails = invoiceItemDetailsToReturn.Tables[2];

            var InvoiceItemToBeReturnDetails = new
            {
                PatientInfo = PatientViewModel.MapDataTableToSingleObject(patientInfo),
                schemeDetails = schemeDetails,
                InvoiceItems = invoiceItemDetails
            };
            return InvoiceItemToBeReturnDetails;
        }
        [HttpPost]
        [Route("ReturnFromCustomer")]
        public IActionResult PostReturnFromCustomer([FromBody] PHRMInvoiceReturnModel retCustModel)
        {
            Func<object> func = () => PostReturnDataFromCustomers(retCustModel);
            return InvokeHttpGetFunction<object>(func);
        }
        private object PostReturnDataFromCustomers(PHRMInvoiceReturnModel retCustModel)
        {

            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            if (retCustModel == null) throw new ArgumentNullException();
            if (retCustModel.InvoiceReturnItems == null) throw new ArgumentNullException();
            if (retCustModel.InvoiceReturnItems.Count == 0) throw new ArgumentNullException();
            if (retCustModel.InvoiceReturnItems != null && retCustModel.InvoiceReturnItems.Count > 0)
            {
                //Since InvoiceId is not coming correctly from above InvoiceReturnModel, we're taking from first row of InvoiceReturnItemModel.
                //suggestion: Pass proper InvoiceId (PK) of current return model.
                int? invoiceId = retCustModel.InvoiceReturnItems[0].InvoiceId;

                //ramesh: 4th feb'21: added to avoid returning from multiple tab.
                bool isReturnInvalid = CheckIfReturnItemsInvalid(_pharmacyDbContext, invoiceId, retCustModel);
                if (isReturnInvalid)
                {
                    throw new Exception("Invoice Items are already returned.");
                }

                retCustModel.PolicyNo = GetPolicyNo((int)invoiceId, retCustModel.PatientId);

                //flag check all transaction successfully completed or not
                Boolean flag = false;
                flag = PharmacyBL.ReturnFromCustomerTransaction(retCustModel, _pharmacyDbContext, _masterDbContext, currentUser, _billingDbContext);
                if (flag)
                {
                    var invoiceretId = retCustModel.InvoiceReturnItems.Select(a => a.InvoiceId).FirstOrDefault();
                    if (realTimeRemoteSyncEnabled)
                    {
                        if (flag == true)
                        {
                            PHRMInvoiceTransactionModel invoiceReturn = _pharmacyDbContext.PHRMInvoiceTransaction.Where(p => p.InvoiceId == invoiceretId).FirstOrDefault();
                            //Sud:24Dec'18--making parallel thread call (asynchronous) to post to IRD. so that it won't stop the normal execution of logic.
                            ///PharmacyBL.SyncPHRMBillInvoiceToRemoteServer(invoiceReturn, "phrm-invoice-return", phrmdbcontext);
                            Task.Run(() => PharmacyBL.SyncPHRMBillInvoiceToRemoteServer(invoiceReturn, "phrm-invoice-return", _pharmacyDbContext));
                        }
                    }

                    //Send to SSF Server for Real time ClaimBooking.
                    int schemeId = (int)retCustModel.SchemeId;
                    var patientSchemes = _pharmacyDbContext.PatientSchemeMaps.Where(a => a.SchemeId == schemeId && a.PatientId == retCustModel.PatientId).FirstOrDefault();
                    if (patientSchemes != null)
                    {
                        int priceCategoryId = retCustModel.InvoiceReturnItems[0].PriceCategoryId;
                        var priceCategory = _pharmacyDbContext.PriceCategories.Where(a => a.PriceCategoryId == priceCategoryId).FirstOrDefault();
                        if (priceCategory != null && priceCategory.PriceCategoryName.ToLower() == "ssf" && RealTimeSSFClaimBooking)
                        {
                            //making parallel thread call (asynchronous) to post to SSF Server. so that it won't stop the normal BillingFlow.
                            SSFDbContext ssfDbContext = new SSFDbContext(connString);
                            var billObj = new SSF_ClaimBookingBillDetail_DTO()
                            {
                                InvoiceNoFormatted = $"CR-PH{retCustModel.CreditNoteId}",
                                TotalAmount = -(decimal)retCustModel.TotalAmount,//Keep it negative here, SSF takes return as negative values so that they can subtract later with TotalAmount
                                ClaimCode = (long)patientSchemes.LatestClaimCode
                            };

                            SSF_ClaimBookingService_DTO claimBooking = SSF_ClaimBookingService_DTO.GetMappedToBookClaim(billObj, patientSchemes);

                            Task.Run(() => BillingBL.SyncToSSFServer(claimBooking, "pharmacy", ssfDbContext, patientSchemes, currentUser));
                        }
                    }

                    return retCustModel.InvoiceReturnId;
                }
                else
                {
                    throw new Exception("Return invoice Items is null or failed to Save");
                }
            }
            return null;
        }

        private string GetPolicyNo(int InvoiceId, int PatientId)
        {
            int? SchemeId = (from txnItem in _pharmacyDbContext.PHRMInvoiceTransaction
                             where txnItem.InvoiceId == InvoiceId
                             select txnItem.SchemeId).DefaultIfEmpty(0).Max();
            if (SchemeId == null)
            {
                return null;
            }
            var PatientCreditAmountDetails = _billingDbContext.PatientSchemeMaps.Where(pmc => pmc.PatientId == PatientId && pmc.SchemeId == SchemeId).OrderByDescending(pmc => pmc.LatestPatientVisitId).FirstOrDefault();

            return PatientCreditAmountDetails != null ? PatientCreditAmountDetails.PolicyNo : null;
        }
        private bool CheckIfReturnItemsInvalid(PharmacyDbContext phrmdbcontext, int? invoiceId, PHRMInvoiceReturnModel retInvoiceModel)
        {
            bool isInvalidReturn = false;


            var availableItemDetails = (
                from invoice in phrmdbcontext.PHRMInvoiceTransaction.AsNoTracking().Where(i => i.InvoiceId == invoiceId)
                join invItem in phrmdbcontext.PHRMInvoiceTransactionItems.AsNoTracking() on invoice.InvoiceId equals invItem.InvoiceId
                join invRetItem in phrmdbcontext.PHRMInvoiceReturnItemsModel.AsNoTracking() on invItem.InvoiceItemId equals invRetItem.InvoiceItemId into invretitmJ
                from invretLJ in invretitmJ.DefaultIfEmpty()
                group new { invItem, invretLJ } by new
                { invItem.InvoiceId, invItem.InvoiceItemId, invItem.ItemId, invItem.Quantity }
                into grouped
                select new
                {
                    InvoiceId = grouped.Key.InvoiceId,
                    InvoiceItemId = grouped.Key.InvoiceItemId,
                    ItemId = grouped.Key.ItemId,
                    SoldQty = grouped.Key.Quantity,
                    ReturnedQty = grouped.Sum(x => x.invretLJ != null ? x.invretLJ.ReturnedQty : 0),
                    AvailableQty = (grouped.Key.Quantity) - (double)(grouped.Sum(x => x.invretLJ != null ? x.invretLJ.ReturnedQty : 0))
                }).Where(a => a.AvailableQty > 0).ToList();

            //if nothing available then don't allow to return.
            if (availableItemDetails.Count == 0)
            {
                isInvalidReturn = true;
                return isInvalidReturn;
            }

            //Check if any of the Items coming from Client Side is having more ReturnedQty than available Quantity.
            isInvalidReturn = retInvoiceModel.InvoiceReturnItems.Any(ret => availableItemDetails.FirstOrDefault(b => b.InvoiceItemId == ret.InvoiceItemId)?.AvailableQty < (double)ret.ReturnedQty);


            return isInvalidReturn;
        }

        private static object MapDataTableToSinglePriceCategoryModel(System.Data.DataTable data)
        {
            PriceCategoryModel priceCategory = new PriceCategoryModel();
            if (data != null)
            {
                string strData = JsonConvert.SerializeObject(data);
                List<PriceCategoryModel> priceCategoryData = JsonConvert.DeserializeObject<List<PriceCategoryModel>>(strData);
                if (priceCategoryData != null && priceCategoryData.Count > 0)
                {
                    priceCategory = priceCategoryData.First();
                }
            }
            return priceCategory;
        }

        [HttpPost]
        [Route("ManualReturn")]
        public IActionResult PostManualReturns([FromBody] PHRMInvoiceReturnModel salesReturn)
        {
            Func<object> func = () => PostManualReturn(salesReturn);
            return InvokeHttpPostFunction<object>(func);
        }
        [HttpPost]
        [Route("ReturnMultipleInvoiceItemsFromCustomer")]
        public IActionResult ReturnMultipleInvoiceItemsFromCustomer([FromBody] PHRMInvoiceReturnModel invoiceDetailToBeRetrun)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => PharmacyBL.PostReturnMultipleInvoiceFromCustomer(_pharmacyDbContext, invoiceDetailToBeRetrun, currentUser, _billingDbContext);
            return InvokeHttpPostFunction<object>(func);

        }

        [HttpGet]
        [Route("ReceiptDetailToPrintMultipleInvoiceReturn")]
        public IActionResult ReceiptDetailToPrintMultipleInvoiceItemReturn(int InvoiceReturnId)
        {
            Func<object> func = () => GetMultipleInvoiceReturnDetailToPrint(InvoiceReturnId);
            return InvokeHttpGetFunction<object>(func);
        }

        private object GetMultipleInvoiceReturnDetailToPrint(int InvoiceReturnId)
        {
            var invoiceItemReturnDetailToPrint = (from invitmret in _pharmacyDbContext.PHRMInvoiceReturnItemsModel.Where(invitmret => invitmret.InvoiceReturnId == InvoiceReturnId)
                                                  join itm in _pharmacyDbContext.PHRMItemMaster on invitmret.ItemId equals itm.ItemId
                                                  join gn in _pharmacyDbContext.PHRMGenericModel on itm.GenericId equals gn.GenericId
                                                  join stktxn in _pharmacyDbContext.StockTransactions.Where(s => s.TransactionType == ENUM_PHRM_StockTransactionType.SaleReturnedItem) on invitmret.InvoiceReturnItemId equals stktxn.ReferenceNo
                                                  select new
                                                  {
                                                      InvoiceReturnId = invitmret.InvoiceReturnId,
                                                      ItemName = itm.ItemName,
                                                      GenericName = gn.GenericName,
                                                      BatchNo = invitmret.BatchNo,
                                                      ExpiryDate = stktxn.ExpiryDate,
                                                      ReturnedQty = invitmret.ReturnedQty,
                                                      SalePrice = invitmret.SalePrice,
                                                      Price = invitmret.Price,
                                                      SubTotal = invitmret.SubTotal,
                                                      DiscountPercentagae = invitmret.DiscountPercentage,
                                                      TotalDisAmt = invitmret.DiscountAmount,
                                                      VATPercantage = invitmret.VATPercentage,
                                                      TotalAmount = invitmret.TotalAmount,
                                                      RackNo = (from rackItem in _pharmacyDbContext.PHRMRackItem.Where(ri => ri.ItemId == itm.ItemId && ri.StoreId == invitmret.StoreId)
                                                                join rack in _pharmacyDbContext.PHRMRack on rackItem.RackId equals rack.RackId
                                                                select rack.RackNo).FirstOrDefault()
                                                  }).ToList();

            var invoiceReturnDetailToPrint = (from inv in _pharmacyDbContext.PHRMInvoiceReturnModel.Where(inv => inv.InvoiceReturnId == InvoiceReturnId)
                                              select new
                                              {
                                                  CRNNo = inv.CreditNoteId,
                                                  SubTotal = inv.SubTotal,
                                                  DiscountAmount = inv.DiscountAmount,
                                                  TaxableAmount = inv.SubTotal - inv.DiscountAmount,
                                                  NonTaxableAmount = inv.SubTotal,
                                                  VATAmount = inv.VATAmount,
                                                  TotalAmount = inv.TotalAmount,
                                                  PaidAmount = inv.PaidAmount,
                                                  CashAmount = inv.ReturnCashAmount,
                                                  CreditAmount = inv.ReturnCreditAmount,
                                                  IsReturned = true,
                                                  billingUser = _pharmacyDbContext.Users.Where(e => e.EmployeeId == inv.CreatedBy).FirstOrDefault().UserName,
                                                  CurrentFinYear = _pharmacyDbContext.PharmacyFiscalYears.Where(fy => fy.FiscalYearId == inv.FiscalYearId).FirstOrDefault().FiscalYearName,
                                                  Remarks = inv.Remarks,
                                                  ReceiptDate = inv.CreatedOn,
                                                  ReferenceInvoiceNo = inv.ReferenceInvoiceNo,
                                                  Patient = _pharmacyDbContext.PHRMPatient.Join(_pharmacyDbContext.CountrySubDivision,
                                                  pat => pat.CountrySubDivisionId,
                                                  sub => sub.CountrySubDivisionId,
                                                  (pat, sub) => new
                                                  {
                                                      PatientId = pat.PatientId,
                                                      ShortName = pat.ShortName,
                                                      Address = pat.Address,
                                                      DateOfBirth = pat.DateOfBirth,
                                                      Gender = pat.Gender,
                                                      PhoneNo = pat.PhoneNumber,
                                                      PANNumber = pat.PANNumber,
                                                      PatientCode = pat.PatientCode,
                                                      CountrySubDivisionName = sub.CountrySubDivisionName
                                                  }).Where(p => p.PatientId == inv.PatientId).FirstOrDefault()
                                              }).FirstOrDefault();
            var multipleInvoiceItemReturnData = new
            {
                ReturnItemDetail = invoiceItemReturnDetailToPrint,
                ReturnDetail = invoiceReturnDetailToPrint
            };

            return multipleInvoiceItemReturnData;
        }

        private object PostManualReturn(PHRMInvoiceReturnModel salesReturn)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            if (salesReturn == null) throw new ArgumentNullException();
            if (salesReturn.InvoiceReturnItems == null) throw new ArgumentNullException();
            if (salesReturn.InvoiceReturnItems.Count == 0) throw new ArgumentNullException();
            int InvoiceReturnId = PharmacyBL.ManualReturnTransaction(salesReturn, _pharmacyDbContext, currentUser);
            return InvoiceReturnId;
        }
        private object GetReturnFromCustomerInvoiceDataByInvoiceId(int invoicePrintId, int fiscalYearId, int storeId)
        {
            using (new TransactionScope(TransactionScopeOption.Required, new TransactionOptions { IsolationLevel = System.Transactions.IsolationLevel.ReadUncommitted }))
            {
                var invoiceTxnDetails = (from invoice in _pharmacyDbContext.PHRMInvoiceTransaction.AsNoTracking().Where(i => i.InvoicePrintId == invoicePrintId && i.FiscalYearId == fiscalYearId && i.StoreId == storeId)
                                         join fs in _pharmacyDbContext.PharmacyFiscalYears on invoice.FiscalYearId equals fs.FiscalYearId
                                         join user in _pharmacyDbContext.Employees on invoice.CreatedBy equals user.EmployeeId
                                         join pat in _pharmacyDbContext.PHRMPatient on invoice.PatientId equals pat.PatientId
                                         join countrysub in _pharmacyDbContext.CountrySubDivision on pat.CountrySubDivisionId equals countrysub.CountrySubDivisionId
                                         join sett in _pharmacyDbContext.PHRMSettlements on invoice.SettlementId equals sett.SettlementId into dt
                                         from subSett in dt.DefaultIfEmpty()
                                         select new
                                         {
                                             PKInvoiceId = invoice.InvoiceId,
                                             InvoiceId = invoice.InvoicePrintId,
                                             StoreId = invoice.StoreId,
                                             InvoiceDate = invoice.CreateOn,
                                             PatientName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                             PatientType = (pat.IsOutdoorPat == true) ? "Outdoor" : "Indoor",
                                             NSHINo = pat.Ins_NshiNumber,
                                             ClaimCode = invoice.ClaimCode,
                                             InsuranceBalance = (pat.Ins_HasInsurance == true) ? pat.Ins_InsuranceBalance : 0,
                                             CreditAmount = invoice.CreditAmount.ToString(),
                                             InvoiceBillStatus = invoice.BilStatus,
                                             InvoiceTotalMoney = invoice.PaidAmount.ToString(),
                                             IsReturn = invoice.IsReturn,
                                             Tender = invoice.Tender,
                                             SubTotal = invoice.SubTotal,
                                             Change = invoice.Change,
                                             Remarks = invoice.Remark,
                                             PaidAmount = invoice.PaidAmount,
                                             FiscalYear = fs.FiscalYearName,
                                             ReceiptPrintNo = invoice.InvoicePrintId,
                                             DiscountAmount = invoice.DiscountAmount,
                                             DiscountPercentage = invoice.DiscountPer,
                                             BillingUser = user.FirstName,
                                             CashDiscount = subSett.DiscountAmount,
                                             SettlementId = invoice.SettlementId,
                                             OrganizationId = invoice.OrganizationId,
                                             PatientVisitId = invoice.PatientVisitId,
                                             PaymentMode = invoice.PaymentMode,
                                             SchemeId = invoice.SchemeId,
                                             VisitType = invoice.VisitType
                                         }).FirstOrDefault();

                var patient = (from invoice in _pharmacyDbContext.PHRMInvoiceTransaction.AsNoTracking().Where(i => i.InvoiceId == invoiceTxnDetails.PKInvoiceId)
                               join pat in _pharmacyDbContext.PHRMPatient on invoice.PatientId equals pat.PatientId
                               join countrysub in _pharmacyDbContext.CountrySubDivision on pat.CountrySubDivisionId equals countrysub.CountrySubDivisionId
                               select new
                               {
                                   pat.PatientId,
                                   pat.FirstName,
                                   pat.MiddleName,
                                   pat.LastName,
                                   ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                   pat.PhoneNumber,
                                   countrysub.CountrySubDivisionName,
                                   pat.Age,
                                   pat.PANNumber,
                                   pat.Address,
                                   pat.DateOfBirth,
                                   pat.Gender,
                                   pat.PatientCode
                               }).FirstOrDefault();

                var invoiceItemtxnDetails = (from invItem in _pharmacyDbContext.PHRMInvoiceTransactionItems
                                             join invRetItem in _pharmacyDbContext.PHRMInvoiceReturnItemsModel on invItem.InvoiceItemId equals invRetItem.InvoiceItemId into invretitmJ
                                             from invretLJ in invretitmJ.DefaultIfEmpty()
                                             join item in _pharmacyDbContext.PHRMItemMaster on invItem.ItemId equals item.ItemId
                                             join generic in _pharmacyDbContext.PHRMGenericModel on item.GenericId equals generic.GenericId
                                             where invItem.InvoiceId == invoiceTxnDetails.PKInvoiceId
                                             group new { invItem, item, generic, invretLJ } by new
                                             {
                                                 invItem.InvoiceItemId,
                                                 invItem.InvoiceId,
                                                 invItem.BatchNo,
                                                 invItem.ExpiryDate,
                                                 invItem.SalePrice,
                                                 invItem.Quantity,
                                                 invItem.Price,
                                                 invItem.SubTotal,
                                                 invItem.VATPercentage,
                                                 invItem.VATAmount,
                                                 invItem.DiscountPercentage,
                                                 invItem.TotalDisAmt,
                                                 invItem.TotalAmount,
                                                 invItem.CounterId,
                                                 invItem.CreatedBy,
                                                 invItem.CreatedOn,
                                                 item.ItemName,
                                                 item.ItemId,
                                                 generic.GenericName,
                                                 invItem.PriceCategoryId
                                             } into grouped
                                             select new
                                             {
                                                 InvoiceId = grouped.Key.InvoiceId,
                                                 InvoiceItemId = grouped.Key.InvoiceItemId,
                                                 BatchNo = grouped.Key.BatchNo,
                                                 ExpiryDate = grouped.Key.ExpiryDate,
                                                 Quantity = grouped.Key.Quantity,
                                                 SoldQty = grouped.Key.Quantity,
                                                 ReturnedQty = grouped.Sum(x => x.invretLJ != null ? x.invretLJ.ReturnedQty : 0),
                                                 SalePrice = grouped.Key.SalePrice,
                                                 Price = grouped.Key.Price,
                                                 SubTotal = grouped.Key.SubTotal,
                                                 VATPercentage = grouped.Key.VATPercentage,
                                                 VATAmount = grouped.Key.VATAmount,
                                                 DiscountPercentage = grouped.Key.DiscountPercentage,
                                                 DiscountAmount = grouped.Key.TotalDisAmt,
                                                 TotalAmount = grouped.Key.TotalAmount,
                                                 ItemId = grouped.Key.ItemId,
                                                 ItemName = grouped.Key.ItemName,
                                                 GenericName = grouped.Key.GenericName,
                                                 CounterId = grouped.Key.CounterId,
                                                 CreatedBy = grouped.Key.CreatedBy,
                                                 CreatedOn = grouped.Key.CreatedOn,
                                                 PriceCategoryId = grouped.Key.PriceCategoryId,
                                                 RackNo = (from itemrack in _pharmacyDbContext.PHRMRackItem.Where(ri => ri.ItemId == grouped.Key.ItemId && ri.StoreId == invoiceTxnDetails.StoreId)
                                                           join rack in _pharmacyDbContext.PHRMRack on itemrack.RackId equals rack.RackId
                                                           select rack.RackNo).FirstOrDefault()
                                             }).Where(a => a.Quantity > (double)a.ReturnedQty).ToList();

                int? PriceCategoryId = invoiceItemtxnDetails != null && invoiceItemtxnDetails.Count() > 0 ? invoiceItemtxnDetails.FirstOrDefault().PriceCategoryId : null;

                var SchemeDetails = _billingDbContext.BillingSchemes.Where(p => p.SchemeId == invoiceTxnDetails.SchemeId && p.DefaultPriceCategoryId == PriceCategoryId).FirstOrDefault();
                return new { invoiceHeader = invoiceTxnDetails, patient = patient, invoiceItems = invoiceItemtxnDetails, schemeDetails = SchemeDetails };
            }
        }

        private object GetCreditNoteInfo(int invoiceReturnId)
        {
            var returnInvoiceInfo = (from invret in _pharmacyDbContext.PHRMInvoiceReturnModel.Where(i => i.InvoiceReturnId == invoiceReturnId)
                                     join store in _pharmacyDbContext.PHRMStore on invret.StoreId equals store.StoreId
                                     join pat in _pharmacyDbContext.PHRMPatient on invret.PatientId equals pat.PatientId
                                     join countrySubDiv in _pharmacyDbContext.CountrySubDivision on pat.CountrySubDivisionId equals countrySubDiv.CountrySubDivisionId
                                     join fy in _pharmacyDbContext.PharmacyFiscalYears on invret.FiscalYearId equals fy.FiscalYearId
                                     join createdByUser in _pharmacyDbContext.Users on invret.CreatedBy equals createdByUser.EmployeeId
                                     join inv in _pharmacyDbContext.PHRMInvoiceTransaction on invret.InvoiceId equals inv.InvoiceId into invoiceDetailGroup
                                     from invoice in invoiceDetailGroup.DefaultIfEmpty()
                                     join creditOrg in _pharmacyDbContext.billingCreditOrganizations on invret.OrganizationId equals creditOrg.OrganizationId into credOrgGroup
                                     from creditOrganization in credOrgGroup.DefaultIfEmpty()
                                     select new PharmacyInvoiceReceipt_DTO

                                     {
                                         InvoiceReturnId = invret.InvoiceReturnId,
                                         PatientVisitId = invoice != null ? invoice.PatientVisitId : null,
                                         PrintCount = invret.PrintCount,
                                         CurrentFiscalYearName = fy.FiscalYearName,
                                         ReceiptDate = invret.CreatedOn,
                                         CreditNoteNo = invret.CreditNoteId,
                                         ReferenceInvoiceNo = invret.ReferenceInvoiceNo ==null? invoice.InvoicePrintId.ToString() : invret.ReferenceInvoiceNo,
                                         ReferenceInvoiceDate = invret.ReferenceInvoiceNo == null ? invoice.CreateOn : (DateTime?)null,
                                         ClaimCode = invret.ClaimCode,
                                         PaymentMode = invret.PaymentMode,
                                         SubTotal = invret.SubTotal,
                                         DiscountAmount = invret.DiscountAmount,
                                         VATAmount = invret.VATAmount,
                                         CashAmount = invret.ReturnCashAmount,
                                         CreditAmount = invret.ReturnCreditAmount,
                                         TaxableAmount = invret.SubTotal - invret.DiscountAmount,
                                         NonTaxableAmount = invret.DiscountAmount,
                                         TotalAmount = invret.TotalAmount,
                                         Change = invret.Change,
                                         Tender = invret.Tender,
                                         CreditOrganizationName = creditOrganization != null ? creditOrganization.OrganizationName : "",
                                         Remarks = invret.Remarks,
                                         BillingUser = createdByUser.UserName,
                                         IsReturned = true,
                                         StoreId = invret.StoreId,
                                         StoreName = store.Name,
                                         PatientInfo = new PatientInfo_DTO
                                         {
                                             PatientId = invret.PatientId,
                                             PatientCode = pat.PatientCode,
                                             ShortName = pat.ShortName,
                                             Address = pat.Address,
                                             CountrySubDivisionName = countrySubDiv.CountrySubDivisionName,
                                             Gender = pat.Gender,
                                             Age = pat.Age,
                                             DateOfBirth = pat.DateOfBirth,
                                             PhoneNumber = pat.PhoneNumber,
                                             PANNumber = pat.PANNumber
                                         }
                                     }).FirstOrDefault();

            returnInvoiceInfo.InvoiceItems = (from invretitm in _pharmacyDbContext.PHRMInvoiceReturnItemsModel.Where(I => I.InvoiceReturnId == invoiceReturnId && I.Quantity > 0)
                                              join itm in _pharmacyDbContext.PHRMItemMaster on invretitm.ItemId equals itm.ItemId
                                              join G in _pharmacyDbContext.PHRMGenericModel on itm.GenericId equals G.GenericId
                                              select new PharmacyInvoiceReceiptItem_DTO
                                              {
                                                  InvoiceItemId = invretitm.InvoiceItemId,
                                                  ItemId = invretitm.ItemId,
                                                  ReturnedQty = invretitm.ReturnedQty,
                                                  ItemName = itm.ItemName,
                                                  BatchNo = invretitm.BatchNo,
                                                  ExpiryDate = invretitm.ExpiryDate,
                                                  SalePrice = invretitm.SalePrice,
                                                  SubTotal = invretitm.SubTotal,
                                                  DiscountAmount = invretitm.DiscountAmount,
                                                  TotalAmount = invretitm.TotalAmount,
                                                  GenericName = (G != null) ? G.GenericName : "N/A",
                                                  RackNo = (from itemrack in _pharmacyDbContext.PHRMRackItem.Where(ri => ri.ItemId == invretitm.ItemId && ri.StoreId == returnInvoiceInfo.StoreId)
                                                            join rack in _pharmacyDbContext.PHRMRack on itemrack.RackId equals rack.RackId
                                                            select rack.RackNo).FirstOrDefault()
                                              }).OrderBy(i => i.InvoiceItemId).ToList();
            if (returnInvoiceInfo.PatientVisitId != null)
            {
                var patSchemeMapDetails = _pharmacyDbContext.PatientSchemeMaps.Where(pc => pc.PatientId == returnInvoiceInfo.PatientInfo.PatientId && pc.LatestPatientVisitId == returnInvoiceInfo.PatientVisitId).FirstOrDefault();

                if (patSchemeMapDetails != null)
                    returnInvoiceInfo.PolicyNo = patSchemeMapDetails.PolicyNo;
            }
            return returnInvoiceInfo;
        }

        private object GetCreditNotesInfo(int invoiceId)
        {
            List<dynamic> CreditNotesInfo = new List<dynamic>();
            var CreditNoteIdList = (from invret in _pharmacyDbContext.PHRMInvoiceReturnModel
                                    where invret.InvoiceId == invoiceId
                                    select new
                                    {
                                        CreditNoteID = invret.CreditNoteId,
                                        InvoiceId = invret.InvoiceId
                                    }).ToList();

            CreditNoteIdList.ForEach(x =>
            {
                var saleretInvoiceItemsByInvoiceretId = (from invret in _pharmacyDbContext.PHRMInvoiceReturnModel
                                                         join invretitm in _pharmacyDbContext.PHRMInvoiceReturnItemsModel on invret.InvoiceReturnId equals invretitm.InvoiceReturnId
                                                         join invitm in _pharmacyDbContext.PHRMInvoiceTransactionItems on invretitm.InvoiceItemId equals invitm.InvoiceItemId into invitmG
                                                         from invitmLJ in invitmG.DefaultIfEmpty()
                                                         join itm in _pharmacyDbContext.PHRMItemMaster on invretitm.ItemId equals itm.ItemId
                                                         join gen in _pharmacyDbContext.PHRMGenericModel on itm.GenericId equals gen.GenericId
                                                         join fy in _pharmacyDbContext.PharmacyFiscalYears on invret.FiscalYearId equals fy.FiscalYearId
                                                         where invret.InvoiceId == x.InvoiceId && invret.CreditNoteId == x.CreditNoteID
                                                         select new
                                                         {
                                                             InvoiceId = invret.InvoiceId,
                                                             InvoiceReturnId = invret.InvoiceReturnId,
                                                             invret.CounterId,
                                                             InvoiceReturnItemId = invretitm.InvoiceReturnItemId,
                                                             ExpiryDate = invitmLJ != null ? invitmLJ.ExpiryDate : null,
                                                             ItemId = invretitm.ItemId,
                                                             GenericName = gen.GenericName,
                                                             ItemName = invitmLJ == null ? itm.ItemName : invitmLJ.ItemName,
                                                             BatchNo = invretitm.BatchNo,
                                                             ReturnedQty = invretitm.ReturnedQty,
                                                             Price = invretitm.Price,
                                                             SalePrice = invretitm.SalePrice,
                                                             SubTotal = invretitm.SubTotal,
                                                             VATPercentage = invretitm.VATPercentage,
                                                             DiscountPercentage = invretitm.DiscountPercentage,
                                                             DiscountAmount = invretitm.DiscountAmount,
                                                             TotalAmount = invretitm.TotalAmount,
                                                             Remark = invret.Remarks,
                                                             CreditNoteId = invret.CreditNoteId,
                                                             CreatedBy = invretitm.CreatedBy,
                                                             CreatedOn = invretitm.CreatedOn,
                                                             PatientId = invret.PatientId,
                                                             FiscalYearName = fy.FiscalYearName,
                                                             Remarks = invret.Remarks,
                                                             RackNo = (from itemrack in _pharmacyDbContext.PHRMRackItem.Where(ri => ri.ItemId == invretitm.ItemId && ri.StoreId == invretitm.StoreId)
                                                                       join rack in _pharmacyDbContext.PHRMRack on itemrack.RackId equals rack.RackId
                                                                       select rack.RackNo).FirstOrDefault()
                                                         }).ToList();


                if (saleretInvoiceItemsByInvoiceretId == null || saleretInvoiceItemsByInvoiceretId.Count == 0)
                {
                    throw new Exception("No returned items were found.");
                }
                int selectedPatientId = saleretInvoiceItemsByInvoiceretId.FirstOrDefault().PatientId;
                var patientData = (from pat in _pharmacyDbContext.PHRMPatient
                                   join countryd in _pharmacyDbContext.CountrySubDivision on pat.CountrySubDivisionId equals countryd.CountrySubDivisionId
                                   where pat.PatientId == selectedPatientId
                                   select new
                                   {
                                       pat.PatientId,
                                       pat.FirstName,
                                       pat.MiddleName,
                                       pat.LastName,
                                       ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                       pat.PhoneNumber,
                                       countryd.CountrySubDivisionName,
                                       pat.Age,
                                       pat.PANNumber,
                                       pat.Address,
                                       pat.DateOfBirth,
                                       pat.Gender,
                                       pat.PatientCode
                                   }).FirstOrDefault();
                int selectedInvoiceId = 0;
                var invoiceDetails = new PHRMInvoiceTransactionModel();
                if (saleretInvoiceItemsByInvoiceretId.FirstOrDefault().InvoiceId != null)
                {
                    selectedInvoiceId = saleretInvoiceItemsByInvoiceretId.FirstOrDefault().InvoiceId.Value;
                    invoiceDetails = _pharmacyDbContext.PHRMInvoiceTransaction.Where(id => id.InvoiceId == selectedInvoiceId).FirstOrDefault();
                }
                var ReferenceInvoiceNo = "";
                decimal CashAmount = 0;
                decimal CreditAmount = 0;
                var invretdetail = _pharmacyDbContext.PHRMInvoiceReturnModel.Where(ret => ret.InvoiceId == invoiceId).FirstOrDefault();
                if (invretdetail != null)
                {
                    ReferenceInvoiceNo = invretdetail.ReferenceInvoiceNo;
                    CashAmount = invretdetail.ReturnCashAmount;
                    CreditAmount = invretdetail.ReturnCreditAmount;
                }

                var invoiceReturnDetails = new { ReferenceInvoiceNo, CashAmount, CreditAmount };

                var retDetails = new { invoiceData = invoiceDetails, invoiceRetData = saleretInvoiceItemsByInvoiceretId, patientData = patientData, invoiceReturnDetails = invoiceReturnDetails };
                CreditNotesInfo.Add(retDetails);
            });
            return CreditNotesInfo;
        }
    }
}

