using DanpheEMR.CommonTypes;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.Services.Pharmacy.PharmacyPO;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Controllers.Pharmacy
{
    [RequestFormSizeLimit(valueCountLimit: 1000000, Order = 1)]
    [DanpheDataFilter()]
    [Route("api/[controller]")]
    public class PharmacyPOController : Controller
    {
        private IPharmacyPOService _pharmacyPOService;
        public DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        public PharmacyPOController(IPharmacyPOService pharmacyPOService)
        {
            _pharmacyPOService = pharmacyPOService;
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
                var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
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
    }
}
