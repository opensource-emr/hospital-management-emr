using DanpheEMR.CommonTypes;
using DanpheEMR.Security;
using DanpheEMR.Services;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Controllers.CSSD
{
    [RequestFormSizeLimit(valueCountLimit: 1000000, Order = 1)]
    [DanpheDataFilter()]
    [Route("api/[controller]")]
    public class CssdReportController : Controller
    {
        #region Fields
        private ICssdReportService _cssdReportService;
        public DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        #endregion

        #region CTOR
        public CssdReportController(ICssdReportService cssdReportService)
        {
            _cssdReportService = cssdReportService;
        }
        #endregion

        #region Methods, APIs
        [HttpGet("GetIntegratedCssdReport")]
        public async Task<IActionResult> GetIntegratedCssdReport(DateTime FromDate, DateTime ToDate)
        {
            try
            {
                responseData.Results = await _cssdReportService.GetIntegratedCssdReport(FromDate, ToDate);
                responseData.Status = "OK";
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
