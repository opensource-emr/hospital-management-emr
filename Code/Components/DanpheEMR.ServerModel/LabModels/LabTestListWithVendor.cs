using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class LabTestListWithVendor
    {
        public Int64 RequisitionId { get; set; }
        public string PatientName { get; set; }
        public string TestName { get; set; }
        public string VendorName { get; set; }
    }
}
