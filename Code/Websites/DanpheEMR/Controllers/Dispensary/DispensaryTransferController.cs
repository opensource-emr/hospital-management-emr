using DanpheEMR.CommonTypes;
using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.Services.DispensaryTransfer;
using DanpheEMR.Utilities;
using DanpheEMR.ViewModel.DispensaryTransfer;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Controllers.Dispensary
{
    [RequestFormSizeLimit(valueCountLimit: 1000000, Order = 1)]
    [DanpheDataFilter()]
    [Route("api/[controller]")]
    public class DispensaryTransferController : Controller
    {
        #region Fields
        private IDispensaryTransferService _dispensaryTransferService;
        public DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        #endregion

        #region CTOR
        public DispensaryTransferController(IDispensaryTransferService dispensaryTransferService)
        {
            _dispensaryTransferService = dispensaryTransferService;
        }
        #endregion

        #region Methods

        [HttpGet("{StoreId}")]
        public async Task<IActionResult> Get([FromRoute] int StoreId)
        {
            try
            {
                responseData.Results = await _dispensaryTransferService.GetAllTransactionByStoreId(StoreId);
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return Ok(responseData);
        }

        [HttpGet("GetAllStoresForTransfer")]
        public IActionResult GetAllStoresForTransfer()
        {
            try
            {
                responseData.Results = _dispensaryTransferService.GetAllStoresForTransfer();
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return Ok(responseData);
        }


        [HttpGet("GetDispensariesStock/{DispensaryId}")]
        public async Task<IActionResult> GetDispensariesStock([FromRoute] int DispensaryId)
        {
            try
            {
                responseData.Results = await _dispensaryTransferService.GetAllDispensaryStocks(DispensaryId);
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
        public IActionResult Post([FromBody] List<StockTransferModel> transferedStock)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                if (transferedStock != null)
                {
                    var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                    var TransferResponse = _dispensaryTransferService.TransferStock(transferedStock, currentUser);
                    responseData.Results = TransferResponse;
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

        #endregion
    }
}
