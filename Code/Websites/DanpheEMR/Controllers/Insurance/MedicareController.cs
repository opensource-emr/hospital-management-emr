using DanpheEMR.CommonTypes;
using DanpheEMR.Controllers.Accounting.DTOs;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.MedicareModels;
using DanpheEMR.Services.Medicare;
using DanpheEMR.Utilities;
using DanpheEMR.ViewModel.Medicare;
using DocumentFormat.OpenXml.Office2010.ExcelAc;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using OfficeOpenXml.FormulaParsing.Excel.Functions.Text;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Controllers
{
    public class MedicareController : CommonController
    {
        private readonly IMedicareService _medicareService;
        private readonly MedicareDbContext _medicareDbContext;
        public DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

        public MedicareController(IMedicareService medicareService, IOptions<MyConfiguration> _config) : base(_config)
        {
            _medicareService = medicareService;
            _medicareDbContext = new MedicareDbContext(connString);
        }


        [HttpGet]
        [Route("MedicareMemberDetail")]
        public async Task<IActionResult> GetMedicareMemberDetail(int patientId)
        {

            Func<Task<object>> func = () => _medicareService.GetMedicarePatientDetails(_medicareDbContext, patientId);
            return await InvokeHttpGetFunctionAsync(func);

        }

        [HttpGet]
        [Route("Departments")]
        public async Task<ActionResult> Departments()
        {
            Func<Task<object>> func = () => _medicareService.GetDepartments(_medicareDbContext);
            return await InvokeHttpGetFunctionAsync(func);
        }

        [HttpGet]
        [Route("Designations")]
        public async Task<ActionResult> Designations()
        {

            Func<Task<object>> func = () => _medicareService.GetDesignations(_medicareDbContext);
            return await InvokeHttpGetFunctionAsync(func);
        }

        [HttpGet]
        [Route("MedicareTypes")]
        public async Task<ActionResult> MedicareTypes()
        {
            Func<Task<object>> func = () => _medicareService.GetMedicareTypes(_medicareDbContext);
            return await InvokeHttpGetFunctionAsync(func);

        }

        [HttpGet]
        [Route("MedicareInstitutes")]
        public async Task<ActionResult> MedicareInstitutes()
        {
            Func<Task<object>> func = () => _medicareService.GetAllMedicareInstitutes(_medicareDbContext);
            return await InvokeHttpGetFunctionAsync(func);

        }

        [HttpGet]
        [Route("InsuranceProviders")]
        public async Task<ActionResult> InsuranceProviders()
        {
            Func<Task<object>> func = () => _medicareService.GetInsuranceProviders(_medicareDbContext);
            return await InvokeHttpGetFunctionAsync(func);

        }

        [HttpGet]
        [Route("MedicareMemberByPatientId")]
        public async Task<IActionResult> MedicareMemberDetailByPatientId(int PatientId)
        {
            Func<Task<object>> func = () => _medicareService.GetMedicareMemberByPatientId(_medicareDbContext, PatientId);
            return await InvokeHttpGetFunctionAsync(func);

        }

        [HttpGet]
        [Route("MedicareMemberByMemberNo")]
        public async Task<ActionResult> MedicareMemberDetailByMedicareNo(string medicareNo)
        {
            Func<Task<object>> fun = () => _medicareService.GetMedicareMemberByMedicareNo(_medicareDbContext, medicareNo);
            return await InvokeHttpGetFunctionAsync(fun);
        }

        [HttpGet]
        [Route("DependentMedicareMember")]
        public async Task<ActionResult> DependentMedicareMember(int patientId)
        {
            Func<Task<object>> fun = () => _medicareService.GetDependentMedicareMemberByPatientId(_medicareDbContext, patientId);
            return await InvokeHttpGetFunctionAsync(fun);
        }

        #region Get MedicarePatientList
        [HttpGet]
        [Route("MedicarePatientList")]
        public IActionResult MedicarePatientList()
        {
            Func<object> func = () => GetMedicarePatientList();
            return InvokeHttpGetFunction<object>(func);
        }

        #endregion

        [HttpPost]
        [Route("MedicareMemberDetails")]

        public IActionResult AddMedicareMemberDetails([FromBody] MedicareMemberDto medicareMemberDto)
        {
            if (medicareMemberDto == null)
            {
                throw new ArgumentNullException("Medicare member details is null");
            }
            else
            {
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                using (var medicareTransactionScope = _medicareDbContext.Database.BeginTransaction())
                {
                    Func<object> func = () => _medicareService.SaveMedicareMemberDetails(_medicareDbContext, medicareMemberDto, currentUser);
                    return InvokeHttpPostFunctionSingleTransactionScope<object>(func, medicareTransactionScope);
                }
            }
        }

        [HttpPut]
        [Route("MedicareMemberDetails")]
        public IActionResult UpdateMedicareMemberDetails([FromBody] MedicareMemberDto medicareMemberDto)
        {

            if (medicareMemberDto == null)
            {
                throw new ArgumentNullException("Medicare member details is null");
            }
            else
            {
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                using (var medicareTransactionScope = _medicareDbContext.Database.BeginTransaction())
                {
                    Func<object> func = () => _medicareService.UpdateMedicareMemberDetails(_medicareDbContext, medicareMemberDto, currentUser);
                    return InvokeHttpPutFunctionSingleTransactionScope<object>(func, medicareTransactionScope);
                }
            }
        }

        private object GetMedicarePatientList()
        {
            List<SqlParameter> paramList = new List<SqlParameter>();

            DataSet dataset = DALFunctions.GetDatasetFromStoredProc("SP_INS_Medicare_GetMedicarePatientList", paramList, _medicareDbContext);
            DataTable dataTable = dataset.Tables[0];
            string PatientData = JsonConvert.SerializeObject(dataTable);
            List<MedicarePatientList_DTO> medicarePatients = JsonConvert.DeserializeObject<List<MedicarePatientList_DTO>>(PatientData);
            return medicarePatients;

        }

    }
}
