using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.ServerModel.PharmacyModels;
using DanpheEMR.Utilities;
using DanpheEMR.ViewModel.Dispensary;
using DanpheEMR.ViewModel.Pharmacy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using DanpheEMR.Enums;
using DanpheEMR.ServerModel;
using Syncfusion.XlsIO;
using System.Data;
using System.IO;

namespace DanpheEMR.Controllers.Pharmacy
{
    public class PharmacyStockController : CommonController
    {
        private readonly PharmacyDbContext _pharmacyDbContext;
        public PharmacyStockController(IOptions<MyConfiguration> _config) : base(_config)
        {
            _pharmacyDbContext = new PharmacyDbContext(connString);
        }

        #region Start HTTP GET APIs

        #region Get All Ward Requisitions
        [HttpGet]
        [Route("WardRequisitions")]
        public IActionResult GetAllWardRequsitions(DateTime FromDate, DateTime ToDate)
        {
            //else if (reqType == "get-ward-requested-items")
            Func<object> func = () => GetWardRequestItems(FromDate, ToDate);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Drug Requsitions By RequisitionId
        [HttpGet]
        [Route("DrugRequisitions")]
        public IActionResult DrugRequsitions(int requisitionId)
        {
            //else if (reqType == "get-drugs-request-items")
            Func<object> func = () => GetDrugRequsitions(requisitionId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get requsted drug-list by patientId and VisitId (used in Emergency) 
        [HttpGet]
        [Route("DrugOrders")]
        public IActionResult GetDrugOrders(int patientId, int visitId)
        {
            //else if (reqType == "get-all-drugs-order")
            Func<object> func = () => GetAllDrugOrders(patientId, visitId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get All Dispatched Drugs By RequsitionId
        [HttpGet]
        [Route("DispatchedDrugItems")]
        public IActionResult DispatchedDrugItems(int requisitionId)
        {
            //else if (reqType == "get-drugs-dispatch-items")
            Func<object> func = () => GetDispatchedDrugItems(requisitionId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Write-Off List With SUM of WriteOff Qty 
        [HttpGet]
        [Route("WriteOffs")]
        public IActionResult GetWriteOffs()
        {
            //else if (reqType == "getWriteOffList")
            Func<object> func = () => GetWriteOffItems();
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Stock Details List
        [HttpGet]
        [Route("StockDetails")]
        public IActionResult StockDetails()
        {
            //else if (reqType == "stockDetails")
            Func<object> func = () => GetStockDetails();
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Narcotics Stock Details List (sales)
        [HttpGet]
        [Route("NarcoticsStock")]
        public IActionResult NarcoticsStock()
        {
            //else if (reqType == "natcoticsstockDetails")
            Func<object> func = () => GetNarcoticStockDetails();
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get WriteOff Items by WriteOffId
        [HttpGet]
        [Route("WriteOff")]
        public IActionResult WriteOffById(int writeOffId)
        {
            //else if (reqType == "getWriteOffItemsByWriteOffId")
            Func<object> func = () => GetWriteOffByWriteOffId(writeOffId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Stock Manage by Item Id
        [HttpGet]
        [Route("StockManage")]
        public IActionResult ManageStock(int itemId)
        {
            //else if (reqType == "stockManage" && itemId > 0)
            Func<object> func = () => GetManageStock(itemId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region GET: Stock Transaction Item List 
        [HttpGet]
        [Route("StockTransactions")]
        public IActionResult GetStockTransactions()
        {
            //else if (reqType == "getStockTxnItemList")
            Func<object> func = () => GetStockTransactionList();
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region GET: Stock Details with 0, null or >0 Quantity
        //this stock details with all unique (by ItemId,ExpiryDate,BatchNo)  records with sum of Quantity
        //items with 0 quantity or more than 0 showing in list
        [HttpGet]
        [Route("AllStockDetails")]
        public IActionResult GetAllStockDetail()
        {
            //else if (reqType == "allItemsStockDetails")
            Func<object> func = () => GetAllItemStockDetail();
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get RequisitionItems by Requisition Id don't check any status this for View Purpose
        [HttpGet]
        [Route("RequsitionItems")]
        public IActionResult RequsitionbyRequsitionId(int requisitionId)
        {
            //else if (reqType != null && reqType.ToLower() == "requisitionitemsforview")
            Func<object> func = () => GetRequisitionById(requisitionId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get dIspatch Details
        [HttpGet]
        [Route("DispatchDetail")]
        public IActionResult DispatchDetail(int requisitionId)
        {
            //else if (reqType != null && reqType.ToLower() == "dispatchview")
            Func<object> func = () => GetDispatchDetail(requisitionId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get dIspatch Details By DispatchId
        [HttpGet]
        [Route("Dispatch")]
        public IActionResult DispatchById(int dispatchId)
        {
            //else if (reqType != null && reqType.ToLower() == "dispatchviewbydispatchid")
            Func<object> func = () => GetDispatchByDispatchId(dispatchId);
            return InvokeHttpGetFunction<object>(func);
        }
        [HttpGet]
        [Route("MainStoreStock")]
        public IActionResult GetMainStoreStock(bool ShowAllStock)
        {
            Func<object> func = () => GetMainStoreStocks(ShowAllStock);
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetMainStoreStocks(bool ShowAllStock)
        {
            DataTable stockListVM = _pharmacyDbContext.GetMainStoreStock(ShowAllStock);
            return stockListVM;
        }
        [HttpGet]
        [Route(("MainStoreIncomingStock"))]
        public IActionResult GetMainStoreIncomingStock(DateTime FromDate, DateTime ToDate)
        {
            Func<object> func = () => GetMainStoreIncomingStocks(FromDate, ToDate);
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetMainStoreIncomingStocks(DateTime FromDate, DateTime ToDate)
        {
            GetMainStoreIncomingStockViewModel incomingStockListVm = _pharmacyDbContext.GetMainStoreIncomingStock(FromDate, ToDate);
            return incomingStockListVm;
        }
        [HttpGet]
        [Route("MainStoreIncomingStockById")]
        public IActionResult GetMainStoreIncomingStockById(int DispatchId)
        {
            Func<object> func = () => GetMainStoreIncomingStocks(DispatchId);
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetMainStoreIncomingStocks(int DispatchId)
        {
            GetMainStoreIncomingStockByIdViewModel dispatchDetailVM = _pharmacyDbContext.GetMainStoreIncomingStockById(DispatchId);
            return dispatchDetailVM;
        }
        [HttpGet]
        [Route("AvailableBatchesByItemId")]
        public IActionResult GetAvailableBatcheByItemId(int ItemId)
        {
            Func<object> func = () => GetAvailableBatchesByItemId(ItemId);
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetAvailableBatchesByItemId(int ItemId)
        {
            var availableBatches = _pharmacyDbContext.StoreStocks.Include("StockMaster").Where(stock => stock.ItemId == ItemId).Select(stock => new { stock.StockMaster.BatchNo, stock.StockMaster.ExpiryDate, stock.StockMaster.SalePrice }).ToList();
            if (availableBatches.Count == 0) { throw new Exception("No stocks were found for this item."); }
            return availableBatches;
        }
        #endregion
        [HttpPut]
        [Route("ReceiveIncomingStock")]
        public IActionResult ReceiveIncomingStock(int DispatchId, [FromBody] string ReceivingRemarks)
        {
            var currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => _pharmacyDbContext.ReceiveIncomingStockAsync(DispatchId, ReceivingRemarks, currentUser);
            return InvokeHttpPutFunction<object>(func);
        }
        [HttpGet]
        [Route("RequisitionDetailsForDispatch")]
        public IActionResult GetRequisitionDetailsForDispatch(int RequisitionId)
        {
            Func<object> func = () => _pharmacyDbContext.GetRequisitionDetailsForDispatch(RequisitionId);
            return InvokeHttpGetFunction<object>(func);

        }
        [HttpPost]
        [Route("DirectDispatch")]
        public IActionResult PostDirectDispatch([FromBody] List<PHRMDispatchItemsModel> dispatchedItems)
        {
            var currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => PharmacyBL.DirectDispatch(dispatchedItems, _pharmacyDbContext, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }
        [HttpPost]
        [Route("StoreDispatch")]
        public IActionResult PostStoreDispatch([FromBody] IList<PostStoreDispatchViewModel> dispatchItems)
        {
            Func<object> func = () => PostStoreDispatchItems(dispatchItems);
            return InvokeHttpPostFunction<object>(func);
        }
        [HttpPost]
        [Route("SubStoreDispatch")]
        public IActionResult PostSubStoreDispatch([FromBody] IList<PostStoreDispatchViewModel> dispatchItems)
        {
            Func<object> func = () => PostSubstoreDispatchDetail(dispatchItems);
            return InvokeHttpPostFunction<object>(func);
        }
        private object PostSubstoreDispatchDetail(IList<PostStoreDispatchViewModel> dispatchItems)
        {
            if (dispatchItems != null && dispatchItems.Count > 0)
            {
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
                var dispatchId = _pharmacyDbContext.PostSubStoreDispatch(dispatchItems, currentUser);
                return dispatchId;
            }
            else
            {
                throw new Exception("Dispatch Items is null");
            }
        }
        private object PostStoreDispatchItems(IList<PostStoreDispatchViewModel> dispatchItems)
        {
            if (dispatchItems != null && dispatchItems.Count > 0)
            {
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
                var dispatchId = PostStoreDispatchFunc.PostStoreDispatch(_pharmacyDbContext, dispatchItems, currentUser);
                return dispatchId;
            }
            return new Exception("Dispatch Items Not Found");
        }
        [HttpPut]
        [Route("StockMRP")]
        public IActionResult UpdateStockMRP([FromBody] PHRMUpdatedStockVM mrpUpdatedStock)
        {

            var currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => PharmacyBL.UpdateMRPForAllStock(mrpUpdatedStock, _pharmacyDbContext, currentUser);
            return InvokeHttpPutFunction<object>(func);
        }
        [HttpPut]
        [Route("StockExpiryDateandBatchNo")]
        public IActionResult UpdateStockExpiryDateandBatchNo([FromBody] PHRMUpdatedStockVM expbatchUpdatedStock)
        {
            var currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => PharmacyBL.UpdateStockExpiryDateandBatchNoForAllStock(expbatchUpdatedStock, _pharmacyDbContext, currentUser);
            return InvokeHttpPutFunction<object>(func);
        }
        [HttpGet]
        [Route("ExportStocksForReconciliationToExcel")]
        public IActionResult ExportStockForReconciliationToExcel()
        {
            Func<object> func = () => ExportStocksForReconciliationToExcel();
            return InvokeHttpGetFunction<object>(func);
        }
        private object ExportStocksForReconciliationToExcel()
        {
            string tempFIleName = "PharmacyStockReconciliation_" + DateTime.Now.ToString("yyyy-MM-dd h:mm tt");
            string tempFIleName1 = tempFIleName.Replace(" ", "-");
            string fileName = tempFIleName1.Replace(":", "-");

            //To get Stock Data
            DataTable stockListVM = _pharmacyDbContext.GetMainStoreStock(true);

            //To Made available Quantity at last
            int index = stockListVM.Columns.Count;
            stockListVM.Columns["AvailableQuantity"].SetOrdinal(index - 1);

            //Add New Column 
            stockListVM.Columns.Add("NewAvailableQuantity");

            //To copy all the stock AvailableQuantity into Column NewAvailableQuantity
            foreach (DataRow row in stockListVM.Rows)
            {
                row["NewAvailableQuantity"] = row["AvailableQuantity"];
            }

            byte[] fileByteArray;

            #region Save Excel File with the protection
            using (ExcelEngine engine = new ExcelEngine())
            {
                IApplication application = engine.Excel;
                application.DefaultVersion = ExcelVersion.Xlsx;

                IWorkbook workbook = application.Workbooks.Create(1);
                IWorksheet sheet = workbook.Worksheets[0];

                sheet.ImportDataTable(stockListVM, true, 1, 1, true);

                IListObject listObj = sheet.ListObjects.Create("PharmacyStockList", sheet.UsedRange);
                listObj.BuiltInTableStyle = TableBuiltInStyles.TableStyleLight14;
                sheet.UsedRange.AutofitColumns();

                int colcount = sheet.Columns.Count();
                int rowcount = sheet.Rows.Count();

                sheet.Protect("", ExcelSheetProtection.All);
                int av = 64 + colcount;
                for (int i = colcount - 1; i < colcount; i++)
                {
                    for (int j = 1; j < rowcount - 1; j++)
                    {
                        string value = Convert.ToChar(av) + j.ToString();
                        sheet[value].CellStyle.Locked = false;
                    }
                    av++;
                }

                using (var memoryStream = new MemoryStream())
                {
                    workbook.SaveAs(memoryStream);
                    fileByteArray = memoryStream.ToArray();
                }

            }
            #endregion

            return File(fileByteArray, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName + ".xlsx");
        }


        #endregion

        #region Start HTTP POST APIs

        #region Save Drugs Requisition
        [HttpPost]
        [Route("DrugRequsition")]
        public IActionResult SaveDrugRequsitions()
        {
            //else if (reqType == "drug-requistion")
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => SaveDrugRequsitions(str, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }
        #endregion

        #region Save WriteOff
        [HttpPost]
        [Route("WriteOff")]
        public IActionResult SaveWriteOff()
        {
            //else if (reqType != null && reqType == "postWriteOffItems")
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => SaveWriteOff(str, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }
        #endregion

        #region POST : update stockManage transaction, Post to StockManage table and post to stockTxnItem table                 
        [HttpPost]
        [Route("ManageStock")]
        public IActionResult SaveManageStock()
        {
            //else if (reqType == "manage-stock-detail")
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => SaveManageStock(str, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }
        #endregion

        #region POST : Update StoreManage Transaction, Post To StoreStock Table                        
        [HttpPost]
        [Route("ManageStore")]
        public IActionResult SaveManageStore()
        {
            //else if (reqType == "manage-store-detail")
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => SaveManageStore(str, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }
        #endregion

        #region POST: Transfer to Dispensary, Update Store Stock                    
        [HttpPost]
        [Route("TransferToDispensary")]
        public IActionResult TransferToDispensary()
        {
            //else if (reqType == "transfer-to-dispensary")
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => TransferToDispensary(str, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }
        #endregion

        #region POST: transfer to Store, update Dispensary Stock              
        [HttpPost]
        [Route("TransferToStore")]
        public IActionResult TransferToStore(int storeId)
        {
            //else if (reqType == "transfer-to-store")
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => TransferToStore(str, currentUser, storeId);
            return InvokeHttpPostFunction<object>(func);
        }
        #endregion

        #endregion

        #region Private Methods Used By HTTP APIs
        private object GetWardRequestItems(DateTime FromDate, DateTime ToDate)
        {
            var realToDate = ToDate.AddDays(1);
            var wardReqList = (from R in _pharmacyDbContext.StoreRequisition
                               join E in _pharmacyDbContext.Employees on R.CreatedBy equals E.EmployeeId
                               join S in _pharmacyDbContext.PHRMStore.Where(s => s.Category == "substore") on R.StoreId equals S.StoreId
                               select new GetAllRequisitionDTO
                               {
                                   RequisitionId = R.RequisitionId,
                                   RequisitionNo = R.RequisitionNo,
                                   RequisitionDate = R.RequisitionDate,
                                   RequisitionStatus = R.RequisitionStatus,
                                   RequistingStore = S.Name,
                                   CreatedByName = E.Salutation + ". " + E.FirstName + " " + (string.IsNullOrEmpty(E.MiddleName) ? "" : E.MiddleName + " ") + E.LastName,
                                   CanDispatchItem = true,
                                   CanApproveTransfer = (R.RequisitionStatus == "pending") ? true : false
                               }).Where(s => s.RequisitionDate >= FromDate && s.RequisitionDate <= realToDate).OrderByDescending(s => s.RequisitionDate).ThenBy(s => s.CanApproveTransfer == false).ThenBy(s => s.RequisitionStatus).ToList();
            return wardReqList;
        }

        private object GetDrugRequsitions(int requisitionId)
        {
            var drugsItem = (from itm in _pharmacyDbContext.DrugRequistionItem
                             join itmReq in _pharmacyDbContext.DrugRequistion on itm.RequisitionId equals itmReq.RequisitionId
                             join itmName in _pharmacyDbContext.PHRMItemMaster on itm.ItemId equals itmName.ItemId
                             where itm.RequisitionId == requisitionId
                             select new
                             {
                                 RequisitionItemId = itm.RequisitionItemId,
                                 RequisitionId = itm.RequisitionId,
                                 ItemId = itm.ItemId,
                                 Quantity = itm.Quantity,
                                 ItemName = itmName.ItemName,
                                 PatientId = itmReq.PatientId,
                             }).ToList();
            return drugsItem;
        }

        private object GetAllDrugOrders(int patientId, int visitId)
        {
            var drugsItem = (from itm in _pharmacyDbContext.DrugRequistionItem
                             join itmReq in _pharmacyDbContext.DrugRequistion on itm.RequisitionId equals itmReq.RequisitionId
                             join itmName in _pharmacyDbContext.PHRMItemMaster on itm.ItemId equals itmName.ItemId
                             where itmReq.PatientId == patientId && itmReq.VisitId == visitId
                             select new
                             {
                                 RequisitionItemId = itm.RequisitionItemId,
                                 RequisitionId = itm.RequisitionId,
                                 ItemId = itm.ItemId,
                                 Quantity = itm.Quantity,
                                 ItemName = itmName.ItemName,
                                 PatientId = itmReq.PatientId,
                                 PatientVisitId = itmReq.VisitId,
                                 Status = itmReq.Status,
                                 RequestedOn = itmReq.CreatedOn
                             }).ToList();
            return drugsItem;
        }

        private object GetDispatchedDrugItems(int requisitionId)
        {
            var result = new object();
            var itm = (from phrmItm in _pharmacyDbContext.DrugRequistion
                       where phrmItm.RequisitionId == requisitionId
                       select phrmItm).FirstOrDefault();

            if (itm.ReferenceId is null)
            {
                result = null;
            }
            else
            {
                List<int> items = itm.ReferenceId.Split(',').Select(int.Parse).ToList();

                var drugsItem = (from drugItems in _pharmacyDbContext.PHRMInvoiceTransactionItems
                                 join itmName in _pharmacyDbContext.PHRMItemMaster on drugItems.ItemId equals itmName.ItemId
                                 where items.Contains(drugItems.InvoiceItemId)
                                 select new
                                 {
                                     ItemId = drugItems.ItemId,
                                     Quantity = drugItems.Quantity,
                                     ItemName = itmName.ItemName,
                                 }).ToList();
                result = drugsItem;
            }
            return result;
        }

        private object GetWriteOffItems()
        {
            var writeOffList = (from writeOff in _pharmacyDbContext.PHRMWriteOff
                                join writeOffItm in _pharmacyDbContext.PHRMWriteOffItem on writeOff.WriteOffId equals writeOffItm.WriteOffId
                                join itm in _pharmacyDbContext.PHRMItemMaster on writeOffItm.ItemId equals itm.ItemId
                                group new { writeOff, writeOffItm, itm } by new
                                {
                                    writeOff.WriteOffId

                                } into p
                                select new
                                {
                                    ItemName = p.Select(a => a.itm.ItemName),
                                    WriteOffId = p.Key.WriteOffId,
                                    BatchNo = p.Select(a => a.writeOffItm.BatchNo),
                                    WriteOffDate = p.Select(a => a.writeOff.WriteOffDate).FirstOrDefault(),
                                    ItemPrice = p.Select(a => a.writeOffItm.ItemPrice),
                                    Quantity = p.Sum(a => a.writeOffItm.WriteOffQuantity),
                                    SubTotal = p.Select(a => a.writeOff.SubTotal).FirstOrDefault(),
                                    DiscountAmount = p.Select(a => a.writeOff.DiscountAmount).FirstOrDefault(),
                                    VATAmount = p.Select(a => a.writeOff.VATAmount).FirstOrDefault(),
                                    TotalAmount = p.Select(a => a.writeOff.TotalAmount).FirstOrDefault(),
                                    Remarks = p.Select(a => a.writeOff.WriteOffRemark).FirstOrDefault()

                                }).ToList().OrderByDescending(a => a.WriteOffId);
            return writeOffList;
        }

        private object GetStockDetails()
        {
            var totalStock = (from itm in _pharmacyDbContext.StoreStocks
                              join mstitem in _pharmacyDbContext.PHRMItemMaster on itm.ItemId equals mstitem.ItemId
                              select new
                              {
                                  ItemId = itm.ItemId,
                                  BatchNo = itm.StockMaster.BatchNo,
                                  ExpiryDate = itm.StockMaster.ExpiryDate,
                                  ItemName = mstitem.ItemName,
                                  AvailableQuantity = itm.AvailableQuantity,
                                  SalePrice = itm.StockMaster.SalePrice,
                                  IsActive = true,
                                  DiscountPercentage = 0
                              }).ToList();
            return totalStock;
        }

        private object GetNarcoticStockDetails()
        {
            var totalStock = (from itm in _pharmacyDbContext.StoreStocks
                              join mstitem in _pharmacyDbContext.PHRMItemMaster on itm.ItemId equals mstitem.ItemId
                              where mstitem.IsNarcotic == true
                              select new
                              {
                                  ItemId = itm.ItemId,
                                  BatchNo = itm.StockMaster.BatchNo,
                                  ExpiryDate = itm.StockMaster.ExpiryDate,
                                  ItemName = mstitem.ItemName,
                                  AvailableQuantity = itm.AvailableQuantity,
                                  SalePrice = itm.StockMaster.SalePrice,
                                  IsActive = true,
                                  DiscountPercentage = 0
                              }).ToList();
            return totalStock;
        }

        private object GetWriteOffByWriteOffId(int writeOffId)
        {
            var WriteOffItemsByWriteOffIdList = (from writeOffItm in _pharmacyDbContext.PHRMWriteOffItem
                                                 join writeOff in _pharmacyDbContext.PHRMWriteOff on writeOffItm.WriteOffId equals writeOff.WriteOffId
                                                 join itm in _pharmacyDbContext.PHRMItemMaster on writeOffItm.ItemId equals itm.ItemId
                                                 where writeOffItm.WriteOffId == writeOffId
                                                 select new
                                                 {
                                                     ItemName = itm.ItemName,
                                                     WriteOffId = writeOffItm.WriteOffId,
                                                     BatchNo = writeOffItm.BatchNo,
                                                     WriteOffQuantity = writeOffItm.WriteOffQuantity,
                                                     ItemPrice = writeOffItm.ItemPrice,
                                                     SubTotal = writeOffItm.SubTotal,
                                                     DiscountPercentage = writeOffItm.DiscountPercentage,
                                                     VATPercentage = writeOffItm.VATPercentage,
                                                     TotalAmount = writeOffItm.TotalAmount
                                                 }).ToList();
            var WriteOff = (from writeOff in _pharmacyDbContext.PHRMWriteOff
                            join emp in _pharmacyDbContext.Employees on writeOff.CreatedBy equals emp.EmployeeId
                            where writeOff.WriteOffId == writeOffId
                            select new
                            {
                                WriteOffId = writeOff.WriteOffId,
                                CreatedOn = writeOff.CreatedOn,
                                SubTotal = writeOff.SubTotal,
                                DiscountAmount = writeOff.DiscountAmount,
                                VATAmount = writeOff.VATAmount,
                                TotalAmount = writeOff.TotalAmount,
                                Remark = writeOff.WriteOffRemark,
                                UserName = emp.FullName
                            }
                      ).FirstOrDefault();
            var WriteOffdata = new { WriteOffitemsdetails = WriteOffItemsByWriteOffIdList, WriteOffdetails = WriteOff };
            return WriteOffdata;
        }

        private object GetManageStock(int itemId)
        {
            var stkManage = (from gritm in _pharmacyDbContext.PHRMGoodsReceiptItems
                             where (gritm.ItemId == itemId && gritm.AvailableQuantity > 0)
                             select new
                             {
                                 GoodReceiptItemId = gritm.GoodReceiptItemId,
                                 ItemId = gritm.ItemId,
                                 ItemName = gritm.ItemName,
                                 BatchNo = gritm.BatchNo,
                                 GRItemPrice = gritm.GRItemPrice,
                                 ExpiryDate = gritm.ExpiryDate,
                                 //ManufactureDate = gritm.ManufactureDate,
                                 curtQuantity = gritm.AvailableQuantity,
                                 modQuantity = gritm.AvailableQuantity,
                                 ReceivedQuantity = gritm.ReceivedQuantity,
                             }).ToList();

            var stkZeroManage = (from gritm in _pharmacyDbContext.PHRMGoodsReceiptItems
                                 where (gritm.ItemId == itemId && gritm.AvailableQuantity == 0)
                                 select new
                                 {
                                     GoodReceiptItemId = gritm.GoodReceiptItemId,
                                     ItemId = gritm.ItemId,
                                     ItemName = gritm.ItemName,
                                     BatchNo = gritm.BatchNo,
                                     GRItemPrice = gritm.GRItemPrice,
                                     ExpiryDate = gritm.ExpiryDate,
                                     // ManufactureDate = gritm.ManufactureDate,
                                     curtQuantity = gritm.AvailableQuantity,
                                     modQuantity = gritm.AvailableQuantity,
                                     ReceivedQuantity = gritm.ReceivedQuantity,
                                 }
                       ).ToList();
            var finalStkManage = new { stockDetails = stkManage, zeroStockDetails = stkZeroManage };
            return finalStkManage;
        }

        private object GetStockTransactionList()
        {
            var result = (from stktxnitm in _pharmacyDbContext.StoreStocks
                          join itm in _pharmacyDbContext.PHRMItemMaster
                          on stktxnitm.ItemId equals itm.ItemId
                          select new
                          {
                              StockId = stktxnitm.StockId,
                              ItemID = stktxnitm.ItemId,
                              ItemName = itm.ItemName,
                              BatchNo = stktxnitm.StockMaster.BatchNo,
                              Quantity = stktxnitm.AvailableQuantity,
                              Price = stktxnitm.StockMaster.CostPrice,
                              SalePrice = stktxnitm.StockMaster.SalePrice,
                              ExpiryDate = stktxnitm.StockMaster.ExpiryDate
                          }).ToList();
            return result;
        }

        private object GetAllItemStockDetail()
        {
            var totalStock = (from stk in _pharmacyDbContext.StoreStocks
                              join store in _pharmacyDbContext.PHRMStore on stk.StoreId equals store.StoreId
                              join itm in _pharmacyDbContext.PHRMItemMaster on stk.ItemId equals itm.ItemId
                              join gen in _pharmacyDbContext.PHRMGenericModel on itm.GenericId equals gen.GenericId into gens
                              from genLj in gens.DefaultIfEmpty()
                              group new { stk, itm, genLj } by new { stk.ItemId, stk.StockMaster.BatchNo, stk.StockMaster.ExpiryDate, stk.StockMaster.CostPrice, stk.StockMaster.SalePrice, itm.ItemName, stk.StoreId, store.Name } into stkGrouped
                              select new GetDispensaryStockVm
                              {
                                  StoreId = stkGrouped.Key.StoreId,
                                  StoreName = stkGrouped.Key.Name,
                                  ItemId = stkGrouped.Key.ItemId,
                                  GenericName = (stkGrouped.FirstOrDefault().genLj != null) ? stkGrouped.FirstOrDefault().genLj.GenericName : "N/A",
                                  ItemName = stkGrouped.Key.ItemName,
                                  BatchNo = stkGrouped.Key.BatchNo,
                                  ExpiryDate = stkGrouped.Key.ExpiryDate.Value,
                                  SalePrice = stkGrouped.Key.SalePrice,
                                  CostPrice = stkGrouped.Key.CostPrice,
                                  AvailableQuantity = stkGrouped.Sum(s => s.stk.AvailableQuantity),
                                  IsInsuranceApplicable = stkGrouped.FirstOrDefault().itm.IsInsuranceApplicable,
                                  GovtInsurancePrice = stkGrouped.FirstOrDefault().itm.GovtInsurancePrice,
                                  RackNo = (from itemrack in _pharmacyDbContext.PHRMRackItem.Where(ri => ri.ItemId == stkGrouped.Key.ItemId && ri.StoreId == stkGrouped.FirstOrDefault().stk.StoreId)
                                            join rack in _pharmacyDbContext.PHRMRack on itemrack.RackId equals rack.RackId
                                            select rack.RackNo).FirstOrDefault()
                              }).ToList();
            if (totalStock == null)
            {
                throw new Exception("Stock Not Found.");
            }
            else
            {
                return totalStock;
            }
        }

        private object GetRequisitionById(int requisitionId)
        {
            //this for get employee Name

            var requistionDate = (from req in _pharmacyDbContext.StoreRequisition
                                  where req.RequisitionId == requisitionId
                                  select req.RequisitionDate).FirstOrDefault();

            var requestedFromSourceStore = (from req in _pharmacyDbContext.StoreRequisition
                                            join S in _pharmacyDbContext.PHRMStore on req.StoreId equals S.StoreId
                                            where req.RequisitionId == requisitionId
                                            select S.Name).FirstOrDefault();

            var requisitionItems = (from reqItems in _pharmacyDbContext.StoreRequisitionItems
                                    join itm in _pharmacyDbContext.PHRMItemMaster on reqItems.ItemId equals itm.ItemId
                                    from Gen in _pharmacyDbContext.PHRMGenericModel.Where(g => g.GenericId == itm.GenericId).DefaultIfEmpty()
                                    where reqItems.RequisitionId == requisitionId
                                    select new
                                    {
                                        reqItems.ItemId,
                                        reqItems.RequisitionItemId,
                                        reqItems.PendingQuantity,
                                        reqItems.Quantity,
                                        reqItems.Remark,
                                        reqItems.ReceivedQuantity,
                                        reqItems.CreatedBy,
                                        CreatedOn = requistionDate,
                                        reqItems.RequisitionItemStatus,
                                        itm.ItemName,
                                        Gen.GenericName,
                                        reqItems.RequisitionId
                                    }
                                 ).ToList();
            var employeeList = (from emp in _pharmacyDbContext.Employees select emp).ToList();

            var requestDetails = (from reqItem in requisitionItems
                                  join emp in _pharmacyDbContext.Employees on reqItem.CreatedBy equals emp.EmployeeId
                                  join dispJoined in _pharmacyDbContext.StoreDispatchItems on reqItem.RequisitionItemId equals dispJoined.RequisitionItemId into dispTemp
                                  from disp in dispTemp.DefaultIfEmpty()
                                  select new
                                  {
                                      reqItem.ItemId,
                                      PendingQuantity = reqItem.PendingQuantity,
                                      reqItem.Quantity,
                                      reqItem.Remark,
                                      ReceivedQuantity = reqItem.ReceivedQuantity,
                                      reqItem.CreatedBy,
                                      CreatedByName = emp.FullName,
                                      reqItem.CreatedOn,
                                      reqItem.RequisitionItemStatus,
                                      reqItem.ItemName,
                                      reqItem.GenericName,
                                      reqItem.RequisitionId,
                                      ReceivedBy = disp == null ? "" : disp.ReceivedBy,
                                      DispatchedByName = disp == null ? "" : employeeList.Find(a => a.EmployeeId == disp.CreatedBy).FullName,
                                      RequestedSourceStore = requestedFromSourceStore
                                  }
                ).ToList().GroupBy(a => a.ItemId).Select(g => new
                {
                    ItemId = g.Key,
                    PendingQuantity = g.Select(a => a.PendingQuantity).FirstOrDefault(),
                    Quantity = g.Select(a => a.Quantity).FirstOrDefault(),
                    Remark = g.Select(a => a.Remark).FirstOrDefault(),
                    ReceivedQuantity = g.Select(a => a.ReceivedQuantity).FirstOrDefault(),
                    CreatedBy = g.Select(a => a.CreatedBy).FirstOrDefault(),
                    CreatedByName = g.Select(a => a.CreatedByName).FirstOrDefault(),
                    CreatedOn = g.Select(a => a.CreatedOn).FirstOrDefault(),
                    RequisitionItemStatus = g.Select(a => a.RequisitionItemStatus).FirstOrDefault(),
                    ItemName = g.Select(a => a.ItemName).FirstOrDefault(),
                    GenericName = g.Select(a => a.GenericName).FirstOrDefault(),
                    RequisitionId = g.Select(a => a.RequisitionId).FirstOrDefault(),
                    ReceivedBy = g.Select(a => a.ReceivedBy).FirstOrDefault(),
                    DispatchedByName = g.Select(a => a.DispatchedByName).FirstOrDefault(),
                    RequestedSourceStore = g.Select(a => a.RequestedSourceStore).FirstOrDefault()
                }).ToList();
            return requestDetails;
        }

        private object GetDispatchDetail(int requisitionId)
        {
            var requestDetails = (from DI in _pharmacyDbContext.StoreDispatchItems.Where(d => d.RequisitionId == requisitionId)
                                  from R in _pharmacyDbContext.StoreRequisition.Where(r => r.RequisitionId == DI.RequisitionId)
                                  from CreatedBy in _pharmacyDbContext.Employees.Where(e => e.EmployeeId == R.CreatedBy)
                                  from DispatchedBy in _pharmacyDbContext.Employees.Where(e => e.EmployeeId == DI.CreatedBy)
                                  from store in _pharmacyDbContext.PHRMStore.Where(s => s.StoreId == DI.SourceStoreId).DefaultIfEmpty()
                                  from st in _pharmacyDbContext.PHRMStore.Where(s => s.StoreId == DI.TargetStoreId).DefaultIfEmpty()
                                  from ReceivedBy in _pharmacyDbContext.Employees.Where(e => e.EmployeeId == DI.ReceivedById).DefaultIfEmpty()
                                  group new { DI, R, CreatedBy, DispatchedBy, ReceivedBy, st, store } by DI.DispatchId into D
                                  select new
                                  {
                                      DispatchId = D.Key,
                                      RequisitionId = D.FirstOrDefault().R.RequisitionId,
                                      RequisitionNo = D.FirstOrDefault().R.RequisitionNo,
                                      CreatedByName = D.FirstOrDefault().CreatedBy.FullName,
                                      CreatedOn = D.FirstOrDefault().DI.DispatchedDate,
                                      DispatchedByName = D.FirstOrDefault().DispatchedBy.FullName,
                                      ReceivedBy = (D.FirstOrDefault().DI != null) ? D.FirstOrDefault().DI.ReceivedBy : "",
                                      SourceStore = D.FirstOrDefault().store.Name,
                                      TargetStore = D.FirstOrDefault().st.Name
                                  }).ToList();

            return requestDetails;
        }

        private object GetDispatchByDispatchId(int dispatchId)
        {
            var dispatchDetails = (from disp in _pharmacyDbContext.StoreDispatchItems
                                   where dispatchId == disp.DispatchId
                                   join item in _pharmacyDbContext.PHRMItemMaster on disp.ItemId equals item.ItemId
                                   from store in _pharmacyDbContext.PHRMStore.Where(s => s.StoreId == disp.SourceStoreId).DefaultIfEmpty()
                                   from st in _pharmacyDbContext.PHRMStore.Where(s => s.StoreId == disp.TargetStoreId).DefaultIfEmpty()
                                       /*join map in phrmdbcontext.PHRMRackItem on item.ItemId equals map.ItemId into items
                                       from itemdata in items.DefaultIfEmpty()
                                       join rack in phrmdbcontext.PHRMRack on itemdata.RackId equals rack.RackId into racks
                                       from rackdata in racks.DefaultIfEmpty()*/
                                   join generic in _pharmacyDbContext.PHRMGenericModel on item.GenericId equals generic.GenericId
                                   join reqitm in _pharmacyDbContext.StoreRequisitionItems on disp.RequisitionItemId equals reqitm.RequisitionItemId
                                   from R in _pharmacyDbContext.StoreRequisition.Where(r => r.RequisitionId == disp.RequisitionId)
                                   join emp in _pharmacyDbContext.Employees on disp.CreatedBy equals emp.EmployeeId
                                   from uom in _pharmacyDbContext.PHRMUnitOfMeasurement.Where(U => U.UOMId == item.UOMId).DefaultIfEmpty()
                                   select new
                                   {
                                       disp.DispatchId,
                                       disp.ItemId,
                                       ToRackNo1 = (from rackItem in _pharmacyDbContext.PHRMRackItem.Where(ri => ri.ItemId == item.ItemId && ri.StoreId == disp.TargetStoreId)
                                                    join rack in _pharmacyDbContext.PHRMRack on rackItem.RackId equals rack.RackId
                                                    select rack.RackNo)
                                                 .FirstOrDefault(),
                                       FromRack1 = (from rackItem in _pharmacyDbContext.PHRMRackItem.Where(ri => ri.ItemId == item.ItemId && ri.StoreId == 1)
                                                    join rack in _pharmacyDbContext.PHRMRack on rackItem.RackId equals rack.RackId
                                                    select rack.RackNo)
                                                 .FirstOrDefault(),
                                       reqitm.RequisitionId,
                                       CreatedByName = emp.Salutation + ". " + emp.FirstName + " " + (string.IsNullOrEmpty(emp.MiddleName) ? "" : emp.MiddleName + " ") + emp.LastName,
                                       disp.CreatedOn,
                                       RequisitionDate = reqitm.CreatedOn,
                                       StandardRate = 0,
                                       item.ItemName,
                                       generic.GenericName,
                                       UOMName = uom.UOMName ?? "N/A",
                                       ItemCode = item.ItemCode ?? "N/A",
                                       disp.BatchNo,
                                       disp.ExpiryDate,
                                       disp.DispatchedQuantity,
                                       disp.CostPrice,
                                       ReceivedBy = disp == null ? null : disp.ReceivedBy,
                                       RequistionNo = R.RequisitionNo,
                                       SourceStore = store.Name,
                                       TargetStore = st.Name,
                                       DispatchedDate = disp.DispatchedDate,
                                       DispatchedByName = emp.FullName
                                   }).ToList();
            return dispatchDetails;
        }

        private object SaveDrugRequsitions(string str, RbacUser currentUser)
        {
            PHRMDrugsRequistionModel drugReq = DanpheJSONConvert.DeserializeObject<PHRMDrugsRequistionModel>(str);
            drugReq.CreatedOn = System.DateTime.Now;
            drugReq.CreatedBy = currentUser.EmployeeId;
            drugReq.Status = "pending";
            _pharmacyDbContext.DrugRequistion.Add(drugReq);
            _pharmacyDbContext.SaveChanges();
            return drugReq;
        }

        private object SaveWriteOff(string str, RbacUser currentUser)
        {
            PHRMWriteOffModel writeOffModel = DanpheJSONConvert.DeserializeObject<PHRMWriteOffModel>(str);
            try
            {
                if (writeOffModel == null) throw new Exception("Write Off Model cannot be null");
                if (writeOffModel.phrmWriteOffItem == null) throw new Exception("No items to write-off");

                return PharmacyBL.WriteOffItemTransaction(writeOffModel, _pharmacyDbContext, currentUser);
            }
            catch (Exception ex)
            {
                throw new Exception("Write Off Items is null or failed to Save. Exception Detail: " + ex.Message.ToString());
            }
        }

        private object SaveManageStock(string str, RbacUser currentUser)
        {
            PHRMStockManageModel stockManageData = DanpheJSONConvert.DeserializeObject<PHRMStockManageModel>(str);
            if (stockManageData != null)
            {
                Boolean flag = false;
                flag = PharmacyBL.StockManageTransaction(stockManageData, _pharmacyDbContext, currentUser);
                if (flag)
                {
                    return 1;
                }
                else
                {
                    throw new Exception("Write Off Items is null or failed to Save");
                }
            }
            else
            {
                throw new Exception("No Data Found.");
            }
        }

        private object SaveManageStore(string str, RbacUser currentUser)
        {
            ManageStockItem manageStock = DanpheJSONConvert.DeserializeObject<ManageStockItem>(str);
            if (manageStock != null)
            {
                Boolean flag = false;
                flag = PharmacyBL.StoreManageTransaction(manageStock, _pharmacyDbContext, currentUser);
                if (flag)
                {
                    return 1;
                }
                else
                {
                    throw new Exception("Write Off Items is null or failed to Save");
                }
            }
            else
            {
                throw new Exception("No Data Found for ManageStorck.");
            }
        }

        private object TransferToDispensary(string str, RbacUser currentUser)
        {
            PHRMStockTransactionModel storeStockData = DanpheJSONConvert.DeserializeObject<PHRMStockTransactionModel>(str);
            if (storeStockData != null)
            {
                using (var dbContextTransaction = _pharmacyDbContext.Database.BeginTransaction())
                {
                    try
                    {
                        Boolean flag = false;
                        flag = PharmacyBL.TransferStoreStockToDispensary(storeStockData, _pharmacyDbContext, currentUser);
                        if (flag)
                        {
                            dbContextTransaction.Commit();//Commit Transaction
                            return 1;
                        }
                        else
                        {
                            dbContextTransaction.Rollback();//Rollback transaction
                            throw new Exception("Transfer failed");
                        }
                    }
                    catch (Exception ex)
                    {
                        dbContextTransaction.Rollback();
                        throw ex;
                    }
                }
            }
            else
            {
                throw new Exception("Invalid Input Supplied.");
            }
        }

        private object TransferToStore(string str, RbacUser currentUser, int StoreId)
        {
            PHRMStockTransactionModel dispensaryStockData = DanpheJSONConvert.DeserializeObject<PHRMStockTransactionModel>(str);
            if (dispensaryStockData != null)
            {
                Boolean flag = false;
                flag = PharmacyBL.TransferDispensaryStockToStore(dispensaryStockData, StoreId, _pharmacyDbContext, currentUser);
                if (flag)
                {
                    return 1;
                }
                else
                {
                    throw new Exception("Transfer failed");
                }
            }
            else
            {
                throw new Exception("Invalid Input Data Supplied.");
            }
        }
        #endregion

    }
}

