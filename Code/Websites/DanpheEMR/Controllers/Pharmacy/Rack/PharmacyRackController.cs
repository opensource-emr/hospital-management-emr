using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.ServerModel.PharmacyModels;
using DanpheEMR.Services.Pharmacy.Rack;
using DanpheEMR.ViewModel.Pharmacy;
using DanpheEMR.Core.Configuration;
using Microsoft.Extensions.Options;
using System.Threading.Tasks;
using DanpheEMR.CommonTypes;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers.Pharmacy
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class PharmacyRackController : CommonController
    {
        public IRackService rackService;
        public PharmacyRackController(IOptions<MyConfiguration> _config, IRackService _rackService) : base(_config)
        {
            rackService = _rackService;
        }

        // GET: api/pharmacyRack
        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(rackService.ListRack());
        }

        // GET api/pharmacyRack/id
        //[HttpGet("{id:int}")]     //  to route only id is int
        //[HttpGet("{id = 231}")]   // assign default value if value of id is not provided
        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            return Ok(rackService.GetRack(id));
        }

        [HttpGet]
        [Route("~/api/Rack/GetStoreRackNameByItemId/{ItemId}")]
        public IActionResult GetStoreRackNameByItemId([FromRoute] int ItemId)
        {
            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                responseData.Status = "OK";
                responseData.Results = rackService.GetStoreRackNameByItemId(ItemId);
            }
            catch (System.Exception)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Failed to load Rack";
                return BadRequest(responseData);
            }
            return Ok(responseData);
        }

        // POST api/values
        [HttpPost]
        public IActionResult Post([FromBody]PHRMRackModel value)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            return Ok(rackService.AddRack(value));
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody]RackViewModel value)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            value.RackId = id;
            rackService.UpdateRack(value);
            return Ok(rackService.GetRack(id));

        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
            rackService.DeleteRack(id);
        }

        [HttpGet("~/api/GetParentRack")]
        public IActionResult GetParentRackList()
        {
            return Ok(rackService.GetParentRack());
        }

        [HttpGet("~/api/GetDrugsList/{rackId}")]
        public IActionResult GetDrugList(int rackId)
        {
             return Ok(rackService.GetDrugList(rackId));
        }

    }
}
