using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Linq;
using System.Data.Entity;
using DanpheEMR.Utilities;
using DanpheEMR.ServerModel.PharmacyModels;
using DanpheEMR.ServerModel.NotificationModels;
using Microsoft.AspNetCore.Http;
using System.IO;
using DanpheEMR.ViewModel.Pharmacy;
using System.Collections.Generic;
using DanpheEMR.ServerModel.CommonModels;

namespace DanpheEMR.Controllers.Pharmacy
{

    public class PharmacySettingsController : CommonController
    {
        public static IHostingEnvironment _environment;
        bool realTimeRemoteSyncEnabled = false;
        private readonly PharmacyDbContext _pharmacyDbContext;
        private readonly RbacDbContext _rbacDbContext;
        private readonly MasterDbContext _masterDbContext;
        private readonly NotiFicationDbContext _notificationDbContext;
        public PharmacySettingsController(IHostingEnvironment env, IOptions<MyConfiguration> _config) : base(_config)
        {
            _environment = env;
            _pharmacyDbContext = new PharmacyDbContext(connString);
            _rbacDbContext = new RbacDbContext(connString);
            _masterDbContext = new MasterDbContext(connString);
            _notificationDbContext = new NotiFicationDbContext(connString);
        }

        [HttpGet]
        [Route("ActiveSuppliers")]
        public IActionResult GetActiveSuppliers()
        {
            //if (reqType == "supplier")
            Func<object> func = () => _pharmacyDbContext.PHRMSupplier.AsEnumerable().OrderBy(a => a.SupplierName)
                    .ToList().Where(x => x.IsActive == true);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("Suppliers")]
        public IActionResult GetSuppliers()
        {
            //reqType == "allSupplier"
            Func<object> func = () => _pharmacyDbContext.PHRMSupplier.AsEnumerable().ToList();
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("Counters")]
        public IActionResult GetCounters()
        {
            //else if (reqType == "getCounter")
            Func<object> func = () => (from counter in _pharmacyDbContext.PHRMCounters
                                       select counter
                                      ).ToList<PHRMCounter>().OrderBy(b => b.CounterId);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("CreditOrganizations")]
        public IActionResult GetCreditOrganizations()
        {
            //else if (reqType == "get-credit-organizations")
            Func<object> func = () => _pharmacyDbContext.CreditOrganizations.OrderBy(co => co.OrganizationName).ToList();
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("ItemTypes")]
        public IActionResult GetItemTypes()
        {
            //else if (reqType == "itemtype")
            //else if (reqType == "GetItemType")

            Func<object> func = () => (from itmtype in _pharmacyDbContext.PHRMItemType
                                       join categry in _pharmacyDbContext.PHRMCategory on itmtype.CategoryId equals categry.CategoryId
                                       select new
                                       {
                                           ItemTypeId = itmtype.ItemTypeId,
                                           CategoryId = itmtype.CategoryId,
                                           ItemTypeName = itmtype.ItemTypeName,
                                           CategoryName = categry.CategoryName,
                                           Description = itmtype.Description,
                                           IsActive = itmtype.IsActive
                                       }).ToList().OrderBy(a => a.ItemTypeId);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("PackingTypes")]
        public IActionResult PackagingTypes()
        {
            //else if (reqType == "GetPackingType")
            Func<object> func = () => (from packingtype in _pharmacyDbContext.PHRMPackingType
                                       select new
                                       {
                                           PackingTypeId = packingtype.PackingTypeId,
                                           PackingName = packingtype.PackingName,
                                           PackingQuantity = packingtype.PackingQuantity,
                                           IsActive = packingtype.IsActive
                                       }).ToList().OrderBy(a => a.PackingTypeId);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("ItemsWithAllDetails")]
        public IActionResult GetItemsWithAllDetails()
        {
            //else if (reqType == "items")
            Func<object> func = () => (from I in _pharmacyDbContext.PHRMItemMaster.Include(itm => itm.PHRM_MAP_MstItemsPriceCategories)
                                       join compny in _pharmacyDbContext.PHRMCompany on I.CompanyId equals compny.CompanyId
                                       join itmtype in _pharmacyDbContext.PHRMItemType on I.ItemTypeId equals itmtype.ItemTypeId
                                       join catType in _pharmacyDbContext.PHRMCategory on itmtype.CategoryId equals catType.CategoryId
                                       join unit in _pharmacyDbContext.PHRMUnitOfMeasurement on I.UOMId equals unit.UOMId
                                       join generic in _pharmacyDbContext.PHRMGenericModel on I.GenericId equals generic.GenericId
                                       join salesCat in _pharmacyDbContext.PHRMStoreSalesCategory on I.SalesCategoryId equals salesCat.SalesCategoryId
                                       let GRI = _pharmacyDbContext.PHRMGoodsReceiptItems.Where(GRI => I.ItemId == GRI.ItemId).OrderByDescending(GRI => GRI.GoodReceiptItemId).FirstOrDefault()
                                       select new
                                       {
                                           ItemId = I.ItemId,
                                           ItemName = I.ItemName,
                                           IsNarcotic = I.IsNarcotic,
                                           ItemCode = I.ItemCode,
                                           CompanyId = I.CompanyId,
                                           CompanyName = compny.CompanyName,
                                           ItemTypeId = I.ItemTypeId,
                                           ItemTypeName = itmtype.ItemTypeName,
                                           UOMId = I.UOMId,
                                           UOMName = unit.UOMName,
                                           ReOrderQuantity = I.ReOrderQuantity,
                                           MinStockQuantity = I.MinStockQuantity,
                                           BudgetedQuantity = I.BudgetedQuantity,
                                           PurchaseVATPercentage = I.PurchaseVATPercentage,
                                           SalesVATPercentage = I.SalesVATPercentage,
                                           IsVATApplicable = I.IsVATApplicable,
                                           IsActive = I.IsActive,
                                           PackingTypeId = I.PackingTypeId,
                                           IsInternationalBrand = I.IsInternationalBrand,
                                           GenericId = I.GenericId,
                                           ABCCategory = I.ABCCategory,
                                           Dosage = I.Dosage,
                                           GRItemPrice = (GRI != null) ? GRI.GRItemPrice : 0,
                                           GenericName = generic.GenericName,
                                           CategoryName = catType.CategoryName,
                                           StoreRackId = I.StoreRackId,
                                           IsBatchApplicable = salesCat.IsBatchApplicable,
                                           IsExpiryApplicable = salesCat.IsExpiryApplicable,
                                           SalesCategoryId = salesCat.SalesCategoryId,
                                           VED = I.VED,
                                           CCCharge = I.CCCharge,
                                           IsInsuranceApplicable = I.IsInsuranceApplicable,
                                           GovtInsurancePrice = I.GovtInsurancePrice,
                                           PurchaseRate=I.PurchaseRate,
                                           SalesRate=I.SalesRate,
                                           PurchaseDiscount=I.PurchaseDiscount,
                                           PHRM_MAP_MstItemsPriceCategories = I.PHRM_MAP_MstItemsPriceCategories,
                                           RackNoDetails = (from rackItem in _pharmacyDbContext.PHRMRackItem.Where(ri => ri.ItemId == I.ItemId)
                                                            join rack in _pharmacyDbContext.PHRMRack on rackItem.RackId equals rack.RackId
                                                            select new
                                                            {
                                                                RackNo = rack.RackNo
                                                            }).ToList()
                                       }).ToList().OrderByDescending(a => a.ItemId);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("Taxes")]
        public IActionResult GetTaxes()
        {
            //else if (reqType == "tax")
            Func<object> func = () => _pharmacyDbContext.PHRMTAX.ToList();
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("Items")]
        public IActionResult GetItems()
        {
            //else if (reqType == "GetAllItems")
            //else if (reqType == "getItemList")
            Func<object> func = () => _pharmacyDbContext.PHRMItemMaster.Where(a => a.IsActive).ToList();
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("ItemsByItemTypeId")]
        public IActionResult GetItemsByItemTypeId(int itemTypeId)
        {
            //else if (reqType == "GetItemListByItemTypeId")
            Func<object> func = () => (from ItemList in _pharmacyDbContext.PHRMItemMaster
                                       join itemtype in _pharmacyDbContext.PHRMItemType on ItemList.ItemTypeId equals itemtype.ItemTypeId
                                       where ItemList.IsActive == true && ItemList.ItemTypeId == itemTypeId
                                       select new
                                       {
                                           ItemId = ItemList.ItemId,
                                           ItemName = ItemList.ItemName,
                                           CompanyId = ItemList.CompanyId,
                                           MinStockQuantity = ItemList.MinStockQuantity,
                                           ReOrderQuantity = ItemList.ReOrderQuantity,
                                           UOMId = ItemList.UOMId,
                                           VATPercentage = ItemList.PurchaseVATPercentage,
                                           BudgetedQuantity = ItemList.BudgetedQuantity,
                                           ItemCode = ItemList.ItemCode,
                                           IsVATApplicable = ItemList.IsVATApplicable
                                       }).ToList().OrderBy(a => a.ItemId);
            return InvokeHttpGetFunction<object>(func);
        }


