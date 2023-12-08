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
using DanpheEMR.Enums;

namespace DanpheEMR.Controllers
{
    public class LabSettingController : CommonController
    {

        private readonly LabDbContext _labDbContext;
        public LabSettingController(IOptions<MyConfiguration> _config) : base(_config)
        {
            _labDbContext = new LabDbContext(connString);
        }


        [HttpGet]
        [Route("ReportTemplates")]
        public IActionResult ReportTemplates()
        {
            //if (reqType == "labReportList")//!=null not needed for string.
            //{
            Func<object> func = () => (from rep in _labDbContext.LabReportTemplates
                                       select rep).ToList();
            return InvokeHttpGetFunction<object>(func);
        }


        [HttpGet]
        [Route("LabTests")]
        public IActionResult LabTests()
        {
            //if (reqType == "labTestsList")
            //{
            Func<object> func = () => GetLabTestList();
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("LabVendors")]
        public IActionResult LabVendors()
        {

            //if (reqType == "lab-vendors-list") //sud:22Apr'19
            //{
            Func<object> func = () => _labDbContext.LabVendors.ToList();
            return InvokeHttpGetFunction<object>(func);

        }


        [HttpGet]
        [Route("LabSignatories")]
        public IActionResult LabSignatories()
        {
            //if (reqType == "labSignatories")
            //{
            Func<object> func = () => GetLabSignatories();
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("LabTestComponents")]
        public IActionResult LabTestComponents()
        {
            //if (reqType == "allLabTestComponentList")
            //{
            Func<object> func = () => (from labComponent in _labDbContext.LabTestComponents
                                       select labComponent).ToList();
            return InvokeHttpGetFunction<object>(func);

        }

        [HttpGet]
        [Route("LabLookupList")]
        public IActionResult LabLookupList()
        {
            //if (reqType == "allLookUp")
            //{
            Func<object> func = () => (from lookup in _labDbContext.LabLookUps
                                       where lookup.ModuleName.ToLower() == "lab"
                                       select lookup).ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("LabGovReportingItems")]
        public IActionResult LabGovReportingItems()
        {
            //if (reqType == "allGovLabTestComponentList")
            //{
            Func<object> func = () => (from item in _labDbContext.LabGovReportItems
                                       select item).ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("LabGovReportMappingDetail")]
        public IActionResult LabGovReportMappingDetail()
        {
            //if (reqType == "all-mapped-components")
            //{
            Func<object> func = () => GetGovReportMappingDetail();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("OutsourceApplicableLabTests")]
        public IActionResult GetOutsourceApplicableLabTests()
        {
            Func<object> func = () => GetOutsourceLabTests();
            return InvokeHttpGetFunction<object>(func);
        }

        private object GetOutsourceLabTests()
        {
            var result = _labDbContext.LabTests.Where(test => test.IsOutsourceTest ==  true).ToList();
            return result;
        }

        private object GetLabTestList()
        {
            List<LabTestJSONComponentModel> allLabTestComponents = (from labComponent in _labDbContext.LabTestComponents
                                                                    select labComponent).ToList();
            var allLabTests = (from test in _labDbContext.LabTests
                               join report in _labDbContext.LabReportTemplates on test.ReportTemplateId equals report.ReportTemplateID
                               join billItem in _labDbContext.BillServiceItems on test.LabTestId equals billItem.IntegrationItemId
                               join srv in _labDbContext.ServiceDepartment on billItem.ServiceDepartmentId equals srv.ServiceDepartmentId
                               join category in _labDbContext.LabTestCategory on test.LabTestCategoryId equals category.TestCategoryId
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
                                   LabTestComponentsJSON = (from labTest in _labDbContext.LabTests
                                                            join componentMap in _labDbContext.LabTestComponentMap on labTest.LabTestId equals componentMap.LabTestId
                                                            join component in _labDbContext.LabTestComponents on componentMap.ComponentId equals component.ComponentId
                                                            where labTest.LabTestId == test.LabTestId && componentMap.IsActive == true
                                                            select component).ToList(),
                                   LabTestComponentMap = (from componentMap in _labDbContext.LabTestComponentMap
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
                                   IsTaxApplicable = billItem.IsTaxApplicable,
                                   IsOutsourceTest = test.IsOutsourceTest,//sud:22Aug'23--For Outsource test
                                   DefaultOutsourceVendorId = test.DefaultOutsourceVendorId,
                                   IsLISApplicable = test.IsLISApplicable,
                               }).ToList();


            return allLabTests;
        }

        private object GetLabSignatories()
        {
            LabSignatoriesViewModel signatoriesData = new LabSignatoriesViewModel();
            signatoriesData.AllSignatories = (from cfg in _labDbContext.AdminParameters
                                              where cfg.ParameterGroupName.ToLower() == "lab"
                                              && (cfg.ParameterName == "DefaultHistoCytoSignatoriesEmpId" || cfg.ParameterName == "DefaultSignatoriesEmpId")
                                              select cfg
                                  ).ToList();


            var departmentId = (from dpt in _labDbContext.Department
                                where (dpt.DepartmentCode.ToLower() == "lab" || dpt.DepartmentCode.ToLower() == "pat"
                                || dpt.DepartmentName.ToLower() == "pathology" || dpt.DepartmentName.ToLower() == "lab" || dpt.DepartmentName.ToLower() == "laboratory")
                                select dpt.DepartmentId
                              ).ToList();


