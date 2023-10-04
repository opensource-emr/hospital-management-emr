using System;
using System.Security.RightsManagement;

namespace DanpheEMR.ViewModel.Substore
{
    /// <summary> The output class for Requisitions Endpoint in WardSupply Controller </summary>
    public class WardSupplyRequisitionsDTO
    {
        public int RequisitionNo { get;set; }
        public string CreatedBy { get; set; }
        public DateTime? Date { get; set; }
        public string Status { get; set; }
        public int RequisitionId { get; set; }
        public bool IsNewDispatchAvailable { get; set; }
    }
}