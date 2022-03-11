using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.ServerModel;
using Microsoft.Extensions.Options;

namespace DanpheEMR.Services
{
    public class VerificationService : IVerificationService
    {
        private WardSupplyDbContext _dbContext;
        private readonly string _connectionString;
        public VerificationService(IOptions<MyConfiguration> _config)
        {
            _connectionString = _config.Value.Connectionstring;
            _dbContext = new WardSupplyDbContext(_connectionString);
        }
        /// <summary>
        /// Gets the details of the requested Verification.
        /// </summary>
        /// <param name="VerificationId">The VerificationId of the required Verification</param>
        /// <returns>The verification details along with the history of the requested verification.</returns>
        public List<VerificationViewModel> GetVerificationViewModel(int VerificationId)
        {
            var VerificationList = new List<VerificationViewModel>();

            var verificationModel = _dbContext.VerificationModel.Find(VerificationId);
            var VerificationViewModel = new VerificationViewModel();
            VerificationViewModel.VerificationId = verificationModel.VerificationId;
            VerificationViewModel.VerifiedBy = _dbContext.Employees.Include(a => a.EmployeeRole).FirstOrDefault(a => a.EmployeeId == verificationModel.VerifiedBy);
            VerificationViewModel.VerifiedOn = verificationModel.VerifiedOn;
            VerificationViewModel.CurrentVerificationLevel = verificationModel.CurrentVerificationLevel;
            VerificationViewModel.VerificationStatus = verificationModel.VerificationStatus;
            VerificationViewModel.VerificationRemarks = verificationModel.VerificationRemarks;
            if (verificationModel.ParentVerificationId != null)
            {
                VerificationList = GetVerificationViewModel(verificationModel.ParentVerificationId ?? 0);
            }
            VerificationList.Add(VerificationViewModel);
            return VerificationList;
        }
        /// <summary>
        ///     Adds the given requisition approval status into verification table with CurrentVerificationLevel at 1.
        /// </summary>
        /// <param name="EmployeeId">The Id of the employee from EMP_Employee table.</param>
        /// <param name="MaxVerificationLevel">The maximum verification level set during substore creation.</param>
        /// <param name="VerificationStatus"> The status of the verification.</param>
        /// <returns>The verification id of the newly created verification.</returns>
        public int CreateVerification(int EmployeeId, int CurrentVerificationLevel, int CurrentVerificationLevelCount, int MaxVerificationLevel, string VerificationStatus, string VerificationRemarks, int? ParentVerificationId)
        {
            VerificationModel verification = new VerificationModel();
            verification.VerifiedBy = EmployeeId;
            verification.VerifiedOn = DateTime.Now;
            verification.CurrentVerificationLevel = CurrentVerificationLevel;
            verification.CurrentVerificationLevelCount = CurrentVerificationLevelCount;
            verification.MaxVerificationLevel = MaxVerificationLevel;
            verification.VerificationStatus = VerificationStatus;
            verification.VerificationRemarks = VerificationRemarks;
            verification.ParentVerificationId = ParentVerificationId;
            _dbContext.VerificationModel.Add(verification);
            _dbContext.SaveChanges();
            return verification.VerificationId;
        }
        /// <summary>
        /// Adds the given requisition approval status into verification table with the previous verification as its ParentVerificationId.
        /// </summary>
        /// <param name="VerificationId">The VerificationId of the previous level Verification.</param>
        /// <param name="EmployeeId">The Id of the employee from EMP_Employee table.</param>
        /// <param name="VerificationStatus">The status of the verification.</param>
        /// <returns>The verification id of the newly created verification if succeeds or Else 0.</returns>
        public int UpdateVerifcation(int VerificationId, int EmployeeId, string VerificationStatus)
        {
            var previousVerification = _dbContext.VerificationModel.Find(VerificationId);
            if (previousVerification.CurrentVerificationLevel < previousVerification.MaxVerificationLevel)
            {
                VerificationModel currentVerification = new VerificationModel();
                currentVerification.VerifiedBy = EmployeeId;
                currentVerification.VerifiedOn = DateTime.Now;
                currentVerification.CurrentVerificationLevel = previousVerification.CurrentVerificationLevel + 1;
                currentVerification.CurrentVerificationLevelCount = previousVerification.CurrentVerificationLevelCount + 1;
                currentVerification.MaxVerificationLevel = previousVerification.MaxVerificationLevel;
                currentVerification.ParentVerificationId = previousVerification.VerificationId;
                currentVerification.VerificationStatus = VerificationStatus;
                _dbContext.VerificationModel.Add(currentVerification);
                _dbContext.SaveChanges();
                return currentVerification.VerificationId;
            }
            else
            {
                return 0;
            }
        }

    }
}
