using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel.PharmacyModels;
using DanpheEMR.Services.Pharmacy.Rack;
using DanpheEMR.Utilities;
using DanpheEMR.ViewModel.Pharmacy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers.Pharmacy
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class PharmacyRackController : CommonController
    {
        public IRackService rackService;
        private readonly PharmacyDbContext pharmacyDbContext;

        public PharmacyRackController(IOptions<MyConfiguration> _config, IRackService _rackService) : base(_config)
        {
            rackService = _rackService;
            pharmacyDbContext = new PharmacyDbContext(connString);
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
        public IActionResult Post([FromBody] PHRMRackModel value)
        {
            var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            value.CreatedBy = currentUser.EmployeeId;
            value.CreatedOn = DateTime.Now;
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            return Ok(rackService.AddRack(value));
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody] RackViewModel value)
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
        [HttpGet("~/api/GetAllRack")]
        public IActionResult GetAllRack()
        {
            return Ok(rackService.GetAllRack());
        }

        [HttpGet("~/api/GetDrugsList/{rackId}/{storeId}")]
        public IActionResult GetDrugList(int rackId, int storeId)
        {
            return Ok(rackService.GetDrugList(rackId, storeId));
        }
        [HttpGet("~/api/GetAllRackItem")]
        public IActionResult GetAllRackItem()
        {
            return Ok(rackService.GetAllRackItem());
        }

        [HttpPost]
        [Route("~/api/Rack/PHRM_MAP_ItemToRack")]
        public IActionResult PHRM_MAP_ItemToRack([FromBody] List<PHRM_MAP_ItemToRack> itemToRackList)
        {
            var responseData = new DanpheHTTPResponse<object>();
            List<PHRM_MAP_ItemToRack> tempItemToRackList = new List<PHRM_MAP_ItemToRack>();
            try
            {
                int ItemId = itemToRackList[0].ItemId;
                var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

                var RackItemDetails = pharmacyDbContext.PHRMRackItem.Where(x => x.ItemId == ItemId).ToList();
                itemToRackList.ForEach(ri =>
                {
                    var item = RackItemDetails.Where(x => x.ItemId == ri.ItemId && x.StoreId == ri.StoreId).ToList();
                    if (item.Count == 0)
                    {
                        ri.CreatedBy = currentUser.EmployeeId;
                        ri.CreatedOn = DateTime.Now;
                        ri.IsActive = true;
                        tempItemToRackList.Add(ri);
                    }
                    else
                    {
                        item.ForEach(itm =>
                        {
                            itm.RackId = ri.RackId;
                            itm.ModifiedBy = currentUser.EmployeeId;
                            itm.ModifiedOn = DateTime.Now;
                            pharmacyDbContext.PHRMRackItem.Attach(itm);
                            pharmacyDbContext.Entry(itm).Property(x => x.RackId).IsModified = true;
                            pharmacyDbContext.Entry(itm).Property(x => x.ModifiedBy).IsModified = true;
                            pharmacyDbContext.Entry(itm).Property(x => x.ModifiedOn).IsModified = true;
                        });

                    }
                });
                if (tempItemToRackList.Count > 0)
                {
                    pharmacyDbContext.PHRMRackItem.AddRange(tempItemToRackList);
                }
                pharmacyDbContext.SaveChanges();
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.OK;
                responseData.Results = (from rackItem in pharmacyDbContext.PHRMRackItem.Where(ri => ri.ItemId == ItemId)
                                        join rack in pharmacyDbContext.PHRMRack on rackItem.RackId equals rack.RackId
                                        select new
                                        {
                                            RackNo = rack.RackNo
                                        }).ToList();
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.Failed;
                responseData.ErrorMessage = ex.ToString();
            }
            return Ok(responseData);
        }

        #region Get Item Rack Allocation Data
        [HttpGet]
        [Route("~/api/Rack/GetItemRackData/{ItemId}")]
        public IActionResult GetItemRackAllocationData(int? ItemId)
        {
            var phrmDBContext = new PharmacyDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                if (ItemId != null)
                {
                    var ItemRackAllocationData = (from item in pharmacyDbContext.PHRMRackItem.Where(s => s.ItemId == ItemId)
                                                  join rack in pharmacyDbContext.PHRMRack on item.RackId equals rack.RackId
                                                  select new
                                                  {
                                                      RackNo = rack.RackNo,
                                                      StoreId = rack.StoreId,
                                                      RackId = rack.RackId,
                                                      ItemId = item.ItemId
                                                  }).ToList();

                    responseData.Results = ItemRackAllocationData;
                }
                else
                {
                    var ItemRackAllocationData = (from item in pharmacyDbContext.PHRMRackItem
                                                  join rack in pharmacyDbContext.PHRMRack on item.RackId equals rack.RackId
                                                  select new
                                                  {
                                                      RackNo = rack.RackNo,
                                                      StoreId = rack.StoreId,
                                                      RackId = rack.RackId,
                                                      ItemId = item.ItemId
                                                  }).ToList();

                    responseData.Results = ItemRackAllocationData;
                }
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.OK;
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.Failed;
                responseData.ErrorMessage = ex.ToString();
            }
            return Ok(responseData);

        }
        #endregion

        [HttpGet("~/api/GetRackList")]
        public IActionResult GetAllRackList()
        {
            var phrmDBContext = new PharmacyDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            var RackList = pharmacyDbContext.PHRMRack.Select(r => new
            {
                RackId = r.RackId,
                RackNo = r.RackNo,
                StoreId = r.StoreId
            }).ToList();
            responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.OK;
            responseData.Results = RackList;
            return Ok(responseData);
        }

        [HttpPost]
        [Route("~/api/Rack/PostPHRM_MAP_ItemToRack")]
        public IActionResult PostPHRM_MAP_ItemToRack([FromBody] List<PHRM_MAP_ItemToRack> itemToRackList)
        {
            var responseData = new DanpheHTTPResponse<object>();
            List<PHRM_MAP_ItemToRack> tempItemToRackList = new List<PHRM_MAP_ItemToRack>();
            List<PHRM_MAP_ItemToRack> item = new List<PHRM_MAP_ItemToRack>();

            try
            {
                int ItemId = itemToRackList[0].ItemId;
                var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

                var RackItemDetails = pharmacyDbContext.PHRMRackItem.Where(x => x.ItemId == ItemId).ToList();
                itemToRackList.ForEach(ri =>
                {
                    item = RackItemDetails.Where(x => x.ItemId == ri.ItemId && x.StoreId == ri.StoreId).ToList();
                    if (item.Count == 0)
                    {
                        ri.CreatedBy = currentUser.EmployeeId;
                        ri.CreatedOn = DateTime.Now;
                        ri.IsActive = true;
                        tempItemToRackList.Add(ri);
                    }
                    else
                    {
                        item.ForEach(itm =>
                        {
                            itm.RackId = ri.RackId;
                            itm.ModifiedBy = currentUser.EmployeeId;
                            itm.ModifiedOn = DateTime.Now;
                            itm.JIndex= ri.JIndex;
                            pharmacyDbContext.PHRMRackItem.Attach(itm);
                            pharmacyDbContext.Entry(itm).Property(x => x.RackId).IsModified = true;
                            pharmacyDbContext.Entry(itm).Property(x => x.ModifiedBy).IsModified = true;
                            pharmacyDbContext.Entry(itm).Property(x => x.ModifiedOn).IsModified = true;
                        });

                    }
                });
                if (tempItemToRackList.Count > 0)
                {
                    pharmacyDbContext.PHRMRackItem.AddRange(tempItemToRackList);
                }
                pharmacyDbContext.SaveChanges();

                var rackList = pharmacyDbContext.PHRMRack.ToList();

                if (tempItemToRackList.Count > 0)
                {
                    tempItemToRackList.ForEach(i =>
                    {
                        if (i.RackId != null)
                        {
                            i.RackNo = rackList.FirstOrDefault(x => x.RackId == i.RackId && x.StoreId == i.StoreId).RackNo;
                        }
                        else
                        {
                            i.RackNo = "None";
                        }
                    });
                    responseData.Results = tempItemToRackList;
                }
                else
                {
                    item.ForEach(i =>
                    {
                        if (i.RackId != null)
                        {
                            i.RackNo = rackList.FirstOrDefault(x => x.RackId == i.RackId && x.StoreId == i.StoreId).RackNo;
                        }
                        else
                        {
                            i.RackNo = "None";
                        }
                    });
                    responseData.Results = item;
                }
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.OK;
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.Failed;
                responseData.ErrorMessage = ex.ToString();
            }
            return Ok(responseData);
        }
    }
}
