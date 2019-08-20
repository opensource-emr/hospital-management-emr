
using DanpheEMR.Controllers;
using DanpheEMR.Core.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Http;
using System.IO;
using System;

[RequestFormSizeLimit(valueCountLimit: 1000000, Order = 1)]
[DanpheDataFilter()]
[Route("api/[controller]")]
public class CommonController : Controller
{
    ///protected readonly string config = null;
    protected readonly string connString = null;
    protected readonly string connStringAdmin = null;
    protected readonly string connStringPACSServer = null;
    public CommonController(IOptions<MyConfiguration> _config)
    {
        //config = _config.Value.Connectionstring;
        connString = _config.Value.Connectionstring;
        connStringAdmin = _config.Value.ConnectionStringAdmin;
        connStringPACSServer = _config.Value.ConnectionStringPACSServer;
    }
    public string ReadQueryStringData(string keyname)
    {
        return Request.Query[keyname];
    }
    public string ReadPostData()
    {
        Stream req = Request.Body;
        req.Seek(0, System.IO.SeekOrigin.Begin);
        string str = new StreamReader(req).ReadToEnd();
        return str;
    }
    public IFormFileCollection ReadFiles()
    {
        IFormFileCollection req = Request.Form.Files;
        return req;
    }
    public static int ToInt(string value) {
        return Convert.ToInt32(value);
    }
    public static bool ToBool(string value)
    {
        return value == "1" ? true : false;
    }
    public static Int64 ToInt64(string value)
    {
        return Convert.ToInt64(value);
    }
}