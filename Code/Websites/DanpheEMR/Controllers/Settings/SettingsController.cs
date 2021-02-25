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
            BillingDbContext billingDbContext = new BillingDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

            try
            {
                if (reqType == "departments")
                {
                    List<DepartmentModel> deptList = (from d in masterDbContext.Departments
                                                      select d).OrderBy(d => d.DepartmentName).ToList();
                    responseData.Status = "OK";
                    responseData.Results = deptList;
                }
                if (reqType == "phrm-store")
                {
                    List<PHRMStoreModel> storeList = (from s in masterDbContext.Store
                                                      select s).ToList();
                    responseData.Status = "OK";
                    responseData.Results = storeList;
                }

                else if (reqType == "integrationName")
                {
                    List<IntegrationModel> integrationNameList = (from i in masterDbContext.IntegrationName
                                                                  select i).ToList();
                    responseData.Status = "OK";
                    responseData.Results = integrationNameList;
                }



                else if (reqType == "countries")
                {
                    List<CountryModel> countryList = (from d in masterDbContext.Country
                                                      select d).OrderBy(c => c.CountryName).ToList();
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
                                                             select param).OrderBy(p => p.ParameterId).ToList();
                    responseData.Status = "OK";
                    responseData.Results = parameterList;
                }

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        [HttpGet]
        [Route("~/api/Settings/GetStoreVerifiers/{StoreId}")]
        public IActionResult GetStoreVerifiers([FromRoute]int StoreId)
        {
            var context = new RbacDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();


            try
            {
                var StoreVerificationMapList = context.StoreVerificationMapModel.Where(svm => svm.StoreId == StoreId && svm.IsActive == true).OrderBy(svmf => svmf.VerificationLevel).ToList();
                if(StoreVerificationMapList != null)
                {
                    foreach (StoreVerificationMapModel StoreVerifier in StoreVerificationMapList)
                    {
                        StoreVerifier.NewRoleName = "";
                        StoreVerifier.RoleId = context.RolePermissionMaps.FirstOrDefault(rp => rp.PermissionId == StoreVerifier.PermissionId && rp.IsActive == true).RoleId;
                    }
                }
                responseData.Status = "OK";
                responseData.Results = StoreVerificationMapList;
            }
            catch (Exception)
            {
                responseData.Status = "Failed";
            }
            return Ok(responseData);
        }
        // POST api/values
        [HttpPost]
        public string Post()
        {

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();//type 'object' since we have variable return types
            responseData.Status = "OK";//by default status would be OK, hence assigning at the top
            MasterDbContext masterDbContext = new MasterDbContext(connString);
            BillingDbContext billingDbContext = new BillingDbContext(connString);
            LabDbContext labDbContext = new LabDbContext(connString);
            CoreDbContext coreDbContext = new CoreDbContext(connString);
            RbacDbContext rbacDbContext = new RbacDbContext(connString);

            try
            {
                int itemId = ToInt(this.ReadQueryStringData("itemId"));
                string reqType = this.ReadQueryStringData("reqType");
                string str = this.ReadPostData();
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

                if (reqType == "department")
                {
                    DepartmentModel deptModel = DanpheJSONConvert.DeserializeObject<DepartmentModel>(str);
                    deptModel.CreatedOn = System.DateTime.Now;
                    masterDbContext.Departments.Add(deptModel);
                    masterDbContext.SaveChanges();

                    if (deptModel.ServiceItemsList != null && deptModel.ServiceItemsList.Count > 0)
                    {
                        UpdateBillItemsOfDepartment(deptModel, masterDbContext);
                    }

                    responseData.Results = deptModel;
                    responseData.Status = "OK";
                }
                else if (reqType == "store")
                {
                    using (var dbContextTransaction = rbacDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            PHRMStoreModel storeModel = DanpheJSONConvert.DeserializeObject<PHRMStoreModel>(str);
                            storeModel = SubstoreBL.CreateStore(storeModel, rbacDbContext);
                            //create permission so that admin can create substore access right to the user

                            //add permission in store table
                            storeModel.PermissionId = SubstoreBL.CreatePermissionForStore(storeModel.Name, currentUser, rbacDbContext);

                            //create permission for each verifier
                            if (storeModel.StoreVerificationMapList != null)
                            {
                                int CurrentVerificationLevel = 1;
                                int MaxVerificationLevel = storeModel.MaxVerificationLevel;
                                foreach (var storeVerificationMap in storeModel.StoreVerificationMapList)
                                {
                                    SubstoreBL.CreateAndMapVerifiersWithStore(storeVerificationMap, storeModel, CurrentVerificationLevel,MaxVerificationLevel, currentUser, rbacDbContext);
                                    CurrentVerificationLevel++;
                                }
                            }

                            dbContextTransaction.Commit();
                            responseData.Results = storeModel;
                            responseData.Status = "OK";
                        }
                        catch (Exception ex)
                        {
                            dbContextTransaction.Rollback();
                            throw ex;
                        }
                    }
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
                else if (reqType == "lab-item")
                {
                    LabTestModel labItem = DanpheJSONConvert.DeserializeObject<LabTestModel>(str);

                    using (var dbContextTransaction = labDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            labItem.CreatedOn = DateTime.Now;
                            labItem.CreatedBy = currentUser.EmployeeId;
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
            BillingDbContext billingDbContext = new BillingDbContext(connString);
            CoreDbContext coreDbContext = new CoreDbContext(connString);
            RbacDbContext rbacDbContext = new RbacDbContext(connString);
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


                        if (clientDept.ServiceItemsList != null && clientDept.ServiceItemsList.Count > 0)
                        {
                            UpdateBillItemsOfDepartment(clientDept, masterDBContext);
                        }

                        masterDBContext.SaveChanges();
                        responseData.Results = clientDept;
                        responseData.Status = "OK";
                    }
                    else if (reqType == "storeActivation")
                    {
                        using (var dbContextTransaction = rbacDbContext.Database.BeginTransaction())
                        {
                            try
                            {
                                int storeId = DanpheJSONConvert.DeserializeObject<int>(str);

                                Boolean NewActiveStatus = SubstoreBL.ActivateDeactivateStore(storeId, currentUser, rbacDbContext);
                                //take the NewActiveStatus and set it to all the permission
                                //change the permission as well.
                                SubstoreBL.ActivateDeactivateAllStorePermission(storeId, NewActiveStatus, currentUser, rbacDbContext);


                                dbContextTransaction.Commit();
                                responseData.Results = true;
                                responseData.Status = "OK";
                            }
                            catch (Exception ex)
                            {
                                dbContextTransaction.Rollback();
                                throw ex;
                            }
                        }

                    }
                    else if (reqType == "store")
                    {
                        using (var dbContextTransaction = rbacDbContext.Database.BeginTransaction())
                        {
                            try
                            {
                                PHRMStoreModel store = DanpheJSONConvert.DeserializeObject<PHRMStoreModel>(str);
                                if (SubstoreBL.CheckForStoreDuplication(store.Name, store.StoreId, rbacDbContext))
                                {
                                    Exception ex = new Exception("Substore Already Exists.");
                                    throw ex;
                                }
                                var OldStoreName = rbacDbContext.Store.AsNoTracking().FirstOrDefault(a => a.StoreId == store.StoreId).Name.ToString();
                                var NewStoreName = store.Name;

                                //change the permission first as well.
                                if (OldStoreName != NewStoreName)
                                {
                                    SubstoreBL.UpdateStorePermissionName(NewStoreName, store.PermissionId, currentUser, rbacDbContext);

                                    SubstoreBL.UpdateStoreVerifierPermission(store, currentUser, rbacDbContext);

                                }
                                //if new verification level is added.
                                var OldMaxVerificationLevel = rbacDbContext.Store.AsNoTracking().FirstOrDefault(a => a.StoreId == store.StoreId).MaxVerificationLevel;
                                var NewMaxVerificationLevel = store.MaxVerificationLevel;
                                if (NewMaxVerificationLevel > OldMaxVerificationLevel)
                                {
                                    //create the new verification level and necessary permission level
                                    foreach (StoreVerificationMapModel storeVerificationMapModel in store.StoreVerificationMapList)
                                    {
                                        if (storeVerificationMapModel.VerificationLevel > OldMaxVerificationLevel)
                                        {
                                            SubstoreBL.CreateAndMapVerifiersWithStore(storeVerificationMapModel, store, ++OldMaxVerificationLevel, NewMaxVerificationLevel, currentUser, rbacDbContext);
                                        }
                                    }
                                }

                                SubstoreBL.UpdateRoleForVerifiers(store, currentUser, rbacDbContext);

                                rbacDbContext.Store.Attach(store);
                                rbacDbContext.Entry(store).State = EntityState.Modified;
                                rbacDbContext.Entry(store).Property(x => x.CreatedOn).IsModified = false;
                                rbacDbContext.Entry(store).Property(x => x.CreatedBy).IsModified = false;
                                store.ModifiedOn = System.DateTime.Now;
                                store.ModifiedBy = currentUser.EmployeeId;

                                rbacDbContext.SaveChanges();
                                responseData.Results = store;
                            }
                            catch (Exception ex)
                            {
                                dbContextTransaction.Rollback();
                                throw ex;
                            }

                            dbContextTransaction.Commit();
                            responseData.Status = "OK";
                        }
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


                    else if (reqType == "update-parameter")
                    {
                        CfgParameterModel parameter = DanpheJSONConvert.DeserializeObject<CfgParameterModel>(str);
                        var parmToUpdate = (from paramData in masterDBContext.CFGParameters
                                            where paramData.ParameterId == parameter.ParameterId
                                            //no need of below comparision since parameter id is Primary Key and we can compare only to it.
                                            //&& paramData.ParameterName == parameter.ParameterName
                                            //&& paramData.ParameterGroupName == parameter.ParameterGroupName
                                            select paramData
                                            ).FirstOrDefault();

                        parmToUpdate.ParameterValue = parameter.ParameterValue;

                        masterDBContext.Entry(parmToUpdate).Property(p => p.ParameterValue).IsModified = true;

                        masterDBContext.SaveChanges();
                        responseData.Status = "OK";
                        responseData.Results = parmToUpdate;
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





        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }

        public void UpdateBillItemsOfDepartment(DepartmentModel currDepartment, MasterDbContext masterDbContext)
        {

            List<BillItemPrice> itemList = currDepartment.ServiceItemsList;
            //BillingDbContext bilDbContext = new BillingDbContext(connString);


            itemList.ForEach(itm =>
            {
                //check if  current billingitem is already there.
                //add new if not exists, update if already exists.

                //case: 1 - Employee and Items are Fresh new, Employee is just added.
                //in this case: ItemId will always be Zero.
                if (itm.ItemId == 0)
                {
                    //Item Doesn't exist. add it.
                    itm.ItemId = currDepartment.DepartmentId;
                    itm.ProcedureCode = currDepartment.DepartmentId.ToString();
                    masterDbContext.BillItemPrices.Add(itm);
                    masterDbContext.SaveChanges();
                }
                else
                {
                    //Case:2 : Employee already existsm, search for the billItem.

                    BillItemPrice itmFromServer = masterDbContext.BillItemPrices
                                                .Where(b => b.ServiceDepartmentId == itm.ServiceDepartmentId && itm.ItemId == b.ItemId).FirstOrDefault();



                    //case: 2.1: Item is not adde in billitemprice table.
                    // add a new item.
                    if (itmFromServer == null)
                    {
                        itm.ItemId = currDepartment.DepartmentId;
                        itm.ProcedureCode = currDepartment.DepartmentId.ToString();
                        masterDbContext.BillItemPrices.Add(itm);
                        masterDbContext.SaveChanges();
                    }
                    else
                    {
                        //case: 2.2: Item is already there in BillItemPrice table, Update It.

                        itmFromServer.ItemName = itm.ItemName;
                        itmFromServer.Price = itm.Price;
                        itmFromServer.EHSPrice = itm.EHSPrice;
                        itmFromServer.SAARCCitizenPrice = itm.SAARCCitizenPrice;
                        itmFromServer.ForeignerPrice = itm.ForeignerPrice;
                        itmFromServer.InsForeignerPrice = itm.InsForeignerPrice;
                        itmFromServer.IsEHSPriceApplicable = itm.IsEHSPriceApplicable;
                        itmFromServer.IsSAARCPriceApplicable = itm.IsSAARCPriceApplicable;
                        itmFromServer.IsForeignerPriceApplicable = itm.IsForeignerPriceApplicable;
                        itmFromServer.IsInsForeignerPriceApplicable = itm.IsInsForeignerPriceApplicable;

                        masterDbContext.Entry(itmFromServer).Property(b => b.ItemName).IsModified = true;
                        masterDbContext.Entry(itmFromServer).Property(b => b.Price).IsModified = true;
                        masterDbContext.Entry(itmFromServer).Property(b => b.EHSPrice).IsModified = true;
                        masterDbContext.Entry(itmFromServer).Property(b => b.SAARCCitizenPrice).IsModified = true;
                        masterDbContext.Entry(itmFromServer).Property(b => b.ForeignerPrice).IsModified = true;
                        masterDbContext.Entry(itmFromServer).Property(b => b.InsForeignerPrice).IsModified = true;
                        masterDbContext.Entry(itmFromServer).Property(b => b.IsEHSPriceApplicable).IsModified = true;
                        masterDbContext.Entry(itmFromServer).Property(b => b.IsSAARCPriceApplicable).IsModified = true;
                        masterDbContext.Entry(itmFromServer).Property(b => b.IsForeignerPriceApplicable).IsModified = true;
                        masterDbContext.Entry(itmFromServer).Property(b => b.IsInsForeignerPriceApplicable).IsModified = true;

                        masterDbContext.SaveChanges();

                    }
                }
            });

        }
    }
}