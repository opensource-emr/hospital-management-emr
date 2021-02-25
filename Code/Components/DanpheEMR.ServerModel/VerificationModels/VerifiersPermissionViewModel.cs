using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class VerifiersPermissionViewModel
    {
        public int PermissionId { get; set; }
        public int CurrentVerificationLevel { get; set; }
        public string PermissionName { get; set; }
        public string VerificationStatus { get; set; }
        public string VerificationRemarks { get; set; }
        public int VerificationId { get; set; }
        public DateTime VerifiedOn { get; set; }
        public EmployeeModel VerifiedBy { get; set; }

    }
}
