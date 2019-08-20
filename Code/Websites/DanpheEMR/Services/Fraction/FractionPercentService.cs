using System;
using System.Collections.Generic;
using System.Linq;
using DanpheEMR.DalLayer;
using DanpheEMR.Core.Configuration;
using Microsoft.Extensions.Options;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.FractionModels;

namespace DanpheEMR.Services
{
    public class FractionPercentService : IFractionPercentService
    {
        public FractionDbContext db;
        private readonly string connString = null;

        public FractionPercentService(IOptions<MyConfiguration> _config)
        {
            connString = _config.Value.Connectionstring;
            db = new FractionDbContext(connString);
        }

        public List<FractionPercentVM> ListFractionApplicableItems()
        {
            //todo:add server side pagination
            //join parRack in db.PHRMRack on rack.ParentId equals parRack.RackId into parRackTemp
            //             from parentRack in parRackTemp.DefaultIfEmpty()

            var itemList = (from items in db.BillItemPrice
                            join frac in db.FractionPercent on items.BillItemPriceId equals frac.BillItemPriceId into fraction
                            from fractionPercent in fraction.DefaultIfEmpty()
                            where items.IsFractionApplicable == true
                            select new FractionPercentVM
                            {
                                PercentSettingId= fractionPercent.PercentSettingId,
                                BillItemPriceId = items.BillItemPriceId,
                                ItemName = items.ItemName,
                                ItemPrice = items.Price,
                                DoctorPercent = fractionPercent.DoctorPercent,
                                HospitalPercent = fractionPercent.HospitalPercent,
                                Description = fractionPercent.Description,
                                CreatedOn = fractionPercent.CreatedOn,

                            }).OrderByDescending(a => a.CreatedOn).ToList();
            return itemList;
        }

        public FractionPercentVM AddFractionPercent(FractionPercentModel model)
        {
            model.CreatedOn = DateTime.Now;
            db.FractionPercent.Add(model);
            db.SaveChanges();
            return GetFractionPercent(model.PercentSettingId);
           
           
        }

        public FractionPercentVM UpdateFractionPercent(FractionPercentModel model)
        {
            db.Entry(model).State = System.Data.Entity.EntityState.Modified;
            db.SaveChanges();
            return GetFractionPercent(model.PercentSettingId);
        }

        public FractionPercentVM GetFractionPercent(int id)
        {
            
            var result = (from fractionPercent in db.FractionPercent
                          join items in db.BillItemPrice on fractionPercent.BillItemPriceId equals items.BillItemPriceId
                          where fractionPercent.PercentSettingId == id

                          select new FractionPercentVM
                          {
                              PercentSettingId = fractionPercent.PercentSettingId,
                              BillItemPriceId = items.BillItemPriceId,
                              ItemName = items.ItemName,
                              ItemPrice = items.Price,
                              DoctorPercent = fractionPercent.DoctorPercent,
                              HospitalPercent = fractionPercent.HospitalPercent,
                              Description = fractionPercent.Description,
                              CreatedOn = fractionPercent.CreatedOn,

                          }).FirstOrDefault();
            return result;

        }

        public FractionPercentVM GetFractionPercentByBillPriceId(int id)
        {
            
            var result = (from fractionPercent in db.FractionPercent
                          join items in db.BillItemPrice on fractionPercent.BillItemPriceId equals items.BillItemPriceId
                          where fractionPercent.BillItemPriceId == id

                          select new FractionPercentVM
                          {
                              PercentSettingId = fractionPercent.PercentSettingId,
                              BillItemPriceId = items.BillItemPriceId,
                              ItemName = items.ItemName,
                              ItemPrice = items.Price,
                              DoctorPercent = fractionPercent.DoctorPercent,
                              HospitalPercent = fractionPercent.HospitalPercent,
                              Description = fractionPercent.Description,
                              CreatedOn = fractionPercent.CreatedOn,

                          }).FirstOrDefault();
            return result;

        }
    }
}