            signatoriesData.AllDoctors = (from doc in _labDbContext.Employee
                                          where departmentId.Contains((int)doc.DepartmentId)
                                          select doc
                            ).ToList();

            return signatoriesData;
        }

        private object GetGovReportMappingDetail()
        {

            var mappedTestItems = (from m in _labDbContext.LabGovReportMapping
                                   join t in _labDbContext.LabTests on m.LabItemId equals t.LabTestId
                                   where m.IsActive == true && (!m.ComponentId.HasValue || m.ComponentId.Value == 0)
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
            var mappedComponentItems = (from m in _labDbContext.LabGovReportMapping
                                        join l in _labDbContext.LabTests on m.LabItemId equals l.LabTestId
                                        join c in _labDbContext.LabTestComponents on m.ComponentId equals c.ComponentId
                                        where m.IsActive == true  && (m.ComponentId.HasValue && m.ComponentId.Value > 0)
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

            var masterGovItems = _labDbContext.LabGovReportItems.Where(d => d.IsActive == true).ToList();

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
                                ComponentId = (t == null) ? 0 : t.ComponentId,
                                PositiveIndicator = (t == null) ? "" : t.PositiveIndicator,
                                ReportItemId = item.ReportItemId,
                                LabItemId = (t == null) ? 0 : t.LabItemId,
                                IsResultCount = (t == null) ? false : t.IsResultCount,
                                IsActive = (t == null) ? false : t.IsActive,
                                SerialNumber = item.SerialNumber,
                                GroupName = item.GroupName
                            }).OrderBy(b => b.ReportItemId).ToList();

            return allItems;

        }

        [HttpPost]
        [Route("LabReportTemplate")]
        public ActionResult PostLabReportTemplate()
        {
            //if (reqType != null && reqType == "postLabReport")
            //{
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string ipDataString = this.ReadPostData();

            Func<object> func = () => AddReportTemplateMaster(ipDataString, currentUser);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("LabTest")]
        public ActionResult PostLabTest()
        {
            //if (reqType == "postLabTest")
            //{
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string ipDataString = this.ReadPostData();

            Func<object> func = () => AddLabTestMaster(ipDataString, currentUser);
            return InvokeHttpPostFunction(func);
        }


        [HttpPost]
        [Route("LabComponentsInBulk")]
        public ActionResult PostLabComponentsInBulk()
        {
            //if (reqType == "postLabComponents")
            //{
            string ipDataString = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddLabComponentsInBulk(ipDataString,currentUser);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("LabLookup")]
        public ActionResult PostLabLookup()
        {
            //if (reqType == "postLabLookUp")
            //{
            string ipDataString = this.ReadPostData();
            Func<object> func = () => AddLabLookup(ipDataString);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("LabVendor")]
        public ActionResult PostLabVendor()
        {
            //if (reqType == "add-vendor")
            //{
            string ipDataString = this.ReadPostData();
            Func<object> func = () => AddLabVendor(ipDataString);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("LabCategory")]
        public ActionResult PostLabCategory()
        {
            //if (reqType == "postLabCategory")
            //{
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string ipDataString = this.ReadPostData();
            RbacDbContext rbacDbContext = new RbacDbContext(connString);
            Func<object> func = () => AddLabCategoryMaster(ipDataString, currentUser, rbacDbContext);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("LabSpecimen")]
        public ActionResult PostLabSpecimen()
        {
            //if (reqType == "postLabSpecimen")
            //{
            string ipDataString = this.ReadPostData();
            RbacDbContext rbacDbContext = new RbacDbContext(connString);
            Func<object> func = () => AddLabSpecimen(ipDataString);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("GovReportMapping")]
        public ActionResult PostGovReportMapping()
        {
            //if (reqType == "post-mapped-component")
            //{
            string ipDataString = this.ReadPostData();
            RbacDbContext rbacDbContext = new RbacDbContext(connString);
            Func<object> func = () => AddLabGovReportMapping(ipDataString);
            return InvokeHttpPostFunction(func);
        }


        private object AddReportTemplateMaster(string ipDataString, RbacUser currentUser)
        {
            LabReportTemplateModel labReportTemplate = DanpheJSONConvert.DeserializeObject<LabReportTemplateModel>(ipDataString);
            labReportTemplate.CreatedOn = System.DateTime.Now;
            labReportTemplate.CreatedBy = currentUser.EmployeeId;

            //Remove Previous Default Template Set and make the current one default by Assigning IsDefault of previous to False and Current to True
            if (labReportTemplate.IsDefault == true)
            {
                LabReportTemplateModel rowToUpdate = (from rep in _labDbContext.LabReportTemplates
                                                      where rep.IsDefault == true
                                                      select rep
                                   ).FirstOrDefault();


                _labDbContext.LabReportTemplates.Attach(rowToUpdate);
                rowToUpdate.IsDefault = false;
                _labDbContext.SaveChanges();
            }


            _labDbContext.LabReportTemplates.Add(labReportTemplate);
            _labDbContext.SaveChanges();
            return labReportTemplate;
        }


