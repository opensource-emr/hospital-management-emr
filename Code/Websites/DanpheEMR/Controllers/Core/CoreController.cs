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
    public class CoreController : CommonController
    {

        private MyConfiguration _appSettings = null;

        public CoreController(IOptions<MyConfiguration> _config) : base(_config)
        {
            //connString = _config.Value.Connectionstring;
            _appSettings = _config.Value;
        }


        [HttpGet]
        public string Get(string reqType, string inputValue)
        {

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                if (reqType == "lookups")
                {
                    CoreDbContext dbcontext = new CoreDbContext(connString);

                    List<LookupsModel> allLookups = dbcontext.LookUps.ToList();
                    List<LookupsModel> retList = new List<LookupsModel>();
                    if (!string.IsNullOrEmpty(inputValue))
                    {
                        retList = allLookups.Where(a => a.ModuleName.ToLower() == inputValue.ToLower()).ToList();
                    }
                    else
                    {
                        retList = allLookups;
                    }
                    responseData.Results = retList;
                }
                else if (reqType == "appSettings-limited")
                {
                    //Return only limited properties to client.
                    //DO NOT return SECURE INFORMATION LIKE: CONNECTIONSTRINGS, FILELOCATIONS, etc..
                    MyConfiguration retValue = new MyConfiguration();
                    retValue.ApplicationVersionNum = this._appSettings.ApplicationVersionNum;
                    retValue.highlightAbnormalLabResult = this._appSettings.highlightAbnormalLabResult;
                    retValue.CacheExpirationMinutes = this._appSettings.CacheExpirationMinutes;
                    responseData.Results = retValue;
                }


                //if (reqType == "engToNepDate")
                //{
                //    NepaliDate ndate = new NepaliDate(connString);
                //    string retNepDate = ndate.NepaliLongDate(DateTime.Parse(value));
                //    responseData.Results = retNepDate;
                //}
                //else if (reqType == "nepToEngDate")
                //{
                //    NepaliDate ndate = new NepaliDate(connString);
                //    string retEngDate = ndate.NeptoEnglishDate(value).ToString("yyyy-MM-dd");
                //    responseData.Results = retEngDate;
                //}



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
            return null;
        }


        [HttpPut]
        public string Put()
        {
            return null;
        }
        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }

}
