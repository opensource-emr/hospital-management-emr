using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using System.Data.Entity;
using Microsoft.Extensions.Options;
using DanpheEMR.Utilities;
using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Configuration;
using DanpheEMR.Security;
using Microsoft.AspNetCore.Http;

namespace DanpheEMR.Controllers
{

    public class RadiologySettingsController : CommonController
    {

        public RadiologySettingsController(IOptions<MyConfiguration> _config) : base(_config)
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
        }


        // POST api/values
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
        }

        // PUT api/values/5
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
        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }



    }
}