        private object AddLabTestMaster(string ipDataString, RbacUser currentUser)
        {
            using (var dbContextTransaction = _labDbContext.Database.BeginTransaction())
            {
                try
                {
                    LabTestModel labTest = DanpheJSONConvert.DeserializeObject<LabTestModel>(ipDataString);
                    BillServiceItemModel billItemPrice = new BillServiceItemModel();
                    billItemPrice.AllowMultipleQty = true;
                    labTest.CreatedBy = currentUser.EmployeeId;
                    labTest.CreatedOn = System.DateTime.Now;
                    labTest.DefaultOutsourceVendorId = labTest.DefaultOutsourceVendorId == 0 ? null : labTest.DefaultOutsourceVendorId;
                    _labDbContext.LabTests.Add(labTest);
                    _labDbContext.SaveChanges();

                    var labComponentMapList = labTest.LabTestComponentMap;

                    if (labTest.TemplateType.ToLower() == "html")
                    {
                        var htmlComp = labTest.LabTestComponentsJSON[0];
                        htmlComp.CreatedBy = currentUser.EmployeeId;
                        htmlComp.CreatedOn = System.DateTime.Now;
                        _labDbContext.LabTestComponents.Add(htmlComp);
                        _labDbContext.SaveChanges();
                        LabTestComponentMapModel htmlCompToMap = new LabTestComponentMapModel();
                        htmlCompToMap.ComponentId = htmlComp.ComponentId;
                        htmlCompToMap.LabTestId = labTest.LabTestId;
                        htmlCompToMap.CreatedBy = currentUser.EmployeeId;
                        htmlCompToMap.CreatedOn = System.DateTime.Now;
                        htmlCompToMap.IsActive = true;
                        _labDbContext.LabTestComponentMap.Add(htmlCompToMap);
                        _labDbContext.SaveChanges();
                    }
                    else
                    {
                        foreach (var component in labComponentMapList)
                        {
                            component.CreatedBy = currentUser.EmployeeId;
                            component.CreatedOn = System.DateTime.Now;
                            component.LabTestId = labTest.LabTestId;

                            _labDbContext.LabTestComponentMap.Add(component);
                            _labDbContext.SaveChanges();
                        }
                    }

                    _labDbContext.LabTests.Attach(labTest);

                    billItemPrice.ItemName = labTest.LabTestName;
                    billItemPrice.ItemCode = labTest.LabTestCode;
                    billItemPrice.IntegrationName = ENUM_IntegrationNames.LAB;
                    billItemPrice.DefaultDoctorList = "[]";
                    //Will Update this hardcode Later
                    billItemPrice.ServiceDepartmentId = labTest.ServiceDepartmentId ?? default(int); //typecase for default int
                    //billItemPrice.Price = 0;
                    billItemPrice.IntegrationItemId = Convert.ToInt32(labTest.LabTestId);
                    billItemPrice.IsTaxApplicable = labTest.IsTaxApplicable.HasValue ? labTest.IsTaxApplicable.Value : false;
                    billItemPrice.CreatedBy = currentUser.EmployeeId;
                    billItemPrice.CreatedOn = System.DateTime.Now;
                    billItemPrice.IsActive = true;
                    //billItemPrice.DiscountApplicable = true;
                    //billItemPrice.IsFractionApplicable = false;
                    //billItemPrice.EHSPrice = 0;
                    //billItemPrice.IsNormalPriceApplicable = true;
                    billItemPrice.IsValidForReporting = labTest.IsValidForReporting;

                    Int64 labTestId = labTest.LabTestId;//LabtestId comes only after this model is saved to database
                    if (string.IsNullOrEmpty(labTest.LabTestCode))
                    {
                        labTest.LabTestCode = "L-" + labTest.LabTestId.ToString("D6");
                    }

                    labTest.ProcedureCode = "LAB-" + labTest.LabTestId.ToString("D6");
                    _labDbContext.Entry(labTest).Property(t => t.LabTestCode).IsModified = true;
                    _labDbContext.Entry(labTest).Property(t => t.ProcedureCode).IsModified = true;

                    //billItemPrice.ProcedureCode = labTest.ProcedureCode;
                    _labDbContext.BillServiceItems.Add(billItemPrice);
                    _labDbContext.SaveChanges();
                    dbContextTransaction.Commit();
                    return labTest;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw (ex);
                }

            }
        }

        private object AddLabComponentsInBulk(string ipDataString, RbacUser currentUser)
        {
            List<LabTestJSONComponentModel> componentList = DanpheJSONConvert.DeserializeObject<List<LabTestJSONComponentModel>>(ipDataString);
            using (var dbContextTransaction = _labDbContext.Database.BeginTransaction())
            {
                try
                {
                    var allLabComponents = _labDbContext.LabTestComponents.ToList();

                    foreach (var comp in componentList)
                    {
                        var duplicateComponent = allLabComponents.FirstOrDefault(x => x.ComponentName == comp.ComponentName && x.DisplayName == comp.DisplayName);
                        if (duplicateComponent == null)
                        {
                            comp.CreatedBy = currentUser.EmployeeId;
                            comp.CreatedOn = DateTime.Now;
                            _labDbContext.LabTestComponents.Add(comp);
                        }
                    }
                    _labDbContext.SaveChanges();
                    dbContextTransaction.Commit();

                    return componentList;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw (ex);
                }
            }


        }

        private object AddLabLookup(string ipDataString)
        {
            CoreCFGLookupModel Lookup = DanpheJSONConvert.DeserializeObject<CoreCFGLookupModel>(ipDataString);
            using (var dbContextTransaction = _labDbContext.Database.BeginTransaction())
            {
                try
                {
                    var allLookUps = _labDbContext.LabLookUps.ToList();

                    var duplicateLookup = allLookUps.FirstOrDefault(x => x.ModuleName == Lookup.ModuleName && x.LookUpName == Lookup.LookUpName && x.LookupDataJson == Lookup.LookupDataJson);
                    if (duplicateLookup == null)
                    {
                        _labDbContext.LabLookUps.Add(Lookup);
                        _labDbContext.SaveChanges();
                    }
                    dbContextTransaction.Commit();

                    return Lookup;

                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw (ex);
                }
            }

        }

