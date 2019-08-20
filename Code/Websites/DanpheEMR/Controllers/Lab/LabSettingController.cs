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
                                           LabTestSpecimen = test.LabTestSpecimen,
                                           LabTestSpecimenSource = test.LabTestSpecimenSource,
                                           LabTestComponentsJSON = (from labTest in labDbContext.LabTests
                                                                    join componentMap in labDbContext.LabTestComponentMap on labTest.LabTestId equals componentMap.LabTestId
                                                                    join component in labDbContext.LabTestComponents on componentMap.ComponentId equals component.ComponentId
                                                                    where labTest.LabTestId == test.LabTestId && componentMap.IsActive == true
                                                                    select component).ToList(),
                                           LabTestComponentMap = (from componentMap in labDbContext.LabTestComponentMap
                                                                  where componentMap.LabTestId == test.LabTestId && componentMap.IsActive == true
                                                                  select componentMap).OrderBy(a=>a.DisplaySequence).ToList(),
                                           LOINC = test.LOINC,
                                           ReportTemplateId = test.ReportTemplateId,
                                           DisplaySequence = test.DisplaySequence.HasValue ? test.DisplaySequence : 1000,//default sequence is 1000
                                           IsSelected = false,
                                           IsPreference = false,
                                           IsValidSampling = test.IsValidSampling,
                                           IsActive = test.IsActive,
                                           HasNegativeResults = test.HasNegativeResults,
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
                                        where (dpt.DepartmentCode.ToLower() == "lab" || dpt.DepartmentCode.ToLower() == "pat")
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
                else if(reqType == "allLookUp")
                {
                    List<CoreCFGLookupModel> allLookUps = (from lookup in labDbContext.LabLookUps
                                                           where lookup.ModuleName.ToLower() == "lab"
                                                           select lookup).ToList();
                    responseData.Results = allLookUps;
                }
                else
                {


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
                        if(defaultVendor != null && defaultVendor.IsDefault)
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
                    BillItemPrice billItemPrice = billDbContext.BillItemPrice.Where(a => a.ItemName == labTest.LabTestName && a.ItemName == labTest.LabTestName).FirstOrDefault<BillItemPrice>();

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
                                    existMap.ModifiedBy = currentUser.EmployeeId;
                                    existMap.ModifiedOn = System.DateTime.Now;

                                    labDbContext.Entry(existMap).Property(x => x.IsActive).IsModified = true;
                                    labDbContext.Entry(existMap).Property(x => x.DisplaySequence).IsModified = true;
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
                                        existingMap.ModifiedBy = currentUser.EmployeeId;
                                        existingMap.ModifiedOn = System.DateTime.Now;

                                        labDbContext.Entry(existingMap).Property(x => x.IsActive).IsModified = true;
                                        labDbContext.Entry(existingMap).Property(x => x.IndentationCount).IsModified = true;
                                        labDbContext.Entry(existingMap).Property(x => x.DisplaySequence).IsModified = true;
                                        labDbContext.Entry(existingMap).Property(x => x.ModifiedBy).IsModified = true;
                                        labDbContext.Entry(existingMap).Property(x => x.ModifiedBy).IsModified = true;
                                        labDbContext.SaveChanges();
                                    }
                                }

                            }

                            billItemPrice.IsActive = labTest.IsActive;
                            billItemPrice.ItemName = labTest.LabTestName;

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
                    else {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "Couldn't find vendor.";
                    }
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