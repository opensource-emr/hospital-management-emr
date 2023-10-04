using DanpheEMR.CommonTypes;
using DanpheEMR.Controllers;
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
using System.IO;
using System.Linq;
using System.Threading.Tasks;

[RequestFormSizeLimit(valueCountLimit: 1000000, Order = 1)]
[DanpheDataFilter()]
[Route("api/[controller]")]
public class CommonController : Controller
{
    ///protected readonly string config = null;
    protected readonly string connString = null;
    protected readonly string connStringAdmin = null;
    protected readonly string connStringPACSServer = null;
    protected readonly bool IsAuditEnabled = false;
    public CommonController(IOptions<MyConfiguration> _config)
    {
        //config = _config.Value.Connectionstring;
        connString = _config.Value.Connectionstring;
        connStringAdmin = _config.Value.ConnectionStringAdmin;
        connStringPACSServer = _config.Value.ConnectionStringPACSServer;
        IsAuditEnabled = _config.Value.IsAuditEnable;
    }
    internal string ReadQueryStringData(string keyname)
    {
        return Request.Query[keyname];
    }
    internal string ReadPostData()
    {
        Stream req = Request.Body;
        req.Seek(0, System.IO.SeekOrigin.Begin);
        string str = new StreamReader(req).ReadToEnd();
        return str;
    }
    internal IFormFileCollection ReadFiles()
    {
        IFormFileCollection req = Request.Form.Files;
        return req;
    }
    internal static int ToInt(string value)
    {
        return Convert.ToInt32(value);
    }
    internal static bool ToBool(string value)
    {
        return value == "1" ? true : false;
    }
    internal static Int64 ToInt64(string value)
    {
        return Convert.ToInt64(value);
    }
    internal dynamic AddAuditField(dynamic dbContext)
    {
        if (this.IsAuditEnabled)
        {
            RbacUser user = HttpContext.Session.Get<RbacUser>("currentuser");
            dbContext.AddAuditCustomField("ChangedByUserId", user.EmployeeId);
            dbContext.AddAuditCustomField("ChangedByUserName", user.UserName);
        }
        return dbContext;
    }

    protected string CreateEmpi(PatientModel obj)
    {
        /* EMPI: 16Characters
          1 -3: district  4-9 : DOB(DDMMYY)  10-12: Name Initials(FML) - X if no middle name 13-16 : Random Number
          for eg: Name=Khadka Prasad Oli, District=Kailali, DOB=01-Dec-1990, EMPI= KAI011290KPO8972int districtId = obj.District;*/
        MasterDbContext mstDB = new MasterDbContext(connString);


        string CountrySubDivisionName = (from d in mstDB.CountrySubDivision
                                         where d.CountrySubDivisionId == obj.CountrySubDivisionId
                                         select d.CountrySubDivisionName).First();

        string strCountrySubDivision = CountrySubDivisionName.Substring(0, 3);
        string strFirstName = obj.FirstName.Substring(0, 1);

        //Use 'X' if middlename is not there.
        string strMiddleName = string.IsNullOrEmpty(obj.MiddleName) ? "X" : obj.MiddleName.Substring(0, 1);
        string strLastName = obj.LastName.Substring(0, 1);
        string strdateofbrith = obj.DateOfBirth.Value.ToString("ddMMyy");
        int randomnos = (new Random()).Next(1000, 10000);
        var empi = strCountrySubDivision +
                   strdateofbrith +
                   strFirstName +
                   strMiddleName +
                   strLastName +
                   randomnos;
        obj.EMPI = empi.ToUpper();
        return obj.EMPI;
    }

    protected ActionResult InvokeHttpGetFunction<T>(Func<T> functionName, string customErrorMsg = null)
    {
        DanpheHTTPResponse<T> responseData = new DanpheHTTPResponse<T>();
        try
        {
            T result = functionName.Invoke();
            responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.OK;
            responseData.Results = result;
        }
        catch (Exception ex)
        {
            responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.Failed;
            responseData.ErrorMessage = ex.Message;
        }
        return Ok(DanpheJSONConvert.DeserializeObject(DanpheJSONConvert.SerializeObject(responseData, true)));
    }