        private object AddLabVendor(string ipDataString)
        {
            LabVendorsModel vendorFromClient = DanpheJSONConvert.DeserializeObject<LabVendorsModel>(ipDataString);
            LabVendorsModel defaultVendor = _labDbContext.LabVendors.Where(val => val.IsDefault == true).FirstOrDefault();
            if (vendorFromClient.IsDefault)
            {
                if (defaultVendor != null && defaultVendor.IsDefault)
                {
                    defaultVendor.IsDefault = false;
                    _labDbContext.Entry(defaultVendor).State = EntityState.Modified;
                    _labDbContext.Entry(defaultVendor).Property(x => x.IsDefault).IsModified = true;
                }
            }
            _labDbContext.LabVendors.Add(vendorFromClient);
            _labDbContext.SaveChanges();
            return vendorFromClient;//return same data to client.
        }

        private object AddLabCategoryMaster(string ipDataString, RbacUser currentUser, RbacDbContext _rbacDbContext)
        {

            LabTestCategoryModel categoryFromClient = DanpheJSONConvert.DeserializeObject<LabTestCategoryModel>(ipDataString);

            if (categoryFromClient.IsDefault && categoryFromClient.IsDefault == true)
            {
                var defCat = _labDbContext.LabTestCategory.Where(l => l.IsDefault == true).FirstOrDefault();
                if (defCat != null)
                {
                    _labDbContext.LabTestCategory.Attach(defCat);
                    defCat.IsDefault = false;
                    _labDbContext.Entry(defCat).Property(x => x.IsDefault).IsModified = true;
                    _labDbContext.SaveChanges();
                }
            }

            categoryFromClient.CreatedBy = currentUser.EmployeeId;
            categoryFromClient.CreatedOn = System.DateTime.Now;

            var applicationId = _rbacDbContext.Applications.Where(a => (a.ApplicationCode.ToLower() == "lab")).FirstOrDefault()?.ApplicationId;

            var permissionModel = new RbacPermission();
            permissionModel.PermissionName = "lab-category-" + categoryFromClient.TestCategoryName;
            permissionModel.IsActive = true;
            permissionModel.ApplicationId = applicationId;
            permissionModel.CreatedOn = System.DateTime.Now;
            permissionModel.CreatedBy = currentUser.EmployeeId;
            permissionModel.IsActive = true;

            _rbacDbContext.Permissions.Add(permissionModel);
            _rbacDbContext.SaveChanges();

            categoryFromClient.PermissionId = permissionModel.PermissionId;
            _labDbContext.LabTestCategory.Add(categoryFromClient);
            _labDbContext.SaveChanges();


            return categoryFromClient;//return same data to client.
        }

        private object AddLabSpecimen(string ipDataString)
        {

            var specimenName = ipDataString;//We're just taking SpecimenName as a Input
            LabTestMasterSpecimen SpecimenModel = new LabTestMasterSpecimen();
            SpecimenModel.SpecimenName = specimenName;
            _labDbContext.LabTestSpecimen.Add(SpecimenModel);
            _labDbContext.SaveChanges();
            return "Lab specimen Added successfully.";
        }

        private object AddLabGovReportMapping(string ipDataString)
        {
            LabGovReportMappingModel item = DanpheJSONConvert.DeserializeObject<LabGovReportMappingModel>(ipDataString);
            if (item != null)
            {
                item.ReportItemId = item.ReportItemId;

                _labDbContext.LabGovReportMapping.Add(item);
                _labDbContext.SaveChanges();
            }
            else
            {
                throw new Exception("Lab GovReport MappingItem is invalid; ");
            }

            return item;
        }
 


        [HttpPut]
        [Route("LabReportTemplate")]
        public ActionResult PutLabReportTemplate()
        {
            //if (reqType == "updateLabReport")
            //{
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string ipDataString = this.ReadPostData();

            Func<object> func = () => UpdateLabReportTemplate(ipDataString, currentUser);
            return InvokeHttpPutFunction(func);
        }


        [HttpPut]
        [Route("LabTest")]
        public ActionResult PutLabTest()
        {
            //if (reqType == "updateLabTest")
            //{

            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string ipDataString = this.ReadPostData();
            BillingDbContext billingDbContext = new BillingDbContext(connString);

            Func<object> func = () => UpdateLabTest(ipDataString, currentUser);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("LabDefaultSignatories")]
        public ActionResult PutLabDefaultSignatories()
        {
            //if (reqType == "updateDefaultSignatories")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string ipDataString = this.ReadPostData();

            Func<object> func = () => UpdateLabDefaultSignatoriesToParameter(ipDataString);
            return InvokeHttpPutFunction(func);
        }


        [HttpPut]
        [Route("LabComponentsInBulk")]
        public ActionResult PutLabComponentsInBulk()
        {
            //if (reqType == "updateLabTestComponent")
            //{
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string ipDataString = this.ReadPostData();
            Func<object> func = () => UpdateLabComponentsInBulk(ipDataString, currentUser);
            return InvokeHttpPutFunction(func);
        }


        [HttpPut]
        [Route("LabLookup")]
        public ActionResult PutLabLookup()
        {
            //if (reqType == "updateLabLookUpComponent")
            //{
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string ipDataString = this.ReadPostData();
            Func<object> func = () => UpdateLabLookup(ipDataString);
            return InvokeHttpPutFunction(func);
        }


