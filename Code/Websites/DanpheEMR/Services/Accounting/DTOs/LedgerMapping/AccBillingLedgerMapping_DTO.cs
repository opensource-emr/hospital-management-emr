using DanpheEMR.Services.ClaimManagement.DTOs;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Data;

namespace DanpheEMR.Services.Accounting.DTOs
{
    public class AccBillingLedgerMapping_DTO
    {
        public int LedgerId { get; set; }
        public int LedgerGroupId { get; set; }
        public string LedgerName { get; set; }
        public string Name { get; set; } //this is different than LedgerName
        public string LedgerType { get; set; }
        public string LedgerCode { get; set; }
        public int ServiceDepartmentId { get; set; }
        public string ServiceDepartmentName { get; set; }
        public bool IsMapped { get; set; }
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public string ItemCode { get; set; }
        public int? SubLedgerId { get; set; }
        public string SubLedgerName { get; set; }
        public bool IsActive { get; set; }
        public int BillLedgerMappingId { get; set; }
        public string BillingType { get; set; }
        public static List<AccBillingLedgerMapping_DTO> MapDataTableToSingleObject(DataTable mappingDetail)
        {
            List<AccBillingLedgerMapping_DTO> retObj = new List<AccBillingLedgerMapping_DTO>();
            if (mappingDetail != null)
            {
                string strPatData = JsonConvert.SerializeObject(mappingDetail);
                List<AccBillingLedgerMapping_DTO> detail = JsonConvert.DeserializeObject<List<AccBillingLedgerMapping_DTO>>(strPatData);
                retObj = detail;
            }
            return retObj;
        }
    }
}
