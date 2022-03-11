using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DanpheEMR.AccTransfer;
using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Caching;
using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.Utilities;
using Newtonsoft.Json.Linq;

namespace DanpheEMR.Controllers
{
    public class AccountingBL
    {
       

        #region Get Section list for accounting billing, pharmacy, inventory
        public static List<AccSectionModel> GetSections(AccountingDbContext accountingDBContext, int currHospitalId)
        {
            try
            {
                List<AccSectionModel> sectionList = new List<AccSectionModel>();
                var paraValue = accountingDBContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "SectionList").FirstOrDefault().ParameterValue;
                if (paraValue != "")
                {
                    JObject jObject = JObject.Parse(paraValue);
                    var secList = jObject.SelectToken("SectionList").ToList();
                    sectionList = (secList != null) ? DanpheJSONConvert.DeserializeObject<List<AccSectionModel>>(DanpheJSONConvert.SerializeObject(secList)) : sectionList; ;
                }
                return sectionList;
            }
            catch (Exception ex) { throw ex; }
        }
        #endregion
       
        public static DanpheHTTPResponse<object> CheckResponseObject(List<object> data,string type)
        {
            try
            {
                DanpheHTTPResponse<object> resobj = new DanpheHTTPResponse<object>();
                if (data != null && data.Count > 0)
                {
                        resobj.Status = "OK";
                        resobj.Results = data;                   
                }
                else
                {
                    resobj.Status = "Failed";
                    resobj.Results = null;
                    resobj.ErrorMessage = type + " data not found, Please click on refresh data button";
                }
                return resobj;
            }
            catch (Exception)
            {

                throw;
            }
        }
    }
}
