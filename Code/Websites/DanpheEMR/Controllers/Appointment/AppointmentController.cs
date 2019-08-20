/*
 File: AppointmentController.cs
 created:-
 description: this class contains WebApi Services for AppointmentModule
 -------------------------------------------------------------------
 change history:
 -------------------------------------------------------------------
 S.No     UpdatedBy/Date             description           remarks
 -------------------------------------------------------------------
 1.       ashim/1Mar'17           modified        -- scope of combining clashing appointments and doctorschedule
                                                     
 -------------------------------------------------------------------
 */

using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using System.Data.Entity;
using Microsoft.Extensions.Options;
using DanpheEMR.Utilities;
using System.Globalization; //used for converting string to Titlecase i.e first letter capital
using DanpheEMR.CommonTypes;
using DanpheEMR.ServerModel.Helpers;//for appointmenthelpers
using DanpheEMR.Core.Configuration;
using DanpheEMR.Security;
using DanpheEMR.Core;
using DanpheEMR.Core.Parameters;
using Newtonsoft.Json.Linq;
using DanpheEMR.Controllers.Billing;
// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers
{

    public class AppointmentController : CommonController
    {
        public string InvoiceCode = "BL";//get this from parameters when possible.
        public AppointmentController(IOptions<MyConfiguration> _config) : base(_config)
        {

        }
        [HttpGet]
        public string Get(string department,
            string reqType,
            int providerId,
            int patientId,
            DateTime requestDate,
            string status,
            int membershipTypeId)
        {
            AppointmentDbContext dbContextAppointment = new AppointmentDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

            //RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            //if (currentUser == null || !RBAC.UserHasPermission(currentUser.UserId, "APT", "appointment-read"))
            //{
            //    HttpResponseMessage message = new HttpResponseMessage(System.Net.HttpStatusCode.NotFound);
            //    responseData.Status = "Failed";
            //    responseData.ErrorMessage = "Unauthorized access.";
            //    return DanpheJSONConvert.SerializeObject(responseData);
            //}

            #region get request example
            //for reference
            //if (!string.IsNullOrEmpty(fName) || !string.IsNullOrEmpty(doctor) || appointmentId != 0)
            //{
            //    //If nothing is passed during search->Condition in LHS is TRUE and neglects the condition in the RHS
            //    //If some value is passed during search -> LHS will be false and checks if RHS is TRUE
            //    //If both the LHS and RHS in any one of the 3 conditions is false then query returns nothing.
            //    result = (from app in dbContextSearch.Appointments
            //              where (appointmentId == 0 || appointmentId == app.AppointmentId)
            //             && (string.IsNullOrEmpty(fName) || app.FirstName.ToLower().Contains(fName.ToLower()))
            //             && (string.IsNullOrEmpty(doctor) || app.ProviderName.ToLower().Contains(doctor.ToLower()))
            //              select app).ToList();
            //    return JsonConvert.SerializeObject(result);
            //}
            #endregion
            try
            {

                //gets the doctorschedule from appointment table
                if (reqType == "doctorschedule")
                {
                    //.ToList()is done two times,since we can't use requestDate.Date inside IQueryable
                    List<AppointmentModel> apptList = (from d in dbContextAppointment.Appointments
                                                       where d.ProviderId == providerId
                                                       select d).ToList().Where(a => a.AppointmentDate.Date == requestDate.Date).ToList();
                    AppointmentDay apptDay = AppointmentDay.FormatData(apptList);
                    responseData.Status = "OK";
                    responseData.Results = apptDay;
                }
                //loads appointments with requested status
                else if (reqType == "getAppointments")
                {
                    var date = DateTime.Today;
                    List<AppointmentModel> appointmentList = (from app in dbContextAppointment.Appointments
                                                              select app
                                                              ).OrderByDescending(x => x.AppointmentId).ToList();
                    responseData.Status = "OK";
                    responseData.Results = appointmentList;
                }
                //get the patient's today's or future's appointments
                else if (reqType == "checkForClashingAppointment")
                {
                    List<AppointmentModel> patAppointmentList = (from app in dbContextAppointment.Appointments
                                                                 where app.PatientId == patientId
                                                                 && app.AppointmentDate >= DbFunctions.TruncateTime(requestDate.Date)
                                                                 && app.ProviderId == providerId
                                                                 select app).ToList();

                    VisitDbContext dbContext = new VisitDbContext(base.connString);

                    List<VisitModel> patientvisitList = (from visit in dbContext.Visits
                                                         where visit.PatientId == patientId
                                                         && DbFunctions.TruncateTime(visit.VisitDate) == DbFunctions.TruncateTime(requestDate.Date)
                                                         && visit.ProviderId == providerId
                                                         select visit).ToList();

                    if ((patAppointmentList != null && patAppointmentList.Count != 0) || (patientvisitList != null && patientvisitList.Count != 0))
                    {
                        responseData.Status = "OK";
                        responseData.Results = true;
                    }
                    else
                    {
                        responseData.Status = "OK";
                        responseData.Results = false;
                    }
                }
                //get the discoutnpercantage using membershipTypeid
                else if (reqType == "GetMembershipDeatils")
                {
                    PatientDbContext patientDbContext = new PatientDbContext(connString);
                    var membershipDeatils = (from mem in patientDbContext.MembershipTypes
                                             where mem.MembershipTypeId == membershipTypeId
                                             select new
                                             {
                                                 MembershipTypeId = mem.MembershipTypeId,
                                                 DiscountPercent = mem.DiscountPercent,
                                                 MembershipTypeName = mem.MembershipTypeName
                                             }).FirstOrDefault();

                    responseData.Status = "OK";
                    responseData.Results = membershipDeatils;
                }
                //get the TotalAmount using providerId
                else if (reqType == "GetTotalAmountByProviderId")
                {
                    BillingDbContext billingDbContext = new BillingDbContext(connString);

                    ServiceDepartmentModel srvDept = billingDbContext.ServiceDepartment.Where(s => s.ServiceDepartmentName == "OPD").FirstOrDefault();

                    if (srvDept != null)
                    {
                        ///remove tolist from below query-- one doc will have only one opd-tkt price.. <sudrshan:14jul2017>
                        var billingItemPrice = (from bill in billingDbContext.BillItemPrice
                                                where bill.ServiceDepartmentId == srvDept.ServiceDepartmentId && bill.ItemId == providerId
                                                select bill.Price).ToList();

                        responseData.Status = "OK";
                        responseData.Results = billingItemPrice;
                    }
                    else
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "Failed to get OPD-Ticket Price";
                    }



                }   //getting appointment list of selected ProvideId
                else if (reqType == "get-appointment-list")
                {
                    ////.ToList()is done two times,since we can't use requestDate.Date inside IQueryable
                    //List<AppointmentModel> apptList = (from d in dbContextAppointment.Appointments
                    //                                   where d.ProviderId == providerId
                    //                                   select d).ToList();
                    //AppointmentDay apptDay = AppointmentDay.FormatData(apptList);

                    ////responseData.Status = "OK";
                    //responseData.Results = apptDay;

                    var apptList = (from apt in dbContextAppointment.Appointments
                                    where apt.ProviderId == providerId && apt.AppointmentDate==requestDate
                                    select new
                                    {
                                        PatientName = apt.FirstName + " " + (string.IsNullOrEmpty(apt.MiddleName) ? "" : apt.MiddleName + " ") + apt.LastName,
                                        Time = apt.AppointmentTime,
                                        Date = apt.AppointmentDate,
                                    }).ToList();
                    if (apptList != null)
                    {
                        responseData.Status = "OK";
                        responseData.Results = apptList;
                    }
                    else
                    {
                        responseData.Status = "Failed";
                    }
                }
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
            DanpheHTTPResponse<Object> responseData = new DanpheHTTPResponse<Object>();

            try
            {
                string str = this.ReadPostData();
                string reqType = this.ReadQueryStringData("reqType");
                //if (!string.IsNullOrEmpty(reqType) && reqType == "quickAppointment")
                //{
                //    return QuickAppointmentCreate();
                //}
                //else
                //{
                AppointmentModel ipApptModel = DanpheJSONConvert.DeserializeObject<AppointmentModel>(str);

                if (ipApptModel.PatientId == 0)
                {
                    ipApptModel.PatientId = null;
                }

                AppointmentDbContext apptDbContext = new AppointmentDbContext(connString);

                apptDbContext.Appointments.Add(ipApptModel);
                apptDbContext.SaveChanges();
                responseData.Results = ipApptModel;
                responseData.Status = "OK";

                // }

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
            DanpheHTTPResponse<string> responseData = new DanpheHTTPResponse<string>();
            try
            {
                string str = this.ReadPostData();
                string reqType = this.ReadQueryStringData("reqType");
                string status = this.ReadQueryStringData("status");
                int appointmentId = ToInt(this.ReadQueryStringData("appointmentId"));
                int patientId = ToInt(this.ReadQueryStringData("patientId"));
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                //update patientId in Appointment Table
                if (reqType == "updatePatientId" && patientId != 0)
                {
                    AppointmentDbContext dbContextUpdate = new AppointmentDbContext(connString);
                    AppointmentModel dbAppointment = dbContextUpdate.Appointments
                                                    .Where(a => a.AppointmentId == appointmentId)
                                                    .FirstOrDefault<AppointmentModel>();

                    dbAppointment.PatientId = patientId;
                    dbContextUpdate.Entry(dbAppointment).State = EntityState.Modified;
                    dbContextUpdate.SaveChanges();

                    responseData.Status = "OK";
                    responseData.Results = "Appointment information updated successfully.";
                }
                //update appointmentStatus
                else if (reqType == "updateAppStatus" && !string.IsNullOrEmpty(status))
                {
                    AppointmentDbContext dbContextUpdate = new AppointmentDbContext(connString);
                    AppointmentModel dbAppointment = dbContextUpdate.Appointments
                                                    .Where(a => a.AppointmentId == appointmentId)
                                                    .FirstOrDefault<AppointmentModel>();
                    dbAppointment.AppointmentStatus = status.ToLower();
                    dbContextUpdate.Entry(dbAppointment).State = EntityState.Modified;
                    dbContextUpdate.SaveChanges();

                    responseData.Status = "OK";
                    responseData.Results = "Appointment information updated successfully.";
                }
                else if (reqType == "updateAppointmentStatus")
                {
                    AppointmentDbContext dbContextUpdate = new AppointmentDbContext(connString);
                    AppointmentModel appointmentData = DanpheJSONConvert.DeserializeObject<AppointmentModel>(str);

                    dbContextUpdate.Appointments.Attach(appointmentData);
                    dbContextUpdate.Entry(appointmentData).State = EntityState.Modified;

                    dbContextUpdate.Entry(appointmentData).Property(x => x.CreatedOn).IsModified = false;
                    dbContextUpdate.Entry(appointmentData).Property(x => x.CreatedBy).IsModified = false;

                    appointmentData.CancelledOn = System.DateTime.Now;
                    appointmentData.CancelledBy = currentUser.EmployeeId;

                    dbContextUpdate.SaveChanges();

                    responseData.Status = "OK";
                    responseData.Results = "Appointment information updated successfully";
                }
                else
                {
                    //throw new Exception("Cannot match any reqType");
                    //throw new NotImplementedException("cannot match any request type. given requesttype " + reqType + "  is not implemented.");
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = "Cannot match any reqType";
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


        //private string QuickAppointmentCreate()
        //{
        //    DanpheHTTPResponse<QuickAppointmentVM> responseData = new DanpheHTTPResponse<QuickAppointmentVM>();

        //    try
        //    {
        //        string str = Request.Form.Keys.First<string>();
        //        QuickAppointmentVM ipQckApptModel = DanpheJSONConvert.DeserializeObject<QuickAppointmentVM>(str);

        //        PatientModel currPat = ipQckApptModel.Patient;
        //        AppointmentModel currAppt = ipQckApptModel.Appointment;
        //        BillingTransactionModel currBillTxn = ipQckApptModel.BillingTransaction;

        //        PatientDbContext patDbContext = new PatientDbContext(connectionStr);
        //        //create patient and save if not registered. else get patient details from id.
        //        if (currPat.PatientId == 0)
        //        {
        //            currPat.EMPI = CreateEmpi(currPat);

        //            patDbContext.Patients.Add(currPat);
        //            patDbContext.SaveChanges();

        //            //assign patient properties to appointment object
        //            currAppt.PatientId = currPat.PatientId;
        //            currPat.PatientCode = UpdatePatientCode(currPat.PatientId);
        //        }
        //        else {
        //            //if patient's already registered, get his/her details and assign..
        //            int patId = currPat.PatientId;
        //            currPat = patDbContext.Patients.Where(p => p.PatientId == patId).FirstOrDefault();
        //            ipQckApptModel.Patient = currPat;
        //        }

        //        //create new appointment.
        //        currAppt.AppointmentStatus = "initiated";
        //        currAppt.PatientType = "outpatient";

        //        AppointmentDbContext apptDbcontext = new AppointmentDbContext(connectionStr);
        //        apptDbcontext.Appointments.Add(currAppt);
        //        apptDbcontext.SaveChanges();

        //        //create new visit.
        //        VisitModel newVisit = new VisitModel();
        //        newVisit.PatientId = currPat.PatientId;
        //        newVisit.VisitDate = currAppt.AppointmentDate;
        //        newVisit.VisitTime = currAppt.AppointmentDate.Add(currAppt.AppointmentTime);
        //        newVisit.ProviderId = currAppt.ProviderId;
        //        newVisit.ProviderName = currAppt.ProviderName;
        //        newVisit.VisitType = "outpatient";//fixed for outpatient. need to check for admission.
        //        newVisit.VisitStatus = "initiated";//fixed for quickAppointment
        //        newVisit.AppointmentType = "New";

        //        newVisit.AppointmentId = currAppt.AppointmentId;
        //        newVisit.BillingStatus = "paid";///Update this status once posting to billing is successfull..

        //        VisitDbContext visitDbcontext = new VisitDbContext(connectionStr);
        //        visitDbcontext.Visits.Add(newVisit);
        //        visitDbcontext.SaveChanges();
        //        UpdateVisitCode(newVisit.PatientVisitId);
        //        //this should save to both billing transaction and transactionitem.
        //        BillingDbContext billDbcontext = new BillingDbContext(connectionStr);
        //        currBillTxn.CreatedOn = System.DateTime.Now;
        //        currBillTxn.PatientId = currPat.PatientId;


        //        currBillTxn.PatientVisitId = newVisit.PatientVisitId;
        //        if (currBillTxn.BillingTransactionItems != null && currBillTxn.BillingTransactionItems.Count > 0)
        //        {
        //            currBillTxn.BillingTransactionItems[0].PatientId = currPat.PatientId;

        //        }


        //        billDbcontext.BillingTransactions.Add(currBillTxn);
        //        billDbcontext.SaveChanges();
        //        //assign current patient to billing transaction..
        //        currBillTxn.Patient = currPat;//check it again if we can send this or not.. sudarshan:14july
        //        responseData.Results = ipQckApptModel;
        //        responseData.Status = "OK";

        //    }
        //    catch (Exception ex)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
        //    }

        //    return DanpheJSONConvert.SerializeObject(responseData, true);

        //}


        //Move it to a common function to be used between visit and appointment controller.
        //IMPORTANT.. we need to change this logic, so that we get unique id everytime. 
        private void UpdateVisitCode(int patientVisitId)
        {
            VisitDbContext visitDbContext = new VisitDbContext(connString);
            try
            {

                if (patientVisitId != 0)
                {
                    VisitModel visit = visitDbContext.Visits
                                        .Where(a => a.PatientVisitId == patientVisitId)
                                        .FirstOrDefault<VisitModel>();
                    if (visit.VisitType == "outpatient")
                        visit.VisitCode = "V" + (visit.PatientVisitId + 100000);
                    else
                        visit.VisitCode = "H" + (visit.PatientVisitId + 100000);

                    visitDbContext.Entry(visit).State = EntityState.Modified;
                    visitDbContext.SaveChanges();
                }

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        private string CreateEmpi(PatientModel obj)
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


    }


}



