using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.Core.Configuration;
using DanpheEMR.Security;
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
using System.Xml;


// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers
{

    public class EmployeeController : CommonController
    {

        private readonly string fileUploadLocation = null;
        public EmployeeController(IOptions<MyConfiguration> _config) : base(_config)
        {

            fileUploadLocation = _config.Value.FileStorageRelativeLocation;

        }
        // GET: api/values
        [HttpGet]
        public string Get(int empId, string reqType)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                //for employeeprofile, get current employeeinformation, fill the employeeProfileVM object and return to the client.
                if (reqType == "employeeProfile")
                {
                    MasterDbContext masterDbContext = new MasterDbContext(connString);
                    EmployeeModel currEmp = (from e in masterDbContext.Employees.Include("Department")
                                             where e.EmployeeId == empId
                                             select e).FirstOrDefault();
                    RbacUser currUser = (from u in (new RbacDbContext(connString)).Users
                                         where u.EmployeeId == empId
                                         select u).FirstOrDefault();

                    EmployeeProfileVM empProfile = new EmployeeProfileVM();
                    empProfile.EmployeeId = currEmp.EmployeeId;
                    empProfile.FirstName = currEmp.FirstName;
                    empProfile.LastName = currEmp.LastName;
                    empProfile.UserName = currUser != null ? currUser.UserName : "Invalid User";
                    //sometimes department could also be null, so handling such cases accordingly.
                    empProfile.Department = currEmp.Department != null ? currEmp.Department.DepartmentName : "not assigned";
                    empProfile.DateOfBirth = currEmp.DateOfBirth;
                    empProfile.DateOfJoining = currEmp.DateOfJoining;
                    empProfile.ImageName = currEmp.ImageName;
                    empProfile.Email = currEmp.Email;
                    empProfile.ContactNumber = currEmp.ContactNumber;
                    empProfile.ImageFullPath = string.IsNullOrEmpty(currEmp.ImageName) ? "" : fileUploadLocation + "UserProfile\\" + currEmp.ImageName;

                    responseData.Results = empProfile;
                    responseData.Status = "OK";
                }


                else
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = "Invalid request type.";
                }
                //else
                //{

                //    RbacDbContext rbacDbContext = new RbacDbContext(connString);
                //    MasterDbContext masterDbContext = new MasterDbContext(connString);

                //    RbacUser currUser = rbacDbContext.Users.Where(u => u.UserId == empId).FirstOrDefault();
                //    var UserProfileInfo = (from x in masterDbContext.Employee
                //                           where x.EmployeeId == currUser.EmployeeId
                //                           select new
                //                           {
                //                               UserName = currUser.UserName,
                //                               FirstName = x.FirstName,
                //                               LastName = x.LastName,
                //                               Email = x.Email,
                //                               Department = x.EmployeeDepartment,
                //                               EmployeeId = x.EmployeeId,
                //                               ImageName = x.ImageName
                //                           }).ToList();

                //    responseData.Results = UserProfileInfo;
                //    responseData.Status = "OK";
                //}
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        // GET api/values/5
        [HttpGet("{id}")]
        public string Get()
        {
            return "value";
        }

        // POST api/values
        [HttpPost]
        public string Post()
        {
            //return null;
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                string str = this.ReadPostData();
                string reqType = this.ReadQueryStringData("reqType");
                //MasterDbContext masterDbContext = new MasterDbContext(connString);

                if (reqType == "set-landing-page")
                {
                    RbacDbContext rbacdbContext = new RbacDbContext(connString);
                    RbacUser user = DanpheJSONConvert.DeserializeObject<RbacUser>(str);
                    if(user != null)
                    {
                        var currUser = rbacdbContext.Users.Where(a => a.UserId == user.UserId).Select(a => a).FirstOrDefault();
                        currUser.LandingPageRouteId = user.LandingPageRouteId;
                        rbacdbContext.Users.Attach(currUser);
                        rbacdbContext.Entry(currUser).Property(a => a.LandingPageRouteId).IsModified = true;
                        rbacdbContext.SaveChanges();
                        responseData.Status = "OK";
                        responseData.Results = currUser.LandingPageRouteId;
                    }
                }
                //    if (reqType != null && reqType == "AddToPreference")
                //    {
                //        string preferenceType = this.ReadQueryStringData("preferenceType");
                //        string preferenceName = null;
                //        string preferenceIdType = null;
                //        if (preferenceType == "lab")
                //        {
                //            preferenceName = "Labtestpreferences";
                //            preferenceIdType = "LabTestId";
                //        }
                //        else if (preferenceType == "imaging")
                //        {
                //            preferenceName = "Imagingpreferences";
                //            preferenceIdType = "ImagingItemId";
                //        }
                //        else if(preferenceType == "medication")
                //        {
                //            preferenceName = "Medicationpreferences";
                //            preferenceIdType = "MedicineId";
                //        }
                //        string clientValue = this.ReadPostData();

                //        RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

                //        EmployeePreferences employeePreference = (from pref in masterDbContext.EmployeePreferences
                //                                                  where pref.EmployeeId == currentUser.EmployeeId && pref.PreferenceName == preferenceName
                //                                                  select pref).FirstOrDefault();

                //        if (employeePreference == null)
                //        {
                //            //this is used to convert string into xml
                //            XmlDocument xdoc = JsonConvert.DeserializeXmlNode("{\"Row\":{" + preferenceIdType + ":" + clientValue + "}}", "root");
                //            //this is add new perference
                //            EmployeePreferences employeePref = new EmployeePreferences();

                //            employeePref.PreferenceName = preferenceName;
                //            employeePref.PreferenceValue = xdoc.InnerXml;
                //            employeePref.EmployeeId = currentUser.EmployeeId;
                //            employeePref.CreatedBy = currentUser.EmployeeId; ;
                //            employeePref.CreatedOn = DateTime.Now;
                //            employeePref.IsActive = true;
                //            masterDbContext.EmployeePreferences.Add(employeePref);
                //            masterDbContext.SaveChanges();
                //            responseData.Status = "OK";
                //            responseData.Results = clientValue;
                //        }
                //        else
                //        {

                //            //creating object of XmlDocument
                //            XmlDocument prefXmlDoc = new XmlDocument();
                //            //loading the database PreferenceValue in object of XmlDocument(prefXmlDoc)
                //            prefXmlDoc.LoadXml(employeePreference.PreferenceValue);
                //            //creating xmlElement with tag Row
                //            XmlElement Row = prefXmlDoc.CreateElement("Row");
                //            //creating xmlElement with tag LabTestId/ImagingTypeId
                //            XmlElement typeId = prefXmlDoc.CreateElement(preferenceIdType);
                //            //provididng value to the element of LabTestId/ImagingTypeId
                //            typeId.InnerText = clientValue;
                //            //appending LabTestId/ImagingTypeId element ot Row element as child
                //            Row.AppendChild(typeId);
                //            //Appending the Row elemt to the root element of xml
                //            prefXmlDoc.DocumentElement.AppendChild(Row);
                //            //replacing the old value of employeePreference.PreferenceValue with new one
                //            employeePreference.PreferenceValue = prefXmlDoc.InnerXml;
                //            employeePreference.ModifiedBy = currentUser.EmployeeId;
                //            employeePreference.ModifiedOn = DateTime.Now;


                //            masterDbContext.Entry(employeePreference).State = EntityState.Modified;
                //            masterDbContext.SaveChanges();
                //            responseData.Status = "OK";
                //            responseData.Results = clientValue;
                //        }

                //    }
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
            MasterDbContext masterDbContext = new MasterDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                string reqType = this.ReadQueryStringData("reqType");
                int empId = ToInt(this.ReadQueryStringData("empId"));


                var files = Request.Form.Files;
                string ImagePath = null;
                string ImageName = null;
                if (files.Count != 0)
                {
                    //
                    DanpheHTTPResponse<object> uploadResponse = FileUploader.Upload(files, "UserProfile\\");
                    if (uploadResponse.Status == "OK")
                    {
                        ImagePath = uploadResponse.Results.ToString();
                        ImageName = files[0].FileName;

                        EmployeeModel dbemp = masterDbContext.Employees.Where(a => a.EmployeeId == empId)
                                                        .FirstOrDefault<EmployeeModel>();
                        dbemp.ImageFullPath = ImagePath;
                        dbemp.ImageName = ImageName;
                        masterDbContext.Entry(dbemp).State = EntityState.Modified;
                        responseData.Status = "OK";
                        masterDbContext.SaveChanges();
                        responseData.Results = ImageName;
                    }
                    else
                    {
                        throw new Exception("Upload Failed");
                    }


                }
                else
                {
                    responseData.ErrorMessage = "Upload Failed";
                    responseData.Status = "Failed";
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
        [HttpDelete]
        public string Delete(string reqType, string itemId)
        {
            return null;
            //DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            //try
            //{

            //    MasterDbContext masterDbContext = new MasterDbContext(connString);

            //    if (reqType != null && reqType == "DeleteFromPreference")
            //    {
            //        string preferenceType = this.ReadQueryStringData("preferenceType");
            //        string preferenceIdType = null;
            //        string preferenceName = null;
            //        if (preferenceType == "lab")
            //        {
            //            preferenceName = "Labtestpreferences";
            //            preferenceIdType = "//LabTestId";
            //        }
            //        else if (preferenceType == "imaging")
            //        {
            //            preferenceName = "Imagingpreferences";
            //            preferenceIdType = "//ImagingItemId";
            //        }
            //        else if (preferenceType == "medication")
            //        {
            //            preferenceName = "Medicationpreferences";
            //            preferenceIdType = "//MedicineId";
            //        }

            //        RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            //        EmployeePreferences employeePreference = (from pref in masterDbContext.EmployeePreferences
            //                                                  where pref.EmployeeId == currentUser.EmployeeId && pref.PreferenceName == preferenceName
            //                                                  select pref).FirstOrDefault();


            //        XmlDocument prefXmlDocument = new XmlDocument();
            //        prefXmlDocument.LoadXml(employeePreference.PreferenceValue);
            //        // selecting the node of xml Document with tag LabTestId
            //        XmlNodeList nodes = prefXmlDocument.SelectNodes(preferenceIdType);
            //        //looping through the loop and checking the labtestId match or not 
            //        //if it is matched with LabtestId the delete the node
            //        foreach (XmlNode node in nodes)
            //        {
            //            if (node.InnerXml == itemId.ToString())
            //            {
            //                node.ParentNode.RemoveChild(node);
            //            }
            //        }
            //        //replacing the old value of employeePreference.PreferenceValue with new one
            //        employeePreference.PreferenceValue = prefXmlDocument.InnerXml;
            //        employeePreference.ModifiedBy = currentUser.EmployeeId;
            //        employeePreference.ModifiedOn = DateTime.Now;
            //        masterDbContext.SaveChanges();
            //        responseData.Status = "OK";
            //        responseData.Results = itemId;
            //    }

            //}

            //catch (Exception ex)
            //{
            //    responseData.Status = "Failed";
            //    responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            //}
            //return DanpheJSONConvert.SerializeObject(responseData, true);
        }
    }
}

