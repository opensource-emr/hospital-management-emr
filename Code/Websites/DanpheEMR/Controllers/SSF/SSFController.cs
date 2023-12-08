using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel.SSFModels;
using DanpheEMR.Services.SSF;
using DanpheEMR.Services.SSF.DTO;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Threading.Tasks;

namespace DanpheEMR.Controllers.SSF
{
    [Route("api/[controller]")]
    public class SSFController : CommonController
    {
        public readonly ISSFService _ISSFService;
        public SSFDbContext _SSFDbContext;
        public DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        public SSFController(ISSFService issfService, IOptions<MyConfiguration> _config) : base(_config)
        {
            _ISSFService = issfService;
            _SSFDbContext =  new SSFDbContext(connString);
        }

        [HttpGet]
        [Route("GetSSFPatientData")]
        public async Task<IActionResult> GetSSFPatientData(string PatientId)
        {
            try
            {
                responseData.Results = await _ISSFService.GetPatientDetails(_SSFDbContext, PatientId);
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

        [HttpPost]
        [Route("CheckSSFEligibility")]
        public async Task<IActionResult> CheckSSFEligibility(string PatientId, string VisitDate)
        {
            try
            {
                responseData.Results = await _ISSFService.GetElegibility(_SSFDbContext, PatientId,VisitDate);
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

        [HttpGet]
        [Route("GetEmployerList")]
        public async Task<IActionResult> GetEmployerList(string SSFPatientUUID)
        {
            try
            {
                responseData.Results = await _ISSFService.GetEmployerList(_SSFDbContext, SSFPatientUUID);
                responseData.Status = "OK";
                return Ok(responseData);
            }
            catch(Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + "exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }

        [HttpPost]
        [Route("SubmitClaim")]
        public async Task<IActionResult> SubmitClaim([FromBody] ClaimRootDTO claimRoot)
        {
            ClaimRoot claimRootObj = new ClaimRoot()
            {
                resourceType = claimRoot.resourceType,
                clientClaimId = claimRoot.clientClaimId,
                type = claimRoot.claimType,
                billablePeriod = claimRoot.billablePeriod,
                created = claimRoot.created,
                enterer = claimRoot.enterer,
                facility = claimRoot.facility,
                provider = claimRoot.provider,
                extension = claimRoot.extension,
                diagnosis = claimRoot.diagnosis,
                item = claimRoot.item,
                supportingInfo = claimRoot.supportingInfo,
                total = claimRoot.total,
                patient = claimRoot.patient
            };
            var claimResponseInfo = claimRoot.claimResponseInfo;

            try
            {
                var result = await _ISSFService.SubmitClaim(_SSFDbContext, claimRootObj, claimResponseInfo);
                if (result.ErrorMessage != null)
                {
                    responseData.ErrorMessage = result.ErrorMessage;
                }
                else
                {
                    responseData.Results = result.ResponseStatus;
                }
                responseData.Status = result.ResponseStatus;
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.Failed;
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                return BadRequest(responseData);
            }

        }

        [HttpPost]
        [Route("BookClaim")]
        public async Task<IActionResult> BookClaim([FromBody] ClaimBookingRoot_DTO claimBooking)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            try
            {
                var result = await _ISSFService.BookClaim(_SSFDbContext, claimBooking, currentUser);
                if (result.ErrorMessage != null)
                {
                    responseData.ErrorMessage = result.ErrorMessage;
                }
                else
                {
                    responseData.Results = result.ResponseStatus;
                }
                responseData.Status = result.ResponseStatus;
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.Failed;
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }


        [HttpGet]
        [Route("GetClaimBookingDetail")]
        public async Task<IActionResult> GetClaimBookingDetail(Int64 claimCode)
        {
            try
            {
                responseData.Results = await _ISSFService.GetClaimBookingDetail(_SSFDbContext, claimCode);
                responseData.Status = "OK";
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + "exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }

        [HttpGet]
        [Route("GetClaimDetail")]
        public async Task<IActionResult> GetClaimDetail(string ClaimUUID)
        {
            try
            {
                responseData.Results = await _ISSFService.GetClaimDetail(_SSFDbContext, ClaimUUID);
                responseData.Status = "OK";
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + "exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }

        [HttpGet]
        [Route("CheckClaimStatusLocally")]
        public async Task<IActionResult> IsClaimed(Int64 latestClaimCode, int patientId)
        {
            try
            {
                responseData.Results = await _ISSFService.IsClaimed(_SSFDbContext, latestClaimCode, patientId);
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.OK;
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.ErrorMessage = $"{ex.Message} exception details {ex.ToString()}";
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.Failed;
                return BadRequest(responseData);
            }
        }

        [HttpGet]
        [Route("GetSSFPatientDetailLocally")]
        public async Task<IActionResult> GetSSFPatientDetailLocally(int patientId, int schemeId)
        {
            try
            {
                responseData.Results = await _ISSFService.GetSSFPatientDetailLocally(_SSFDbContext, patientId, schemeId);
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.OK;
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.ErrorMessage = $"{ex.Message} exception details {ex.ToString()}";
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.Failed;
                return BadRequest(responseData);
            }
        }
    }
}
