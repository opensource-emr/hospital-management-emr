using DanpheEMR.Security;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using DanpheEMR.CommonTypes;
using Microsoft.AspNetCore.Http.Features;
using System.IO;
using Newtonsoft.Json.Linq;

namespace DanpheEMR.Controllers
{

    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
    public class RequestFormSizeLimitAttribute : Attribute, IAuthorizationFilter, IOrderedFilter
    {
        private readonly FormOptions _formOptions;

        public RequestFormSizeLimitAttribute(int valueCountLimit)
        {
            _formOptions = new FormOptions()
            {
                ValueLengthLimit = valueCountLimit,
                KeyLengthLimit = valueCountLimit,
                ValueCountLimit = valueCountLimit
            };
        }

        public int Order { get; set; }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var features = context.HttpContext.Features;
            var formFeature = features.Get<IFormFeature>();

            if (formFeature == null || formFeature.Form == null)
            {
                // Request form has not been read yet, so set the limits
                features.Set<IFormFeature>(new FormFeature(context.HttpContext.Request, _formOptions));
            }
        }
    }


    /// <summary>
    /// Created By- Nagesh BB on 08-Aug-2017
    /// This class for Danphe View Filter
    /// Now we check user has permission or not for perticular Action using ActionFilterAttribute
    /// </summary>
    public class DanpheViewFilter : ActionFilterAttribute
    {
        private string PermissionName { get; set; }
        //Parameterized constructor
        public DanpheViewFilter(string permissionName)
        {
            PermissionName = permissionName;
        }
        #region This called before the action method is invoked. We are checking here user has access or not for that action method
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            try
            {
                base.OnActionExecuting(context);
                //Checking user is logged in or not
                RbacUser currentUser = context.HttpContext.Session.Get<RbacUser>("currentuser");
                if (currentUser != null)
                {
                    //Get all valid permissions for logged in user from session variable 
                    List<RbacPermission> validPermissionList = context.HttpContext.Session.Get<List<RbacPermission>>("validpermissionlist");
                    if (validPermissionList.Count > 0)
                    {
                        RbacPermission currentPermission = validPermissionList.Find(a => a.PermissionName == PermissionName);
                        //Check is currentPermission has value or not
                        if (currentPermission == null || currentPermission.PermissionName == null)
                        {
                            //Redirect to PageNot found page
                            context.Result = new RedirectToRouteResult(new RouteValueDictionary { { "controller", "Account" }, { "action", "PageNotFound" } });
                        }
                    }
                    else
                    {
                        //Redirect to page not found page
                        context.Result = new RedirectToRouteResult(new RouteValueDictionary { { "controller", "Account" }, { "action", "PageNotFound" } });
                    }
                }
            }
            catch (Exception ex)
            {
                //Write exception handling logic here
                throw ex;
            }


        }
        #endregion
    }


    /// <summary>
    /// Api call verificaiton done by this class using actionfilter
    /// Created By- Nagesh BB on 08-Aug-2017
    /// This class for Danphe Data filter
    /// We are checking here user has permission or not to acces data from server 
    /// Now we are checking on GET, PUT,POST level access later on we will check it with perticular method 
    /// </summary>
    public class DanpheDataFilter : ActionFilterAttribute
    {
        private string apiPermissionName { get; set; }
        //Parameterized constructor with Permission Name parameter
        public DanpheDataFilter(string permissionName)
        {
            apiPermissionName = permissionName;
        }
        //Empty constructory or Default Constructor for api filter
        public DanpheDataFilter()
        {
        }

        #region This called before the action method is invoked. We are checking here user has access or not for that action method
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            base.OnActionExecuting(context);
            try
            {
                var req = context.HttpContext.Request;
                try
                {
                    //this check only for dicom file posting
                    //this condition is used for checking datas of listener.exe
                    if (req.Method.ToUpper() == "POST" && req.Path.Value.ToString() == "/api/Dicom")
                    {
                        string bodyData = ReadBodyAsString(context.HttpContext.Request);
                        var obj = JObject.Parse(bodyData);
                        RbacUser currUser = DanpheJSONConvert.DeserializeObject<RbacUser>(obj["currentuser"].ToString());
                        var flag = RBAC.IsValidUser(currUser.UserName, currUser.Password);
                        if (flag == false)
                        {
                            context.Result = new JsonResult(new DanpheHTTPResponse<object> { Status = "Failed", ErrorMessage = "Unauthorized Access", Results = "" });
                        }
                    }
                    else
                    {
                        //Checking user is logged in or not
                        RbacUser currentUser = context.HttpContext.Session.Get<RbacUser>("currentuser");
                        if (currentUser == null)
                        {
                            //Return unauthorized response to browser
                            context.Result = new JsonResult(new DanpheHTTPResponse<object> { Status = "Failed", ErrorMessage = "Unauthorized Access", Results = "" });
                        }
                    }

                }
                catch (Exception ex)
                {
                    //Return unauthorized response to browser
                    context.Result = new JsonResult(new DanpheHTTPResponse<object> { Status = "Failed", ErrorMessage = "Unauthorized Access", Results = "" });
                }

                ////Nagesh- 29 Aug 2017- Commented because we are not checking permission level for api call, only checking is Authenticated user or not
                //else
                // {
                ////Get all valid permissions for logged in user from session variable 
                //List<RbacPermission> validPermissionList = context.HttpContext.Session.Get<List<RbacPermission>>("validpermissionlist");
                //if (validPermissionList.Count > 0)
                //{
                //    RbacPermission currentPermission = validPermissionList.Find(a => a.PermissionName == apiPermissionName);
                //    //Check is currentPermission has value or not
                //    //if (currentPermission == null || currentPermission.PermissionName == null)
                //    if ("sssss" != apiPermissionName)
                //    {
                //        //Return unauthorized response to browser
                //        context.Result = new JsonResult(new DanpheHTTPResponse<object>{ Status = "Failed", ErrorMessage = "Unauthorized Access", Results = ""  });
                //    }
                //}
                //else
                //{
                //    //Return unauthorized response to browser
                //    context.Result = new JsonResult(new { HttpStatusCode.Unauthorized });
                //}
                // }
            }
            catch (Exception ex)
            {
                //Write exception handling logic here
                throw ex;
            }
        }
        #endregion
        private string ReadBodyAsString(HttpRequest Request)
        {
            var initialBody = Request.Body; // Workaround
            var strResult = string.Empty;
            try
            {
                // Stream req = Request.Body;
                initialBody.Seek(0, System.IO.SeekOrigin.Begin);
                strResult = new StreamReader(initialBody).ReadToEnd();
            }
            catch (Exception ex)
            {
                strResult = null;
            }
            return strResult;
        }
    }

}
