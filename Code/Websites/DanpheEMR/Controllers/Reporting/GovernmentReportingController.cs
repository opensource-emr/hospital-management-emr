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

            LaboratoryServices labServices = new LaboratoryServices();
            // DanpheHTTPResponse<DynamicReport> responseData1 = new DanpheHTTPResponse<DynamicReport>();
            DanpheHTTPResponse<LaboratoryServices> responseData = new DanpheHTTPResponse<LaboratoryServices>();
            try
            {
                GovernmentReportDbContext govreportingDbContext = new GovernmentReportDbContext(connString);
                LaboratoryServices HaematologyResult = govreportingDbContext.GetHaematology(FromDate, ToDate);
                labServices.HaematologyModel0 = HaematologyResult.HaematologyModel0;
                labServices.HaematologyModel1 = HaematologyResult.HaematologyModel1;

                LaboratoryServices ImmunologyResult = govreportingDbContext.GetImmunology(FromDate, ToDate);
                labServices.ImmunologyModel0 = ImmunologyResult.ImmunologyModel0;
                labServices.ImmunologyModel1 = ImmunologyResult.ImmunologyModel1;

                LaboratoryServices BiochemistryResult = govreportingDbContext.GetBiochemistry(FromDate, ToDate);
                labServices.BiochemistryModel0 = BiochemistryResult.BiochemistryModel0;
                labServices.BiochemistryModel1 = BiochemistryResult.BiochemistryModel1;

                LaboratoryServices BacteriologyResult = govreportingDbContext.GetBacteriology(FromDate, ToDate);
                labServices.BacteriologyModel0 = BacteriologyResult.BacteriologyModel0;

                LaboratoryServices CytologyResult = govreportingDbContext.GetCytology(FromDate, ToDate);
                labServices.CytologyModel0 = CytologyResult.CytologyModel0;

                LaboratoryServices VirologyResult = govreportingDbContext.GetVirology(FromDate, ToDate);
                labServices.VirologyModel0 = VirologyResult.VirologyModel0;

                LaboratoryServices ImmunohistochemistryResult = govreportingDbContext.GetImmunohistochemistry(FromDate, ToDate);
                labServices.ImmunohistochemistryModel0 = ImmunohistochemistryResult.ImmunohistochemistryModel0;

                LaboratoryServices HistologyResult = govreportingDbContext.GetHistology(FromDate, ToDate);
                labServices.HistologyModel0 = HistologyResult.HistologyModel0;

                LaboratoryServices ParasitologyResult = govreportingDbContext.GetParasitology(FromDate, ToDate);
                labServices.ParasitologyModel0 = ParasitologyResult.ParasitologyModel0;

                LaboratoryServices CardiacenzymesResult = govreportingDbContext.GetCardiacenzymes(FromDate, ToDate);
                labServices.CardiacenzymesModel0 = CardiacenzymesResult.CardiacenzymesModel0;

                LaboratoryServices HormonesendocrinologyResult = govreportingDbContext.GetHormonesendocrinology(FromDate, ToDate);
                labServices.HormonesendocrinologyModel0 = HormonesendocrinologyResult.HormonesendocrinologyModel0;

                responseData.Status = "OK";
                responseData.Results = labServices;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);

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

            InpatientOutcome inpatientcome = new InpatientOutcome();
            DanpheHTTPResponse<InpatientOutcome> responseData = new DanpheHTTPResponse<InpatientOutcome>();
            try
            {
                GovernmentReportDbContext govreportingDbContext = new GovernmentReportDbContext(connString);
                InpatientOutcome InpatientOutcomeResult = govreportingDbContext.GetInpatientOutcome(FromDate, ToDate);
                inpatientcome.InpatientoutcomeModel = InpatientOutcomeResult.InpatientoutcomeModel;

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
        public IActionResult InpatientOutcomeView()
        {
            return View("InpatientOutcome");
        }
        #endregion





    }
}
