using System;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.ServerModel;
using DanpheEMR.Utilities;
using DanpheEMR.CommonTypes;
using DanpheEMR.Services;
using DanpheEMR.Security;
using DanpheEMR.Services.Maternity;
using DanpheEMR.Core.Configuration;
using Microsoft.Extensions.Options;
using System.IO;
using DanpheEMR.Core;
using DanpheEMR.Core.Parameters;
using System.Linq;
using System.Collections.Generic;
using System.Transactions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.StaticFiles;
using System.Data.SqlClient;
using System.Data;
using DanpheEMR.DalLayer;

namespace DanpheEMR.Controllers
{

    [RequestFormSizeLimit(valueCountLimit: 1000000, Order = 1)]
    [Route("api/[controller]")]
    public class MaternityController : CommonController
    {
        private IMaternityService _maternityRequisitionService;
        public DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        public MaternityController(IMaternityService maternityRequisitionService, IOptions<MyConfiguration> _config) : base(_config)
        {
            _maternityRequisitionService = maternityRequisitionService;
        }


        [Route("AddMaternityPatient")]
        [HttpPost]
        public IActionResult AddMaternityPatient([FromBody] MaternityPatient pat)
        {
            try
            {
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                pat.CreatedBy = currentUser.EmployeeId;
                pat.CreatedOn = System.DateTime.Now;
                var registeredPatient = _maternityRequisitionService.AddMaternityPatient(pat);
                responseData.Results = new { };
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

        [Route("GetAllDosesNumber")]
        [HttpGet]
        public IActionResult GetAllDosesNumber()
        {
            try
            {
                responseData.Results = _maternityRequisitionService.GetAllDosesNumber(true);
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

        [Route("GetDatForEditSearch")]
        [HttpGet]
        public IActionResult GetDatForEditSearch(string searchText)
        {
            try
            {
                responseData.Results = _maternityRequisitionService.GetDataForEditSearch(searchText);
                responseData.Status = "OK";
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " Exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }

        [Route("GetPatientDetails")]
        [HttpGet]
        public IActionResult GetPatientDetails()
        {
            try
            {
                responseData.Results = _maternityRequisitionService.GetPatientDetails();
                responseData.Status = "OK";
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " Exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }


        [Route("GetPatientDetailById")]
        [HttpGet]
        public IActionResult GetPatientDetailById(int id)
        {
            try
            {
                responseData.Results = _maternityRequisitionService.GetPatientDetailById(id);
                responseData.Status = "OK";
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " Exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }

        [Route("GetAllActiveMaternityPatientList")]
        [HttpGet]
        public IActionResult GetAllActiveMaternityPatientList(bool showAll, DateTime fromDate, DateTime toDate)
        {
            try
            {
                responseData.Results = _maternityRequisitionService.GetAllActiveMaternityPatientList(showAll, fromDate, toDate);
                responseData.Status = "OK";
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " Exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }

        [Route("GetAllANCByMaternityPatId")]
        [HttpGet]
        public IActionResult GetAllANCByMaternityPatId(int id)
        {
            try
            {

                var allANCList = _maternityRequisitionService.GetAllANCByMaternityPatId(id);
                responseData.Results = allANCList;
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

        [Route("GetAllFilesUploadedbyMaternityPatId")]
        [HttpGet]
        public IActionResult GetAllFilesUploadedbyMaternityPatId(int id)
        {
            try
            {

                var allFileList = _maternityRequisitionService.GetAllFilesUploadedbyMaternityPatId(id);
                responseData.Results = allFileList;
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

        [Route("GetAllBabyDetailsByMaternityPatId")]
        [HttpGet]
        public IActionResult GetAllBabyDetailsByMaternityPatId(int matId, int patId)
        {
            try
            {
                var allData = _maternityRequisitionService.GetAllBabyDetailsByMaternityPatId(matId, patId);
                responseData.Results = allData;
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

        [HttpGet, DisableRequestSizeLimit]
        [Route("DownloadFile")]
        public async Task<IActionResult> Download(int matPatientFileId)
        {
            CoreDbContext coreDbContext = new CoreDbContext(connString);
            var parm = coreDbContext.Parameters.Where(a => a.ParameterGroupName == "Maternity" && a.ParameterName == "UploadFileLocationPath").FirstOrDefault<ParameterModel>();
            var filePath = _maternityRequisitionService.GetDownloadFilePathById(matPatientFileId);
            if (!System.IO.File.Exists(filePath))
                return NotFound();
            var memory = new MemoryStream();
            using (var stream = new FileStream(filePath, FileMode.Open))
            {
                await stream.CopyToAsync(memory);
                stream.Close();
                stream.Dispose();
            }
            memory.Position = 0;
            return File(memory, GetContentType(filePath), filePath);
        }

        [Route("SearchPatListForAllowance")]
        [HttpGet]
        public IActionResult SearchPatListForAllowance(string searchText,bool isSearchAll)
        {
            MaternityDbContext maternityDbContext = new MaternityDbContext(connString);
            try
            { 
                List<SqlParameter> paramList = new List<SqlParameter>() 
                { new SqlParameter("@SearchTxt", searchText),
                  new SqlParameter("@IsSearchAll", isSearchAll),
                  new SqlParameter("@RowCounts", 200)};//rowscount set to 200 by default..
                DataTable dt = DALFunctions.GetDataTableFromStoredProc("SP_MAT_GetPatientListForAllowance", paramList, maternityDbContext);
                responseData.Results = dt;
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

        private string GetContentType(string path)
        {
            var provider = new FileExtensionContentTypeProvider();
            string contentType;

            if (!provider.TryGetContentType(path, out contentType))
            {
                contentType = "application/octet-stream";
            }

            return contentType;
        }
        [Route("GetMaternityAllowanceReportList")]
        [HttpGet]
        public IActionResult GetMaternityAllowanceReportList(DateTime fromDate, DateTime toDate)
        {
            try
            {
                responseData.Results = _maternityRequisitionService.GetMaternityAllowanceReportList(fromDate, toDate);
                responseData.Status = "OK";
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " Exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }

        [Route("UpdateMaternityPatient")]
        [HttpPost]
        public IActionResult UpdateMaternityPatient([FromBody] MaternityPatient pat)
        {
            try
            {
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                pat.ModifiedBy = currentUser.EmployeeId;
                pat.ModifiedOn = System.DateTime.Now;
                var registeredPatient = _maternityRequisitionService.UpdateMaternityPatient(pat);
                responseData.Results = new { };
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

        [Route("AddUpdateMaternityANC")]
        [HttpPost]
        public IActionResult AddUpdateMaternityANC([FromBody] MaternityANC pat)
        {
            try
            {
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                if (pat.MaternityANCId == 0)
                {
                    pat.CreatedBy = currentUser.EmployeeId;
                    pat.CreatedOn = System.DateTime.Now;
                }
                else
                {
                    pat.ModifiedBy = currentUser.EmployeeId;
                    pat.ModifiedOn = System.DateTime.Now;
                }

                var registeredPatient = _maternityRequisitionService.AddUpdateANC(pat);
                responseData.Results = registeredPatient;
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

        [Route("RegisterMaternity")]
        [HttpPost]
        public IActionResult RegisterMaternity([FromBody] MaternityRegisterVM pat)
        {
            try
            {
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                pat.MaternityPatient.ModifiedBy = currentUser.EmployeeId;
                pat.MaternityPatient.ModifiedOn = System.DateTime.Now;

                foreach (var item in pat.MaternityDetails)
                {
                    item.CreatedBy = currentUser.EmployeeId;
                    item.CreatedOn = System.DateTime.Now;
                }
                var data = _maternityRequisitionService.RegisterMaternity(pat);
                responseData.Results = new { };
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

        [Route("UpdateChildInfo")]
        [HttpPost]
        public IActionResult UpdateChildInfo([FromBody] MaternityRegister pat)
        {
            try
            {
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                pat.ModifiedBy = currentUser.EmployeeId;
                pat.ModifiedOn = System.DateTime.Now;
                var data = _maternityRequisitionService.EditChildDetail(pat);
                responseData.Results = new { };
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

        [Route("UpdateMotherInfo")]
        [HttpPost]
        public IActionResult UpdateMotherInfo([FromBody] MaternityPatient pat)
        {
            try
            {
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                pat.ModifiedBy = currentUser.EmployeeId;
                pat.ModifiedOn = System.DateTime.Now;
                var data = _maternityRequisitionService.EditMotherDetail(pat);
                responseData.Results = new { };
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

        [Route("UploadMaternityPatientFiles")]
        [HttpPost]
        public IActionResult UploadMaternityPatientFiles()
        {
            try
            {
                /////Read Files From Clent Side 
                var files = this.ReadFiles();
                ///Read patient Files Model Other Data
                var reportDetails = Request.Form["reportDetails"];
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                MaternityFileUploads patFileData = DanpheJSONConvert.DeserializeObject<MaternityFileUploads>(reportDetails);

                var tempModel = new MaternityFileUploads();
                tempModel.CreatedBy = currentUser.EmployeeId;
                tempModel.CreatedOn = DateTime.Now;

                var data = _maternityRequisitionService.UploadMaternityPatientFiles(patFileData, files);
                responseData.Results = data;
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

        [Route("DeleteMaternityPatient")]
        [HttpDelete]
        public IActionResult DeleteMaternityPatient(int id)
        {
            try
            {
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                var registeredPatient = _maternityRequisitionService.RemoveMaternityPatient(id, currentUser.EmployeeId);
                responseData.Results = new { };
                responseData.Status = registeredPatient ? "OK" : "Failed";
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }

        [Route("DeleteMaternityPatientANC")]
        [HttpDelete]
        public IActionResult DeleteMaternityPatientANC(int id)
        {
            try
            {
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                var data = _maternityRequisitionService.RemoveMaternityPatientANC(id, currentUser.EmployeeId);
                responseData.Results = new { };
                responseData.Status = data ? "OK" : "Failed";
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }

        [Route("DeleteMaternityPatientFile")]
        [HttpDelete]
        public IActionResult DeleteMaternityPatientFile(int id)
        {
            try
            {
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                var data = _maternityRequisitionService.RemoveMaternityPatientFile(id, currentUser.EmployeeId);
                responseData.Results = new { };
                responseData.Status = data ? "OK" : "Failed";
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }

        [Route("Conclude")]
        [HttpDelete]
        public IActionResult ConcludeMaternityPatient(int id)
        {
            try
            {
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                var registeredPatient = _maternityRequisitionService.ConcludeMaternityPatient(id, currentUser.EmployeeId);
                responseData.Results = new { };
                responseData.Status = registeredPatient ? "OK" : "Failed";
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }

        [Route("RemoveChild")]
        [HttpDelete]
        public IActionResult RemoveChild(int id)
        {
            try
            {
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                var removedData = _maternityRequisitionService.RemoveChildDetail(id, currentUser.EmployeeId);
                responseData.Results = new { };
                responseData.Status = removedData ? "OK" : "Failed";
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }

        [Route("GetPatientPaymentDetailById")]
        [HttpGet]
        public IActionResult GetPatientPaymentDetailById(int id)
        {
            try
            {
                responseData.Results = _maternityRequisitionService.GetPatientPaymentDetailById(id);
                responseData.Status = "OK";
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " Exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }

        [Route("GetPatientPaymentDetailByPaymentId")]
        [HttpGet]
        public IActionResult GetPatientPaymentDetailByPaymentId(int id)
        {
            try
            {
                responseData.Results = _maternityRequisitionService.GetPatientPaymentDetailByPaymentId(id);
                responseData.Status = "OK";
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " Exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }

        [Route("AddMaternityPatientPayment")]
        [HttpPost]
        public IActionResult AddMaternityPatientPayment ([FromBody] MaternityPayment paymentModel)
        {
            try
            {
                var data = _maternityRequisitionService.AddMaternityPatientPayment(paymentModel);
                responseData.Results = data;
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