        [HttpPut]
        [Route("LabVendor")]
        public ActionResult PutLabVendor()
        {
            //if (reqType == "updateLabVendor")
            //{
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string ipDataString = this.ReadPostData();
            Func<object> func = () => UpdateLabVendor(ipDataString);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("LabCategory")]
        public ActionResult PutLabCategory()
        {
            //if (reqType == "updateLabCategory")
            //{
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string ipDataString = this.ReadPostData();
            RbacDbContext rbacDbContext = new RbacDbContext(connString);
            Func<object> func = () => UpdateLabCategoryMaster(ipDataString, currentUser, rbacDbContext);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("GovReportMapping")]
        public ActionResult PutGovReportMapping()
        {
            //if (reqType == "edit-mapped-component")
            //{
            string ipDataString = this.ReadPostData();
            Func<object> func = () => UpdateGovReportMapping(ipDataString);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("LabTestActiveStatus")]
        public ActionResult PutLabTestActiveStatus()
        {
            //if (reqType == "put-labtest-isactive")
            //{
            string ipDataString = this.ReadPostData();
            Func<object> func = () => UpdateLabTestActiveStatus(ipDataString);
            return InvokeHttpPutFunction(func);
        }
        [HttpPut]
        [Route("LabCategoryActiveStatus")]
        public ActionResult PutLabCategoryActiveStatus()
        {
            //if (reqType == "put-labcategory-isactive")
            string ipDataString = this.ReadPostData();
            RbacDbContext _rbacDbContext = new RbacDbContext(connString);
            Func<object> func = () => UpdateLabCategoryActiveStatus(ipDataString, _rbacDbContext);
            return InvokeHttpPutFunction(func);
        }


        [HttpPut]
        [Route("LabReportTemplateActiveStatus")]
        public ActionResult PutLabReportTemplateActiveStatus()
        {
            //if (reqType == "put-lab-report-template-isactive")
            string ipDataString = this.ReadPostData();
            Func<object> func = () => UpdateReportTemplateActiveStatus(ipDataString);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("LabVendorActiveStatus")]
        public ActionResult PutLabVendorActiveStatus()
        {
            //if (reqType == "put-lab-vendor-isactive")
            string ipDataString = this.ReadPostData();
            Func<object> func = () => UpdateLabVendorActiveStatus(ipDataString);
            return InvokeHttpPutFunction(func);
        }

        private object UpdateLabReportTemplate(string ipDataString, RbacUser currentUser)
        {
            LabReportTemplateModel labReportTemplate = DanpheJSONConvert.DeserializeObject<LabReportTemplateModel>(ipDataString);

            _labDbContext.LabReportTemplates.Attach(labReportTemplate);
            _labDbContext.Entry(labReportTemplate).State = EntityState.Modified;
            _labDbContext.Entry(labReportTemplate).Property(x => x.CreatedOn).IsModified = false;
            _labDbContext.Entry(labReportTemplate).Property(x => x.CreatedBy).IsModified = false;
            labReportTemplate.ModifiedOn = System.DateTime.Now;
            labReportTemplate.ModifiedBy = currentUser.EmployeeId;

            if (labReportTemplate.IsDefault == true)
            {
                LabReportTemplateModel rowToUpdate = (from rep in _labDbContext.LabReportTemplates
                                                      where rep.IsDefault == true
                                                      select rep
                                   ).FirstOrDefault();

                if (rowToUpdate != null)
                {
                    _labDbContext.LabReportTemplates.Attach(rowToUpdate);
                    rowToUpdate.IsDefault = false;
                    _labDbContext.SaveChanges();
                }
            }

            _labDbContext.SaveChanges();
            return labReportTemplate;

        }

        private object UpdateLabTest(string ipDataString, RbacUser currentUser)
        {

            LabTestModel labTest = DanpheJSONConvert.DeserializeObject<LabTestModel>(ipDataString);

            //sud:24Sept'19--added condition for servicedepartment id as well.
            BillServiceItemModel billItemPrice = _labDbContext.BillServiceItems.Where(a => a.ItemName == labTest.LabTestName
                                             && a.ServiceDepartmentId == labTest.ServiceDepartmentId).FirstOrDefault<BillServiceItemModel>();

