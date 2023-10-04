using DanpheEMR.CommonTypes;
using DanpheEMR.Security;
using DanpheEMR.ServerModel.InventoryModels;
using DanpheEMR.Services.Inventory.InventoryDonation;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Controllers.Inventory
{
    [RequestFormSizeLimit(valueCountLimit: 1000000, Order = 1)]
    [DanpheDataFilter()]
    [Route("api/[controller]")]
    public class InventoryDonationController : Controller
    {

        public IDonationService _inventoryDonationService;
        public DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

        public InventoryDonationController(IDonationService inventoryDontionService)
        {
            _inventoryDonationService = inventoryDontionService;
        }

        [HttpGet("~/api/donation/GetAllVendorsThatReceiveDonation")]
        public IActionResult GetVendorsThatReceiveDonation()
        {
            try
            {
                responseData.Results = _inventoryDonationService.GetVendorsThatReceiveDonation();
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return Ok(responseData);
        }
        [HttpGet("~/api/donation/getAllDonations/{fromDate}/{toDate}/{StoreId}")]
        public IActionResult GetAllDonation([FromRoute] DateTime fromDate, DateTime toDate, int StoreId)
        {
            try
            {
                responseData.Results = _inventoryDonationService.GetAllDonation(fromDate, toDate, StoreId);
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return Ok(responseData);
        }
        [HttpGet("~/api/donation/getDonationDetailsById/{DonationId}")]
        public IActionResult GetDonationViewById(int DonationId)
        {
            try
            {
                responseData.Results = _inventoryDonationService.GetDonationViewById(DonationId);
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return Ok(responseData);
        }

        [HttpGet("~/api/donation/getDonationById/{DonationId}")]
        public IActionResult GetDonationById(int DonationId)
        {
            try
            {
                responseData.Results = _inventoryDonationService.GetDonationById(DonationId);
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return Ok(responseData);
        }

        [HttpPost("~/api/donation")]
        public IActionResult SaveDonation()
        {
            System.IO.Stream req = Request.Body;
            req.Seek(0, System.IO.SeekOrigin.Begin);
            string str = new System.IO.StreamReader(req).ReadToEnd();
            DonationModel donation = DanpheJSONConvert.DeserializeObject<DonationModel>(str);

            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                donation.CreatedBy = currentUser.EmployeeId;
                if (donation != null)
                {
                    var saveResponse = _inventoryDonationService.SaveDonation(donation);
                    responseData.Results = saveResponse;
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
        [HttpPut("~/api/donation/{DonationId}")]
        public IActionResult UpdateDonation(int DonationId)
        {
            System.IO.Stream req = Request.Body;
            req.Seek(0, System.IO.SeekOrigin.Begin);
            string str = new System.IO.StreamReader(req).ReadToEnd();
            DonationModel donation = DanpheJSONConvert.DeserializeObject<DonationModel>(str);
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                if (donation != null)
                {
                    var updateResponse = _inventoryDonationService.UpdateDonation(donation, DonationId, currentUser.EmployeeId);

                    responseData.Results = updateResponse;
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
        [HttpPut("~/api/donation/cancel/{DonationId}")]
        public IActionResult CancelDonation(int DonationId)
        {
            System.IO.Stream req = Request.Body;
            req.Seek(0, System.IO.SeekOrigin.Begin);
            string str = new System.IO.StreamReader(req).ReadToEnd();
            String Remarks = DanpheJSONConvert.DeserializeObject<String>(str);
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                var cancelResponse = _inventoryDonationService.CancelDonation(DonationId, currentUser.EmployeeId, Remarks);
                responseData.Results = cancelResponse;
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