    protected async Task<ActionResult> InvokeHttpGetFunctionAsync<T>(Func<Task<T>> function, string customErrorMsg = null)
    {
        DanpheHTTPResponse<T> responseData = new DanpheHTTPResponse<T>();
        try
        {
            T result = await function();
            responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.OK;
            responseData.Results = result;
        }
        catch (Exception ex)
        {
            responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.Failed;
            responseData.ErrorMessage = ex.Message;
        }
        return Ok(responseData);

    }

    protected ActionResult InvokeHttpPostFunction<T>(Func<T> functionName)
    {
        DanpheHTTPResponse<T> responseData = new DanpheHTTPResponse<T>();
        try
        {
            T result = functionName.Invoke();
            responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.OK;
            responseData.Results = result;
        }
        catch (Exception ex)
        {
            responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.Failed;
            responseData.ErrorMessage = ex.Message;
        }
        //we needed to serialize the final output else it's giving error (eg: in Settlement>Post)
        return Ok(DanpheJSONConvert.SerializeObject(responseData, true));
    }

    protected async Task<ActionResult> InvokeHttpPostFunctionAsync<T>(Func<T> functionName, string customErrorMsg = null)
    {
        return await Task.Run(() =>
        {
            DanpheHTTPResponse<T> responseData = new DanpheHTTPResponse<T>();
            try
            {
                T result = functionName.Invoke();
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.OK;
                responseData.Results = result;
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.Failed;
                responseData.ErrorMessage = ex.Message;
            }
            //we needed to serialize the final output else it's giving error (eg: in Settlement>Post)
            return Ok(DanpheJSONConvert.SerializeObject(responseData, true));
        });

    }

    protected ActionResult InvokeHttpPostFunctionSingleTransactionScope<T>(Func<T> functionName, System.Data.Entity.DbContextTransaction transactionScope)
    {
        DanpheHTTPResponse<T> responseData = new DanpheHTTPResponse<T>();
        try
        {
            T result = functionName.Invoke();
            responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.OK;
            responseData.Results = result;
            transactionScope.Commit();
        }
        catch (Exception ex)
        {
            transactionScope.Rollback();
            responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.Failed;
            responseData.ErrorMessage = ex.Message;
        }
        //we needed to serialize the final output else it's giving error (eg: in Settlement>Post)
        return Ok(DanpheJSONConvert.SerializeObject(responseData, true));
    }
    protected ActionResult InvokeHttpPutFunction<T>(Func<T> functionName)
    {
        DanpheHTTPResponse<T> responseData = new DanpheHTTPResponse<T>();
        try
        {
            T result = functionName.Invoke();
            responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.OK;
            responseData.Results = result;
        }
        catch (Exception ex)
        {
            responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.Failed;
            responseData.ErrorMessage = ex.Message;
        }
        return Ok(DanpheJSONConvert.DeserializeObject(DanpheJSONConvert.SerializeObject(responseData, true)));
    }


    protected async Task<ActionResult> InvokeHttpPutFunctionAsync<T>(Func<T> functionName, string customErrorMsg = null)
    {
        return await Task.Run(() =>
        {
            DanpheHTTPResponse<T> responseData = new DanpheHTTPResponse<T>();
            try
            {
                T result = functionName.Invoke();
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.OK;
                responseData.Results = result;
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.Failed;
                responseData.ErrorMessage = ex.Message;
            }
            return Ok(responseData);
        });

    }

    protected ActionResult InvokeHttpPutFunctionSingleTransactionScope<T>(Func<T> functionName, System.Data.Entity.DbContextTransaction transactionScope)
    {
        DanpheHTTPResponse<T> responseData = new DanpheHTTPResponse<T>();
        try
        {
            T result = functionName.Invoke();
            responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.OK;
            responseData.Results = result;
            transactionScope.Commit();
        }
        catch (Exception ex)
        {
            transactionScope.Rollback();
            responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.Failed;
            responseData.ErrorMessage = ex.Message;
        }
        return Ok(responseData);
    }


}