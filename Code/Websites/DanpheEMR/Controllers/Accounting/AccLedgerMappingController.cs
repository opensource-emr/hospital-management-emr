using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.Core.Configuration;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using System.Data.Entity;
using System.Data.SqlClient;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using DanpheEMR.Utilities;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Http.Features;
using DanpheEMR.CommonTypes;
using RefactorThis.GraphDiff;//for entity-update.
using DanpheEMR.Security;
using System.Data;
using System.Data.Entity.Core.Objects;
using System.Collections;
using DanpheEMR.AccTransfer;
using DanpheEMR.Core.Caching;
using DanpheEMR.ServerModel.IncentiveModels;
using DanpheEMR.Core;
using DanpheEMR.ServerModel.AccountingModels;
using Newtonsoft.Json.Converters;
using DanpheEMR.Enums;
using DanpheEMR.ServerModel.AccountingModels.ViewModels;
using DanpheEMR.Controllers.Stickers.DTOs;
using DanpheEMR.Controllers.Accounting.DTOs;
using DanpheEMR.Services.Accounting.DTOs;
using DanpheEMR.Services.BillSettings.DTOs;
using DanpheEMR.Services.ClaimManagement.DTOs;
//using System.Collections;

namespace DanpheEMR.Controllers
{

    [RequestFormSizeLimit(valueCountLimit: 100000, Order = 1)]
    [DanpheDataFilter()]
    [Route("api/[controller]")]
    public class AccLedgerMappingController : CommonController
    {
        private AccountingDbContext _accountingDbContext;
        public AccLedgerMappingController(IOptions<MyConfiguration> _config) : base(_config)
        {
            //connString = _config.Value.Connectionstring;
            _accountingDbContext = new AccountingDbContext(connString);
        }

        #region HTTP GET APIs


        [HttpGet]
        [Route("BillingIncomeLedgers")]
        public IActionResult GetBillingIncomeLedgers()
        {
            //else if (reqType == "get-billings-ledgers")
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            Func<object> func = () => GetBillingItemLedgers(currentHospitalId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion HTTP GET APIs

        #region HTTP POST APIs

        [HttpPost]
        [Route("MapBillingIncomeLedger")]
        public IActionResult MapBillingIncomeLedger([FromBody] AccBillingLedgerMapping_DTO accBillingLedgerMapping)
        {
            
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            Func<object> func = () => MapBillingIncomeLedger(currentHospitalId, accBillingLedgerMapping);
            return InvokeHttpPostFunction<object>(func);
        }

        #endregion HTTP POST APIs

        #region HTTP PUT APIs
        [HttpPut]
        [Route("ActivateDeactivateBillingLedgerMapping")]
        public IActionResult ActivateDeactivateBillingLedgerMapping( int BillLedgerMappingId , bool IsActive)
        {
            Func<object> func = () =>UpdateActivateDeactivateBillingLedgerMapping(BillLedgerMappingId, IsActive);
            return InvokeHttpPutFunction(func);
        }


        [HttpPut]
        [Route("MapBillingLedger")]
        public IActionResult MapBillingLedger([FromBody] AccBillingLedgerMapping_DTO accBillingLedgerMapping)
        {
            Func<object> func = () => UpdateMapBillingIncomeLedger(accBillingLedgerMapping);
            return InvokeHttpPutFunction(func);
        }
        #endregion HTTP PUT APIs

        private object GetBillingItemLedgers(int currentHospitalId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() { };
            DataSet mappingDetail = DALFunctions.GetDatasetFromStoredProc("SP_ACC_GetIncomeLedgerMappingDetail", paramList, _accountingDbContext);
            DataTable mapTable = mappingDetail.Tables[0];
            var IncomeLedgerMapping = AccBillingLedgerMapping_DTO.MapDataTableToSingleObject(mapTable);
            return IncomeLedgerMapping;
        }

        private object MapBillingIncomeLedger(int HospitalId, AccBillingLedgerMapping_DTO accBillingLedgerMapping)
        {
            AccountingBillLedgerMappingModel accBillLedgerMap = new AccountingBillLedgerMappingModel();
            accBillLedgerMap.LedgerId = accBillingLedgerMapping.LedgerId;
            accBillLedgerMap.SubLedgerId = accBillingLedgerMapping.SubLedgerId == 0 ? null : accBillingLedgerMapping.SubLedgerId;
            accBillLedgerMap.ItemId = accBillingLedgerMapping.ItemId;
            accBillLedgerMap.HospitalId = HospitalId;
            accBillLedgerMap.ServiceDepartmentId = accBillingLedgerMapping.ServiceDepartmentId;
            accBillLedgerMap.IsActive = true;
            accBillLedgerMap.BillingType = accBillingLedgerMapping.BillingType;
            _accountingDbContext.AccountBillLedgerMapping.Add(accBillLedgerMap);
            _accountingDbContext.SaveChanges();
            return accBillLedgerMap;
        }

        private object UpdateActivateDeactivateBillingLedgerMapping(int BillLedgerMappingId, bool IsActive)
        {
            var ledger = _accountingDbContext.AccountBillLedgerMapping.Where(x => x.BillLedgerMappingId == BillLedgerMappingId).FirstOrDefault();
            if (ledger != null)
            {
                ledger.IsActive = IsActive; 
              
            }
            _accountingDbContext.SaveChanges();
            return ledger;
        }

        private object UpdateMapBillingIncomeLedger(AccBillingLedgerMapping_DTO accBillingLedgerMapping)
        {
            var ledgerToUpdate = _accountingDbContext.AccountBillLedgerMapping.Where(x => x.BillLedgerMappingId == accBillingLedgerMapping.BillLedgerMappingId).FirstOrDefault();
            ledgerToUpdate.SubLedgerId = accBillingLedgerMapping.SubLedgerId ==  0 ? null : accBillingLedgerMapping.SubLedgerId;
            ledgerToUpdate.LedgerId = accBillingLedgerMapping.LedgerId;
            ledgerToUpdate.ServiceDepartmentId = accBillingLedgerMapping.ServiceDepartmentId;
            ledgerToUpdate.ItemId = accBillingLedgerMapping.ItemId;
            _accountingDbContext.SaveChanges();
            return Ok();
        }
    }

}