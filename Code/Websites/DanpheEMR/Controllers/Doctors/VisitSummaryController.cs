using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace DanpheEMR.Controllers.Doctors
{
    public class VisitSummaryController : CommonController
    {

        public VisitSummaryController(IOptions<MyConfiguration> _config) : base(_config)
        {

        }

        // GET: api/Patient
        [HttpGet]
        public string Get(string reqType, int visitId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                DoctorsDbContext dbContext = new DoctorsDbContext(connString);
                if (reqType == "getPatientData")
                {
                    var patientDataList = (from data in dbContext.VisitSummary
                                           where data.VisitId == visitId
                                           select data).ToList();
                    responseData.Results = patientDataList;
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


        // POST api/values
        [HttpPost]
        public string Post()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                string reqType = this.ReadQueryStringData("reqType");
                string ipStr = this.ReadPostData();

                DoctorsDbContext dbContext = new DoctorsDbContext(connString);
                if (reqType == "addPatientData")
                {
                    List<VisitSummaryModel> patDataList = DanpheJSONConvert.
                          DeserializeObject<List<VisitSummaryModel>>(ipStr);
                    if (patDataList != null)
                    {
                        patDataList.ForEach(patData =>
                        {
                            patData.CreatedOn = DateTime.Now;
                            patData.CreatedBy = currentUser.CreatedBy;
                            dbContext.VisitSummary.Add(patData);
                        });

                        dbContext.SaveChanges();
                        responseData.Results = patDataList;
                    }
                    else
                        throw new Exception("Invalid Patient object.");
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

        // PUT api/values/5
        [HttpPut]
        public string Put()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                string reqType = this.ReadQueryStringData("reqType");
                string ipStr = this.ReadPostData();

                DoctorsDbContext dbContext = new DoctorsDbContext(connString);
                if (reqType == "updatePatientData")
                {
                    List<VisitSummaryModel> patDataList = DanpheJSONConvert.DeserializeObject<List<VisitSummaryModel>>(ipStr);

                    patDataList.ForEach(data =>
                    {
                        data.ModifiedOn = DateTime.Now;
                        data.ModifiedBy = currentUser.CreatedBy;
                        dbContext.Entry(data).State = EntityState.Modified;
                        dbContext.Entry(data).Property(u => u.CreatedBy).IsModified = false;
                        dbContext.Entry(data).Property(u => u.CreatedOn).IsModified = false;
                    });

                    dbContext.SaveChanges();
                    responseData.Results = patDataList;

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


        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}