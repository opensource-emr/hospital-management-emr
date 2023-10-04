using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services
{
    public class ActivateInventoryService : IActivateInventoryService
    {

        #region Fields
        private InventoryDbContext db;
        private RbacDbContext _rbacDb;
        private readonly string connString = null;
        #endregion

        #region CTOR
        public ActivateInventoryService(IOptions<MyConfiguration> _config)
        {
            connString = _config.Value.Connectionstring;
            db = new InventoryDbContext(connString);

        }
        #endregion

        #region Methods
        public IList<ActivateInventoryDTO> GetAllInventories()
        {
            var inventoryCategory = Enums.ENUM_StoreCategory.Store;
            var inventorySubCategory = Enums.ENUM_StoreSubCategory.Inventory;
            var query = (from d in db.StoreMasters
                         let p = db.Permissions.FirstOrDefault(p => p.PermissionId == d.PermissionId && p.IsActive == true)
                         where d.Category == inventoryCategory && d.SubCategory == inventorySubCategory
                         select new ActivateInventoryDTO
                         {
                             StoreId = d.StoreId,
                             Name = d.Name,
                             Category = d.Category,
                             SubCategory = d.SubCategory,
                             Code = d.Code,
                             ContactNo = d.ContactNo,
                             Email = d.Email,
                             Address = d.Address,
                             StoreDescription = d.StoreDescription,
                             StoreLabel = d.StoreLabel,
                             IsActive = d.IsActive,
                             INV_GRGroupId = d.INV_GRGroupId,
                             INV_POGroupId = d.INV_POGroupId,
                             INV_PRGroupId = d.INV_PRGroupId,
                             INV_ReqDisGroupId = d.INV_ReqDisGroupId,
                             INV_RFQGroupId = d.INV_RFQGroupId,
                             INV_ReceiptDisplayName = d.INV_ReceiptDisplayName,
                             INV_ReceiptNoCode = d.INV_ReceiptNoCode,
                             PermissionInfo = new
                             {
                                 name = (p != null) ? p.PermissionName : "",
                                 actionOnInvalid = "remove"
                             },
                         }).ToList();
            return query;
        }
        public PHRMStoreModel GetInventory(int id)
        {
            return db.StoreMasters.Find(id);
        }


        public int ActivateDeactivateInventory(int id)
        {
            var inventory = db.StoreMasters.Find(id);
            inventory.IsActive = !inventory.IsActive;
            db.SaveChanges();
            return id;
        }
        #endregion

    }

    #region ViewModel, DTO
    public class ActivateInventoryDTO
    {
        public int StoreId { get; set; }
        public string Name { get; set; }
        public string StoreDescription { get; set; }
        public string ContactNo { get; set; }
        public string Category { get; set; }
        public string SubCategory { get; set; }
        public string StoreLabel { get; set; }
        public bool IsActive { get; set; }
        public string Code { get; set; }
        public string Address { get; set; }
        public string Email { get; set; }
        public int? INV_GRGroupId { get; set; }
        public int? INV_POGroupId { get; set; }
        public int? INV_PRGroupId { get; set; }
        public int? INV_ReqDisGroupId { get; set; }
        public int? INV_RFQGroupId { get; set; }
        public string INV_ReceiptDisplayName { get; set; }
        public string INV_ReceiptNoCode { get; set; }
        public object PermissionInfo { get; set; }
    }
    #endregion
}
