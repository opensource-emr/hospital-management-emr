using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.InsuranceModels
{
    /// <summary>
    /// This is required to assign new claimcode and maximum limit re
    /// </summary>
    public class INS_NewClaimCodeDTO
    {
        public Int64 NewClaimCode { get; set; }
        public bool IsMaxLimitReached { get; set; }
    }
}
