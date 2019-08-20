using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    //not sure if we need this model anywhere.. check it and remove it if not needed: sud--22Jun'18
    public class LabPrintReportView
    {
        //this is the requisition Id..
        public Int64 LabNo { get; set; }
        public string PatientName { get; set; }
        public string PatientCode { get; set; }
        public DateTime DateOfBrith { get; set; }
        public string Gender { get; set; }
        public string BillNo { get; set; }
        public string ProviderName { get; set; }
        public int ProviderId { get; set; }
        public string LabCategory { get; set; }
        public string LabTestName { get; set; }
        public DateTime CreatedOn { get; set; }
        public List<TestComponent> Components { get; set; }

    }
    public class TestComponent
    {
        
        public string Component { get; set; }
        public string Value { get; set; }
        //this is the combination of range and unit..
        public string NormalRange { get; set; }
        //this remark is for lab guy..
        public string Remark { get; set; }
    }

}
