using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DanpheEMR.ViewModel.Pharmacy;
using DanpheEMR.DalLayer;
using DanpheEMR.Core.Configuration;
using Microsoft.Extensions.Options;
using DanpheEMR.ServerModel.PharmacyModels;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;

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
                Name = model.Name,
                ParentRackName = (from rack in db.PHRMRack
                                  where rack.RackId == model.ParentId
                                  select rack.Name).FirstOrDefault(),
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
                Name = query.Name,
                ParentRackName = (from rack in db.PHRMRack
                                  where rack.RackId == query.ParentId
                                  select rack.Name).FirstOrDefault(),
                Description = query.Description,
                CreatedBy = query.CreatedBy,
                CreatedOn = query.CreatedOn
            };
            return result;
        }

        public List<RackViewModel> ListRack()
        {
            //todo:add server side pagination
            var query = (from rack in db.PHRMRack
                         join parRack in db.PHRMRack on rack.ParentId equals parRack.RackId into parRackTemp
                         from parentRack in parRackTemp.DefaultIfEmpty()
                         select new RackViewModel
                         {
                             RackId = rack.RackId,
                             ParentId=rack.ParentId,
                             ParentRackName = parentRack.Name,
                             Name = rack.Name,
                             Description = rack.Description,
                             CreatedBy = rack.CreatedBy,
                             CreatedOn = rack.CreatedOn

                         }).ToList();               
            return query;
        }

        public RackViewModel UpdateRack(RackViewModel model)
        {
            var result = new PHRMRackModel()
            {
                RackId = model.RackId,
                Name = model.Name,
                Description = model.Description,
                CreatedBy = model.CreatedBy,
                CreatedOn = model.CreatedOn
            };
            db.Entry(result).State = System.Data.Entity.EntityState.Modified;
            db.SaveChanges();
            return model;
        }


        public List<RackViewModel> GetParentRack()
        {
            var list = (from rack in db.PHRMRack
                        where rack.ParentId == 0
                        select new RackViewModel {
                             ParentId = rack.ParentId,
                             RackId = rack.RackId,
                             Description = rack.Description,
                             Name = rack.Name,
                             CreatedBy = rack.CreatedBy,
                             CreatedOn = rack.CreatedOn
                        }).ToList();
            return list;
        }

        public List<PHRMItemMasterModel> GetDrugList(int rackId)
        {
            var list = (from drugItems in db.PHRMItemMaster
                        where drugItems.Rack == rackId
                        select drugItems ).ToList();
            return list;
        }
    }
}
