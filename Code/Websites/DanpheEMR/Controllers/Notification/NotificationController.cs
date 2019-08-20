using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using System.Data.Entity;
using Microsoft.Extensions.Options;
using DanpheEMR.Utilities;
using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Caching;
using System.Xml;
using Newtonsoft.Json;
using DanpheEMR.Security;
using DanpheEMR.ServerModel.NotificationModels;

namespace DanpheEMR.Controllers
{

    public class NotificationController : CommonController
    {

        double cacheExpMinutes;//= 5;//this should come from configuration later on.

        public NotificationController(IOptions<MyConfiguration> _config) : base(_config)
        {
            cacheExpMinutes = _config.Value.CacheExpirationMinutes;
        }



        [HttpGet]
        public string Get(string reqType, int notificationId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();


            NotiFicationDbContext notificationDbContext = new NotiFicationDbContext(connString);
            //require current login User we are getting from Session
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

            int EmployeeId = currentUser.EmployeeId;
            try
            {
                if (reqType == "GetData-For-NotificationDropDown")
                {
                    var lastOneWeekDate = DateTime.Now.Date.AddDays(-7);
                    //get all NOT-ARCHIVED notifications upto last week into a local variable--LINQ JOIN doesn't work with DBSet and InMemory list at once.
                    var activeNotifications = notificationDbContext.Notifications
                        .Where(n => n.RecipientId != null && n.IsArchived == false && n.CreatedOn >= lastOneWeekDate).ToList();

                    List<NotificationViewModel> userNotifications = (from notf in activeNotifications
                                                                     where notf.RecipientType == "user" &&
                                                                     notf.RecipientId == EmployeeId ///display notification against current logged in User
                                                                     orderby notf.NotificationId descending ///orderby is required because we have to show the latest notification on TOP position
                                                                     select notf).ToList();



                    List<RbacRole> currUsrsRoles = HttpContext.Session.Get<List<RbacRole>>("user-roles");
                    List<NotificationViewModel> userRoleNotifcns = (from notf in activeNotifications
                                                                    join role in currUsrsRoles
                                                                     on notf.RecipientId equals role.RoleId
                                                                    where notf.RecipientType == "rbac-role"
                                                                    select notf
                                                                   ).ToList();

                    List<NotificationViewModel> mergedList = userNotifications.Concat(userRoleNotifcns).OrderByDescending(n => n.CreatedOn).Distinct().ToList();

                    //if (userNotifications != null)
                    //{
                    //}
                    //else
                    //{
                    //    mergedList= 
                    //}


                    responseData.Results = mergedList;
                    responseData.Status = "OK";
                }

                else if (reqType == "visit-notificaiton-detail")
                {
                    var visitDetail = (from notification in notificationDbContext.Notifications
                                       join visit in notificationDbContext.PatientVisits on notification.NotificationParentId equals visit.PatientVisitId
                                       where notification.NotificationId == notificationId
                                       select new
                                       {
                                           PatientId = visit.PatientId,
                                           PatientVisitId = visit.PatientVisitId,
                                           ProviderId = visit.ProviderId
                                       }).FirstOrDefault();
                    responseData.Results = visitDetail;
                    responseData.Status = "OK";
                }
                else
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = "Invalid Request Type";
                }

            }
            catch (Exception ex)
            {

                responseData.Results = null;
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }

            return DanpheJSONConvert.SerializeObject(responseData, true);

        }

        [HttpPost]// POST api/values
        public string Post()
        {
            return null;
        }
        [HttpPut]
        public string Put()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

            try
            {

                string str = this.ReadPostData();
                string reqType = this.ReadQueryStringData("reqType");

                NotiFicationDbContext notificationDbContext = new NotiFicationDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                int EmployeeId = currentUser.EmployeeId;
                if (reqType == "mark-as-read")
                {
                    List<NotificationViewModel> messageList = DanpheJSONConvert.DeserializeObject<List<NotificationViewModel>>(str);
                    if (messageList != null && messageList.Count > 0)
                    {
                        foreach (NotificationViewModel msg in messageList)
                        {
                            msg.IsRead = true; ///update IsRead property 
                            msg.ReadBy = EmployeeId; ///update Readby property by current loggedIn User
                            notificationDbContext.Notifications.Attach(msg);

                            notificationDbContext.Entry(msg).Property(x => x.IsRead).IsModified = true;
                            notificationDbContext.Entry(msg).Property(x => x.ReadBy).IsModified = true;
                        }
                    }

                    notificationDbContext.SaveChanges();

                    responseData.Results = messageList;
                    responseData.Status = "OK";

                }
                else if (reqType == "archive")
                {
                    List<NotificationViewModel> messageList = DanpheJSONConvert.DeserializeObject<List<NotificationViewModel>>(str);
                    if (messageList != null && messageList.Count > 0)
                    {
                        foreach (NotificationViewModel msg in messageList)
                        {
                            msg.IsArchived = true; ///update IsArchived property 
                            notificationDbContext.Notifications.Attach(msg);
                            notificationDbContext.Entry(msg).Property(x => x.IsArchived).IsModified = true;
                        }
                    }

                    notificationDbContext.SaveChanges();
                    responseData.Results = messageList;
                    responseData.Status = "OK";

                }
                else
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = "Invalid Request Type";
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