            using (var dbContextTransaction = _labDbContext.Database.BeginTransaction())
            {
                try
                {
                    //First Make all the Previous Mapping of Current Test False
                    List<LabTestComponentMapModel> mappedItemList = _labDbContext.LabTestComponentMap.Where(mp => mp.LabTestId == labTest.LabTestId).ToList();
                    mappedItemList.ForEach(x => x.IsActive = false);
                    _labDbContext.SaveChanges();

                    if (labTest.TemplateType.ToLower() == "html")
                    {
                        var componentToAdd = labTest.LabTestComponentsJSON[0];
                        List<LabTestJSONComponentModel> allOldComponents = (from test in _labDbContext.LabTests
                                                                            join componentMap in _labDbContext.LabTestComponentMap on test.LabTestId equals componentMap.LabTestId
                                                                            join component in _labDbContext.LabTestComponents on componentMap.ComponentId equals component.ComponentId
                                                                            where test.LabTestId == labTest.LabTestId && component.ComponentName == componentToAdd.ComponentName
                                                                            select component).ToList();

                        if (allOldComponents.Count() > 0)
                        {
                            var componentMapToUpdate = labTest.LabTestComponentMap[0];
                            componentMapToUpdate.ComponentId = allOldComponents[0].ComponentId;
                            var existMap = _labDbContext.LabTestComponentMap.Where(mp => mp.LabTestId == labTest.LabTestId && mp.ComponentId == componentMapToUpdate.ComponentId).FirstOrDefault();

                            existMap.IsActive = true;
                            existMap.DisplaySequence = componentMapToUpdate.DisplaySequence;
                            existMap.ShowInSheet = componentMapToUpdate.ShowInSheet;
                            existMap.ModifiedBy = currentUser.EmployeeId;
                            existMap.ModifiedOn = System.DateTime.Now;

                            _labDbContext.Entry(existMap).Property(x => x.IsActive).IsModified = true;
                            _labDbContext.Entry(existMap).Property(x => x.DisplaySequence).IsModified = true;
                            _labDbContext.Entry(existMap).Property(x => x.ShowInSheet).IsModified = true;
                            _labDbContext.Entry(existMap).Property(x => x.ModifiedBy).IsModified = true;
                            _labDbContext.Entry(existMap).Property(x => x.ModifiedBy).IsModified = true;

                            _labDbContext.SaveChanges();
                        }
                        else
                        {
                            _labDbContext.LabTestComponents.Add(componentToAdd);
                            _labDbContext.SaveChanges();
                            var compId = componentToAdd.ComponentId;
                            var componentMapToAdd = labTest.LabTestComponentMap[0];
                            componentMapToAdd.ComponentId = compId;
                            _labDbContext.LabTestComponentMap.Add(componentMapToAdd);
                            _labDbContext.SaveChanges();
                        }

                    }
                    else
                    {

                        List<LabTestComponentMapModel> labMapToBeUpdated = labTest.LabTestComponentMap;
                        foreach (var itm in labMapToBeUpdated)
                        {
                            var existingMap = _labDbContext.LabTestComponentMap.Where(mp => mp.LabTestId == labTest.LabTestId && mp.ComponentId == itm.ComponentId).FirstOrDefault();
                            //Newly added Mapping
                            if (existingMap == null)
                            {
                                itm.CreatedBy = currentUser.EmployeeId;
                                itm.CreatedOn = System.DateTime.Now;
                                itm.IsActive = true;
                                _labDbContext.LabTestComponentMap.Add(itm);
                                _labDbContext.SaveChanges();
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

                                _labDbContext.Entry(existingMap).Property(x => x.IsActive).IsModified = true;
                                _labDbContext.Entry(existingMap).Property(x => x.GroupName).IsModified = true;
                                _labDbContext.Entry(existingMap).Property(x => x.IndentationCount).IsModified = true;
                                _labDbContext.Entry(existingMap).Property(x => x.DisplaySequence).IsModified = true;
                                _labDbContext.Entry(existingMap).Property(x => x.ShowInSheet).IsModified = true;
                                _labDbContext.Entry(existingMap).Property(x => x.ModifiedBy).IsModified = true;
                                _labDbContext.Entry(existingMap).Property(x => x.ModifiedBy).IsModified = true;
                                _labDbContext.SaveChanges();
                            }
                        }

                    }

                    billItemPrice.IsActive = labTest.IsActive;
                    billItemPrice.ItemName = labTest.LabTestName;
                    billItemPrice.IsValidForReporting = labTest.IsValidForReporting;
                    labTest.DefaultOutsourceVendorId = labTest.DefaultOutsourceVendorId == 0 ? null : labTest.DefaultOutsourceVendorId;
                    _labDbContext.LabTests.Attach(labTest);
                    _labDbContext.BillServiceItems.Attach(billItemPrice);
                    _labDbContext.Entry(labTest).State = EntityState.Modified;
                    _labDbContext.Entry(labTest).Property(x => x.CreatedOn).IsModified = false;
                    _labDbContext.Entry(labTest).Property(x => x.CreatedBy).IsModified = false;
                    _labDbContext.Entry(labTest).Property(x => x.LabTestCode).IsModified = false;
                    _labDbContext.Entry(labTest).Property(x => x.ProcedureCode).IsModified = false;
                    billItemPrice.IsTaxApplicable = labTest.IsTaxApplicable.HasValue ? labTest.IsTaxApplicable.Value : false;
                    labTest.ModifiedOn = System.DateTime.Now;
                    labTest.ModifiedBy = currentUser.EmployeeId;
                    _labDbContext.Entry(billItemPrice).Property(x => x.IsTaxApplicable).IsModified = true;
                    _labDbContext.Entry(billItemPrice).Property(x => x.ItemName).IsModified = true;
                    _labDbContext.Entry(billItemPrice).Property(x => x.IsActive).IsModified = true;
                    _labDbContext.Entry(billItemPrice).Property(x => x.IsValidForReporting).IsModified = true;
                    _labDbContext.SaveChanges();
                    dbContextTransaction.Commit();
                    return labTest;
                }

                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw (ex);
                }
            }

        }

        private object UpdateLabDefaultSignatoriesToParameter(string ipDataString)
        {
            List<AdminParametersModel> AllSignatories = DanpheJSONConvert.DeserializeObject<List<AdminParametersModel>>(ipDataString);
            foreach (AdminParametersModel parameter in AllSignatories)
            {
                var parm = (from cfg in _labDbContext.AdminParameters
                            where cfg.ParameterId == parameter.ParameterId
                            select cfg).FirstOrDefault();

                parm.ParameterValue = parameter.ParameterValue;
                _labDbContext.Entry(parm).Property(p => p.ParameterValue).IsModified = true;

            }

