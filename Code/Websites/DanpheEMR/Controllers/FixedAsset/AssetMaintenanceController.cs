using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.InventoryModels;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace DanpheEMR.Controllers
{
    public class AssetMaintenanceController : CommonController
    {
        private static IHostingEnvironment _environment;
        public AssetMaintenanceController(IHostingEnvironment env, IOptions<MyConfiguration> _config) : base(_config)
        {
            _environment = env;
        }
        [HttpGet("{StoreId}")]
        public IActionResult GetAll([FromRoute] int StoreId)
        {
            var inventoryDbContext = new InventoryDbContext(connString);
            var resData = new DanpheHTTPResponse<object>();

            try
            {
                var currentUserId = HttpContext.Session.Get<RbacUser>("currentuser").UserId;
                var goodsReceiptList = (from fixedAssetStock in inventoryDbContext.FixedAssetStock
                                        join gritem in inventoryDbContext.GoodsReceiptItems on fixedAssetStock.GoodsReceiptItemId equals gritem.GoodsReceiptItemId into griJ
                                        from griLJ in griJ.DefaultIfEmpty()
                                        join grlist in inventoryDbContext.GoodsReceipts on griLJ.GoodsReceiptId equals grlist.GoodsReceiptID into grJ
                                        from grLJ in grJ.DefaultIfEmpty()
                                        join emp in inventoryDbContext.Employees on griLJ.CreatedBy equals emp.EmployeeId into empJ
                                        from empLJ in empJ.DefaultIfEmpty()
                                        join item in inventoryDbContext.Items on fixedAssetStock.ItemId equals item.ItemId
                                        from companyLJ in inventoryDbContext.InventoryCompany.Where(c => c.CompanyId == item.CompanyId).DefaultIfEmpty()
                                        join vend in inventoryDbContext.Vendors on grLJ.VendorId equals vend.VendorId into gs
                                        from vendLJ in gs.DefaultIfEmpty()
                                        join lastService in inventoryDbContext.FixedAssetService on fixedAssetStock.FixedAssetStockId equals lastService.FixedAssetStockId into ls
                                        from lastServ in ls.DefaultIfEmpty()
                                        where fixedAssetStock.IsMaintenanceRequired == true && fixedAssetStock.IsActive == true && fixedAssetStock.StoreId == StoreId
                                        let IsCurrentUserMaintenanceOwner = inventoryDbContext.UserRoleMaps.Any(a => a.RoleId == item.MaintenanceOwnerRoleId && a.UserId == currentUserId)
                                        select new
                                        {
                                            FixedAssetStockId = fixedAssetStock.FixedAssetStockId,
                                            BarCodeNumber = fixedAssetStock.BarCodeNumber,
                                            AssetCode = fixedAssetStock.AssetCode,
                                            BatchNo = fixedAssetStock.BatchNo,
                                            WarrantyExpiryDate = fixedAssetStock.WarrantyExpiryDate,
                                            AssetsLocation = fixedAssetStock.AssetsLocation,
                                            IsBarCodeGenerated = fixedAssetStock.IsBarCodeGenerated,
                                            IsAssetDamaged = fixedAssetStock.IsAssetDamaged,
                                            CreatedBy = fixedAssetStock.CreatedBy,
                                            CreatedOn = fixedAssetStock.CreatedOn,
                                            ItemId = fixedAssetStock.ItemId,
                                            IsActive = fixedAssetStock.IsActive,
                                            ItemRate = fixedAssetStock.ItemRate,
                                            MRP = fixedAssetStock.MRP,
                                            DiscountAmount = fixedAssetStock.DiscountAmount,
                                            DiscountPercent = fixedAssetStock.DiscountPercent,
                                            VAT = fixedAssetStock.VAT,
                                            VATAmount = fixedAssetStock.VATAmount,
                                            CcAmount = fixedAssetStock.CcAmount,
                                            CcCharge = fixedAssetStock.CcCharge,
                                            OtherCharge = fixedAssetStock.OtherCharge,
                                            ManufactureDate = fixedAssetStock.ManufactureDate,
                                            YearOfUse = fixedAssetStock.YearOfUse,
                                            TotalLife = fixedAssetStock.TotalLife,
                                            Performance = fixedAssetStock.Performance,
                                            IsMaintenanceRequired = fixedAssetStock.IsMaintenanceRequired,
                                            IsUnderMaintenance = fixedAssetStock.IsUnderMaintenance,
                                            IsAssetDamageConfirmed = fixedAssetStock.IsAssetDamageConfirmed,
                                            PeriodicServiceDays = fixedAssetStock.PeriodicServiceDays,
                                            InstallationDate = fixedAssetStock.InstallationDate,
                                            ServiceDate = lastServ.ServiceDate,
                                            ServiceCompleteDate = lastServ.ServiceCompleteDate,
                                            ItemName = item.ItemName,
                                            CompanyId = item.CompanyId,
                                            CompanyName = companyLJ.CompanyName,
                                            ItemCode = item.Code,
                                            VendorName = vendLJ == null ? "" : vendLJ.VendorName,
                                            ContactNo = vendLJ == null ? "" : vendLJ.ContactNo,
                                            ContactAddress = vendLJ == null ? "" : vendLJ.ContactAddress,
                                            Email = vendLJ == null ? "" : vendLJ.Email,
                                            VendorId = vendLJ == null ? 0 : vendLJ.VendorId,
                                            CompanyPosition = vendLJ == null ? "" : vendLJ.CompanyPosition,
                                            CompanyPosition2 = vendLJ == null ? "" : vendLJ.CompanyPosition2,
                                            Name = vendLJ == null ? "" : vendLJ.Name,
                                            Name2 = vendLJ == null ? "" : vendLJ.Name2,
                                            PhoneNumber = vendLJ == null ? "" : vendLJ.PhoneNumber,
                                            PhoneNumber2 = vendLJ == null ? "" : vendLJ.PhoneNumber2,
                                            CreatedByName = empLJ == null ? "" : empLJ.FullName,
                                            AssetMaintenanceOwnerRoleId = item.MaintenanceOwnerRoleId,
                                            IsCurrentUserMaintenanceOwner = IsCurrentUserMaintenanceOwner
                                        }).OrderByDescending(a => a.CreatedOn).ToList();
                resData.Status = "OK";
                resData.Results = goodsReceiptList;

            }
            catch (Exception ex)
            {
                resData.Status = "Failed";
                resData.ErrorMessage = ex.ToString();
                return BadRequest(resData);
            }
            return Ok(resData);
        }

        [HttpGet("Vendor/{id}")]
        public IActionResult GetVendorDetailsById([FromRoute] int id)
        {

            var inventoryDbContext = new InventoryDbContext(connString);
            var resData = new DanpheHTTPResponse<object>();
            try
            {
                var assetmainteancevendordetails = (from vendor in inventoryDbContext.Vendors
                                                    where vendor.VendorId == id
                                                    select new
                                                    {
                                                        VendorName = vendor.VendorName,
                                                        ContactAddress = vendor.ContactAddress,
                                                        ContactNo = vendor.ContactNo,
                                                        Email = vendor.Email,
                                                        CompanyPosition = vendor.CompanyPosition,
                                                        Name = vendor.Name,
                                                        PhoneNumber = vendor.PhoneNumber,
                                                        CompanyPosition2 = vendor.CompanyPosition2,
                                                        Name2 = vendor.Name2,
                                                        PhoneNumber2 = vendor.PhoneNumber2
                                                    }).FirstOrDefault();
                resData.Status = "OK";
                resData.Results = assetmainteancevendordetails;
            }
            catch (Exception ex)
            {
                resData.Status = "Failed";
                resData.ErrorMessage = "Failed to load vendor details. Detail : " + ex.ToString();
            }
            return Ok(resData);
        }


        [HttpGet("getfaulthistory/{fixedAssetStockId}")]
        public async Task<IActionResult> GetFaultHistory([FromRoute] int fixedAssetStockId)
        {
            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                var inventoryDbContext = new InventoryDbContext(connString);
                var faulthistory = await (from fault in inventoryDbContext.FixedAssetFaultHistory
                                          join emp in inventoryDbContext.Employees on fault.CreatedBy equals emp.EmployeeId
                                          where fault.FixedAssetStockId == fixedAssetStockId
                                          select new
                                          {
                                              fault.FaultHistoryId,
                                              fault.FixedAssetStockId,
                                              fault.FaultDate,
                                              fault.FaultDescription,
                                              fault.IsFaultResolved,
                                              fault.FaultResolvedDate,
                                              fault.FaultResolvedRemarks,

                                              CreatedName = emp.FullName,

                                          }).ToListAsync();
                responseData.Status = "OK";
                responseData.Results = faulthistory;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Failed to get fault history! Error Details:" + ex.ToString();
            }

            return Ok(responseData);

        }

        [HttpGet("GetAssetServiceHistory/{fixedAssetStockId}")]
        public IActionResult GetAssetServiceHistory([FromRoute] int fixedAssetStockId)
        {
            var invDbContext = new InventoryDbContext(connString);
            var resData = new DanpheHTTPResponse<object>();

            try
            {
                var results = (from serv in invDbContext.FixedAssetService
                               join emp in invDbContext.Employees on serv.CreatedBy equals emp.EmployeeId
                               where serv.FixedAssetStockId == fixedAssetStockId
                               select new
                               {
                                   serv.AssetServiceId,
                                   serv.FixedAssetStockId,
                                   serv.ServiceDate,
                                   serv.ServiceRemarks,
                                   serv.ServiceCompleteDate,
                                   serv.ServiceCompleteRemarks,
                                   serv.CreatedBy,
                                   serv.CreatedOn,

                                   CreatedByName = emp.FirstName + " " + emp.LastName,
                               }).OrderByDescending(a => a.CreatedOn).ToList();

                resData.Results = results;
                resData.Status = "OK";

            }
            catch (Exception ex)
            {
                resData.Status = "Failed";
                resData.ErrorMessage = ex.ToString();
                return BadRequest(resData);
            }
            return Ok(resData);
        }



        [HttpPost("PostAssetServiceDetails")]
        public IActionResult PostAssetServiceDetails()
        {
            var inventoryDbContext = new InventoryDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                string Str = this.ReadPostData();
                FixedAssetServiceModel serviceDetails = DanpheJSONConvert.DeserializeObject<FixedAssetServiceModel>(Str);


                using (var dbContextTransaction = inventoryDbContext.Database.BeginTransaction())
                {
                    try
                    {

                        serviceDetails.CreatedBy = currentUser.EmployeeId;
                        serviceDetails.CreatedOn = DateTime.Now;

                        inventoryDbContext.FixedAssetService.Add(serviceDetails);
                        inventoryDbContext.SaveChanges();

                        // After File Added Commit the Transaction
                        dbContextTransaction.Commit();

                    }
                    catch (Exception ex)
                    {
                        dbContextTransaction.Rollback();
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "Failed to Post Asset Service Details!" + ex.ToString();
                    }
                }

                responseData.Results = null;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Failed to Post Asset Service Details!" + ex.ToString();
                return BadRequest(responseData);
            }
            return Ok(responseData);
        }

        [HttpPut("PutAssetRequiredMaintenance")]
        public IActionResult PutAssetRequiredMaintenance()
        {
            var inventoryDbContext = new InventoryDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                var Str = this.ReadPostData();
                FixedAssetStockModel assetDetails = DanpheJSONConvert.DeserializeObject<FixedAssetStockModel>(Str);



                assetDetails.ModifiedBy = currentUser.EmployeeId;
                assetDetails.ModifiedOn = DateTime.Now;

                if (assetDetails.IsMaintenanceRequired == true)
                {
                    assetDetails.Performance = "Not Working";
                }
                else
                {
                    assetDetails.Performance = "Working";
                }

                var temp = inventoryDbContext.FixedAssetStock.Attach(assetDetails);
                inventoryDbContext.Entry(temp).Property(x => x.FixedAssetStockId).IsModified = false;
                inventoryDbContext.Entry(temp).Property(x => x.IsMaintenanceRequired).IsModified = true;
                inventoryDbContext.Entry(temp).Property(x => x.ModifiedBy).IsModified = true;
                inventoryDbContext.Entry(temp).Property(x => x.ModifiedOn).IsModified = true;
                inventoryDbContext.Entry(temp).Property(x => x.Performance).IsModified = true;

                //inventoryDbContext.Entry(temp).State = EntityState.Modified;


                inventoryDbContext.SaveChanges();
                responseData.Results = assetDetails;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Failed to transfer to Maintenance section!" + ex.ToString();
                return BadRequest(responseData);
            }
            return Ok(responseData);
        }

        [HttpPut("PutAssetFaultResolvedDetails")]
        public IActionResult PutAssetFaultResolvedDetails()
        {
            var inventoryDbContext = new InventoryDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                var Str = this.ReadPostData();
                FixedAssetFaultHistoryModel assetDetails = DanpheJSONConvert.DeserializeObject<FixedAssetFaultHistoryModel>(Str);



                assetDetails.ModifiedBy = currentUser.EmployeeId;
                assetDetails.ModifiedOn = DateTime.Now;

                var temp = inventoryDbContext.FixedAssetFaultHistory.Attach(assetDetails);
                inventoryDbContext.Entry(temp).Property(x => x.FixedAssetStockId).IsModified = false;

                inventoryDbContext.Entry(temp).Property(x => x.IsFaultResolved).IsModified = true;
                inventoryDbContext.Entry(temp).Property(x => x.FaultResolvedDate).IsModified = true;
                inventoryDbContext.Entry(temp).Property(x => x.FaultResolvedRemarks).IsModified = true;
                inventoryDbContext.Entry(temp).Property(x => x.ModifiedBy).IsModified = true;
                inventoryDbContext.Entry(temp).Property(x => x.ModifiedOn).IsModified = true;

                //inventoryDbContext.Entry(temp).State = EntityState.Modified;


                inventoryDbContext.SaveChanges();
                responseData.Results = assetDetails;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.ToString();
                return BadRequest(responseData);
            }
            return Ok(responseData);
        }

        [HttpPut("PutRepairStatus")]
        public IActionResult PutRepairStatus()
        {
            var inventoryDbContext = new InventoryDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                var Str = this.ReadPostData();
                FixedAssetStockModel assetDetails = DanpheJSONConvert.DeserializeObject<FixedAssetStockModel>(Str);

                if (!assetDetails.IsUnderMaintenance) // that means Asset has been repaired
                {
                    assetDetails.Performance = "Working";
                    assetDetails.IsMaintenanceRequired = false;
                }

                assetDetails.ModifiedBy = currentUser.EmployeeId;
                assetDetails.ModifiedOn = DateTime.Now;

                var temp = inventoryDbContext.FixedAssetStock.Attach(assetDetails);
                inventoryDbContext.Entry(temp).Property(x => x.FixedAssetStockId).IsModified = false;

                inventoryDbContext.Entry(temp).Property(x => x.IsUnderMaintenance).IsModified = true;
                inventoryDbContext.Entry(temp).Property(x => x.IsMaintenanceRequired).IsModified = true;
                inventoryDbContext.Entry(temp).Property(x => x.Performance).IsModified = true;
                inventoryDbContext.Entry(temp).Property(x => x.ModifiedBy).IsModified = true;
                inventoryDbContext.Entry(temp).Property(x => x.ModifiedOn).IsModified = true;

                //inventoryDbContext.Entry(temp).State = EntityState.Modified;


                inventoryDbContext.SaveChanges();
                responseData.Results = assetDetails;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.ToString();
                return BadRequest(responseData);
            }
            return Ok(responseData);
        }

        [HttpPut("PutAssetServiceDetails")]
        public IActionResult PutAssetServiceDetails()
        {
            var inventoryDbContext = new InventoryDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                var Str = this.ReadPostData();
                FixedAssetServiceModel serviceDetails = DanpheJSONConvert.DeserializeObject<FixedAssetServiceModel>(Str);



                serviceDetails.ModifiedBy = currentUser.EmployeeId;
                serviceDetails.ModifiedOn = DateTime.Now;

                var temp = inventoryDbContext.FixedAssetService.Attach(serviceDetails);
                inventoryDbContext.Entry(temp).Property(x => x.ServiceDate).IsModified = true;
                inventoryDbContext.Entry(temp).Property(x => x.ServiceRemarks).IsModified = true;
                inventoryDbContext.Entry(temp).Property(x => x.ServiceCompleteDate).IsModified = true;
                inventoryDbContext.Entry(temp).Property(x => x.ServiceCompleteRemarks).IsModified = true;
                inventoryDbContext.Entry(temp).Property(x => x.ModifiedBy).IsModified = true;
                inventoryDbContext.Entry(temp).Property(x => x.ModifiedOn).IsModified = true;

                //inventoryDbContext.Entry(temp).State = EntityState.Modified;


                inventoryDbContext.SaveChanges();
                responseData.Results = serviceDetails;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Failed to Update Asset Service Details!" + ex.ToString();
                return BadRequest(responseData);
            }
            return Ok(responseData);
        }

        [HttpGet("GetAssetContractFile/{FixedAssetStockId}")]
        public IActionResult GetAssetContractFile([FromRoute] int FixedAssetStockId)
        {
            var inventoryDbContext = new InventoryDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                var ILL = inventoryDbContext.FixedAssetContract.Where(a => a.FixedAssetStockId == FixedAssetStockId).FirstOrDefault();

                var location = (from dbc in inventoryDbContext.CfgParameters
                                where dbc.ParameterGroupName.ToLower() == "inventory"
                                && dbc.ParameterName == "AssetContractFileUploadLocation"
                                select dbc.ParameterValue).FirstOrDefault();

                var path = _environment.WebRootPath + location;

                if (ILL != null)
                {
                    string fullPath;
                    fullPath = path + ILL.ContractFileName;

                    FileInfo fl = new FileInfo(fullPath);
                    if (fl.Exists)
                    {
                        ILL.FileBinaryData = System.IO.File.ReadAllBytes(@fullPath);
                    }
                }
                else
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = "No Contract Found !";
                }

                responseData.Results = ILL;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Failed to Post Asset Contract!" + ex.ToString();
                return BadRequest(responseData);
            }
            return Ok(responseData);
        }


        [HttpPost("PostAssetContractFile")]
        public IActionResult PostAssetContractFile()
        {
            var inventoryDbContext = new InventoryDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                // Read Files From Clent Side 
                var f = this.ReadFiles();
                var file = f[0];

                // Read File details from form model
                var FD = Request.Form["fileDetails"];
                FixedAssetContractModel fileDetails = DanpheJSONConvert.DeserializeObject<FixedAssetContractModel>(FD);

                using (var dbContextTransaction = inventoryDbContext.Database.BeginTransaction())
                {
                    try
                    {

                        fileDetails.CreatedBy = currentUser.EmployeeId;
                        fileDetails.CreatedOn = DateTime.Now;

                        inventoryDbContext.FixedAssetContract.Add(fileDetails);
                        inventoryDbContext.SaveChanges();

                        var location = (from dbc in inventoryDbContext.CfgParameters
                                        where dbc.ParameterGroupName.ToLower() == "inventory"
                                        && dbc.ParameterName == "AssetContractFileUploadLocation"
                                        select dbc.ParameterValue).FirstOrDefault();

                        var path = _environment.WebRootPath + location;

                        if (!Directory.Exists(path))
                        {
                            Directory.CreateDirectory(path);
                        }
                        var fullPath = path + fileDetails.ContractFileName;


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
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "Failed to Post Asset Contract! Error Details:" + ex.ToString();
                    }
                }

                responseData.Results = null;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Failed to Post Asset Contract! Error Details:" + ex.ToString();
                return BadRequest(responseData);
            }
            return Ok(responseData);
        }


        [HttpPut("PutAssetContractFile")]
        public IActionResult PutAssetContractFile()
        {
            var inventoryDbContext = new InventoryDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                // Read Files From Clent Side 
                var f = this.ReadFiles();
                var file = f[0];

                // Read File details from form model
                var FD = Request.Form["fileDetails"];
                FixedAssetContractModel fileDetails = DanpheJSONConvert.DeserializeObject<FixedAssetContractModel>(FD);



                fileDetails.ModifiedBy = currentUser.EmployeeId;
                fileDetails.ModifiedOn = DateTime.Now;

                inventoryDbContext.FixedAssetContract.Attach(fileDetails);
                inventoryDbContext.Entry(fileDetails).Property(x => x.ModifiedBy).IsModified = true;
                inventoryDbContext.Entry(fileDetails).Property(x => x.ModifiedOn).IsModified = true;
                inventoryDbContext.Entry(fileDetails).Property(x => x.ContractFileName).IsModified = true;
                inventoryDbContext.Entry(fileDetails).Property(x => x.FileExtention).IsModified = true;

                inventoryDbContext.Entry(fileDetails).Property(x => x.AssetContractId).IsModified = false;
                inventoryDbContext.Entry(fileDetails).Property(x => x.FixedAssetStockId).IsModified = false;

                inventoryDbContext.SaveChanges();

                var location = (from dbc in inventoryDbContext.CfgParameters
                                where dbc.ParameterGroupName.ToLower() == "inventory"
                                && dbc.ParameterName == "AssetContractFileUploadLocation"
                                select dbc.ParameterValue).FirstOrDefault();

                var path = _environment.WebRootPath + location;

                if (!Directory.Exists(path))
                {
                    Directory.CreateDirectory(path);
                }
                var fullPath = path + fileDetails.ContractFileName;


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

                responseData.Results = fileDetails;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Failed to Post Asset Contract! Error Details:" + ex.ToString();
                return BadRequest(responseData);
            }
            return Ok(responseData);
        }

        [HttpPut("UpdateAssetDamageStatus")]
        public IActionResult UpdateAssetDamageStatus()
        {

            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                var inventoryDbContext = new InventoryDbContext(connString);

                string str = this.ReadPostData();
                FixedAssetStockModel faStock = DanpheJSONConvert.DeserializeObject<FixedAssetStockModel>(str);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

                FixedAssetStockModel faStockUpdateable = inventoryDbContext.FixedAssetStock.Where(a => a.FixedAssetStockId == faStock.FixedAssetStockId).FirstOrDefault();

                faStockUpdateable.ModifiedBy = currentUser.EmployeeId;
                faStockUpdateable.ModifiedOn = DateTime.Now;
                faStockUpdateable.DamagedRemarks = faStock.DamagedRemarks;
                faStockUpdateable.UndamagedRemarks = faStock.UndamagedRemarks;
                faStockUpdateable.IsAssetDamaged = faStock.IsAssetDamaged;

                inventoryDbContext.FixedAssetStock.Attach(faStockUpdateable);
                inventoryDbContext.Entry(faStockUpdateable).Property(x => x.IsAssetDamaged).IsModified = true;
                inventoryDbContext.Entry(faStockUpdateable).Property(x => x.DamagedRemarks).IsModified = true;
                inventoryDbContext.Entry(faStockUpdateable).Property(x => x.UndamagedRemarks).IsModified = true;
                inventoryDbContext.Entry(faStockUpdateable).Property(x => x.ModifiedBy).IsModified = true;
                inventoryDbContext.Entry(faStockUpdateable).Property(x => x.ModifiedOn).IsModified = true;

                inventoryDbContext.Entry(faStockUpdateable).Property(x => x.FixedAssetStockId).IsModified = false;
                inventoryDbContext.Entry(faStockUpdateable).Property(x => x.CreatedBy).IsModified = false;
                inventoryDbContext.Entry(faStockUpdateable).Property(x => x.CreatedOn).IsModified = false;
                inventoryDbContext.Entry(faStockUpdateable).Property(x => x.BarCodeNumber).IsModified = false;
                inventoryDbContext.SaveChanges();

                responseData.Status = "OK";
                responseData.Results = faStockUpdateable;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + "exception details:" + ex.ToString();
            }

            return Ok(responseData);
        }


        [HttpPut("AssetFaultUpdate")]
        public IActionResult AssetFaultUpdate()
        {
            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                var inventoryDbContext = new InventoryDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

                string Str = this.ReadPostData();
                FixedAssetFaultHistoryModel faulthistory = DanpheJSONConvert.DeserializeObject<FixedAssetFaultHistoryModel>(Str);

                faulthistory.ModifiedBy = currentUser.EmployeeId;
                faulthistory.ModifiedOn = DateTime.Now;
                var temp = inventoryDbContext.FixedAssetFaultHistory.Attach(faulthistory);
                inventoryDbContext.Entry(temp).State = EntityState.Modified;
                inventoryDbContext.Entry(temp).Property(x => x.FixedAssetStockId).IsModified = false;
                inventoryDbContext.Entry(temp).Property(x => x.CreatedBy).IsModified = false;
                inventoryDbContext.SaveChanges();

                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.ErrorMessage = "Failed to update Asset Fault! Error Details:" + ex.ToString();
                return BadRequest(responseData);
            }

            return Ok(responseData);
        }

        [HttpPost("AssetCheckList")]
        public IActionResult AssetCheckList()
        {
            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                var inventoryDbContext = new InventoryDbContext(connString);

                string Str = this.ReadPostData();
                List<FixedAssetConditionCheckListModel> asstechecklist = DanpheJSONConvert.DeserializeObject<List<FixedAssetConditionCheckListModel>>(Str);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                FixedAssetConditionCheckListModel fixedasstechecklist = new FixedAssetConditionCheckListModel();

                foreach (var checklist in asstechecklist)
                {
                    fixedasstechecklist.FixedAssetStockId = checklist.FixedAssetStockId;
                    fixedasstechecklist.AssetConditionId = checklist.AssetConditionId;
                    fixedasstechecklist.Condition = checklist.Condition;
                    fixedasstechecklist.CreatedBy = currentUser.EmployeeId;
                    fixedasstechecklist.CreatedOn = DateTime.Now;
                    fixedasstechecklist.IsActive = true;
                    inventoryDbContext.FixedAssetConditionCheckList.Add(fixedasstechecklist);
                    inventoryDbContext.SaveChanges();

                }

                responseData.Status = "OK";
                responseData.Results = asstechecklist;
            }
            catch (Exception ex)
            {
                responseData.ErrorMessage = "Failed ! Error Details: " + ex.ToString();
                return BadRequest(responseData);
            }
            return Ok(responseData);
        }

        [HttpPost("AssetFaultConfirm")]
        public IActionResult AssetFaultConfirm()
        {
            var responseData = new DanpheHTTPResponse<object>();

            try
            {
                var inventoryDbContext = new InventoryDbContext(connString);
                string Str = this.ReadPostData();
                FixedAssetFaultHistoryModel faulthistory = DanpheJSONConvert.DeserializeObject<FixedAssetFaultHistoryModel>(Str);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

                using (var dbTransaction = inventoryDbContext.Database.BeginTransaction())
                {
                    try
                    {


                        faulthistory.CreatedBy = currentUser.EmployeeId;
                        faulthistory.CreatedOn = DateTime.Now;
                        inventoryDbContext.FixedAssetFaultHistory.Add(faulthistory);

                        inventoryDbContext.SaveChanges();
                        dbTransaction.Commit();

                        responseData.Results = faulthistory;
                        responseData.Status = "OK";
                    }

                    catch (Exception ex)
                    {
                        dbTransaction.Rollback();
                    }
                }
            }
            catch (Exception ex)
            {
                responseData.ErrorMessage = "Failed ! Error Details: " + ex.ToString();
                return BadRequest(responseData);

            }
            return Ok(responseData);
        }


        [HttpPut("UpdateAssetMaintenanceList")]
        public IActionResult UpdateAssetMaintenanceList()
        {
            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                var inventoryDbContext = new InventoryDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");


                string str = this.ReadPostData();
                FixedAssetStockModel fixedAssetstock = DanpheJSONConvert.DeserializeObject<FixedAssetStockModel>(str);
                AssetLocationHistoryModel assetslocation = new AssetLocationHistoryModel();
                //VendorMasterModel vendor = new VendorMasterModel();
                using (var dbTransaction = inventoryDbContext.Database.BeginTransaction())
                {
                    try
                    {

                        VendorMasterModel vendor = inventoryDbContext.Vendors.Where(a => a.VendorId == fixedAssetstock.VendorId).FirstOrDefault();

                        vendor.CompanyPosition = fixedAssetstock.CompanyPosition;
                        vendor.Name = fixedAssetstock.Name;
                        vendor.PhoneNumber = fixedAssetstock.PhoneNumber;
                        vendor.CompanyPosition2 = fixedAssetstock.CompanyPosition2;
                        vendor.Name2 = fixedAssetstock.Name2;
                        vendor.PhoneNumber2 = fixedAssetstock.PhoneNumber2;
                        inventoryDbContext.SaveChanges();


                        fixedAssetstock.ModifiedBy = currentUser.EmployeeId;
                        fixedAssetstock.ModifiedOn = DateTime.Now;
                        fixedAssetstock.IsMaintenanceRequired = true;
                        fixedAssetstock.IsActive = true;
                        var temp = inventoryDbContext.FixedAssetStock.Attach(fixedAssetstock);
                        inventoryDbContext.Entry(temp).State = EntityState.Modified;
                        inventoryDbContext.Entry(temp).Property(x => x.ItemId).IsModified = false;
                        inventoryDbContext.Entry(temp).Property(x => x.CreatedOn).IsModified = false;
                        inventoryDbContext.Entry(temp).Property(x => x.CreatedBy).IsModified = false;
                        inventoryDbContext.Entry(temp).Property(x => x.GoodsReceiptItemId).IsModified = false;

                        inventoryDbContext.Entry(temp).Property(x => x.AssetsLocation).IsModified = false;
                        inventoryDbContext.Entry(temp).Property(x => x.WarrantyExpiryDate).IsModified = false;
                        inventoryDbContext.Entry(temp).Property(x => x.ModelNo).IsModified = false;
                        inventoryDbContext.Entry(temp).Property(x => x.SerialNo).IsModified = false;
                        inventoryDbContext.Entry(temp).Property(x => x.BuildingBlockNumber).IsModified = false;
                        inventoryDbContext.Entry(temp).Property(x => x.Floors).IsModified = false;
                        inventoryDbContext.Entry(temp).Property(x => x.RoomNumber).IsModified = false;
                        inventoryDbContext.Entry(temp).Property(x => x.RoomPosition).IsModified = false;
                        inventoryDbContext.Entry(temp).Property(x => x.StoreId).IsModified = false;

                        inventoryDbContext.Entry(temp).Property(x => x.ManufactureDate).IsModified = true;
                        inventoryDbContext.Entry(temp).Property(x => x.TotalLife).IsModified = true;
                        inventoryDbContext.Entry(temp).Property(x => x.Performance).IsModified = true;
                        inventoryDbContext.Entry(temp).Property(x => x.YearOfUse).IsModified = true;
                        inventoryDbContext.Entry(temp).Property(x => x.IsActive).IsModified = true;
                        inventoryDbContext.Entry(temp).Property(x => x.IsMaintenanceRequired).IsModified = true;
                        inventoryDbContext.SaveChanges();

                        inventoryDbContext.SaveChanges();
                        dbTransaction.Commit();

                        responseData.Results = fixedAssetstock;
                        responseData.Status = "OK";
                    }

                    catch (Exception ex)
                    {
                        dbTransaction.Rollback();
                    }
                }
            }
            catch (Exception ex)
            {
                responseData.ErrorMessage = "Failed ! Error Details: " + ex.ToString();
                return BadRequest(responseData);
            }
            return Ok(responseData);
        }


        [HttpGet("AssestConditionChecklist/{fixedAssetStockId}")]
        public IActionResult AssestConditionChecklist([FromRoute] int fixedAssetStockId)
        {
            var responseData = new DanpheHTTPResponse<object>();

            try
            {
                var inventoryDbContext = new InventoryDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");


                var assestConditionCheckList = (from assetchecklist in inventoryDbContext.FixedAssetConditionCheckList
                                                where assetchecklist.FixedAssetStockId == fixedAssetStockId
                                                select new
                                                {
                                                    assetchecklist.AssetConditionCheckListId,
                                                    assetchecklist.FixedAssetStockId,
                                                    assetchecklist.AssetConditionId,
                                                    assetchecklist.Condition,
                                                    assetchecklist.CreatedBy,
                                                    assetchecklist.CreatedOn,

                                                }).OrderByDescending(a => a.CreatedOn).ToList().Take(6);


                responseData.Status = "OK";
                responseData.Results = assestConditionCheckList;

            }
            catch (Exception ex)
            {

                responseData.ErrorMessage = "Failed ! Error Details: " + ex.ToString();
                return BadRequest(responseData);
            }
            return Ok(responseData);
        }


        [HttpGet("GetFixedAssetLocations")]
        public IActionResult GetFixedAssetLocations()
        {
            var responseData = new DanpheHTTPResponse<object>();

            try
            {
                var inventoryDbContext = new InventoryDbContext(connString);

                var fixedAssetLocations = (from assetlocation in inventoryDbContext.FixedAssetLocations
                                           select new
                                           {
                                               assetlocation.LocationName,
                                               assetlocation.LocationId,


                                           }).ToList();
                responseData.Status = "OK";
                responseData.Results = fixedAssetLocations;

            }
            catch (Exception ex)
            {
                responseData.ErrorMessage = "Failed ! Error Details: " + ex.ToString();
                return BadRequest(responseData);
            }
            return Ok(responseData);
        }

    }
}
