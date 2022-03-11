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
using System.Data.SqlClient;

//sud:30May'2021-for Gitlab webhook testing -- we can remove this line.

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
        public string Get(string reqType, string status)
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
                else if (reqType == "getBedinfo")
                {
                    //.ToList()is done two times,since we can't use requestDate.Date inside IQueryable
                    DynamicReport bedsInfoList = dbContextHelpdesk.GetBedInformation();

                    responseData.Status = "OK";
                    responseData.Results = bedsInfoList;
                }
                else if (reqType == "getBedPatientInfo")
                {
                    var bedpatientinfo = (from patientBedInfo in dbAdmission.PatientBedInfos.Where(a => a.IsActive == true && a.EndedOn == null)
                                          join bed in dbAdmission.Beds on patientBedInfo.BedId equals bed.BedId
                                          where bed.IsActive == true && bed.IsOccupied == true
                                          join ward in dbAdmission.Wards on patientBedInfo.WardId equals ward.WardId
                                          where ward.IsActive == true
                                          join bedFeatureMap in dbAdmission.BedFeaturesMaps on bed.BedId equals bedFeatureMap.BedId
                                          join bedFeature in dbAdmission.BedFeatures on bedFeatureMap.BedFeatureId equals bedFeature.BedFeatureId
                                          where bedFeature.IsActive == true
                                          join patient in dbAdmission.Patients on patientBedInfo.PatientId equals patient.PatientId
                                          join visit in dbAdmission.Visits.Distinct() on patientBedInfo.PatientId equals visit.PatientId
                                          where visit.VisitType == "inpatient"

                                          select new BedPatientViewModel
                                          {
                                              BedNumber = bed.BedNumber,
                                              BedCode = bed.BedCode,
                                              Address = patient.Address,
                                              BedFeatureId = bedFeature.BedFeatureId,
                                              BedId = bed.BedId,
                                              VisitCode = visit.VisitCode,
                                              EndedOn = patientBedInfo.EndedOn,
                                              StartedOn = patientBedInfo.StartedOn,
                                              PatientName = patient.FirstName + " " + patient.MiddleName + " " + patient.LastName,
                                              PatientAdmissionId = patient.PatientId,
                                              WardName = ward.WardName,
                                              WardId = ward.WardId,
                                              PatientBedInfoId = patientBedInfo.BedFeatureId,
                                              PatientCode = patient.PatientCode,
                                              Age = patient.Age,
                                              PhoneNumber = patient.PhoneNumber

                                          }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = bedpatientinfo;

                }

                //gets the WardInformation from WardBedType and Ward tables
                else if (reqType == "getWardinfo")
                {
                    //data from GetWardInformation Method from Dbcontext
                    List<WardInformationModel> wardsInfoList = dbContextHelpdesk.GetWardInformation();

                    responseData.Status = "OK";
                    responseData.Results = wardsInfoList;
                }
                else if (reqType == "get-bedoccupancy-of-wards")
                {
                    DanpheHTTPResponse<DataTable> data = new DanpheHTTPResponse<DataTable>();
                    try
                    {
                        HelpdeskDbContext helpdeskDbContext = new HelpdeskDbContext(connString);
                        DataTable dtResult = helpdeskDbContext.GetBedOccupancyOfWards();
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
                else if (reqType == "get-allbeds-with-patientsinfo")
                {
                    HelpdeskDbContext helpdeskDbContext = new HelpdeskDbContext(connString);
                    DataTable dtBedsWithPat = DALFunctions.GetDataTableFromStoredProc("SP_ADT_AllBedsWithPatientsInfo", helpdeskDbContext);
                    responseData.Results = dtBedsWithPat;
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


    }
}
