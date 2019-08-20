using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using System.Data.Entity;
using Microsoft.Extensions.Options;
using DanpheEMR.Utilities;
using System.Globalization; //used for converting string to Titlecase i.e first letter capital
using DanpheEMR.CommonTypes;
using DanpheEMR.ServerModel.Helpers;//for appointmenthelpers
using DanpheEMR.Core.Configuration;
using DanpheEMR.Security;
using RefactorThis.GraphDiff;
using System.Xml;
using Newtonsoft.Json;
using DanpheEMR.Core;
using DanpheEMR.Core.Parameters;
using DanpheEMR.ServerModel.LabModels;
using System.IO;
using Microsoft.AspNetCore.Http;
using System.Drawing;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers
{

    public class SettingsController : CommonController
    {

        public SettingsController(IOptions<MyConfiguration> _config) : base(_config)
        {

        }
        [HttpGet]
        public string Get(string department,
            string servDeptName,
            string reqType,
            int providerId,
            int patientId,
            int employeeId,
            DateTime requestDate,
            int roleId,
            int userId,
            int bedId,
            int itemId,
            int serviceDeptId,
            string status,
            int templateId,
            bool ShowIsActive,
            bool showInactiveItems = false)
        {
            MasterDbContext masterDbContext = new MasterDbContext(connString);
            RadiologyDbContext radioDbContext = new RadiologyDbContext(connString);
            AdmissionDbContext adtDbContext = new AdmissionDbContext(connString);
            RbacDbContext rbacDbContext = new RbacDbContext(connString);
            BillingDbContext billingDbContext = new BillingDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

            try
            {
                if (reqType == "departments")
                {
                    List<DepartmentModel> deptList = (from d in masterDbContext.Departments
                                                      select d).ToList();
                    responseData.Status = "OK";
                    responseData.Results = deptList;
                }
                else if (reqType == "membership-types")
                {
                    var membershipTypes = (from type in billingDbContext.MembershipType
                                           select type);
                    responseData.Results = membershipTypes;
                    responseData.Status = "OK";
                }
                else if (reqType == "service-departments")
                {
                    var srvDeptList = (from s in masterDbContext.ServiceDepartments.Include("Department")
                                       select new
                                       {
                                           ServiceDepartmentName = s.ServiceDepartmentName,
                                           ServiceDepartmentShortName = s.ServiceDepartmentShortName,
                                           ServiceDepartmentId = s.ServiceDepartmentId,
                                           DepartmentId = s.DepartmentId,
                                           DepartmentName = s.Department.DepartmentName,
                                           CreatedOn = s.CreatedOn,
                                           CreatedBy = s.CreatedBy,
                                           IntegrationName = s.IntegrationName,
                                           ParentServiceDepartmentId = s.ParentServiceDepartmentId,
                                           IsActive = s.IsActive
                                       }).OrderBy(d => d.DepartmentId).ToList();
                    responseData.Status = "OK";
                    responseData.Results = srvDeptList;
                }
                else if (reqType == "integrationName")
                {
                    List<IntegrationModel> integrationNameList = (from i in masterDbContext.IntegrationName
                                                      select i).ToList();
                    responseData.Status = "OK";
                    responseData.Results = integrationNameList;
                }
                else if (reqType == "rad-imaging-item")
                {
                    var imgItemList = (from i in radioDbContext.ImagingItems.Include("ImagingTypes")
                                       select new
                                       {
                                           ImagingTypeName = i.ImagingTypes.ImagingTypeName,
                                           ImagingTypeId = i.ImagingTypes.ImagingTypeId,
                                           ImagingItemName = i.ImagingItemName,
                                           ImagingItemId = i.ImagingItemId,
                                           ProcedureCode = i.ProcedureCode,
                                           IsActive = i.IsActive,
                                           CreatedOn = i.CreatedOn,
                                           CreatedBy = i.CreatedBy,
                                           TemplateId = i.TemplateId
                                       }).OrderBy(i => i.ImagingTypeId).ToList();
                    responseData.Status = "OK";
                    responseData.Results = imgItemList;
                }
                else if (reqType == "rad-imaging-type")
                {
                    var imgTypeList = radioDbContext.ImagingTypes.ToList();
                    responseData.Status = "OK";
                    responseData.Results = imgTypeList;
                }
                else if (reqType == "rad-report-template")
                {
                    var radReportTemplateList = (from rTemplate in radioDbContext.RadiologyReportTemplate
                                                 select new
                                                 {
                                                     TemplateId = rTemplate.TemplateId,
                                                     ModuleName = rTemplate.ModuleName,
                                                     TemplateCode = rTemplate.TemplateCode,
                                                     TemplateName = rTemplate.TemplateName,
                                                     CreatedBy = rTemplate.CreatedBy,
                                                     FooterNote = rTemplate.FooterNote,
                                                     IsActive = rTemplate.IsActive
                                                 }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = radReportTemplateList;
                }
                else if (reqType == "adt-auto-billing-items")
                {
                    CoreDbContext coreDbContext = new CoreDbContext(connString);
                    var billItems = new BillingItemVM();
                    var autoBillItems = new List<BillingItemVM>();
                    var parameter = coreDbContext.Parameters.Where(a => a.ParameterGroupName == "ADT" && a.ParameterName == "AutoAddBillingItems").FirstOrDefault();
                    if (parameter != null && parameter.ParameterValue != null)
                    {
                        ADTAutoAddItemParameterVM adtParameter = DanpheJSONConvert.DeserializeObject<ADTAutoAddItemParameterVM>(parameter.ParameterValue);

                        //if (adtParameter != null)
                        //{
                        //    if (adtParameter.DoAutoAddBillingItems == true && adtParameter.ItemList.Count > 0)
                        //    {
                        //        var allBillItems = (from bilItem in billingDbContext.BillItemPrice
                        //                            join servDept in billingDbContext.ServiceDepartment on bilItem.ServiceDepartmentId equals servDept.ServiceDepartmentId
                        //                            select new BillingItemVM
                        //                            {
                        //                                ItemId = bilItem.ItemId,
                        //                                ServiceDepartmentId = bilItem.ServiceDepartmentId,
                        //                            }).ToList();

                        //        adtParameter.ItemList.ForEach(autoItem =>
                        //        {
                        //            var billItem = allBillItems.Find(a => a.ServiceDepartmentId == autoItem.ServiceDepartmentId && a.ItemId == autoItem.ItemId);
                        //            if (billItem != null)
                        //            {
                        //                autoBillItems.Add(billItem);
                        //            }
                        //            //billItems.DoAutoAddBedItem = adtParameter.DoAutoAddBedItem;
                        //            //billItems.DoAutoAddBillingItems = adtParameter.DoAutoAddBillingItems;
                        //        });
                        //    }
                        //    adtParameter.ItemDetailList = autoBillItems;
                        //}
                        responseData.Status = "OK";
                        responseData.Results = adtParameter;

                    }
                }
                else if (reqType == "rad-report-template-byid")
                {
                    var radReportTemplate = (from rTemplate in radioDbContext.RadiologyReportTemplate
                                             where rTemplate.TemplateId == templateId
                                             select rTemplate).FirstOrDefault();
                    responseData.Status = "OK";
                    responseData.Results = radReportTemplate;
                }
                else if (reqType == "adt-bed")
                {
                    var bedList = (from i in adtDbContext.Beds.Include("Ward")
                                   select new
                                   {
                                       WardName = i.Ward.WardName,
                                       WardId = i.WardId,
                                       BedCode = i.BedCode,
                                       BedId = i.BedId,
                                       BedNumber = i.BedNumber,
                                       IsActive = i.IsActive,
                                       IsOccupied = i.IsOccupied,
                                       CreatedOn = i.CreatedOn,
                                       CreatedBy = i.CreatedBy
                                   }).OrderBy(i => i.WardId).ThenBy(i => i.BedNumber).ToList();
                    responseData.Status = "OK";
                    responseData.Results = bedList;
                }
                else if (reqType == "adt-bedFeature")
                {
                    //var bedTypeList = adtDbContext.BedFeatures.ToList();
                    var bedTypeList = (from bed in adtDbContext.BedFeatures
                                       join item in adtDbContext.BillItemPrice on bed.BedFeatureId equals item.ItemId
                                       join srv in adtDbContext.ServiceDepartment on item.ServiceDepartmentId equals srv.ServiceDepartmentId
                                       where srv.IntegrationName.ToLower() == "bed charges"
                                       select new
                                       {
                                           BedFeatureId = bed.BedFeatureId,
                                           BedFeatureName = bed.BedFeatureName,
                                           BedFeatureFullName = bed.BedFeatureFullName,
                                           BedPrice = bed.BedPrice,
                                           IsActive = bed.IsActive,
                                           TaxApplicable = item.TaxApplicable
                                       }).OrderBy(e => e.BedFeatureId).ToList();
                    responseData.Status = "OK";
                    responseData.Results = bedTypeList;
                }
                else if (reqType == "adt-map-bedFeatures")
                {
                    var similarBedFeatures = (from bedFeaturesMap in adtDbContext.BedFeaturesMaps
                                              join bedFeatures in adtDbContext.BedFeatures on bedFeaturesMap.BedFeatureId equals bedFeatures.BedFeatureId
                                              where bedFeaturesMap.BedId == bedId
                                              select bedFeaturesMap).Distinct().ToList();

                    responseData.Status = "OK";
                    responseData.Results = similarBedFeatures;
                }
                else if (reqType == "adt-ward")
                {
                    var wardList = adtDbContext.Wards.ToList();
                    responseData.Status = "OK";
                    responseData.Results = wardList;

                }
                else if (reqType == "employee")
                {
                    //updated: Sud-16Aug'17-- to get the fullName of employee, we've to apply ToList() before selecting the properties.
                    // since FullName is 'NotMapped' property i.e: customized property made in server side.
                    var employeeList = (from e in masterDbContext.Employees.Include("Department").Include("EmployeeRole").Include("EmployeeType")
                                        select e).ToList()
                                        .Select(e => new
                                        {
                                            EmployeeId = e.EmployeeId,
                                            Salutation = e.Salutation,
                                            FirstName = e.FirstName,
                                            MiddleName = e.MiddleName,
                                            LastName = e.LastName,
                                            FullName = e.FullName,
                                            DateOfBirth = e.DateOfBirth,
                                            DateOfJoining = e.DateOfJoining,
                                            ContactNumber = e.ContactNumber,
                                            ContactAddress = e.ContactAddress,
                                            Email = e.Email,
                                            Gender = e.Gender,
                                            Extension = e.Extension,
                                            SpeedDial = e.SpeedDial,
                                            OfficeHour = e.OfficeHour,
                                            RoomNo = e.RoomNo,
                                            IsActive = e.IsActive,
                                            MedCertificationNo = e.MedCertificationNo,
                                            Signature = e.Signature,
                                            LongSignature = e.LongSignature,
                                            DepartmentId = e.DepartmentId,
                                            DepartmentName = e.Department != null ? e.Department.DepartmentName : null,
                                            EmployeeRoleId = e.EmployeeRoleId,
                                            EmployeeRoleName = e.EmployeeRole != null ? e.EmployeeRole.EmployeeRoleName : null,
                                            EmployeeTypeId = e.EmployeeTypeId,
                                            EmployeeTypeName = e.EmployeeType != null ? e.EmployeeType.EmployeeTypeName : null,
                                            IsAppointmentApplicable = e.IsAppointmentApplicable,//sud:14June'18
                                            LabSignature = e.LabSignature,//sud:14June'18
                                            CreatedOn = e.CreatedOn,
                                            CreatedBy = e.CreatedBy,
                                            SignatoryImageName = e.SignatoryImageName,
                                            DisplaySequence = e.DisplaySequence
                                        }).OrderBy(e => e.EmployeeRoleId).ToList();
                    responseData.Status = "OK";
                    responseData.Results = employeeList;
                }
                else if(reqType == "signatory-image")
                {
                    var fileName = (from emp in masterDbContext.Employees
                                    where emp.EmployeeId == employeeId
                                    select emp.SignatoryImageName).FirstOrDefault();



                    if(fileName != null)
                    {
                        var path = (from master in masterDbContext.CFGParameters
                                    where master.ParameterGroupName.ToLower() == "common" && master.ParameterName == "SignatureLocationPath"
                                    select master.ParameterValue).FirstOrDefault();

                        string signatoryImagePath = path + fileName;

                        using (Image image = Image.FromFile(signatoryImagePath))
                        {
                            using (MemoryStream m = new MemoryStream())
                            {
                                image.Save(m, image.RawFormat);
                                byte[] imageBytes = m.ToArray();

                                // Convert byte[] to Base64 String
                                string base64String = Convert.ToBase64String(imageBytes);
                                responseData.Results = base64String;
                            }
                        }
                       
                    } else
                    {
                        responseData.Results = null; 
                    }
                    responseData.Status = "OK";
                    //responseData.Results = ;
                }
                else if (reqType == "employee-role")
                {
                    var employeeRoleList = masterDbContext.EmployeeRole.ToList();
                    responseData.Status = "OK";
                    responseData.Results = employeeRoleList;
                }
                else if (reqType == "employee-type")
                {
                    //Yubraj: -- modification --28th March 2019
                    //ShowIsActive has either true or null value
                    //ShowIsActive= true gets all the employeeType with IsActive true and false
                    List<EmployeeTypeModel> employeeTypeList = new List<EmployeeTypeModel>();
                    if (ShowIsActive)
                    {
                        //getting IsActive=true list
                        employeeTypeList = (from empType in masterDbContext.EmployeeType
                                            where empType.IsActive == ShowIsActive
                                            select empType).ToList();
                    }
                    else
                    {
                        //getting all list
                        employeeTypeList = masterDbContext.EmployeeType.ToList();
                    }
                    responseData.Status = "OK";
                    responseData.Results = employeeTypeList;
                }
                else if (reqType == "security-application")
                {
                    var appList = rbacDbContext.Applications.Include("Permissions").OrderBy(p => p.ApplicationName).ToList();
                    responseData.Status = "OK";
                    responseData.Results = appList;
                }
                else if (reqType == "security-route")
                {
                    var routeList = rbacDbContext.Routes.ToList();
                    responseData.Status = "OK";
                    responseData.Results = routeList;
                }
                else if (reqType == "security-permission")
                {
                    var permissionList = (from p in rbacDbContext.Permissions.Include("Application")
                                          select new
                                          {
                                              PermissionId = p.PermissionId,
                                              PermissionName = p.PermissionName,
                                              ApplicationId = p.ApplicationId,
                                              ApplicationName = p.Application.ApplicationName,
                                              CreatedBy = p.CreatedBy,
                                              IsActive = p.IsActive,
                                              CreatedOn = p.CreatedOn,
                                          })
                                          .OrderBy(p => p.ApplicationId).ToList();
                    responseData.Status = "OK";
                    responseData.Results = permissionList;
                }
                else if (reqType == "security-role")
                {
                    var roleList = (from r in rbacDbContext.Roles.Include("Route").Include("Application").Where(r => r.IsSysAdmin == false)
                                    select new
                                    {
                                        RoleId = r.RoleId,
                                        RoleName = r.RoleName,
                                        RolePriority = r.RolePriority,
                                        RoleDescription = r.RoleDescription,
                                        ApplicationId = r.ApplicationId,
                                        ApplicationName = r.Application.ApplicationName,
                                        DefaultRouteId = r.DefaultRouteId,
                                        DefaultRouteName = r.Route.DisplayName,
                                        CreatedOn = r.CreatedOn,
                                        CreatedBy = r.CreatedBy
                                    }).OrderBy(r => r.ApplicationId).ToList();
                    responseData.Status = "OK";
                    responseData.Results = roleList;
                }
                else if (reqType == "security-user")
                {


                    var allUsrs = (from r in rbacDbContext.Users.Include("Employee")
                                   select r).ToList();
                    //we cannot perform Linq to SQL for derived properties (eg: Employee.FullName) so doing that in-Memory.
                    var retUserList = (from r in allUsrs
                                       join dept in masterDbContext.Departments on r.Employee.DepartmentId equals dept.DepartmentId
                                       select new
                                       {
                                           UserId = r.UserId,
                                           EmployeeId = r.EmployeeId,
                                           UserName = r.UserName,
                                           Email = r.Email,
                                           EmployeeName = r.Employee.FullName,
                                           CreatedOn = r.CreatedOn,
                                           CreatedBy = r.CreatedBy,
                                           IsActive = r.IsActive,
                                           // Password=r.Password,
                                           // Password = RBAC.DecryptPassword(r.Password),
                                           NeedsPasswordUpdate = r.NeedsPasswordUpdate,
                                           DepartmentName = dept.DepartmentName

                                       }).ToList();

                    responseData.Status = "OK";
                    responseData.Results = retUserList;
                }
                else if (reqType == "security-rolepermission")
                {
                    var rolePermissionList = (from r in rbacDbContext.RolePermissionMaps.Include("Role").Include("Permission").Include("Application")
                                              where (r.RoleId == roleId)
                                              select new
                                              {
                                                  RolePermissionMapId = r.RolePermissionMapId,
                                                  RoleId = r.RoleId,
                                                  PermissionId = r.PermissionId,
                                                  RoleName = r.Role.RoleName,
                                                  PermissionName = r.Permission.PermissionName,
                                                  CreatedOn = r.CreatedOn,
                                                  CreatedBy = r.CreatedBy,
                                                  ApplicationId = r.Permission.ApplicationId,
                                                  ApplicationName = r.Permission.Application.ApplicationName,
                                                  IsActive = r.IsActive
                                              }).OrderBy(r => r.ApplicationId).ToList();
                    responseData.Status = "OK";
                    responseData.Results = rolePermissionList;
                }
                else if (reqType == "security-userrole")
                {
                    var rolePermissionList = (from r in rbacDbContext.UserRoleMaps.Include("User").Include("Role")
                                              where (r.UserId == userId)
                                              select new
                                              {
                                                  UserRoleMapId = r.UserRoleMapId,
                                                  RoleId = r.RoleId,
                                                  UserId = r.UserId,
                                                  UserName = r.User.UserName,
                                                  RoleName = r.Role.RoleName,
                                                  CreatedOn = r.CreatedOn,
                                                  CreatedBy = r.CreatedBy,
                                                  IsActive = r.IsActive
                                              }).OrderBy(r => r.RoleId).ToList();
                    responseData.Status = "OK";
                    responseData.Results = rolePermissionList;
                }
                //GET: Price Change History List of Bill Item by ItemId and ServiceDepartmentId
                else if (reqType != null && reqType == "billItemPriceChangeHistory")
                {
                    //Get all Users list
                    var allUsers = rbacDbContext.Users.ToList();
                    //Union BillItemPrice table with BillItemPrice_History table and get price changed history
                    var billItemList = (
                        from billItemPriceHistory in billingDbContext.BillItemPriceHistory
                        where billItemPriceHistory.ItemId == itemId && billItemPriceHistory.ServiceDepartmentId == serviceDeptId
                        select new
                        {
                            price = billItemPriceHistory.Price,
                            createdOn = billItemPriceHistory.StartDate,
                            createdBy = billItemPriceHistory.CreatedBy
                        }).ToList()
                                        .Union(from billItemPrice in billingDbContext.BillItemPrice
                                               where billItemPrice.ItemId == itemId && billItemPrice.ServiceDepartmentId == serviceDeptId
                                               select new
                                               {
                                                   price = billItemPrice.Price,
                                                   createdOn = billItemPrice.CreatedOn,
                                                   createdBy = billItemPrice.CreatedBy
                                               }).OrderByDescending(b => b.createdOn).ToList();

                    //Get list of final BillItemPrice change history with username by using join               
                    var billItempriceChangeHistoryList = (from usrs in allUsers
                                                          join billItems in billItemList on usrs.EmployeeId equals billItems.createdBy
                                                          select new
                                                          {
                                                              price = billItems.price,
                                                              createdOn = billItems.createdOn,
                                                              userName = usrs.UserName
                                                          }).OrderByDescending(c => c.createdOn).ToList();
                    //check list is empty or not
                    if (billItempriceChangeHistoryList != null)
                    {
                        responseData.Status = "OK";
                        responseData.Results = billItempriceChangeHistoryList;
                    }
                    else
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "Couldn't find your requested Item price changed history.";
                    }
                }
                if (reqType == "billing-itemList")
                {
                    var itemList = (from item in billingDbContext.BillItemPrice
                                    join srv in billingDbContext.ServiceDepartment on item.ServiceDepartmentId equals srv.ServiceDepartmentId
                                    select new
                                    {
                                        BillItemPriceId = item.BillItemPriceId,
                                        ServiceDepartmentId = srv.ServiceDepartmentId,
                                        ServiceDepartmentName = srv.ServiceDepartmentName,
                                        ServiceDepartmentShortName = srv.ServiceDepartmentShortName,
                                        ItemId = item.ItemId,
                                        ItemName = item.ItemName,
                                        ProcedureCode = item.ProcedureCode,
                                        Price = item.Price,
                                        TaxApplicable = item.TaxApplicable,
                                        DiscountApplicable = item.DiscountApplicable,
                                        Description = item.Description,
                                        CreatedOn = item.CreatedOn,
                                        CreatedBy = item.CreatedBy,
                                        IsActive = item.IsActive,
                                        DisplaySeq = item.DisplaySeq,
                                        IsDoctorMandatory = item.IsDoctorMandatory,
                                        ItemCode = item.ItemCode,
                                        isFractionApplicable = item.IsFractionApplicable,
                                        InsuranceApplicable = item.InsuranceApplicable,
                                        GovtInsurancePrice = item.GovtInsurancePrice,
                                        IsInsurancePackage = item.IsInsurancePackage,
                                        Doctor = (from doc in billingDbContext.Employee.DefaultIfEmpty()
                                                  where doc.IsAppointmentApplicable == true && doc.EmployeeId == item.ItemId && srv.ServiceDepartmentName == "OPD"
                                                  && srv.ServiceDepartmentId == item.ServiceDepartmentId
                                                  select new
                                                  {
                                                      //Temporary logic, correct it later on... 
                                                      DoctorId = doc != null ? doc.EmployeeId : 0,
                                                      DoctorName = doc != null ? doc.FirstName + " " + (string.IsNullOrEmpty(doc.MiddleName) ? doc.MiddleName + " " : "") + doc.LastName : "",
                                                  }).FirstOrDefault(),
                                        IsNormalPriceApplicable = item.IsNormalPriceApplicable, //sud:19Apr'19-For Price Categories
                                        IsEHSPriceApplicable = item.IsEHSPriceApplicable, //sud:19Apr'19-For Price Categories
                                        IsForeignerPriceApplicable = item.IsForeignerPriceApplicable, //sud:19Apr'19-For Price Categories
                                        IsSAARCPriceApplicable = item.IsSAARCPriceApplicable, //sud:19Apr'19-For Price Categories
                                        IsOT = item.IsOT,
                                        IsProc = item.IsProc,
                                        Category = item.Category,
                                        EHSPrice = item.EHSPrice != null ? item.EHSPrice : 0, //sud:19Apr'19-For Price Categories
                                        SAARCCitizenPrice = item.SAARCCitizenPrice != null ? item.SAARCCitizenPrice : 0, //sud:19Apr'19-For Price Categories
                                        ForeignerPrice = item.ForeignerPrice != null ? item.ForeignerPrice : 0, //sud:19Apr'19-For Price Categories



                                    }).ToList();

                    // bool showInactiveItems = false;

                    var filteredItems = new object();

                    if (showInactiveItems)
                    {
                        filteredItems = itemList.Where(itm => itm.IsActive == true).OrderBy(itm => itm.DisplaySeq);
                    }
                    else
                    {
                        filteredItems = itemList.OrderBy(itm => itm.DisplaySeq);
                    }

                    responseData.Status = "OK";
                    responseData.Results = filteredItems;
                }

                else if (reqType == "billing-packageList")
                {
                    List<BillingPackageModel> packageList = billingDbContext.BillingPackages.ToList();
                    if (packageList.Count > 0)
                    {
                        foreach (var package in packageList)
                        {
                            package.BillingItemsXML = this.ConvertXMLToJson(package.BillingItemsXML);
                        }
                    }
                    responseData.Status = "OK";
                    responseData.Results = packageList;
                }
                else if (reqType == "billing-items-by-servdeptname" && servDeptName.Length > 0)
                {
                    var itemList = (from item in billingDbContext.BillItemPrice
                                    join srv in billingDbContext.ServiceDepartment on item.ServiceDepartmentId equals srv.ServiceDepartmentId
                                    where srv.ServiceDepartmentName == servDeptName
                                    select new
                                    {
                                        ServiceDepartmentId = item.ServiceDepartmentId,
                                        ItemName = item.ItemName,
                                        ItemNamePrice = item.ItemName + " " + item.Price.ToString(),
                                        Price = item.Price
                                    }).Distinct().ToList();
                    responseData.Status = "OK";
                    responseData.Results = itemList;
                }
                else if (reqType == "billing-items-by-servdeptitemid" && itemId > 0)
                {
                    var bilItemPriceDetail = (from item in billingDbContext.BillItemPrice
                                              join srv in billingDbContext.ServiceDepartment
                                              on item.ServiceDepartmentId equals srv.ServiceDepartmentId
                                              where srv.ServiceDepartmentName == servDeptName && item.ItemId == itemId
                                              select new
                                              {
                                                  item.BillItemPriceId,
                                                  item.CreatedBy,
                                                  item.CreatedOn,
                                                  item.Description,
                                                  item.DiscountApplicable,
                                                  item.TaxApplicable,
                                                  item.IsActive,
                                                  item.ItemId,
                                                  item.ItemName,
                                                  item.ModifiedBy,
                                                  item.ModifiedOn,
                                                  item.Price,
                                                  item.ProcedureCode,
                                                  item.ServiceDepartmentId,
                                                  item.SAARCCitizenPrice,
                                                  item.EHSPrice,
                                                  item.ForeignerPrice,
                                                  item.IsSAARCPriceApplicable,
                                                  item.IsForeignerPriceApplicable,
                                                  item.IsEHSPriceApplicable,
                                                  ItemNamePrice = item.ItemName + " " + item.Price.ToString()
                                              }).FirstOrDefault();
                    responseData.Status = "OK";
                    responseData.Results = bilItemPriceDetail;   
                }
                else if (reqType == "countries")
                {
                    List<CountryModel> countryList = (from d in masterDbContext.Country
                                                      select d).ToList();
                    responseData.Status = "OK";
                    responseData.Results = countryList;
                }
                else if (reqType == "subdivisions")
                {
                    List<CountrySubDivisionModel> subDivisionList = (from subd in masterDbContext.CountrySubDivision
                                                                     select subd).ToList();
                    responseData.Status = "OK";
                    responseData.Results = subDivisionList;
                }
                else if (reqType == "reactions")
                {
                    List<ReactionModel> reactioinList = (from rxn in masterDbContext.Reactions
                                                         select rxn).ToList();
                    responseData.Status = "OK";
                    responseData.Results = reactioinList;
                }
                else if (reqType == "cfgparameters")
                {
                    List<CfgParameterModel> parameterList = (from param in masterDbContext.CFGParameters
                                                             select param).ToList();
                    responseData.Status = "OK";
                    responseData.Results = parameterList;
                }
                else if (reqType == "get-credit-organization") //--yubraj 19th April 2019
                {
                    var creditOrganization = billingDbContext.CreditOrganization.ToList();
                    responseData.Status = "OK";
                    responseData.Results = creditOrganization;
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }


        // POST api/values
        [HttpPost]
        public string Post()
        {
            //if reqtype=employee, then use masterdbcontext.employee.add  and so on for others.

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();//type 'object' since we have variable return types
            responseData.Status = "OK";//by default status would be OK, hence assigning at the top
            MasterDbContext masterDbContext = new MasterDbContext(connString);
            RadiologyDbContext radioDbContext = new RadiologyDbContext(connString);
            AdmissionDbContext adtDbContext = new AdmissionDbContext(connString);
            RbacDbContext rbacDbContext = new RbacDbContext(connString);
            BillingDbContext billingDbContext = new BillingDbContext(connString);
            LabDbContext labDbContext = new LabDbContext(connString);
            CoreDbContext coreDbContext = new CoreDbContext(connString);

            try
            {
                string serviceDepartment = this.ReadQueryStringData("serviceDepartment");
                int itemId = ToInt(this.ReadQueryStringData("itemId"));
                string reqType = this.ReadQueryStringData("reqType");
                string str = this.ReadPostData();
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

                if (reqType == "employee")
                {
                    EmployeeModel emp = DanpheJSONConvert.DeserializeObject<EmployeeModel>(str);                   

                    using (var dbTransaction = masterDbContext.Database.BeginTransaction())
                    {
                        try{                            
                            masterDbContext.Employees.Add(emp);
                            masterDbContext.SaveChanges();

                            if(emp.SignatoryImageBase64 != null)
                            {
                                UploadLabSignatoryImage(masterDbContext, emp);
                            }
                            dbTransaction.Commit();
                            responseData.Results = emp;
                            responseData.Status = "OK";
                        }
                        catch(Exception ex)
                        {
                            dbTransaction.Rollback();
                            responseData.Status = "Failed";
                            responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                        }
                    }


                    

                    

                }
                else if (reqType == "employee-role")
                {
                    EmployeeRoleModel empRole = DanpheJSONConvert.DeserializeObject<EmployeeRoleModel>(str);
                    masterDbContext.EmployeeRole.Add(empRole);

                    masterDbContext.SaveChanges();
                    responseData.Results = empRole;
                    responseData.Status = "OK";
                }
                else if (reqType == "employee-type")
                {
                    EmployeeTypeModel empType = DanpheJSONConvert.DeserializeObject<EmployeeTypeModel>(str);
                    masterDbContext.EmployeeType.Add(empType);

                    masterDbContext.SaveChanges();
                    responseData.Results = empType;
                    responseData.Status = "OK";
                }
                else if (reqType == "department")
                {
                    DepartmentModel deptModel = DanpheJSONConvert.DeserializeObject<DepartmentModel>(str);
                    deptModel.CreatedOn = System.DateTime.Now;
                    masterDbContext.Departments.Add(deptModel);
                    masterDbContext.SaveChanges();
                    responseData.Results = deptModel;
                    responseData.Status = "OK";
                }

                else if (reqType == "servicedepartment")
                {
                    ServiceDepartmentModel servdeptModel = DanpheJSONConvert.DeserializeObject<ServiceDepartmentModel>(str);
                    servdeptModel.CreatedOn = System.DateTime.Now;
                    if(servdeptModel.IntegrationName == "None")
                    {
                        servdeptModel.IntegrationName = null;
                    }
                    masterDbContext.ServiceDepartments.Add(servdeptModel);
                    masterDbContext.SaveChanges();
                    responseData.Results = servdeptModel;
                    responseData.Status = "OK";
                }

                else if (reqType == "country")
                {
                    CountryModel countryModel = DanpheJSONConvert.DeserializeObject<CountryModel>(str);
                    countryModel.CreatedOn = System.DateTime.Now;
                    masterDbContext.Country.Add(countryModel);
                    masterDbContext.SaveChanges();
                    responseData.Results = countryModel;
                    responseData.Status = "OK";
                }

                else if (reqType == "subdivision")
                {
                    CountrySubDivisionModel subDivisionModel = DanpheJSONConvert.DeserializeObject<CountrySubDivisionModel>(str);
                    subDivisionModel.CreatedOn = System.DateTime.Now;
                    masterDbContext.CountrySubDivision.Add(subDivisionModel);
                    masterDbContext.SaveChanges();
                    responseData.Results = subDivisionModel;
                    responseData.Status = "OK";
                }

                else if (reqType == "reaction")
                {
                    ReactionModel rxnModel = DanpheJSONConvert.DeserializeObject<ReactionModel>(str);
                    rxnModel.CreatedOn = System.DateTime.Now;

                    bool rxnExists = masterDbContext.Reactions.Any((rxn => rxn.ReactionName.Equals(rxnModel.ReactionName) || rxn.ReactionCode.Equals(rxnModel.ReactionCode)));

                    if (rxnExists)
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "Rxn with Duplicate Name or Code cannot be Added";
                    }
                    else
                    {
                        masterDbContext.Reactions.Add(rxnModel);
                        masterDbContext.SaveChanges();
                        responseData.Results = rxnModel;
                        responseData.Status = "OK";
                    }
                }
                else if (reqType == "post-parameter-value")
                {
                    ParameterModel parameter = DanpheJSONConvert.DeserializeObject<ParameterModel>(str);
                    parameter.ParameterGroupName = "ADT";
                    parameter.ParameterName = "AutoAddBillingItems";
                    parameter.ParameterValue = @"{""DoAutoAddBillingItems"":false,""DoAutoAddBedItem"":false,""ItemList"":[]}";
                    parameter.ValueDataType = "JSON";
                    parameter.Description = "These billing items are added when the patient gets admitted.";

                    coreDbContext.Parameters.Add(parameter);
                    coreDbContext.SaveChanges();
                    responseData.Results = parameter;
                    responseData.Status = "OK";

                }

                else if (reqType == "rad-imaging-item")
                {
                    RadiologyImagingItemModel radImgItem = DanpheJSONConvert.DeserializeObject<RadiologyImagingItemModel>(str);
                    //ServiceDepartmentModel servDepartment = new ServiceDepartmentModel();
                    //BillItemPrice billItem = new BillItemPrice();


                    radImgItem.CreatedOn = DateTime.Now;
                    radioDbContext.ImagingItems.Add(radImgItem);
                    radioDbContext.SaveChanges();
                    responseData.Results = radImgItem;
                    responseData.Status = "OK";
                }
                else if (reqType == "rad-imaging-type")
                {
                    RadiologyImagingTypeModel radImgType = DanpheJSONConvert.DeserializeObject<RadiologyImagingTypeModel>(str);
                    radImgType.CreatedOn = DateTime.Now;
                    radioDbContext.ImagingTypes.Add(radImgType);
                    radioDbContext.SaveChanges();
                    responseData.Results = radImgType;
                    responseData.Status = "OK";
                }
                else if (reqType == "rad-report-template")
                {
                    RadiologyReportTemplateModel clientRadRptTemplateData = DanpheJSONConvert.DeserializeObject<RadiologyReportTemplateModel>(str);
                    clientRadRptTemplateData.CreatedOn = System.DateTime.Now;
                    radioDbContext.RadiologyReportTemplate.Add(clientRadRptTemplateData);
                    radioDbContext.SaveChanges();
                    responseData.Results = clientRadRptTemplateData;
                    responseData.Status = "OK";
                }
                else if (reqType == "adt-bed")
                {
                    BedModel bed = DanpheJSONConvert.DeserializeObject<BedModel>(str);
                    List<BedModel> BedList = new List<BedModel>();
                    string code = bed.BedCode;

                    for (int i = bed.BedNumFrm; i <= bed.BedNumTo; i++)
                    {
                        BedModel bedToAdd = new BedModel();
                        bed.CreatedOn = DateTime.Now;
                        bed.BedCode = code + '-' + i;

                        bedToAdd.BedNumber = i;
                        bedToAdd.BedCode = bed.BedCode;
                        bedToAdd.WardId = bed.WardId;
                        bedToAdd.Ward = bed.Ward;
                        bedToAdd.IsActive = bed.IsActive;
                        bedToAdd.CreatedBy = bed.CreatedBy;
                        bedToAdd.CreatedOn = bed.CreatedOn;
                        bedToAdd.IsOccupied = bed.IsOccupied;
                        adtDbContext.Beds.Add(bedToAdd);
                        adtDbContext.SaveChanges();
                        BedList.Add(bedToAdd);
                    }
                    responseData.Results = BedList;
                    responseData.Status = "OK";
                }

                else if (reqType == "adt-bedFeature")
                {
                    using (var dbContextTransaction = adtDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            BedFeature bedFeature = DanpheJSONConvert.DeserializeObject<BedFeature>(str);
                            BillItemPrice billItemPrice = new BillItemPrice();

                            var departmentModel = coreDbContext.ServiceDepartments.Where(d => d.IntegrationName == "Bed Charges").FirstOrDefault();

                            bedFeature.CreatedBy = currentUser.EmployeeId;
                            bedFeature.CreatedOn = DateTime.Now;
                            adtDbContext.BedFeatures.Add(bedFeature);
                            adtDbContext.SaveChanges();
                            responseData.Results = bedFeature;

                            adtDbContext.BedFeatures.Attach(bedFeature);

                            billItemPrice.ItemName = bedFeature.BedFeatureName;
                            billItemPrice.ServiceDepartmentId = departmentModel.ServiceDepartmentId;
                            billItemPrice.Price = 0;
                            billItemPrice.ItemId = Convert.ToInt32(bedFeature.BedFeatureId);
                            billItemPrice.TaxApplicable = bedFeature.TaxApplicable;
                            billItemPrice.DiscountApplicable = true;
                            billItemPrice.CreatedBy = currentUser.EmployeeId;
                            billItemPrice.CreatedOn = System.DateTime.Now;
                            billItemPrice.IsActive = true;
                            billItemPrice.IsDoctorMandatory = false;


                            billingDbContext.BillItemPrice.Add(billItemPrice);
                            billingDbContext.SaveChanges();


                            adtDbContext.SaveChanges();
                            dbContextTransaction.Commit();
                            responseData.Results = bedFeature;
                        }
                        catch (Exception ex)
                        {
                            dbContextTransaction.Rollback();
                            throw (ex);
                        }
                        responseData.Status = "OK";
                    }
                }
                else if (reqType == "adt-map-bedFeatures")
                {

                    List<BedFeaturesMap> bedFeaturesMapList = DanpheJSONConvert.DeserializeObject<List<BedFeaturesMap>>(str);
                    int startId = bedFeaturesMapList[0].BedId;
                    int range = bedFeaturesMapList[0].len;

                    for (int i = startId; i < (startId + range); i++)
                    {
                        bedFeaturesMapList.ForEach(bedFeature =>
                        {
                            bedFeature.BedId = i;
                            bedFeature.CreatedOn = DateTime.Now;
                            adtDbContext.BedFeaturesMaps.Add(bedFeature);
                        });
                        adtDbContext.SaveChanges();
                    }


                    responseData.Status = "OK";
                }


                else if (reqType == "adt-ward")
                {
                    WardModel ward = DanpheJSONConvert.DeserializeObject<WardModel>(str);
                    ward.CreatedOn = DateTime.Now;
                    adtDbContext.Wards.Add(ward);
                    adtDbContext.SaveChanges();
                    responseData.Results = ward;
                    responseData.Status = "OK";
                }
                else if (reqType == "security-user")
                {
                    RbacUser user = DanpheJSONConvert.DeserializeObject<RbacUser>(str);
                    /// We  are Encrepting Current Enter Password of USer And Storing Encrepted Password In RBAC_User Table  ----Compulsory (IMP)                   
                    user.Password = RBAC.EncryptPassword(user.Password);
                    rbacDbContext.Users.Add(user);
                    rbacDbContext.SaveChanges();

                    var currEmployee = rbacDbContext.Employees.Where(e => e.EmployeeId == user.EmployeeId).FirstOrDefault();


                    var retUser = new
                    {
                        UserId = user.UserId,
                        EmployeeId = user.EmployeeId,
                        UserName = user.UserName,
                        Email = user.Email,
                        EmployeeName = currEmployee != null ? currEmployee.FullName : null,//to handle nullReference Exception.
                        CreatedOn = user.CreatedOn,
                        CreatedBy = user.CreatedBy,
                        IsActive = user.IsActive
                    };
                    responseData.Results = retUser;


                    responseData.Status = "OK";

                }

                else if (reqType == "security-role")
                {
                    RbacRole role = DanpheJSONConvert.DeserializeObject<RbacRole>(str);
                    rbacDbContext.Roles.Add(role);
                    rbacDbContext.SaveChanges();
                    responseData.Results = role;
                    responseData.Status = "OK";
                }
                else if (reqType == "security-rolePermission")
                {
                    List<RolePermissionMap> rolePermissions = DanpheJSONConvert.DeserializeObject<List<RolePermissionMap>>(str);
                    rolePermissions.ForEach(roleP =>
                    {
                        rbacDbContext.RolePermissionMaps.Add(roleP);
                    });

                    rbacDbContext.SaveChanges();
                    responseData.Status = "OK";
                }
                else if (reqType == "security-userRole")
                {
                    List<UserRoleMap> rolePermissions = DanpheJSONConvert.DeserializeObject<List<UserRoleMap>>(str);
                    rolePermissions.ForEach(userRole =>
                    {
                        rbacDbContext.UserRoleMaps.Add(userRole);
                    });

                    rbacDbContext.SaveChanges();
                    responseData.Status = "OK";
                }
                else if (reqType == "billing-item")
                {

                    BillItemPrice item = DanpheJSONConvert.DeserializeObject<BillItemPrice>(str);

                    //getting max item id [we dont have item id other than lab and radiology] 
                    if (item.ItemId == 0)  //yubraj 1st Oct '18
                    {
                        int maxItemId = 0;
                        var allSrvDeptItems = billingDbContext.BillItemPrice.Where(s => s.ServiceDepartmentId == item.ServiceDepartmentId).ToList();
                        if (allSrvDeptItems != null && allSrvDeptItems.Count > 0)
                        {
                            maxItemId = allSrvDeptItems.Max(t => t.ItemId);
                        }

                        item.ItemId = maxItemId + 1;
                        item.ProcedureCode = item.ItemId.ToString();
                    }

                    billingDbContext.BillItemPrice.Add(item);
                    billingDbContext.SaveChanges();
                    responseData.Results = item;
                    responseData.Status = "OK";
                }
                else if (reqType == "billing-package")
                {
                    BillingPackageModel package = DanpheJSONConvert.DeserializeObject<BillingPackageModel>(str);
                    XmlDocument xdoc = JsonConvert.DeserializeXmlNode("{\"Items\":" + package.BillingItemsXML + "}", "root");
                    package.BillingItemsXML = xdoc.InnerXml;
                    billingDbContext.BillingPackages.Add(package);
                    billingDbContext.SaveChanges();
                    package.BillingItemsXML = ConvertXMLToJson(package.BillingItemsXML);
                    responseData.Results = package;
                    responseData.Status = "OK";
                }
                else if (reqType == "lab-item")
                {
                    LabTestModel labItem = DanpheJSONConvert.DeserializeObject<LabTestModel>(str);

                    using (var dbContextTransaction = labDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            labItem.CreatedOn = DateTime.Now;
                            //set default reporttemplateid if its not provided from client-side.
                            if (!labItem.ReportTemplateId.HasValue)
                            {
                                var defTemplate = labDbContext.LabReportTemplates
                                    .Where(rep => rep.IsDefault.HasValue && rep.IsDefault.Value).FirstOrDefault();
                                if (defTemplate != null)
                                {
                                    labItem.ReportTemplateId = defTemplate.ReportTemplateID;
                                }
                            }

                            //LabTestJSONComponentModel LabTestComponent = labItem.LabTestComponentsJSON[0];
                            //LabTestComponentMapModel ComponentMap = labItem.LabTestComponentMap[0];

                            //make Lab test code and procedure code here after savechanges()
                            labDbContext.LabTests.Add(labItem);
                            labDbContext.SaveChanges();
                            labItem.LabTestCode = "L-" + labItem.LabTestId.ToString("D6");//make LabTest code with 0 leading 
                            labItem.ProcedureCode = "LAB-" + labItem.LabTestId.ToString("D6");//making Procedure code with 0 leading vaues                                        
                            labDbContext.SaveChanges();

                            //labDbContext.LabTestComponents.Add(LabTestComponent);
                            //labDbContext.SaveChanges();

                            //ComponentMap.ComponentId = LabTestComponent.ComponentId;
                            //ComponentMap.LabTestId = labItem.LabTestId;


                            //labDbContext.LabTestComponentMap.Add(ComponentMap);
                            //labDbContext.SaveChanges();

                            dbContextTransaction.Commit();

                            responseData.Results = labItem;
                            responseData.Status = "OK";
                        }
                        catch (Exception ex)
                        {
                            dbContextTransaction.Rollback();
                            throw ex;
                        }
                    }
                }

                else if (reqType == "post-credit-organization")
                {
                    CreditOrganizationModel org = DanpheJSONConvert.DeserializeObject<CreditOrganizationModel>(str);
                    billingDbContext.CreditOrganization.Add(org);

                    billingDbContext.SaveChanges();
                    responseData.Results = org;
                    responseData.Status = "OK";
                }

                else if(reqType == "post-membership")
                {
                    MembershipTypeModel mem = DanpheJSONConvert.DeserializeObject<MembershipTypeModel>(str);
                    mem.CreatedBy = currentUser.EmployeeId;
                    mem.CreatedOn = DateTime.Now;
                    billingDbContext.MembershipType.Add(mem);

                    billingDbContext.SaveChanges();
                    responseData.Results = mem;
                    responseData.Status = "OK";
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();

            }


            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        // PUT api/values/5
        [HttpPut]
        public string Put()
        {
            string reqType = this.ReadQueryStringData("reqType");
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            string str = this.ReadPostData();
            MasterDbContext masterDBContext = new MasterDbContext(connString);
            AdmissionDbContext adtDbContext = new AdmissionDbContext(connString);
            RbacDbContext rbacDbContext = new RbacDbContext(connString);
            BillingDbContext billingDbContext = new BillingDbContext(connString);
            RadiologyDbContext radioDbContext = new RadiologyDbContext(connString);
            CoreDbContext coreDbContext = new CoreDbContext(connString);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

            try
            {
                if (!String.IsNullOrEmpty(str))
                {
                    if (reqType == "department")
                    {
                        DepartmentModel clientDept = DanpheJSONConvert.DeserializeObject<DepartmentModel>(str);
                        masterDBContext.Departments.Attach(clientDept);
                        masterDBContext.Entry(clientDept).State = EntityState.Modified;
                        masterDBContext.Entry(clientDept).Property(x => x.CreatedOn).IsModified = false;
                        masterDBContext.Entry(clientDept).Property(x => x.CreatedBy).IsModified = false;
                        clientDept.ModifiedOn = System.DateTime.Now;
                        masterDBContext.SaveChanges();
                        responseData.Results = clientDept;
                        responseData.Status = "OK";
                    }
                    else if (reqType == "country")
                    {
                        CountryModel countryInfo = DanpheJSONConvert.DeserializeObject<CountryModel>(str);
                        masterDBContext.Country.Attach(countryInfo);
                        masterDBContext.Entry(countryInfo).State = EntityState.Modified;
                        masterDBContext.Entry(countryInfo).Property(x => x.CreatedOn).IsModified = false;
                        masterDBContext.Entry(countryInfo).Property(x => x.CreatedBy).IsModified = false;
                        countryInfo.ModifiedOn = System.DateTime.Now;
                        masterDBContext.SaveChanges();
                        responseData.Results = countryInfo;
                        responseData.Status = "OK";
                    }
                    else if (reqType == "subdivision")
                    {
                        CountrySubDivisionModel subdivInfo = DanpheJSONConvert.DeserializeObject<CountrySubDivisionModel>(str);
                        masterDBContext.CountrySubDivision.Attach(subdivInfo);
                        masterDBContext.Entry(subdivInfo).State = EntityState.Modified;
                        masterDBContext.Entry(subdivInfo).Property(x => x.CreatedOn).IsModified = false;
                        masterDBContext.Entry(subdivInfo).Property(x => x.CreatedBy).IsModified = false;
                        subdivInfo.ModifiedOn = System.DateTime.Now;
                        masterDBContext.SaveChanges();
                        responseData.Results = subdivInfo;
                        responseData.Status = "OK";
                    }
                    else if (reqType == "reaction")
                    {
                        ReactionModel rxnInfo = DanpheJSONConvert.DeserializeObject<ReactionModel>(str);
                        bool rxnExists = masterDBContext.Reactions.Any(rxn =>
                                                        (rxn.ReactionName.Equals(rxnInfo.ReactionName) || rxn.ReactionCode.Equals(rxnInfo.ReactionCode))
                                                        && !rxn.ReactionId.Equals(rxnInfo.ReactionId));

                        if (!rxnExists)
                        {
                            masterDBContext.Reactions.Attach(rxnInfo);
                            masterDBContext.Entry(rxnInfo).State = EntityState.Modified;
                            masterDBContext.Entry(rxnInfo).Property(x => x.CreatedOn).IsModified = false;
                            masterDBContext.Entry(rxnInfo).Property(x => x.CreatedBy).IsModified = false;
                            rxnInfo.ModifiedOn = System.DateTime.Now;
                            masterDBContext.SaveChanges();
                            responseData.Results = rxnInfo;
                            responseData.Status = "OK";
                        }
                        else
                        {
                            responseData.Status = "Failed";
                            responseData.ErrorMessage = "Rxn with Duplicate Name or Code cannot be Added";
                        }
                    }
                    else if (reqType == "service-department")
                    {
                        //ServiceDepartmentModel clientServDept = DanpheJSONConvert.DeserializeObject<ServiceDepartmentModel>(str);
                        //clientServDept.ModifiedOn = System.DateTime.Now;
                        //masterDBContext.UpdateGraph(clientServDept);
                        //masterDBContext.SaveChanges();
                        //responseData.Results = clientServDept;
                        //responseData.Status = "OK";

                        ////Correct implementation--2lines of code extra for each update statement..
                        ////we don't want to update the CreatedOn property in PUT, so excluding them.
                        ServiceDepartmentModel clientServDept = DanpheJSONConvert.DeserializeObject<ServiceDepartmentModel>(str);
                        if(clientServDept.IntegrationName == "None")
                        {
                            clientServDept.IntegrationName = null;
                        }
                        masterDBContext.ServiceDepartments.Attach(clientServDept);
                        masterDBContext.Entry(clientServDept).State = EntityState.Modified;
                        masterDBContext.Entry(clientServDept).Property(x => x.CreatedOn).IsModified = false;
                        masterDBContext.Entry(clientServDept).Property(x => x.CreatedBy).IsModified = false;
                        clientServDept.ModifiedOn = System.DateTime.Now;
                        masterDBContext.SaveChanges();
                        responseData.Results = clientServDept;
                        responseData.Status = "OK";
                    }
                    else if (reqType == "rad-imaging-type")
                    {

                        RadiologyImagingTypeModel clientImgType = DanpheJSONConvert.DeserializeObject<RadiologyImagingTypeModel>(str);
                        masterDBContext.ImagingTypes.Attach(clientImgType);
                        masterDBContext.Entry(clientImgType).State = EntityState.Modified;
                        masterDBContext.Entry(clientImgType).Property(x => x.CreatedOn).IsModified = false;
                        masterDBContext.Entry(clientImgType).Property(x => x.CreatedBy).IsModified = false;
                        clientImgType.ModifiedOn = System.DateTime.Now;
                        masterDBContext.SaveChanges();
                        responseData.Results = clientImgType;
                        responseData.Status = "OK";
                    }
                    else if (reqType == "rad-imaging-item")
                    {
                        RadiologyImagingItemModel clientImgItem = DanpheJSONConvert.DeserializeObject<RadiologyImagingItemModel>(str);
                        masterDBContext.ImagingItems.Attach(clientImgItem);
                        masterDBContext.Entry(clientImgItem).State = EntityState.Modified;
                        masterDBContext.Entry(clientImgItem).Property(x => x.CreatedOn).IsModified = false;
                        masterDBContext.Entry(clientImgItem).Property(x => x.CreatedBy).IsModified = false;
                        masterDBContext.Entry(clientImgItem).Property(x => x.TemplateId).IsModified = true;
                        clientImgItem.ModifiedOn = System.DateTime.Now;
                        masterDBContext.SaveChanges();
                        responseData.Results = clientImgItem;
                        responseData.Status = "OK";
                    }
                    else if (reqType == "rad-report-template")
                    {
                        RadiologyReportTemplateModel clientRadRptTemplateData = DanpheJSONConvert.DeserializeObject<RadiologyReportTemplateModel>(str);
                        radioDbContext.RadiologyReportTemplate.Attach(clientRadRptTemplateData);
                        radioDbContext.Entry(clientRadRptTemplateData).State = EntityState.Modified;
                        radioDbContext.Entry(clientRadRptTemplateData).Property(x => x.CreatedOn).IsModified = false;
                        radioDbContext.Entry(clientRadRptTemplateData).Property(x => x.CreatedBy).IsModified = false;
                        clientRadRptTemplateData.ModifiedOn = System.DateTime.Now;
                        radioDbContext.SaveChanges();
                        responseData.Results = clientRadRptTemplateData;
                        responseData.Status = "OK";
                    }
                    else if (reqType == "adt-bed")
                    {
                        BedModel bed = DanpheJSONConvert.DeserializeObject<BedModel>(str);
                        List<BedModel> bedList = new List<BedModel>();
                        adtDbContext.Beds.Attach(bed);
                        adtDbContext.Entry(bed).State = EntityState.Modified;
                        adtDbContext.Entry(bed).Property(x => x.CreatedOn).IsModified = false;
                        adtDbContext.Entry(bed).Property(x => x.CreatedBy).IsModified = false;
                        bed.ModifiedOn = System.DateTime.Now;
                        adtDbContext.SaveChanges();
                        UpdateBedFeaturesWard(bed.BedId, bed.WardId, bed.ModifiedBy);
                        bedList.Add(bed);
                        responseData.Results = bedList;
                        responseData.Status = "OK";
                    }
                    else if (reqType == "adt-bedFeature")
                    {
                        BedFeature bedFeature = DanpheJSONConvert.DeserializeObject<BedFeature>(str);
                        var departmentModel = coreDbContext.ServiceDepartments.Where(d => d.ServiceDepartmentName == "Bed Charges").FirstOrDefault();
                        //BillItemPrice billItemPrice = billingDbContext.BillItemPrice.Where(a => a.ItemName == departmentModel.ServiceDepartmentName).FirstOrDefault<BillItemPrice>();
                        BillItemPrice billItemPrice = billingDbContext.BillItemPrice.Where(a => a.ItemId == bedFeature.BedFeatureId && a.ServiceDepartmentId == departmentModel.ServiceDepartmentId).FirstOrDefault<BillItemPrice>();

                        adtDbContext.BedFeatures.Attach(bedFeature);
                        billingDbContext.BillItemPrice.Attach(billItemPrice);

                        adtDbContext.Entry(bedFeature).State = EntityState.Modified;
                        adtDbContext.Entry(bedFeature).Property(x => x.CreatedOn).IsModified = false;
                        adtDbContext.Entry(bedFeature).Property(x => x.CreatedBy).IsModified = false;
                        bedFeature.ModifiedOn = System.DateTime.Now;
                        bedFeature.ModifiedBy = currentUser.EmployeeId;
                        billItemPrice.ItemName = bedFeature.BedFeatureName;
                        billItemPrice.TaxApplicable = bedFeature.TaxApplicable;
                        billingDbContext.Entry(billItemPrice).Property(x => x.TaxApplicable).IsModified = true;
                        billingDbContext.SaveChanges();
                        adtDbContext.SaveChanges();
                        responseData.Results = bedFeature;
                        responseData.Status = "OK";
                    }
                    else if (reqType == "adt-map-bedFeatures")
                    {
                        List<BedFeaturesMap> bedFeaturesMap = DanpheJSONConvert.DeserializeObject<List<BedFeaturesMap>>(str);
                        bedFeaturesMap.ForEach(bedFeatureMap =>
                        {
                            adtDbContext.BedFeaturesMaps.Attach(bedFeatureMap);
                            adtDbContext.Entry(bedFeatureMap).State = EntityState.Modified;
                            adtDbContext.Entry(bedFeatureMap).Property(x => x.CreatedOn).IsModified = false;
                            adtDbContext.Entry(bedFeatureMap).Property(x => x.CreatedBy).IsModified = false;
                        });
                        adtDbContext.SaveChanges();
                        responseData.Status = "OK";

                    }

                    else if (reqType == "adt-ward")
                    {

                        WardModel ward = DanpheJSONConvert.DeserializeObject<WardModel>(str);
                        adtDbContext.Wards.Attach(ward);
                        adtDbContext.Entry(ward).State = EntityState.Modified;
                        adtDbContext.Entry(ward).Property(x => x.CreatedOn).IsModified = false;
                        adtDbContext.Entry(ward).Property(x => x.CreatedBy).IsModified = false;
                        ward.ModifiedOn = System.DateTime.Now;
                        adtDbContext.SaveChanges();
                        responseData.Results = ward;
                        responseData.Status = "OK";
                    }
                    else if (reqType == "employee")
                    {
                        EmployeeModel clientEmployee = DanpheJSONConvert.DeserializeObject<EmployeeModel>(str);

                        using(var dbTransc = masterDBContext.Database.BeginTransaction())
                        {
                            try
                            {
                                masterDBContext.Employees.Attach(clientEmployee);
                                masterDBContext.Entry(clientEmployee).State = EntityState.Modified;
                                masterDBContext.Entry(clientEmployee).Property(x => x.CreatedOn).IsModified = false;
                                masterDBContext.Entry(clientEmployee).Property(x => x.CreatedBy).IsModified = false;
                                masterDBContext.SaveChanges();

                                if (clientEmployee.SignatoryImageBase64 != null && clientEmployee.SignatoryImageName == null)
                                {
                                    UploadLabSignatoryImage(masterDBContext, clientEmployee);
                                }
                                dbTransc.Commit();
                                responseData.Results = clientEmployee;
                                responseData.Status = "OK";

                            } 
                            catch(Exception ex)
                            {
                                dbTransc.Rollback();
                                responseData.Status = "Failed";
                                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                            }
                        }                       

                        
                    }
                    else if (reqType == "employee-role")
                    {
                        EmployeeRoleModel employeeRole = DanpheJSONConvert.DeserializeObject<EmployeeRoleModel>(str);
                        masterDBContext.EmployeeRole.Attach(employeeRole);
                        masterDBContext.Entry(employeeRole).State = EntityState.Modified;
                        masterDBContext.Entry(employeeRole).Property(x => x.CreatedOn).IsModified = false;
                        masterDBContext.Entry(employeeRole).Property(x => x.CreatedBy).IsModified = false;
                        masterDBContext.SaveChanges();
                        responseData.Results = employeeRole;
                        responseData.Status = "OK";
                    }
                    else if (reqType == "employee-type")
                    {
                        EmployeeTypeModel employeeType = DanpheJSONConvert.DeserializeObject<EmployeeTypeModel>(str);
                        masterDBContext.EmployeeType.Attach(employeeType);
                        masterDBContext.Entry(employeeType).State = EntityState.Modified;
                        masterDBContext.Entry(employeeType).Property(x => x.CreatedOn).IsModified = false;
                        masterDBContext.Entry(employeeType).Property(x => x.CreatedBy).IsModified = false;
                        masterDBContext.SaveChanges();
                        responseData.Results = employeeType;
                        responseData.Status = "OK";
                    }
                    else if (reqType == "security-user")
                    {
                        RbacUser user = DanpheJSONConvert.DeserializeObject<RbacUser>(str);
                        rbacDbContext.Users.Attach(user);
                        rbacDbContext.Entry(user).State = EntityState.Modified;
                        rbacDbContext.Entry(user).Property(x => x.CreatedOn).IsModified = false;
                        rbacDbContext.Entry(user).Property(x => x.CreatedBy).IsModified = false;
                        rbacDbContext.SaveChanges();
                        responseData.Results = user;
                        responseData.Status = "OK";
                    }
                    else if (reqType == "security-role")
                    {
                        RbacRole role = DanpheJSONConvert.DeserializeObject<RbacRole>(str);
                        rbacDbContext.Roles.Attach(role);
                        rbacDbContext.Entry(role).State = EntityState.Modified;
                        rbacDbContext.Entry(role).Property(x => x.CreatedOn).IsModified = false;
                        rbacDbContext.Entry(role).Property(x => x.CreatedBy).IsModified = false;
                        rbacDbContext.SaveChanges();
                        responseData.Results = role;
                        responseData.Status = "OK";
                    }
                    else if (reqType == "security-rolePermission")
                    {
                        List<RolePermissionMap> rolePermissions = DanpheJSONConvert.DeserializeObject<List<RolePermissionMap>>(str);
                        rolePermissions.ForEach(roleP =>
                        {
                            rbacDbContext.RolePermissionMaps.Attach(roleP);
                            rbacDbContext.Entry(roleP).State = EntityState.Modified;
                            rbacDbContext.Entry(roleP).Property(x => x.CreatedOn).IsModified = false;
                            rbacDbContext.Entry(roleP).Property(x => x.CreatedBy).IsModified = false;
                        });
                        rbacDbContext.SaveChanges();
                        responseData.Status = "OK";

                    }
                    else if (reqType == "security-userRole")
                    {
                        List<UserRoleMap> userRoles = DanpheJSONConvert.DeserializeObject<List<UserRoleMap>>(str);
                        userRoles.ForEach(userRole =>
                        {
                            rbacDbContext.UserRoleMaps.Attach(userRole);
                            rbacDbContext.Entry(userRole).State = EntityState.Modified;
                            rbacDbContext.Entry(userRole).Property(x => x.CreatedOn).IsModified = false;
                            rbacDbContext.Entry(userRole).Property(x => x.CreatedBy).IsModified = false;
                        });
                        rbacDbContext.SaveChanges();
                        responseData.Status = "OK";

                    }
                    else if (reqType == "billing-item")
                    {
                        BillItemPrice item = DanpheJSONConvert.DeserializeObject<BillItemPrice>(str);
                        billingDbContext.BillItemPrice.Attach(item);
                        billingDbContext.Entry(item).State = EntityState.Modified;
                        billingDbContext.SaveChanges();
                        responseData.Results = item;
                        responseData.Status = "OK";
                    }

                    else if (reqType == "auto-billing-items")
                    {
                        var parameter = coreDbContext.Parameters.Where(a => a.ParameterGroupName == "ADT" && a.ParameterName == "AutoAddBillingItems").FirstOrDefault();
                        if (parameter != null)
                        {
                            parameter.ParameterValue = str;
                            coreDbContext.Entry(parameter).State = EntityState.Modified;
                            coreDbContext.SaveChanges();
                            responseData.Status = "OK";
                        }
                    }

                    else if (reqType == "billing-package")
                    {
                        BillingPackageModel package = DanpheJSONConvert.DeserializeObject<BillingPackageModel>(str);
                        XmlDocument xdoc = JsonConvert.DeserializeXmlNode("{\"Items\":" + package.BillingItemsXML + "}", "root");
                        package.BillingItemsXML = xdoc.InnerXml;
                        billingDbContext.BillingPackages.Attach(package);
                        billingDbContext.Entry(package).State = EntityState.Modified;
                        billingDbContext.Entry(package).Property(x => x.CreatedOn).IsModified = false;
                        billingDbContext.Entry(package).Property(x => x.CreatedBy).IsModified = false;
                        billingDbContext.SaveChanges();
                        package.BillingItemsXML = ConvertXMLToJson(package.BillingItemsXML);
                        responseData.Results = package;
                        responseData.Status = "OK";
                    }
                    else if (reqType == "security-reset-password")
                    {
                        RbacUser user = DanpheJSONConvert.DeserializeObject<RbacUser>(str);
                        //encrepting current entered password and updating in table
                        user.Password = RBAC.EncryptPassword(user.Password);

                        rbacDbContext.Users.Attach(user);
                        ///while password reset: we've to modify only below 4 fields of the user table.
                        rbacDbContext.Entry(user).Property(x => x.ModifiedBy).IsModified = true;
                        rbacDbContext.Entry(user).Property(x => x.ModifiedOn).IsModified = true;
                        rbacDbContext.Entry(user).Property(x => x.Password).IsModified = true;
                        rbacDbContext.Entry(user).Property(x => x.NeedsPasswordUpdate).IsModified = true;

                        rbacDbContext.SaveChanges();
                        responseData.Results = user;
                        responseData.Status = "OK";

                    }
                    else if (reqType == "security-user-isactive")
                    {
                        RbacUser user = DanpheJSONConvert.DeserializeObject<RbacUser>(str);
                        //encrepting current entered password and updating in table
                        // user.Password = RBAC.EncryptPassword(user.Password);

                        rbacDbContext.Users.Attach(user);

                        rbacDbContext.Entry(user).Property(x => x.IsActive).IsModified = true;
                        rbacDbContext.SaveChanges();
                        responseData.Results = user;
                        responseData.Status = "OK";

                    }
                    else if (reqType == "update-parameter")
                    {
                        CfgParameterModel parameter = DanpheJSONConvert.DeserializeObject<CfgParameterModel>(str);
                        var parmToUpdate = (from paramData in masterDBContext.CFGParameters
                                            where paramData.ParameterId == parameter.ParameterId
                                            && paramData.ParameterName == parameter.ParameterName
                                            && paramData.ParameterGroupName == parameter.ParameterGroupName
                                            select paramData
                                            ).FirstOrDefault();

                        parmToUpdate.ParameterValue = parameter.ParameterValue;

                        masterDBContext.Entry(parmToUpdate).Property(p => p.ParameterValue).IsModified = true;

                        masterDBContext.SaveChanges();
                        responseData.Status = "OK";
                        responseData.Results = parmToUpdate;
                    }
                    else if (reqType == "put-credit-organization")
                    {
                        CreditOrganizationModel creditOrganization = DanpheJSONConvert.DeserializeObject<CreditOrganizationModel>(str);
                        billingDbContext.CreditOrganization.Attach(creditOrganization);
                        billingDbContext.Entry(creditOrganization).State = EntityState.Modified;
                        billingDbContext.Entry(creditOrganization).Property(x => x.CreatedOn).IsModified = false;
                        billingDbContext.Entry(creditOrganization).Property(x => x.CreatedBy).IsModified = false;
                        billingDbContext.SaveChanges();
                        responseData.Results = creditOrganization;
                        responseData.Status = "OK";
                    }
                    else if (reqType == "put-membership")
                    {
                        MembershipTypeModel membership = DanpheJSONConvert.DeserializeObject<MembershipTypeModel>(str);
                        billingDbContext.MembershipType.Attach(membership);
                        billingDbContext.Entry(membership).State = EntityState.Modified;
                        billingDbContext.Entry(membership).Property(x => x.CreatedOn).IsModified = false;
                        billingDbContext.Entry(membership).Property(x => x.CreatedBy).IsModified = false;
                        billingDbContext.SaveChanges();
                        responseData.Results = membership;
                        responseData.Status = "OK";
                    }
                    else
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "Invalid Request Type";
                    }
                }
                else
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = "Client Object is empty";
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }
        private string ConvertXMLToJson(string itemXml)
        {
            //return empty json-array if input xml is empty or null
            if (string.IsNullOrEmpty(itemXml))
            {
                return "[]";
            }
            else
            {
                XmlDocument doc = new XmlDocument();
                doc.LoadXml(itemXml);
                return JsonConvert.SerializeXmlNode(doc, Newtonsoft.Json.Formatting.None, true);
            }
        }
        private void UpdateBedFeaturesWard(int bedId, int wardId, int? modifedBy)
        {
            try
            {
                AdmissionDbContext dbContext = new AdmissionDbContext(connString);
                List<BedFeaturesMap> featuresMapList = (from features in dbContext.BedFeaturesMaps
                                                        where features.BedId == bedId
                                                        select features).ToList();
                featuresMapList.ForEach(featuresMap =>
                {
                    featuresMap.WardId = wardId;
                    featuresMap.ModifiedBy = modifedBy;
                    featuresMap.ModifiedOn = DateTime.Now;
                    dbContext.Entry(featuresMap).State = EntityState.Modified;
                });
                dbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }

        }



        public void UploadLabSignatoryImage(MasterDbContext masterDbContext,EmployeeModel emp)
        {
            var fileName = "";
            string signatoryImagePath = (from master in masterDbContext.CFGParameters
                        where master.ParameterGroupName.ToLower() == "common" && master.ParameterName == "SignatureLocationPath"
                        select master.ParameterValue).FirstOrDefault();
   
            var dateTimeToAppend = System.DateTime.Now.ToString("MM/dd/yyyy HH:mm:ss");
            dateTimeToAppend = dateTimeToAppend.Replace("/", "");
            dateTimeToAppend = dateTimeToAppend.Replace(":", "");

            fileName = emp.FirstName + "_" + emp.EmployeeId + "_" + dateTimeToAppend;
            fileName = fileName.Replace(" ", "");
            fileName = fileName + ".png";

            signatoryImagePath = signatoryImagePath + fileName;
            emp.SignatoryImageName = fileName;            

            byte[] imageBytes = Convert.FromBase64String(emp.SignatoryImageBase64);

            using (var stream = new FileStream(signatoryImagePath, FileMode.Create))
            {
                MemoryStream ms = new MemoryStream(imageBytes);
                ms.WriteTo(stream);

                // clean up
                ms.Close();
                stream.Close();
                stream.Dispose();
            }

            var employee = (from val in masterDbContext.Employees
                            where val.EmployeeId == emp.EmployeeId
                            select val).FirstOrDefault();

            if(employee != null)
            {
                employee.SignatoryImageName = emp.SignatoryImageName;
                masterDbContext.Entry(employee).Property(a => a.SignatoryImageName).IsModified = true;
                masterDbContext.SaveChanges();
            }
        }



        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }

    }
}