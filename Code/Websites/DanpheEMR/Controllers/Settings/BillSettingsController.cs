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

    public class BillSettingsController : CommonController
    {

        public BillSettingsController(IOptions<MyConfiguration> _config) : base(_config)
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
            string integrationName,
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

                if (reqType == "get-service-departments")
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
                                       }).OrderBy(d => d.DepartmentName).ThenBy(d => d.ServiceDepartmentName).ToList();
                    responseData.Status = "OK";
                    responseData.Results = srvDeptList;
                }
                else if (reqType == "get-billing-itemList")
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
                                        IsActive = item.IsActive.HasValue ? item.IsActive : false,
                                        DisplaySeq = item.DisplaySeq,
                                        IsDoctorMandatory = item.IsDoctorMandatory.HasValue ? item.IsDoctorMandatory : false,
                                        AllowMultipleQty = item.AllowMultipleQty,
                                        ItemCode = item.ItemCode,
                                        IsFractionApplicable = item.IsFractionApplicable.HasValue ? item.IsFractionApplicable : false,
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
                                                      DoctorName = doc != null ? doc.FullName : "",
                                                  }).FirstOrDefault(),
                                        IsNormalPriceApplicable = item.IsNormalPriceApplicable, //sud:19Apr'19-For Price Categories
                                        IsEHSPriceApplicable = item.IsEHSPriceApplicable, //sud:19Apr'19-For Price Categories
                                        IsForeignerPriceApplicable = item.IsForeignerPriceApplicable, //sud:19Apr'19-For Price Categories
                                        IsInsForeignerPriceApplicable = item.IsInsForeignerPriceApplicable, //pratik:12Nov'19-For Price Categories
                                        IsSAARCPriceApplicable = item.IsSAARCPriceApplicable, //sud:19Apr'19-For Price Categories
                                        IsOT = item.IsOT,
                                        IsProc = item.IsProc,
                                        Category = item.Category,
                                        EHSPrice = item.EHSPrice != null ? item.EHSPrice : 0, //sud:19Apr'19-For Price Categories
                                        SAARCCitizenPrice = item.SAARCCitizenPrice != null ? item.SAARCCitizenPrice : 0, //sud:19Apr'19-For Price Categories
                                        ForeignerPrice = item.ForeignerPrice != null ? item.ForeignerPrice : 0, //sud:19Apr'19-For Price Categories
                                        InsForeignerPrice = item.InsForeignerPrice != null ? item.InsForeignerPrice : 0, //pratik:12Nov'19-For Price Categories
                                        DefaultDoctorList = item.DefaultDoctorList



                                    }).OrderBy(b => b.ServiceDepartmentName).ToList();

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
                //GET: Price Change History List of Bill Item by ItemId and ServiceDepartmentId
                else if (reqType != null && reqType == "get-billItemPriceChangeHistory")
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
                else if (reqType == "get-billing-packageList")
                {
                    List<BillingPackageModel> packageList = billingDbContext.BillingPackages.OrderBy(p => p.BillingPackageName).ToList();
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
                else if (reqType == "get-membership-types")
                {
                    var membershipTypes = (from type in billingDbContext.MembershipType
                                           select type).OrderBy(m => m.MembershipTypeName).ToList();
                    responseData.Results = membershipTypes;
                    responseData.Status = "OK";
                }
                else if (reqType == "get-credit-organization") //--yubraj 19th April 2019
                {
                    var creditOrganization = billingDbContext.CreditOrganization.OrderBy(c => c.OrganizationName).ToList();
                    responseData.Status = "OK";
                    responseData.Results = creditOrganization;
                }
                else if (reqType == "get-billing-items-by-servdeptitemid" && itemId > 0)
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
                                                  item.InsForeignerPrice,
                                                  item.IsSAARCPriceApplicable,
                                                  item.IsForeignerPriceApplicable,
                                                  item.IsInsForeignerPriceApplicable,
                                                  item.IsEHSPriceApplicable,
                                                  ItemNamePrice = item.ItemName + " " + item.Price.ToString()
                                              }).FirstOrDefault();
                    responseData.Status = "OK";
                    responseData.Results = bilItemPriceDetail;
                }
                else if (reqType == "get-billing-items-by-integrationName-itemid" && itemId > 0)
                {
                    var bilItemPriceDetail = (from item in billingDbContext.BillItemPrice
                                              join srv in billingDbContext.ServiceDepartment
                                              on item.ServiceDepartmentId equals srv.ServiceDepartmentId
                                              where srv.IntegrationName.ToLower() == integrationName.ToLower()
                                              && item.ItemId == itemId
                                              select new
                                              {
                                                  srv.ServiceDepartmentName,
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
                                                  item.InsForeignerPrice,
                                                  item.IsSAARCPriceApplicable,
                                                  item.IsForeignerPriceApplicable,
                                                  item.IsInsForeignerPriceApplicable,
                                                  item.IsEHSPriceApplicable,
                                                  ItemNamePrice = item.ItemName + " " + item.Price.ToString()
                                              }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = bilItemPriceDetail;
                }

                else if (reqType == "get-billing-items-by-servdeptname" && servDeptName.Length > 0)
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
                else if (reqType == "get-billing-items-by-integrationName" && !string.IsNullOrEmpty(integrationName))
                {
                    var itemList = (from item in billingDbContext.BillItemPrice
                                    join srv in billingDbContext.ServiceDepartment on item.ServiceDepartmentId equals srv.ServiceDepartmentId
                                    where srv.IntegrationName.ToLower() == integrationName.ToLower()
                                    select new
                                    {
                                        ServiceDepartmentId = item.ServiceDepartmentId,
                                        ServiceDepartmentName = srv.ServiceDepartmentName,
                                        ItemName = item.ItemName,
                                        ItemNamePrice = item.ItemName + " " + item.Price.ToString(),
                                        Price = item.Price,
                                        EHSPrice = item.EHSPrice,
                                        SAARCCitizenPrice = item.SAARCCitizenPrice,
                                        ForeignerPrice = item.ForeignerPrice,
                                        InsForeignerPrice = item.InsForeignerPrice
                                    }).Distinct().ToList();
                    responseData.Status = "OK";
                    responseData.Results = itemList;
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
                int itemId = ToInt(this.ReadQueryStringData("itemId"));
                string reqType = this.ReadQueryStringData("reqType");
                string str = this.ReadPostData();
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

                if (reqType == "post-service-department")
                {
                    ServiceDepartmentModel servdeptModel = DanpheJSONConvert.DeserializeObject<ServiceDepartmentModel>(str);
                    servdeptModel.CreatedOn = System.DateTime.Now;
                    if (servdeptModel.IntegrationName == "None")
                    {
                        servdeptModel.IntegrationName = null;
                    }
                    masterDbContext.ServiceDepartments.Add(servdeptModel);
                    masterDbContext.SaveChanges();
                    responseData.Results = servdeptModel;
                    responseData.Status = "OK";
                }

                else if (reqType == "post-billing-item")
                {

                    BillItemPrice item = DanpheJSONConvert.DeserializeObject<BillItemPrice>(str);

                    item.CreatedBy = currentUser.EmployeeId;
                    item.CreatedOn = DateTime.Now;

                    //getting max item id [we dont have item id other than lab, radiology, and bed charges] 
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
                else if (reqType == "post-billing-package")
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
                else if (reqType == "post-credit-organization")
                {
                    CreditOrganizationModel org = DanpheJSONConvert.DeserializeObject<CreditOrganizationModel>(str);
                    billingDbContext.CreditOrganization.Add(org);

                    billingDbContext.SaveChanges();
                    responseData.Results = org;
                    responseData.Status = "OK";
                }
                else if (reqType == "post-membership-type")
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
                if (reqType == "put-service-department")
                {
                    ////Correct implementation--2lines of code extra for each update statement..
                    ////we don't want to update the CreatedOn property in PUT, so excluding them.
                    ServiceDepartmentModel clientServDept = DanpheJSONConvert.DeserializeObject<ServiceDepartmentModel>(str);
                    if (clientServDept.IntegrationName == "None")
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

                else if (reqType == "put-billing-item")
                {
                    BillItemPrice item = DanpheJSONConvert.DeserializeObject<BillItemPrice>(str);
                    billingDbContext.BillItemPrice.Attach(item);
                    billingDbContext.Entry(item).State = EntityState.Modified;
                    billingDbContext.SaveChanges();

                    //for Lab, Radiology and Bed Feature, we've to update few properties like: IsActive, Price in their respective module as well.
                    string intgrationName = (from s in billingDbContext.ServiceDepartment
                                             where s.ServiceDepartmentId == item.ServiceDepartmentId
                                             select s.IntegrationName).FirstOrDefault();

                    if (!string.IsNullOrEmpty(intgrationName) &&
                        (intgrationName.ToLower() == "lab" || intgrationName.ToLower() == "radiology" || intgrationName.ToLower() == "bed charges"))
                    {
                        UpdateDepartmentItems(intgrationName, item, connString);
                    }





                    responseData.Results = item;
                    responseData.Status = "OK";
                }
                else if (reqType == "put-billing-package")
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
                else if (reqType == "put-membership-type")
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


        private void UpdateDepartmentItems(string intgrationName, BillItemPrice billItem, string connString)
        {
            if (billItem != null)
            {
                //BillingDbContext bilDbContext = new BillingDbContext(connString);

                if (intgrationName.ToLower() == "lab")
                {
                    LabDbContext labDbContext = new LabDbContext(connString);
                    LabTestModel tst = labDbContext.LabTests.Where(a => a.LabTestId == billItem.ItemId).FirstOrDefault();
                    if (tst != null)
                    {
                        tst.IsActive = billItem.IsActive;
                        labDbContext.Entry(tst).Property(x => x.IsActive).IsModified = true;
                        labDbContext.SaveChanges();
                    }
                }
                else if (intgrationName.ToLower() == "radiology")
                {
                    RadiologyDbContext radDbContext = new RadiologyDbContext(connString);
                    RadiologyImagingItemModel imgItm = radDbContext.ImagingItems.Where(a => a.ImagingItemId == billItem.ItemId).FirstOrDefault();
                    if (imgItm != null)
                    {
                        imgItm.IsActive = billItem.IsActive;
                        radDbContext.Entry(imgItm).Property(x => x.IsActive).IsModified = true;
                        radDbContext.SaveChanges();
                    }

                }
                else if (intgrationName.ToLower() == "bed charges")
                {
                    AdmissionDbContext adtDbContext = new AdmissionDbContext(connString);
                    BedFeature bFeatureItm = adtDbContext.BedFeatures.Where(a => a.BedFeatureId == billItem.ItemId).FirstOrDefault();
                    if (bFeatureItm != null)
                    {
                        bFeatureItm.IsActive = billItem.IsActive;
                        bFeatureItm.BedPrice = (double)billItem.Price;

                        adtDbContext.Entry(bFeatureItm).Property(x => x.IsActive).IsModified = true;
                        adtDbContext.Entry(bFeatureItm).Property(x => x.BedPrice).IsModified = true;
                        adtDbContext.SaveChanges();
                    }

                }

            }
        }


        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }

    }
}