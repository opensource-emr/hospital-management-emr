using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Configuration;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.Services.LIS;
using DanpheEMR.Services.Vaccination;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DanpheEMR.Controllers
{
    [Route("api/[controller]")]
    public class LISController : CommonController
    {
        ILISService _lisService;
        public DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        public LISController(ILISService lisService, IOptions<MyConfiguration> _config) : base(_config)
        {
            _lisService = lisService;
        }

        [Route("GetAllLISMasterData")]
        [HttpGet]
        public async Task<IActionResult> GetAllLISMasterData()
        {
            try
            {
                responseData.Results = await _lisService.GetAllMasterDataAsync();
                responseData.Status = ENUM_DanpheHttpResponseText.OK;
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }

        [Route("GetAllMappedData")]
        [HttpGet]
        public async Task<IActionResult> GetAllMappedData()
        {
            try
            {
                responseData.Results = await _lisService.GetAllMappedData();
                responseData.Status = ENUM_DanpheHttpResponseText.OK;
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }

        [Route("GetAllNotMappedDataByMachineId")]
        [HttpGet]
        public IActionResult GetAllNotMappedDataByMachineId(int id, int? slectedMapId)
        {
            try
            {
                responseData.Results = _lisService.GetAllNotMappedDataByMachineId(id, slectedMapId);
                responseData.Status = ENUM_DanpheHttpResponseText.OK;
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }

        [Route("GetExistingMappingById")]
        [HttpGet]
        public IActionResult GetExistingMappingById(int id)
        {
            try
            {
                responseData.Results = _lisService.GetSelectedMappedDataById(id);
                responseData.Status = ENUM_DanpheHttpResponseText.OK;
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }

        [Route("GetAllMachineResult")]
        [HttpGet]
        public async Task<IActionResult> GetAllMachineResult(int machineId, DateTime fromDate, DateTime toDate)
        {
            try
            {
                responseData.Results = await _lisService.GetMachineResults(machineId,fromDate,toDate);
                responseData.Status = ENUM_DanpheHttpResponseText.OK;
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }

        [Route("GetAllMachines")]
        [HttpGet]
        public IActionResult GetAllMachines()
        {
            try
            {
                responseData.Results = _lisService.GetAllMachines();
                responseData.Status = ENUM_DanpheHttpResponseText.OK;
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }

        [Route("GetResultByBarcodeNumber")]
        [HttpGet]
        public async Task<IActionResult> GetMachineResultByBarcodeNumber(Int64 BarcodeNumber)
        {
            try
            {
                responseData.Results = await _lisService.GetMachineResultByBarcodeNumber(BarcodeNumber);
                responseData.Status = ENUM_DanpheHttpResponseText.OK;
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }

        [Route("AddUpdateNewMapping")]
        [HttpPost]
        public IActionResult AddUpdateNewMapping([FromBody] List<LISComponentMapModel> mapping)
        {
            try
            {
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                foreach (var item in mapping)
                {
                    if (item.LISComponentMapId > 0)
                    {
                        item.ModifiedBy = currentUser.EmployeeId;
                        item.ModifiedOn = System.DateTime.Now;
                    }
                    else
                    {
                        item.CreatedBy = currentUser.EmployeeId;
                        item.CreatedOn = System.DateTime.Now;
                    }
                }
                _lisService.AddUpdateMapping(mapping);
                responseData.Status = ENUM_DanpheHttpResponseText.OK;
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }


        [Route("AddLisDataToResult")]
        [HttpPost]
        public async Task<IActionResult> AddLisDataToResult([FromBody] List<MachineResultsVM> result)
        {
            try
            {
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                foreach (var item in result)
                {
                    item.CreatedBy = currentUser.EmployeeId;
                    item.CreatedOn = System.DateTime.Now;
                }
                var res = await _lisService.AddLISDataToDanphe(result);
                if(res == false)
                {
                    responseData.Status = ENUM_DanpheHttpResponseText.Failed;
                    responseData.ErrorMessage = "Sorry, Result Of Some Patient Is Already Added.";
                }
                else
                {
                    responseData.Status = ENUM_DanpheHttpResponseText.OK;
                }
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                return BadRequest(responseData);
            }

        }

        [Route("MachineOrder")]
        [HttpPost]
        public async Task<IActionResult> AddMachineOrder([FromBody] List<Int64> reqIds)
        {
            try
            {
                var result = await _lisService.AddMachineOrder(reqIds);
                responseData.Status = ENUM_DanpheHttpResponseText.OK;
                responseData.Results = result;
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }

        [Route("MachineResultSync")]
        [HttpPut]
        public async Task<IActionResult> UpdateMachineResultSyncStatus([FromBody] List<int> resultIds)
        {
            try
            {
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                var res = await _lisService.UpdateMachineResultSyncStatus(resultIds);
                if (res)
                {
                    responseData.Status = ENUM_DanpheHttpResponseText.OK;
                }
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                return BadRequest(responseData);
            }

        }


        [Route("RemoveMapping")]
        [HttpDelete]
        public IActionResult RemoveMapping(int id)
        {
            try
            {
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                _lisService.DeleteMapping(id, currentUser.EmployeeId);
                responseData.Status = ENUM_DanpheHttpResponseText.OK;
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }

    }
}
