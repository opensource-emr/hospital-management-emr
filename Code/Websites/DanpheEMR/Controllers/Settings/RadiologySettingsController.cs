using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using System.Data.Entity;
using Microsoft.Extensions.Options;
using DanpheEMR.Utilities;
using DanpheEMR.Core.Configuration;
using DanpheEMR.Security;
using Microsoft.AspNetCore.Http;
using DanpheEMR.Enums;

namespace DanpheEMR.Controllers
{

    public class RadiologySettingsController : CommonController
    {
        private readonly MasterDbContext _masterDbContext;
        private readonly RadiologyDbContext _radiologyDbContext;
        private readonly BillingDbContext _billingDbContext;

        public RadiologySettingsController(IOptions<MyConfiguration> _config) : base(_config)
        {
            _masterDbContext = new MasterDbContext(connString); 
            _radiologyDbContext = new RadiologyDbContext(connString);
            _billingDbContext = new BillingDbContext(connString);
        }

        #region Get APIs

        [HttpGet]
        [Route("ImagingItems")]
        public IActionResult GetImagingItems()
        {
            //if (reqType == "get-rad-imaging-item")
            Func<object> func = () => (from i in _radiologyDbContext.ImagingItems.Include("ImagingTypes")
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
                                                             TemplateId = i.TemplateId,
                                                             IsValidForReporting = i.IsValidForReporting
                                                         }).OrderBy(i => i.ImagingTypeName).ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("ImagingTypes")]
        public IActionResult GetImagingTypes()
        {
            //if (reqType == "get-rad-imaging-type")
            Func<object> func = () => _radiologyDbContext.ImagingTypes.OrderBy(i => i.ImagingTypeName).ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("ReportTemplates")]
        public IActionResult GetReportTemplates()
        {
            //if (reqType == "get-rad-report-template")
            Func<object> func = () => (from rTemplate in _radiologyDbContext.RadiologyReportTemplate
                                       select new
                                       {
                                           TemplateId = rTemplate.TemplateId,
                                           ModuleName = rTemplate.ModuleName,
                                           TemplateCode = rTemplate.TemplateCode,
                                           TemplateName = rTemplate.TemplateName,
                                           CreatedBy = rTemplate.CreatedBy,
                                           FooterNote = rTemplate.FooterNote,
                                           IsActive = rTemplate.IsActive
                                       }).OrderBy(t => t.TemplateName).ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("ReportTemplate")]
        public IActionResult GetReportTemplate(int templateId)
        {
            //if (reqType == "get-rad-report-template-byid")
            Func<object> func = () => (from rTemplate in _radiologyDbContext.RadiologyReportTemplate
                                         where rTemplate.TemplateId == templateId
                                         select rTemplate).FirstOrDefault();
            return InvokeHttpGetFunction(func);
        }

        #endregion

        #region Post APIs

