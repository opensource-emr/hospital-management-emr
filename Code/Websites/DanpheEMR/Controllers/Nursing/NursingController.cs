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
        public string Get(string reqType)
        {
            return  "value1";
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
                                }).OrderByDescending(patient => patient.PatientId).ToList() ;
                responseData.Results = nephPats;
                responseData.Status = "OK";
            }
            catch(Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        // POST api/values
        [HttpPost]
        public string Post(string reqType)
        {
            return "value";
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public string Put(string reqType)
        {
            return "value";
        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
