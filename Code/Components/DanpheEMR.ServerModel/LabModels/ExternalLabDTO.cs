using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.LabModels
{
    public class ExternalLabStatusUpdate_DTO
    {
        public string SelectedExternalLabStatusType { get; set; } = "";
        public List<int> RequisitionIds { get; set; } = new List<int>();
    }
}
