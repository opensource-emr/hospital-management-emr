using System;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.ServerModel;
using DanpheEMR.Utilities;
using DanpheEMR.CommonTypes;
using DanpheEMR.Services;
using DanpheEMR.Security;

namespace DanpheEMR.Controllers
{
    [Route("api/[controller]")]
    public class InventoryGoodReceiptController : Controller
    {

        public IInventoryGoodReceiptService _inventoryGoodReceiptService;
        public DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

        public InventoryGoodReceiptController(IInventoryGoodReceiptService inventoryGoodReceiptService)
        {
            _inventoryGoodReceiptService = inventoryGoodReceiptService;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            try
            {
                responseData.Results = _inventoryGoodReceiptService.ListGoodsReceipt();
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return Ok(responseData);
        }


        [HttpGet("~/api/GetVendorList")]
        public IActionResult GetVendorList()
        {
            try
            {
                responseData.Results = _inventoryGoodReceiptService.GetVendorList();
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return Ok(responseData);
        }

        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            try
            {
                responseData.Results = _inventoryGoodReceiptService.GetGoodsReceipt(id);
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return Ok(responseData);
        }

        [HttpPost]
        public IActionResult Post([FromBody]GoodsReceiptModel value)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                value.CreatedBy = currentUser.EmployeeId;
                value.IsCancel = false;
                if (value !=null)
                {
                    //Nagesh: we are creating gr without po directly , if we need functionality like first create po and then gr 
                    //po from background
                    //var poResponse = _inventoryGoodReceiptService.AddPOAndPOItemsByGRId(value);
                    //value.PurchaseOrderId = poResponse.PurchaseOrderId;
                    var grResponse = _inventoryGoodReceiptService.AddGoodsReceipt(value);
                    //add po with po items when we directly create goods receipt 
                    responseData.Results = grResponse.GoodsReceiptID;
                    responseData.Status = "OK";
                }              
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return Ok(responseData);
        }
        [HttpPost("~/api/UpdateGoodReceipt")]
        public IActionResult UpdateGoodReceipt([FromBody]GoodsReceiptModel value)
        {
            try
            {
                responseData.Results = _inventoryGoodReceiptService.UpdateGoodsReceipt(value);
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return Ok(responseData);
        }

    }
}
