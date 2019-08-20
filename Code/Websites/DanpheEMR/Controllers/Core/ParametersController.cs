using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.Core.Configuration;
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
using DanpheEMR.Core;
using DanpheEMR.Core.Parameters;
using RefactorThis.GraphDiff;//for entity-update.

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860
//this is the cotroller
namespace DanpheEMR.Controllers
{

    [RequestFormSizeLimit(valueCountLimit: 100000, Order = 1)]
    [Route("api/[controller]")]
    public class ParametersController : CommonController
    {
        // GET: api/values
        public ParametersController(IOptions<MyConfiguration> _config) : base(_config)
        {

        }


        [HttpGet]
        public string Get(string paramGroup, string paramName)
        {
            DanpheHTTPResponse<List<ParameterModel>> responseData = new DanpheHTTPResponse<List<ParameterModel>>();
            try
            {
                if (!string.IsNullOrEmpty(paramGroup) && !string.IsNullOrEmpty(paramName))
                {

                }
                else
                {
                    CoreDbContext coreDbContext = new CoreDbContext(connString);
                    responseData.Results = coreDbContext.Parameters.ToList();
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
        [HttpPost]
        public string Post()
        {
            DanpheHTTPResponse<ParameterModel> responseData = new DanpheHTTPResponse<ParameterModel>();
            try
            {


            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }

            return DanpheJSONConvert.SerializeObject(responseData, true);
        }


        [HttpPut]
        public string Put()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            CoreDbContext coreDbContext = new CoreDbContext(base.connString);
            try
            {
                string reqType = this.ReadQueryStringData("reqType");
                string str = this.ReadPostData();
                if (reqType == "bill-tax")
                {
                    ParameterModel parameter = coreDbContext.Parameters.Where(par => par.ParameterGroupName == "BILL" && par.ParameterName== "TaxInfo").FirstOrDefault();
                    parameter.ParameterValue = str;
                    coreDbContext.Entry(parameter).Property(a => a.ParameterValue).IsModified = true;
                    coreDbContext.SaveChanges();
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