            _labDbContext.SaveChanges();
            return AllSignatories;
        }

        private object UpdateLabComponentsInBulk(string ipDataString, RbacUser currentUser)
        {
            List<LabTestJSONComponentModel> componentList = DanpheJSONConvert.DeserializeObject<List<LabTestJSONComponentModel>>(ipDataString);

            using (var dbContextTransaction = _labDbContext.Database.BeginTransaction())
            {
                try
                {
                    var allLabComponents = _labDbContext.LabTestComponents.ToList();
                    foreach (var comp in componentList)
                    {
                        var duplicateComponent = allLabComponents.FirstOrDefault(x => x.ComponentName == comp.ComponentName && x.DisplayName == comp.DisplayName);

                        if (duplicateComponent == null || (duplicateComponent != null && duplicateComponent.ComponentId == comp.ComponentId))
                        {
                            var componentId = comp.ComponentId;
                            var componentToUpdate = (from component in _labDbContext.LabTestComponents
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

                            _labDbContext.Entry(componentToUpdate).State = EntityState.Modified;
                            _labDbContext.Entry(componentToUpdate).Property(x => x.CreatedOn).IsModified = false;
                            _labDbContext.Entry(componentToUpdate).Property(x => x.CreatedBy).IsModified = false;


                        }

                    }
                    _labDbContext.SaveChanges();
                    dbContextTransaction.Commit();

                    return componentList;

                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw (ex);
                }
            }

        }

        private object UpdateLabLookup(string ipDataString)
        {
            CoreCFGLookupModel Lookup = DanpheJSONConvert.DeserializeObject<CoreCFGLookupModel>(ipDataString);
            CoreCFGLookupModel LookupToReturn = new CoreCFGLookupModel();
            using (var dbContextTransaction = _labDbContext.Database.BeginTransaction())
            {
                try
                {
                    var allLookupComponents = _labDbContext.LabLookUps.ToList();
                    var duplicateComponent = allLookupComponents.FirstOrDefault(x => x.ModuleName == Lookup.ModuleName && x.LookUpName == Lookup.LookUpName && x.LookupDataJson == Lookup.LookupDataJson);

                    if (duplicateComponent == null || (duplicateComponent != null && duplicateComponent.LookUpId == Lookup.LookUpId))
                    {
                        var LookUpId = Lookup.LookUpId;
                        var LookupToUpdate = (from lookup in _labDbContext.LabLookUps
                                              where lookup.LookUpId == LookUpId
                                              select lookup).FirstOrDefault();

                        LookupToUpdate.LookUpName = Lookup.LookUpName;
                        LookupToUpdate.LookupDataJson = Lookup.LookupDataJson;
                        LookupToUpdate.ModuleName = Lookup.ModuleName;
                        LookupToUpdate.Description = Lookup.Description;


                        _labDbContext.Entry(LookupToUpdate).State = EntityState.Modified;

                        _labDbContext.SaveChanges();
                    }

                    dbContextTransaction.Commit();

                    return Lookup;

                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw (ex);
                }
            }

        }

        private object UpdateLabVendor(string ipDataString)
        {

            LabVendorsModel vendorFromClient = DanpheJSONConvert.DeserializeObject<LabVendorsModel>(ipDataString);
            LabVendorsModel defaultVendor = _labDbContext.LabVendors.Where(val => val.IsDefault == true).FirstOrDefault();


            if (vendorFromClient != null && vendorFromClient.LabVendorId != 0)
            {

                if (vendorFromClient.IsDefault)
                {
                    if (defaultVendor != null && defaultVendor.IsDefault)
                    {
                        defaultVendor.IsDefault = false;
                        _labDbContext.Entry(defaultVendor).State = EntityState.Modified;
                        _labDbContext.Entry(defaultVendor).Property(x => x.IsDefault).IsModified = true;
                    }
                }

                var vendorFromServer = (from ven in _labDbContext.LabVendors
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

                _labDbContext.Entry(vendorFromServer).Property(v => v.VendorCode).IsModified = true;
                _labDbContext.Entry(vendorFromServer).Property(v => v.VendorName).IsModified = true;
                _labDbContext.Entry(vendorFromServer).Property(v => v.ContactAddress).IsModified = true;
                _labDbContext.Entry(vendorFromServer).Property(v => v.ContactNo).IsModified = true;
                _labDbContext.Entry(vendorFromServer).Property(v => v.Email).IsModified = true;
                _labDbContext.Entry(vendorFromServer).Property(v => v.IsActive).IsModified = true;
                _labDbContext.Entry(vendorFromServer).Property(v => v.IsExternal).IsModified = true;
                _labDbContext.Entry(vendorFromServer).Property(v => v.IsDefault).IsModified = true;

                _labDbContext.SaveChanges();

                return vendorFromClient;//return the same data to client.

            }
            else
            {
                throw new Exception("Lab vendor passed is invalid.");
            }

        }

        private object UpdateLabCategoryMaster(string ipDataString, RbacUser currentUser, RbacDbContext _rbacDbContext)
        {
            LabTestCategoryModel categoryFromClient = DanpheJSONConvert.DeserializeObject<LabTestCategoryModel>(ipDataString);
            var category = (from cat in _labDbContext.LabTestCategory
                            where cat.TestCategoryId == categoryFromClient.TestCategoryId
                            select cat).FirstOrDefault();

