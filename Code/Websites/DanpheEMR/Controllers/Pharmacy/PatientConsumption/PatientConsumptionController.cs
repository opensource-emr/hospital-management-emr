using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.MasterModels;
using DanpheEMR.ServerModel.MedicareModels;
using DanpheEMR.ServerModel.PatientModels;
using DanpheEMR.ServerModel.PharmacyModels;
using DanpheEMR.ServerModel.PharmacyModels.Patient_Consumption;
using DanpheEMR.ServerModel.SSFModels.ClaimResponse;
using DanpheEMR.Services.Dispensary.DTOs.PharmacyConsumption;
using DanpheEMR.Services.Dispensary.DTOs.PharmacyPatientConsumption;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Controllers.Pharmacy.PatientConsumption
{
    public class PatientConsumptionController : CommonController
    {
        private readonly PatientConsumptionDbContext _patientConsumptionDbContext;
        private readonly PharmacyDbContext _pharmacyDbContext;
        private readonly bool _realTimeRemoteSyncEnabled;

        public PatientConsumptionController(IOptions<MyConfiguration> _config) : base(_config)
        {
            _patientConsumptionDbContext = new PatientConsumptionDbContext(connString);
            _realTimeRemoteSyncEnabled = _config.Value.RealTimeRemoteSyncEnabled;
        }

        [HttpPost]
        [Route("PharmacyPatientConsumption")]
        public IActionResult PostPatientConsumptionDetail([FromBody] PatientConsumptionDTO patientConsumption)
        {
            Func<object> func = () => PostPatientConsumption(patientConsumption);
            return InvokeHttpGetFunction<object>(func);
        }
        private object PostPatientConsumption(PatientConsumptionDTO patientConsumption)
        {
            PatientConsumptionModel patientConsumptionModel = JsonConvert.DeserializeObject<PatientConsumptionModel>(JsonConvert.SerializeObject(patientConsumption));
            using (var dbTxn = _patientConsumptionDbContext.Database.BeginTransaction())
            {
                try
                {
                    SavePatientConsumption(patientConsumptionModel);
                    SaveStockTransactionAndUpdateStock(patientConsumptionModel);
                    dbTxn.Commit();
                    return patientConsumptionModel.PatientConsumptionId;
                }
                catch (Exception ex)
                {
                    dbTxn.Rollback();
                    throw new Exception(ex.Message.ToString());
                }
            }
        }

        private void SaveStockTransactionAndUpdateStock(PatientConsumptionModel patientConsumptionModel)
        {
            patientConsumptionModel.PatientConsumptionItems.ForEach(consumpItem =>
            {
                var dispensaryStocks = _patientConsumptionDbContext.StoreStocks.Include("StockMaster")
                                                                    .Where(s => s.StoreId == consumpItem.StoreId &&
                                                                            s.ItemId == consumpItem.ItemId &&
                                                                            s.AvailableQuantity > 0 &&
                                                                            s.StockMaster.SalePrice == consumpItem.NormalSalePrice &&
                                                                            s.StockMaster.BatchNo == consumpItem.BatchNo &&
                                                                            s.StockMaster.ExpiryDate == consumpItem.ExpiryDate &&
                                                                            s.IsActive == true)
                                                                    .ToList();

                var totalRemainingQty = consumpItem.Quantity;
                foreach (var dispensaryStock in dispensaryStocks)
                {
                    var dispensaryStockTxn = new PHRMStockTransactionModel(
                                storeStock: dispensaryStock,
                                transactionType: ENUM_PHRM_StockTransactionType.PHRMPatientConsumption,
                                transactionDate: patientConsumptionModel.CreatedOn,
                                referenceNo: consumpItem.PatientConsumptionItemId,
                                createdBy: patientConsumptionModel.CreatedBy,
                                createdOn: patientConsumptionModel.CreatedOn,
                                fiscalYearId: (int)patientConsumptionModel.FiscalYearId
                                );

                    if ((decimal)dispensaryStock.AvailableQuantity < totalRemainingQty)
                    {
                        totalRemainingQty -= (decimal)dispensaryStock.AvailableQuantity;
                        dispensaryStockTxn.SetInOutQuantity(inQty: 0, outQty: dispensaryStock.AvailableQuantity);
                        dispensaryStock.UpdateAvailableQuantity(newQty: 0);
                    }
                    else
                    {
                        dispensaryStock.UpdateAvailableQuantity(newQty: dispensaryStock.AvailableQuantity - (double)totalRemainingQty);
                        dispensaryStockTxn.SetInOutQuantity(inQty: 0, outQty: (double)totalRemainingQty);
                        totalRemainingQty = 0;
                    }
                    _patientConsumptionDbContext.StockTransactions.Add(dispensaryStockTxn);
                    _patientConsumptionDbContext.SaveChanges();

                    if (totalRemainingQty == 0)
                    {
                        break; //it takes out of the foreach loop. line : foreach (var stock in stockList)
                    }
                }

            });
        }

        private void SavePatientConsumption(PatientConsumptionModel patientConsumptionModel)
        {
            var currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            patientConsumptionModel.CreatedOn = DateTime.Now;
            patientConsumptionModel.CreatedBy = currentUser.EmployeeId;
            patientConsumptionModel.IsActive = true;
            patientConsumptionModel.FiscalYearId = GetFiscalYearId();
            patientConsumptionModel.ConsumptionReceiptNo = GetConsumptionNumber();
            patientConsumptionModel.PatientConsumptionItems.ForEach(item =>
            {
                item.CreatedOn = DateTime.Now;
                item.CreatedBy = currentUser.EmployeeId;
                item.IsActive = true;
                item.StoreId = patientConsumptionModel.StoreId;
                item.SchemeId = (int)patientConsumptionModel.SchemeId;
            });
            _patientConsumptionDbContext.PatientConsumption.Add(patientConsumptionModel);
            _patientConsumptionDbContext.SaveChanges();
        }
        private int GetFiscalYearId()
        {
            DateTime currentDate = DateTime.Now.Date;
            int FiscalYearId = _patientConsumptionDbContext.PharmacyFiscalYears.Where(fsc => fsc.StartDate <= currentDate && fsc.EndDate >= currentDate).FirstOrDefault().FiscalYearId;
            return FiscalYearId;
        }

        private PharmacyFiscalYear GetFiscalYear(PatientConsumptionDbContext patientConsumptionDbContext)
        {
            DateTime currentDate = DateTime.Now.Date;
            return patientConsumptionDbContext.PharmacyFiscalYears.Where(fsc => fsc.StartDate <= currentDate && fsc.EndDate >= currentDate).FirstOrDefault();
        }
        [HttpGet]
        [Route("PatientConsumptions")]
        public IActionResult GetPatientConsumptions()
        {
            Func<object> func = () => GetPatientConsumptionList();
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetPatientConsumptionList()
        {
            var patConsumptionList = (from con in _patientConsumptionDbContext.PatientConsumption.Where(a => a.BillingStatus == ENUM_BillingStatus.unpaid)
                                      join conitm in _patientConsumptionDbContext.PatientConsumptionItem.Where(pci => pci.IsFinalize == false) on con.PatientConsumptionId equals conitm.PatientConsumptionId
                                      join conretitm in (from patconret in _patientConsumptionDbContext.PatientConsumptionReturnItem
                                                         group patconret by patconret.PatientConsumptionItemId
                                                         into patConsumptionReturnGroup
                                                         select new
                                                         {
                                                             PatientConsumptionItemId = patConsumptionReturnGroup.Key,
                                                             TotalAmount = patConsumptionReturnGroup.Sum(a => a.TotalAmount)
                                                         }) on conitm.PatientConsumptionItemId equals conretitm.PatientConsumptionItemId into conretitmGroup
                                      from conretitm in conretitmGroup.DefaultIfEmpty()
                                      join pat in _patientConsumptionDbContext.Patient on conitm.PatientId equals pat.PatientId
                                      join patV in _patientConsumptionDbContext.PatientVisits on conitm.PatientVisitId equals patV.PatientVisitId

                                      group new { conitm, conretitm } by new
                                      {
                                          pat.PatientId,
                                          pat.PatientCode,
                                          pat.ShortName,
                                          pat.Age,
                                          pat.Gender,
                                          pat.PhoneNumber,
                                          pat.Address,
                                          patV.VisitCode,
                                          patV.PatientVisitId
                                      } into g
                                      select new
                                      {
                                          PatientId = g.Key.PatientId,
                                          HospitalNo = g.Key.PatientCode,
                                          PatientName = g.Key.ShortName,
                                          Age = g.Key.Age,
                                          Sex = g.Key.Gender,
                                          ContactNo = g.Key.PhoneNumber,
                                          Address = g.Key.Address,
                                          IpNo = g.Key.VisitCode,
                                          PatientVisitId = g.Key.PatientVisitId,
                                          TotalAmount = Math.Floor(g.Sum(x => x.conitm.TotalAmount - (x.conretitm != null ? x.conretitm.TotalAmount : 0))),
                                          LastConsumptionDate = g.Max(x => x.conitm.CreatedOn)
                                      }).Where(a => a.TotalAmount > 0).OrderByDescending(a => a.LastConsumptionDate).ToList();


            return patConsumptionList;
        }

        [HttpPost]
        [Route("FinalInvoiceForConsumption")]
        public IActionResult PostFinalInvoiceForConsumption([FromBody] PatientConsumptionDTO invoiceObjFromClient)
        {
            Func<object> func = () => PostFinalInvoiceForConsumptionItem(invoiceObjFromClient);
            return InvokeHttpGetFunction<object>(func);
        }
        private object PostFinalInvoiceForConsumptionItem(PatientConsumptionDTO consumptionInvoiceObj)
        {
            using (var dbTxn = _patientConsumptionDbContext.Database.BeginTransaction())
            {
                try
                {
                    List<PHRMInvoiceTransactionItemsModel> invoiceitems = new List<PHRMInvoiceTransactionItemsModel>();
                    PHRMInvoiceTransactionModel invoiceTxn = new PHRMInvoiceTransactionModel();
                    List<PHRMEmployeeCashTransaction> employeeCashTransactions = new List<PHRMEmployeeCashTransaction>();
                    var currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
                    int currFiscalYearId = this.GetFiscalYearId();

                    ExtractConsumptionItemsFromConsumptionObject(consumptionInvoiceObj, currentUser, invoiceitems, employeeCashTransactions, currFiscalYearId);

                    SaveInvoice(consumptionInvoiceObj, currentUser, out invoiceTxn, currFiscalYearId);

                    if (invoiceitems == null || invoiceitems.Count == 0) throw new ArgumentException("No Items to update.");

                    SaveInvoiceItems(invoiceitems, invoiceTxn.InvoiceId);

                    if (consumptionInvoiceObj.DepositDeductAmount > 0)
                    {
                        HandleDeposit(consumptionInvoiceObj, invoiceTxn, currentUser, currFiscalYearId, employeeCashTransactions);
                    }

                    if (invoiceTxn.PaymentMode == ENUM_BillPaymentMode.credit)
                    {
                        SaveCreditBillStatus(invoiceTxn, currentUser);
                    }

                    if (employeeCashTransactions.Count() > 0)
                    {
                        SaveEmployeeCashTransaction(invoiceTxn, currentUser, employeeCashTransactions);
                    }

                    if (invoiceTxn.SchemeId > 0)
                    {
                        UpdateSchemeCreditLimit(consumptionInvoiceObj, _patientConsumptionDbContext, consumptionInvoiceObj.SchemeId);
                    }

                    UpdateStockTransactions(invoiceitems, currentUser, currFiscalYearId);


                    List<int?> PatientConsumptionItemIds = invoiceitems.Select(a => a.PatientConsumptionItemId).ToList();
                    List<int?> PatientConsumptionIds = invoiceitems.Select(a => a.PatientConsumptionId).ToList();

                    UpdatePatientConsumptionItemFinalizeFlag(PatientConsumptionItemIds);

                    UpdatePatientConsumptionBillStatus(invoiceTxn, PatientConsumptionIds);

                    if (_realTimeRemoteSyncEnabled)
                    {
                        invoiceTxn = SyncPHRMInvoiceToRemoteServer(invoiceTxn);
                    }
                    dbTxn.Commit();


                    return invoiceTxn.InvoiceId;
                }

                catch (Exception ex)
                {
                    dbTxn.Rollback();
                    throw new Exception("Invoice details is null or failed to Save. Exception Detail: " + ex.Message.ToString());
                }
            }

        }

        private static void UpdateSchemeCreditLimit(PatientConsumptionDTO consumptioData, PatientConsumptionDbContext patientConsumptionDbContext, int? SchemeId)
        {
            if (consumptioData.PatientId > 0 && SchemeId != null)
            {
                var patientCreditLimitData = patientConsumptionDbContext.PatientSchemeMapModels.Where(p => p.PatientId == consumptioData.PatientId && p.SchemeId == SchemeId && p.LatestPatientVisitId == consumptioData.PatientVisitId).FirstOrDefault();
                if (patientCreditLimitData != null)
                {
                    if (patientCreditLimitData.IpCreditLimit > 0 && patientCreditLimitData.IpCreditLimit >= consumptioData.TotalAmount)
                    {
                        patientCreditLimitData.IpCreditLimit = patientCreditLimitData.IpCreditLimit - consumptioData.TotalAmount;
                        patientConsumptionDbContext.SaveChanges();
                    }

                    if (patientCreditLimitData.IpCreditLimit == 0 && patientCreditLimitData.GeneralCreditLimit > 0 && patientCreditLimitData.GeneralCreditLimit >= consumptioData.TotalAmount)
                    {
                        patientCreditLimitData.GeneralCreditLimit = patientCreditLimitData.GeneralCreditLimit - consumptioData.TotalAmount;
                        patientConsumptionDbContext.SaveChanges();
                    }
                }

                var scheme = patientConsumptionDbContext.Schemes.FirstOrDefault(a => a.SchemeId == SchemeId);
                if (scheme != null && scheme.ApiIntegrationName == ENUM_Scheme_ApiIntegrationNames.Medicare)
                {
                    var medicareMemberDetail = patientConsumptionDbContext.MedicareMembers.Where(mm => mm.PatientId == consumptioData.PatientId).FirstOrDefault();
                    if (medicareMemberDetail != null)
                    {
                        UpdateMedicareBalance(consumptioData.CoPaymentCreditAmount, patientConsumptionDbContext, medicareMemberDetail);
                    }
                }
            }
        }

        private static void UpdateMedicareBalance(decimal CoPaymentCreditAmount, PatientConsumptionDbContext patientConsumptionDbContext, MedicareMember medicareMemberDetail)
        {
            MedicareMemberBalance medicareMemberBalance = new MedicareMemberBalance();
            if (medicareMemberDetail != null)
            {
                if (!medicareMemberDetail.IsDependent)
                {
                    medicareMemberBalance = patientConsumptionDbContext.MedicareMemberBalances.Where(mm => mm.MedicareMemberId == medicareMemberDetail.MedicareMemberId).FirstOrDefault();
                }
                else
                {
                    medicareMemberBalance = patientConsumptionDbContext.MedicareMemberBalances.Where(mm => mm.MedicareMemberId == medicareMemberDetail.ParentMedicareMemberId).FirstOrDefault();
                }
                DeductMedicareIPBalance(CoPaymentCreditAmount, patientConsumptionDbContext, medicareMemberBalance);
            }
        }

        private static void DeductMedicareIPBalance(decimal CoPaymentCreditAmount, PatientConsumptionDbContext patientConsumptionDbContext, MedicareMemberBalance medicareMemberBalance)
        {
            if (medicareMemberBalance.IpBalance > 0 && medicareMemberBalance.IpBalance >= CoPaymentCreditAmount)
            {
                medicareMemberBalance.IpBalance = medicareMemberBalance.IpBalance - CoPaymentCreditAmount;
                medicareMemberBalance.IpUsedAmount = medicareMemberBalance.IpUsedAmount + CoPaymentCreditAmount;
                patientConsumptionDbContext.SaveChanges();
            }
        }


        private void SaveCreditBillStatus(PHRMInvoiceTransactionModel invoiceTxn, RbacUser currentUser)
        {
            PHRMTransactionCreditBillStatus transactionCreditBillStatus = new PHRMTransactionCreditBillStatus();

            var fiscalYear = GetFiscalYear(_patientConsumptionDbContext);
            var scheme = _patientConsumptionDbContext.Schemes.First(r => r.SchemeId == invoiceTxn.SchemeId);
            PatientSchemeMapModel patientScheme = new PatientSchemeMapModel();
            if (scheme.SchemeName != "GENERAL")
            {
                patientScheme = _patientConsumptionDbContext.PatientSchemeMapModels.First(p => p.SchemeId == invoiceTxn.SchemeId && p.PatientId == invoiceTxn.PatientId);
            }
            transactionCreditBillStatus.InvoiceId = invoiceTxn.InvoiceId;
            transactionCreditBillStatus.InvoiceNoFormatted = fiscalYear.FiscalYearName + "-PH" + invoiceTxn.InvoicePrintId.ToString();
            transactionCreditBillStatus.CreditOrganizationId = invoiceTxn.OrganizationId > 0 ? (int)invoiceTxn.OrganizationId : 0;
            transactionCreditBillStatus.PatientId = invoiceTxn.PatientId;
            transactionCreditBillStatus.CreatedBy = currentUser.EmployeeId;
            transactionCreditBillStatus.CreatedOn = DateTime.Now;
            transactionCreditBillStatus.InvoiceDate = DateTime.Now;
            transactionCreditBillStatus.LiableParty = "Organization";
            transactionCreditBillStatus.SalesTotalBillAmount = invoiceTxn.TotalAmount;
            transactionCreditBillStatus.CoPayReceivedAmount = invoiceTxn.IsCopayment ? (invoiceTxn.TotalAmount - invoiceTxn.CoPaymentCreditAmount) : 0;
            transactionCreditBillStatus.ReturnTotalBillAmount = 0;
            transactionCreditBillStatus.CoPayReturnAmount = 0;
            transactionCreditBillStatus.NetReceivableAmount = transactionCreditBillStatus.SalesTotalBillAmount - transactionCreditBillStatus.CoPayReceivedAmount - (transactionCreditBillStatus.ReturnTotalBillAmount - transactionCreditBillStatus.CoPayReturnAmount);
            transactionCreditBillStatus.SettlementStatus = ENUM_ClaimManagement_SettlementStatus.Pending;
            transactionCreditBillStatus.IsClaimable = true;
            transactionCreditBillStatus.IsActive = true;
            transactionCreditBillStatus.FiscalYearId = fiscalYear.FiscalYearId;
            transactionCreditBillStatus.PatientVisitId = invoiceTxn.PatientVisitId;
            transactionCreditBillStatus.SchemeId = invoiceTxn.SchemeId;
            transactionCreditBillStatus.MemberNo = patientScheme != null ? patientScheme.PolicyNo : null;
            _patientConsumptionDbContext.PHRMTransactionCreditBillStatus.Add(transactionCreditBillStatus);
            _patientConsumptionDbContext.SaveChanges();
        }

        private void HandleDeposit(PatientConsumptionDTO consumptionInvoiceObj, PHRMInvoiceTransactionModel invoiceTxn, RbacUser currentUser, int currFiscalYearId, List<PHRMEmployeeCashTransaction> employeeCashTransactions)
        {
            var DefaultDepositHead = _patientConsumptionDbContext.DepositHeadModels.FirstOrDefault(a => a.IsDefault == true);
            var DepositHeadId = DefaultDepositHead != null ? DefaultDepositHead.DepositHeadId : 0;

            var depositDetails = _patientConsumptionDbContext.Deposits.Where(d => d.PatientId == consumptionInvoiceObj.PatientId && d.PatientVisitId == consumptionInvoiceObj.PatientVisitId).OrderByDescending(d => d.CreatedOn).FirstOrDefault();

            if (depositDetails != null)
            {
                BillingDepositModel dep = new BillingDepositModel()
                {
                    TransactionType = ENUM_DepositTransactionType.DepositDeduct,
                    ModuleName = ENUM_ModuleNames.Dispensary,
                    OrganizationOrPatient = ENUM_Deposit_OrganizationOrPatient.Patient,
                    DepositHeadId = DepositHeadId,
                    IsActive = true,
                    FiscalYearId = currFiscalYearId,
                    Remarks = "deposit used for transactionid:" + "PH" + invoiceTxn.InvoicePrintId + " on " + DateTime.Now.Date,
                    CreatedBy = currentUser.EmployeeId,
                    CreatedOn = DateTime.Now,
                    CounterId = (int)consumptionInvoiceObj.CounterId,
                    PatientVisitId = consumptionInvoiceObj.PatientVisitId,
                    PatientId = consumptionInvoiceObj.PatientId,
                    OutAmount = consumptionInvoiceObj.DepositDeductAmount,
                    DepositBalance = depositDetails.DepositBalance - consumptionInvoiceObj.DepositDeductAmount,
                    PaymentMode = ENUM_BillPaymentMode.cash,
                    ReceiptNo = GetDepositReceiptNo(_patientConsumptionDbContext, currFiscalYearId)
                };
                _patientConsumptionDbContext.Deposits.Add(dep);
                _patientConsumptionDbContext.SaveChanges();

                List<PHRMEmployeeCashTransaction> empCashTxns = new List<PHRMEmployeeCashTransaction>();

                PHRMEmployeeCashTransaction empCashTxn = new PHRMEmployeeCashTransaction();
                PaymentModes MstPaymentModes = _patientConsumptionDbContext.PaymentModeSubCategories.Where(a => a.PaymentSubCategoryName.ToLower() == "deposit").FirstOrDefault();
                empCashTxn.ReferenceNo = dep.DepositId;
                empCashTxn.InAmount = 0;
                empCashTxn.OutAmount = consumptionInvoiceObj.DepositDeductAmount;
                empCashTxn.PaymentModeSubCategoryId = MstPaymentModes.PaymentSubCategoryId;
                empCashTxn.PatientId = consumptionInvoiceObj.PatientId;
                empCashTxn.EmployeeId = currentUser.EmployeeId;
                empCashTxn.CounterID = (int)consumptionInvoiceObj.CounterId;
                empCashTxn.TransactionDate = DateTime.Now;
                empCashTxn.TransactionType = ENUM_PHRM_EmpCashTxnTypes.DepositDeduct;
                empCashTxn.ModuleName = ENUM_ModuleNames.Dispensary;
                empCashTxn.Remarks = "deduct from deposit";
                empCashTxn.IsActive = true;
                empCashTxn.FiscalYearId = currFiscalYearId;
                empCashTxns.Add(empCashTxn);
                employeeCashTransactions.Add(empCashTxn);
            }

        }
        private static int? GetDepositReceiptNo(PatientConsumptionDbContext patientConsumptionDbContext, int fiscalYearId)
        {
            int? receiptNo = (from depTxn in patientConsumptionDbContext.Deposits
                              where depTxn.FiscalYearId == fiscalYearId
                              select depTxn.ReceiptNo).DefaultIfEmpty(0).Max();
            return receiptNo + 1;
        }

        private void UpdatePatientConsumptionItemFinalizeFlag(List<int?> PatientConsumptionItemIds)
        {
            var ConsumptionItems = _patientConsumptionDbContext.PatientConsumptionItem.Where(i => PatientConsumptionItemIds.Contains(i.PatientConsumptionItemId)).ToList();
            ConsumptionItems.ForEach(itm => itm.IsFinalize = true);
            _patientConsumptionDbContext.SaveChanges();
        }

        private void UpdatePatientConsumptionBillStatus(PHRMInvoiceTransactionModel invoiceTxn, List<int?> PatientConsumptionIds)
        {
            var DistinctPatientConsumptionIds = PatientConsumptionIds.Distinct().ToList();

            DistinctPatientConsumptionIds.ForEach(id =>
            {
                var PatientConsumption = _patientConsumptionDbContext.PatientConsumption.Where(a => a.PatientConsumptionId == id).FirstOrDefault();
                if (PatientConsumption != null)
                {
                    if (invoiceTxn.PaymentMode == ENUM_BillPaymentMode.cash)
                    {
                        PatientConsumption.BillingStatus = ENUM_BillingStatus.paid;
                    }
                    else
                    {
                        PatientConsumption.BillingStatus = ENUM_BillingStatus.unpaid;
                    }
                    _patientConsumptionDbContext.SaveChanges();
                }
            });
        }

        private void UpdateStockTransactions(List<PHRMInvoiceTransactionItemsModel> invoiceitems, RbacUser currentUser, int currFiscalYearId)
        {
            foreach (PHRMInvoiceTransactionItemsModel itmFromClient in invoiceitems)
            {

                var patientConsumptionSaleTxn = ENUM_PHRM_StockTransactionType.PHRMPatientConsumption;
                var patientConsumptionCancelTxn = ENUM_PHRM_StockTransactionType.PatientConsumptionCancel;

                var allStockTxnsForThisInvoiceItem = _patientConsumptionDbContext.StockTransactions
                                                                .Where(s => (s.ReferenceNo == itmFromClient.PatientConsumptionItemId && s.TransactionType == patientConsumptionSaleTxn)
                                                                || (itmFromClient.ConsumptionReturnItemIds.Contains(s.ReferenceNo) && s.TransactionType == patientConsumptionCancelTxn)).ToList();

                var PatientConsumptionToSaleQtyForThisInvoice = allStockTxnsForThisInvoiceItem.Sum(s => s.OutQty - s.InQty);

                var storeStockIdList = allStockTxnsForThisInvoiceItem.Select(s => s.StoreStockId).Distinct().ToList();
                var soldByStoreId = allStockTxnsForThisInvoiceItem[0].StoreId;
                var storeStockList = _patientConsumptionDbContext.StoreStocks.Include("StockMaster").Where(s => storeStockIdList.Contains((int)s.StoreStockId) && s.StoreId == soldByStoreId).ToList();

                foreach (var storeStock in storeStockList)
                {
                    // add a provisional-to-sale stock transaction with quantity = (sold qty - previously returned qty)
                    var provToSaleQty = allStockTxnsForThisInvoiceItem.Where(s => s.StoreStockId == storeStock.StoreStockId).Sum(s => s.OutQty - s.InQty);
                    if (provToSaleQty == 0) // by pass the same stock with same StockId with same batch and Expiry and SalePrice ie (that item is prov sale and return already);
                    {
                        continue;
                    }

                    var provToSaleTxn = new PHRMStockTransactionModel(
                                               storeStock: storeStock,
                                               transactionType: ENUM_PHRM_StockTransactionType.PatientConsumptionToSale,
                                               transactionDate: DateTime.Now,
                                               referenceNo: itmFromClient.InvoiceItemId,
                                               createdBy: currentUser.EmployeeId,
                                               createdOn: DateTime.Now,
                                               fiscalYearId: currFiscalYearId
                                               );
                    provToSaleTxn.SetInOutQuantity(inQty: provToSaleQty, outQty: 0);

                    // add a sale-item stock transaction with quantity = (sold qty - previously returned qty)
                    var SaleTxn = new PHRMStockTransactionModel(
                                               storeStock: storeStock,
                                               transactionType: ENUM_PHRM_StockTransactionType.SaleItem,
                                               transactionDate: DateTime.Now,
                                               referenceNo: itmFromClient.InvoiceItemId,
                                               createdBy: currentUser.EmployeeId,
                                               createdOn: DateTime.Now,
                                               fiscalYearId: currFiscalYearId
                                               );
                    SaleTxn.SetInOutQuantity(inQty: 0, outQty: provToSaleQty);
                    _patientConsumptionDbContext.StockTransactions.Add(provToSaleTxn);
                    _patientConsumptionDbContext.StockTransactions.Add(SaleTxn);
                }
                _patientConsumptionDbContext.SaveChanges();

            }
        }

        private PHRMInvoiceTransactionModel SyncPHRMInvoiceToRemoteServer(PHRMInvoiceTransactionModel invoiceTxn)
        {
            if (invoiceTxn.IsRealtime)
            {
                PHRMInvoiceTransactionModel invoiceSale = _pharmacyDbContext.PHRMInvoiceTransaction.Where(p => p.InvoiceId == invoiceTxn.InvoiceId).FirstOrDefault();
                invoiceTxn = invoiceSale;
            }
            if (invoiceTxn.IsReturn)
            {
                //Sud:24Dec'18--making parallel thread call (asynchronous) to post to IRD. so that it won't stop the normal execution of logic.
                Task.Run(() => PharmacyBL.SyncPHRMBillInvoiceToRemoteServer(invoiceTxn, "phrm-invoice", _pharmacyDbContext));
            }

            return invoiceTxn;
        }

        private void SaveEmployeeCashTransaction(PHRMInvoiceTransactionModel invoiceTxn, RbacUser currentUser, List<PHRMEmployeeCashTransaction> empCashTxns)
        {
            empCashTxns.ForEach(txn => { txn.ReferenceNo = invoiceTxn.InvoiceId; });
            _patientConsumptionDbContext.PharmacyEmployeeCashTransactions.AddRange(empCashTxns);
            _patientConsumptionDbContext.SaveChanges();
        }

        private void SaveInvoiceItems(List<PHRMInvoiceTransactionItemsModel> invoiceitems, int InvoiceId)
        {
            invoiceitems.ForEach(itm => itm.InvoiceId = InvoiceId);
            _patientConsumptionDbContext.PHRMInvoiceTransactionItems.AddRange(invoiceitems);
            _patientConsumptionDbContext.SaveChanges();
        }

        private void SaveInvoice(PatientConsumptionDTO consumptionInvoiceObj, RbacUser currentUser, out PHRMInvoiceTransactionModel invoiceTxn, int currFiscalYearId)
        {
            var visitDetails = _patientConsumptionDbContext.PatientVisits.First(a => a.PatientVisitId == consumptionInvoiceObj.PatientVisitId);

            invoiceTxn = new PHRMInvoiceTransactionModel();
            invoiceTxn.DiscountPer = consumptionInvoiceObj.DiscountPercentage;
            invoiceTxn.InvoicePrintId = GetInvoicePrintId();
            invoiceTxn.PatientId = consumptionInvoiceObj.PatientId;
            invoiceTxn.TotalAmount = consumptionInvoiceObj.TotalAmount;
            invoiceTxn.PaymentMode = consumptionInvoiceObj.PaymentMode;
            invoiceTxn.StoreId = consumptionInvoiceObj.StoreId;
            invoiceTxn.DiscountAmount = consumptionInvoiceObj.DiscountAmount;
            invoiceTxn.Tender = consumptionInvoiceObj.Tender;
            invoiceTxn.SubTotal = consumptionInvoiceObj.SubTotal;
            invoiceTxn.CreateOn = DateTime.Now;
            invoiceTxn.IsOutdoorPat = consumptionInvoiceObj.VisitType == ENUM_VisitType.inpatient ? true : false;
            invoiceTxn.CounterId = (int)consumptionInvoiceObj.CounterId;
            invoiceTxn.FiscalYearId = currFiscalYearId;
            invoiceTxn.VATAmount = 0;
            invoiceTxn.VisitType = consumptionInvoiceObj.VisitType;
            invoiceTxn.CreatedBy = currentUser.EmployeeId;
            invoiceTxn.PatientVisitId = consumptionInvoiceObj.PatientVisitId;
            invoiceTxn.SchemeId = consumptionInvoiceObj.SchemeId;
            invoiceTxn.ClaimCode = visitDetails != null ? visitDetails.ClaimCode : null;
            invoiceTxn.PaidAmount = consumptionInvoiceObj.PaidAmount;
            invoiceTxn.IsCopayment = consumptionInvoiceObj.IsCoPayment;

            if (invoiceTxn.PaymentMode == ENUM_BillPaymentMode.credit)
            {
                invoiceTxn.CreditAmount = invoiceTxn.IsCopayment ? consumptionInvoiceObj.TotalAmount - consumptionInvoiceObj.ReceivedAmount : consumptionInvoiceObj.TotalAmount;
                invoiceTxn.Creditdate = DateTime.Now;
                invoiceTxn.OrganizationId = consumptionInvoiceObj.OrganizationId;
                invoiceTxn.BilStatus = ENUM_BillingStatus.unpaid;
                invoiceTxn.ReceivedAmount = invoiceTxn.IsCopayment ? consumptionInvoiceObj.ReceivedAmount : 0;
            }
            else
            {
                invoiceTxn.CreditAmount = 0;
                invoiceTxn.Creditdate = null;
                invoiceTxn.BilStatus = ENUM_BillingStatus.paid;
                invoiceTxn.ReceivedAmount = consumptionInvoiceObj.ReceivedAmount;
            }

            _patientConsumptionDbContext.PHRMInvoiceTransaction.Add(invoiceTxn);
            _patientConsumptionDbContext.SaveChanges();
        }

        private static void ExtractConsumptionItemsFromConsumptionObject(PatientConsumptionDTO consumptionInvoiceObj, RbacUser currentUser, List<PHRMInvoiceTransactionItemsModel> invoiceitems, List<PHRMEmployeeCashTransaction> employeeCashTransactions, int FiscalYearId)
        {
            consumptionInvoiceObj.PatientConsumptionItems.ForEach(item =>
            {
                PHRMInvoiceTransactionItemsModel invoiceitem = new PHRMInvoiceTransactionItemsModel();
                invoiceitem.ItemId = item.ItemId;
                invoiceitem.ItemName = item.ItemName;
                invoiceitem.BatchNo = item.BatchNo;
                invoiceitem.Quantity = (double)item.Quantity;
                invoiceitem.Price = item.SalePrice;
                invoiceitem.SalePrice = item.SalePrice;
                invoiceitem.GrItemPrice = 0;
                invoiceitem.FreeQuantity = 0;
                invoiceitem.SubTotal = item.SubTotal;
                invoiceitem.VATPercentage = 0;
                invoiceitem.DiscountPercentage = item.DiscountPercentage;
                invoiceitem.TotalAmount = item.TotalAmount;
                invoiceitem.BilItemStatus = consumptionInvoiceObj.PaymentMode == ENUM_BillPaymentMode.credit ? ENUM_BillingStatus.unpaid : ENUM_BillingStatus.paid;
                invoiceitem.Remark = item.Remarks;
                invoiceitem.CreatedBy = currentUser.EmployeeId;
                invoiceitem.CreatedOn = DateTime.Now;
                invoiceitem.CounterId = (int)item.CounterId;
                invoiceitem.ExpiryDate = item.ExpiryDate;
                invoiceitem.PatientId = item.PatientId;
                invoiceitem.VisitType = item.VisitType;
                invoiceitem.TotalDisAmt = item.DiscountAmount;
                invoiceitem.PerItemDisAmt = 0;
                invoiceitem.StoreId = item.StoreId;
                invoiceitem.PriceCategoryId = item.PriceCategoryId;
                invoiceitem.VATAmount = 0;
                invoiceitem.PrescriberId = item.PrescriberId;
                invoiceitem.PatientConsumptionItemId = item.PatientConsumptionItemId;
                invoiceitem.PatientConsumptionId = item.PatientConsumptionId;
                invoiceitem.ConsumptionReturnItemIds = item.ConsumptionReturnItemIds;
                invoiceitem.PatientVisitId = item.PatientVisitId;
                invoiceitem.FiscalYearId = FiscalYearId;
                invoiceitem.GenericName = item.GenericName;
                invoiceitem.SchemeId = (int)item.SchemeId;
                invoiceitems.Add(invoiceitem);
            });
            consumptionInvoiceObj.PatientConsumptionItems = null;

            MapEmployeeCashTransactions(consumptionInvoiceObj, currentUser, employeeCashTransactions, FiscalYearId);
            consumptionInvoiceObj.PHRMEmployeeCashTransactions = null;

        }

        private static void MapEmployeeCashTransactions(PatientConsumptionDTO consumptionInvoiceObj, RbacUser currentUser, List<PHRMEmployeeCashTransaction> employeeCashTransactions, int FiscalYearId)
        {
            if (consumptionInvoiceObj.PaymentMode != ENUM_BillPaymentMode.credit)
            {
                consumptionInvoiceObj.PHRMEmployeeCashTransactions.ForEach(txn =>
                {
                    PHRMEmployeeCashTransaction empCashTxn = new PHRMEmployeeCashTransaction();
                    empCashTxn.TransactionDate = DateTime.Now;
                    empCashTxn.PatientId = consumptionInvoiceObj.PatientId;
                    empCashTxn.PaymentModeSubCategoryId = txn.PaymentModeSubCategoryId;
                    empCashTxn.ModuleName = txn.ModuleName;
                    empCashTxn.CounterID = (int)consumptionInvoiceObj.CounterId;
                    empCashTxn.EmployeeId = currentUser.EmployeeId;
                    empCashTxn.FiscalYearId = FiscalYearId;
                    empCashTxn.InAmount = txn.InAmount;
                    empCashTxn.OutAmount = 0;
                    empCashTxn.IsActive = true;
                    empCashTxn.Remarks = txn.Remarks;
                    empCashTxn.Description = txn.Description;
                    empCashTxn.TransactionType = ENUM_EmpCashTransactionType.CashSales;
                    employeeCashTransactions.Add(empCashTxn);
                });
            }
            if (consumptionInvoiceObj.PaymentMode == ENUM_BillPaymentMode.credit && consumptionInvoiceObj.IsCoPayment)
            {
                consumptionInvoiceObj.PHRMEmployeeCashTransactions.ForEach(txn =>
                {
                    PHRMEmployeeCashTransaction empCashTxn = new PHRMEmployeeCashTransaction();
                    empCashTxn.TransactionDate = DateTime.Now;
                    empCashTxn.PatientId = consumptionInvoiceObj.PatientId;
                    empCashTxn.PaymentModeSubCategoryId = txn.PaymentModeSubCategoryId;
                    empCashTxn.ModuleName = txn.ModuleName;
                    empCashTxn.CounterID = (int)consumptionInvoiceObj.CounterId;
                    empCashTxn.EmployeeId = currentUser.EmployeeId;
                    empCashTxn.FiscalYearId = FiscalYearId;
                    empCashTxn.InAmount = consumptionInvoiceObj.ReceivedAmount;
                    empCashTxn.OutAmount = 0;
                    empCashTxn.IsActive = true;
                    empCashTxn.Remarks = txn.Remarks;
                    empCashTxn.Description = txn.Description;
                    empCashTxn.TransactionType = ENUM_EmpCashTransactionType.CashSales;
                    employeeCashTransactions.Add(empCashTxn);
                });
            }
        }

        private int GetConsumptionNumber()
        {
            int fiscalYearId = GetFiscalYearId();

            int invoiceNumber = (from txn in _patientConsumptionDbContext.PatientConsumption
                                 where txn.FiscalYearId == fiscalYearId
                                 select txn.PatientConsumptionId).DefaultIfEmpty(0).Max();
            return invoiceNumber + 1;
        }

        [HttpGet]
        [Route("PatientConsumptionInfo")]
        public IActionResult PatientConsumptionInfo(int patientId, int patientVisitId)
        {
            Func<object> func = () => GetPatientConsumptionInfo(patientId, patientVisitId);
            return InvokeHttpGetFunction(func);
        }

        private object GetPatientConsumptionInfo(int PatientId, int patientVisitId)
        {
            var patientConsumption = (from patConsumption in _patientConsumptionDbContext.PatientConsumption.
                                      Where(pc => pc.PatientId == PatientId && pc.PatientVisitId == patientVisitId && pc.BillingStatus == ENUM_BillingStatus.unpaid)
                                      join pat in _patientConsumptionDbContext.Patient on patConsumption.PatientId equals pat.PatientId
                                      join visit in _patientConsumptionDbContext.PatientVisits.Where(v => v.PatientVisitId == patientVisitId) on patConsumption.PatientId equals visit.PatientId
                                      select new
                                      {
                                          FiscalYearId = patConsumption.FiscalYearId,
                                          PatientId = patConsumption.PatientId,
                                          PatientName = pat.ShortName,
                                          HospitalNo = pat.PatientCode,
                                          Age = pat.Age,
                                          Sex = pat.Gender,
                                          Address = pat.Address,
                                          IpNo = visit.VisitCode,
                                          VisitType = visit.VisitType,
                                          PatientVisitId = patConsumption.PatientVisitId,
                                          ContactNo = pat.PhoneNumber,
                                          StoreId = patConsumption.StoreId,
                                          SchemeId = patConsumption.SchemeId
                                      }
                                     ).FirstOrDefault();


            var patientConsumptionItems = (from patConsumption in _patientConsumptionDbContext.PatientConsumption
                                           .Where(pc => pc.PatientId == PatientId && pc.PatientVisitId == patientVisitId && pc.BillingStatus == ENUM_BillingStatus.unpaid)
                                           join patConItem in _patientConsumptionDbContext.PatientConsumptionItem.Where(item => item.IsFinalize == false && item.PatientId == PatientId && item.PatientVisitId == patientVisitId) on patConsumption.PatientConsumptionId equals patConItem.PatientConsumptionId
                                           join pat in _patientConsumptionDbContext.Patient on patConItem.PatientId equals pat.PatientId
                                           join emp in _patientConsumptionDbContext.Employees on patConItem.CreatedBy equals emp.EmployeeId
                                           join store in _patientConsumptionDbContext.Stores on patConItem.StoreId equals store.StoreId
                                           join conItmRet in (from ret in _patientConsumptionDbContext.PatientConsumptionReturnItem
                                                              group ret by ret.PatientConsumptionItemId into retGroup
                                                              select new { PatientConsumptionItemId = retGroup.Key, Quantity = retGroup.Sum(x => x.Quantity) })
                                             on patConItem.PatientConsumptionItemId equals conItmRet.PatientConsumptionItemId into conItmRetGroup
                                           from conItmRet in conItmRetGroup.DefaultIfEmpty()
                                           select new
                                           {

                                               patConItem.PatientConsumptionItemId,
                                               patConItem.PatientConsumptionId,
                                               patConItem.PatientId,
                                               patConItem.PatientVisitId,
                                               patConItem.ItemId,
                                               patConItem.ItemName,
                                               patConItem.GenericId,
                                               patConItem.GenericName,
                                               patConItem.ExpiryDate,
                                               patConItem.BatchNo,
                                               patConItem.Quantity,
                                               ReturnedQuantity = conItmRet != null ? conItmRet.Quantity : 0,
                                               patConItem.SalePrice,
                                               patConItem.SubTotal,
                                               patConItem.DiscountPercentage,
                                               patConItem.TotalAmount,
                                               patConItem.Remarks,
                                               patConItem.CounterId,
                                               patConItem.StoreId,
                                               patConItem.PrescriberId,
                                               patConItem.PriceCategoryId,
                                               patConItem.SchemeId,
                                               UserName = emp.FullName,
                                               PatientName = pat.ShortName,
                                               StoreName = store.Name,
                                               ConsumptionReceiptNo = patConsumption.ConsumptionReceiptNo,
                                               CreatedOn = patConItem.CreatedOn,
                                               ConsumptionReturnItemIds = _patientConsumptionDbContext.PatientConsumptionReturnItem.Where(item => item.PatientConsumptionItemId == patConItem.PatientConsumptionItemId).Select(a => a.PatientConsumptionReturnItemId).Distinct().ToList()
                                           }).ToList();


            return new
            {
                PatientConsumption = patientConsumption,
                PatientConsumptionItems = patientConsumptionItems
            };
        }

        [HttpPost]
        [Route("Return")]
        public IActionResult ReturnPatientConsumptionItems([FromBody] List<PatientConsumptionItemModel> patientConsumptionItems)
        {
            Func<object> func = () => SaveReturnPatientConsumption(patientConsumptionItems);
            return InvokeHttpPostFunction(func);
        }

        private object SaveReturnPatientConsumption(List<PatientConsumptionItemModel> patientConsumptionItems)
        {
            using (var dbTxn = _patientConsumptionDbContext.Database.BeginTransaction())
            {
                try
                {
                    var currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
                    var currentDate = DateTime.Now;
                    var currentFiscalYearId = GetFiscalYearId();

                    var consumptionReturnReceiptNo = GetPatientConsumptionReturnReceiptNo();

                    List<PatientConsumptionReturnItemModel> patientConsumptionReturnItems = new List<PatientConsumptionReturnItemModel>();

                    patientConsumptionItems.ForEach(item =>
                    {
                        var patientConsumptionReturnItem = new PatientConsumptionReturnItemModel();
                        patientConsumptionReturnItem.PatientConsumptionItemId = item.PatientConsumptionItemId;
                        patientConsumptionReturnItem.PatientConsumptionId = item.PatientConsumptionId;
                        patientConsumptionReturnItem.PatientId = item.PatientId;
                        patientConsumptionReturnItem.PatientVisitId = item.PatientVisitId;
                        patientConsumptionReturnItem.ItemId = item.ItemId;
                        patientConsumptionReturnItem.ItemName = item.ItemName;
                        patientConsumptionReturnItem.GenericId = item.GenericId;
                        patientConsumptionReturnItem.GenericName = item.GenericName;
                        patientConsumptionReturnItem.BatchNo = item.BatchNo;
                        patientConsumptionReturnItem.ExpiryDate = item.ExpiryDate;
                        patientConsumptionReturnItem.Quantity = item.Quantity;
                        patientConsumptionReturnItem.SalePrice = item.SalePrice;
                        patientConsumptionReturnItem.SubTotal = item.SubTotal;
                        patientConsumptionReturnItem.DiscountPercentage = item.DiscountPercentage;
                        patientConsumptionReturnItem.DiscountAmount = item.DiscountAmount;
                        patientConsumptionReturnItem.VatPercentage = item.VatPercentage;
                        patientConsumptionReturnItem.VatAmount = item.VatAmount;
                        patientConsumptionReturnItem.TotalAmount = item.TotalAmount;
                        patientConsumptionReturnItem.Remarks = item.Remarks;
                        patientConsumptionReturnItem.CounterId = item.CounterId;
                        patientConsumptionReturnItem.StoreId = item.ReturningStoreId;
                        patientConsumptionReturnItem.PrescriberId = item.PrescriberId;
                        patientConsumptionReturnItem.PriceCategoryId = item.PriceCategoryId;
                        patientConsumptionReturnItem.SchemeId = item.SchemeId;
                        patientConsumptionReturnItem.CreatedBy = currentUser.EmployeeId;
                        patientConsumptionReturnItem.CreatedOn = currentDate;
                        patientConsumptionReturnItem.IsActive = true;
                        patientConsumptionReturnItem.ConsumptionReturnReceiptNo = consumptionReturnReceiptNo;
                        patientConsumptionReturnItem.VisitType = item.VisitType;
                        _patientConsumptionDbContext.PatientConsumptionReturnItem.Add(patientConsumptionReturnItem);
                        _patientConsumptionDbContext.SaveChanges();


                        var StockTransactions = _patientConsumptionDbContext.StockTransactions.Where(txn => txn.ItemId == item.ItemId && txn.StoreId == item.StoreId && txn.BatchNo == item.BatchNo && txn.ExpiryDate == item.ExpiryDate && txn.TransactionType == ENUM_PHRM_StockTransactionType.PHRMPatientConsumption).ToList();


                        var StockIds = StockTransactions.Select(i => i.StockId).Distinct().ToList();

                        var stockList = _patientConsumptionDbContext.StoreStocks.Include("StockMaster").Where(s => StockIds.Contains(s.StockId) && s.StoreId == item.StoreId).ToList();

                        foreach (var stock in stockList)
                        {
                            double consumedQty = StockTransactions.Where(s => s.StockId == stock.StockId).Sum(s => s.OutQty);
                            double? previouslyReturnedQuantity = StockTransactions.Where(s => s.StockId == stock.StockId).Sum(s => s.InQty);
                            double totalReturnableQtyForThisStock = consumedQty - (previouslyReturnedQuantity ?? 0);
                            double remainingReturnedQuantity = (double)item.Quantity;

                            PHRMStockTransactionModel newStockTxn = null;

                            if (totalReturnableQtyForThisStock == 0)
                            {
                                continue;
                            }
                            if (totalReturnableQtyForThisStock < remainingReturnedQuantity)
                            {
                                if (stock.StoreId == item.ReturningStoreId)
                                {
                                    stock.UpdateAvailableQuantity(newQty: stock.AvailableQuantity + totalReturnableQtyForThisStock);

                                    // create new txn for this store
                                    newStockTxn = new PHRMStockTransactionModel(
                                                        storeStock: stock,
                                                        transactionType: ENUM_PHRM_StockTransactionType.PHRMPatientConsumptionReturn,
                                                        transactionDate: currentDate,
                                                        referenceNo: patientConsumptionReturnItem.PatientConsumptionReturnItemId,
                                                        createdBy: currentUser.EmployeeId,
                                                        createdOn: currentDate,
                                                        fiscalYearId: currentFiscalYearId
                                                        );
                                }
                                //If store is not same, then find the stock for the returning store
                                else
                                {
                                    var returningStoreStock = _patientConsumptionDbContext.StoreStocks.Include("StockMaster").FirstOrDefault(s => s.StockId == stock.StockId && s.StoreId == item.ReturningStoreId);
                                    if (returningStoreStock != null)
                                    {
                                        returningStoreStock.UpdateAvailableQuantity(returningStoreStock.AvailableQuantity + totalReturnableQtyForThisStock);
                                    }
                                    else
                                    {
                                        returningStoreStock = new PHRMStoreStockModel(
                                            stockMaster: stock.StockMaster,
                                            storeId: item.ReturningStoreId,
                                            quantity: totalReturnableQtyForThisStock,
                                            costPrice: returningStoreStock.CostPrice,
                                            salePrice: returningStoreStock.SalePrice
                                            );

                                        _patientConsumptionDbContext.StoreStocks.Add(returningStoreStock);
                                        _patientConsumptionDbContext.SaveChanges();
                                    }
                                    // create new txn for this store
                                    newStockTxn = new PHRMStockTransactionModel(
                                                        storeStock: returningStoreStock,
                                                        transactionType: ENUM_PHRM_StockTransactionType.PHRMPatientConsumptionReturn,
                                                        transactionDate: currentDate,
                                                        referenceNo: patientConsumptionReturnItem.PatientConsumptionReturnItemId,
                                                        createdBy: currentUser.EmployeeId,
                                                        createdOn: currentDate,
                                                        fiscalYearId: currentFiscalYearId
                                                        );
                                }
                                newStockTxn.SetInOutQuantity(inQty: totalReturnableQtyForThisStock, outQty: 0);
                                remainingReturnedQuantity -= totalReturnableQtyForThisStock;
                            }
                            else
                            {
                                //Check if the sold store and returning store are same
                                if (stock.StoreId == item.ReturningStoreId)
                                {
                                    stock.UpdateAvailableQuantity(newQty: stock.AvailableQuantity + remainingReturnedQuantity);
                                    // create new txn for this store
                                    newStockTxn = new PHRMStockTransactionModel(
                                                        storeStock: stock,
                                                        transactionType: ENUM_PHRM_StockTransactionType.PHRMPatientConsumptionReturn,
                                                        transactionDate: currentDate,
                                                        referenceNo: patientConsumptionReturnItem.PatientConsumptionReturnItemId,
                                                        createdBy: currentUser.EmployeeId,
                                                        createdOn: currentDate,
                                                        fiscalYearId: currentFiscalYearId
                                                        );
                                }
                                //If store is not same, then find the stock for the returning store
                                else
                                {
                                    var returningStoreStock = _patientConsumptionDbContext.StoreStocks.Include("StockMaster").FirstOrDefault(s => s.StoreStockId == stock.StoreStockId && s.StoreId == item.ReturningStoreId);
                                    if (returningStoreStock != null)
                                    {
                                        //If stock found, update the available quantity
                                        returningStoreStock.UpdateAvailableQuantity(newQty: returningStoreStock.AvailableQuantity + (remainingReturnedQuantity));
                                    }
                                    else
                                    {
                                        // If stock not found, create a new stock for this store
                                        returningStoreStock = new PHRMStoreStockModel(
                                            stockMaster: stock.StockMaster,
                                            storeId: item.ReturningStoreId,
                                            quantity: remainingReturnedQuantity,
                                            costPrice: stock.CostPrice,
                                            salePrice: stock.SalePrice
                                            );
                                        _patientConsumptionDbContext.StoreStocks.Add(returningStoreStock);
                                        _patientConsumptionDbContext.SaveChanges();
                                    }
                                    // create new txn for this store
                                    newStockTxn = new PHRMStockTransactionModel(
                                                        storeStock: returningStoreStock,
                                                        transactionType: ENUM_PHRM_StockTransactionType.PHRMPatientConsumptionReturn,
                                                        transactionDate: currentDate,
                                                        referenceNo: patientConsumptionReturnItem.PatientConsumptionReturnItemId,
                                                        createdBy: currentUser.EmployeeId,
                                                        createdOn: currentDate,
                                                        fiscalYearId: currentFiscalYearId
                                                        );
                                }
                                newStockTxn.SetInOutQuantity(inQty: remainingReturnedQuantity, outQty: 0);
                                remainingReturnedQuantity = 0;
                            }
                            //add txn to dispensary stock txn and then check if fifo is completed.
                            _patientConsumptionDbContext.StockTransactions.Add(newStockTxn);
                            _patientConsumptionDbContext.SaveChanges();

                            if (remainingReturnedQuantity == 0)
                            {
                                break;
                            }

                        }

                    });

                    dbTxn.Commit();
                    return consumptionReturnReceiptNo;
                }
                catch (Exception ex)
                {
                    dbTxn.Rollback();
                    throw ex;
                }
            }
        }

        [HttpGet]
        [Route("Returns")]
        public IActionResult PatientConsumptionReturns()
        {
            Func<object> func = () => (from pat in _patientConsumptionDbContext.Patient
                                       join conItemRet in (
                                           from ci in _patientConsumptionDbContext.PatientConsumptionReturnItem
                                           group ci by new { ci.PatientId, ci.ConsumptionReturnReceiptNo } into g
                                           select new
                                           {
                                               g.Key.PatientId,
                                               g.Key.ConsumptionReturnReceiptNo,
                                               TotalAmount = g.Sum(ci => ci.TotalAmount),
                                               CreatedOn = g.Max(i => i.CreatedOn)
                                           }
                                       ) on pat.PatientId equals conItemRet.PatientId
                                       select new
                                       {
                                           ConsumptionReturnReceiptNo = conItemRet.ConsumptionReturnReceiptNo,
                                           HospitalNo = pat.PatientCode,
                                           PatientName = pat.ShortName,
                                           PatientId = pat.PatientId,
                                           pat.Address,
                                           pat.Age,
                                           Sex = pat.Gender,
                                           ContactNo = pat.PhoneNumber,
                                           conItemRet.TotalAmount,
                                           CreatedOn = conItemRet.CreatedOn
                                       }).OrderByDescending(a => a.ConsumptionReturnReceiptNo).ToList();
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("ReturnInfo")]
        public IActionResult ReturnInfo(int consumptionReturnReceiptNo)
        {
            Func<object> func = () => GetReturnInfo(consumptionReturnReceiptNo);
            return InvokeHttpGetFunction(func);
        }

        private object GetReturnInfo(int ConsumptionReturnReceiptNo)
        {
            PatientConsumptionReturnReceipt_DTO patientConsumptionReturn = new PatientConsumptionReturnReceipt_DTO();
            patientConsumptionReturn = (from retitm in _patientConsumptionDbContext.PatientConsumptionReturnItem.Where(ri => ri.ConsumptionReturnReceiptNo == ConsumptionReturnReceiptNo)
                                        join patcon in _patientConsumptionDbContext.PatientConsumption on retitm.PatientConsumptionId equals patcon.PatientConsumptionId
                                        join patconitm in _patientConsumptionDbContext.PatientConsumptionItem on retitm.PatientConsumptionItemId equals patconitm.PatientConsumptionItemId
                                        join patVisit in _patientConsumptionDbContext.PatientVisits on retitm.PatientVisitId equals patVisit.PatientVisitId
                                        join pat in _patientConsumptionDbContext.Patient on patVisit.PatientId equals pat.PatientId
                                        join subD in _patientConsumptionDbContext.CountrySubDivisions on pat.CountrySubDivisionId equals subD.CountrySubDivisionId
                                        join emp in _patientConsumptionDbContext.Employees on retitm.CreatedBy equals emp.EmployeeId
                                        join fy in _patientConsumptionDbContext.PharmacyFiscalYears on patcon.FiscalYearId equals fy.FiscalYearId
                                        group new
                                        {
                                            retitm.ConsumptionReturnReceiptNo,
                                            pat.PatientCode,
                                            pat.ShortName,
                                            pat.Address,
                                            subD.CountrySubDivisionName,
                                            retitm.CreatedOn,
                                            pat.Age,
                                            pat.Gender,
                                            pat.PhoneNumber,
                                            patVisit.VisitCode,
                                            fy.FiscalYearName,
                                            emp.FullName,
                                            retitm.SubTotal,
                                            retitm.TotalAmount
                                        } by new
                                        {
                                            retitm.ConsumptionReturnReceiptNo,
                                            pat.PatientCode,
                                            pat.ShortName,
                                            pat.Address,
                                            subD.CountrySubDivisionName,
                                            retitm.CreatedOn,
                                            pat.Age,
                                            pat.Gender,
                                            pat.PhoneNumber,
                                            patVisit.VisitCode,
                                            fy.FiscalYearName,
                                            emp.FullName,

                                        } into g
                                        select new PatientConsumptionReturnReceipt_DTO
                                        {
                                            ReturnReceiptNo = (int)g.Key.ConsumptionReturnReceiptNo,
                                            HospitalNo = g.Key.PatientCode,
                                            PatientName = g.Key.ShortName,
                                            Address = g.Key.Address,
                                            CountrySubDivisionName = g.Key.CountrySubDivisionName,
                                            CreatedOn = g.Key.CreatedOn,
                                            Age = g.Key.Age,
                                            Sex = g.Key.Gender,
                                            ContactNo = g.Key.PhoneNumber,
                                            IpNo = g.Key.VisitCode,
                                            CurrentFiscalYearName = g.Key.FiscalYearName,
                                            UserName = g.Key.FullName,
                                            SubTotal = g.Sum(x => x.SubTotal),
                                            TotalAmount = g.Sum(x => x.TotalAmount)
                                        }).FirstOrDefault();



            patientConsumptionReturn.PatientConsumptionReturnItems = (from patConItm in _patientConsumptionDbContext.PatientConsumptionReturnItem
                                                                .Where(a => a.ConsumptionReturnReceiptNo == ConsumptionReturnReceiptNo)
                                                                      select new PatientConsumptionReturnReceiptItems_DTO
                                                                      {
                                                                          ItemName = patConItm.ItemName,
                                                                          GenericName = patConItm.GenericName,
                                                                          BatchNo = patConItm.BatchNo,
                                                                          ExpiryDate = (DateTime)patConItm.ExpiryDate,
                                                                          Quantity = patConItm.Quantity,
                                                                          SalePrice = (decimal)patConItm.SalePrice,
                                                                          SubTotal = patConItm.SubTotal,
                                                                          TotalAmount = patConItm.TotalAmount,
                                                                          RackNo = (from itemrack in _patientConsumptionDbContext.PHRMRackItem.Where(ri => ri.ItemId == patConItm.ItemId && ri.StoreId == patConItm.StoreId)
                                                                                    join rack in _patientConsumptionDbContext.PHRMRack on itemrack.RackId equals rack.RackId
                                                                                    select rack.RackNo).FirstOrDefault()
                                                                      }).ToList();

            return patientConsumptionReturn;
        }

        private int GetPatientConsumptionReturnReceiptNo()
        {
            int ConsumptionReturnReceiptNo = (from txn in _patientConsumptionDbContext.PatientConsumptionReturnItem
                                              select txn.PatientConsumptionReturnItemId).DefaultIfEmpty(0).Max();
            return ConsumptionReturnReceiptNo + 1;
        }

        private int GetInvoicePrintId()
        {
            int fiscalYearId = GetFiscalYearId();

            int InvoicePrintId = (from txn in _patientConsumptionDbContext.PHRMInvoiceTransaction
                                  where txn.FiscalYearId == fiscalYearId
                                  select txn.InvoiceId).DefaultIfEmpty(0).Max();
            return InvoicePrintId + 1;
        }


        [HttpGet]
        [Route("ConsumptionInfo")]
        public IActionResult ConsumptionInfo(int patientConsumptionId)
        {
            Func<object> func = () => GetConsumptionInfo(patientConsumptionId);
            return InvokeHttpGetFunction(func);
        }

        private object GetConsumptionInfo(int patientConsumptionId)
        {
            PatientConsumptionReceipt_DTO patientConsumption = new PatientConsumptionReceipt_DTO();
            patientConsumption = (from patcon in _patientConsumptionDbContext.PatientConsumption.Where(p => p.PatientConsumptionId == patientConsumptionId)
                                  join patVisit in _patientConsumptionDbContext.PatientVisits on patcon.PatientVisitId equals patVisit.PatientVisitId
                                  join pat in _patientConsumptionDbContext.Patient on patcon.PatientId equals pat.PatientId
                                  join subD in _patientConsumptionDbContext.CountrySubDivisions on pat.CountrySubDivisionId equals subD.CountrySubDivisionId
                                  join emp in _patientConsumptionDbContext.Employees on patcon.CreatedBy equals emp.EmployeeId
                                  join fy in _patientConsumptionDbContext.PharmacyFiscalYears on patcon.FiscalYearId equals fy.FiscalYearId
                                  join pres in _patientConsumptionDbContext.Employees on patcon.PrescriberId equals pres.EmployeeId into presGroup
                                  from prescriber in presGroup.DefaultIfEmpty()
                                  select new PatientConsumptionReceipt_DTO
                                  {
                                      ConsumptionReceiptNo = (int)patcon.ConsumptionReceiptNo,
                                      HospitalNo = pat.PatientCode,
                                      PatientName = pat.ShortName,
                                      Address = pat.Address,
                                      CountrySubDivisionName = subD.CountrySubDivisionName,
                                      CreatedOn = patcon.CreatedOn,
                                      Age = pat.Age,
                                      Sex = pat.Gender,
                                      ContactNo = pat.PhoneNumber,
                                      IpNo = patVisit.VisitCode,
                                      CurrentFiscalYearName = fy.FiscalYearName,
                                      UserName = emp.FullName,
                                      PrescriberName = prescriber != null ? prescriber.FullName : "",
                                      PrescriberNMCNo = prescriber != null ? prescriber.MedCertificationNo : "",
                                      SubTotal = patcon.SubTotal,
                                      TotalAmount = patcon.TotalAmount
                                  }).FirstOrDefault();


            patientConsumption.PatientConsumptionItems = (from patConItm in _patientConsumptionDbContext.PatientConsumptionItem.Where(a => a.PatientConsumptionId == patientConsumptionId)
                                                          select new PatientConsumptionReceiptItems_DTO
                                                          {
                                                              ItemName = patConItm.ItemName,
                                                              GenericName = patConItm.GenericName,
                                                              BatchNo = patConItm.BatchNo,
                                                              ExpiryDate = patConItm.ExpiryDate,
                                                              Quantity = patConItm.Quantity,
                                                              SalePrice = patConItm.SalePrice,
                                                              SubTotal = patConItm.SubTotal,
                                                              TotalAmount = patConItm.TotalAmount,
                                                              RackNo = (from itemrack in _patientConsumptionDbContext.PHRMRackItem.Where(ri => ri.ItemId == patConItm.ItemId && ri.StoreId == patConItm.StoreId)
                                                                        join rack in _patientConsumptionDbContext.PHRMRack on itemrack.RackId equals rack.RackId
                                                                        select rack.RackNo).FirstOrDefault()
                                                          }).ToList();

            return patientConsumption;
        }


        [HttpGet]
        [Route("ConsumptionsOfPatient")]
        public IActionResult PatientConsumptionsByPatientId(int patientId, int patientVisitId)
        {
            Func<object> func = () => (from patcon in _patientConsumptionDbContext.PatientConsumption.Where(pc => pc.PatientId == patientId && pc.PatientVisitId == patientVisitId && pc.BillingStatus == ENUM_BillingStatus.unpaid)
                                       join patVisit in _patientConsumptionDbContext.PatientVisits.Where(a => a.PatientVisitId == patientVisitId) on patcon.PatientVisitId equals patVisit.PatientVisitId
                                       join emp in _patientConsumptionDbContext.Employees on patcon.CreatedBy equals emp.EmployeeId
                                       select new
                                       {
                                           patcon.PatientConsumptionId,
                                           patcon.ConsumptionReceiptNo,
                                           IpNo = patVisit.VisitCode,
                                           ConsumptionDate = patcon.CreatedOn,
                                           patcon.TotalAmount,
                                           UserName = emp.FullName
                                       }).OrderByDescending(p => p.ConsumptionReceiptNo).ToList();

            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("WardSubStoreMapInfo")]
        public IActionResult GetWardSubStoreMapInfo(int wardId)
        {
            Func<object> func = () => (from wardSubStore in _patientConsumptionDbContext.WardSubStoresMaps.Where(a => a.IsActive && a.WardId == wardId)
                                       join store in _patientConsumptionDbContext.Stores on wardSubStore.StoreId equals store.StoreId
                                       select new
                                       {
                                           StoreId = store.StoreId,
                                           StoreName = store.Name,
                                           WardId = wardSubStore.WardId,
                                           IsDefault = wardSubStore.IsDefault
                                       }).ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("PatientConsumptionsOfNursing")]
        public IActionResult GetPatientConsumptionsFromNursing(string storeIds)
        {
            Func<object> func = () => GetPatientConsumptionsFromNursingList(storeIds);
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetPatientConsumptionsFromNursingList(string storeIds)
        {
            var patConsumptionList = (from con in _patientConsumptionDbContext.PatientConsumption.Where(a => a.BillingStatus == ENUM_BillingStatus.unpaid)
                                      join conitm in _patientConsumptionDbContext.PatientConsumptionItem.Where(pci => pci.IsFinalize == false) on con.PatientConsumptionId equals conitm.PatientConsumptionId
                                      join conretitm in (from patconret in _patientConsumptionDbContext.PatientConsumptionReturnItem
                                                         group patconret by patconret.PatientConsumptionItemId
                                                         into patConsumptionReturnGroup
                                                         select new
                                                         {
                                                             PatientConsumptionItemId = patConsumptionReturnGroup.Key,
                                                             TotalAmount = patConsumptionReturnGroup.Sum(a => a.TotalAmount)
                                                         }) on conitm.PatientConsumptionItemId equals conretitm.PatientConsumptionItemId into conretitmGroup
                                      from conretitm in conretitmGroup.DefaultIfEmpty()
                                      join pat in _patientConsumptionDbContext.Patient on conitm.PatientId equals pat.PatientId
                                      join patV in _patientConsumptionDbContext.PatientVisits on conitm.PatientVisitId equals patV.PatientVisitId
                                      where storeIds.Contains(con.StoreId.ToString())

                                      group new { conitm, conretitm } by new
                                      {
                                          pat.PatientId,
                                          pat.PatientCode,
                                          pat.ShortName,
                                          pat.Age,
                                          pat.Gender,
                                          pat.PhoneNumber,
                                          pat.Address,
                                          patV.VisitCode,
                                          patV.PatientVisitId
                                      } into g
                                      select new
                                      {
                                          PatientId = g.Key.PatientId,
                                          HospitalNo = g.Key.PatientCode,
                                          PatientName = g.Key.ShortName,
                                          Age = g.Key.Age,
                                          Sex = g.Key.Gender,
                                          ContactNo = g.Key.PhoneNumber,
                                          Address = g.Key.Address,
                                          IpNo = g.Key.VisitCode,
                                          PatientVisitId = g.Key.PatientVisitId,
                                          TotalAmount = g.Sum(x => x.conitm.TotalAmount - (x.conretitm != null ? x.conretitm.TotalAmount : 0)),
                                          LastConsumptionDate = g.Max(x => x.conitm.CreatedOn)
                                      }).Where(a => a.TotalAmount > 0).OrderByDescending(a => a.LastConsumptionDate).ToList();


            return patConsumptionList;
        }

        [HttpGet]
        [Route("ConsumptionsOfPatientFromNursing")]
        public IActionResult ConsumptionsOfPatientFromNursing(int patientId, int patientVisitId, string storeIds)
        {
            Func<object> func = () => (from patcon in _patientConsumptionDbContext.PatientConsumption.Where(pc => pc.PatientId == patientId && pc.PatientVisitId == patientVisitId && pc.BillingStatus == ENUM_BillingStatus.unpaid)
                                       join patVisit in _patientConsumptionDbContext.PatientVisits.Where(a => a.PatientVisitId == patientVisitId) on patcon.PatientVisitId equals patVisit.PatientVisitId
                                       join emp in _patientConsumptionDbContext.Employees on patcon.CreatedBy equals emp.EmployeeId
                                       where storeIds.Contains(patcon.StoreId.ToString())
                                       select new
                                       {
                                           patcon.PatientConsumptionId,
                                           patcon.ConsumptionReceiptNo,
                                           IpNo = patVisit,
                                           ConsumptionDate = patcon.CreatedOn,
                                           patcon.TotalAmount,
                                           UserName = emp.FullName
                                       }).OrderByDescending(p => p.ConsumptionReceiptNo).ToList();

            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("PharmacyIpBillingScheme")]
        public IActionResult GPharmacyIpBillingScheme(int schemeId)
        {

            Func<object> func = () => (from scheme in _patientConsumptionDbContext.Schemes
                                       join priceCategory in _patientConsumptionDbContext.PriceCategories on scheme.DefaultPriceCategoryId equals priceCategory.PriceCategoryId
                                       where scheme.IsActive == true && scheme.SchemeId == schemeId
                                       select new
                                       {
                                           SchemeId = scheme.SchemeId,
                                           SchemeCode = scheme.SchemeCode,
                                           SchemeName = scheme.SchemeName,
                                           CommunityName = scheme.CommunityName,
                                           IsDiscountApplicable = scheme.IsIpPhrmDiscountApplicable,
                                           DiscountPercent = scheme.IpPhrmDiscountPercent,
                                           IsDiscountEditable = scheme.IsIpPhrmDiscountEditable,
                                           IsMembershipApplicable = scheme.IsMembershipApplicable,
                                           IsMemberNumberCompulsory = scheme.IsMemberNumberCompulsory,
                                           DefaultPaymentMode = scheme.DefaultPaymentMode,
                                           IsCreditApplicable = scheme.IsIpPhrmCreditApplicable,
                                           IsCreditOnlyScheme = scheme.IsCreditOnlyScheme,
                                           CreditLimit = scheme.IpCreditLimit,
                                           DefaultCreditOrganizationId = scheme.DefaultCreditOrganizationId,
                                           IsCoPayment = scheme.IsPharmacyCoPayment,
                                           CoPaymentCashPercent = scheme.PharmacyCoPayCashPercent,
                                           CoPaymentCreditPercent = scheme.PharmacyCoPayCreditPercent,
                                           DefaultPriceCategoryId = scheme.DefaultPriceCategoryId,
                                           DefaultPriceCategoryName = priceCategory.PriceCategoryName,
                                           IsGeneralCreditLimited = scheme.IsGeneralCreditLimited,
                                           IsCreditLimited = scheme.IsIpCreditLimited,
                                           GeneralCreditLimit = scheme.GeneralCreditLimit
                                       }).FirstOrDefault();
            return InvokeHttpGetFunction<object>(func);
        }
    }
}
