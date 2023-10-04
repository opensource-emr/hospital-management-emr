using DanpheEMR.ServerModel.ClaimManagementModels;
using System.Collections.Generic;

namespace DanpheEMR.Services.ClaimManagement.DTOs
{
    public class SubmitedClaimDTO
    {
        public InsuranceClaim claim { get; set; }
        public List<UploadedFileDTO> files { get; set; }
    }
}
