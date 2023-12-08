using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.ServerModel.PatientModels;
using DanpheEMR.ServerModel.SSFModels;
using DanpheEMR.ServerModel.SSFModels.SSFResponse;
using DanpheEMR.Services.SSF.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Threading.Tasks;

namespace DanpheEMR.Services.SSF
{
    public interface ISSFService
    {
        Task<SSFPatientDetails> GetPatientDetails(SSFDbContext ssfDbContext,string patientNo);
        Task<List<EligibilityResponse>> GetElegibility(SSFDbContext ssfDbContext,string patientNo, string visitDate);
        Task<List<List<Company>>> GetEmployerList(SSFDbContext ssfDbContext, string SSFPatientUUID);
        Task<SSFClaimSubmissionOutput> SubmitClaim(SSFDbContext ssfDbContext, ClaimRoot claimRoot, SSFClaimResponseInfo responseInfo);
        Task<ClaimBookingResponse> BookClaim(SSFDbContext ssfDbContext, ClaimBookingRoot_DTO claimBooking, RbacUser currentUser);
        Task<EmployerRoot> GetClaimDetail(SSFDbContext ssfDbContext, string ClaimUUID);
        Task<object> GetClaimBookingDetail(SSFDbContext ssfDbContext, Int64 claimCode);
        Task<bool> IsClaimed(SSFDbContext sSFDbContext, Int64 claimCode, int patientId); //this will not hit SSF server, Krishna'15thNov'22
        Task<PatientSchemeMapModel> GetSSFPatientDetailLocally(SSFDbContext sSFDbContext, int patientId, int schemeId);
    }
}
