using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.ServerModel;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Controllers
{
    [Route("api/[controller]/[action]")]
    public class StickersController : CommonController
    {
        DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        public StickersController(IOptions<MyConfiguration> _config) : base(_config)
        {


        }
        public string GetPatientStickerDetails(int PatientId)
        {
            DanpheHTTPResponse<List<PatientStickerModel>> responseData = new DanpheHTTPResponse<List<PatientStickerModel>>();
            try
            {
                PatientDbContext patDbContext = new PatientDbContext(connString);
                StickersBL stick = new StickersBL();
                var res = stick.GetPatientStickerDetails(patDbContext, PatientId);
                responseData.Status = "OK";
                responseData.Results = res;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
    }
}
