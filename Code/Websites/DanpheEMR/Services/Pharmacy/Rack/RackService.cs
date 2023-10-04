using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.ServerModel.PharmacyModels;
using DanpheEMR.Utilities;
using DanpheEMR.ViewModel.Pharmacy;
using Microsoft.Extensions.Options;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace DanpheEMR.Services.Pharmacy.Rack
{
    public class RackService : IRackService
    {
        public PharmacyDbContext db;

        private readonly string connString = null;
        public RackService(IOptions<MyConfiguration> _config)
        {
            connString = _config.Value.Connectionstring;
            db = new PharmacyDbContext(connString);
        }

        public RackViewModel AddRack(PHRMRackModel model)
        {
            db.PHRMRack.Add(model);
            db.SaveChanges();
            var result = new RackViewModel()
            {
                RackId = model.RackId,
                RackNo = model.RackNo,
                ParentRackNo = (from rack in db.PHRMRack
                                where rack.RackId == model.ParentId
                                select rack.RackNo).FirstOrDefault(),
                ParentId = model.ParentId,
                StoreId = model.StoreId,
                Description = model.Description,
                CreatedBy = model.CreatedBy,
                CreatedOn = model.CreatedOn,
            };
            return result;
        }


        public void DeleteRack(int id)
        {
            var IsExistData = db.PHRMRack.Where(x => x.RackId == id).FirstOrDefault();
            db.PHRMRack.Remove(IsExistData);
            db.SaveChanges();
        }

        public RackViewModel GetRack(int id)
        {
            var query = db.PHRMRack.Where(x => x.RackId == id).FirstOrDefault();
            var result = new RackViewModel()
            {
                RackId = query.RackId,
                RackNo = query.RackNo,
                ParentId = query.ParentId,
                StoreId = query.StoreId,
                ParentRackNo = (from rack in db.PHRMRack
                                where rack.RackId == query.ParentId
                                select rack.RackNo).FirstOrDefault(),
                Description = query.Description,
                CreatedBy = query.CreatedBy,
                CreatedOn = query.CreatedOn
            };
            return result;
        }

        public List<RackViewModel> ListRack()
        {
            //TODO:add server side pagination
            var query = (from rack in db.PHRMRack
                         join parRack in db.PHRMRack on rack.ParentId equals parRack.RackId into parRackTemp
                         from parentRack in parRackTemp.DefaultIfEmpty()
                         select new RackViewModel
                         {
                             RackId = rack.RackId,
                             ParentId = rack.ParentId,
                             ParentRackNo = parentRack.RackNo,
                             StoreId = rack.StoreId,
                             StoreName = db.PHRMStore.Where(s => s.StoreId == rack.StoreId).Select(s => s.Name).FirstOrDefault(),
                             RackNo = rack.RackNo,
                             Description = rack.Description,
                             CreatedBy = rack.CreatedBy,
                             CreatedOn = rack.CreatedOn

                         }).OrderByDescending(r => r.CreatedOn).ToList();
            return query;
        }

        public RackViewModel UpdateRack(RackViewModel model)
        {
            var result = new PHRMRackModel()
            {
                RackId = model.RackId,
                RackNo = model.RackNo,
                ParentId = model.ParentId,
                StoreId = model.StoreId,
                Description = model.Description,
            };
            db.Entry(result).State = System.Data.Entity.EntityState.Modified;
            db.Entry(result).Property(rack => rack.CreatedBy).IsModified = false;
            db.Entry(result).Property(rack => rack.CreatedOn).IsModified = false;
            db.SaveChanges();
            return model;
        }


        public List<RackViewModel> GetParentRack()
        {
            var list = (from rack in db.PHRMRack
                        where rack.ParentId == null
                        select new RackViewModel
                        {
                            ParentId = rack.ParentId,
                            RackId = rack.RackId,
                            Description = rack.Description,
                            RackNo = rack.RackNo,
                            StoreId = rack.StoreId,
                            CreatedBy = rack.CreatedBy,
                            CreatedOn = rack.CreatedOn
                        }).ToList();
            return list;
        }

        public List<RackViewModel> GetAllRack()
        {
            var list = (from rack in db.PHRMRack
                        where rack.ParentId == null || rack.ParentId != null
                        select new RackViewModel
                        {
                            ParentId = rack.ParentId,
                            RackId = rack.RackId,
                            Description = rack.Description,
                            RackNo = rack.RackNo,
                            StoreId = rack.StoreId,
                            CreatedBy = rack.CreatedBy,
                            CreatedOn = rack.CreatedOn
                        }).ToList();
            return list;

        }
        public List<PHRM_MAP_ItemToRack> GetAllRackItem()
        {
            var list = (from rack in db.PHRMRackItem
                        select new PHRM_MAP_ItemToRack
                        {
                            ItemId = rack.ItemId,
                            StoreId = rack.StoreId,
                            RackId = rack.RackId,
                            IsActive = rack.IsActive,
                            CreatedOn = rack.CreatedOn,
                            CreatedBy = rack.CreatedBy

                        }).ToList();
            return list;
        }

        public string GetDrugList(int rackId, int storeId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            var result = (from rack in db.PHRMRackItem
                          join item in db.PHRMItemMaster on rack.ItemId equals item.ItemId into parRackTemp
                          from parentRack in parRackTemp.DefaultIfEmpty()
                          select new
                          {
                              ItemName = parentRack.ItemName,
                              storeId = rack.StoreId,
                              rackid = rack.RackId
                          }).Where(s => (s.rackid == rackId && s.storeId == storeId)).ToList();
            responseData.Status = "OK";
            responseData.Results = result;
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        public string GetStoreRackNameByItemId(int itemId)
        {
            var rackId = db.PHRMItemMaster.Where(item => item.ItemId == itemId).Select(item => item.StoreRackId).FirstOrDefault();
            return db.PHRMRack.Where(rack => rack.RackId == rackId).Select(rack => rack.RackNo).FirstOrDefault() ?? "N/A";
        }
    }
}
