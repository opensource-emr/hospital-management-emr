using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Configuration;
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
                responseData.Status = "OK";
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
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
                responseData.Status = "OK";
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
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
                responseData.Status = "OK";
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
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
                responseData.Status = "OK";
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }

        [Route("GetAllMachineResult")]
        [HttpGet]
        public async Task<IActionResult> GetAllMachineResult(int machineId)
        {
            try
            {
                responseData.Results = await _lisService.GetMachineResults(machineId);
                responseData.Status = "OK";
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
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
                responseData.Status = "OK";
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
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
                responseData.Status = "OK";
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
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
                await _lisService.AddLISDataToDanphe(result);
                responseData.Status = "OK";
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
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
                responseData.Status = "OK";
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }

    }
}
