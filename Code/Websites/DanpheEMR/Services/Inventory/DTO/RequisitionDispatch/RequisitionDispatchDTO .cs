using DanpheEMR.ViewModel.ADT;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace DanpheEMR.Services.Inventory.DTO.RequisitionDispatch
{
    public class RequisitionDispatchDTO
    {
        public int RequisitionNo { get; set; }
        public string TargetStoreName { get; set; }
        public string SourceStoreName { get; set; }
        public string RequisitionDate { get; set; }
        public string RequestedByName { get; set; }
        public int? IssueNo { get; set; }
        public int? DispatchNo { get; set; }
        public string DispatchedByName { get; set; }
        public string DispatchedDate { get; set; }
        public string ReceivedBy { get; set; }
        public string ReceivedDate { get; set; }
        public string Remarks { get; set; }
        public bool IsDirectDispatched { get; set; }

        public static RequisitionDispatchDTO MapDataTableToSingleObject(DataTable reqDisp)
        {
            RequisitionDispatchDTO retObj = new RequisitionDispatchDTO();
            if (reqDisp != null)
            {
                string strReqDisp = JsonConvert.SerializeObject(reqDisp);
                List<RequisitionDispatchDTO> reqDispList = JsonConvert.DeserializeObject<List<RequisitionDispatchDTO>>(strReqDisp);
                if (reqDispList != null && reqDispList.Count > 0)
                {
                    retObj = reqDispList.First();
                }
            }
            return retObj;
        }
    }
}
