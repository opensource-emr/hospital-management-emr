using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.DalLayer;
using Microsoft.Extensions.Options;
using DanpheEMR.Utilities;
using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Configuration;
using DanpheEMR.ServerModel.ReportingModels;
using DanpheEMR.ServerModel.HelpdeskModels;
using System.Data;
using DanpheEMR.ViewModel.ADT;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers.HelpDesk
{
    [Route("api/[controller]")]
    public class HelpdeskController : CommonController
    {
        public HelpdeskController(IOptions<MyConfiguration> _config) : base(_config)
        {
            //connectionStr = _config.Value.Connectionstring;

        }
        // GET: api/values
        [HttpGet]
        public string Get(string reqType,string status)
        {
            HelpdeskDbContext dbContextHelpdesk = new HelpdeskDbContext(connString);
            AdmissionDbContext dbAdmission = new AdmissionDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();



            try
            {

                //gets the EmployeeInfo from Employee table
                if (reqType == "getHelpdesk")
                {
                    //.ToList()is done two times,since we can't use requestDate.Date inside IQueryable
                    List<EmployeeInfoModel> empsInfoList = dbContextHelpdesk.GetEmployeeInfo();
                    //where d.EmployeeId == employeeId


                    responseData.Status = "OK";
                    //loads EmployeeInfo with requested status
                    responseData.Results = empsInfoList;
                }
                //gets the BedInformation from Bed,Bedtype and Ward tables
                if (reqType == "getBedinfo")
                {
                    //.ToList()is done two times,since we can't use requestDate.Date inside IQueryable
                    DynamicReport bedsInfoList = dbContextHelpdesk.GetBedInformation();

                    responseData.Status = "OK";
                    responseData.Results = bedsInfoList;
                }
                //gets the BedInformation , Patient Information and Ward Name
                if (reqType == "getBedPatientInfo")
                {
                    var bedpatientinfo = dbAdmission.Beds.ToList().GroupJoin(dbAdmission.PatientBedInfos.ToList().Where(a => a.EndedOn == null), a => a.BedId, b => b.BedId, (a, b) =>
                          new BedPatientViewModel
                          {
                              BedId = a.BedId,
                              WardId = a.WardId,
                              BedCode = a.BedCode,
                              PatientId = b.Select(s => s.PatientId).FirstOrDefault(),
                              PatientBedInfoId = b.Select(s=>s.PatientBedInfoId).FirstOrDefault(),
                              StartedOn = b.Select(s => s.StartedOn).FirstOrDefault(),
                              EndedOn = b.Select(s=>s.EndedOn).FirstOrDefault(),
                              BedNumber = a.BedNumber,
                              IsOccupied = a.IsOccupied

                          }).GroupJoin(dbAdmission.Patients.ToList(), a => a.PatientId, b => b.PatientId, (a, b) =>
                                  new BedPatientViewModel
                                  {
                                      BedId = a.BedId,
                                      WardId = a.WardId,
                                      BedCode = a.BedCode,
                                      PatientId = b.Select(s => s.PatientId).FirstOrDefault(),
                                      PatientBedInfoId = a.PatientBedInfoId,
                                      StartedOn = a.StartedOn,
                                      EndedOn = a.EndedOn,
                                      BedNumber = a.BedNumber,
                                      IsOccupied = a.IsOccupied,
                                      PatientName = b.Select(s => s.FirstName).FirstOrDefault() + " " + b.Select(s => s.MiddleName).FirstOrDefault() + " " + b.Select(s => s.LastName).FirstOrDefault(),
                                      PatientCode = b.Select(s => s.PatientCode).FirstOrDefault(),
                                      Address = b.Select(s => s.Address).FirstOrDefault()
                                  }).GroupJoin(dbAdmission.Wards.ToList(), a => a.WardId, b => b.WardId, (a, b) =>
                                   new BedPatientViewModel
                                   {
                                       BedId = a.BedId,
                                       WardId = b.Select(s => s.WardId).FirstOrDefault(),
                                       WardName = b.Select(s => s.WardName).FirstOrDefault(),
                                       BedCode = a.BedCode,
                                       PatientId = a.PatientId,
                                       PatientBedInfoId = a.PatientBedInfoId,
                                       StartedOn = a.StartedOn,
                                       EndedOn = a.EndedOn,
                                       BedNumber = a.BedNumber,
                                       IsOccupied = a.IsOccupied,
                                       PatientName = a.PatientName,
                                       PatientCode = a.PatientCode,
                                       Address = a.Address
                                   }).GroupJoin(dbAdmission.Admissions.ToList(),a => a.PatientId , b =>b.PatientId,(a,b)=>
                                   new BedPatientViewModel
                                   {
                                       BedId = a.BedId,
                                       WardId = a.WardId,
                                       WardName = a.WardName,
                                       BedCode = a.BedCode,
                                       PatientId = a.PatientId,
                                       PatientBedInfoId = a.PatientBedInfoId,
                                       StartedOn = a.StartedOn,
                                       EndedOn = a.EndedOn,
                                       BedNumber = a.BedNumber,
                                       IsOccupied = a.IsOccupied,
                                       PatientName = a.PatientName,
                                       PatientCode = a.PatientCode,
                                       Address = a.Address,
                                       PatientVisitId = b.Select(s=>s.PatientVisitId).FirstOrDefault(),
                                       PatientAdmissionId =b.Select(s=>s.PatientAdmissionId).FirstOrDefault(),
                                       DischargedDate = b.Select(s=>s.DischargeDate).FirstOrDefault(),
                                       AdmittedDate = b.Select(s => s.AdmissionDate).FirstOrDefault()
                                   });

                    responseData.Status = "OK";
                    responseData.Results = bedpatientinfo;
                }
                //gets the WardInformation from WardBedType and Ward tables
                if (reqType == "getWardinfo")
                {
                    //data from GetWardInformation Method from Dbcontext
                    List<WardInformationModel> wardsInfoList = dbContextHelpdesk.GetWardInformation();

                    responseData.Status = "OK";
                    responseData.Results = wardsInfoList;
                }
                else if(reqType == "getBedFeature"){
                  DanpheHTTPResponse<DataTable> data = new DanpheHTTPResponse<DataTable>();
                    try
                    {

                        HelpdeskDbContext helpdeskDbContext = new HelpdeskDbContext(connString);
                        DataTable dtResult = helpdeskDbContext.BedFeatureReprot();
                        data.Status = "OK";
                        data.Results = dtResult;
                    }
                    catch (Exception ex)
                    {
                        //Insert exception details into database table.
                        data.Status = "Failed";
                        data.ErrorMessage = ex.Message;
                    }
                    return DanpheJSONConvert.SerializeObject(data);
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }


    }
}
