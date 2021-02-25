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

    public class ADTSettingsController : CommonController
    {

        public ADTSettingsController(IOptions<MyConfiguration> _config) : base(_config)
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
                if (reqType == "adt-get-auto-billing-items")
                {
                    CoreDbContext coreDbContext = new CoreDbContext(connString);
                    var billItems = new BillingItemVM();
                    var autoBillItems = new List<BillingItemVM>();
                    var parameter = coreDbContext.Parameters.Where(a => a.ParameterGroupName == "ADT" && a.ParameterName == "AutoAddBillingItems").FirstOrDefault();
                    if (parameter != null && parameter.ParameterValue != null)
                    {
                        ADTAutoAddItemParameterVM adtParameter = DanpheJSONConvert.DeserializeObject<ADTAutoAddItemParameterVM>(parameter.ParameterValue);
                        responseData.Status = "OK";
                        responseData.Results = adtParameter;

                    }
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
                else if (reqType == "get-adt-bedFeature")
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
                                           BedPrice = item.Price,
                                           IsActive = bed.IsActive,
                                           TaxApplicable = item.TaxApplicable
                                       }).OrderBy(e => e.BedFeatureName).ToList();
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
                    var wardList = adtDbContext.Wards.OrderBy(a => a.WardName).ToList();
                    responseData.Status = "OK";
                    responseData.Results = wardList;

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

                if (reqType == "adt-bed")
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

                else if (reqType == "post-adt-bedFeature")
                {
                    using (var dbContextTransaction = adtDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            BedFeature bedFeature = DanpheJSONConvert.DeserializeObject<BedFeature>(str);
                            //BillItemPrice billItemPrice = new BillItemPrice();

                            var departmentModel = coreDbContext.ServiceDepartments.Where(d => d.IntegrationName == "Bed Charges").FirstOrDefault();

                            bedFeature.CreatedBy = currentUser.EmployeeId;
                            bedFeature.CreatedOn = DateTime.Now;
                            adtDbContext.BedFeatures.Add(bedFeature);
                            adtDbContext.SaveChanges();
                            //responseData.Results = bedFeature;

                            //adtDbContext.BedFeatures.Attach(bedFeature);

                            //billItemPrice.ItemName = bedFeature.BedFeatureName;
                            //billItemPrice.ServiceDepartmentId = departmentModel.ServiceDepartmentId;
                            //billItemPrice.Price = bedFeature.BedPrice;
                            //billItemPrice.ItemId = bedFeature.BedFeatureId;
                            //billItemPrice.TaxApplicable = bedFeature.TaxApplicable;
                            //billItemPrice.DiscountApplicable = true;
                            //billItemPrice.CreatedBy = currentUser.EmployeeId;
                            //billItemPrice.CreatedOn = System.DateTime.Now;
                            //billItemPrice.IsActive = true;
                            //billItemPrice.IsDoctorMandatory = false;
                            //billItemPrice.IsFractionApplicable = false;
                            //billItemPrice.IsNormalPriceApplicable = true;


                            //billingDbContext.BillItemPrice.Add(billItemPrice);
                            //billingDbContext.SaveChanges();


                            //adtDbContext.SaveChanges();
                            dbContextTransaction.Commit();


                            //Return both Bed feature and BillItem price in same return variable.
                            //since we've added both into the database.
                            //sud:12Sept'19
                            responseData.Results = bedFeature;
                            //new {
                            //    BedFeature = bedFeature,
                            //    BillItemPrice = billItemPrice
                            //};// bedFeature;

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
                    if (CheckForWardDuplicate(adtDbContext, ward) == false)
                    {
                        adtDbContext.Wards.Add(ward);
                        adtDbContext.SaveChanges();

                        var wardPermission = new RbacPermission();
                        wardPermission.PermissionName = "ward-" + ward.WardName;
                        wardPermission.Description = "auto-generated after ward creation";
                        wardPermission.ApplicationId = rbacDbContext.Applications.Where(a => a.ApplicationName == "ADT Wards" && a.ApplicationCode == "ADTWARD").Select(a => a.ApplicationId).FirstOrDefault();
                        wardPermission.CreatedBy = currentUser.EmployeeId;
                        wardPermission.CreatedOn = DateTime.Now;
                        wardPermission.IsActive = true;
                        RBAC.CreatePermission(wardPermission, rbacDbContext);

                        responseData.Results = ward;
                        responseData.Status = "OK";

                    }
                    else
                    {
                        responseData.ErrorMessage = "This ward already exist.";
                        responseData.Status = "Failed";
                    }

                }
                else if (reqType == "adt-post-auto-billitems-param")
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

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();

            }


            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        private static bool CheckForWardDuplicate(AdmissionDbContext adtDbContext, WardModel ward,bool? isUpdate = false)
        {
            if (isUpdate == true) 
                return adtDbContext.Wards.Where(wardinDB => wardinDB.WardId != ward.WardId && (wardinDB.WardName == ward.WardName || wardinDB.WardCode == ward.WardCode)).Any();
            return adtDbContext.Wards.Any(u => u.WardName == ward.WardName || u.WardCode == ward.WardCode);
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
                if (reqType == "adt-bed")
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
                else if (reqType == "put-adt-bedFeature")
                {
                    BedFeature bedFeature = DanpheJSONConvert.DeserializeObject<BedFeature>(str);
                    var departmentModel = coreDbContext.ServiceDepartments.Where(d => d.IntegrationName == "Bed Charges").FirstOrDefault();
                    //BillItemPrice billItemPrice = billingDbContext.BillItemPrice.Where(a => a.ItemName == departmentModel.ServiceDepartmentName).FirstOrDefault<BillItemPrice>();
                    BillItemPrice billItemPrice = billingDbContext.BillItemPrice.Where(a => a.ItemId == bedFeature.BedFeatureId && a.ServiceDepartmentId == departmentModel.ServiceDepartmentId).FirstOrDefault<BillItemPrice>();

                    adtDbContext.BedFeatures.Attach(bedFeature);
                    billingDbContext.BillItemPrice.Attach(billItemPrice);

                    adtDbContext.Entry(bedFeature).State = EntityState.Modified;
                    adtDbContext.Entry(bedFeature).Property(x => x.CreatedOn).IsModified = false;
                    adtDbContext.Entry(bedFeature).Property(x => x.CreatedBy).IsModified = false;
                    bedFeature.ModifiedOn = System.DateTime.Now;
                    bedFeature.ModifiedBy = currentUser.EmployeeId;
                   // billItemPrice.ItemName = bedFeature.BedFeatureName;//shouldn't change itemname: sud-12Sept'19
                    billItemPrice.TaxApplicable = bedFeature.TaxApplicable;
                    billItemPrice.Price = bedFeature.BedPrice;
                    billItemPrice.IsActive = bedFeature.IsActive;

                    billingDbContext.Entry(billItemPrice).Property(x => x.TaxApplicable).IsModified = true;
                    billingDbContext.Entry(billItemPrice).Property(x => x.Price).IsModified = true;
                    billingDbContext.Entry(billItemPrice).Property(x => x.IsActive).IsModified = true;


                    billingDbContext.SaveChanges();
                    adtDbContext.SaveChanges();
                    //responseData.Results = bedFeature;
                    responseData.Status = "OK";

                    //Return both Bed feature and BillItem price in same return variable.
                    //since we've added both into the database.
                    //sud:12Sept'19
                    responseData.Results = new
                    {
                        BedFeature = bedFeature,
                        BillItemPrice = billItemPrice
                    };// bedFeature;

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
                    if (CheckForWardDuplicate(adtDbContext,ward,true)==false)
                    {
                        var oldWardName = adtDbContext.Wards.AsNoTracking().FirstOrDefault(a => a.WardId == ward.WardId).WardName.ToString();
                        var NewStoreName = ward.WardName;

                        //change the permission first as well.
                        if (oldWardName != NewStoreName)
                        {
                            var wardPermission = rbacDbContext.Permissions.FirstOrDefault(p => p.PermissionName == "ward-" + oldWardName);
                            wardPermission.PermissionName = "ward-" + ward.WardName;
                            wardPermission.IsActive = ward.IsActive;
                            rbacDbContext.SaveChanges();
                        }
                        adtDbContext.Wards.Attach(ward);
                        adtDbContext.Entry(ward).State = EntityState.Modified;
                        adtDbContext.Entry(ward).Property(x => x.CreatedOn).IsModified = false;
                        adtDbContext.Entry(ward).Property(x => x.CreatedBy).IsModified = false;
                        ward.ModifiedOn = System.DateTime.Now;
                        adtDbContext.SaveChanges();
                        responseData.Results = ward;
                        responseData.Status = "OK"; 
                    }
                    else
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "This ward already exists.";
                    }
                }
                else if (reqType == "adt-put-auto-billing-items")
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


    }
}