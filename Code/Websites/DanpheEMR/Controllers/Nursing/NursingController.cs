using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.Core.Configuration;
using DanpheEMR.CommonTypes;
using Microsoft.Extensions.Options;
using DanpheEMR.Utilities;
using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using System.Xml;
using Newtonsoft.Json;
using System.Data.Entity;
using DanpheEMR.Core;
using DanpheEMR.Enums;
using System.Data;
using System.Data.SqlClient;
using DanpheEMR.ServerModel.ClinicalModels;
// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers
{

    public class NursingController : CommonController
    {

        public NursingController(IOptions<MyConfiguration> _config) : base(_config)
        {

        }
        // GET: api/values
        [HttpGet]
        public string Get(string reqType,
            int patientId,
            string status,
            int visitId,
            DateTime requestDate,
            string firstName,
            string lastName,
            string phoneNumber,
            DateTime fromDate,
            DateTime toDate,
            string search)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            responseData.Status = "OK";
            try
            {
                VisitDbContext dbContext = new VisitDbContext(base.connString);
                ClinicalDbContext clndbContext = new ClinicalDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

                if (reqType == "nur-opd-list")
                {
                    List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@FromDate", fromDate),
                        new SqlParameter("@ToDate", toDate)
                    };
                    DataTable dtNurOpdList = DALFunctions.GetDataTableFromStoredProc("SP_GetVisitListForOPD", paramList, dbContext);

                    responseData.Results = dtNurOpdList;
                }
                else if (reqType == "nur-opd-list-pastDays")
                {
                    List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@FromDate", fromDate),
                        new SqlParameter("@ToDate", toDate)
                    };
                    DataTable dtNurOpdList = DALFunctions.GetDataTableFromStoredProc("SP_GetVisitListForOPD", paramList, dbContext);

                    responseData.Results = dtNurOpdList;
                }
                else if (reqType == "get-all-complains")
                {
                    //int patId = ToInt(this.ReadQueryStringData("patientId"));
                    int patientVisitId = ToInt(this.ReadQueryStringData("patientVisitId"));
                    var complains = (from cln in clndbContext.PatientClinicalInfos
                                     where cln.IsActive == true
                                     && cln.PatientVisitId == patientVisitId
                                     select new
                                     {
                                         cln.InfoId,
                                         cln.KeyName,
                                         cln.Value
                                     }).ToList();

                    //join vis in clndbContext.Visit on cln.PatientVisitId equals vis.PatientVisitId
                    //where vis.IsTriaged == true &&


                    responseData.Results = complains;
                    responseData.Status = "OK";
                }
                
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        // GET api/values/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }
        [HttpGet("/api/Nursing/getNephrologyPatients")]
        public string getNephrologyPatients()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            BillingDbContext billingDbContext = new BillingDbContext(connString);
            responseData.Results = "OK";
            try
            {
                var nephPats = (from pat in billingDbContext.Patient
                                join bti in billingDbContext.BillingTransactionItems on pat.PatientId equals bti.PatientId
                                join msd in billingDbContext.ServiceDepartment on bti.ServiceDepartmentId equals msd.ServiceDepartmentId
                                where msd.IntegrationName == "Nephrology"
                                select new
                                {
                                    pat.PatientId,
                                    pat.PatientCode,
                                    pat.Gender,
                                    pat.Age,
                                    pat.DateOfBirth,
                                    pat.Address,
                                    pat.PhoneNumber,
                                    bti.ProviderName,
                                    ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                }).OrderByDescending(patient => patient.PatientId).ToList();
                responseData.Results = nephPats;
                responseData.Status = "OK";
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
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                string reqType = this.ReadQueryStringData("reqType");
                int patientId = ToInt(this.ReadQueryStringData("patientId"));
                int patientVisitId = ToInt(this.ReadQueryStringData("patientVisitId"));
                string str = this.ReadPostData();

                OrdersDbContext orderDbContext = new OrdersDbContext(connString);
                ClinicalDbContext dbContext = new ClinicalDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

                if (reqType != null && reqType == "AddToPreference")
                {
                    string preferenceType = this.ReadQueryStringData("preferenceType");
                    string preferenceName = null;
                    string preferenceIdType = null;
                    string preferenceWardId = null;

                    if (preferenceType.ToLower() == "nursing")
                    {
                        preferenceName = "NursingPatientPreferences";
                        preferenceIdType = "PatientVisitId";
                        preferenceWardId = "WardId";
                    }
                    string ItemId = this.ReadQueryStringData("itemId");
                    string WardId = this.ReadQueryStringData("wardId");

                    EmployeePreferences employeePreference = (from pref in orderDbContext.EmployeePreferences
                                                              where pref.EmployeeId == currentUser.EmployeeId &&
                                                              pref.PreferenceName == preferenceName
                                                              select pref).FirstOrDefault();

                    if (employeePreference == null)
                    {
                        XmlDocument xdoc = new XmlDocument();

                        //(2) string.Empty makes cleaner code
                        XmlElement rootElm = xdoc.CreateElement(string.Empty, "root", string.Empty);
                        xdoc.AppendChild(rootElm);

                        XmlElement row = xdoc.CreateElement(string.Empty, "Row", string.Empty);
                        rootElm.AppendChild(row);

                        XmlElement nodePatVisitId = xdoc.CreateElement(string.Empty, "PatientVisitId", string.Empty);
                        nodePatVisitId.InnerText = ItemId;
                        row.AppendChild(nodePatVisitId);

                        XmlElement nodeWardId = xdoc.CreateElement(string.Empty, "WardId", string.Empty);
                        nodeWardId.InnerText = WardId;
                        row.AppendChild(nodeWardId);

                        EmployeePreferences employeePref = new EmployeePreferences();

                        employeePref.PreferenceName = preferenceName;
                        employeePref.PreferenceValue = xdoc.InnerXml;
                        employeePref.EmployeeId = currentUser.EmployeeId;
                        employeePref.CreatedBy = currentUser.EmployeeId;
                        employeePref.CreatedOn = DateTime.Now;
                        employeePref.IsActive = true;
                        orderDbContext.EmployeePreferences.Add(employeePref);
                        orderDbContext.SaveChanges();
                        responseData.Status = "OK";
                        responseData.Results = ItemId;
                    }
                    else
                    {

                        XmlDocument prefXmlDoc = new XmlDocument();
                        prefXmlDoc.LoadXml(employeePreference.PreferenceValue);
                        XmlElement Row = prefXmlDoc.CreateElement("Row");
                        XmlElement typeId = prefXmlDoc.CreateElement(preferenceIdType);
                        typeId.InnerText = ItemId;
                        XmlElement wardId = prefXmlDoc.CreateElement(preferenceWardId);
                        wardId.InnerText = WardId;
                        Row.AppendChild(typeId);
                        Row.AppendChild(wardId);
                        prefXmlDoc.DocumentElement.AppendChild(Row);
                        employeePreference.PreferenceValue = prefXmlDoc.InnerXml;
                        employeePreference.ModifiedBy = currentUser.EmployeeId;
                        employeePreference.ModifiedOn = DateTime.Now;

                        orderDbContext.Entry(employeePreference).State = EntityState.Modified;
                        orderDbContext.SaveChanges();
                        responseData.Status = "OK";
                        responseData.Results = ItemId;

                    }
                }

                else if (reqType == "post-clinical-info")
                {
                    List<PatientClinicalInfo> patClinicalInfo = DanpheJSONConvert.DeserializeObject<List<PatientClinicalInfo>>(str);
                    int visitId = patClinicalInfo[0].PatientVisitId;

                    using (var dbContextTransaction = dbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            if (patClinicalInfo != null && patClinicalInfo.Count > 0)
                            {
                                foreach (var info in patClinicalInfo)
                                {
                                    info.IsActive = true;
                                    info.CreatedBy = currentUser.EmployeeId;
                                    info.ModifiedBy = currentUser.EmployeeId;
                                    info.CreatedOn = DateTime.Now;
                                    info.ModifiedOn = DateTime.Now;
                                    
                                    dbContext.PatientClinicalInfos.Add(info);
                                    
                                }

                                var patVisit = (from vis in dbContext.Visit
                                                where vis.PatientVisitId == visitId
                                                select vis).FirstOrDefault();
                                patVisit.IsTriaged = true;
                                dbContext.Visit.Attach(patVisit);
                                dbContext.Entry(patVisit).Property(f => f.IsTriaged).IsModified = true;
                                dbContext.SaveChanges();
                            }

                            dbContextTransaction.Commit();                            
                            responseData.Status = "OK";
                            responseData.Results = patClinicalInfo;
                        }
                        catch (Exception ex)
                        {
                            dbContextTransaction.Rollback();
                            responseData.Results = null;
                            responseData.Status = "Failed";
                            throw ex;
                        }

                    }

                }
            
                else if(reqType == "post-complaint")
                {
                    List<PatientClinicalInfo> patClinicalInfo = DanpheJSONConvert.DeserializeObject<List<PatientClinicalInfo>>(str);
                    foreach (var item in patClinicalInfo)
                    {
                        item.CreatedBy = currentUser.EmployeeId;
                        item.CreatedOn = System.DateTime.Now;
                        item.IsActive = true;
                        dbContext.PatientClinicalInfos.Add(item);
                    }

                    dbContext.SaveChanges();
                    responseData.Status = "OK";
                    responseData.Results = patClinicalInfo;

                }
            }
            catch (Exception e)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = e.Message + "exception details: " + e.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        // PUT api/values/5
        [HttpPut]
        public string Put()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            ClinicalDbContext dbContext = new ClinicalDbContext(connString);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string str = this.ReadPostData();
            string reqType = this.ReadQueryStringData("reqType");
            int patientId = ToInt(this.ReadQueryStringData("patientId"));
            int patientVisitId = ToInt(this.ReadQueryStringData("patientVisitId"));
            int infoId = ToInt(this.ReadQueryStringData("infoId"));
            
            try
            {
                if (reqType == "put-clinical-info")
                {
                    List<PatientClinicalInfo> pat = DanpheJSONConvert.DeserializeObject<List<PatientClinicalInfo>>(str);
                    List<int> toBeUpdated = pat.Where(p => p.InfoId != 0).Select(x => x.InfoId).ToList();

                    List<PatientClinicalInfo> allTriagedDataOfPat = dbContext.PatientClinicalInfos.Where(x => x.PatientVisitId == patientVisitId).ToList(); 

                    if (pat != null && pat.Count > 0)
                    {
                        List<PatientClinicalInfo> patToBeUpdated = (from info in allTriagedDataOfPat
                                                                    where toBeUpdated.Contains(info.InfoId)
                                                                    select info).ToList();
                        List<PatientClinicalInfo> patToBeRemoved = (from info in allTriagedDataOfPat
                                                                    where !toBeUpdated.Contains(info.InfoId)
                                                                    select info).ToList();
                        foreach (var item in patToBeRemoved)
                        {
                            item.IsActive = false;
                            item.ModifiedOn = DateTime.Now;
                            item.ModifiedBy = currentUser.EmployeeId;
                            dbContext.Entry(item).Property(x => x.IsActive).IsModified = true;
                            dbContext.Entry(item).Property(x => x.ModifiedBy).IsModified = true;
                            dbContext.Entry(item).Property(x => x.ModifiedOn).IsModified = true;
                        }
                        dbContext.SaveChanges();

                        for (var i = 0; i < pat.Count; i++)
                        {
                            var inf = pat[i].InfoId;
                            
                            if (inf != 0)
                            {
                                PatientClinicalInfo patClinicalInfo = patToBeUpdated.Where(p => p.InfoId == inf).FirstOrDefault();
                                dbContext.PatientClinicalInfos.Attach(patClinicalInfo);
                                dbContext.Entry(patClinicalInfo).State = EntityState.Modified;
                                patClinicalInfo.ModifiedOn = DateTime.Now;
                                patClinicalInfo.ModifiedBy = currentUser.EmployeeId;
                                patClinicalInfo.Value = pat[i].Value;
                                dbContext.Entry(patClinicalInfo).Property(x => x.Value).IsModified = true;
                                dbContext.Entry(patClinicalInfo).Property(x => x.ModifiedBy).IsModified = true;
                                dbContext.Entry(patClinicalInfo).Property(x => x.ModifiedOn).IsModified = true;
                                dbContext.SaveChanges();
                            }
                            else if (inf == 0)
                            {
                                PatientClinicalInfo patInfo = pat[i];
                                patInfo.IsActive = true;
                                patInfo.CreatedBy = currentUser.EmployeeId;
                                patInfo.ModifiedBy = currentUser.EmployeeId;
                                patInfo.CreatedOn = DateTime.Now;
                                patInfo.ModifiedOn = DateTime.Now;

                                dbContext.PatientClinicalInfos.Add(patInfo);
                                dbContext.SaveChanges();

                            }

                        }

                        responseData.Status = "OK";
                        responseData.Results = pat;
                    }
                        
                    }                
            
                else if(reqType == "update-chief-complaint")
                {
                    PatientClinicalInfo patComp = DanpheJSONConvert.DeserializeObject<PatientClinicalInfo>(str);
                    PatientClinicalInfo compToUpdate = dbContext.PatientClinicalInfos.Where(x => x.InfoId == patComp.InfoId).FirstOrDefault();
                    compToUpdate.Value = patComp.Value;
                    compToUpdate.ModifiedOn = DateTime.Now;
                    compToUpdate.ModifiedBy = currentUser.EmployeeId;
                    compToUpdate.IsActive = patComp.IsActive;

                    dbContext.Entry(compToUpdate).Property(x => x.Value).IsModified = true;
                    dbContext.Entry(compToUpdate).Property(x => x.IsActive).IsModified = true;
                    dbContext.Entry(compToUpdate).Property(x => x.ModifiedBy).IsModified = true;
                    dbContext.Entry(compToUpdate).Property(x => x.ModifiedOn).IsModified = true;

                    dbContext.SaveChanges();
                    responseData.Status = "OK";
                    responseData.Results = compToUpdate;

                }
            }
            catch (Exception e)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = e.Message + "exception details: " + e.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        // DELETE api/values/5
        [HttpDelete]
        public string Delete(string reqType, string itemId, string wardid)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                OrdersDbContext orderDbContext = new OrdersDbContext(connString);
                if (reqType != null && reqType == "DeleteFromPreference")
                {
                    string preferenceType = this.ReadQueryStringData("preferenceType");
                    string preferenceIdType = null;
                    string preferenceName = null;
                    string preferenceWardId = null;
                    if (preferenceType.ToLower() == "nursing")
                    {
                        preferenceName = "NursingPatientPreferences";
                        preferenceIdType = "//PatientVisitId";
                        preferenceWardId = "//WardId";
                    }

                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                    EmployeePreferences employeePreference = (from pref in orderDbContext.EmployeePreferences
                                                              where pref.EmployeeId == currentUser.EmployeeId &&
                                                              pref.PreferenceName == preferenceName
                                                              select pref).FirstOrDefault();


                    XmlDocument xdoc = new XmlDocument();
                    xdoc.LoadXml(employeePreference.PreferenceValue);

                    XmlNodeList nodes = xdoc.SelectNodes(preferenceIdType);
                    foreach (XmlNode node in nodes)
                    {
                        if (node.InnerXml == itemId.ToString())
                        {
                            XmlNode parent = node.ParentNode;
                            parent.ParentNode.RemoveChild(parent);

                        }
                    }

                    employeePreference.PreferenceValue = xdoc.InnerXml;
                    employeePreference.ModifiedBy = currentUser.EmployeeId;
                    employeePreference.ModifiedOn = DateTime.Now;
                    orderDbContext.SaveChanges();
                    responseData.Status = "OK";
                    responseData.Results = itemId;
                }
            }
            catch (Exception e)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = e.Message + "Exception details: " + e.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }
    }
}