        [HttpGet]
        [Route("Companies")]
        public IActionResult GetCompanies()
        {
            //else if (reqType == "company")
            Func<object> func = () => _pharmacyDbContext.PHRMCompany.ToList();
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("ItemCategories")]
        public IActionResult GetItemCategories()
        {
            //else if (reqType == "category")
            Func<object> func = () => _pharmacyDbContext.PHRMCategory.ToList();
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("UnitOfMeasurements")]
        public IActionResult GetUnitOfMeasurements()
        {
            //else if (reqType == "unitofmeasurement")
            Func<object> func = () => _pharmacyDbContext.PHRMUnitOfMeasurement.ToList();
            return InvokeHttpGetFunction<object>(func);


        }

        [HttpGet]
        [Route("MainStore")]
        public IActionResult GetMainStore()
        {
            //else if (reqType == "getMainStore")
            Func<object> func = () => _pharmacyDbContext.PHRMStore.FirstOrDefault(a => a.Category == ENUM_StoreCategory.Store && a.SubCategory == ENUM_StoreSubCategory.Pharmacy);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("Generics")]
        public IActionResult GetGenerics()
        {
            //else if (reqType == "getGenericList")
            Func<object> func = () => (from generics in _pharmacyDbContext.PHRMGenericModel.Include(g => g.PHRM_MAP_MstItemsPriceCategories)
                                       select generics).ToList();
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("ItemsByDispensaryId")]
        public IActionResult GetItemsByDispensaryId(int dispensaryId)
        {
            //else if (reqType == "getItemList")

            Func<object> func = () => _pharmacyDbContext.PHRMItemMaster.Where(a => a.IsActive)
            .Join(_pharmacyDbContext.StoreStocks.Where(a => a.StoreId == dispensaryId).GroupBy(ss => new { ss.ItemId, ss.StoreId }).Select(x => x.FirstOrDefault()),
            mstitm => mstitm.ItemId,
            storestk => storestk.ItemId,
            (mstitm, storestk) => mstitm).ToList();
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("SalesCategories")]
        public IActionResult GetSalesCategories()
        {
            //else if (reqType == "getsalescategorylist")
            Func<object> func = () => (from scl in _pharmacyDbContext.PHRMStoreSalesCategory
                                       select scl
                                  ).ToList();
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpPost]
        [Route("Supplier")]
        public IActionResult PostSupplier()
        {
            //if (reqType == "supplier")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string ipDataString = this.ReadPostData();
            Func<object> func = () => AddSupplier(ipDataString, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPost]
        [Route("Company")]
        public IActionResult PostCompany()
        {
            //else if (reqType == "company")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string ipDataString = this.ReadPostData();
            Func<object> func = () => AddCompany(ipDataString, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpGet]
        [Route("InvoiceHeader")]
        public IActionResult GetInvoieHeader(string Module)
        {
            Func<object> func = () => GetInvoiceHeader(Module);
            return InvokeHttpPostFunction<object>(func);

        }
        private object GetInvoiceHeader(string Module)
        {

            var ILL = _pharmacyDbContext.InvoiceHeader.Where(a => a.Module == Module).ToList();

            var location = (from dbc in _pharmacyDbContext.CFGParameters
                            where dbc.ParameterGroupName.ToLower() == "common"
                            && dbc.ParameterName == "InvoiceHeaderLogoUploadLocation"
                            select dbc.ParameterValue).FirstOrDefault();

            var path = _environment.WebRootPath + location;

            if (ILL == null)
            {
                throw new Exception("No Header Found !");
            }
            else
            {
                string fullPath;
                foreach (var item in ILL)
                {
                    fullPath = path + item.LogoFileName;

                    FileInfo fl = new FileInfo(fullPath);
                    if (fl.Exists)
                    {
                        item.FileBinaryData = System.IO.File.ReadAllBytes(@fullPath);
                    }

                }
            }
            return ILL;
        }

        [HttpPost]
        [Route("Dispensary")]
        public IActionResult PostDispensary()
        {
            //else if (reqType == "dispensary")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string ipDataString = this.ReadPostData();
            Func<object> func = () => AddDispensary(ipDataString, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPost]
        [Route("SalesCategory")]
        public IActionResult PostSalesCategory()
        {
            //else if (reqType == "postsalescategorydetail")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string ipDataString = this.ReadPostData();
            Func<object> func = () => AddSalesCategory(ipDataString, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPost]
        [Route("PharmacyCategory")]
        public IActionResult PostPharmacyCategory()
        {
            //else if (reqType == "category")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string ipDataString = this.ReadPostData();
            Func<object> func = () => AddPharmacyCategory(ipDataString, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPost]
        [Route("Item")]
        public IActionResult PostItem()
        {
            //else if (reqType == "item")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string ipDataString = this.ReadPostData();
            Func<object> func = () => AddItem(ipDataString, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPost]
        [Route("Tax")]
        public IActionResult PostTax()
        {
            //else if (reqType == "tax")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string ipDataString = this.ReadPostData();
            Func<object> func = () => AddTax(ipDataString, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPost]
        [Route("Generic")]
        public IActionResult PostGeneric()
        {
            //else if (reqType == "genericName")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string ipDataString = this.ReadPostData();
            Func<object> func = () => AddGeneric(ipDataString, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }



        [HttpPost]
        [Route("UnitOfMeasurement")]
        public IActionResult PostUnitOfMeasurement()
        {
            //else if (reqType == "unitofmeasurement")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string ipDataString = this.ReadPostData();
            Func<object> func = () => AddUnitOfMeasurement(ipDataString, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPost]
        [Route("ItemType")]
        public IActionResult PostItemType()
        {
            //else if (reqType == "itemtype")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string ipDataString = this.ReadPostData();
            Func<object> func = () => AddItemType(ipDataString, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPost]
        [Route("PackingType")]
        public IActionResult PostPackingType()
        {
            //else if (reqType == "packingtype")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string ipDataString = this.ReadPostData();
            Func<object> func = () => AddPackingType(ipDataString, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPost]
        [Route("CreditOrganization")]
        public IActionResult PostCreditOrganization()
        {
            //else if (reqType == "post-credit-organizations")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string ipDataString = this.ReadPostData();
            Func<object> func = () => AddCreditOrganization(ipDataString, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }

        private object AddSupplier(string ipDataString, RbacUser currentUser)
        {
            using (var dbTxn = _pharmacyDbContext.Database.BeginTransaction())
            {
                try
                {
                    PHRMSupplierModel supplierData = DanpheJSONConvert.DeserializeObject<PHRMSupplierModel>(ipDataString);
                    if (_pharmacyDbContext.PHRMSupplier.Any(x => x.SupplierName == supplierData.SupplierName && x.PANNumber == supplierData.PANNumber))
                    {
                        throw new InvalidOperationException($"Failed. Supplier: {supplierData.SupplierName} with PAN No: {supplierData.PANNumber} is already registered. ");
                    }
                    else
                    {
                        supplierData.CreatedOn = System.DateTime.Now;
                        _pharmacyDbContext.PHRMSupplier.Add(supplierData);
                        _pharmacyDbContext.SaveChanges();

                        if (supplierData.IsLedgerRequired == true)
                        {
                            //Add Supplier Ledger;
                            var newSupplierLedger = new PHRMSupplierLedgerModel()
                            {
                                SupplierId = supplierData.SupplierId,
                                CreditAmount = 0,
                                DebitAmount = 0,
                                BalanceAmount = 0,
                                IsActive = true,
                                CreatedBy = currentUser.EmployeeId,
                                CreatedOn = DateTime.Now
                            };
                            _pharmacyDbContext.SupplierLedger.Add(newSupplierLedger);
                            _pharmacyDbContext.SaveChanges();
                        }
                        dbTxn.Commit();
                        return supplierData;
                    }
                }
                catch (Exception ex)
                {

                    dbTxn.Rollback();
                    throw new InvalidOperationException("Supplier details failed to Save. Exception Detail: " + ex.Message.ToString());
                }
            }
        }

        [HttpPost]
        [Route("UpdateReconciledStockFromExcelFile")]
        public IActionResult UpdateReconciledStockFromExcelFile()
        {
            string Str = this.ReadPostData();
            List<PharmacyStockModel> stock = DanpheJSONConvert.DeserializeObject<List<PharmacyStockModel>>(Str);
            var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => PharmacyBL.UpdateReconciledStockFromExcel(stock, currentUser, _pharmacyDbContext);
            return InvokeHttpPostFunction<object>(func);
        }
        private object AddCompany(string ipDataString, RbacUser currentUser)
        {
            PHRMCompanyModel companyData = DanpheJSONConvert.DeserializeObject<PHRMCompanyModel>(ipDataString);
            companyData.CreatedOn = System.DateTime.Now;
            _pharmacyDbContext.PHRMCompany.Add(companyData);
            _pharmacyDbContext.SaveChanges();
            return companyData;
        }
        private object AddDispensary(string ipDataString, RbacUser currentUser)
        {
            PHRMStoreModel dispensaryData = DanpheJSONConvert.DeserializeObject<PHRMStoreModel>(ipDataString);
            dispensaryData.CreatedOn = System.DateTime.Now;
            dispensaryData.CreatedBy = currentUser.EmployeeId;
            _pharmacyDbContext.PHRMStore.Add(dispensaryData);
            _pharmacyDbContext.SaveChanges();
            return dispensaryData;
        }
        private object AddSalesCategory(string ipDataString, RbacUser currentUser)
        {
            PHRMStoreSalesCategoryModel salescategoryData = DanpheJSONConvert.DeserializeObject<PHRMStoreSalesCategoryModel>(ipDataString);
            salescategoryData.CreatedOn = System.DateTime.Now;
            salescategoryData.CreatedBy = currentUser.EmployeeId;
            _pharmacyDbContext.PHRMStoreSalesCategory.Add(salescategoryData);
            _pharmacyDbContext.SaveChanges();
            return salescategoryData;
        }
        private object AddPharmacyCategory(string ipDataString, RbacUser currentUser)
        {
            PHRMCategoryModel categoryData = DanpheJSONConvert.DeserializeObject<PHRMCategoryModel>(ipDataString);
            categoryData.CreatedOn = System.DateTime.Now;
            _pharmacyDbContext.PHRMCategory.Add(categoryData);
            _pharmacyDbContext.SaveChanges();
            return categoryData;
        }
        private object AddItem(string ipDataString, RbacUser currentUser)
        {
            PHRMItemMasterModel itemData = DanpheJSONConvert.DeserializeObject<PHRMItemMasterModel>(ipDataString);
            itemData.CreatedOn = System.DateTime.Now;
            itemData.PHRM_MAP_MstItemsPriceCategories.ForEach(itm =>
            {
                itm.CreatedOn = System.DateTime.Now;
                itm.CreatedBy = currentUser.EmployeeId;
                itm.GenericId = itemData.GenericId;
            });
            _pharmacyDbContext.PHRMItemMaster.Add(itemData);
            _pharmacyDbContext.SaveChanges();

            NotificationViewModel notification = new NotificationViewModel();
            notification.Notification_ModuleName = "Pharmacy_Module";
            notification.Notification_Title = "New Medicine";
            notification.Notification_Details = currentUser.UserName + " has added new item " + itemData.ItemName;
            notification.RecipientId = _rbacDbContext.Roles.Where(a => a.RoleName == "Pharmacy").Select(a => a.RoleId).FirstOrDefault();
            notification.RecipientType = "rbac-role";
            notification.ParentTableName = "PHRM_MST_Item";
            notification.NotificationParentId = 0;
            notification.IsArchived = false;
            notification.IsRead = false;
            notification.ReadBy = 0;
            notification.CreatedOn = DateTime.Now;
            notification.Sub_ModuleName = "Store Stock";
            _notificationDbContext.Notifications.Add(notification);
            _notificationDbContext.SaveChanges();
            return itemData;
        }
        private object AddTax(string ipDataString, RbacUser currentUser)
        {
            PHRMTAXModel taxData = DanpheJSONConvert.DeserializeObject<PHRMTAXModel>(ipDataString);
            taxData.CreatedOn = System.DateTime.Now;
            _pharmacyDbContext.PHRMTAX.Add(taxData);
            _pharmacyDbContext.SaveChanges();
            return taxData;
        }
        private object AddGeneric(string ipDataString, RbacUser currentUser)
        {
            PHRMGenericModel genericData = DanpheJSONConvert.DeserializeObject<PHRMGenericModel>(ipDataString);
            genericData.CreatedOn = System.DateTime.Now;
            int genId = _pharmacyDbContext.PHRMGenericModel.OrderByDescending(a => a.GenericId).First().GenericId;
            genericData.GenericId = genId + 1;
            genericData.CreatedBy = currentUser.EmployeeId;
            _pharmacyDbContext.PHRMGenericModel.Add(genericData);
            _pharmacyDbContext.SaveChanges();
            return genericData;
        }
        private object AddUnitOfMeasurement(string ipDataString, RbacUser currentUser)
        {
            PHRMUnitOfMeasurementModel uomData = DanpheJSONConvert.DeserializeObject<PHRMUnitOfMeasurementModel>(ipDataString);
            uomData.CreatedOn = System.DateTime.Now;
            _pharmacyDbContext.PHRMUnitOfMeasurement.Add(uomData);
            _pharmacyDbContext.SaveChanges();
            return uomData;
        }
        private object AddItemType(string ipDataString, RbacUser currentUser)
        {
            PHRMItemTypeModel itemtypeData = DanpheJSONConvert.DeserializeObject<PHRMItemTypeModel>(ipDataString);
            itemtypeData.CreatedOn = System.DateTime.Now;
            _pharmacyDbContext.PHRMItemType.Add(itemtypeData);
            _pharmacyDbContext.SaveChanges();
            return itemtypeData;
        }
        private object AddPackingType(string ipDataString, RbacUser currentUser)
        {
            PHRMPackingTypeModel packingtypeData = DanpheJSONConvert.DeserializeObject<PHRMPackingTypeModel>(ipDataString);
            packingtypeData.CreatedOn = System.DateTime.Now;
            _pharmacyDbContext.PHRMPackingType.Add(packingtypeData);
            _pharmacyDbContext.SaveChanges();
            return packingtypeData;
        }
        private object AddCreditOrganization(string ipDataString, RbacUser currentUser)
        {
            PHRMCreditOrganizationsModel org = DanpheJSONConvert.DeserializeObject<PHRMCreditOrganizationsModel>(ipDataString);
            org.CreatedOn = DateTime.Now;
            org.CreatedBy = currentUser.EmployeeId;
            _pharmacyDbContext.CreditOrganizations.Add(org);
            _pharmacyDbContext.SaveChanges();
            return org;
        }


        [HttpPut]
        [Route("Supplier")]
        public IActionResult PutSupplier()
        {
            //else if (reqType == "supplier")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string ipDataString = this.ReadPostData();
            Func<object> func = () => UpdateSupplier(ipDataString, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPut]
        [Route("Company")]
        public IActionResult PutCompany()
        {
            //else if (reqType == "company")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string ipDataString = this.ReadPostData();
            Func<object> func = () => UpdateCompany(ipDataString);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPut]
        [Route("Dispensary")]
        public IActionResult PutDispensary()
        {
            //else if (reqType == "dispensary")
            string ipDataString = this.ReadPostData();
            Func<object> func = () => UpdateDispensary(ipDataString);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPut]
        [Route("Category")]
        public IActionResult PutCategory()
        {
            //else if (reqType == "category")
            string ipDataString = this.ReadPostData();
            Func<object> func = () => UpdateCategory(ipDataString);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPut]
        [Route("UnitOfMeasurement")]
        public IActionResult PutUnitOfMeasurement()
        {
            //else if (reqType == "unitofmeasurement")
            string ipDataString = this.ReadPostData();
            Func<object> func = () => UpdateUnitOfMeasurement(ipDataString);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPut]
        [Route("ItemType")]
        public IActionResult PutItemType()
        {
            //else if (reqType == "itemtype")
            string ipDataString = this.ReadPostData();
            Func<object> func = () => UpdateItemType(ipDataString);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPut]
        [Route("PakingType")]
        public IActionResult PutPakingType()
        {
            //else if (reqType == "packingtype")
            string ipDataString = this.ReadPostData();
            Func<object> func = () => UpdatePakingType(ipDataString);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPut]
        [Route("Item")]
        public IActionResult PutItem()
        {
            //else if (reqType == "item")
            string ipDataString = this.ReadPostData();
            Func<object> func = () => UpdateItem(ipDataString);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPut]
        [Route("Tax")]
        public IActionResult PutTax()
        {
            //else if (reqType == "tax")
            string ipDataString = this.ReadPostData();
            Func<object> func = () => UpdateTax(ipDataString);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPut]
        [Route("Generic")]
        public IActionResult PutGeneric()
        {
            //else if (reqType == "genericName")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string ipDataString = this.ReadPostData();
            Func<object> func = () => UpdateGeneric(ipDataString, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPut]
        [Route("ItemToRack")]
        public IActionResult PutItemToRack(int itemId, int? dispensaryRackId, int? storeRackId)
        {
            //else if (reqType == "add-Item-to-rack")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => UpdateItemToRack(itemId, dispensaryRackId, storeRackId);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPut]
        [Route("CreditOrganization")]
        public IActionResult PutCreditOrganization()
        {
            //else if (reqType == "put-credit-organizations")
            string ipDataString = this.ReadPostData();
            Func<object> func = () => UpdateCreditOrganization(ipDataString);
            return InvokeHttpPostFunction<object>(func);
        }
        [HttpPut]
        [Route("InvoiceHeader")]
        public IActionResult UpdateInvoiceHeader()
        {
            Func<object> func = () => UpdateInvoiceHeaderDetail();
            return InvokeHttpPutFunction<object>(func);
        }
        private object UpdateInvoiceHeaderDetail()
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            // Read Files From Clent Side 
            var f = this.ReadFiles();
            // Read File details from form model
            var FD = Request.Form["fileDetails"];
            InvoiceHeaderModel selectedInvoiceHeader = DanpheJSONConvert.DeserializeObject<InvoiceHeaderModel>(FD);
            selectedInvoiceHeader.ModifiedBy = currentUser.EmployeeId;
            selectedInvoiceHeader.ModifiedOn = DateTime.Now;
            _pharmacyDbContext.InvoiceHeader.Attach(selectedInvoiceHeader);
            _pharmacyDbContext.Entry(selectedInvoiceHeader).State = EntityState.Modified;
            _pharmacyDbContext.Entry(selectedInvoiceHeader).Property(x => x.CreatedOn).IsModified = false;
            _pharmacyDbContext.Entry(selectedInvoiceHeader).Property(x => x.CreatedBy).IsModified = false;
            _pharmacyDbContext.SaveChanges();
            if (f.Count > 0)
            {
                var file = f[0];
                var location = (from dbc in _pharmacyDbContext.CFGParameters
                                where dbc.ParameterGroupName.ToLower() == "common"
                                && dbc.ParameterName == "InvoiceHeaderLogoUploadLocation"
                                select dbc.ParameterValue).FirstOrDefault();

                var path = _environment.WebRootPath + location;
                if (!Directory.Exists(path))
                {
                    Directory.CreateDirectory(path);
                }
                var fullPath = path + selectedInvoiceHeader.LogoFileName;


                // Converting Files to Byte there for we require MemoryStream object
                using (var ms = new MemoryStream())
                {
                    file.CopyTo(ms); // Copy Each file to MemoryStream

                    byte[] imageBytes = ms.ToArray(); // Convert File to Byte[]

                    FileInfo fi = new FileInfo(fullPath);
                    fi.Directory.Create(); // If the directory already exists, this method does nothing.
                    System.IO.File.WriteAllBytes(fi.FullName, imageBytes);
                    ms.Dispose();
                }
            }

            return selectedInvoiceHeader;
        }


        [HttpPut]
        [Route("CCCharge")]
        public IActionResult PutCCCharge()
        {
            //else if (reqType == "cccharge")
            string ipDataString = this.ReadPostData();
            Func<object> func = () => UpdateCCCharge(ipDataString);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPut]
        [Route("NMCNo")]
        public IActionResult UpdateNMCNo(int EmployeeId, [FromBody] string MedCertificateNo)
        {
            Func<object> func = () => UpdateNMCNoDetail(EmployeeId, MedCertificateNo);
            return InvokeHttpPostFunction<object>(func);
        }
        private object UpdateNMCNoDetail(int EmployeeId, string MedCertificateNo)
        {
            var currentUser = HttpContext.Session.Get<RbacUser>("currentuser"); var employeeDetails = _pharmacyDbContext.Employees.Where(e => e.EmployeeId == EmployeeId).FirstOrDefault();
            employeeDetails.MedCertificationNo = MedCertificateNo;
            employeeDetails.ModifiedBy = currentUser.EmployeeId;
            employeeDetails.ModifiedOn = DateTime.Now;
            _pharmacyDbContext.Entry(employeeDetails).Property(x => x.MedCertificationNo).IsModified = true;
            _pharmacyDbContext.Entry(employeeDetails).Property(x => x.ModifiedBy).IsModified = true;
            _pharmacyDbContext.Entry(employeeDetails).Property(x => x.ModifiedOn).IsModified = true;
            _pharmacyDbContext.SaveChanges();
            return employeeDetails;
        }
        [HttpPost]
        [Route("InvoiceHeader")]
        public IActionResult PostInvoicesHeader()
        {
            Func<object> func = () => PostInvoiceHeader();
            return InvokeHttpPostFunction<object>(func);
        }

        private object PostInvoiceHeader()
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            // Read Files From Clent Side 
            var f = this.ReadFiles();
            var file = f[0];

            // Read File details from form model
            var FD = Request.Form["fileDetails"];
            InvoiceHeaderModel fileDetails = DanpheJSONConvert.DeserializeObject<InvoiceHeaderModel>(FD);

            using (var dbContextTransaction = _pharmacyDbContext.Database.BeginTransaction())
            {
                try
                {

                    fileDetails.CreatedBy = currentUser.EmployeeId;
                    fileDetails.CreatedOn = DateTime.Now;

                    _pharmacyDbContext.InvoiceHeader.Add(fileDetails);
                    _pharmacyDbContext.SaveChanges();

                    var location = (from dbc in _pharmacyDbContext.CFGParameters
                                    where dbc.ParameterGroupName.ToLower() == "common"
                                    && dbc.ParameterName == "InvoiceHeaderLogoUploadLocation"
                                    select dbc.ParameterValue).FirstOrDefault();

                    var path = _environment.WebRootPath + location;

                    if (!Directory.Exists(path))
                    {
                        Directory.CreateDirectory(path);
                    }
                    var fullPath = path + fileDetails.LogoFileName;


                    // Converting Files to Byte there for we require MemoryStream object
                    using (var ms = new MemoryStream())
                    {
                        // Copy Each file to MemoryStream
                        file.CopyTo(ms);

                        // Convert File to Byte[]
                        byte[] imageBytes = ms.ToArray();

                        FileInfo fi = new FileInfo(fullPath);
                        fi.Directory.Create(); // If the directory already exists, this method does nothing.
                        System.IO.File.WriteAllBytes(fi.FullName, imageBytes);
                        ms.Dispose();
                    }

                    // After File Added Commit the Transaction
                    dbContextTransaction.Commit();

                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
            return null;
        }
        [HttpPost]
        [Route("PriceCategory")]
        public IActionResult AddPriceCategory([FromBody] PHRM_MAP_MstItemsPriceCategory category)
        {
            Func<object> func = () => AddPriceCategoryDetail(category);
            return InvokeHttpPostFunction<object>(func);
        }
        private object AddPriceCategoryDetail(PHRM_MAP_MstItemsPriceCategory category)
        {
            var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            var isExists = _pharmacyDbContext.PHRM_MAP_MstItemsPriceCategories.Any(p => p.ItemId == category.ItemId && p.PriceCategoryId == category.PriceCategoryId);
            if (!isExists)
            {
                category.CreatedOn = DateTime.Now;
                category.CreatedBy = currentUser.EmployeeId;
                _pharmacyDbContext.PHRM_MAP_MstItemsPriceCategories.Add(category);
                _pharmacyDbContext.SaveChanges();
                return category;
            }
            else
            {
                throw new Exception("Price Category for this Item already exists");
            }
        }


        [HttpPut]
        [Route("PriceCategory")]
        public IActionResult UpdatePriceCategory([FromBody] PHRM_MAP_MstItemsPriceCategory category)
        {
            Func<object> func = () => UpdatePriceCategoryDetail(category);
            return InvokeHttpPutFunction<object>(func);
        }
        private object UpdatePriceCategoryDetail(PHRM_MAP_MstItemsPriceCategory category)
        {
            var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            var priceCategory = _pharmacyDbContext.PHRM_MAP_MstItemsPriceCategories.Where(p => p.PriceCategoryMapId == category.PriceCategoryMapId).SingleOrDefault();
            if (priceCategory != null)
            {
                priceCategory.IsActive = category.IsActive;
                priceCategory.DiscountApplicable = category.DiscountApplicable;
                priceCategory.Price = category.Price;
                priceCategory.Discount = category.Discount;
                priceCategory.ItemLegalCode = category.ItemLegalCode;
                priceCategory.ItemLegalName = category.ItemLegalName;
                priceCategory.ModifiedOn = DateTime.Now;
                priceCategory.ModifiedBy = currentUser.EmployeeId;
                priceCategory.GenericId = category.GenericId;
                _pharmacyDbContext.SaveChanges();
                return priceCategory;
            }
            return new Exception("No Data Found for Update");
        }
        [HttpGet]
        [Route("PharmacyStores")]
        public IActionResult GetAllPharmacyStore()
        {
            Func<object> func = () => GetAllPharmacyStores();
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetAllPharmacyStores()
        {
            var stores = _pharmacyDbContext.PHRMStore.Where(s => (s.Category == ENUM_StoreCategory.Store && s.SubCategory.ToLower() == ENUM_StoreCategory.Pharmacy.ToLower()) || s.Category == ENUM_StoreCategory.Dispensary && s.IsActive == true).Select(s => new
            {
                StoreId = s.StoreId,
                StoreName = s.Name
            }).ToList();
            return stores;
        }
        [HttpGet]
        [Route("RackNoByItemIdAndStoreId")]
        public IActionResult GetRackNo(int ItemId, int? StoreId)
        {
            Func<object> func = () => GetRackNoByItemId(ItemId, StoreId);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("FiscalYearList")]
        public IActionResult GetFiscalYearList()
        {
            Func<object> func = () => _pharmacyDbContext.PharmacyFiscalYears.Where(fy => fy.IsActive == true).ToList();
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetRackNoByItemId(int ItemId, int? StoreId)
        {
            int? NewStoreId = StoreId != null ? StoreId : _pharmacyDbContext.PHRMStore.Where(s => s.SubCategory == ENUM_StoreCategory.Pharmacy).Select(s => s.StoreId).FirstOrDefault(); //For Pharmacy MainStoreId
            var RackNo = (from rackItem in _pharmacyDbContext.PHRMRackItem.Where(ri => ri.ItemId == ItemId && ri.StoreId == NewStoreId)
                          join rack in _pharmacyDbContext.PHRMRack on rackItem.RackId equals rack.RackId
                          select rack.RackNo).FirstOrDefault();
            return RackNo;
        }
        private object UpdateSupplier(string ipDataString, RbacUser currentUser)
        {
            PHRMSupplierModel supplierData = DanpheJSONConvert.DeserializeObject<PHRMSupplierModel>(ipDataString);

            var supplier = _pharmacyDbContext.PHRMSupplier.Find(supplierData.SupplierId);
            if (supplier.IsLedgerRequired == false && supplierData.IsLedgerRequired == true)
            {
                var ledgerEntity = _pharmacyDbContext.SupplierLedger.Where(s => s.SupplierId == supplier.SupplierId).FirstOrDefault();

                //if ledger is already created for that supplier, just activates it : else, add a new Ledger ;
                if (ledgerEntity != null && ledgerEntity.SupplierId == supplier.SupplierId)
                {
                    ledgerEntity.IsActive = true;
                }
                else
                {
                    //Add Supplier Ledger;
                    var newSupplierLedger = new PHRMSupplierLedgerModel()
                    {
                        SupplierId = supplierData.SupplierId,
                        CreditAmount = 0,
                        DebitAmount = 0,
                        BalanceAmount = 0,
                        IsActive = true,
                        CreatedBy = currentUser.EmployeeId,
                        CreatedOn = DateTime.Now
                    };
                    _pharmacyDbContext.SupplierLedger.Add(newSupplierLedger);

                }
            }
            //if ledger already created and furthur does not wants it then deactivate the ledger.
            else if (supplier.IsLedgerRequired == true && supplierData.IsLedgerRequired == false)
            {
                var supplierLedger = _pharmacyDbContext.SupplierLedger.Where(s => s.SupplierId == supplierData.SupplierId).FirstOrDefault();
                supplierLedger.IsActive = false;
                _pharmacyDbContext.SaveChanges();
            }
            //update the Master Supplier table Data;
            supplier.SupplierId = supplierData.SupplierId;
            supplier.SupplierName = supplierData.SupplierName;
            supplier.ContactNo = supplierData.ContactNo;
            supplier.ContactAddress = supplierData.ContactAddress;
            supplier.AdditionalContactInformation = supplierData.AdditionalContactInformation;
            supplier.Description = supplierData.Description;
            supplier.City = supplierData.City;
            supplier.PANNumber = supplierData.PANNumber;
            supplier.DDA = supplierData.DDA;
            supplier.Email = supplierData.Email;
            supplier.IsActive = supplierData.IsActive;
            supplier.CreditPeriod = supplierData.CreditPeriod;
            supplier.IsLedgerRequired = supplierData.IsLedgerRequired;
            supplier.CreatedBy = supplierData.CreatedBy;
            supplier.CreatedOn = supplierData.CreatedOn;
            _pharmacyDbContext.SaveChanges();
            return supplierData;
        }
        private object UpdateCompany(string ipDataString)
        {
            PHRMCompanyModel companyData = DanpheJSONConvert.DeserializeObject<PHRMCompanyModel>(ipDataString);
            _pharmacyDbContext.PHRMCompany.Attach(companyData);
            _pharmacyDbContext.Entry(companyData).State = EntityState.Modified;
            _pharmacyDbContext.Entry(companyData).Property(x => x.CreatedOn).IsModified = false;
            _pharmacyDbContext.Entry(companyData).Property(x => x.CreatedBy).IsModified = false;
            _pharmacyDbContext.SaveChanges();
            return companyData;
        }
        private object UpdateDispensary(string ipDataString)
        {
            PHRMStoreModel dispensaryData = DanpheJSONConvert.DeserializeObject<PHRMStoreModel>(ipDataString);
            _pharmacyDbContext.PHRMStore.Attach(dispensaryData);
            _pharmacyDbContext.Entry(dispensaryData).State = EntityState.Modified;
            _pharmacyDbContext.Entry(dispensaryData).Property(x => x.CreatedOn).IsModified = false;
            _pharmacyDbContext.Entry(dispensaryData).Property(x => x.CreatedBy).IsModified = false;
            _pharmacyDbContext.SaveChanges();
            return dispensaryData;
        }
        private object UpdateCategory(string ipDataString)
        {
            PHRMCategoryModel categoryData = DanpheJSONConvert.DeserializeObject<PHRMCategoryModel>(ipDataString);
            _pharmacyDbContext.PHRMCategory.Attach(categoryData);
            _pharmacyDbContext.Entry(categoryData).State = EntityState.Modified;
            _pharmacyDbContext.Entry(categoryData).Property(x => x.CreatedOn).IsModified = false;
            _pharmacyDbContext.Entry(categoryData).Property(x => x.CreatedBy).IsModified = false;
            _pharmacyDbContext.SaveChanges();
            return categoryData;
        }
        private object UpdateUnitOfMeasurement(string ipDataString)
        {
            PHRMUnitOfMeasurementModel uomData = DanpheJSONConvert.DeserializeObject<PHRMUnitOfMeasurementModel>(ipDataString);
            _pharmacyDbContext.PHRMUnitOfMeasurement.Attach(uomData);
            _pharmacyDbContext.Entry(uomData).State = EntityState.Modified;
            _pharmacyDbContext.Entry(uomData).Property(x => x.CreatedOn).IsModified = false;
            _pharmacyDbContext.Entry(uomData).Property(x => x.CreatedBy).IsModified = false;
            _pharmacyDbContext.SaveChanges();
            return uomData;
        }
        private object UpdateItemType(string ipDataString)
        {
            PHRMItemTypeModel itemtypeData = DanpheJSONConvert.DeserializeObject<PHRMItemTypeModel>(ipDataString);
            _pharmacyDbContext.PHRMItemType.Attach(itemtypeData);
            _pharmacyDbContext.Entry(itemtypeData).State = EntityState.Modified;
            _pharmacyDbContext.Entry(itemtypeData).Property(x => x.CreatedOn).IsModified = false;
            _pharmacyDbContext.Entry(itemtypeData).Property(x => x.CreatedBy).IsModified = false;
            _pharmacyDbContext.SaveChanges();
            return itemtypeData;
        }
        private object UpdatePakingType(string ipDataString)
        {
            PHRMPackingTypeModel packingtypeData = DanpheJSONConvert.DeserializeObject<PHRMPackingTypeModel>(ipDataString);
            _pharmacyDbContext.PHRMPackingType.Attach(packingtypeData);
            _pharmacyDbContext.Entry(packingtypeData).State = EntityState.Modified;
            _pharmacyDbContext.Entry(packingtypeData).Property(x => x.CreatedOn).IsModified = false;
            _pharmacyDbContext.Entry(packingtypeData).Property(x => x.CreatedBy).IsModified = false;
            _pharmacyDbContext.SaveChanges();
            return packingtypeData;
        }
        private object UpdateItem(string ipDataString)
        {
            PHRMItemMasterModel itemData = DanpheJSONConvert.DeserializeObject<PHRMItemMasterModel>(ipDataString);
            _pharmacyDbContext.PHRMItemMaster.Attach(itemData);
            _pharmacyDbContext.Entry(itemData).State = EntityState.Modified;
            _pharmacyDbContext.Entry(itemData).Property(x => x.CreatedOn).IsModified = false;
            _pharmacyDbContext.Entry(itemData).Property(x => x.CreatedBy).IsModified = false;
            _pharmacyDbContext.SaveChanges();
            var priceCategoryDetails = _pharmacyDbContext.PHRM_MAP_MstItemsPriceCategories.Where(p => p.ItemId == itemData.ItemId).ToList();
            itemData.PHRM_MAP_MstItemsPriceCategories = priceCategoryDetails;
            return itemData;
        }
        private object UpdateTax(string ipDataString)
        {
            PHRMTAXModel taxData = DanpheJSONConvert.DeserializeObject<PHRMTAXModel>(ipDataString);
            _pharmacyDbContext.PHRMTAX.Attach(taxData);
            _pharmacyDbContext.Entry(taxData).State = EntityState.Modified;
            _pharmacyDbContext.Entry(taxData).Property(x => x.CreatedOn).IsModified = false;
            _pharmacyDbContext.Entry(taxData).Property(x => x.CreatedBy).IsModified = false;
            _pharmacyDbContext.SaveChanges();
            return taxData;
        }
        private object UpdateGeneric(string ipDataString, RbacUser currentUser)
        {
            PHRMGenericModel genericData = DanpheJSONConvert.DeserializeObject<PHRMGenericModel>(ipDataString);
            _pharmacyDbContext.PHRMGenericModel.Attach(genericData);
            _pharmacyDbContext.Entry(genericData).State = EntityState.Modified;
            _pharmacyDbContext.Entry(genericData).Property(x => x.CreatedOn).IsModified = false;
            _pharmacyDbContext.Entry(genericData).Property(x => x.CreatedBy).IsModified = false;
            genericData.ModifiedOn = System.DateTime.Now;
            genericData.ModifiedBy = currentUser.EmployeeId;
            _pharmacyDbContext.SaveChanges();
            return genericData;
        }
        private object UpdateItemToRack(int itemId, int? dispensaryRackId, int? storeRackId)
        {
            PHRMItemMasterModel dbphrmItem = _pharmacyDbContext.PHRMItemMaster
                           .Where(a => a.ItemId == itemId).FirstOrDefault<PHRMItemMasterModel>();
            if (dbphrmItem != null)
            {
                dbphrmItem.Rack = dispensaryRackId;
                dbphrmItem.StoreRackId = storeRackId;
                _pharmacyDbContext.Entry(dbphrmItem).State = EntityState.Modified;
            }

            _pharmacyDbContext.SaveChanges();
            return "Print count updated successfully.";
        }
        private object UpdateCreditOrganization(string ipDataString)
        {
            PHRMCreditOrganizationsModel creditOrganization = DanpheJSONConvert.DeserializeObject<PHRMCreditOrganizationsModel>(ipDataString);
            _pharmacyDbContext.CreditOrganizations.Attach(creditOrganization);
            _pharmacyDbContext.Entry(creditOrganization).State = EntityState.Modified;
            _pharmacyDbContext.Entry(creditOrganization).Property(x => x.CreatedOn).IsModified = false;
            _pharmacyDbContext.Entry(creditOrganization).Property(x => x.CreatedBy).IsModified = false;
            _pharmacyDbContext.SaveChanges();
            return creditOrganization;
        }
        private object UpdateCCCharge(string ipDataString)
        {
            CfgParameterModel parameter = DanpheJSONConvert.DeserializeObject<CfgParameterModel>(ipDataString);


            //  phrmdbcontext.SaveChanges();
            var parmToUpdate = (from paramData in _masterDbContext.CFGParameters
                                where
                                paramData.ParameterName == "PharmacyCCCharge"
                                && paramData.ParameterGroupName == "Pharmacy"
                                select paramData
                                ).FirstOrDefault();

            parmToUpdate.ParameterValue = parameter.ParameterValue;
            _masterDbContext.CFGParameters.Attach(parmToUpdate);

            _masterDbContext.Entry(parmToUpdate).Property(p => p.ParameterValue).IsModified = true;

            _masterDbContext.SaveChanges();
            return parmToUpdate;

        }

        [HttpGet]
        [Route("Stores")]
        public IActionResult GetStores()
        {
            Func<object> func = () => _pharmacyDbContext.PHRMStore.Where(fy => (fy.Category == ENUM_StoreCategory.Dispensary || fy.Category == ENUM_StoreCategory.Substore) && fy.IsActive)
            .Select(store => new
            {
                store.StoreId,
                store.Name,
                store.Category,
                store.SubCategory
            }).ToList();
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("SubStores")]
        public IActionResult GetSubStores()
        {
            Func<object> func = () => _pharmacyDbContext.PHRMStore.Where(fy => fy.Category == ENUM_StoreCategory.Substore && fy.IsActive)
            .Select(store => new
            {
                WardId = store.StoreId,
                WardName = store.Name
            }).ToList();
            return InvokeHttpGetFunction(func);
        }
    }
}