            if (categoryFromClient.IsDefault && categoryFromClient.IsDefault == true)
            {
                var defCat = _labDbContext.LabTestCategory.Where(l => l.IsDefault == true).FirstOrDefault();
                if (defCat != null)
                {
                    defCat.IsDefault = false;
                    _labDbContext.Entry(defCat).Property(d => d.IsDefault).IsModified = true;
                    _labDbContext.SaveChanges();
                }
            }


            category.TestCategoryName = categoryFromClient.TestCategoryName;
            category.ModifiedOn = System.DateTime.Now;
            category.ModifiedBy = currentUser.EmployeeId;
            category.IsDefault = categoryFromClient.IsDefault;

            _labDbContext.Entry(category).Property(v => v.TestCategoryName).IsModified = true;
            _labDbContext.Entry(category).Property(v => v.ModifiedBy).IsModified = true;
            _labDbContext.Entry(category).Property(v => v.ModifiedOn).IsModified = true;
            _labDbContext.Entry(category).Property(v => v.IsDefault).IsModified = true;
            _labDbContext.SaveChanges();

            //we need to upate the permission as well.
            var selectedPerm = _rbacDbContext.Permissions.Where(p => p.PermissionId == category.PermissionId).FirstOrDefault();
            selectedPerm.PermissionName = "lab-category-" + category.TestCategoryName;

            _rbacDbContext.Entry(selectedPerm).Property(v => v.PermissionName).IsModified = true;
            _rbacDbContext.SaveChanges();

            return category;//return the same data to client.

        }

        private object UpdateGovReportMapping(string ipDataString)
        {

            LabGovReportMappingModel component = DanpheJSONConvert.DeserializeObject<LabGovReportMappingModel>(ipDataString);
            var dbComp = (from cmp in _labDbContext.LabGovReportMapping
                          where cmp.ReportMapId == component.ReportMapId
                          select cmp).FirstOrDefault();

            dbComp.LabItemId = component.LabItemId;
            dbComp.IsActive = component.IsActive;
            dbComp.IsComponentBased = component.IsComponentBased;
            dbComp.IsResultCount = component.IsResultCount;
            dbComp.ComponentId = component.ComponentId;
            dbComp.PositiveIndicator = component.PositiveIndicator;

            _labDbContext.Entry(dbComp).Property(v => v.LabItemId).IsModified = true;
            _labDbContext.Entry(dbComp).Property(v => v.IsActive).IsModified = true;
            _labDbContext.Entry(dbComp).Property(v => v.IsComponentBased).IsModified = true;
            _labDbContext.Entry(dbComp).Property(v => v.IsResultCount).IsModified = true;
            _labDbContext.Entry(dbComp).Property(v => v.ComponentId).IsModified = true;
            _labDbContext.Entry(dbComp).Property(v => v.PositiveIndicator).IsModified = true;

            _labDbContext.SaveChanges();
            return dbComp;
        }

        private object UpdateLabTestActiveStatus(string ipDataString)
        {

            LabTestModel test = DanpheJSONConvert.DeserializeObject<LabTestModel>(ipDataString);

            _labDbContext.LabTests.Attach(test);
            _labDbContext.Entry(test).Property(x => x.IsActive).IsModified = true;
            _labDbContext.SaveChanges();
            BillServiceItemModel item = _labDbContext.BillServiceItems.Where(a => a.IntegrationItemId == test.LabTestId && a.ServiceDepartmentId == test.ServiceDepartmentId).FirstOrDefault();
            if (item != null)
            {
                item.IsActive = test.IsActive;
                _labDbContext.Entry(item).Property(x => x.IsActive).IsModified = true;
                _labDbContext.SaveChanges();
            }
            return test;
        }

        private object UpdateLabCategoryActiveStatus(string ipDataString, RbacDbContext rbacDbContext)
        {

            LabTestCategoryModel categoryModelFromClient = DanpheJSONConvert.DeserializeObject<LabTestCategoryModel>(ipDataString);
            _labDbContext.LabTestCategory.Attach(categoryModelFromClient);
            _labDbContext.Entry(categoryModelFromClient).Property(x => x.IsActive).IsModified = true;
            _labDbContext.SaveChanges();
            var permName = "lab-category-" + categoryModelFromClient.TestCategoryName;
            var relatedPerm = rbacDbContext.Permissions.Where(p => p.PermissionName == permName).FirstOrDefault();
            relatedPerm.IsActive = categoryModelFromClient.IsActive;
            rbacDbContext.SaveChanges();
            return categoryModelFromClient;

        }

        private object UpdateReportTemplateActiveStatus(string ipDataString)
        {
            LabReportTemplateModel report = DanpheJSONConvert.DeserializeObject<LabReportTemplateModel>(ipDataString);
            _labDbContext.LabReportTemplates.Attach(report);
            _labDbContext.Entry(report).Property(x => x.IsActive).IsModified = true;
            _labDbContext.SaveChanges();
            return report;
        }

        private object UpdateLabVendorActiveStatus(string ipDataString)
        {
            //if (reqType == "put-lab-vendor-isactive")
            LabVendorsModel vendor = DanpheJSONConvert.DeserializeObject<LabVendorsModel>(ipDataString);
            _labDbContext.LabVendors.Attach(vendor);
            _labDbContext.Entry(vendor).Property(x => x.IsActive).IsModified = true;
            _labDbContext.SaveChanges();
            return vendor;
        }
    }
}