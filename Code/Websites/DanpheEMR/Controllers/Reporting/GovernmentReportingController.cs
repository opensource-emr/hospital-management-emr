using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.DalLayer;
using Microsoft.Extensions.Options;
using DanpheEMR.Core.Configuration;
using DanpheEMR.ServerModel.ReportingModels;
using DanpheEMR.CommonTypes;
using DanpheEMR.Utilities;
using System.Data.SqlClient;
using System.Data;
using DanpheEMR.ServerModel.LabModels;
// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers.Reporting
{
    public class GovernmentReportingController : Controller
    {
        private readonly string connString = null;
        public GovernmentReportingController(IOptions<MyConfiguration> _config)
        {
            connString = _config.Value.Connectionstring;

        }

        #region GovernmentMain 
        //[DanpheViewFilter("government-view")]
        public IActionResult GovernmentMainView()
        {
            return View("GovernmentMain");
        }
        #endregion

        #region GetSummaryReport 

        public string GetSummaryReport(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                GovernmentReportDbContext govReportDbContext = new GovernmentReportDbContext(connString);
                DynamicReport govReportSummary = govReportDbContext.GovReportSummary(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = govReportSummary;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

      
        public IActionResult GovReportSummary()
        {
            return View("GovReportSummary");
        }
        #endregion


        #region Laboratory Services
        public string GetLaboratoryServices(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                LabDbContext labDbContext = new LabDbContext(connString);                
                List<LabGovReportItemModel> allItemsInGovReport = labDbContext.LabGovReport.ToList();
                Dictionary<string, Dictionary<string, dynamic>> formattedGovLabResult = new Dictionary<string, Dictionary<string, dynamic>>();
                foreach (var test in allItemsInGovReport)
                {
                    var categoryName = test.GroupName.Replace(" ", "_");

                    //Add the Category Name first if Not Added
                    if (!formattedGovLabResult.ContainsKey(categoryName))
                    {
                        formattedGovLabResult.Add(categoryName, new Dictionary<string, object>());
                    }

                    var testKeyName = test.TestName.Replace(" ", "_");

                    //if it has inner Item then we need another dictionary that refers to those innerItems result
                    if (test.HasInnerItems.HasValue && test.HasInnerItems.Value == true)
                    {
                        var innerTestKeyName = test.InnerTestGroupName.Replace(" ", "_");
                        if (!formattedGovLabResult[categoryName].ContainsKey(innerTestKeyName))
                        {
                            formattedGovLabResult[categoryName].Add(innerTestKeyName, new Dictionary<string, object>());
                        }
                        formattedGovLabResult[categoryName][innerTestKeyName].Add(testKeyName, test);
                    }
                    else
                    {
                        formattedGovLabResult[categoryName].Add(testKeyName, test);
                    }
                }

                List<SqlParameter> paramList = new List<SqlParameter>() {  new SqlParameter("@FromDate",FromDate),
                        new SqlParameter("@ToDate", ToDate) };
                DataSet dts = DALFunctions.GetDatasetFromStoredProc("SP_LAB_TestCount_GovernmentReport", paramList, labDbContext);


                var allMappedTests = dts.Tables[0];
                string groupName;
                string testName;
                string innerTestName;
                bool hasInnerItems;
                string innerTestGroupName;

                foreach (DataRow row in allMappedTests.Rows)
                {
                    groupName = row["GroupName"].ToString().Replace(" ", "_");
                    testName = row["TestName"].ToString().Replace(" ", "_");
                    hasInnerItems = row["HasInnerItems"].ToString().ToLower() == "true";
                    innerTestGroupName = row["InnerTestGroupName"].ToString().Replace(" ", "_");
                    if (hasInnerItems)
                    {
                        formattedGovLabResult[groupName][innerTestGroupName][testName].Count += Convert.ToInt32(row["Total"].ToString());
                    }
                    else
                    {
                        formattedGovLabResult[groupName][testName].Count += Convert.ToInt32(row["Total"].ToString());
                    }
                }

                responseData.Results = formattedGovLabResult;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
            //LaboratoryServices labServices = new LaboratoryServices();
            //// DanpheHTTPResponse<DynamicReport> responseData1 = new DanpheHTTPResponse<DynamicReport>();
            //DanpheHTTPResponse<LaboratoryServices> responseData = new DanpheHTTPResponse<LaboratoryServices>();
            //try
            //{
            //    GovernmentReportDbContext govreportingDbContext = new GovernmentReportDbContext(connString);
            //    LaboratoryServices HaematologyResult = govreportingDbContext.GetHaematology(FromDate, ToDate);
            //    labServices.HaematologyModel0 = HaematologyResult.HaematologyModel0;
            //    labServices.HaematologyModel1 = HaematologyResult.HaematologyModel1;

            //    LaboratoryServices ImmunologyResult = govreportingDbContext.GetImmunology(FromDate, ToDate);
            //    labServices.ImmunologyModel0 = ImmunologyResult.ImmunologyModel0;
            //    labServices.ImmunologyModel1 = ImmunologyResult.ImmunologyModel1;

            //    LaboratoryServices BiochemistryResult = govreportingDbContext.GetBiochemistry(FromDate, ToDate);
            //    labServices.BiochemistryModel0 = BiochemistryResult.BiochemistryModel0;
            //    labServices.BiochemistryModel1 = BiochemistryResult.BiochemistryModel1;

            //    LaboratoryServices BacteriologyResult = govreportingDbContext.GetBacteriology(FromDate, ToDate);
            //    labServices.BacteriologyModel0 = BacteriologyResult.BacteriologyModel0;

            //    LaboratoryServices CytologyResult = govreportingDbContext.GetCytology(FromDate, ToDate);
            //    labServices.CytologyModel0 = CytologyResult.CytologyModel0;

            //    LaboratoryServices VirologyResult = govreportingDbContext.GetVirology(FromDate, ToDate);
            //    labServices.VirologyModel0 = VirologyResult.VirologyModel0;

            //    LaboratoryServices ImmunohistochemistryResult = govreportingDbContext.GetImmunohistochemistry(FromDate, ToDate);
            //    labServices.ImmunohistochemistryModel0 = ImmunohistochemistryResult.ImmunohistochemistryModel0;

            //    LaboratoryServices HistologyResult = govreportingDbContext.GetHistology(FromDate, ToDate);
            //    labServices.HistologyModel0 = HistologyResult.HistologyModel0;

            //    LaboratoryServices ParasitologyResult = govreportingDbContext.GetParasitology(FromDate, ToDate);
            //    labServices.ParasitologyModel0 = ParasitologyResult.ParasitologyModel0;

            //    LaboratoryServices CardiacenzymesResult = govreportingDbContext.GetCardiacenzymes(FromDate, ToDate);
            //    labServices.CardiacenzymesModel0 = CardiacenzymesResult.CardiacenzymesModel0;

            //    LaboratoryServices HormonesendocrinologyResult = govreportingDbContext.GetHormonesendocrinology(FromDate, ToDate);
            //    labServices.HormonesendocrinologyModel0 = HormonesendocrinologyResult.HormonesendocrinologyModel0;

            //    responseData.Status = "OK";
            //    responseData.Results = labServices;
            //}
            //catch (Exception ex)
            //{
            //    //Insert exception details into database table.
            //    responseData.Status = "Failed";
            //    responseData.ErrorMessage = ex.Message;
            //}
            //return DanpheJSONConvert.SerializeObject(responseData);

        }
        //[DanpheViewFilter("reports-laboratoryservices-view")]
        public IActionResult LaboratoryServicesView()
        {
            return View("LaboratoryServices");
        }

        #endregion

        #region Inpatient Outcome
        public string GetInpatientOutcome(DateTime FromDate, DateTime ToDate)
        {

            InpatientServiceReportModel inpatientcome = new InpatientServiceReportModel();
            DanpheHTTPResponse<InpatientServiceReportModel> responseData = new DanpheHTTPResponse<InpatientServiceReportModel>();
            try
            {
                GovernmentReportDbContext govreportingDbContext = new GovernmentReportDbContext(connString);
                InpatientServiceReportModel InpatientOutcomeResult = govreportingDbContext.GetInpatientOutcome(FromDate, ToDate);
                inpatientcome = InpatientOutcomeResult;

                responseData.Status = "OK";
                responseData.Results = inpatientcome;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Inpatient Morbidity
        public string GetInpatientMorbidityReportData(DateTime FromDate, DateTime ToDate)
        {

            InpatientMorbidityReportModel inpatientMorbidity = new InpatientMorbidityReportModel();
            DanpheHTTPResponse<InpatientMorbidityReportModel> responseData = new DanpheHTTPResponse<InpatientMorbidityReportModel>();
            try
            {
                GovernmentReportDbContext govreportingDbContext = new GovernmentReportDbContext(connString);
                InpatientMorbidityReportModel InpatientMorbidityResult = govreportingDbContext.GetInpatientMorbidity(FromDate, ToDate);
                inpatientMorbidity = InpatientMorbidityResult;

                responseData.Status = "OK";
                responseData.Results = inpatientMorbidity;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion
        public IActionResult InpatientOutcomeView()
        {
            return View("InpatientOutcome");
        }
        

    }
}
