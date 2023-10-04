
using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.Core.Configuration;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using System.Data.Entity;
using Microsoft.Extensions.Options;
using DanpheEMR.Utilities;
using DanpheEMR.ServerModel.InventoryModels;
using DanpheEMR.AccTransfer;
using DanpheEMR.Security;



// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers
{
    [Route("api/[controller]")]
    public class InventorySettingsController : CommonController
    {
        private readonly InventoryDbContext _inventoryDbContext;
        private readonly RbacDbContext _rbacDbContext;
        private readonly AccountingDbContext _accountingDBContext;
        public InventorySettingsController(IOptions<MyConfiguration> _config) : base(_config)
        {
            //connString = _config.Value.Connectionstring;
            _inventoryDbContext = new InventoryDbContext(connString);
            _rbacDbContext = new RbacDbContext(connString);
            _accountingDBContext = new AccountingDbContext(connString);

        }

        [HttpGet]
        [Route("Vendors")]
        public IActionResult Vendors()
        {

            //if (reqType == "VendorsList")
            Func<object> func = () => (from vendor in _inventoryDbContext.Vendors
                                       select vendor).ToList();
            return InvokeHttpGetFunction<object>(func);

        }

        /*if (reqType == "VendorsList")
                 {

                     List<VendorMasterModel> vendorslist = (from vendor in _inventoryDbContext.Vendors
                                                            select vendor).ToList();
                     _responseData.Status = "OK";
                     _responseData.Results = vendorslist;
                 }*/

        [HttpGet]
        [Route("InventoryTerms")]
        public IActionResult GetInventoryTerms()
        {
            //else if (reqType == "GetInventoryTerms")
            Func<object> func = () => (from terms in _inventoryDbContext.InventoryTerms
                                       select terms).OrderByDescending(a => a.CreatedOn).ToList();
            return InvokeHttpGetFunction<object>(func);

        }
        /*    else if (reqType == "GetInventoryTerms")
            {

                List<InventoryTermsModel> termsconditions = await(from terms in inventoryDbContext.InventoryTerms
                                                             select terms).OrderByDescending(a => a.CreatedOn).ToList();
                 _responseData.Status = "OK";
                responseData.Results = termsconditions;
                return OkObjectResult()
            }*/

        [HttpGet]
        [Route("CurrencyCodes")]
        public IActionResult GetCurrencyCodeList()
        {
            //else if (reqType == "GetCurrencyCodeList")
            Func<object> func = () => (from curr in _inventoryDbContext.CurrencyMaster
                                       select curr).ToList();
            return InvokeHttpGetFunction<object>(func);

        }
        /*  else if (reqType == "GetCurrencyCodeList")
          {
              List<CurrencyMasterModel> currlist = (from curr in inventoryDbContext.CurrencyMaster
                                                    select curr).ToList();
              responseData.Status = "OK";
              responseData.Results = currlist;
          }*/

        /*[HttpGet]
        [Route("VendorsWithDefaultItems")]
        public IActionResult GetVendorsWithDefaultItems()
        {
            //else if (reqType == "GetVendors")
            Func<object> func = () => GetVendorsWithDefaultItemsDetails();
            return InvokeHttpGetFunction<object>(func);

        }

        private object GetVendorsWithDefaultItemsDetails()
        {

            List<VendorMasterModel> vendorslist = ((from v in _inventoryDbContext.Vendors
                                                    select v).ToList());
            foreach (VendorMasterModel vendor in vendorslist)
            {
                vendor.DefaultItem = DanpheJSONConvert.DeserializeObject<List<int>>(vendor.DefaultItemJSON);
            }
            return vendorslist;

        }*/

        /*
                   else if (reqType == "GetVendors")
               {
                   List<VendorMasterModel> vendorslist = (from v in _inventoryDbContext.Vendors
                                                          select v).ToList();
                   foreach (VendorMasterModel vendor in vendorslist)
                   {
                       vendor.DefaultItem = DanpheJSONConvert.DeserializeObject<List<int>>(vendor.DefaultItemJSON);
                   }
                   responseData.Status = "OK";
                   responseData.Results = vendorslist;
               }
   */

        [HttpGet]
        [Route("ItemCategories")]
        public IActionResult GetItemCategories()
        {
            //else if (reqType == "GetItemCategory")
            Func<object> func = () => (from itemCat in _inventoryDbContext.ItemCategoryMaster
                                       select itemCat).ToList();
            return InvokeHttpGetFunction<object>(func);

        }
        /*   else if (reqType == "GetItemCategory")
           {
               List<ItemCategoryMasterModel> itemcategorylist = (from v in inventoryDbContext.ItemCategoryMaster
                                                                 select v).ToList();
               responseData.Status = "OK";
               responseData.Results = itemcategorylist;
           }*/

        [HttpGet]
        [Route("ItemSubCategories")]
        public IActionResult GetItemSubCategory()
        {
            Func<object> func = () => (from itemSubCat in _inventoryDbContext.ItemSubCategoryMaster
                                       select itemSubCat).ToList();
            return InvokeHttpGetFunction<object>(func);
        }
        /* else if (reqType == "GetItemSubCategory")
         {
             List<ItemSubCategoryMasterModel> itemsubcategorylist = (from v in inventoryDbContext.ItemSubCategoryMaster
                                                                     select v).ToList();
             responseData.Status = "OK";
             responseData.Results = itemsubcategorylist;
         }*/

        [HttpGet]
        [Route("PackagingTypes")]
        public IActionResult GetPackagingType()
        {
            //else if (reqType == "GetPackagingType")
            Func<object> func = () => (from pack in _inventoryDbContext.PackagingTypeMaster
                                       select pack).ToList();
            return InvokeHttpGetFunction<object>(func);
        }

        /*  else if (reqType == "GetPackagingType")
          {
              List<PackagingTypeMasterModel> packagingtypelist = (from v in inventoryDbContext.PackagingTypeMaster
                                                                  select v).ToList();
      responseData.Status = "OK";
              responseData.Results = packagingtypelist;
          }*/

        /*      
        */
        [HttpGet]
        [Route("AccountHeads")]
        public IActionResult GetAccountHeads(Boolean showIsActive)
        {
            //else if (reqType == "GetAccountHead")
            List<AccountHeadMasterModel> accountheadlist = new List<AccountHeadMasterModel>();
            if (showIsActive)
            {
                //getting IsActive=true list
                Func<object> func = () => (from account in _inventoryDbContext.AccountHeadMaster
                                           where account.IsActive == showIsActive
                                           select account).ToList();
                return InvokeHttpGetFunction<object>(func);
            }
            else
            {
                //getting all list
                Func<object> func = () => _inventoryDbContext.AccountHeadMaster.ToList();
                return InvokeHttpGetFunction<object>(func);
            }

        }

        /*    else if (reqType == "GetAccountHead")
          {

              //Yubraj: -- modification --2nd April 2019
              //ShowIsActive has either true or null value
              //ShowIsActive= true gets all the accountheadlist with IsActive true and false
              List<AccountHeadMasterModel> accountheadlist = new List<AccountHeadMasterModel>();
              if (ShowIsActive)
              {
                  //getting IsActive=true list
                  accountheadlist = (from list in inventoryDbContext.AccountHeadMaster
                                     where list.IsActive == ShowIsActive
                                     select list).ToList();
              }
              else
              {
                  //getting all list
                  accountheadlist = inventoryDbContext.AccountHeadMaster.ToList();
              }
              responseData.Status = "OK";
              responseData.Results = accountheadlist;
          }*/

        [HttpGet]
        [Route("UnitOfMeasurements")]
        public IActionResult GetUnitOfMeasurements()
        {
            //else if (reqType == "GetUnitOfMeasurement")
            Func<object> func = () => (from unit in _inventoryDbContext.UnitOfMeasurementMaster
                                       select unit).ToList();
            return InvokeHttpGetFunction<object>(func);

        }

        /* else if (reqType == "GetUnitOfMeasurement")
         {
             List<UnitOfMeasurementMasterModel> unitofmeasurementlist = (from v in inventoryDbContext.UnitOfMeasurementMaster
                                                                         select v).ToList();
             responseData.Status = "OK";
             responseData.Results = unitofmeasurementlist;
         }*/
        [HttpGet]
        [Route("Items")]
        public IActionResult GetItemList()
        {
            //else if (reqType == "GetItemList")
            Func<object> func = () => (from itm in _inventoryDbContext.Items
                                       select itm).ToList();
            return InvokeHttpGetFunction<object>(func);
        }

        /* else if (reqType == "GetItemList")
                  {
                      List<ItemMasterModel> itemlist = (from i in inventoryDbContext.Items
                                                        select i).ToList();
              responseData.Status = "OK";
                      responseData.Results = itemlist;
                  }*/
        [HttpGet]
        [Route("OtherCharges")]
        public IActionResult GetAllOtherCharges()
        {
            //else if (reqType == "GetAllOtherCharges")
            Func<object> func = () => (from charge in _inventoryDbContext.OtherCharges
                                       select charge).ToList();
            return InvokeHttpGetFunction<object>(func);
        }

        /* else if (reqType == "GetAllOtherCharges")
         {
        List<InventoryChargesMasterModel> otherCharges = (from i in inventoryDbContext.OtherCharges
                                                               select i).ToList();
        responseData.Status = "OK";
        responseData.Results = otherCharges;
         }*/

        [HttpGet]
        [Route("OtherCharge")]
        public IActionResult GetOtherCharge(int chargeId)
        {
            //else if (reqType == "GetOtherCharge")
            Func<object> func = () => (from i in _inventoryDbContext.OtherCharges
                                       where i.ChargeId == chargeId
                                       select i).FirstOrDefault();
            return InvokeHttpGetFunction<object>(func);

        }

        /*else if (reqType == "GetOtherCharge")
    {
    InventoryChargesMasterModel otherCharges = (from i in inventoryDbContext.OtherCharges
                                            where i.ChargeId == Id
                                            select i).FirstOrDefault();
    responseData.Status = "OK";
    responseData.Results = otherCharges;
    }*/

        /*
                [HttpGet]
                [Route("ItemsWithUnit")]
                public IActionResult GetItem()
                {
                    // else if (reqType == "GetItem")
                    Func<object> func = () => (
                      from v in _inventoryDbContext.Items
                      join unit in _inventoryDbContext.UnitOfMeasurementMaster on v.UnitOfMeasurementId equals unit.UOMId into ps
                      from unit in ps.DefaultIfEmpty()
                      select new
                      {
                          v.ItemId,
                          v.Code,
                          v.CompanyId,
                          v.ItemCategoryId,
                          //v.AccountHeadId,
                          v.SubCategoryId,
                          v.PackagingTypeId,
                          v.UnitOfMeasurementId,
                          v.ItemName,
                          v.ItemType,
                          v.Description,
                          v.ReOrderQuantity,
                          v.VAT,
                          v.MinStockQuantity,
                          v.BudgetedQuantity,
                          v.StandardRate,
                          v.UnitQuantity,
                          v.CreatedBy,
                          v.CreatedOn,
                          v.IsActive,
                          unit.UOMName,
                          v.MSSNO,
                          v.MaintenanceOwnerRoleId
                      }).ToList();
                    return InvokeHttpGetFunction<object>(func);

                }*/


        /*else if (reqType == "GetItem")
        {
            var itemlist = (
                from v in inventoryDbContext.Items
                join unit in inventoryDbContext.UnitOfMeasurementMaster on v.UnitOfMeasurementId equals unit.UOMId into ps
                from unit in ps.DefaultIfEmpty()
                select new
                {
                    v.ItemId,
                    v.Code,
                    v.CompanyId,
                    v.ItemCategoryId,
                    //v.AccountHeadId,
                    v.SubCategoryId,
                    v.PackagingTypeId,
                    v.UnitOfMeasurementId,
                    v.ItemName,
                    v.ItemType,
                    v.Description,
                    v.ReOrderQuantity,
                    v.VAT,
                    v.MinStockQuantity,
                    v.BudgetedQuantity,
                    v.StandardRate,
                    v.UnitQuantity,
                    v.CreatedBy,
                    v.CreatedOn,
                    v.IsActive,
                    unit.UOMName,
                    v.MSSNO,
                    v.MaintenanceOwnerRoleId
                }).ToList();
            responseData.Status = "OK";
            responseData.Results = itemlist;
        }*/
        /* [HttpGet]
         [Route("OtherCharges")]
         public async Task<IActionResult> GetOtherCharges()
         {
             List<InventoryChargesMasterModel> othercharges = new List<InventoryChargesMasterModel>();
             othercharges = await (_inventoryDbContext.OtherCharges.ToListAsync());
             _responseData.Status = "OK";
             _responseData.Results = othercharges;
             return Ok(_responseData);

         }*/


        /*else if (reqType == "GetOtherCharges")
        {
            List<InventoryChargesMasterModel> othercharges = new List<InventoryChargesMasterModel>();
            othercharges = (inventoryDbContext.OtherCharges.ToList());
            responseData.Status = "OK";
            responseData.Results = othercharges;
        }*/
        /*}*/

        [HttpGet]
        [Route("TermsListByTermsApplicationId")]
        public IActionResult GetTermsListByTermsApplicationId(int termsApplicationId)
        {
            Func<object> func = () => _inventoryDbContext.InventoryTerms.Where(term => term.TermsApplicationEnumId == termsApplicationId)
                                                               .ToList();
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("ActiveRbacRoles")]
        public IActionResult GetActiveRbacRolesRoles()
        {
            Func<object> func = () => _rbacDbContext.Roles.Where(role => role.IsActive == true).Select(role => new
            {
                RoleId = role.RoleId,
                RoleName = role.RoleName
            }).ToList();
            return InvokeHttpGetFunction<object>(func);
        }
        [HttpPost]
        [Route("Vendor")]
        public IActionResult PostNewVendor()
        {
            //if (reqType == "AddVendors")
            Func<object> func = () => PostNewVendorDetail();
            return InvokeHttpPostFunction<object>(func);
        }
        private object PostNewVendorDetail()
        {
            string str = this.ReadPostData();
            VendorMasterModel vendorModel = DanpheJSONConvert.DeserializeObject<VendorMasterModel>(str);
            vendorModel.VendorCode = InventoryBL.GetNewVendorCode(_inventoryDbContext);
            vendorModel.CreatedOn = System.DateTime.Now;
            _inventoryDbContext.Vendors.Add(vendorModel);
            _inventoryDbContext.SaveChanges();
            return vendorModel;

        }

        /*if (reqType == "AddVendors")
        {
            VendorMasterModel vendorModel = DanpheJSONConvert.DeserializeObject<VendorMasterModel>(str);
            vendorModel.VendorCode = InventoryBL.GetNewVendorCode(inventoryDBContext);
            vendorModel.CreatedOn = System.DateTime.Now;
            inventoryDBContext.Vendors.Add(vendorModel);
            inventoryDBContext.SaveChanges();
            responseData.Results = vendorModel;
            responseData.Status = "OK";
        }*/

        [HttpPost]
        [Route("ItemCategory")]
        public IActionResult PostItemCategory()
        {
            //else if (reqType == "AddItemCategory")
            Func<object> func = () => PostItemCategoryDetail();
            return InvokeHttpPostFunction<object>(func);
        }
        private object PostItemCategoryDetail()
        {
            string str = this.ReadPostData();
            ItemCategoryMasterModel itemcategoryModel = DanpheJSONConvert.DeserializeObject<ItemCategoryMasterModel>(str);
            itemcategoryModel.CreatedOn = System.DateTime.Now;
            _inventoryDbContext.ItemCategoryMaster.Add(itemcategoryModel);
            _inventoryDbContext.SaveChanges();
            return itemcategoryModel;

        }

        /* else if (reqType == "AddItemCategory")
         {
          string str = this.ReadPostData();
        ItemCategoryMasterModel itemcategoryModel = DanpheJSONConvert.DeserializeObject<ItemCategoryMasterModel>(str);
             itemcategoryModel.CreatedOn = System.DateTime.Now;
             inventoryDBContext.ItemCategoryMaster.Add(itemcategoryModel);
             inventoryDBContext.SaveChanges();
             responseData.Results = itemcategoryModel;
             responseData.Status = "OK";
         }*/


        [HttpPost]
        [Route("ItemSubCategory")]
        public IActionResult PostItemSubCategory()
        {
            //else if (reqType == "AddItemSubCategory")
            Func<object> func = () => PostItemSubCategoryDetail();
            return InvokeHttpPostFunction<object>(func);
        }
        private object PostItemSubCategoryDetail()
        {
            using (var dbContextTransaction = _accountingDBContext.Database.BeginTransaction())
            {
                string str = this.ReadPostData();
                ItemSubCategoryMasterModel itemsubcategoryModel = DanpheJSONConvert.DeserializeObject<ItemSubCategoryMasterModel>(str);
                itemsubcategoryModel.CreatedOn = System.DateTime.Now;
                _inventoryDbContext.ItemSubCategoryMaster.Add(itemsubcategoryModel);
                _inventoryDbContext.SaveChanges();
                /// START :         
                LedgerMappingModel ledgerMapping = new LedgerMappingModel();
                if (itemsubcategoryModel.LedgerId > 0)
                {
                    var ledgerData = _accountingDBContext.Ledgers.Where(l => l.LedgerId == itemsubcategoryModel.LedgerId).FirstOrDefault();
                    if (ledgerData != null)
                    {
                        ledgerData.LedgerReferenceId = itemsubcategoryModel.SubCategoryId;
                        _accountingDBContext.Ledgers.Attach(ledgerData);
                        _accountingDBContext.Entry(ledgerData).State = EntityState.Modified;
                        _accountingDBContext.Entry(ledgerData).Property(x => x.LedgerReferenceId).IsModified = true;
                    }
                    ledgerMapping.LedgerId = (int)itemsubcategoryModel.LedgerId;
                    ledgerMapping.LedgerType = "inventorysubcategory";
                    ledgerMapping.ReferenceId = (int)itemsubcategoryModel.SubCategoryId;
                    _accountingDBContext.LedgerMappings.Add(ledgerMapping);
                    _accountingDBContext.SaveChanges();
                }

                return itemsubcategoryModel;

            }

        }


        /*     else if (reqType == "AddItemSubCategory")
             {
                 AccountingDbContext accountingDBContext = new AccountingDbContext(connString);
                 using (var dbContextTransaction = accountingDBContext.Database.BeginTransaction())
                 {
                     try
                     {

                         ItemSubCategoryMasterModel itemsubcategoryModel = DanpheJSONConvert.DeserializeObject<ItemSubCategoryMasterModel>(str);
         itemsubcategoryModel.CreatedOn = System.DateTime.Now;
                         inventoryDBContext.ItemSubCategoryMaster.Add(itemsubcategoryModel);
                         inventoryDBContext.SaveChanges();
                         /// START :         
                         LedgerMappingModel ledgerMapping = new LedgerMappingModel();
                         if (itemsubcategoryModel.LedgerId > 0)
                         {
                             var ledgerData = accountingDBContext.Ledgers.Where(l => l.LedgerId == itemsubcategoryModel.LedgerId).FirstOrDefault();
                             if (ledgerData != null)
                             {
                                 ledgerData.LedgerReferenceId = itemsubcategoryModel.SubCategoryId;
                                 accountingDBContext.Ledgers.Attach(ledgerData);
                                 accountingDBContext.Entry(ledgerData).State = EntityState.Modified;
                                 accountingDBContext.Entry(ledgerData).Property(x => x.LedgerReferenceId).IsModified = true;
                             }
        ledgerMapping.LedgerId = (int)itemsubcategoryModel.LedgerId;
        ledgerMapping.LedgerType = "inventorysubcategory";
        ledgerMapping.ReferenceId = (int)itemsubcategoryModel.SubCategoryId;
        accountingDBContext.LedgerMappings.Add(ledgerMapping);
        accountingDBContext.SaveChanges();
                         }
                         responseData.Results = itemsubcategoryModel;
        responseData.Status = "OK";
        dbContextTransaction.Commit();
                     }
                     catch (Exception ex)
        {
         dbContextTransaction.Rollback();
         throw ex;
        }
                 }
             }*/

        [HttpPost]
        [Route("InventoryTerm")]
        public IActionResult PostInventoryTerm()
        {
            // else if (reqType == "PostInventoryTerms")
            Func<object> func = () => PostInventoryTermDetail();
            return InvokeHttpPostFunction<object>(func);
        }
        private object PostInventoryTermDetail()
        {
            string str = this.ReadPostData();
            InventoryTermsModel termsconditions = DanpheJSONConvert.DeserializeObject<InventoryTermsModel>(str);
            termsconditions.CreatedOn = System.DateTime.Now;
            _inventoryDbContext.InventoryTerms.Add(termsconditions);
            _inventoryDbContext.SaveChanges();
            return termsconditions;

        }
        /*          //posting to inventory terms & conditions 
              else if (reqType == "PostInventoryTerms")
        {
        InventoryTermsModel termsconditions = DanpheJSONConvert.DeserializeObject<InventoryTermsModel>(str);
          termsconditions.CreatedOn = System.DateTime.Now;
        inventoryDBContext.InventoryTerms.Add(termsconditions);
        inventoryDBContext.SaveChanges();
        responseData.Results = termsconditions;
        responseData.Status = "OK";
        }*/
        [HttpPost]
        [Route("UnitOfMeasurement")]
        public IActionResult PostUnitOfMeasurement()
        {
            // else if (reqType == "AddUnitOfMeasurement")
            Func<object> func = () => PostUnitOfMeasurementDetail();
            return InvokeHttpPostFunction<object>(func);
        }
        private object PostUnitOfMeasurementDetail()
        {
            string str = this.ReadPostData();
            UnitOfMeasurementMasterModel unitofmeasurementModel = DanpheJSONConvert.DeserializeObject<UnitOfMeasurementMasterModel>(str);
            unitofmeasurementModel.CreatedOn = System.DateTime.Now;
            _inventoryDbContext.UnitOfMeasurementMaster.Add(unitofmeasurementModel);
            _inventoryDbContext.SaveChanges();
            return unitofmeasurementModel;
        }

        /*else if (reqType == "AddUnitOfMeasurement")
        {
            UnitOfMeasurementMasterModel unitofmeasurementModel = DanpheJSONConvert.DeserializeObject<UnitOfMeasurementMasterModel>(str);
            unitofmeasurementModel.CreatedOn = System.DateTime.Now;
            inventoryDBContext.UnitOfMeasurementMaster.Add(unitofmeasurementModel);
            inventoryDBContext.SaveChanges();
            responseData.Results = unitofmeasurementModel;
            responseData.Status = "OK";
        }*/
        [HttpPost]
        [Route("PackagingType")]
        public IActionResult PostPackagingType()
        {
            // else if (reqType == "AddPackagingType")
            Func<object> func = () => PostPackagingTypeDetail();
            return InvokeHttpPostFunction<object>(func);
        }
        private object PostPackagingTypeDetail()
        {
            string str = this.ReadPostData();
            PackagingTypeMasterModel packagingtypeModel = DanpheJSONConvert.DeserializeObject<PackagingTypeMasterModel>(str);
            packagingtypeModel.CreatedOn = System.DateTime.Now;
            _inventoryDbContext.PackagingTypeMaster.Add(packagingtypeModel);
            _inventoryDbContext.SaveChanges();
            return packagingtypeModel;

        }
        /*else if (reqType == "AddPackagingType")
        {
            PackagingTypeMasterModel packagingtypeModel = DanpheJSONConvert.DeserializeObject<PackagingTypeMasterModel>(str);
            packagingtypeModel.CreatedOn = System.DateTime.Now;
            inventoryDBContext.PackagingTypeMaster.Add(packagingtypeModel);
            inventoryDBContext.SaveChanges();
            responseData.Results = packagingtypeModel;
            responseData.Status = "OK";
        }*/
        [HttpPost]
        [Route("AccountHead")]
        public IActionResult AddAccountHead()
        {
            //else if (reqType == "AddAccountHead")
            Func<object> func = () => AddAccountHeadDetail();
            return InvokeHttpPostFunction<object>(func);
        }
        private object AddAccountHeadDetail()
        {
            string str = this.ReadPostData();
            AccountHeadMasterModel accountheadModel = DanpheJSONConvert.DeserializeObject<AccountHeadMasterModel>(str);
            accountheadModel.CreatedOn = System.DateTime.Now;
            _inventoryDbContext.AccountHeadMaster.Add(accountheadModel);
            _inventoryDbContext.SaveChanges();
            return accountheadModel;

        }

        /*else if (reqType == "AddAccountHead")
        {
            AccountHeadMasterModel accountheadModel = DanpheJSONConvert.DeserializeObject<AccountHeadMasterModel>(str);
                accountheadModel.CreatedOn = System.DateTime.Now;
            inventoryDBContext.AccountHeadMaster.Add(accountheadModel);
            inventoryDBContext.SaveChanges();
            responseData.Results = accountheadModel;
            responseData.Status = "OK";
        }*/
        [HttpPost]
        [Route("Item")]
        public IActionResult PostItem()
        {
            // else if (reqType == "AddItem")
            Func<object> func = () => PostItemDetail();
            return InvokeHttpPostFunction<object>(func);
        }
        private object PostItemDetail()
        {
            string str = this.ReadPostData();
            ItemMasterModel itemModel = DanpheJSONConvert.DeserializeObject<ItemMasterModel>(str);
            //sud:25Sept'21--Assigning ItemCode at server side itself.. 
            itemModel.Code = InventoryBL.GetNewItemCode(_inventoryDbContext, itemModel);//itemmodel needed to find out SubCategory inside the function.
            itemModel.CreatedOn = System.DateTime.Now;
            _inventoryDbContext.Items.Add(itemModel);
            _inventoryDbContext.SaveChanges();
            return itemModel;
        }

        /*else if (reqType == "AddItem")
        {
            ItemMasterModel itemModel = DanpheJSONConvert.DeserializeObject<ItemMasterModel>(str);
            //sud:25Sept'21--Assigning ItemCode at server side itself.. 
            itemModel.Code = InventoryBL.GetNewItemCode(inventoryDBContext, itemModel);//itemmodel needed to find out SubCategory inside the function.
            itemModel.CreatedOn = System.DateTime.Now;
            inventoryDBContext.Items.Add(itemModel);
            inventoryDBContext.SaveChanges();
            responseData.Results = itemModel;
            responseData.Status = "OK";
        }*/
        [HttpPost]
        [Route("Currency")]
        public IActionResult AddCurrency()
        {
            //else if (reqType == "AddCurrency")
            Func<object> func = () => AddCurrencyDetail();
            return InvokeHttpPostFunction<object>(func);
        }
        private object AddCurrencyDetail()
        {
            string str = this.ReadPostData();
            CurrencyMasterModel currencyModel = DanpheJSONConvert.DeserializeObject<CurrencyMasterModel>(str);
            currencyModel.CreatedOn = System.DateTime.Now;
            _inventoryDbContext.CurrencyMaster.Add(currencyModel);
            _inventoryDbContext.SaveChanges();
            return currencyModel;
        }

        /*else if (reqType == "AddCurrency")
        {
            CurrencyMasterModel currencyModel = DanpheJSONConvert.DeserializeObject<CurrencyMasterModel>(str);
            currencyModel.CreatedOn = System.DateTime.Now;
            inventoryDBContext.CurrencyMaster.Add(currencyModel);
            inventoryDBContext.SaveChanges();
            responseData.Results = currencyModel;
            responseData.Status = "OK";
        }*/
        [HttpPost]
        [Route("OtherCharge")]
        public IActionResult PostOtherCharge()
        {
            // else if (reqType == "CreateOtherCharges")
            Func<object> func = () => PostOtherChargeDetail();
            return InvokeHttpPostFunction<object>(func);
        }
        private object PostOtherChargeDetail()
        {
            string str = this.ReadPostData();
            InventoryChargesMasterModel otherChargesModel = DanpheJSONConvert.DeserializeObject<InventoryChargesMasterModel>(str);
            otherChargesModel.CreatedBy = HttpContext.Session.Get<RbacUser>("currentuser").CreatedBy;
            otherChargesModel.CreatedOn = System.DateTime.Now;
            _inventoryDbContext.OtherCharges.Add(otherChargesModel);
            _inventoryDbContext.SaveChanges();
            return otherChargesModel;
        }
        /*else if (reqType == "CreateOtherCharges")
        {
            InventoryChargesMasterModel otherChargesModel = DanpheJSONConvert.DeserializeObject<InventoryChargesMasterModel>(str);
            otherChargesModel.CreatedOn = System.DateTime.Now;
            otherChargesModel.CreatedBy = HttpContext.Session.Get<RbacUser>("currentuser").CreatedBy;
            inventoryDBContext.OtherCharges.Add(otherChargesModel);
            inventoryDBContext.SaveChanges();
            responseData.Results = otherChargesModel;
            responseData.Status = "OK";
        }*/


        [HttpPut]
        [Route("Vendor")]
        public IActionResult UpdateVendor()
        {
            //if (reqType == "UpdateVendors")
            Func<object> func = () => UpdateVendorDetail();
            return InvokeHttpPutFunction<object>(func);
        }
        private object UpdateVendorDetail()
        {
            string str = this.ReadPostData();
            VendorMasterModel vendor = DanpheJSONConvert.DeserializeObject<VendorMasterModel>(str);
            _inventoryDbContext.Vendors.Attach(vendor);
            _inventoryDbContext.Entry(vendor).State = EntityState.Modified;
            _inventoryDbContext.Entry(vendor).Property(x => x.CreatedOn).IsModified = false;
            _inventoryDbContext.Entry(vendor).Property(x => x.CreatedBy).IsModified = false;
            _inventoryDbContext.SaveChanges();
            return vendor;

        }

        /* if (reqType == "UpdateVendors")
         {
             VendorMasterModel vendor = DanpheJSONConvert.DeserializeObject<VendorMasterModel>(str);
             inventoryDBContext.Vendors.Attach(vendor);
             inventoryDBContext.Entry(vendor).State = EntityState.Modified;
             inventoryDBContext.Entry(vendor).Property(x => x.CreatedOn).IsModified = false;
             inventoryDBContext.Entry(vendor).Property(x => x.CreatedBy).IsModified = false;

             inventoryDBContext.SaveChanges();
             responseData.Results = vendor;
             responseData.Status = "OK";
         }*/

        [HttpPut]
        [Route("InventoryTerm")]
        public IActionResult UpdateInventoryTerm()
        {
            //else if (reqType == "UpdateInventoryTerms")
            Func<object> func = () => UpdateInventoryTermDetail();
            return InvokeHttpPutFunction<object>(func);
        }
        private object UpdateInventoryTermDetail()
        {
            string str = this.ReadPostData();
            InventoryTermsModel termsconditions = DanpheJSONConvert.DeserializeObject<InventoryTermsModel>(str);
            _inventoryDbContext.InventoryTerms.Attach(termsconditions);
            _inventoryDbContext.Entry(termsconditions).State = EntityState.Modified;
            _inventoryDbContext.Entry(termsconditions).Property(x => x.CreatedOn).IsModified = false;
            _inventoryDbContext.Entry(termsconditions).Property(x => x.CreatedBy).IsModified = false;
            _inventoryDbContext.Entry(termsconditions).Property(x => x.TermsApplicationEnumId).IsModified = false;
            _inventoryDbContext.SaveChanges();
            return termsconditions;

        }

        /*  else if (reqType == "UpdateInventoryTerms")
          {
              InventoryTermsModel termsconditions = DanpheJSONConvert.DeserializeObject<InventoryTermsModel>(str);
        inventoryDBContext.InventoryTerms.Attach(termsconditions);
              inventoryDBContext.Entry(termsconditions).State = EntityState.Modified;
              inventoryDBContext.Entry(termsconditions).Property(x => x.CreatedOn).IsModified = false;
              inventoryDBContext.Entry(termsconditions).Property(x => x.CreatedBy).IsModified = false;
              inventoryDBContext.Entry(termsconditions).Property(x => x.TermsApplicationEnumId).IsModified = false;

              inventoryDBContext.SaveChanges();
              responseData.Results = termsconditions;
              responseData.Status = "OK";
          }*/
        [HttpPut]
        [Route("ItemCategory")]
        public IActionResult UpdateItemCategory()
        {
            //if (reqType == "UpdateItemCategory")
            Func<object> func = () => UpdateItemCategoryDetail();
            return InvokeHttpPutFunction<object>(func);
        }
        private object UpdateItemCategoryDetail()
        {
            string str = this.ReadPostData();
            ItemCategoryMasterModel itemcategoryModel = DanpheJSONConvert.DeserializeObject<ItemCategoryMasterModel>(str);
            _inventoryDbContext.ItemCategoryMaster.Attach(itemcategoryModel);
            _inventoryDbContext.Entry(itemcategoryModel).State = EntityState.Modified;
            _inventoryDbContext.Entry(itemcategoryModel).Property(x => x.CreatedOn).IsModified = false;
            _inventoryDbContext.Entry(itemcategoryModel).Property(x => x.CreatedBy).IsModified = false;
            _inventoryDbContext.SaveChanges();
            return itemcategoryModel;

        }
        /*
                    if (reqType == "UpdateItemCategory")
                    {
                        ItemCategoryMasterModel itemcategoryModel = DanpheJSONConvert.DeserializeObject<ItemCategoryMasterModel>(str);
                        inventoryDBContext.ItemCategoryMaster.Attach(itemcategoryModel);
                        inventoryDBContext.Entry(itemcategoryModel).State = EntityState.Modified;
                        inventoryDBContext.Entry(itemcategoryModel).Property(x => x.CreatedOn).IsModified = false;
                        inventoryDBContext.Entry(itemcategoryModel).Property(x => x.CreatedBy).IsModified = false;

                        inventoryDBContext.SaveChanges();
                        responseData.Results = itemcategoryModel;
                        responseData.Status = "OK";
                    }*/
        [HttpPut]
        [Route("ItemSubCategory")]
        public IActionResult UpdateItemSubCategory()
        {
            // if (reqType == "UpdateItemSubCategory")
            Func<object> func = () => UpdateItemSubCategoryDetail();
            return InvokeHttpPutFunction<object>(func);
        }
        private object UpdateItemSubCategoryDetail()
        {
            string str = this.ReadPostData();
            ItemSubCategoryMasterModel itemsubcategoryModel = DanpheJSONConvert.DeserializeObject<ItemSubCategoryMasterModel>(str);
            _inventoryDbContext.ItemSubCategoryMaster.Attach(itemsubcategoryModel);
            _inventoryDbContext.Entry(itemsubcategoryModel).State = EntityState.Modified;
            _inventoryDbContext.Entry(itemsubcategoryModel).Property(x => x.CreatedOn).IsModified = false;
            _inventoryDbContext.Entry(itemsubcategoryModel).Property(x => x.CreatedBy).IsModified = false;
            _inventoryDbContext.SaveChanges();

            LedgerMappingModel ledgerMapping = new LedgerMappingModel();
            if (itemsubcategoryModel.LedgerId > 0)
            {
                //NageshBB- 22Jul 2020-if this api called from other module , then we have hospital Id issue 
                //for this resolution we have temp solution
                //we have saved accPrimary id in parameter table so, we will return this hospital records here
                //This is not correct solution , well solution is to show activate hospital popup when user get logged in into system.
                //so, this will help us to make software as multi tenant. if user have 2 or more hospital permission then this popup will come.
                //if user have only one hsopital permission then automatically activate this hospital
                var HospId = AccountingTransferData.GetAccPrimaryHospitalId(_accountingDBContext);

                var ledData = _accountingDBContext.LedgerMappings.Where(l => l.LedgerId == itemsubcategoryModel.LedgerId && l.HospitalId == HospId).FirstOrDefault();
                if (ledData == null)
                {
                    ledgerMapping.LedgerId = (int)itemsubcategoryModel.LedgerId;
                    ledgerMapping.HospitalId = HospId;
                    ledgerMapping.LedgerType = "inventorysubcategory";
                    ledgerMapping.ReferenceId = (int)itemsubcategoryModel.SubCategoryId;
                    _accountingDBContext.LedgerMappings.Add(ledgerMapping);
                    _accountingDBContext.SaveChanges();
                }
                //NageshBB- later we need to move this code into accounting 
                var ledgerData = _accountingDBContext.Ledgers.Where(l => l.LedgerId == itemsubcategoryModel.LedgerId && l.HospitalId == HospId).FirstOrDefault();
                if (ledgerData != null)
                {
                    ledgerData.LedgerReferenceId = itemsubcategoryModel.SubCategoryId;
                    _accountingDBContext.Ledgers.Attach(ledgerData);
                    _accountingDBContext.Entry(ledgerData).State = EntityState.Modified;
                    _accountingDBContext.Entry(ledgerData).Property(x => x.LedgerReferenceId).IsModified = true;
                    _accountingDBContext.SaveChanges();
                }

            }

            return itemsubcategoryModel;
        }

        /*
                    if (reqType == "UpdateItemSubCategory")
                    {
                        AccountingDbContext accountingDBContext = new AccountingDbContext(connString);
                        try
                        {
                            ItemSubCategoryMasterModel itemsubcategoryModel = DanpheJSONConvert.DeserializeObject<ItemSubCategoryMasterModel>(str);
                inventoryDBContext.ItemSubCategoryMaster.Attach(itemsubcategoryModel);
                            inventoryDBContext.Entry(itemsubcategoryModel).State = EntityState.Modified;
                            inventoryDBContext.Entry(itemsubcategoryModel).Property(x => x.CreatedOn).IsModified = false;
                            inventoryDBContext.Entry(itemsubcategoryModel).Property(x => x.CreatedBy).IsModified = false;
                            inventoryDBContext.SaveChanges();

                        LedgerMappingModel ledgerMapping = new LedgerMappingModel();
                        if (itemsubcategoryModel.LedgerId > 0)
                        {
                            //NageshBB- 22Jul 2020-if this api called from other module , then we have hospital Id issue 
                            //for this resolution we have temp solution
                            //we have saved accPrimary id in parameter table so, we will return this hospital records here
                            //This is not correct solution , well solution is to show activate hospital popup when user get logged in into system.
                            //so, this will help us to make software as multi tenant. if user have 2 or more hospital permission then this popup will come.
                            //if user have only one hsopital permission then automatically activate this hospital
                            var HospId = AccountingTransferData.GetAccPrimaryHospitalId(accountingDBContext);

                var ledData = accountingDBContext.LedgerMappings.Where(l => l.LedgerId == itemsubcategoryModel.LedgerId && l.HospitalId == HospId).FirstOrDefault();
                                if (ledData == null)
                                {
                                    ledgerMapping.LedgerId = (int) itemsubcategoryModel.LedgerId;
                ledgerMapping.HospitalId = HospId;
                                    ledgerMapping.LedgerType = "inventorysubcategory";
                                    ledgerMapping.ReferenceId = (int) itemsubcategoryModel.SubCategoryId;
                accountingDBContext.LedgerMappings.Add(ledgerMapping);
                                    accountingDBContext.SaveChanges();
                                }
            //NageshBB- later we need to move this code into accounting 
            var ledgerData = accountingDBContext.Ledgers.Where(l => l.LedgerId == itemsubcategoryModel.LedgerId && l.HospitalId == HospId).FirstOrDefault();
                                if (ledgerData != null)
                                {
                                    ledgerData.LedgerReferenceId = itemsubcategoryModel.SubCategoryId;
                                    accountingDBContext.Ledgers.Attach(ledgerData);
                                    accountingDBContext.Entry(ledgerData).State = EntityState.Modified;
                                    accountingDBContext.Entry(ledgerData).Property(x => x.LedgerReferenceId).IsModified = true;
                                    accountingDBContext.SaveChanges();
                                }

                        }

                            responseData.Results = itemsubcategoryModel;
        responseData.Status = "OK";

                        }
                        catch (Exception ex)
        {
            throw ex;
        }
                    }*/
        [HttpPut]
        [Route("UnitOfMeasurement")]
        public IActionResult UpdateUnitOfMeasurement()
        {
            //if (reqType == "UpdateUnitOfMeasurement")
            Func<object> func = () => UpdateUnitOfMeasurementDetail();
            return InvokeHttpPutFunction<object>(func);
        }
        private object UpdateUnitOfMeasurementDetail()
        {
            string str = this.ReadPostData();
            UnitOfMeasurementMasterModel unitofmeasurementModel = DanpheJSONConvert.DeserializeObject<UnitOfMeasurementMasterModel>(str);
            _inventoryDbContext.UnitOfMeasurementMaster.Attach(unitofmeasurementModel);
            _inventoryDbContext.Entry(unitofmeasurementModel).State = EntityState.Modified;
            _inventoryDbContext.Entry(unitofmeasurementModel).Property(x => x.CreatedOn).IsModified = false;
            _inventoryDbContext.Entry(unitofmeasurementModel).Property(x => x.CreatedBy).IsModified = false;
            _inventoryDbContext.SaveChanges();
            return unitofmeasurementModel;
        }
        /* if (reqType == "UpdateUnitOfMeasurement")
        {
        UnitOfMeasurementMasterModel unitofmeasurementModel = DanpheJSONConvert.DeserializeObject<UnitOfMeasurementMasterModel>(str);
        inventoryDBContext.UnitOfMeasurementMaster.Attach(unitofmeasurementModel);
        inventoryDBContext.Entry(unitofmeasurementModel).State = EntityState.Modified;
        inventoryDBContext.Entry(unitofmeasurementModel).Property(x => x.CreatedOn).IsModified = false;
        inventoryDBContext.Entry(unitofmeasurementModel).Property(x => x.CreatedBy).IsModified = false;

        inventoryDBContext.SaveChanges();
        responseData.Results = unitofmeasurementModel;
        responseData.Status = "OK";
        }*/

        [HttpPut]
        [Route("PackagingType")]
        public IActionResult UpdatePackagingType()
        {
            // if (reqType == "UpdatePackagingType")
            Func<object> func = () => UpdatePackagingTypeDetail();
            return InvokeHttpPutFunction<object>(func);
        }
        private object UpdatePackagingTypeDetail()
        {
            string str = this.ReadPostData();
            PackagingTypeMasterModel packagingtypeModel = DanpheJSONConvert.DeserializeObject<PackagingTypeMasterModel>(str);
            _inventoryDbContext.PackagingTypeMaster.Attach(packagingtypeModel);
            _inventoryDbContext.Entry(packagingtypeModel).State = EntityState.Modified;
            _inventoryDbContext.Entry(packagingtypeModel).Property(x => x.CreatedOn).IsModified = false;
            _inventoryDbContext.Entry(packagingtypeModel).Property(x => x.CreatedBy).IsModified = false;
            _inventoryDbContext.SaveChanges();
            return packagingtypeModel;

        }
        /*     if (reqType == "UpdatePackagingType")
         {
             PackagingTypeMasterModel packagingtypeModel = DanpheJSONConvert.DeserializeObject<PackagingTypeMasterModel>(str);
             inventoryDBContext.PackagingTypeMaster.Attach(packagingtypeModel);
             inventoryDBContext.Entry(packagingtypeModel).State = EntityState.Modified;
             inventoryDBContext.Entry(packagingtypeModel).Property(x => x.CreatedOn).IsModified = false;
             inventoryDBContext.Entry(packagingtypeModel).Property(x => x.CreatedBy).IsModified = false;
             inventoryDBContext.SaveChanges();
             responseData.Results = packagingtypeModel;
             responseData.Status = "OK";
         }*/
        [HttpPut]
        [Route("AccountHead")]
        public IActionResult UpdateAccountHead()
        {
            //if (reqType == "UpdateAccountHead")
            Func<object> func = () => UpdateAccountHeadDetail();
            return InvokeHttpPutFunction<object>(func);
        }
        private object UpdateAccountHeadDetail()
        {
            string str = this.ReadPostData();
            AccountHeadMasterModel accountheadModel = DanpheJSONConvert.DeserializeObject<AccountHeadMasterModel>(str);
            _inventoryDbContext.AccountHeadMaster.Attach(accountheadModel);
            _inventoryDbContext.Entry(accountheadModel).State = EntityState.Modified;
            _inventoryDbContext.Entry(accountheadModel).Property(x => x.CreatedOn).IsModified = false;
            _inventoryDbContext.Entry(accountheadModel).Property(x => x.CreatedBy).IsModified = false;
            _inventoryDbContext.SaveChanges();
            return accountheadModel;
        }

        /*if (reqType == "UpdateAccountHead")
        {
        AccountHeadMasterModel accountheadModel = DanpheJSONConvert.DeserializeObject<AccountHeadMasterModel>(str);
        inventoryDBContext.AccountHeadMaster.Attach(accountheadModel);
        inventoryDBContext.Entry(accountheadModel).State = EntityState.Modified;
        inventoryDBContext.Entry(accountheadModel).Property(x => x.CreatedOn).IsModified = false;
        inventoryDBContext.Entry(accountheadModel).Property(x => x.CreatedBy).IsModified = false;

        inventoryDBContext.SaveChanges();
        responseData.Results = accountheadModel;
        responseData.Status = "OK";
        }*/
        [HttpPut]
        [Route("Item")]
        public IActionResult UpdateItem()
        {
            //if (reqType == "UpdateItem")
            Func<object> func = () => UpdateItemDetail();
            return InvokeHttpPutFunction<object>(func);
        }
        private object UpdateItemDetail()
        {
            string str = this.ReadPostData();
            ItemMasterModel itemModel = DanpheJSONConvert.DeserializeObject<ItemMasterModel>(str);
            itemModel.ModifiedOn = System.DateTime.Now;
            _inventoryDbContext.Items.Attach(itemModel);
            _inventoryDbContext.Entry(itemModel).State = EntityState.Modified;
            _inventoryDbContext.Entry(itemModel).Property(x => x.CreatedOn).IsModified = false;
            _inventoryDbContext.Entry(itemModel).Property(x => x.CreatedBy).IsModified = false;
            _inventoryDbContext.Entry(itemModel).Property(x => x.ModifiedBy).IsModified = true;
            _inventoryDbContext.SaveChanges();
            return itemModel;

        }
        /* if (reqType == "UpdateItem")
         {
             ItemMasterModel itemModel = DanpheJSONConvert.DeserializeObject<ItemMasterModel>(str);
             itemModel.ModifiedOn = System.DateTime.Now;
             inventoryDBContext.Items.Attach(itemModel);
             inventoryDBContext.Entry(itemModel).State = EntityState.Modified;
             inventoryDBContext.Entry(itemModel).Property(x => x.CreatedOn).IsModified = false;
             inventoryDBContext.Entry(itemModel).Property(x => x.CreatedBy).IsModified = false;
             inventoryDBContext.Entry(itemModel).Property(x => x.ModifiedBy).IsModified = true;
             inventoryDBContext.SaveChanges();
             responseData.Results = itemModel;
             responseData.Status = "OK";
         }*/
        [HttpPut]
        [Route("Currency")]
        public IActionResult UpdateCurrency()
        {
            //if (reqType == "UpdateCurrency")
            Func<object> func = () => UpdateCurrencyDetail();
            return InvokeHttpPutFunction<object>(func);
        }
        private object UpdateCurrencyDetail()
        {
            string str = this.ReadPostData();
            CurrencyMasterModel currencyModel = DanpheJSONConvert.DeserializeObject<CurrencyMasterModel>(str);
            _inventoryDbContext.CurrencyMaster.Attach(currencyModel);
            _inventoryDbContext.Entry(currencyModel).State = EntityState.Modified;
            _inventoryDbContext.Entry(currencyModel).Property(x => x.CreatedOn).IsModified = false;
            _inventoryDbContext.Entry(currencyModel).Property(x => x.CreatedBy).IsModified = false;
            _inventoryDbContext.SaveChanges();
            return currencyModel;


        }
        /* if (reqType == "UpdateCurrency")
         {
             CurrencyMasterModel currencyModel = DanpheJSONConvert.DeserializeObject<CurrencyMasterModel>(str);
             inventoryDBContext.CurrencyMaster.Attach(currencyModel);
             inventoryDBContext.Entry(currencyModel).State = EntityState.Modified;
             inventoryDBContext.Entry(currencyModel).Property(x => x.CreatedOn).IsModified = false;
             inventoryDBContext.Entry(currencyModel).Property(x => x.CreatedBy).IsModified = false;

             inventoryDBContext.SaveChanges();
             responseData.Results = currencyModel;
             responseData.Status = "OK";
         }*/
        [HttpPut]
        [Route("OtherCharge")]
        public IActionResult UpdateOtherCharge()
        {
            //if (reqType == "UpdateOtherCharge")
            Func<object> func = () => UpdateOtherChargeDetail();
            return InvokeHttpPutFunction<object>(func);
        }
        private object UpdateOtherChargeDetail()
        {
            string str = this.ReadPostData();
            InventoryChargesMasterModel chargeModel = DanpheJSONConvert.DeserializeObject<InventoryChargesMasterModel>(str);
            _inventoryDbContext.OtherCharges.Attach(chargeModel);
            _inventoryDbContext.Entry(chargeModel).State = EntityState.Modified;
            _inventoryDbContext.Entry(chargeModel).Property(x => x.CreatedOn).IsModified = false;
            _inventoryDbContext.Entry(chargeModel).Property(x => x.CreatedBy).IsModified = false;
            _inventoryDbContext.SaveChanges();
            return chargeModel;

        }
        /*if (reqType == "UpdateOtherCharge")
        {
            InventoryChargesMasterModel chargeModel = DanpheJSONConvert.DeserializeObject<InventoryChargesMasterModel>(str);
            inventoryDBContext.OtherCharges.Attach(chargeModel);
            inventoryDBContext.Entry(chargeModel).State = EntityState.Modified;
            inventoryDBContext.Entry(chargeModel).Property(x => x.CreatedOn).IsModified = false;
            inventoryDBContext.Entry(chargeModel).Property(x => x.CreatedBy).IsModified = false;

            inventoryDBContext.SaveChanges();
            responseData.Status = "OK";
            responseData.Results = chargeModel;

        }*/
    }
}


