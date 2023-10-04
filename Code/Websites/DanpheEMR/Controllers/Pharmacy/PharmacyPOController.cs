using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.Services.Pharmacy.PharmacyPO;
using DanpheEMR.Utilities;
using DanpheEMR.ViewModel.Pharmacy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Controllers.Pharmacy
{
    [RequestFormSizeLimit(valueCountLimit: 1000000, Order = 1)]
    [DanpheDataFilter()]
    [Route("api/[controller]")]
    public class PharmacyPOController : CommonController
    {
        private IPharmacyPOService _pharmacyPOService;
        private readonly PharmacyDbContext _pharmacyDbContext;
        public DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        public PharmacyPOController(IPharmacyPOService pharmacyPOService, IOptions<MyConfiguration> _config) : base(_config)
        {
            _pharmacyPOService = pharmacyPOService;
            _pharmacyDbContext = new PharmacyDbContext(connString);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            try
            {
                responseData.Results = await _pharmacyPOService.GetPurchaseOrderForEdit(id);
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return Ok(responseData);
        }
        [HttpGet()]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                responseData.Results = await _pharmacyPOService.GetAllAsync();
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return Ok(responseData);

        }

        [HttpPut]
        public IActionResult UpdatePurchaseOrder([FromBody] PHRMPurchaseOrderModel value)
        {
            try
            {
                var currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
                responseData.Results = _pharmacyPOService.UpdatePurchaseOrder(value, currentUser);
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return Ok(responseData);
        }
        [HttpGet]
        [Route("GoodsReceiptHistory")]
        public IActionResult GetGoodReceiptHistory()
        {
            Func<object> func = () => GetGoodsReceiptHistory();
            return InvokeHttpGetFunction(func);
        }
        private object GetGoodsReceiptHistory()
        {
            var lastmonth = DateTime.Today.AddMonths(-1);
            var GRH = (from gr in _pharmacyDbContext.PHRMGoodsReceipt
                       where gr.CreatedOn > lastmonth && gr.IsCancel == false
                       select new
                       {
                           gr.GoodReceiptId,
                           gr.SupplierId,
                           gr.CreatedOn,
                           gr.InvoiceNo,
                           gr.SubTotal,
                           items = _pharmacyDbContext.PHRMGoodsReceiptItems.Where(a => a.GoodReceiptId == gr.GoodReceiptId).ToList()
                       }).ToList();
            return GRH;
        }
        [HttpGet]
        [Route("GRDetailsByGRId")]
        public IActionResult GetGRDetailByGRId(int GoodsReceiptId, bool IsGRCancelled)
        {
            Func<object> func = () => GetGRDetailsByGRId(GoodsReceiptId, IsGRCancelled);
            return InvokeHttpPostFunction<object>(func);
        }
        private object GetGRDetailsByGRId(int GoodsReceiptId, bool IsGRCancelled)
        {
            GetGRDetailByGRIdViewModel goodsReceiptVM = _pharmacyDbContext.GetGRDetailByGRId(GoodsReceiptId, IsGRCancelled);
            return goodsReceiptVM;
        }
        [HttpGet]
        [Route("PODetailsByPOID")]
        public IActionResult GetPODetailByPOID(int PurchaseOrderId)
        {
            Func<object> func = () => GetPODetailsByPOID(PurchaseOrderId);
            return InvokeHttpPostFunction<object>(func);
        }
        private object GetPODetailsByPOID(int PurchaseOrderId)
        {

            GetPODetailByPOIdViewModel purchaseOrderVM = _pharmacyDbContext.GetPODetailsByPOIdAsync(PurchaseOrderId);
            return purchaseOrderVM;
        }

        [HttpGet]
        [Route("DateFilteredGoodsReceiptList")]
        public IActionResult GetDateFilteredGoodsReceiptList(DateTime FromDate, DateTime ToDate)
        {
            var realToDate = ToDate.AddDays(1);

            Func<object> func = () => (from gr in _pharmacyDbContext.PHRMGoodsReceipt
                                       join supp in _pharmacyDbContext.PHRMSupplier on gr.SupplierId equals supp.SupplierId
                                       join fy in _pharmacyDbContext.PharmacyFiscalYears on gr.FiscalYearId equals fy.FiscalYearId
                                       join rbac in _pharmacyDbContext.Users on gr.CreatedBy equals rbac.EmployeeId
                                       join purchaseorder in _pharmacyDbContext.PHRMPurchaseOrder on gr.PurchaseOrderId equals purchaseorder.PurchaseOrderId
                                       into orderTemp from prorder in orderTemp.DefaultIfEmpty()
                                       orderby gr.CreatedOn descending
                                       select new
                                       {
                                           GoodReceiptId = gr.GoodReceiptId,
                                           GoodReceiptPrintId = gr.GoodReceiptPrintId,
                                           PurchaseOrderId = gr.PurchaseOrderId,
                                           InvoiceNo = gr.InvoiceNo,
                                           GoodReceiptDate = gr.GoodReceiptDate,
                                           SupplierBillDate = gr.SupplierBillDate,
                                           CreatedOn = gr.CreatedOn,             //once GoodReceiptDate is been used replaced createdOn by GoodReceiptDate
                                           SubTotal = gr.SubTotal,
                                           DiscountAmount = gr.DiscountAmount,
                                           VATAmount = gr.VATAmount,
                                           TotalAmount = gr.TotalAmount,
                                           Remarks = gr.Remarks,
                                           SupplierName = supp.SupplierName,
                                           ContactNo = supp.ContactNo,
                                           City = supp.City,
                                           Pin = supp.PANNumber,
                                           ContactAddress = supp.ContactAddress,
                                           Email = supp.Email,
                                           IsCancel = gr.IsCancel,
                                           SupplierId = supp.SupplierId,
                                           UserName = rbac.UserName,
                                           CurrentFiscalYear = fy.FiscalYearName,
                                           IsTransferredToACC = (gr.IsTransferredToACC == null) ? false : true,
                                           PurchaseOrderNo= prorder.PurchaseOrderNo 
                                       }).Where(s => s.GoodReceiptDate >= FromDate && s.GoodReceiptDate < realToDate).ToList();
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpGet]
        [Route("ItemRateHistory")]
        public IActionResult GetItemRateHistory()
        {
            Func<object> func = () => GetItemRateHistoryDetail();
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetItemRateHistoryDetail()
        {

            var itemRateHistory = (from GRI in _pharmacyDbContext.PHRMGoodsReceiptItems
                                   join GR in _pharmacyDbContext.PHRMGoodsReceipt on GRI.GoodReceiptId equals GR.GoodReceiptId
                                   join S in _pharmacyDbContext.PHRMSupplier on GR.SupplierId equals S.SupplierId
                                   select new
                                   {
                                       GRI.ItemId,
                                       GRI.GRItemPrice,
                                       S.SupplierName,
                                       GR.GoodReceiptDate
                                   }).OrderByDescending(GRI => GRI.GoodReceiptDate).ToList();
            return itemRateHistory;
        }
        [HttpGet]
        [Route("ItemFreeQuantityReceivedHistory")]
        public IActionResult GetItemFreeQuantityReceivedHistory()
        {
            Func<object> func = () => GetItemFreeQuantityReceivedHistoryDetail();
            return InvokeHttpPostFunction<object>(func);
        }
        private object GetItemFreeQuantityReceivedHistoryDetail()
        {
            var itemFreeQuantityHistory = (from GRI in _pharmacyDbContext.PHRMGoodsReceiptItems
                                           join GR in _pharmacyDbContext.PHRMGoodsReceipt on GRI.GoodReceiptId equals GR.GoodReceiptId
                                           join S in _pharmacyDbContext.PHRMSupplier on GR.SupplierId equals S.SupplierId
                                           select new
                                           {
                                               SupplierName = S.SupplierName,
                                               GoodReceiptDate = GR.GoodReceiptDate,
                                               FreeQuantity = GRI.FreeQuantity,
                                               ReceivedQuantity = GRI.ReceivedQuantity,
                                               ItemId = GRI.ItemId
                                           }).OrderByDescending(GRI => GRI.GoodReceiptDate).ToList();
            if (itemFreeQuantityHistory == null || itemFreeQuantityHistory.Count() == 0)
            {
                throw new Exception("No free quantity history found.");
            }
            return itemFreeQuantityHistory;
        }
        [HttpGet]
        [Route("MRPHistory")]
        public IActionResult GetMRPHistory()
        {
            Func<object> func = () => GetMRPHistoryDetail();
            return InvokeHttpPostFunction<object>(func);
        }
        private object GetMRPHistoryDetail()
        {
            var itemMRPHistory = (from stkmst in _pharmacyDbContext.StockMasters
                                  join gri in _pharmacyDbContext.PHRMGoodsReceiptItems on stkmst.StockId equals gri.StockId
                                  join gr in _pharmacyDbContext.PHRMGoodsReceipt on gri.GoodReceiptId equals gr.GoodReceiptId
                                  join supplier in _pharmacyDbContext.PHRMSupplier on gr.SupplierId equals supplier.SupplierId
                                  select new
                                  {
                                      stkmst.ItemId,
                                      stkmst.SalePrice,
                                      gr.GoodReceiptDate,
                                      supplier.SupplierName
                                  }).OrderByDescending(a => a.GoodReceiptDate).ToList();
            if (itemMRPHistory == null || itemMRPHistory.Count() == 0)
            {
                throw new Exception("No SalePrice history found.");
            }
            return itemMRPHistory;
        }

    }
}

