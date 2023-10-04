using DanpheEMR.Controllers.Dispensary;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services
{
    public class CssdReportService : ICssdReportService
    {
        #region Fields
        private readonly string connString;
        private InventoryDbContext db;
        #endregion

        #region CTOR
        public CssdReportService(IOptions<MyConfiguration> _config)
        {
            connString = _config.Value.Connectionstring;
            db = new InventoryDbContext(connString);
        }
        #endregion

        #region Methods
        public async Task<IList<IntegratedCssdReportDto>> GetIntegratedCssdReport(DateTime FromDate, DateTime ToDate)
        {
            var tomorrowDate = ToDate.AddDays(1);
            var allFinalizedCssdTransactions = await (from cssdTxn in db.CssdItemTransactions
                                                      join item in db.Items on cssdTxn.ItemId equals item.ItemId
                                                      join asset in db.FixedAssetStock on cssdTxn.FixedAssetStockId equals asset.FixedAssetStockId
                                                      join store in db.StoreMasters on cssdTxn.StoreId equals store.StoreId
                                                      join requestingEmp in db.Employees on cssdTxn.RequestedBy equals requestingEmp.EmployeeId
                                                      join disinfectionEmp in db.Employees on cssdTxn.DisinfectedBy equals disinfectionEmp.EmployeeId into disinfectEmps
                                                      from disinfectionEmpLJ in disinfectEmps.DefaultIfEmpty()
                                                      join dispatchEmp in db.Employees on cssdTxn.DispatchedBy equals dispatchEmp.EmployeeId into dispatchEmps
                                                      from dispatchEmpLJ in dispatchEmps.DefaultIfEmpty()
                                                      where FromDate <= cssdTxn.RequestedOn && cssdTxn.RequestedOn < tomorrowDate
                                                      select new IntegratedCssdReportDto
                                                      {
                                                          CssdTxnId = cssdTxn.CssdTxnId,
                                                          StoreId = cssdTxn.StoreId,
                                                          ItemName = item.ItemName,
                                                          ItemCode = item.Code,
                                                          TagNumber = asset.BarCodeNumber,
                                                          RequestedFrom = store.Name,
                                                          RequestedBy = requestingEmp.FullName,
                                                          RequestDate = cssdTxn.RequestedOn,
                                                          Disinfectant = cssdTxn.DisinfectantName,
                                                          DisinfectedDate = cssdTxn.DisinfectedOn,
                                                          DisinfectedBy = (disinfectionEmpLJ == null) ? "" : disinfectionEmpLJ.FullName,
                                                          DispatchedDate = cssdTxn.DispatchedOn,
                                                          DispatchedBy = (disinfectionEmpLJ == null) ? "" : disinfectionEmpLJ.FullName
                                                      }).OrderBy(a => a.RequestDate).ToListAsync();
            return allFinalizedCssdTransactions;
        }
        #endregion
    }

    public class IntegratedCssdReportDto
    {
        public int CssdTxnId { get; set; }
        public string ItemName { get; set; }
        public string ItemCode { get; set; }
        public string TagNumber { get; set; }
        public string RequestedFrom { get; set; }
        public string RequestedBy { get; set; }
        public DateTime RequestDate { get; set; }
        public string Disinfectant { get; set; }
        public DateTime? DisinfectedDate { get; set; }
        public string DisinfectedBy { get; set; }
        public DateTime? DispatchedDate { get; set; }
        public string DispatchedBy { get; set; }
        public int? StoreId { get; set; }
    }
}
