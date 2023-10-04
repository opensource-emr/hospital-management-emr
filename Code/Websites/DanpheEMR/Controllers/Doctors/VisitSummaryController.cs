using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using EntityState = System.Data.Entity.EntityState;

namespace DanpheEMR.Controllers.Doctors
{
    public class VisitSummaryController : CommonController
    {
        private readonly DoctorsDbContext _doctorsDbContext;
        public VisitSummaryController(IOptions<MyConfiguration> _config) : base(_config)
        {
            _doctorsDbContext = new DoctorsDbContext(connString);
        }

        [HttpGet]
        [Route("VisitDetails")]
        public IActionResult VisitDetails(int visitId)
        {
            //if (reqType == "getPatientData")        
            Func<object> func = () => (from data in _doctorsDbContext.VisitSummary
                                       where data.VisitId == visitId
                                       select data).ToList();
            return InvokeHttpGetFunction(func);

        }

        [HttpPost]
        [Route("VisitDetails")]
        public IActionResult PostVisitDetils()
        {
            string ipStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            //    else if (reqType == "addPatientData")
            Func<object> func = () => PostVisitDetils(ipStr, currentUser);
            return InvokeHttpPostFunction(func);

        }

        [HttpPut]
        [Route("VisitDetails")]
        public IActionResult UpdateVisitDetails()
        {
            //  else if (reqType == "updatePatientData")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string ipStr = this.ReadPostData();
            Func<object> func = () => PutVisitDetails(ipStr, currentUser);
            return InvokeHttpPutFunction(func);

        }

        private object PutVisitDetails(string ipStr, RbacUser currentUser)
        {
                List<VisitSummaryModel> patDataList = DanpheJSONConvert.DeserializeObject<List<VisitSummaryModel>>(ipStr);

                patDataList.ForEach(data =>
                {
                    data.ModifiedOn = DateTime.Now;
                    data.ModifiedBy = currentUser.CreatedBy;
                    _doctorsDbContext.Entry(data).State = EntityState.Modified;
                    _doctorsDbContext.Entry(data).Property(u => u.CreatedBy).IsModified = false;
                    _doctorsDbContext.Entry(data).Property(u => u.CreatedOn).IsModified = false;
                });

                _doctorsDbContext.SaveChanges();
                return patDataList;

            
        }
        private object PostVisitDetils(string ipStr,RbacUser currentUser)
        {
                List<VisitSummaryModel> patDataList = DanpheJSONConvert.
                      DeserializeObject<List<VisitSummaryModel>>(ipStr);
            if (patDataList != null)
            {
                patDataList.ForEach(patData =>
                {
                    patData.CreatedOn = DateTime.Now;
                    patData.CreatedBy = currentUser.CreatedBy;
                    _doctorsDbContext.VisitSummary.Add(patData);
                });

                _doctorsDbContext.SaveChanges();
                return patDataList;
            }
            else
            {
                throw new Exception("Invalid Patient object.");
            }
            
        }

        // GET: api/Patient
        //[HttpGet]
        //public string Get(string reqType, int visitId)
        //{
        //    DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        //    try
        //    {
        //        DoctorsDbContext dbContext = new DoctorsDbContext(connString);
        //        if (reqType == "getPatientData")
        //        {
        //            var patientDataList = (from data in dbContext.VisitSummary
        //                                   where data.VisitId == visitId
        //                                   select data).ToList();
        //            responseData.Results = patientDataList;
        //        }

        //        responseData.Status = "OK";
        //    }
        //    catch (Exception ex)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
        //    }
        //    return DanpheJSONConvert.SerializeObject(responseData, true);
        //}


        // POST api/values
        //[HttpPost]
        //public string Post()
        //{
        //    DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        //    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
        //    try
        //    {
        //        string reqType = this.ReadQueryStringData("reqType");
        //        string ipStr = this.ReadPostData();

        //        DoctorsDbContext dbContext = new DoctorsDbContext(connString);
        //        if (reqType == "addPatientData")
        //        {
        //            List<VisitSummaryModel> patDataList = DanpheJSONConvert.
        //                  DeserializeObject<List<VisitSummaryModel>>(ipStr);
        //            if (patDataList != null)
        //            {
        //                patDataList.ForEach(patData =>
        //                {
        //                    patData.CreatedOn = DateTime.Now;
        //                    patData.CreatedBy = currentUser.CreatedBy;
        //                    dbContext.VisitSummary.Add(patData);
        //                });

        //                dbContext.SaveChanges();
        //                responseData.Results = patDataList;
        //            }
        //            else
        //                throw new Exception("Invalid Patient object.");
        //        }

        //        responseData.Status = "OK";
        //    }
        //    catch (Exception ex)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
        //    }
        //    return DanpheJSONConvert.SerializeObject(responseData, true);
        //}

        // PUT api/values/5
        //[HttpPut]
        //public string Put()
        //{
        //    DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        //    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
        //    try
        //    {
        //        string reqType = this.ReadQueryStringData("reqType");
        //        string ipStr = this.ReadPostData();

        //        DoctorsDbContext dbContext = new DoctorsDbContext(connString);
        //        if (reqType == "updatePatientData")
        //        {
        //            List<VisitSummaryModel> patDataList = DanpheJSONConvert.DeserializeObject<List<VisitSummaryModel>>(ipStr);

        //            patDataList.ForEach(data =>
        //            {
        //                data.ModifiedOn = DateTime.Now;
        //                data.ModifiedBy = currentUser.CreatedBy;
        //                dbContext.Entry(data).State = EntityState.Modified;
        //                dbContext.Entry(data).Property(u => u.CreatedBy).IsModified = false;
        //                dbContext.Entry(data).Property(u => u.CreatedOn).IsModified = false;
        //            });

        //            dbContext.SaveChanges();
        //            responseData.Results = patDataList;

        //        }
        //        responseData.Status = "OK";
        //    }
        //    catch (Exception ex)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
        //    }
        //    return DanpheJSONConvert.SerializeObject(responseData, true);
        //}


        //// DELETE api/values/5
        //[HttpDelete("{id}")]
        //public void Delete(int id)
        //{
        //}
    }
}