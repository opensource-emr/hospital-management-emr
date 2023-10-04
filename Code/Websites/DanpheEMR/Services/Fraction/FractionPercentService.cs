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
                            join frac in db.FractionPercent on items.ServiceItemId equals frac.BillItemPriceId into fraction
                            join priceCatServItem in db.BillPriceCategoryServiceItems on items.ServiceItemId equals priceCatServItem.ServiceItemId
                            from fractionPercent in fraction.DefaultIfEmpty()
                            where priceCatServItem.PriceCategoryId == 1 //Krishna 13thMarch'23, 1 is for Normal and Hard Coded for Now
                            //where items.IsFractionApplicable == true
                            select new FractionPercentVM
                            {
                                PercentSettingId= fractionPercent.PercentSettingId,
                                BillItemPriceId = items.ServiceItemId,
                                ItemName = items.ItemName,
                                ItemPrice = (double)priceCatServItem.Price,
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
                          join items in db.BillItemPrice on fractionPercent.BillItemPriceId equals items.ServiceItemId
                          join priceCatServItem in db.BillPriceCategoryServiceItems on items.ServiceItemId equals priceCatServItem.ServiceItemId
                          where fractionPercent.PercentSettingId == id && priceCatServItem.PriceCategoryId == 1 //Krishna 13thMarch'23, 1 is for Normal and Hardcoded for Now

                          select new FractionPercentVM
                          {
                              PercentSettingId = fractionPercent.PercentSettingId,
                              BillItemPriceId = items.ServiceItemId,
                              ItemName = items.ItemName,
                              ItemPrice = (double)priceCatServItem.Price,
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
                          join items in db.BillItemPrice on fractionPercent.BillItemPriceId equals items.ServiceItemId
                          join priceCatServItem in db.BillPriceCategoryServiceItems on items.ServiceItemId equals priceCatServItem.ServiceItemId
                          where fractionPercent.BillItemPriceId == id && priceCatServItem.PriceCategoryId == 1 // Krishna 13thMarch'23 1 is for Normal and Hard Coded for Now

                          select new FractionPercentVM
                          {
                              PercentSettingId = fractionPercent.PercentSettingId,
                              BillItemPriceId = items.ServiceItemId,
                              ItemName = items.ItemName,
                              ItemPrice = (double)priceCatServItem.Price,
                              DoctorPercent = fractionPercent.DoctorPercent,
                              HospitalPercent = fractionPercent.HospitalPercent,
                              Description = fractionPercent.Description,
                              CreatedOn = fractionPercent.CreatedOn,

                          }).FirstOrDefault();
            return result;

        }
    }
}
