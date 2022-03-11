using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.Core.Configuration;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using System.Data.Entity;
using System.Data.SqlClient;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using DanpheEMR.Utilities;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Http.Features;
using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Caching;
using System.Xml;
using DanpheEMR.Security;
using DanpheEMR.ServerModel.LabModels;
using System.Transactions;

namespace DanpheEMR.Controllers
{
    public class LabSettingController : CommonController
    {

        public LabSettingController(IOptions<MyConfiguration> _config) : base(_config)
        {

        }

        // GET: api/values
        [HttpGet]
        public string Get(string reqType)
        {

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                LabDbContext labDbContext = new LabDbContext(connString);

                //this get is from OrderLabTests
                if (reqType == "labReportList")//!=null not needed for string.
                {
                    //LabReportTemplateModel allLabReports = new LabReportTemplateModel();
                    List<LabReportTemplateModel> allLabReports = new List<LabReportTemplateModel>();
                    allLabReports = (from rep in labDbContext.LabReportTemplates
                                     select rep).ToList();
                    responseData.Results = allLabReports;
                }
                else if (reqType == "labTestsList")
                {
                    List<LabTestJSONComponentModel> allLabTestComponents = (from labComponent in labDbContext.LabTestComponents
                                                                            where true
                                                                            select labComponent).ToList();
                    var allLabTests = (from test in labDbContext.LabTests
                                       join report in labDbContext.LabReportTemplates on test.ReportTemplateId equals report.ReportTemplateID
                                       join billItem in labDbContext.BillItemPrice on test.LabTestId equals billItem.ItemId
                                       join srv in labDbContext.ServiceDepartment on billItem.ServiceDepartmentId equals srv.ServiceDepartmentId
                                       join category in labDbContext.LabTestCategory on test.LabTestCategoryId equals category.TestCategoryId
                                       where srv.IntegrationName.ToLower() == "lab"
                                       select new
                                       {
                                           LabTestId = test.LabTestId,
                                           LabSequence = test.LabSequence,
                                           LabTestCode = test.LabTestCode,
                                           ProcedureCode = test.ProcedureCode,
                                           Description = test.Description,
                                           LabTestSynonym = test.LabTestSynonym,
                                           LabTestName = test.LabTestName,
                                           LabTestCategory = category.TestCategoryName,
                                           LabTestCategoryId = test.LabTestCategoryId,
                                           LabTestSpecimen = test.LabTestSpecimen,
                                           LabTestSpecimenSource = test.LabTestSpecimenSource,
                                           LabTestComponentsJSON = (from labTest in labDbContext.LabTests
                                                                    join componentMap in labDbContext.LabTestComponentMap on labTest.LabTestId equals componentMap.LabTestId
                                                                    join component in labDbContext.LabTestComponents on componentMap.ComponentId equals component.ComponentId
                                                                    where labTest.LabTestId == test.LabTestId && componentMap.IsActive == true
                                                                    select component).ToList(),
                                           LabTestComponentMap = (from componentMap in labDbContext.LabTestComponentMap
                                                                  where componentMap.LabTestId == test.LabTestId && componentMap.IsActive == true
                                                                  select componentMap).OrderBy(a => a.DisplaySequence).ToList(),
                                           LOINC = test.LOINC,
                                           ReportTemplateId = test.ReportTemplateId,
                                           DisplaySequence = test.DisplaySequence.HasValue ? test.DisplaySequence : 1000,//default sequence is 1000
                                           IsSelected = false,
                                           IsPreference = false,
                                           IsValidForReporting = test.IsValidForReporting,
                                           IsActive = test.IsActive,
                                           HasNegativeResults = test.HasNegativeResults,
                                           SmsApplicable = test.SmsApplicable,
                                           NegativeResultText = test.NegativeResultText,
                                           ServiceDepartmentId = billItem.ServiceDepartmentId,
                                           ReportingName = test.ReportingName,
                                           Interpretation = test.Interpretation,
                                           ReportTemplateName = report.ReportTemplateName,
                                           RunNumberType = test.RunNumberType,
                                           IsTaxApplicable = billItem.TaxApplicable
                                       }).ToList();


                    responseData.Results = allLabTests;
                }
                else if (reqType == "lab-vendors-list") //sud:22Apr'19
                {
                    List<LabVendorsModel> allLabVendors = labDbContext.LabVendors.ToList();
                    responseData.Results = allLabVendors;
                }
                else if (reqType == "labSignatories")
                {
                    LabSignatoriesViewModel signatoriesData = new LabSignatoriesViewModel();
                    signatoriesData.AllSignatories = (from cfg in labDbContext.AdminParameters
                                                      where cfg.ParameterGroupName.ToLower() == "lab"
                                                      && (cfg.ParameterName == "DefaultHistoCytoSignatoriesEmpId" || cfg.ParameterName == "DefaultSignatoriesEmpId")
                                                      select cfg
                                          ).ToList();


                    var departmentId = (from dpt in labDbContext.Department
                                        where (dpt.DepartmentCode.ToLower() == "lab" || dpt.DepartmentCode.ToLower() == "pat" 
                                        || dpt.DepartmentName.ToLower() == "pathology" || dpt.DepartmentName.ToLower() == "lab" || dpt.DepartmentName.ToLower() == "laboratory")
                                        select dpt.DepartmentId
                                      ).ToList();


                    signatoriesData.AllDoctors = (from doc in labDbContext.Employee
                                                  where departmentId.Contains((int)doc.DepartmentId)
                                                  select doc
                                    ).ToList();

                    responseData.Results = signatoriesData;
                }
                else if (reqType == "allLabTestComponentList")
                {
                    List<LabTestJSONComponentModel> allLabTestComponents = (from labComponent in labDbContext.LabTestComponents
                                                                            where true
                                                                            select labComponent).ToList();

                    responseData.Results = allLabTestComponents;
                }
                else if (reqType == "allLookUp")
                {
                    List<CoreCFGLookupModel> allLookUps = (from lookup in labDbContext.LabLookUps
                                                           where lookup.ModuleName.ToLower() == "lab"
                                                           select lookup).ToList();
                    responseData.Status = "OK";
                    responseData.Results = allLookUps;
                }
                else if (reqType == "allGovLabTestComponentList")
                {
                    List<LabGovReportItemModel> allgovitem = (from item in labDbContext.LabGovReport
                                                              where true
                                                              select item).ToList();
                    responseData.Results = allgovitem;
                }
                else if (reqType == "all-mapped-components")
                {                  
                    var mappedTestItems = (from m in labDbContext.LabGovReportMapping
                                       join t in labDbContext.LabTests on m.LabItemId equals t.LabTestId
                                       where m.IsActive == true && m.ReportItemId.HasValue && (!m.ComponentId.HasValue || m.ComponentId.Value==0)
                                       select new
                                       {
                                           m.LabItemId,
                                           m.ReportItemId,
                                           m.ReportMapId,
                                           m.IsResultCount,
                                           m.PositiveIndicator,
                                           m.IsComponentBased, 
                                           ComponentName = "",
                                           ComponentId = 0,
                                           t.LabTestName,
                                           m.IsActive
                                       }).ToList();
                    var mappedComponentItems = (from m in labDbContext.LabGovReportMapping
                                                join l in labDbContext.LabTests on m.LabItemId equals l.LabTestId
                                                join c in labDbContext.LabTestComponents on m.ComponentId equals c.ComponentId
                                                where m.IsActive == true && m.ReportItemId.HasValue && (m.ComponentId.HasValue && m.ComponentId.Value > 0)
                                                select new
                                                {
                                                    m.LabItemId,
                                                    m.ReportItemId,
                                                    m.ReportMapId,
                                                    m.IsResultCount,
                                                    m.PositiveIndicator,
                                                    m.IsComponentBased,
                                                    ComponentName = c.ComponentName,
                                                    ComponentId = c.ComponentId,
                                                    LabTestName = l.LabTestName,
                                                    m.IsActive
                                                }).ToList();

                    var allMappedItems = mappedTestItems.Union(mappedComponentItems);

                    var masterGovItems = labDbContext.LabGovReport.Where(d => d.IsActive == true).ToList();

                    var allItems = (from item in masterGovItems
                                        join map in allMappedItems on item.ReportItemId equals map.ReportItemId into temp
                                        from t in temp.DefaultIfEmpty()                                                                              
                                        select new
                                        {
                                            ReportMapId = (t == null) ? 0 : t.ReportMapId,
                                            LabItemName = (t == null) ? "" : t.LabTestName,
                                            IsComponentBased = (t == null) ? false : t.IsComponentBased,
                                            ReportItemName = item.TestName,
                                            ComponentName = (t == null) ? "" : t.ComponentName,
                                            ComponentId = (t == null)? 0 : t.ComponentId,
                                            PositiveIndicator = (t == null) ? "" : t.PositiveIndicator,
                                            ReportItemId = item.ReportItemId,
                                            LabItemId = (t == null) ? 0 : t.LabItemId,
                                            IsResultCount = (t == null) ? false : t.IsResultCount,
                                            IsActive = (t == null) ? false: t.IsActive,
                                            SerialNumber = item.SerialNumber,
                                            GroupName = item.GroupName
                                        }).OrderBy(b => b.ReportItemId).ToList();

                    responseData.Status = "OK";
                    responseData.Results = allItems;
                }
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        [HttpPost]
        public string Post()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            string reqType = this.ReadQueryStringData("reqType");
            string ipStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

            try
            {
                LabDbContext labDbContext = new LabDbContext(connString);
                BillingDbContext billDbContext = new BillingDbContext(connString);
                RbacDbContext rbacDbContext = new RbacDbContext(connString);

                if (reqType != null && reqType == "postLabReport")
                {
                    LabReportTemplateModel labReportTemplate = DanpheJSONConvert.DeserializeObject<LabReportTemplateModel>(ipStr);
                    labReportTemplate.CreatedOn = System.DateTime.Now;
                    labReportTemplate.CreatedBy = currentUser.EmployeeId;

                    //Remove Previous Default Template Set and make the current one default by Assigning IsDefault of previous to False and Current to True
                    if (labReportTemplate.IsDefault == true)
                    {
                        LabReportTemplateModel rowToUpdate = (from rep in labDbContext.LabReportTemplates
                                                              where rep.IsDefault == true
                                                              select rep
                                           ).FirstOrDefault();


                        labDbContext.LabReportTemplates.Attach(rowToUpdate);
                        rowToUpdate.IsDefault = false;
                        labDbContext.SaveChanges();
                    }


                    labDbContext.LabReportTemplates.Add(labReportTemplate);
                    labDbContext.SaveChanges();
                    responseData.Results = labReportTemplate;
                }
                else if (reqType == "postLabTest")
                {
                    using (var dbContextTransaction = labDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            LabTestModel labTest = DanpheJSONConvert.DeserializeObject<LabTestModel>(ipStr);
                            BillItemPrice billItemPrice = new BillItemPrice();
                            billItemPrice.AllowMultipleQty = true;
                            labTest.CreatedBy = currentUser.EmployeeId;
                            labTest.CreatedOn = System.DateTime.Now;
                            labDbContext.LabTests.Add(labTest);
                            labDbContext.SaveChanges();

                            var labComponentMapList = labTest.LabTestComponentMap;

                            if (labTest.TemplateType.ToLower() == "html")
                            {
                                var htmlComp = labTest.LabTestComponentsJSON[0];
                                labDbContext.LabTestComponents.Add(htmlComp);
                                labDbContext.SaveChanges();
                                LabTestComponentMapModel htmlCompToMap = new LabTestComponentMapModel();
                                htmlCompToMap.ComponentId = htmlComp.ComponentId;
                                htmlCompToMap.LabTestId = labTest.LabTestId;
                                htmlCompToMap.CreatedBy = currentUser.EmployeeId;
                                htmlCompToMap.CreatedOn = System.DateTime.Now;
                                htmlCompToMap.IsActive = true;
                                labDbContext.LabTestComponentMap.Add(htmlCompToMap);
                                labDbContext.SaveChanges();
                            }
                            else
                            {
                                foreach (var component in labComponentMapList)
                                {
                                    component.CreatedBy = currentUser.EmployeeId;
                                    component.CreatedOn = System.DateTime.Now;
                                    component.LabTestId = labTest.LabTestId;

                                    labDbContext.LabTestComponentMap.Add(component);
                                    labDbContext.SaveChanges();
                                }
                            }



                            labDbContext.LabTests.Attach(labTest);

                            billItemPrice.ItemName = labTest.LabTestName;
                            //Will Update this hardcode Later
                            billItemPrice.ServiceDepartmentId = labTest.ServiceDepartmentId ?? default(int); //typecase for default int
                            billItemPrice.Price = 0;
                            billItemPrice.ItemId = Convert.ToInt32(labTest.LabTestId);
                            billItemPrice.TaxApplicable = labTest.IsTaxApplicable;
                            billItemPrice.DiscountApplicable = true;
                            billItemPrice.CreatedBy = currentUser.EmployeeId;
                            billItemPrice.CreatedOn = System.DateTime.Now;
                            billItemPrice.IsActive = true;
                            billItemPrice.IsFractionApplicable = false;
                            billItemPrice.EHSPrice = 0;
                            billItemPrice.IsNormalPriceApplicable = true;
                            billItemPrice.IsValidForReporting = labTest.IsValidForReporting;

                            Int64 labTestId = labTest.LabTestId;//LabtestId comes only after this model is saved to database
                            if (string.IsNullOrEmpty(labTest.LabTestCode))
                            {
                                labTest.LabTestCode = "L-" + labTest.LabTestId.ToString("D6");
                            }

                            labTest.ProcedureCode = "LAB-" + labTest.LabTestId.ToString("D6");

                            labDbContext.Entry(labTest).Property(t => t.LabTestCode).IsModified = true;
                            labDbContext.Entry(labTest).Property(t => t.ProcedureCode).IsModified = true;

                            billItemPrice.ProcedureCode = labTest.ProcedureCode;

                            labDbContext.BillItemPrice.Add(billItemPrice);

                            labDbContext.SaveChanges();
                            dbContextTransaction.Commit();
                            responseData.Results = labTest;
                        }
                        catch (Exception ex)
                        {
                            dbContextTransaction.Rollback();
                            throw (ex);
                        }

                    }
                }
                else if (reqType == "postLabComponents")
                {
                    List<LabTestJSONComponentModel> componentList = DanpheJSONConvert.DeserializeObject<List<LabTestJSONComponentModel>>(ipStr);
                    using (var dbContextTransaction = labDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            var allLabComponents = labDbContext.LabTestComponents.ToList();

                            foreach (var comp in componentList)
                            {
                                var duplicateComponent = allLabComponents.FirstOrDefault(x => x.ComponentName == comp.ComponentName && x.DisplayName == comp.DisplayName);
                                if (duplicateComponent == null)
                                {
                                    labDbContext.LabTestComponents.Add(comp);
                                    labDbContext.SaveChanges();
                                }
                            }
                            dbContextTransaction.Commit();

                            responseData.Results = componentList;
                            responseData.Status = "OK";
                        }
                        catch (Exception ex)
                        {
                            dbContextTransaction.Rollback();
                            throw (ex);
                        }
                    }

                }
                else if (reqType == "postLabLookUp")
                {
                    CoreCFGLookupModel Lookup = DanpheJSONConvert.DeserializeObject<CoreCFGLookupModel>(ipStr);
                    using (var dbContextTransaction = labDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            var allLookUps = labDbContext.LabLookUps.ToList();

                            var duplicateComponent = allLookUps.FirstOrDefault(x => x.ModuleName == Lookup.ModuleName && x.LookUpName == Lookup.LookUpName && x.LookupDataJson == Lookup.LookupDataJson);
                            if (duplicateComponent == null)
                            {
                                labDbContext.LabLookUps.Add(Lookup);
                                labDbContext.SaveChanges();
                            }
                            dbContextTransaction.Commit();

                            responseData.Results = Lookup;
                            responseData.Status = "OK";
                        }
                        catch (Exception ex)
                        {
                            dbContextTransaction.Rollback();
                            throw (ex);
                        }
                    }

                }
                else if (reqType == "add-vendor")
                {
                    LabVendorsModel vendorFromClient = DanpheJSONConvert.DeserializeObject<LabVendorsModel>(ipStr);

                    LabVendorsModel defaultVendor = labDbContext.LabVendors.Where(val => val.IsDefault == true).FirstOrDefault();

                    if (vendorFromClient.IsDefault)
                    {
                        if (defaultVendor != null && defaultVendor.IsDefault)
                        {
                            defaultVendor.IsDefault = false;
                            labDbContext.Entry(defaultVendor).State = EntityState.Modified;
                            labDbContext.Entry(defaultVendor).Property(x => x.IsDefault).IsModified = true;
                        }
                    }

                    labDbContext.LabVendors.Add(vendorFromClient);

                    labDbContext.SaveChanges();


                    responseData.Results = vendorFromClient;//return same data to client.
                    labDbContext.SaveChanges();

                }
                else if (reqType == "postLabCategory")
                {
                    using (TransactionScope scope = new TransactionScope())
                    {
                        LabTestCategoryModel categoryFromClient = DanpheJSONConvert.DeserializeObject<LabTestCategoryModel>(ipStr);

                        if (categoryFromClient.IsDefault.HasValue && categoryFromClient.IsDefault.Value == true)
                        {
                            var defCat = labDbContext.LabTestCategory.Where(l => l.IsDefault == true).FirstOrDefault();
                            if (defCat != null)
                            {
                                labDbContext.LabTestCategory.Attach(defCat);
                                defCat.IsDefault = false;
                                labDbContext.Entry(defCat).Property(x => x.IsDefault).IsModified = true;
                                labDbContext.SaveChanges();
                            }
                        }

                        categoryFromClient.CreatedBy = currentUser.EmployeeId;
                        categoryFromClient.CreatedOn = System.DateTime.Now;

                        var applicationId = rbacDbContext.Applications.Where(a => (a.ApplicationCode.ToLower() == "lab")).FirstOrDefault()?.ApplicationId;

                        var permissionModel = new RbacPermission();
                        permissionModel.PermissionName = "lab-category-" + categoryFromClient.TestCategoryName;
                        permissionModel.IsActive = true;
                        permissionModel.ApplicationId = applicationId;
                        permissionModel.CreatedOn = System.DateTime.Now;
                        permissionModel.CreatedBy = currentUser.EmployeeId;
                        permissionModel.IsActive = true;

                        rbacDbContext.Permissions.Add(permissionModel);
                        rbacDbContext.SaveChanges();

                        categoryFromClient.PermissionId = permissionModel.PermissionId;
                        labDbContext.LabTestCategory.Add(categoryFromClient);
                        labDbContext.SaveChanges();

                        responseData.Results = categoryFromClient;//return same data to client.
                        labDbContext.SaveChanges();

                        scope.Complete();
                    }                    
                }
                else if (reqType == "postLabSpecimen")
                {
                    var specimenName = ipStr;
                    LabTestMasterSpecimen SpecimenModel = new LabTestMasterSpecimen();
                    SpecimenModel.SpecimenName = specimenName;
                    labDbContext.LabTestSpecimen.Add(SpecimenModel);
                    labDbContext.SaveChanges();
                }
                else if (reqType == "post-mapped-component")
                {
                    LabGovReportMappingModel item = DanpheJSONConvert.DeserializeObject<LabGovReportMappingModel>(ipStr);
                    responseData.Status = "OK";

                    try
                    {
                        if (item.ReportItemId == 0)
                        {
                            item.ReportItemId = null;
                        }

                        if (item != null)
                        {
                            labDbContext.LabGovReportMapping.Add(item);
                            labDbContext.SaveChanges();
                        }

                        responseData.Status = "OK";
                        responseData.Results = item;
                    }
                    catch (Exception ex)
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                    }

                }
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }

            return DanpheJSONConvert.SerializeObject(responseData, true);
        }


        [HttpPut]
        public string Put()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            string reqType = this.ReadQueryStringData("reqType");
            string ipStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

            try
            {
                LabDbContext labDbContext = new LabDbContext(connString);
                BillingDbContext billDbContext = new BillingDbContext(connString);
                RbacDbContext rbacDbContext = new RbacDbContext(connString);
                if (reqType == "updateLabReport")
                {
                    LabReportTemplateModel labReportTemplate = DanpheJSONConvert.DeserializeObject<LabReportTemplateModel>(ipStr);

                    labDbContext.LabReportTemplates.Attach(labReportTemplate);
                    labDbContext.Entry(labReportTemplate).State = EntityState.Modified;
                    labDbContext.Entry(labReportTemplate).Property(x => x.CreatedOn).IsModified = false;
                    labDbContext.Entry(labReportTemplate).Property(x => x.CreatedBy).IsModified = false;
                    labReportTemplate.ModifiedOn = System.DateTime.Now;
                    labReportTemplate.ModifiedBy = currentUser.EmployeeId;

                    if (labReportTemplate.IsDefault == true)
                    {
                        LabReportTemplateModel rowToUpdate = (from rep in labDbContext.LabReportTemplates
                                                              where rep.IsDefault == true
                                                              select rep
                                           ).FirstOrDefault();

                        if (rowToUpdate != null)
                        {
                            labDbContext.LabReportTemplates.Attach(rowToUpdate);
                            rowToUpdate.IsDefault = false;
                            labDbContext.SaveChanges();
                        }
                    }

                    labDbContext.SaveChanges();
                    responseData.Results = labReportTemplate;
                    responseData.Status = "OK";
                }
                else if (reqType == "updateLabTest")
                {

                    LabTestModel labTest = DanpheJSONConvert.DeserializeObject<LabTestModel>(ipStr);
                    //sud:24Sept'19--added condition for servicedepartment id as well.
                    BillItemPrice billItemPrice = billDbContext.BillItemPrice.Where(a => a.ItemName == labTest.LabTestName
                    && a.ServiceDepartmentId == labTest.ServiceDepartmentId).FirstOrDefault<BillItemPrice>();

                    using (var dbContextTransaction = labDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            //First Make all the Previous Mapping of Current Test False
                            List<LabTestComponentMapModel> mappedItemList = labDbContext.LabTestComponentMap.Where(mp => mp.LabTestId == labTest.LabTestId).ToList();
                            mappedItemList.ForEach(x => x.IsActive = false);
                            labDbContext.SaveChanges();

                            if (labTest.TemplateType.ToLower() == "html")
                            {
                                var componentToAdd = labTest.LabTestComponentsJSON[0];
                                List<LabTestJSONComponentModel> allOldComponents = (from test in labDbContext.LabTests
                                                                                    join componentMap in labDbContext.LabTestComponentMap on test.LabTestId equals componentMap.LabTestId
                                                                                    join component in labDbContext.LabTestComponents on componentMap.ComponentId equals component.ComponentId
                                                                                    where test.LabTestId == labTest.LabTestId && component.ComponentName == componentToAdd.ComponentName
                                                                                    select component).ToList();

                                if (allOldComponents.Count() > 0)
                                {
                                    var componentMapToUpdate = labTest.LabTestComponentMap[0];
                                    componentMapToUpdate.ComponentId = allOldComponents[0].ComponentId;
                                    var existMap = labDbContext.LabTestComponentMap.Where(mp => mp.LabTestId == labTest.LabTestId && mp.ComponentId == componentMapToUpdate.ComponentId).FirstOrDefault();

                                    existMap.IsActive = true;
                                    existMap.DisplaySequence = componentMapToUpdate.DisplaySequence;
                                    existMap.ShowInSheet = componentMapToUpdate.ShowInSheet;
                                    existMap.ModifiedBy = currentUser.EmployeeId;
                                    existMap.ModifiedOn = System.DateTime.Now;

                                    labDbContext.Entry(existMap).Property(x => x.IsActive).IsModified = true;
                                    labDbContext.Entry(existMap).Property(x => x.DisplaySequence).IsModified = true;
                                    labDbContext.Entry(existMap).Property(x => x.ShowInSheet).IsModified = true;
                                    labDbContext.Entry(existMap).Property(x => x.ModifiedBy).IsModified = true;
                                    labDbContext.Entry(existMap).Property(x => x.ModifiedBy).IsModified = true;

                                    labDbContext.SaveChanges();
                                }
                                else
                                {
                                    labDbContext.LabTestComponents.Add(componentToAdd);
                                    labDbContext.SaveChanges();
                                    var compId = componentToAdd.ComponentId;
                                    var componentMapToAdd = labTest.LabTestComponentMap[0];
                                    componentMapToAdd.ComponentId = compId;
                                    labDbContext.LabTestComponentMap.Add(componentMapToAdd);
                                    labDbContext.SaveChanges();
                                }

                            }
                            else
                            {

                                List<LabTestComponentMapModel> labMapToBeUpdated = labTest.LabTestComponentMap;
                                foreach (var itm in labMapToBeUpdated)
                                {
                                    var existingMap = labDbContext.LabTestComponentMap.Where(mp => mp.LabTestId == labTest.LabTestId && mp.ComponentId == itm.ComponentId).FirstOrDefault();
                                    //Newly added Mapping
                                    if (existingMap == null)
                                    {
                                        itm.ModifiedBy = currentUser.EmployeeId;
                                        itm.ModifiedOn = System.DateTime.Now;
                                        itm.IsActive = true;
                                        labDbContext.LabTestComponentMap.Add(itm);
                                        labDbContext.SaveChanges();
                                    }
                                    //Update Old Mapping
                                    else
                                    {
                                        existingMap.IsActive = true;
                                        existingMap.IndentationCount = itm.IndentationCount;
                                        existingMap.DisplaySequence = itm.DisplaySequence;
                                        existingMap.ShowInSheet = itm.ShowInSheet;
                                        existingMap.GroupName = itm.GroupName;
                                        existingMap.ModifiedBy = currentUser.EmployeeId;
                                        existingMap.ModifiedOn = System.DateTime.Now;

                                        labDbContext.Entry(existingMap).Property(x => x.IsActive).IsModified = true;
                                        labDbContext.Entry(existingMap).Property(x => x.GroupName).IsModified = true;
                                        labDbContext.Entry(existingMap).Property(x => x.IndentationCount).IsModified = true;
                                        labDbContext.Entry(existingMap).Property(x => x.DisplaySequence).IsModified = true;
                                        labDbContext.Entry(existingMap).Property(x => x.ShowInSheet).IsModified = true;
                                        labDbContext.Entry(existingMap).Property(x => x.ModifiedBy).IsModified = true;
                                        labDbContext.Entry(existingMap).Property(x => x.ModifiedBy).IsModified = true;
                                        labDbContext.SaveChanges();
                                    }
                                }

                            }

                            billItemPrice.IsActive = labTest.IsActive;
                            billItemPrice.ItemName = labTest.LabTestName;
                            billItemPrice.IsValidForReporting = labTest.IsValidForReporting;

                            labDbContext.LabTests.Attach(labTest);
                            labDbContext.BillItemPrice.Attach(billItemPrice);
                            labDbContext.Entry(labTest).State = EntityState.Modified;
                            labDbContext.Entry(labTest).Property(x => x.CreatedOn).IsModified = false;
                            labDbContext.Entry(labTest).Property(x => x.CreatedBy).IsModified = false;
                            labDbContext.Entry(labTest).Property(x => x.LabTestCode).IsModified = false;
                            labDbContext.Entry(labTest).Property(x => x.ProcedureCode).IsModified = false;
                            billItemPrice.TaxApplicable = labTest.IsTaxApplicable;
                            labTest.ModifiedOn = System.DateTime.Now;
                            labTest.ModifiedBy = currentUser.EmployeeId;
                            labDbContext.Entry(billItemPrice).Property(x => x.TaxApplicable).IsModified = true;
                            labDbContext.Entry(billItemPrice).Property(x => x.ItemName).IsModified = true;
                            labDbContext.Entry(billItemPrice).Property(x => x.IsActive).IsModified = true;
                            labDbContext.Entry(billItemPrice).Property(x => x.IsValidForReporting).IsModified = true;
                            labDbContext.SaveChanges();
                            dbContextTransaction.Commit();
                            responseData.Results = labTest;
                            responseData.Status = "OK";

                        }

                        catch (Exception ex)
                        {
                            dbContextTransaction.Rollback();
                            throw (ex);
                        }
                    }
                }


                else if (reqType == "updateDefaultSignatories")
                {
                    List<AdminParametersModel> AllSignatories = DanpheJSONConvert.DeserializeObject<List<AdminParametersModel>>(ipStr);
                    foreach (AdminParametersModel parameter in AllSignatories)
                    {
                        var parm = (from cfg in labDbContext.AdminParameters
                                    where cfg.ParameterId == parameter.ParameterId
                                    select cfg).FirstOrDefault();

                        parm.ParameterValue = parameter.ParameterValue;
                        labDbContext.Entry(parm).Property(p => p.ParameterValue).IsModified = true;
                        labDbContext.SaveChanges();
                    }

                    responseData.Results = AllSignatories;
                    responseData.Status = "OK";
                }
                else if (reqType == "updateLabTestComponent")
                {
                    List<LabTestJSONComponentModel> componentList = DanpheJSONConvert.DeserializeObject<List<LabTestJSONComponentModel>>(ipStr);
                    List<LabTestJSONComponentModel> componentListToReturn = new List<LabTestJSONComponentModel>();
                    using (var dbContextTransaction = labDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            var allLabComponents = labDbContext.LabTestComponents.ToList();
                            foreach (var comp in componentList)
                            {
                                var duplicateComponent = allLabComponents.FirstOrDefault(x => x.ComponentName == comp.ComponentName && x.DisplayName == comp.DisplayName);

                                if (duplicateComponent == null || (duplicateComponent != null && duplicateComponent.ComponentId == comp.ComponentId))
                                {
                                    var componentId = comp.ComponentId;
                                    var componentToUpdate = (from component in labDbContext.LabTestComponents
                                                             where component.ComponentId == componentId
                                                             select component).FirstOrDefault();

                                    componentToUpdate.ComponentName = comp.ComponentName;
                                    componentToUpdate.DisplayName = comp.DisplayName;
                                    componentToUpdate.ModifiedBy = currentUser.EmployeeId;
                                    componentToUpdate.ModifiedOn = System.DateTime.Now;
                                    componentToUpdate.Range = comp.Range;
                                    componentToUpdate.MaleRange = comp.MaleRange;
                                    componentToUpdate.FemaleRange = comp.FemaleRange;
                                    componentToUpdate.ChildRange = comp.ChildRange;
                                    componentToUpdate.RangeDescription = comp.RangeDescription;
                                    componentToUpdate.MinValue = comp.MinValue;
                                    componentToUpdate.MaxValue = comp.MaxValue;
                                    componentToUpdate.Unit = comp.Unit;
                                    componentToUpdate.ValueLookup = comp.ValueLookup;
                                    componentToUpdate.ValueType = comp.ValueType;
                                    componentToUpdate.Method = comp.Method;
                                    componentToUpdate.ControlType = comp.ControlType;

                                    labDbContext.Entry(componentToUpdate).State = EntityState.Modified;
                                    labDbContext.Entry(componentToUpdate).Property(x => x.CreatedOn).IsModified = false;
                                    labDbContext.Entry(componentToUpdate).Property(x => x.CreatedBy).IsModified = false;

                                    labDbContext.SaveChanges();
                                }

                            }
                            dbContextTransaction.Commit();

                            responseData.Results = componentList;
                            responseData.Status = "OK";
                        }
                        catch (Exception ex)
                        {
                            dbContextTransaction.Rollback();
                            throw (ex);
                        }
                    }
                }
                else if (reqType == "updateLabLookUpComponent")
                {
                    CoreCFGLookupModel Lookup = DanpheJSONConvert.DeserializeObject<CoreCFGLookupModel>(ipStr);
                    CoreCFGLookupModel LookupToReturn = new CoreCFGLookupModel();
                    using (var dbContextTransaction = labDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            var allLookupComponents = labDbContext.LabLookUps.ToList();
                            var duplicateComponent = allLookupComponents.FirstOrDefault(x => x.ModuleName == Lookup.ModuleName && x.LookUpName == Lookup.LookUpName && x.LookupDataJson == Lookup.LookupDataJson);

                            if (duplicateComponent == null || (duplicateComponent != null && duplicateComponent.LookUpId == Lookup.LookUpId))
                            {
                                var LookUpId = Lookup.LookUpId;
                                var LookupToUpdate = (from lookup in labDbContext.LabLookUps
                                                      where lookup.LookUpId == LookUpId
                                                      select lookup).FirstOrDefault();

                                LookupToUpdate.LookUpName = Lookup.LookUpName;
                                LookupToUpdate.LookupDataJson = Lookup.LookupDataJson;
                                LookupToUpdate.ModuleName = Lookup.ModuleName;
                                LookupToUpdate.Description = Lookup.Description;


                                labDbContext.Entry(LookupToUpdate).State = EntityState.Modified;

                                labDbContext.SaveChanges();
                            }

                            dbContextTransaction.Commit();

                            responseData.Results = Lookup;
                            responseData.Status = "OK";
                        }
                        catch (Exception ex)
                        {
                            dbContextTransaction.Rollback();
                            throw (ex);
                        }
                    }
                }

                else if (reqType == "updateLabVendor")
                {
                    LabVendorsModel vendorFromClient = DanpheJSONConvert.DeserializeObject<LabVendorsModel>(ipStr);
                    LabVendorsModel defaultVendor = labDbContext.LabVendors.Where(val => val.IsDefault == true).FirstOrDefault();


                    if (vendorFromClient != null && vendorFromClient.LabVendorId != 0)
                    {

                        if (vendorFromClient.IsDefault)
                        {
                            if (defaultVendor != null && defaultVendor.IsDefault)
                            {
                                defaultVendor.IsDefault = false;
                                labDbContext.Entry(defaultVendor).State = EntityState.Modified;
                                labDbContext.Entry(defaultVendor).Property(x => x.IsDefault).IsModified = true;
                            }
                        }




                        var vendorFromServer = (from ven in labDbContext.LabVendors
                                                where ven.LabVendorId == vendorFromClient.LabVendorId
                                                select ven).FirstOrDefault();

                        vendorFromServer.VendorCode = vendorFromClient.VendorCode;
                        vendorFromServer.VendorName = vendorFromClient.VendorName;
                        vendorFromServer.ContactAddress = vendorFromClient.ContactAddress;
                        vendorFromServer.ContactNo = vendorFromClient.ContactNo;
                        vendorFromServer.Email = vendorFromClient.Email;
                        vendorFromClient.IsActive = vendorFromClient.IsActive;
                        vendorFromServer.IsExternal = vendorFromClient.IsExternal;
                        vendorFromServer.IsDefault = vendorFromClient.IsDefault;

                        labDbContext.Entry(vendorFromServer).Property(v => v.VendorCode).IsModified = true;
                        labDbContext.Entry(vendorFromServer).Property(v => v.VendorName).IsModified = true;
                        labDbContext.Entry(vendorFromServer).Property(v => v.ContactAddress).IsModified = true;
                        labDbContext.Entry(vendorFromServer).Property(v => v.ContactNo).IsModified = true;
                        labDbContext.Entry(vendorFromServer).Property(v => v.Email).IsModified = true;
                        labDbContext.Entry(vendorFromServer).Property(v => v.IsActive).IsModified = true;
                        labDbContext.Entry(vendorFromServer).Property(v => v.IsExternal).IsModified = true;
                        labDbContext.Entry(vendorFromServer).Property(v => v.IsDefault).IsModified = true;

                        labDbContext.SaveChanges();

                        responseData.Results = vendorFromClient;//return the same data to client.
                        responseData.Status = "OK";
                    }
                    else
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "Couldn't find vendor.";
                    }
                }

                else if (reqType == "updateLabCategory")
                {
                    using(TransactionScope scope = new TransactionScope())
                    {
                        LabTestCategoryModel categoryFromClient = DanpheJSONConvert.DeserializeObject<LabTestCategoryModel>(ipStr);
                        var category = (from cat in labDbContext.LabTestCategory
                                        where cat.TestCategoryId == categoryFromClient.TestCategoryId
                                        select cat).FirstOrDefault();

                        if (categoryFromClient.IsDefault.HasValue && categoryFromClient.IsDefault.Value == true)
                        {
                            var defCat = labDbContext.LabTestCategory.Where(l => l.IsDefault == true).FirstOrDefault();
                            if (defCat != null)
                            {
                                defCat.IsDefault = false;
                                labDbContext.Entry(defCat).Property(d => d.IsDefault).IsModified = true;
                                labDbContext.SaveChanges();
                            }
                        }


                        category.TestCategoryName = categoryFromClient.TestCategoryName;
                        category.ModifiedOn = System.DateTime.Now;
                        category.ModifiedBy = currentUser.EmployeeId;
                        category.IsDefault = categoryFromClient.IsDefault;

                        labDbContext.Entry(category).Property(v => v.TestCategoryName).IsModified = true;
                        labDbContext.Entry(category).Property(v => v.ModifiedBy).IsModified = true;
                        labDbContext.Entry(category).Property(v => v.ModifiedOn).IsModified = true;
                        labDbContext.Entry(category).Property(v => v.IsDefault).IsModified = true;
                        labDbContext.SaveChanges();


                        var selectedPerm = rbacDbContext.Permissions.Where(p => p.PermissionId == category.PermissionId).FirstOrDefault();
                        selectedPerm.PermissionName = "lab-category-" + category.TestCategoryName;

                        rbacDbContext.Entry(selectedPerm).Property(v => v.PermissionName).IsModified = true;
                        rbacDbContext.SaveChanges();

                        responseData.Results = category;//return the same data to client.
                        responseData.Status = "OK";

                        scope.Complete();
                    }
                   
                }
                else if (reqType == "edit-mapped-component")
                {
                    LabGovReportMappingModel component = DanpheJSONConvert.DeserializeObject<LabGovReportMappingModel>(ipStr);
                    var dbComp = (from cmp in labDbContext.LabGovReportMapping
                                  where cmp.ReportMapId == component.ReportMapId
                                  select cmp).FirstOrDefault();

                    dbComp.LabItemId = component.LabItemId;
                    dbComp.IsActive = component.IsActive;
                    dbComp.IsComponentBased = component.IsComponentBased;
                    dbComp.IsResultCount = component.IsResultCount;
                    dbComp.ComponentId = component.ComponentId;
                    dbComp.PositiveIndicator = component.PositiveIndicator;

                    labDbContext.Entry(dbComp).Property(v => v.LabItemId).IsModified = true;
                    labDbContext.Entry(dbComp).Property(v => v.IsActive).IsModified = true;
                    labDbContext.Entry(dbComp).Property(v => v.IsComponentBased).IsModified = true;
                    labDbContext.Entry(dbComp).Property(v => v.IsResultCount).IsModified = true;
                    labDbContext.Entry(dbComp).Property(v => v.ComponentId).IsModified = true;
                    labDbContext.Entry(dbComp).Property(v => v.PositiveIndicator).IsModified = true;

                    labDbContext.SaveChanges();
                    responseData.Results = dbComp;
                    responseData.Status = "OK";

                }
                else if (reqType == "put-labtest-isactive")
                {
                    LabTestModel test = DanpheJSONConvert.DeserializeObject<LabTestModel>(ipStr);

                    labDbContext.LabTests.Attach(test);

                    labDbContext.Entry(test).Property(x => x.IsActive).IsModified = true;
                    labDbContext.SaveChanges();
                    responseData.Results = test;
                    responseData.Status = "OK";
                }
                else if (reqType == "put-labcategory-isactive")
                {
                    using (TransactionScope scope = new TransactionScope())
                    {
                        LabTestCategoryModel cat = DanpheJSONConvert.DeserializeObject<LabTestCategoryModel>(ipStr);
                        labDbContext.LabTestCategory.Attach(cat);

                        labDbContext.Entry(cat).Property(x => x.IsActive).IsModified = true;

                        labDbContext.SaveChanges();

                        var permName = "lab-category-" + cat.TestCategoryName;
                        var relatedPerm = rbacDbContext.Permissions.Where(p => p.PermissionName == permName).FirstOrDefault();
                        relatedPerm.IsActive = cat.IsActive.Value;
                        rbacDbContext.SaveChanges();
                        scope.Complete();
                        responseData.Results = cat;
                        responseData.Status = "OK";
                    }                    
                }
                else if(reqType == "put-lab-report-template-isactive")
                {
                    LabReportTemplateModel report = DanpheJSONConvert.DeserializeObject<LabReportTemplateModel>(ipStr);

                    labDbContext.LabReportTemplates.Attach(report);

                    labDbContext.Entry(report).Property(x => x.IsActive).IsModified = true;
                    labDbContext.SaveChanges();
                    responseData.Results = report;
                    responseData.Status = "OK";
                }
                else if(reqType == "put-lab-vendor-isactive")
                {
                    LabVendorsModel vendor = DanpheJSONConvert.DeserializeObject<LabVendorsModel>(ipStr);

                    labDbContext.LabVendors.Attach(vendor);

                    labDbContext.Entry(vendor).Property(x => x.IsActive).IsModified = true;
                    labDbContext.SaveChanges();
                    responseData.Results = vendor;
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
    }
}