        [HttpPost]
        [Route("ImagingItem")]
        public IActionResult PostImagingItem()
        {
            //if (reqType == "post-rad-imaging-item")
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => SaveImagingItem(ipDataStr, currentUser);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("ImagingType")]
        public IActionResult PostImagingType()
        {
            //if (reqType == "post-rad-imaging-type")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => SaveImagingType(ipDataStr);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("ReportTemplate")]
        public IActionResult PostReportTemplate()
        {
            //if (reqType == "post-rad-report-template")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => SaveReportTemplete(ipDataStr);
            return InvokeHttpPostFunction(func);
        }

        #endregion

        #region Put APIs

        [HttpPut]
        [Route("ImagingItem")]
        public IActionResult PutImagingItem()
        {
            //if (reqType == "put-rad-imaging-item")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () =>  UpdateImagingItem(ipDataStr);
            return InvokeHttpPutFunction(func);     
        }

        [HttpPut]
        [Route("ImagingType")]
        public IActionResult PutImagingType()
        {
            //if (reqType == "put-rad-imaging-type")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdateImagingType(ipDataStr);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("ReportTemplate")]
        public IActionResult PutReportTemplate()
        {
            //if (reqType == "put-rad-report-template")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdateReportTemplate(ipDataStr);
            return InvokeHttpPutFunction(func);
        }

        #endregion

        private object SaveImagingItem(string ipDataStr, RbacUser currentUser)
        {
            RadiologyImagingItemModel radImgItem = DanpheJSONConvert.DeserializeObject<RadiologyImagingItemModel>(ipDataStr);
            radImgItem.CreatedOn = DateTime.Now;
            radImgItem.CreatedBy = currentUser.EmployeeId;
            _radiologyDbContext.ImagingItems.Add(radImgItem);
            _radiologyDbContext.SaveChanges();
            return radImgItem;
        }

        private object SaveImagingType(string ipDataStr)
        {
            RadiologyImagingTypeModel radImgType = DanpheJSONConvert.DeserializeObject<RadiologyImagingTypeModel>(ipDataStr);
            radImgType.CreatedOn = DateTime.Now;
            _radiologyDbContext.ImagingTypes.Add(radImgType);
            _radiologyDbContext.SaveChanges();
            return radImgType;
        }

        private object SaveReportTemplete(string ipDataStr)
        {
                RadiologyReportTemplateModel clientRadRptTemplateData = DanpheJSONConvert.DeserializeObject<RadiologyReportTemplateModel>(ipDataStr);
                clientRadRptTemplateData.CreatedOn = DateTime.Now;
                _radiologyDbContext.RadiologyReportTemplate.Add(clientRadRptTemplateData);
                _radiologyDbContext.SaveChanges();
                return clientRadRptTemplateData;
        }

        private object UpdateImagingItem(string ipDataStr)
        {
            //First update radiology item, then billing item.
            RadiologyImagingItemModel clientImgItem = DanpheJSONConvert.DeserializeObject<RadiologyImagingItemModel>(ipDataStr);
            _masterDbContext.ImagingItems.Attach(clientImgItem);
            _masterDbContext.Entry(clientImgItem).State = EntityState.Modified;
            _masterDbContext.Entry(clientImgItem).Property(x => x.CreatedOn).IsModified = false;
            _masterDbContext.Entry(clientImgItem).Property(x => x.CreatedBy).IsModified = false;
            _masterDbContext.Entry(clientImgItem).Property(x => x.TemplateId).IsModified = true;
            clientImgItem.ModifiedOn = DateTime.Now;
            _masterDbContext.SaveChanges();

            //disable/enable radiology billing item from radiology
            //update IsActive to Billing Item as well. Other fields are not required now, so we can add later on as required.

            var srvDpt = (from srv in _masterDbContext.ServiceDepartments
                          where srv.IntegrationName.ToLower() == "radiology"
                          join imgTyp in _masterDbContext.ImagingTypes
                          on srv.ServiceDepartmentName equals imgTyp.ImagingTypeName

                          where imgTyp.ImagingTypeId == clientImgItem.ImagingTypeId
                          select srv).FirstOrDefault();

            if (srvDpt != null)
            {
                BillServiceItemModel billItemPrice = _billingDbContext.BillServiceItems.Where(a => a.IntegrationItemId == clientImgItem.ImagingItemId && a.ServiceDepartmentId == srvDpt.ServiceDepartmentId).FirstOrDefault<BillServiceItemModel>();
                billItemPrice.IsActive = clientImgItem.IsActive.HasValue ? clientImgItem.IsActive.Value : false;

                _billingDbContext.Entry(billItemPrice).Property(x => x.IsActive).IsModified = true;
                _billingDbContext.SaveChanges();
            }
            return clientImgItem;
        }

        private object UpdateImagingType(string ipDataStr)
        {
            RadiologyImagingTypeModel clientImgType = DanpheJSONConvert.DeserializeObject<RadiologyImagingTypeModel>(ipDataStr);
            _masterDbContext.ImagingTypes.Attach(clientImgType);
            _masterDbContext.Entry(clientImgType).State = EntityState.Modified;
            _masterDbContext.Entry(clientImgType).Property(x => x.CreatedOn).IsModified = false;
            _masterDbContext.Entry(clientImgType).Property(x => x.CreatedBy).IsModified = false;
            clientImgType.ModifiedOn = DateTime.Now;
            _masterDbContext.SaveChanges();
            return clientImgType;
        }

        private object UpdateReportTemplate(string ipDataStr)
        {
            RadiologyReportTemplateModel clientRadRptTemplateData = DanpheJSONConvert.DeserializeObject<RadiologyReportTemplateModel>(ipDataStr);
            _radiologyDbContext.RadiologyReportTemplate.Attach(clientRadRptTemplateData);
            _radiologyDbContext.Entry(clientRadRptTemplateData).State = EntityState.Modified;
            _radiologyDbContext.Entry(clientRadRptTemplateData).Property(x => x.CreatedOn).IsModified = false;
            _radiologyDbContext.Entry(clientRadRptTemplateData).Property(x => x.CreatedBy).IsModified = false;
            clientRadRptTemplateData.ModifiedOn = DateTime.Now;
            _radiologyDbContext.SaveChanges();
            return clientRadRptTemplateData;
        }

        #region reqType(Get)
        /*[HttpGet]
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
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

            try
            {
                if (reqType == "get-rad-imaging-item")
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
                                           TemplateId = i.TemplateId,
                                           IsValidForReporting = i.IsValidForReporting
                                       }).OrderBy(i => i.ImagingTypeName).ToList();
                    responseData.Status = "OK";
                    responseData.Results = imgItemList;
                }
                else if (reqType == "get-rad-imaging-type")
                {
                    var imgTypeList = radioDbContext.ImagingTypes.OrderBy(i => i.ImagingTypeName).ToList();
                    responseData.Status = "OK";
                    responseData.Results = imgTypeList;
                }
                else if (reqType == "get-rad-report-template")
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
                                                 }).OrderBy(t => t.TemplateName).ToList();
                    responseData.Status = "OK";
                    responseData.Results = radReportTemplateList;
                }

                else if (reqType == "get-rad-report-template-byid")
                {
                    var radReportTemplate = (from rTemplate in radioDbContext.RadiologyReportTemplate
                                             where rTemplate.TemplateId == templateId
                                             select rTemplate).FirstOrDefault();
                    responseData.Status = "OK";
                    responseData.Results = radReportTemplate;
                }

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }*/
        #endregion

        #region reqType(Post)
        /*// POST api/values
        [HttpPost]
        public string Post()
        {

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();//type 'object' since we have variable return types
            responseData.Status = "OK";//by default status would be OK, hence assigning at the top
            RadiologyDbContext radioDbContext = new RadiologyDbContext(connString);
            try
            {
                string serviceDepartment = this.ReadQueryStringData("serviceDepartment");
                int itemId = ToInt(this.ReadQueryStringData("itemId"));
                string reqType = this.ReadQueryStringData("reqType");
                string str = this.ReadPostData();
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

                if (reqType == "post-rad-imaging-item")
                {
                    RadiologyImagingItemModel radImgItem = DanpheJSONConvert.DeserializeObject<RadiologyImagingItemModel>(str);
                    radImgItem.CreatedOn = DateTime.Now;
                    radImgItem.CreatedBy = currentUser.EmployeeId;
                    radioDbContext.ImagingItems.Add(radImgItem);
                    radioDbContext.SaveChanges();
                    responseData.Results = radImgItem;
                    responseData.Status = "OK";
                }
                else if (reqType == "post-rad-imaging-type")
                {
                    RadiologyImagingTypeModel radImgType = DanpheJSONConvert.DeserializeObject<RadiologyImagingTypeModel>(str);
                    radImgType.CreatedOn = DateTime.Now;
                    radioDbContext.ImagingTypes.Add(radImgType);
                    radioDbContext.SaveChanges();
                    responseData.Results = radImgType;
                    responseData.Status = "OK";
                }
                else if (reqType == "post-rad-report-template")
                {
                    RadiologyReportTemplateModel clientRadRptTemplateData = DanpheJSONConvert.DeserializeObject<RadiologyReportTemplateModel>(str);
                    clientRadRptTemplateData.CreatedOn = System.DateTime.Now;
                    radioDbContext.RadiologyReportTemplate.Add(clientRadRptTemplateData);
                    radioDbContext.SaveChanges();
                    responseData.Results = clientRadRptTemplateData;
                    responseData.Status = "OK";
            }

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();

            }


            return DanpheJSONConvert.SerializeObject(responseData, true);
        }*/
        #endregion

        #region reqType(Put)
        /*// PUT api/values/5
        [HttpPut]
        public string Put()
        {
            string reqType = this.ReadQueryStringData("reqType");
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            string str = this.ReadPostData();
            MasterDbContext masterDBContext = new MasterDbContext(connString);
            RadiologyDbContext radioDbContext = new RadiologyDbContext(connString);

            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

            try
            {
                if (reqType == "put-rad-imaging-type")
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
                else if (reqType == "put-rad-imaging-item")
                {
                    //First update radiology item. then billing item.
                    RadiologyImagingItemModel clientImgItem = DanpheJSONConvert.DeserializeObject<RadiologyImagingItemModel>(str);
                    masterDBContext.ImagingItems.Attach(clientImgItem);
                    masterDBContext.Entry(clientImgItem).State = EntityState.Modified;
                    masterDBContext.Entry(clientImgItem).Property(x => x.CreatedOn).IsModified = false;
                    masterDBContext.Entry(clientImgItem).Property(x => x.CreatedBy).IsModified = false;
                    masterDBContext.Entry(clientImgItem).Property(x => x.TemplateId).IsModified = true;
                    clientImgItem.ModifiedOn = System.DateTime.Now;
                    masterDBContext.SaveChanges();

                    //sud:24Sept'19--to disable/enable radiology billing item from radiology
                    //update IsActive to Billing Item as well. Other fields are not required now, so we can add later on as required.

                    var srvDpt = (from srv in masterDBContext.ServiceDepartments
                                  where srv.IntegrationName.ToLower() == "radiology"
                                  join imgTyp in masterDBContext.ImagingTypes
                                  on srv.ServiceDepartmentName equals imgTyp.ImagingTypeName

                                  where imgTyp.ImagingTypeId == clientImgItem.ImagingTypeId
                                  select srv).FirstOrDefault();

                    if(srvDpt != null)
                    {
                        BillingDbContext billingDbContext = new BillingDbContext(connString);
                        BillItemPrice billItemPrice = billingDbContext.BillItemPrice.Where(a => a.ItemId == clientImgItem.ImagingItemId && a.ServiceDepartmentId == srvDpt.ServiceDepartmentId).FirstOrDefault<BillItemPrice>();
                        billItemPrice.IsActive = clientImgItem.IsActive;

                        billingDbContext.Entry(billItemPrice).Property(x => x.IsActive).IsModified = true;
                        billingDbContext.SaveChanges();
                    }


                    responseData.Results = clientImgItem;
                    responseData.Status = "OK";
                }
                else if (reqType == "put-rad-report-template")
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
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }*/
        #endregion

        #region reqType(Delete)
        /*// DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }*/
        #endregion

    }
}