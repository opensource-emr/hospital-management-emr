using DanpheEMR.CommonTypes;
using DanpheEMR.Controllers.Nursing.DTOs;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.BillingModels;
using DanpheEMR.ServerModel.ClinicalModels;
using DanpheEMR.ServerModel.InventoryModels;
using DanpheEMR.Services.Nursing.DTOs;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using System.Xml;
using EntityState = System.Data.Entity.EntityState;
// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers
{

    public class NursingController : CommonController
    {
        private readonly VisitDbContext _visitDbContext;
        private readonly ClinicalDbContext _clinicalDbContext;
        private readonly OrdersDbContext _orderDbContext;




        public NursingController(IOptions<MyConfiguration> _config) : base(_config)
        {
            _visitDbContext = new VisitDbContext(base.connString);
            _clinicalDbContext = new ClinicalDbContext(connString);
            _orderDbContext = new OrdersDbContext(connString);
        }
        // GET: api/values

        [HttpGet]
        [Route("OpdVisits")]
        public IActionResult OpdVisits(DateTime fromDate, DateTime toDate)
        {
            //if (reqType == "nur-opd-list")
            Func<object> func = () => GetOpdVisitsInDateRange(fromDate, toDate);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("PastVisits")]
        public IActionResult PastVisits(DateTime fromDate, DateTime toDate)
        {
            //if (reqType == "nur-opd-list-pastDays")
            Func<object> func = () => GetPastDataVisits(fromDate, toDate);
            return InvokeHttpGetFunction(func);
        }
        [HttpGet]
        [Route("Complains")]
        public IActionResult Complains(int patientVisitId)
        {
            //if (reqType == "get-all-complains")
            Func<object> func = () => GetComplaints(patientVisitId);
            return InvokeHttpGetFunction(func);
        }



        //[HttpGet]
        //public string Get(string reqType,
        //    int patientId,
        //    string status,
        //    int visitId,
        //    DateTime requestDate,
        //    string firstName,
        //    string lastName,
        //    string phoneNumber,
        //    DateTime fromDate,
        //    DateTime toDate,
        //    string search)
        //{
        //    DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        //    responseData.Status = "OK";
        //    try
        //    {
        //        VisitDbContext dbContext = new VisitDbContext(base.connString);
        //        ClinicalDbContext clndbContext = new ClinicalDbContext(connString);
        //        RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

        //        //if (reqType == "nur-opd-list")
        //        //{
        //        //    List<SqlParameter> paramList = new List<SqlParameter>() {
        //        //        new SqlParameter("@FromDate", fromDate),
        //        //        new SqlParameter("@ToDate", toDate)
        //        //    };
        //        //    DataTable dtNurOpdList = DALFunctions.GetDataTableFromStoredProc("SP_GetVisitListForOPD", paramList, dbContext);

        //        //    responseData.Results = dtNurOpdList;
        //        //}
        //        //else 
        //        //if (reqType == "nur-opd-list-pastDays")
        //        //{
        //        //    List<SqlParameter> paramList = new List<SqlParameter>() {
        //        //        new SqlParameter("@FromDate", fromDate),
        //        //        new SqlParameter("@ToDate", toDate)
        //        //    };
        //        //    DataTable dtNurOpdList = DALFunctions.GetDataTableFromStoredProc("SP_GetVisitListForOPD", paramList, dbContext);

        //        //    responseData.Results = dtNurOpdList;
        //        //}
        //        //else
        //        //if (reqType == "get-all-complains")
        //        //{
        //        //    //int patId = ToInt(this.ReadQueryStringData("patientId"));
        //        //    int patientVisitId = ToInt(this.ReadQueryStringData("patientVisitId"));
        //        //    var complains = (from cln in clndbContext.PatientClinicalInfos
        //        //                     where cln.IsActive == true
        //        //                     && cln.PatientVisitId == patientVisitId
        //        //                     select new
        //        //                     {
        //        //                         cln.InfoId,
        //        //                         cln.KeyName,
        //        //                         cln.Value
        //        //                     }).ToList();

        //        //    //join refVisit in clndbContext.Visit on cln.PatientVisitId equals refVisit.PatientVisitId
        //        //    //where refVisit.IsTriaged == true &&


        //        //    responseData.Results = complains;
        //        //    responseData.Status = "OK";
        //        //}

        //    }
        //    catch (Exception ex)
        //    {
        //        throw ex;
        //    }
        //    return DanpheJSONConvert.SerializeObject(responseData, true);
        //}

        // GET api/values/5


        //[HttpGet("{id}")]
        //public string Get(int id)
        //{
        //    return "value";
        //}
        [HttpGet("/api/Nursing/getNephrologyPatients")]
        public string getNephrologyPatients()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            BillingDbContext billingDbContext = new BillingDbContext(connString);

            try
            {


                DataTable nephPats = DALFunctions.GetDataTableFromStoredProc("SP_NEPH_GetDialisysPatientListWithBillingItem", billingDbContext);


                /*  var nephPats = (from pat in billingDbContext.Patient
                                  join bti in billingDbContext.BillingTransactionItems on pat.PatientId equals bti.PatientId
                                  join msd in billingDbContext.ServiceDepartment on bti.ServiceDepartmentId equals msd.ServiceDepartmentId
                                  where msd.IntegrationName == "Nephrology" && pat.DialysisCode != null
                                  select new
                                  {
                                      pat.PatientId,
                                      pat.PatientCode,
                                      pat.DialysisCode,
                                      pat.Gender,
                                      bti.ItemName,
                                      bti.RequisitionDate,
                                      pat.Age,
                                      pat.DateOfBirth,
                                      pat.Address,
                                      pat.PhoneNumber,
                                      bti.PerformerName,
                                      ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                  }).OrderByDescending(patient => patient.PatientId).ToList();*/
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
        [Route("FavouritePatient")]
        public IActionResult FavouritePatient(string patVisitId, string preferenceType, string wardId)
        {
            //if (reqType != null && reqType == "AddToPreference")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddFavouritePatient(patVisitId, preferenceType, wardId, currentUser);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("ClinicalInformation")]
        public IActionResult ClinicalInformationlains()
        {
            //if (reqType == "post-clinical-info")
            String ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddToClinicalInfo(ipDataStr, currentUser);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("Complaint")]
        public IActionResult complaint()
        {
            //if (reqType == "post-complaint")
            String ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddNewComplaint(ipDataStr, currentUser);
            return InvokeHttpPostFunction(func);
        }


        [HttpPost]
        [Route("CheckInDetails")]
        public IActionResult CheckInDetails([FromBody] NursingOpdCheckIn_DTO nursingCheckIn_DTO)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddCheckInDetails(nursingCheckIn_DTO, currentUser);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("VisitForFreeReferral")]
        public ActionResult VisitForFreeReferral([FromBody] NursingOpdrefer_DTO nursingOpdrefer_DTO)
        {
            //  string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => CreateVisitForFreeReferral(nursingOpdrefer_DTO, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }
        [HttpPost]
        [Route("CheckOutDetails")]
        public ActionResult CheckOutDetails([FromBody] NursingOpdCheckOut_DTO nursingOpdCheckOut_DTO)
        {
            // string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => AddCheckOutDetails(nursingOpdCheckOut_DTO, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPut]
        [Route("ExchangeDoctorDepartment")]
        public ActionResult ExchangeDoctorDepartment([FromBody] NursingExchangedDoctorDepartment_DTO nursingExchangedDoctorDepartment_DTO)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => UpdateExchangedDoctorDepartment(nursingExchangedDoctorDepartment_DTO, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }

        //[HttpPost]
        //public string Post()
        //{
        //    DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        //    try
        //    {
        //        string reqType = this.ReadQueryStringData("reqType");
        //        int patientId = ToInt(this.ReadQueryStringData("patientId"));
        //        int patientVisitId = ToInt(this.ReadQueryStringData("patientVisitId"));
        //        string str = this.ReadPostData();

        //        OrdersDbContext orderDbContext = new OrdersDbContext(connString);
        //        ClinicalDbContext dbContext = new ClinicalDbContext(connString);
        //        RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

        //if (reqType != null && reqType == "AddToPreference")
        //{
        //    string preferenceType = this.ReadQueryStringData("preferenceType");
        //    string preferenceName = null;
        //    string preferenceIdType = null;
        //    string preferenceWardId = null;

        //    if (preferenceType.ToLower() == "nursing")
        //    {
        //        preferenceName = "NursingPatientPreferences";
        //        preferenceIdType = "PatientVisitId";
        //        preferenceWardId = "WardId";
        //    }
        //    string ItemId = this.ReadQueryStringData("itemId");
        //    string WardId = this.ReadQueryStringData("wardId");

        //    EmployeePreferences employeePreference = (from pref in orderDbContext.EmployeePreferences
        //                                              where pref.EmployeeId == currentUser.EmployeeId &&
        //                                              pref.PreferenceName == preferenceName
        //                                              select pref).FirstOrDefault();

        //    if (employeePreference == null)
        //    {
        //        XmlDocument xdoc = new XmlDocument();

        //        //(2) string.Empty makes cleaner code
        //        XmlElement rootElm = xdoc.CreateElement(string.Empty, "root", string.Empty);
        //        xdoc.AppendChild(rootElm);

        //        XmlElement row = xdoc.CreateElement(string.Empty, "Row", string.Empty);
        //        rootElm.AppendChild(row);

        //        XmlElement nodePatVisitId = xdoc.CreateElement(string.Empty, "PatientVisitId", string.Empty);
        //        nodePatVisitId.InnerText = ItemId;
        //        row.AppendChild(nodePatVisitId);

        //        XmlElement nodeWardId = xdoc.CreateElement(string.Empty, "WardId", string.Empty);
        //        nodeWardId.InnerText = WardId;
        //        row.AppendChild(nodeWardId);

        //        EmployeePreferences employeePref = new EmployeePreferences();

        //        employeePref.PreferenceName = preferenceName;
        //        employeePref.PreferenceValue = xdoc.InnerXml;
        //        employeePref.EmployeeId = currentUser.EmployeeId;
        //        employeePref.CreatedBy = currentUser.EmployeeId;
        //        employeePref.CreatedOn = DateTime.Now;
        //        employeePref.IsActive = true;
        //        orderDbContext.EmployeePreferences.Add(employeePref);
        //        orderDbContext.SaveChanges();
        //        responseData.Status = "OK";
        //        responseData.Results = ItemId;
        //    }
        //    else
        //    {

        //        XmlDocument prefXmlDoc = new XmlDocument();
        //        prefXmlDoc.LoadXml(employeePreference.PreferenceValue);
        //        XmlElement Row = prefXmlDoc.CreateElement("Row");
        //        XmlElement typeId = prefXmlDoc.CreateElement(preferenceIdType);
        //        typeId.InnerText = ItemId;
        //        XmlElement wardId = prefXmlDoc.CreateElement(preferenceWardId);
        //        wardId.InnerText = WardId;
        //        Row.AppendChild(typeId);
        //        Row.AppendChild(wardId);
        //        prefXmlDoc.DocumentElement.AppendChild(Row);
        //        employeePreference.PreferenceValue = prefXmlDoc.InnerXml;
        //        employeePreference.ModifiedBy = currentUser.EmployeeId;
        //        employeePreference.ModifiedOn = DateTime.Now;

        //        orderDbContext.Entry(employeePreference).State = EntityState.Modified;
        //        orderDbContext.SaveChanges();
        //        responseData.Status = "OK";
        //        responseData.Results = ItemId;

        //    }
        //}

        //else
        //if (reqType == "post-clinical-info")
        //{
        //    List<PatientClinicalInfo> patClinicalInfo = DanpheJSONConvert.DeserializeObject<List<PatientClinicalInfo>>(str);
        //    int visitId = patClinicalInfo[0].PatientVisitId;

        //    using (var dbContextTransaction = dbContext.Database.BeginTransaction())
        //    {
        //        try
        //        {
        //            if (patClinicalInfo != null && patClinicalInfo.Count > 0)
        //            {
        //                foreach (var info in patClinicalInfo)
        //                {
        //                    info.IsActive = true;
        //                    info.CreatedBy = currentUser.EmployeeId;
        //                    info.ModifiedBy = currentUser.EmployeeId;
        //                    info.CreatedOn = DateTime.Now;
        //                    info.ModifiedOn = DateTime.Now;

        //                    dbContext.PatientClinicalInfos.Add(info);

        //                }

        //                var patVisit = (from refVisit in dbContext.Visit
        //                                where refVisit.PatientVisitId == visitId
        //                                select refVisit).FirstOrDefault();
        //                patVisit.IsTriaged = true;
        //                dbContext.Visit.Attach(patVisit);
        //                dbContext.Entry(patVisit).Property(f => f.IsTriaged).IsModified = true;
        //                dbContext.SaveChanges();
        //            }

        //            dbContextTransaction.Commit();
        //            responseData.Status = "OK";
        //            responseData.Results = patClinicalInfo;
        //        }
        //        catch (Exception ex)
        //        {
        //            dbContextTransaction.Rollback();
        //            responseData.Results = null;
        //            responseData.Status = "Failed";
        //            throw ex;
        //        }

        //    }

        //}

        //else

        //if (reqType == "post-complaint")
        //{
        //    List<PatientClinicalInfo> patClinicalInfo = DanpheJSONConvert.DeserializeObject<List<PatientClinicalInfo>>(str);
        //    foreach (var item in patClinicalInfo)
        //    {
        //        item.CreatedBy = currentUser.EmployeeId;
        //        item.CreatedOn = System.DateTime.Now;
        //        item.IsActive = true;
        //        dbContext.PatientClinicalInfos.Add(item);
        //    }

        //    dbContext.SaveChanges();
        //    responseData.Status = "OK";
        //    responseData.Results = patClinicalInfo;

        //}
        //    }
        //    catch (Exception e)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = e.Message + "exception details: " + e.ToString();
        //    }
        //    return DanpheJSONConvert.SerializeObject(responseData, true);
        //}

        // PUT api/values/5

        [HttpPut]
        [Route("ClinicalInformation")]
        public IActionResult ClinicalInformation(int patientId, int patientVisitId)
        {
            //if (reqType == "put-clinical-info")
            String ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => UpdateClinicalInfo(patientId, patientVisitId, ipDataStr, currentUser);
            return InvokeHttpPutFunction(func);
        }
        [HttpPut]
        [Route("Complaint")]
        public IActionResult Complaint()
        {
            //if (reqType == "update-chief-complaint")
            String ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => UpdateComplaint(ipDataStr, currentUser);
            return InvokeHttpPutFunction(func);
        }

        //[HttpPut]
        //public string Put()
        //{
        //    DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        //    ClinicalDbContext dbContext = new ClinicalDbContext(connString);
        //    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
        //    string str = this.ReadPostData();
        //    string reqType = this.ReadQueryStringData("reqType");
        //    int patientId = ToInt(this.ReadQueryStringData("patientId"));
        //    int patientVisitId = ToInt(this.ReadQueryStringData("patientVisitId"));
        //    int infoId = ToInt(this.ReadQueryStringData("infoId"));

        //    try
        //    {
        //if (reqType == "put-clinical-info")
        //{
        //    List<PatientClinicalInfo> pat = DanpheJSONConvert.DeserializeObject<List<PatientClinicalInfo>>(str);
        //    List<int> toBeUpdated = pat.Where(p => p.InfoId != 0).Select(x => x.InfoId).ToList();

        //    List<PatientClinicalInfo> allTriagedDataOfPat = dbContext.PatientClinicalInfos.Where(x => x.PatientVisitId == patientVisitId).ToList();

        //    if (pat != null && pat.Count > 0)
        //    {
        //        List<PatientClinicalInfo> patToBeUpdated = (from info in allTriagedDataOfPat
        //                                                    where toBeUpdated.Contains(info.InfoId)
        //                                                    select info).ToList();
        //        List<PatientClinicalInfo> patToBeRemoved = (from info in allTriagedDataOfPat
        //                                                    where !toBeUpdated.Contains(info.InfoId)
        //                                                    select info).ToList();
        //        foreach (var item in patToBeRemoved)
        //        {
        //            item.IsActive = false;
        //            item.ModifiedOn = DateTime.Now;
        //            item.ModifiedBy = currentUser.EmployeeId;
        //            dbContext.Entry(item).Property(x => x.IsActive).IsModified = true;
        //            dbContext.Entry(item).Property(x => x.ModifiedBy).IsModified = true;
        //            dbContext.Entry(item).Property(x => x.ModifiedOn).IsModified = true;
        //        }
        //        dbContext.SaveChanges();

        //        for (var i = 0; i < pat.Count; i++)
        //        {
        //            var inf = pat[i].InfoId;

        //            if (inf != 0)
        //            {
        //                PatientClinicalInfo patClinicalInfo = patToBeUpdated.Where(p => p.InfoId == inf).FirstOrDefault();
        //                dbContext.PatientClinicalInfos.Attach(patClinicalInfo);
        //                dbContext.Entry(patClinicalInfo).State = EntityState.Modified;
        //                patClinicalInfo.ModifiedOn = DateTime.Now;
        //                patClinicalInfo.ModifiedBy = currentUser.EmployeeId;
        //                patClinicalInfo.Value = pat[i].Value;
        //                dbContext.Entry(patClinicalInfo).Property(x => x.Value).IsModified = true;
        //                dbContext.Entry(patClinicalInfo).Property(x => x.ModifiedBy).IsModified = true;
        //                dbContext.Entry(patClinicalInfo).Property(x => x.ModifiedOn).IsModified = true;
        //                dbContext.SaveChanges();
        //            }
        //            else if (inf == 0)
        //            {
        //                PatientClinicalInfo patInfo = pat[i];
        //                patInfo.IsActive = true;
        //                patInfo.CreatedBy = currentUser.EmployeeId;
        //                patInfo.ModifiedBy = currentUser.EmployeeId;
        //                patInfo.CreatedOn = DateTime.Now;
        //                patInfo.ModifiedOn = DateTime.Now;

        //                dbContext.PatientClinicalInfos.Add(patInfo);
        //                dbContext.SaveChanges();

        //            }

        //        }

        //        responseData.Status = "OK";
        //        responseData.Results = pat;
        //    }

        //}

        //else 
        //if (reqType == "update-chief-complaint")
        //{
        //    PatientClinicalInfo patComp = DanpheJSONConvert.DeserializeObject<PatientClinicalInfo>(str);
        //    PatientClinicalInfo compToUpdate = dbContext.PatientClinicalInfos.Where(x => x.InfoId == patComp.InfoId).FirstOrDefault();
        //    compToUpdate.Value = patComp.Value;
        //    compToUpdate.ModifiedOn = DateTime.Now;
        //    compToUpdate.ModifiedBy = currentUser.EmployeeId;
        //    compToUpdate.IsActive = patComp.IsActive;

        //    dbContext.Entry(compToUpdate).Property(x => x.Value).IsModified = true;
        //    dbContext.Entry(compToUpdate).Property(x => x.IsActive).IsModified = true;
        //    dbContext.Entry(compToUpdate).Property(x => x.ModifiedBy).IsModified = true;
        //    dbContext.Entry(compToUpdate).Property(x => x.ModifiedOn).IsModified = true;

        //    dbContext.SaveChanges();
        //    responseData.Status = "OK";
        //    responseData.Results = compToUpdate;

        //}
        //    }
        //    catch (Exception e)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = e.Message + "exception details: " + e.ToString();
        //    }
        //    return DanpheJSONConvert.SerializeObject(responseData, true);
        //}

        // DELETE api/values/5


        [HttpPut]
        [Route("RemoveFromPreference")]
        public IActionResult RemoveFromPreference(int patId, string preferenceType, int wardId, string itemId)
        {
            //if (reqType != null && reqType == "DeleteFromPreference")
            String ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => RemoveFromFavorites(patId, preferenceType, wardId, itemId, ipDataStr, currentUser);
            return InvokeHttpPutFunction(func);
        }
        private object RemoveFromFavorites(int patId, string preferenceType, int wardId, string itemId, string ipDataStr, RbacUser currentUser)
        {
            string preferenceIdType = null;
            string preferenceName = null;
            string preferenceWardId = null;
            if (preferenceType.ToLower() == "nursing")
            {
                preferenceName = "NursingPatientPreferences";
                preferenceIdType = "//PatientVisitId";
                preferenceWardId = "//WardId";
            }

            EmployeePreferences employeePreference = (from pref in _orderDbContext.EmployeePreferences
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
            _orderDbContext.SaveChanges();
            return itemId;

        }

        //[HttpDelete]
        //public string Delete(string reqType, string itemId, string wardid)
        //{
        //    DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        //    try
        //    {
        //        OrdersDbContext orderDbContext = new OrdersDbContext(connString);
        //        if (reqType != null && reqType == "DeleteFromPreference")
        //        {
        //            string preferenceType = this.ReadQueryStringData("preferenceType");
        //            string preferenceIdType = null;
        //            string preferenceName = null;
        //            string preferenceWardId = null;
        //            if (preferenceType.ToLower() == "nursing")
        //            {
        //                preferenceName = "NursingPatientPreferences";
        //                preferenceIdType = "//PatientVisitId";
        //                preferenceWardId = "//WardId";
        //            }

        //            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
        //            EmployeePreferences employeePreference = (from pref in orderDbContext.EmployeePreferences
        //                                                      where pref.EmployeeId == currentUser.EmployeeId &&
        //                                                      pref.PreferenceName == preferenceName
        //                                                      select pref).FirstOrDefault();


        //            XmlDocument xdoc = new XmlDocument();
        //            xdoc.LoadXml(employeePreference.PreferenceValue);

        //            XmlNodeList nodes = xdoc.SelectNodes(preferenceIdType);
        //            foreach (XmlNode node in nodes)
        //            {
        //                if (node.InnerXml == itemId.ToString())
        //                {
        //                    XmlNode parent = node.ParentNode;
        //                    parent.ParentNode.RemoveChild(parent);

        //                }
        //            }

        //            employeePreference.PreferenceValue = xdoc.InnerXml;
        //            employeePreference.ModifiedBy = currentUser.EmployeeId;
        //            employeePreference.ModifiedOn = DateTime.Now;
        //            orderDbContext.SaveChanges();
        //            responseData.Status = "OK";
        //            responseData.Results = itemId;
        //        }
        //    }
        //    catch (Exception e)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = e.Message + "Exception details: " + e.ToString();
        //    }
        //    return DanpheJSONConvert.SerializeObject(responseData, true);
        //}

        [HttpGet("GetAllDepartments")]
        public async Task<IActionResult> GetAllDepartments()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            ClinicalDbContext clinicalDbContext = new ClinicalDbContext(connString);
            try
            {


                var allDepartmentList = await (from dept in clinicalDbContext.Departments select dept).ToListAsync();
                responseData.Results = allDepartmentList;
                responseData.Status = "OK";

            }
            catch (Exception e)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = e.Message + "Exception details: " + e.ToString();
            }
            return Ok(responseData);
        }

        [HttpGet("GetBillingDetails/{PatientId}/{PatientVisitId}")]
        public string GetBillingDetails(int PatientId, int PatientVisitId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            BillingDbContext billingDbContext = new BillingDbContext(connString);
            responseData.Results = "OK";
            try
            {
                var depositDetails = billingDbContext.BillingDeposits.Where(dep => dep.PatientId == PatientId && dep.PatientVisitId == PatientVisitId && dep.IsActive == true).Select(d => d).ToList();
                var TotalDepositAdded = depositDetails.Where(dep => dep.TransactionType.ToLower() == ENUM_DepositTransactionType.Deposit.ToLower()).Sum(dep => dep.InAmount);

                var TotalDepositReturned = depositDetails.Where(dep =>
                                                                  (dep.TransactionType.ToLower() == ENUM_DepositTransactionType.DepositDeduct.ToLower() || dep.TransactionType.ToLower() == ENUM_DepositTransactionType.ReturnDeposit.ToLower())
                                                           ).Sum(dep => dep.OutAmount);
                //var DepositTxns = depositDetails.Where(dep => dep.PatientId == PatientId && dep.PatientVisitId==PatientVisitId);
                var PendingBillAmount = billingDbContext.BillingTransactionItems.AsNoTracking().Where(bt =>
                                                                                bt.BillStatus == ENUM_BillingStatus.provisional && bt.PatientId == PatientId && bt.PatientVisitId == PatientVisitId
                                                                                && (bt.IsInsurance == false || bt.IsInsurance == null)).Sum(bt => bt.TotalAmount);
                var GrandTotalDeposit = TotalDepositAdded - TotalDepositReturned;
                var BillingDetails = new { TotalDepositAmount = GrandTotalDeposit, TotalPendingBillAmount = PendingBillAmount };
                responseData.Results = BillingDetails;
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.OK;
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.Failed;
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }
        [HttpGet]
        [Route("InvestigationResults")]
        public IActionResult InvestigationResults(int patientId, int patientVisitId, DateTime fromDate, DateTime toDate)
        {

            List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@FromDate", fromDate),
                        new SqlParameter("@ToDate", toDate),
                        new SqlParameter("@PatientId", patientId),
                        new SqlParameter("@PatientVisitId", patientVisitId)
                    };
            DataTable investigationResults = DALFunctions.GetDataTableFromStoredProc("SP_CLN_GetPatientInvestigationResults", paramList, _clinicalDbContext);
            Func<object> func = () => investigationResults;
            return InvokeHttpPutFunction(func);
        }

        private object AddFavouritePatient(string patVisitId, string preferenceType, string wardId, RbacUser currentUser)
        {

            // string preferenceType = this.ReadQueryStringData("preferenceType");
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

            EmployeePreferences employeePreference = (from pref in _orderDbContext.EmployeePreferences
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
                _orderDbContext.EmployeePreferences.Add(employeePref);
                _orderDbContext.SaveChanges();
                return ItemId;
            }
            else
            {

                XmlDocument prefXmlDoc = new XmlDocument();
                prefXmlDoc.LoadXml(employeePreference.PreferenceValue);
                XmlElement Row = prefXmlDoc.CreateElement("Row");
                XmlElement typeId = prefXmlDoc.CreateElement(preferenceIdType);
                typeId.InnerText = ItemId;
                XmlElement _wardId = prefXmlDoc.CreateElement(preferenceWardId);
                _wardId.InnerText = WardId;
                Row.AppendChild(typeId);
                Row.AppendChild(_wardId);
                prefXmlDoc.DocumentElement.AppendChild(Row);
                employeePreference.PreferenceValue = prefXmlDoc.InnerXml;
                employeePreference.ModifiedBy = currentUser.EmployeeId;
                employeePreference.ModifiedOn = DateTime.Now;

                _orderDbContext.Entry(employeePreference).State = EntityState.Modified;
                _orderDbContext.SaveChanges();
                return ItemId;

            }

        }
        private object AddToClinicalInfo(string ipDataStr, RbacUser currentUser)
        {

            List<PatientClinicalInfoModel> patClinicalInfo = DanpheJSONConvert.DeserializeObject<List<PatientClinicalInfoModel>>(ipDataStr);
            int visitId = patClinicalInfo[0].PatientVisitId;

            using (var dbContextTransaction = _clinicalDbContext.Database.BeginTransaction())
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

                            _clinicalDbContext.PatientClinicalInfos.Add(info);

                        }

                        var patVisit = (from vis in _clinicalDbContext.Visit
                                        where vis.PatientVisitId == visitId
                                        select vis).FirstOrDefault();
                        patVisit.IsTriaged = true;
                        _clinicalDbContext.Visit.Attach(patVisit);
                        _clinicalDbContext.Entry(patVisit).Property(f => f.IsTriaged).IsModified = true;
                        _clinicalDbContext.SaveChanges();
                    }

                    dbContextTransaction.Commit();
                    return patClinicalInfo;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();

                    throw ex;
                }

            }
        }
        private object AddNewComplaint(string ipDataStr, RbacUser currentUser)
        {

            List<PatientClinicalInfoModel> patClinicalInfo = DanpheJSONConvert.DeserializeObject<List<PatientClinicalInfoModel>>(ipDataStr);
            foreach (var item in patClinicalInfo)
            {
                item.CreatedBy = currentUser.EmployeeId;
                item.CreatedOn = System.DateTime.Now;
                item.IsActive = true;
                _clinicalDbContext.PatientClinicalInfos.Add(item);
            }

            _clinicalDbContext.SaveChanges();
            return patClinicalInfo;

        }
        private object GetOpdVisitsInDateRange(DateTime fromDate, DateTime toDate)
        {

            List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@FromDate", fromDate),
                        new SqlParameter("@ToDate", toDate)
                    };
            DataTable dtNurOpdList = DALFunctions.GetDataTableFromStoredProc("SP_NUR_GetOpdVisitDetails", paramList, _visitDbContext);
            return dtNurOpdList;
        }



        private object GetPastDataVisits(DateTime fromDate, DateTime toDate)
        {

            List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@FromDate", fromDate),
                        new SqlParameter("@ToDate", toDate)
                    };
            DataTable dtNurOpdList = DALFunctions.GetDataTableFromStoredProc("SP_NUR_GetOpdVisitDetails", paramList, _visitDbContext);

            return dtNurOpdList;

        }

        private object GetComplaints(int patientVisitId)
        {
            //  int patientVisitId = ToInt(this.ReadQueryStringData("patientVisitId"));
            var complains = (from cln in _clinicalDbContext.PatientClinicalInfos
                             where cln.IsActive == true
                             && cln.PatientVisitId == patientVisitId
                             select new
                             {
                                 cln.InfoId,
                                 cln.KeyName,
                                 cln.Value
                             }).ToList();
            return complains;

        }
        // for newfreevisitrefer
        private object CreateVisitForFreeReferral(NursingOpdrefer_DTO nursingOpdrefer_DTO, RbacUser currentUser)
        {

            /*            VisitModel refVisit = JsonConvert.DeserializeObject<VisitModel>(JsonConvert.SerializeObject(nursingOpdrefer_DTO));*/
            VisitModel refVisit = new VisitModel();
            refVisit.PerformerId = nursingOpdrefer_DTO.ReferredDoctorId;
            refVisit.PerformerName = nursingOpdrefer_DTO.ReferredDoctor;
            refVisit.PatientId = nursingOpdrefer_DTO.PatientId;
            refVisit.DepartmentId = nursingOpdrefer_DTO.ReferreddepartmentId;
            refVisit.DepartmentName = nursingOpdrefer_DTO.ReferredDepartment;
            refVisit.Remarks = nursingOpdrefer_DTO.ReferRemarks;
            refVisit.ParentVisitId = nursingOpdrefer_DTO.PatientVisitId;
            refVisit.VisitType = nursingOpdrefer_DTO.VisitType;
            refVisit.VisitStatus = nursingOpdrefer_DTO.VisitStatus;
            refVisit.BillingStatus = nursingOpdrefer_DTO.BillingStatus;
            refVisit.AppointmentType = nursingOpdrefer_DTO.AppointmentType;
            refVisit.CreatedOn = DateTime.Now;
            refVisit.CreatedBy = currentUser.EmployeeId;
            refVisit.IsActive = true;
            refVisit.VisitDate = DateTime.Now;
            refVisit.VisitTime = DateTime.Now.TimeOfDay;
            //refVisit.PatientVisitId = 0;//try this if abvoe doesn't work
            // refVisit.PatientVisitId = nursingOpdrefer_DTO.PatientVisitId;//this should be ParentVisitId



            // VisitModel refVisit = JsonConvert.DeserializeObject<VisitModel>(str);
            //to avoid clashing of visits
            if (VisitBL.HasDuplicateVisitWithSameProvider(_visitDbContext, refVisit.PatientId, refVisit.PerformerId, refVisit.VisitDate) && refVisit.VisitType == "outpatient")
            {

                throw new Exception("Patient already has visit with this Doctor today.");
            }
            else
            {
                //get provider name from providerId
                if (refVisit.PerformerId != null && refVisit.PerformerId != 0)
                {
                    refVisit.PerformerName = VisitBL.GetProviderName(refVisit.PerformerId, connString);
                }

                var parentVisit = _visitDbContext.Visits.Where(x => x.PatientVisitId == refVisit.ParentVisitId).FirstOrDefault();
                BillingDbContext billingDbContext = new BillingDbContext(connString);
                BillingSchemeModel schemeObj = billingDbContext.BillingSchemes.Where(sch => sch.SchemeId == parentVisit.SchemeId).FirstOrDefault();

                if (parentVisit != null)
                {
                    refVisit.PriceCategoryId = parentVisit.PriceCategoryId;
                    refVisit.SchemeId = parentVisit.SchemeId;
                    if (schemeObj.IsBillingCoPayment == true)
                    {
                        //generate new claim code Here..
                        Random generator = new Random();
                        String r = generator.Next(1, 10000).ToString("D4");
                        refVisit.ClaimCode = Int64.Parse(r + DateTime.Now.Minute + DateTime.Now.Second);
                    }
                }
                else
                {
                    throw new Exception("Parentid is null");
                }

                _visitDbContext.Visits.Add(refVisit);



                GenerateVisitCodeAndSave(_visitDbContext, refVisit, connString);
                if (schemeObj != null && schemeObj.IsBillingCoPayment)//Sud:22Mar'23-- this logic should be Revised.
                {
                    //Krishna, 22Jan'23 Below code is an async method, Hence it will continue at its back, User do not need to hold for this operation to complete while free follow up
                    SSFDbContext sSFDbContext = new SSFDbContext(connString);
                    VisitBL.UpdatePatientSchemeForFreeFollowupAndFreeReferral(_visitDbContext, sSFDbContext, refVisit, parentVisit, currentUser);
                }


                //updateIsContinuedStatus in case of referral visit and followup visit
                if (refVisit.AppointmentType.ToLower() == ENUM_AppointmentType.referral.ToLower() // "referral"
                    || refVisit.AppointmentType.ToLower() == ENUM_AppointmentType.followup.ToLower() //"followup"
                    || refVisit.AppointmentType.ToLower() == ENUM_AppointmentType.transfer.ToLower())//"transfer")
                {
                    UpdateIsContinuedStatus(refVisit.ParentVisitId,
                        refVisit.AppointmentType,
                        true,
                        currentUser.EmployeeId,
                        _visitDbContext);
                }

                refVisit.QueueNo = VisitBL.CreateNewPatientQueueNo(_visitDbContext, refVisit.PatientVisitId, connString);
                //Return Model should be in same format as that of the ListVisit since it's appended in the same list.
                ListVisitsVM returnVisit = (from visit in _visitDbContext.Visits
                                            where visit.PatientVisitId == refVisit.PatientVisitId
                                            join department in _visitDbContext.Departments on visit.DepartmentId equals department.DepartmentId
                                            join patient in _visitDbContext.Patients on visit.PatientId equals patient.PatientId
                                            select new ListVisitsVM
                                            {
                                                PatientVisitId = visit.PatientVisitId,
                                                ParentVisitId = visit.ParentVisitId,
                                                VisitDate = visit.VisitDate,
                                                VisitTime = visit.VisitTime,
                                                PatientId = patient.PatientId,
                                                PatientCode = patient.PatientCode,
                                                ShortName = patient.FirstName + " " + (string.IsNullOrEmpty(patient.MiddleName) ? "" : patient.MiddleName + " ") + patient.LastName,
                                                PhoneNumber = patient.PhoneNumber,
                                                DateOfBirth = patient.DateOfBirth,
                                                Gender = patient.Gender,
                                                DepartmentId = department.DepartmentId,
                                                DepartmentName = department.DepartmentName,
                                                PerformerName = visit.PerformerName,
                                                PerformerId = visit.PerformerId,
                                                VisitType = visit.VisitType,
                                                AppointmentType = visit.AppointmentType,
                                                BillStatus = visit.BillingStatus,
                                                Patient = patient,
                                                QueueNo = visit.QueueNo
                                            }).FirstOrDefault();



                return returnVisit;
            }
        }
        private object UpdateExchangedDoctorDepartment(NursingExchangedDoctorDepartment_DTO nursingExchangedDoctorDepartment_DTO, RbacUser currentUser)
        {
            using (var dbContextTransaction = _clinicalDbContext.Database.BeginTransaction())
            {
                try
                {
                    VisitModel exchangedDoctorDepartment = new VisitModel();
                    exchangedDoctorDepartment.PerformerId = nursingExchangedDoctorDepartment_DTO.ExchangedDoctorId;
                    exchangedDoctorDepartment.PerformerName = nursingExchangedDoctorDepartment_DTO.ExchangedDoctorName;
                    exchangedDoctorDepartment.DepartmentId = nursingExchangedDoctorDepartment_DTO.ExchangedDepartmentId;
                    exchangedDoctorDepartment.Remarks = nursingExchangedDoctorDepartment_DTO.ExchangedRemarks ?? null;

                    var matchedVisit = _clinicalDbContext.Visit.Where(v => v.PatientVisitId == nursingExchangedDoctorDepartment_DTO.PatientVisitId).FirstOrDefault();

                    //ExchangedDoctorDepartment
                    matchedVisit.PerformerId = exchangedDoctorDepartment.PerformerId;
                    matchedVisit.PerformerName = exchangedDoctorDepartment.PerformerName;
                    matchedVisit.DepartmentId = exchangedDoctorDepartment.DepartmentId;
                    matchedVisit.Remarks = exchangedDoctorDepartment.Remarks;
                    matchedVisit.ModifiedOn = DateTime.Now;
                    matchedVisit.ModifiedBy = currentUser.EmployeeId;
                    _clinicalDbContext.Entry(matchedVisit).State = EntityState.Modified;
                    _clinicalDbContext.SaveChanges();

                    //UpdatedDiagnosis
                    if (nursingExchangedDoctorDepartment_DTO.DiagnosisList.Count > 0)
                    {
                        var ExistingDiagnosisList = _clinicalDbContext.FinalDiagnosis.Where(d => d.PatientVisitId == nursingExchangedDoctorDepartment_DTO.PatientVisitId).ToList();

                        var MatchingDiagnosisList = ExistingDiagnosisList.Where(ExistingDiagnosis => nursingExchangedDoctorDepartment_DTO.DiagnosisList
                                                                        .Any(newDiagnosis => newDiagnosis.ICD10ID == ExistingDiagnosis.ICD10ID))
                                                                        .ToList();

                        if (MatchingDiagnosisList.Count > 0)
                        {
                            foreach (var item in MatchingDiagnosisList)
                            {
                                if (item.IsActive == false)
                                {
                                    var Diagnosis = MatchingDiagnosisList.Where(m => m.ICD10ID == item.ICD10ID).FirstOrDefault();
                                    Diagnosis.IsActive = true;
                                }
                            }
                            _clinicalDbContext.SaveChanges();
                        }

                        var NewDiagnosisList = nursingExchangedDoctorDepartment_DTO.DiagnosisList.Where(newDiagnosis => !ExistingDiagnosisList
                                                                                                 .Any(existingDiagnosis => existingDiagnosis.ICD10ID == newDiagnosis.ICD10ID))
                                                                                                 .ToList();

                        if (NewDiagnosisList.Count > 0)
                        {
                            foreach (var item in NewDiagnosisList)
                            {
                                var finalDiagnosis = new FinalDiagnosisModel();
                                finalDiagnosis.PatientId = item.PatientId;
                                finalDiagnosis.PatientVisitId = item.PatientVisitId;
                                finalDiagnosis.ICD10ID = item.ICD10ID;
                                finalDiagnosis.CreatedBy = currentUser.EmployeeId;
                                finalDiagnosis.CreatedOn = DateTime.Now;
                                finalDiagnosis.IsActive = true;
                                _clinicalDbContext.FinalDiagnosis.Add(finalDiagnosis);
                            }
                            _clinicalDbContext.SaveChanges();
                        }

                        var RemovedDiagnosisList = ExistingDiagnosisList.Where(ExistingDiagnosis => !nursingExchangedDoctorDepartment_DTO.DiagnosisList
                                                                        .Any(newDiagnosis => newDiagnosis.ICD10ID == ExistingDiagnosis.ICD10ID))
                                                                        .ToList();

                        if (RemovedDiagnosisList.Count > 0)
                        {
                            foreach (var item in RemovedDiagnosisList)
                            {
                                var Diagnosis = _clinicalDbContext.FinalDiagnosis.Where(d => d.FinalDiagnosisId == item.FinalDiagnosisId).FirstOrDefault();
                                Diagnosis.IsActive = false;
                                Diagnosis.ModifiedOn = DateTime.Now;
                                Diagnosis.ModifiedBy = currentUser.EmployeeId;
                            }
                            _clinicalDbContext.SaveChanges();
                        }

                    }
                    else if (nursingExchangedDoctorDepartment_DTO.DiagnosisList.Count == 0)
                    {
                        var RemovedDiagnosisList = _clinicalDbContext.FinalDiagnosis.Where(d => d.PatientVisitId == nursingExchangedDoctorDepartment_DTO.PatientVisitId).ToList();
                        if (RemovedDiagnosisList.Count > 0)
                        {
                            foreach (var item in RemovedDiagnosisList)
                            {
                                var Diagnosis = _clinicalDbContext.FinalDiagnosis.Where(d => d.FinalDiagnosisId == item.FinalDiagnosisId).FirstOrDefault();
                                Diagnosis.IsActive = false;
                                Diagnosis.ModifiedOn = DateTime.Now;
                                Diagnosis.ModifiedBy = currentUser.EmployeeId;
                            }
                            _clinicalDbContext.SaveChanges();
                        }
                    }
                    dbContextTransaction.Commit();
                    return true;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    return ex.Message;
                }
            }
        }

        private void GenerateVisitCodeAndSave(VisitDbContext visitDbContext, VisitModel refVisit, string connString)
        {
            try
            {
                refVisit.VisitCode = VisitBL.CreateNewPatientVisitCode(refVisit.VisitType, connString);
                visitDbContext.SaveChanges();

                var oldReferral = visitDbContext.Visits.Where(a => a.PatientVisitId == refVisit.ParentVisitId).FirstOrDefault();
                oldReferral.VisitStatus = ENUM_VisitStatus.concluded;
                visitDbContext.SaveChanges();

            }
            catch (Exception ex)
            {
                if (ex is DbUpdateException dbUpdateEx)
                {
                    if (dbUpdateEx.InnerException?.InnerException is SqlException sqlException)
                    {

                        if (sqlException.Number == 2627)// unique constraint error 
                        {
                            GenerateVisitCodeAndSave(visitDbContext, refVisit, connString);
                        }
                        else
                        {
                            throw;
                        }
                    }
                    else
                        throw;
                }
                else
                    throw;
            }
        }
        private void UpdateIsContinuedStatus(int? patientVisitId,
           string appointmentType,
           bool status, int? currentEmployeeId, VisitDbContext dbContext)
        {
            VisitModel dbVisit = dbContext.Visits
                        .Where(v => v.PatientVisitId == patientVisitId)
                        .FirstOrDefault<VisitModel>();
            if (dbVisit != null)
            {
                dbVisit.ModifiedOn = DateTime.Now;
                dbVisit.ModifiedBy = currentEmployeeId;
                //updated: sud-14aug-- visit-continued is set to true for both referral as well as followup.
                if (appointmentType.ToLower() == "referral" || appointmentType.ToLower() == "followup")
                {
                    dbVisit.IsVisitContinued = status;
                    dbContext.Entry(dbVisit).Property(b => b.IsVisitContinued).IsModified = true;

                }
                else if (appointmentType.ToLower() == "transfer")
                {
                    dbVisit.IsVisitContinued = status;
                    dbVisit.IsActive = false;
                    dbContext.Entry(dbVisit).Property(b => b.IsVisitContinued).IsModified = true;
                    dbContext.Entry(dbVisit).Property(b => b.IsActive).IsModified = true;
                }
                dbContext.Entry(dbVisit).Property(b => b.ModifiedOn).IsModified = true;
                dbContext.Entry(dbVisit).Property(b => b.ModifiedBy).IsModified = true;
                dbContext.SaveChanges();
            }
            else
                throw new Exception("Cannot update IsContinuedStatus of ParentVisit.");


        }

        //end newvisitfreereferral
        private object UpdateComplaint(string ipDataStr, RbacUser currentUser)
        {

            PatientClinicalInfoModel patComp = DanpheJSONConvert.DeserializeObject<PatientClinicalInfoModel>(ipDataStr);
            PatientClinicalInfoModel compToUpdate = _clinicalDbContext.PatientClinicalInfos.Where(x => x.InfoId == patComp.InfoId).FirstOrDefault();
            compToUpdate.Value = patComp.Value;
            compToUpdate.ModifiedOn = DateTime.Now;
            compToUpdate.ModifiedBy = currentUser.EmployeeId;
            compToUpdate.IsActive = patComp.IsActive;

            _clinicalDbContext.Entry(compToUpdate).Property(x => x.Value).IsModified = true;
            _clinicalDbContext.Entry(compToUpdate).Property(x => x.IsActive).IsModified = true;
            _clinicalDbContext.Entry(compToUpdate).Property(x => x.ModifiedBy).IsModified = true;
            _clinicalDbContext.Entry(compToUpdate).Property(x => x.ModifiedOn).IsModified = true;
            _clinicalDbContext.SaveChanges();
            return compToUpdate;
        }
        private object UpdateClinicalInfo(int patientId, int patientVisitId, string ipDataStr, RbacUser currentUser)
        {

            List<PatientClinicalInfoModel> pat = DanpheJSONConvert.DeserializeObject<List<PatientClinicalInfoModel>>(ipDataStr);
            List<int> toBeUpdated = pat.Where(p => p.InfoId != 0).Select(x => x.InfoId).ToList();

            List<PatientClinicalInfoModel> allTriagedDataOfPat = _clinicalDbContext.PatientClinicalInfos.Where(x => x.PatientVisitId == patientVisitId).ToList();

            if (pat != null && pat.Count > 0)
            {
                List<PatientClinicalInfoModel> patToBeUpdated = (from info in allTriagedDataOfPat
                                                                 where toBeUpdated.Contains(info.InfoId)
                                                                 select info).ToList();
                List<PatientClinicalInfoModel> patToBeRemoved = (from info in allTriagedDataOfPat
                                                                 where !toBeUpdated.Contains(info.InfoId)
                                                                 select info).ToList();
                foreach (var item in patToBeRemoved)
                {
                    item.IsActive = false;
                    item.ModifiedOn = DateTime.Now;
                    item.ModifiedBy = currentUser.EmployeeId;
                    _clinicalDbContext.Entry(item).Property(x => x.IsActive).IsModified = true;
                    _clinicalDbContext.Entry(item).Property(x => x.ModifiedBy).IsModified = true;
                    _clinicalDbContext.Entry(item).Property(x => x.ModifiedOn).IsModified = true;
                }
                _clinicalDbContext.SaveChanges();

                for (var i = 0; i < pat.Count; i++)
                {
                    var inf = pat[i].InfoId;

                    if (inf != 0)
                    {
                        PatientClinicalInfoModel patClinicalInfo = patToBeUpdated.Where(p => p.InfoId == inf).FirstOrDefault();
                        _clinicalDbContext.PatientClinicalInfos.Attach(patClinicalInfo);
                        _clinicalDbContext.Entry(patClinicalInfo).State = EntityState.Modified;
                        patClinicalInfo.ModifiedOn = DateTime.Now;
                        patClinicalInfo.ModifiedBy = currentUser.EmployeeId;
                        patClinicalInfo.Value = pat[i].Value;
                        _clinicalDbContext.Entry(patClinicalInfo).Property(x => x.Value).IsModified = true;
                        _clinicalDbContext.Entry(patClinicalInfo).Property(x => x.ModifiedBy).IsModified = true;
                        _clinicalDbContext.Entry(patClinicalInfo).Property(x => x.ModifiedOn).IsModified = true;
                        _clinicalDbContext.SaveChanges();
                    }
                    else if (inf == 0)
                    {
                        PatientClinicalInfoModel patInfo = pat[i];
                        patInfo.IsActive = true;
                        patInfo.CreatedBy = currentUser.EmployeeId;
                        patInfo.ModifiedBy = currentUser.EmployeeId;
                        patInfo.CreatedOn = DateTime.Now;
                        patInfo.ModifiedOn = DateTime.Now;

                        _clinicalDbContext.PatientClinicalInfos.Add(patInfo);
                        _clinicalDbContext.SaveChanges();
                    }
                }
                return pat;
            }
            return pat;
        }

        private object AddCheckInDetails(NursingOpdCheckIn_DTO nursingCheckIn_DTO, RbacUser currentUser)
        {
            using (var dbContextTransaction = _clinicalDbContext.Database.BeginTransaction())
            {
                try
                {
                    var existingVisitData = _clinicalDbContext.Visit.Where(x => x.PatientVisitId == nursingCheckIn_DTO.PatientVisitId).FirstOrDefault();
                    existingVisitData.PerformerName = nursingCheckIn_DTO.PerformerName;
                    existingVisitData.PerformerId = nursingCheckIn_DTO.PerformerId;
                    existingVisitData.ModifiedBy = currentUser.EmployeeId;
                    existingVisitData.ModifiedOn = DateTime.Now;
                    existingVisitData.VisitStatus = ENUM_VisitStatus.checkedin;
                    _clinicalDbContext.Entry(existingVisitData).State = EntityState.Modified;
                    _clinicalDbContext.SaveChanges();

                    foreach (var items in nursingCheckIn_DTO.DiagnosisList)
                    {
                        var finalDiagnosis = new FinalDiagnosisModel();
                        finalDiagnosis.PatientId = items.PatientId;
                        finalDiagnosis.PatientVisitId = items.PatientVisitId;
                        finalDiagnosis.ICD10ID = items.ICD10ID;
                        finalDiagnosis.CreatedBy = currentUser.EmployeeId;
                        finalDiagnosis.CreatedOn = DateTime.Now;
                        finalDiagnosis.IsActive = true;
                        _clinicalDbContext.FinalDiagnosis.Add(finalDiagnosis);
                    }
                    _clinicalDbContext.SaveChanges();

                    foreach (var items in nursingCheckIn_DTO.ChiefComplaints)
                    {
                        var patientClinicalInfo = new PatientClinicalInfoModel();
                        patientClinicalInfo.PatientId = items.PatientId;
                        patientClinicalInfo.PatientVisitId = items.PatientVisitId;
                        patientClinicalInfo.CreatedBy = currentUser.EmployeeId;
                        patientClinicalInfo.CreatedOn = DateTime.Now;
                        patientClinicalInfo.IsActive = true;
                        patientClinicalInfo.KeyName = items.KeyName;
                        patientClinicalInfo.Value = items.Value;
                        _clinicalDbContext.PatientClinicalInfos.Add(patientClinicalInfo);
                    }
                    _clinicalDbContext.SaveChanges();
                    dbContextTransaction.Commit();

                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
            return "Successfully checked in";
        }

        private object AddCheckOutDetails(NursingOpdCheckOut_DTO nursingOpdCheckOut_DTO, RbacUser currentUser)
        {
            using (var dbContextTransaction = _clinicalDbContext.Database.BeginTransaction())
            {
                try
                {
                    var patientDetails = (from pat in _clinicalDbContext.Patients
                                          where pat.PatientId == nursingOpdCheckOut_DTO.PatientId
                                          join patVis in _clinicalDbContext.Visit on pat.PatientId equals patVis.PatientId
                                          select new
                                          {
                                              FirstName = pat.FirstName,
                                              LastName = pat.LastName,
                                              Age = pat.Age,
                                              MiddleName = pat.MiddleName,
                                              Gender = pat.Gender,
                                              PhoneNumber = pat.PhoneNumber,
                                              Reason = patVis.Remarks,

                                          }
                        ).FirstOrDefault();


                    var nursingCheckout = new AppointmentModel();
                    nursingCheckout.PatientId = nursingOpdCheckOut_DTO.PatientId;
                    nursingCheckout.FirstName = patientDetails.FirstName;
                    nursingCheckout.LastName = patientDetails.LastName;
                    nursingCheckout.Gender = patientDetails.Gender;
                    nursingCheckout.ContactNumber = patientDetails.PhoneNumber;
                    nursingCheckout.PerformerName = nursingOpdCheckOut_DTO.PerformerName;
                    nursingCheckout.AppointmentType = ENUM_AppointmentType.followup;
                    nursingCheckout.AppointmentDate = DateTime.Now.AddDays(nursingOpdCheckOut_DTO.FollowUpDay);
                    nursingCheckout.AppointmentTime = nursingCheckout.AppointmentDate.TimeOfDay;
                    nursingCheckout.PerformerId = nursingOpdCheckOut_DTO.PerformerId;
                    nursingCheckout.AppointmentStatus = ENUM_VisitStatus.initiated;
                    nursingCheckout.CreatedOn = DateTime.Now;
                    nursingCheckout.CreatedBy = currentUser.EmployeeId;
                    nursingCheckout.CancelledBy = currentUser.EmployeeId;
                    nursingCheckout.CancelledOn = DateTime.Now;
                    nursingCheckout.DepartmentId = nursingOpdCheckOut_DTO.DepartmentId;
                    nursingCheckout.MiddleName = patientDetails.MiddleName;
                    nursingCheckout.Age = patientDetails.Age;

                    _clinicalDbContext.Appointment.Add(nursingCheckout);
                    _clinicalDbContext.SaveChanges();


                    VisitModel visitToUpdate = _clinicalDbContext.Visit.Where(d => d.PatientId == nursingOpdCheckOut_DTO.PatientId && d.PatientVisitId == nursingOpdCheckOut_DTO.PatientVisitId).FirstOrDefault();
                    visitToUpdate.Remarks = nursingOpdCheckOut_DTO.ConcludedNote;
                    visitToUpdate.ConcludeDate = DateTime.Now;
                    visitToUpdate.VisitStatus = ENUM_VisitStatus.concluded;
                    visitToUpdate.ModifiedBy = currentUser.EmployeeId;
                    visitToUpdate.ModifiedOn = DateTime.Now;
                    visitToUpdate.IsActive = true;

                    _clinicalDbContext.Entry(visitToUpdate).Property(x => x.Remarks).IsModified = true;
                    _clinicalDbContext.Entry(visitToUpdate).Property(x => x.ConcludeDate).IsModified = true;
                    _clinicalDbContext.Entry(visitToUpdate).Property(x => x.ModifiedBy).IsModified = true;
                    _clinicalDbContext.Entry(visitToUpdate).Property(x => x.ModifiedOn).IsModified = true;
                    _clinicalDbContext.Entry(visitToUpdate).Property(x => x.IsActive).IsModified = true;

                    _clinicalDbContext.SaveChanges();


                    foreach (var items in nursingOpdCheckOut_DTO.DiagnosisList)
                    {
                        var finalDiagnosis = new FinalDiagnosisModel();
                        finalDiagnosis.PatientId = items.PatientId;
                        finalDiagnosis.PatientVisitId = items.PatientVisitId;
                        finalDiagnosis.ICD10ID = items.ICD10ID;
                        finalDiagnosis.CreatedBy = currentUser.EmployeeId;
                        finalDiagnosis.CreatedOn = DateTime.Now;
                        finalDiagnosis.IsActive = true;
                        _clinicalDbContext.FinalDiagnosis.Add(finalDiagnosis);
                    }
                    _clinicalDbContext.SaveChanges();
                    dbContextTransaction.Commit();
                    return visitToUpdate;

                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }
    }
}

