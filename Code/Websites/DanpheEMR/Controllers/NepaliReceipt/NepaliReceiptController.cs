using DanpheEMR.CommonTypes;
using DanpheEMR.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Controllers.NepaliReceipt
{
    [RequestFormSizeLimit(valueCountLimit: 1000000, Order = 1)]
    [DanpheDataFilter()]
    [Route("api/[controller]")]
    public class NepaliReceiptController : ControllerBase
    {
        private INepaliReceiptService _nepaliReceiptService;
        public DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

        public NepaliReceiptController(INepaliReceiptService nepaliReceiptService)
        {
            _nepaliReceiptService = nepaliReceiptService;
        }

        [HttpGet("GetDonationGRView")]
        public async Task<IActionResult> GetDonationGRView(int GoodsReceiptId)
        {
            try
            {
                responseData.Results = await _nepaliReceiptService.GetDonationGRView(GoodsReceiptId);
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return Ok(responseData);
        }
        [HttpGet("GetNepaliRequisitionView")]
        public IActionResult GetNepaliRequisitionView(int RequisitionId, string ModuleType)
        {
            try
            {
                responseData.Results = _nepaliReceiptService.GetNepaliRequisitionView(RequisitionId, ModuleType);
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return Ok(responseData);
        }
        [HttpGet("GetNepaliDispatchView")]
        public IActionResult GetNepaliDispatchView(int DispatchId, string ModuleType)
        {
            try
            {
                responseData.Results = _nepaliReceiptService.GetNepaliDispatchView(DispatchId, ModuleType);
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
