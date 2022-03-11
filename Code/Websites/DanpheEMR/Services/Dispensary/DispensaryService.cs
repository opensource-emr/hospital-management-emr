using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;

namespace DanpheEMR.Services.Dispensary
{
    public class DispensaryService : IDispensaryService
    {
        #region Fields
        private PharmacyDbContext db;
        private RbacDbContext _rbacDb;
        private readonly string connString = null;
        #endregion

        #region CTOR
        public DispensaryService(IOptions<MyConfiguration> _config)
        {
            connString = _config.Value.Connectionstring;
            db = new PharmacyDbContext(connString);

        }
        #endregion

        #region Methods
        public IList<DispensaryDTO> GetAllDispensaries()
        {
            var dispensaryCategory = Enums.ENUM_StoreCategory.Dispensary;
            var storeInDb = (from d in db.PHRMStore
                             let p = db.Permissions.FirstOrDefault(p => p.PermissionId == d.PermissionId && p.IsActive == true)
                             where d.Category == dispensaryCategory
                             select new { d, p }
                         ).ToList();
            var dispensaries = (from store in storeInDb
                                select new DispensaryDTO
                                {
                                    StoreId = store.d.StoreId,
                                    Name = store.d.Name,
                                    Category = store.d.Category,
                                    SubCategory = store.d.SubCategory,
                                    Code = store.d.Code,
                                    PanNo = store.d.PanNo,
                                    ContactNo = store.d.ContactNo,
                                    Email = store.d.Email,
                                    Address = store.d.Address,
                                    StoreDescription = store.d.StoreDescription,
                                    StoreLabel = store.d.StoreLabel,
                                    IsActive = store.d.IsActive,
                                    UseSeparateInvoiceHeader = store.d.UseSeparateInvoiceHeader,
                                    PermissionInfo = new
                                    {
                                        name = (store.p != null) ? store.p.PermissionName : "",
                                        actionOnInvalid = "remove"
                                    },
                                    AvailablePaymentModes = store.d.AvailablePaymentModes,
                                    DefaultPaymentMode = store.d.DefaultPaymentMode ?? store.d.AvailablePaymentModes.FirstOrDefault().PaymentModeName
                                }).ToList();
            return dispensaries;
        }

        public IList<GetAllPharmacyStoresDto> GetAllPharmacyStores()
        {
            var pharmacySubCategory = Enums.ENUM_StoreSubCategory.Pharmacy;
            var dispensaryCategory = Enums.ENUM_StoreCategory.Dispensary;
            var query = (from d in db.PHRMStore
                         where d.SubCategory == pharmacySubCategory || d.Category == dispensaryCategory
                         select new GetAllPharmacyStoresDto
                         {
                             StoreId = d.StoreId,
                             Name = d.Name
                         }).ToList();
            return query;
        }
        public PHRMStoreModel GetDispensary(int id)
        {
            return db.PHRMStore.Find(id);
        }

        public DispensaryDTO AddDispensary(PHRMStoreModel dispensary)
        {
            _rbacDb = new RbacDbContext(connString);
            using (var dbResource = _rbacDb.Database.BeginTransaction())
            {
                try
                {
                    var currentDate = DateTime.Now;

                    //find parent store id

                    var dispensaryPermission = new RbacPermission();
                    dispensaryPermission.PermissionName = $"dispensary-{dispensary.Name}";
                    dispensaryPermission.Description = "auto-generated after dispensary creation";
                    dispensaryPermission.ApplicationId = _rbacDb.Applications.Where(a => a.ApplicationName == "Dispensary" && a.ApplicationCode == "DISP").Select(a => a.ApplicationId).FirstOrDefault();
                    dispensaryPermission.CreatedBy = dispensary.CreatedBy;
                    dispensaryPermission.CreatedOn = currentDate;
                    dispensaryPermission.IsActive = true;
                    _rbacDb.Permissions.Add(dispensaryPermission);
                    _rbacDb.SaveChanges();

                    var storeCategory = Enums.ENUM_StoreCategory.Store;
                    var parentStoreId = db.PHRMStore.Where(s => s.Category == storeCategory).Select(s => s.StoreId).FirstOrDefault();
                    dispensary.ParentStoreId = parentStoreId;
                    dispensary.PermissionId = dispensaryPermission.PermissionId;
                    dispensary.CreatedOn = currentDate;
                    _rbacDb.Store.Add(dispensary);
                    _rbacDb.SaveChanges();
                    dbResource.Commit();

                    // returning dispensary dto instead, since dispensary list are eagerly loaded and
                    // only newly added dispensary will be added in the angular service
                    var result = new DispensaryDTO
                    {
                        StoreId = dispensary.StoreId,
                        Name = dispensary.Name,
                        Category = dispensary.Category,
                        SubCategory = dispensary.SubCategory,
                        Code = dispensary.Code,
                        PanNo = dispensary.PanNo,
                        ContactNo = dispensary.ContactNo,
                        Email = dispensary.Email,
                        Address = dispensary.Address,
                        StoreDescription = dispensary.StoreDescription,
                        StoreLabel = dispensary.StoreLabel,
                        IsActive = dispensary.IsActive,
                        UseSeparateInvoiceHeader = dispensary.UseSeparateInvoiceHeader,
                        PermissionInfo = new
                        {
                            name = (dispensaryPermission != null) ? dispensaryPermission.PermissionName : "",
                            actionOnInvalid = "remove"
                        }
                    };
                    return result;
                }
                catch (Exception)
                {
                    dbResource.Rollback();
                    throw;
                }
            }
        }

        public PHRMStoreModel UpdateDispensary(PHRMStoreModel value)
        {
            db.PHRMStore.Attach(value);
            db.Entry(value).State = EntityState.Modified;
            db.Entry(value).Property(d => d.CreatedBy).IsModified = false;
            db.Entry(value).Property(d => d.CreatedOn).IsModified = false;
            db.Entry(value).Property(d => d.AvailablePaymentModesJSON).IsModified = false;
            db.Entry(value).Property(d => d.DefaultPaymentMode).IsModified = false;
            db.SaveChanges();
            return value;
        }

        public int ActivateDeactivateDispensary(int id)
        {
            var dispensary = db.PHRMStore.Find(id);
            dispensary.IsActive = !dispensary.IsActive;
            db.SaveChanges();
            return id;
        }
        #endregion

    }


    #region ViewModel, DTO
    public class DispensaryDTO
    {
        public int StoreId { get; set; }
        public string Name { get; set; }
        public string PanNo { get; set; }
        public string StoreDescription { get; set; }
        public string ContactNo { get; set; }
        public string Category { get; set; }
        public string SubCategory { get; set; }
        public string StoreLabel { get; set; }
        public bool IsActive { get; set; }
        public string Code { get; set; }
        public string Address { get; set; }
        public string Email { get; set; }
        public bool UseSeparateInvoiceHeader { get; set; }
        public object PermissionInfo { get; set; }
        public ICollection<PaymentModesSettings> AvailablePaymentModes { get; set; }
        public string DefaultPaymentMode { get; set; }
    }
    public class GetAllPharmacyStoresDto
    {
        public int StoreId { get; set; }
        public string Name { get; set; }
    }
    #endregion
}
