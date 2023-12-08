using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel.ClaimManagementModels;
using DanpheEMR.Services.ClaimManagement.DTOs;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;
using System.IO;
using DanpheEMR.ServerModel.BillingModels.POS;
using DanpheEMR.ServerModel.PharmacyModels;

namespace DanpheEMR.Services.ClaimManagement
{
    public class ClaimManagementService : IClaimManagementService
    {
        #region Get
        public List<CreditOrganizationDTO> GetInsuranceApplicableCreditOrganizations(ClaimManagementDbContext _claimManagementDbContext)
        {
            var InsuranceApplicableCreditOrganizations = new List<CreditOrganizationDTO>();
            InsuranceApplicableCreditOrganizations = (from claimMangnt in _claimManagementDbContext.CreditOrganization
                                                      where claimMangnt.IsClaimManagementApplicable == true
                                                      select new CreditOrganizationDTO
                                                      {
                                                          OrganizationId = claimMangnt.OrganizationId,
                                                          OrganizationName = claimMangnt.OrganizationName,
                                                          IsActive = claimMangnt.IsActive,
                                                          CreatedOn = claimMangnt.CreatedOn,
                                                          CreatedBy = claimMangnt.CreatedBy,
                                                          ModifiedOn = claimMangnt.ModifiedOn,
                                                          ModifiedBy = claimMangnt.ModifiedBy,
                                                          IsDefault = claimMangnt.IsDefault,
                                                          IsClaimManagementApplicable = claimMangnt.IsClaimManagementApplicable,
                                                          IsClaimCodeCompulsory = claimMangnt.IsClaimCodeCompulsory,
                                                          IsClaimCodeAutoGenerate = claimMangnt.IsClaimCodeAutoGenerate,
                                                          DisplayName = claimMangnt.DisplayName,
                                                      }).ToList();
            return InsuranceApplicableCreditOrganizations;
        }

        public object GetBillForClaimReview(DateTime FromDate, DateTime ToDate, int CreditOrganizationId, ClaimManagementDbContext _claimManagementgDbContext)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@FromDate", FromDate),
                        new SqlParameter("@ToDate", ToDate),
                        new SqlParameter("@CreditOrganizationId", CreditOrganizationId),
                    };
            DataTable dt = DALFunctions.GetDataTableFromStoredProc("SP_INS_InsuranceBillReview", paramList, _claimManagementgDbContext);
            return dt;
        }

        public object CheckIsClaimCodeAvailable(Int64 ClaimCode, ClaimManagementDbContext _claimManagementgDbContext)
        {
            if (ClaimCode != 0)
            {
                var result = _claimManagementgDbContext.InsuranceClaim.Any(a => a.ClaimCode == ClaimCode);
                //if (!result)
                //{
                //    result = _claimManagementgDbContext.BillingCreditBillStatus.Any(a => a.ClaimCode == ClaimCode && a.PatientId != PatientId);
                //    if (!result)
                //    {
                //        result = _claimManagementgDbContext.PharmacyCreditBillStatus.Any(a => a.ClaimCode == ClaimCode && a.PatientId != PatientId);
                //    }
                //}
                return !result;
            }
            else
            {
                return false;
            }
        }

        public object GetPendingClaims(int CreditOrganizationId, ClaimManagementDbContext _claimManagementgDbContext)
        {
            //var result = _claimManagementgDbContext.InsuranceClaim.Where(a => a.CreditOrganizationId == CreditOrganizationId && a.ClaimStatus == ENUM_ClaimManagement_ClaimStatus.Initiated).AsNoTracking().ToList();
            //return result;

            List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@CreditOrganizationId", CreditOrganizationId),
                    };
            DataTable dt = DALFunctions.GetDataTableFromStoredProc("SP_INS_PendingClaims", paramList, _claimManagementgDbContext);
            return dt;
        }

        public object GetInvoicesByClaimId(int ClaimSubmissionId, ClaimManagementDbContext _claimManagementDbContext)
        {
            var billingInvoices = _claimManagementDbContext.BillingCreditBillStatus.Where(bill => bill.ClaimSubmissionId == ClaimSubmissionId).Select(a => new
            ClaimBillReviewDTO
            {
                CreditStatusId = a.BillingCreditBillStatusId,
                ClaimSubmissionId = a.ClaimSubmissionId,
                InvoiceRefId = a.BillingTransactionId,
                InvoiceNo = a.InvoiceNoFormatted,
                InvoiceDate = a.InvoiceDate,
                TotalAmount = a.SalesTotalBillAmount - a.ReturnTotalBillAmount,
                NonClaimableAmount = a.NonClaimableAmount,
                IsClaimable = a.IsClaimable,
                CreditModule = ENUM_ClaimManagement_CreditModule.Billing,
                FiscalYearId = a.FiscalYearId
            }).AsNoTracking().ToList();

            var pharmacyInvoices = _claimManagementDbContext.PharmacyCreditBillStatus.Where(bill => bill.ClaimSubmissionId == ClaimSubmissionId).Select(a => new
            ClaimBillReviewDTO
            {
                CreditStatusId = a.PhrmCreditBillStatusId,
                ClaimSubmissionId = a.ClaimSubmissionId,
                InvoiceRefId = a.InvoiceId,
                InvoiceNo = a.InvoiceNoFormatted,
                InvoiceDate = a.InvoiceDate,
                TotalAmount = a.SalesTotalBillAmount - a.ReturnTotalBillAmount,
                NonClaimableAmount = a.NonClaimableAmount,
                IsClaimable = a.IsClaimable,
                CreditModule = ENUM_ClaimManagement_CreditModule.Pharmacy,
                FiscalYearId = a.FiscalYearId
            }).AsNoTracking().ToList();

            var result = billingInvoices.Union(pharmacyInvoices).OrderBy(a => a.InvoiceDate).ToList();
            return result;
        }

        public object GetDocumentForPreviewByFileId(int fileId, ClaimManagementDbContext _claimManagementgDbContext)
        {
            var selectedDocument = _claimManagementgDbContext.TXNUploadedFile.Where(doc => doc.FileId == fileId)
                                                                                 .Select(a => new
                                                                                 {
                                                                                     FileLocationFullPath = a.FileLocationFullPath,
                                                                                     FileExtension = a.FileExtension
                                                                                 })
                                                                                 .FirstOrDefault();
            byte[] fileArray = File.ReadAllBytes(selectedDocument.FileLocationFullPath);
            string BinaryData = Convert.ToBase64String(fileArray);
            return new { BinaryData, selectedDocument.FileExtension };
        }

        public object GetDocumentsByClaimCode(int ClaimCode, ClaimManagementDbContext _claimManagementDbContext)
        {
            var DocumentList = _claimManagementDbContext.TXNUploadedFile.Where(doc => doc.ClaimCode == ClaimCode).Select(a => new
            UploadedFileDTO
            {
                FileId = a.FileId,
                FileDisplayName = a.FileDisplayName,
                FileExtension = a.FileExtension,
                FileDescription = a.FileDescription,
                UploadedBy = a.UploadedBy,
                UploadedOn = a.UploadedOn,
                Size = a.Size
            }).ToList();
            return DocumentList;
        }

        public object GetPaymentPendingClaims(int CreditOrganizationId, ClaimManagementDbContext _claimManagementgDbContext)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@CreditOrganizationId", CreditOrganizationId),
                    };
            DataTable dt = DALFunctions.GetDataTableFromStoredProc("SP_INS_PaymentPendingClaims", paramList, _claimManagementgDbContext);
            return dt;
        }

        public object GetInsurancePayments(int ClaimSubmissionId, ClaimManagementDbContext _claimManagementgDbContext)
        {
            var result = _claimManagementgDbContext.InsuranceClaimPayment.Where(a => a.ClaimSubmissionId == ClaimSubmissionId).AsNoTracking().ToList();
            return result;
        }

        public object GetClaimDetailsForPreview(int ClaimSubmissionId, ClaimManagementDbContext _claimManagementgDbContext)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@ClaimSubmissionId", ClaimSubmissionId),
                    };
            DataSet dsClaimDetails = DALFunctions.GetDatasetFromStoredProc("SP_INS_GetClaimDetailsForPreview", paramList, _claimManagementgDbContext);
            DataTable dtHeaderDetails = dsClaimDetails.Tables[0];
            DataTable dtBillingDetails = dsClaimDetails.Tables[1];
            DataTable dtPharmacyDetails = dsClaimDetails.Tables[2];
            DataTable dtDocumentDetails = dsClaimDetails.Tables[3];
            var ClaimDetails = new
            {
                HeaderDetails = HeaderDetailsDTO.MapDataTableToSingleObject(dtHeaderDetails),
                BillingDetails = BillingDetailsDTO.MapDataTableToSingleObject(dtBillingDetails),
                PharmacyDetails = PharmacyDetailsDTO.MapDataTableToSingleObject(dtPharmacyDetails),
                DocumentDetails = DocumentDetailsDTO.MapDataTableToSingleObject(dtDocumentDetails)
            };
            return (ClaimDetails);
        }

        public object GetBillingCreditNotes(int BillingTransactionId, ClaimManagementDbContext _claimManagementgDbContext)
        {
            try
            {
                var entity = new object();
                entity = _claimManagementgDbContext.BILLInvoiceReturn.Where(a => a.BillingTransactionId == BillingTransactionId).Select(a => new
                {
                    CreditNoteNumber = a.CreditNoteNumber,
                    FiscalYearId = a.FiscalYearId
                }).ToList();
                return entity;
            }
            catch (Exception ex)
            {
                throw new Exception(ex + "No Results found for the given InvoiceRefId");
            }
        }

        public object GetPharmacyCreditNotes(int InvoiceId, ClaimManagementDbContext _claimManagementgDbContext)
        {
            try
            {
                var entity = new object();
                entity = _claimManagementgDbContext.PHRMInvoiceReturn.Where(a => a.InvoiceId == InvoiceId).Select(a => new
                {
                    CreditNoteNumber = a.CreditNoteId,
                    FiscalYearId = a.FiscalYearId,
                    InvoiceReturnId = a.InvoiceReturnId
                }).ToList();
                return entity;
            }
            catch (Exception ex)
            {
                throw new Exception(ex + "No Results found for the given InvoiceRefId");
            }
        }

        public object GetBillingCreditBillItems(int BillingTransactionId, ClaimManagementDbContext _claimManagementgDbContext)
        {
            try
            {
                List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@BillingTransactionId", BillingTransactionId)
                    };
                DataTable dt = DALFunctions.GetDataTableFromStoredProc("SP_INS_Claim_GetBillingCreditBillItems", paramList, _claimManagementgDbContext);
                return dt;
            }
            catch (Exception ex)
            {
                throw new Exception(ex + "No Results found for the given InvoiceRefId");
            }
        }

        public object GetPharmacyCreditBillItems(int PharmacyInvoiceId, ClaimManagementDbContext _claimManagementgDbContext)
        {
            try
            {
                List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@PharmacyInvoiceId", PharmacyInvoiceId)
                    };
                DataTable dt = DALFunctions.GetDataTableFromStoredProc("SP_INS_Claim_GetPharmacyCreditBillItems", paramList, _claimManagementgDbContext);
                return dt;
            }
            catch (Exception ex)
            {
                throw new Exception(ex + "No Results found for the given InvoiceRefId");
            }
        }

        public object GetApiIntegrationNameByOrganizationId(int OrganizationId, ClaimManagementDbContext _claimManagementgDbContext)
        {
            try
            {
               var apiIntegrationName = _claimManagementgDbContext.Schemes
                                                                  .Where(o => o.DefaultCreditOrganizationId == OrganizationId)
                                                                  .Select(a => new
                                                                  {
                                                                       a.ApiIntegrationName
                                                                  })
                                                                  .FirstOrDefault();
                return apiIntegrationName;
            }
            catch (Exception ex)
            {
                throw new Exception(ex + "No Results found for the given OrganizationId");
            }
        }

        #endregion

        #region Post
        public object SaveClaimScrubbing(RbacUser currentUser, List<ClaimBillReviewDTO> bills, ClaimManagementDbContext _claimManagementgDbContext)
        {
            using (var dbContextTransaction = _claimManagementgDbContext.Database.BeginTransaction())
            {
                try
                {
                    if (bills.Count > 0)
                    {
                        InsuranceClaim claim = new InsuranceClaim();
                        claim.PatientId = bills[0].PatientId;
                        claim.PatientCode = bills[0].HospitalNo;
                        claim.ClaimCode = bills[0].ClaimCode;
                        claim.MemberNumber = bills[0].MemberNo;
                        claim.SchemeId = bills[0].SchemeId;
                        claim.CreditOrganizationId = bills[0].CreditOrganizationId;
                        claim.ClaimRemarks = "";
                        claim.ClaimStatus = ENUM_ClaimManagement_ClaimStatus.Initiated;
                        claim.ApprovedAmount = 0;
                        claim.ClaimedAmount = 0;
                        claim.RejectedAmount = 0;
                        claim.TotalBillAmount = bills.Sum(a => a.TotalAmount);
                        claim.NonClaimableAmount = bills.Sum(a => a.NonClaimableAmount);
                        claim.ClaimableAmount = claim.TotalBillAmount - claim.NonClaimableAmount;
                        claim.ClaimSubmittedOn = DateTime.Now;
                        claim.ClaimSubmittedBy = currentUser.EmployeeId;
                        _claimManagementgDbContext.InsuranceClaim.Add(claim);
                        _claimManagementgDbContext.SaveChanges();

                        bills.ForEach(bil =>
                        {
                            if (bil.CreditModule == ENUM_ClaimManagement_CreditModule.Billing)
                            {
                                var entity = _claimManagementgDbContext.BillingCreditBillStatus.Where(a => a.BillingCreditBillStatusId == bil.CreditStatusId).FirstOrDefault();
                                if (entity != null)
                                {
                                    entity.ClaimSubmissionId = claim.ClaimSubmissionId;
                                    entity.SettlementStatus = ENUM_ClaimManagement_SettlementStatus.Completed;
                                    entity.ModifiedBy = currentUser.EmployeeId;
                                    entity.ModifiedOn = DateTime.Now;
                                    _claimManagementgDbContext.Entry(entity).State = EntityState.Modified;
                                    _claimManagementgDbContext.SaveChanges();
                                }
                            }
                            else
                            {
                                var entity = _claimManagementgDbContext.PharmacyCreditBillStatus.Where(a => a.PhrmCreditBillStatusId == bil.CreditStatusId).FirstOrDefault();
                                if (entity != null)
                                {
                                    entity.ClaimSubmissionId = claim.ClaimSubmissionId;
                                    entity.SettlementStatus = ENUM_ClaimManagement_SettlementStatus.Completed;
                                    entity.ModifiedBy = currentUser.EmployeeId;
                                    entity.ModifiedOn = DateTime.Now;
                                    _claimManagementgDbContext.Entry(entity).State = EntityState.Modified;
                                    _claimManagementgDbContext.SaveChanges();
                                }
                            }
                        });
                    }
                    dbContextTransaction.Commit();
                    return true;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }
        public object InsuranceClaimPayment(RbacUser currentUser, ClaimPaymentDTO paymentObject, ClaimManagementDbContext _claimManagementgDbContext)
        {
            using (var dbContextTransaction = _claimManagementgDbContext.Database.BeginTransaction())
            {
                try
                {
                    if (paymentObject != null)
                    {
                        InsuranceClaimPayment paymentEntity = new InsuranceClaimPayment();
                        paymentEntity.ReceivedAmount = paymentObject.ReceivedAmount;
                        paymentEntity.ServiceCommission = paymentObject.ServiceCommission;
                        paymentEntity.Remarks = paymentObject.Remarks;
                        paymentEntity.ChequeNumber = paymentObject.ChequeNumber;
                        paymentEntity.BankName = paymentObject.BankName;
                        paymentEntity.ClaimCode = paymentObject.ClaimCode;
                        paymentEntity.CreditOrganizationId = paymentObject.CreditOrganizationId;
                        paymentEntity.ClaimSubmissionId = paymentObject.ClaimSubmissionId;
                        paymentEntity.ReceivedOn = DateTime.Now;
                        paymentEntity.ReceivedBy = currentUser.EmployeeId;
                        paymentEntity.PaymentDetails = paymentObject.PaymentDetails;
                        _claimManagementgDbContext.InsuranceClaimPayment.Add(paymentEntity);
                        _claimManagementgDbContext.SaveChanges();
                    }
                    var claim = _claimManagementgDbContext.InsuranceClaim.Where(a => a.ClaimSubmissionId == paymentObject.ClaimSubmissionId).FirstOrDefault();
                    if (claim != null)
                    {
                        claim.ClaimStatus = ENUM_ClaimManagement_ClaimStatus.PartiallyPaid;
                        claim.ModifiedBy = currentUser.EmployeeId;
                        claim.ModifiedOn = DateTime.Now;
                        _claimManagementgDbContext.Entry(claim).State = EntityState.Modified;
                        _claimManagementgDbContext.SaveChanges();
                    }
                    dbContextTransaction.Commit();
                    return paymentObject;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }
        #endregion

        #region Put
        public object UpdateClaimableStatus(RbacUser currentUser, Boolean claimableStatus, List<ClaimBillReviewDTO> bill, ClaimManagementDbContext _claimManagementgDbContext)
        {
            using (var dbContextTransaction = _claimManagementgDbContext.Database.BeginTransaction())
            {
                try
                {
                    bill.ForEach(bil =>
                    {
                        if (bil.CreditModule == ENUM_ClaimManagement_CreditModule.Billing)
                        {
                            var entity = _claimManagementgDbContext.BillingCreditBillStatus.Where(a => a.BillingCreditBillStatusId == bil.CreditStatusId).FirstOrDefault();
                            if (entity != null)
                            {
                                entity.IsClaimable = claimableStatus;
                                entity.ModifiedBy = currentUser.EmployeeId;
                                entity.ModifiedOn = DateTime.Now;
                                _claimManagementgDbContext.Entry(entity).State = EntityState.Modified;
                                _claimManagementgDbContext.SaveChanges();
                            }
                        }
                        else
                        {
                            var entity = _claimManagementgDbContext.PharmacyCreditBillStatus.Where(a => a.PhrmCreditBillStatusId == bil.CreditStatusId).FirstOrDefault();
                            if (entity != null)
                            {
                                entity.IsClaimable = claimableStatus;
                                entity.ModifiedBy = currentUser.EmployeeId;
                                entity.ModifiedOn = DateTime.Now;
                                _claimManagementgDbContext.Entry(entity).State = EntityState.Modified;
                                _claimManagementgDbContext.SaveChanges();
                            }
                        }
                    });
                    dbContextTransaction.Commit();
                    return true;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        public object UpdateClaimableStatusOfClaimGeneratedInvoice(RbacUser currentUser, Boolean claimableStatus, ClaimBillReviewDTO bill, ClaimManagementDbContext _claimManagementgDbContext)
        {
            using (var dbContextTransaction = _claimManagementgDbContext.Database.BeginTransaction())
            {
                try
                {
                    if (bill != null)
                    {
                        if (bill.CreditModule == ENUM_ClaimManagement_CreditModule.Billing)
                        {
                            var entity = _claimManagementgDbContext.BillingCreditBillStatus.Where(a => a.BillingCreditBillStatusId == bill.CreditStatusId).FirstOrDefault();
                            if (entity != null)
                            {
                                entity.IsClaimable = claimableStatus;
                                entity.ModifiedBy = currentUser.EmployeeId;
                                entity.ModifiedOn = DateTime.Now;
                                _claimManagementgDbContext.Entry(entity).State = EntityState.Modified;
                                _claimManagementgDbContext.SaveChanges();
                            }
                        }
                        else if (bill.CreditModule == ENUM_ClaimManagement_CreditModule.Pharmacy)
                        {
                            var entity = _claimManagementgDbContext.PharmacyCreditBillStatus.Where(a => a.PhrmCreditBillStatusId == bill.CreditStatusId).FirstOrDefault();
                            if (entity != null)
                            {
                                entity.IsClaimable = claimableStatus;
                                entity.ModifiedBy = currentUser.EmployeeId;
                                entity.ModifiedOn = DateTime.Now;
                                _claimManagementgDbContext.Entry(entity).State = EntityState.Modified;
                                _claimManagementgDbContext.SaveChanges();
                            }
                        }

                        var claimEntity = _claimManagementgDbContext.InsuranceClaim.Where(a => a.ClaimSubmissionId == bill.ClaimSubmissionId).FirstOrDefault();
                        if (claimEntity != null)
                        {
                            if (claimableStatus == true)
                            {
                                claimEntity.NonClaimableAmount -= (bill.TotalAmount - bill.NonClaimableAmount);
                                claimEntity.ClaimableAmount += (bill.TotalAmount - bill.NonClaimableAmount);
                                claimEntity.ModifiedBy = currentUser.EmployeeId;
                                claimEntity.ModifiedOn = DateTime.Now;
                                _claimManagementgDbContext.Entry(claimEntity).State = EntityState.Modified;
                            }
                            else if (claimableStatus == false)
                            {
                                claimEntity.NonClaimableAmount += (bill.TotalAmount - bill.NonClaimableAmount);
                                claimEntity.ClaimableAmount -= (bill.TotalAmount - bill.NonClaimableAmount);
                                claimEntity.ModifiedBy = currentUser.EmployeeId;
                                claimEntity.ModifiedOn = DateTime.Now;
                                _claimManagementgDbContext.Entry(claimEntity).State = EntityState.Modified;
                            }
                            _claimManagementgDbContext.SaveChanges();
                        }
                    }
                    dbContextTransaction.Commit();
                    return true;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        public object RevertInvoiceToBillPreview(RbacUser currentUser, ClaimBillReviewDTO bill, ClaimManagementDbContext _claimManagementgDbContext)
        {
            using (var dbContextTransaction = _claimManagementgDbContext.Database.BeginTransaction())
            {
                try
                {
                    if (bill != null)
                    {
                        if (bill.CreditModule == ENUM_ClaimManagement_CreditModule.Billing)
                        {
                            var entity = _claimManagementgDbContext.BillingCreditBillStatus.Where(a => a.BillingCreditBillStatusId == bill.CreditStatusId).FirstOrDefault();
                            if (entity != null)
                            {
                                entity.ClaimSubmissionId = null;
                                entity.SettlementStatus = ENUM_ClaimManagement_SettlementStatus.Pending;
                                entity.ModifiedBy = currentUser.EmployeeId;
                                entity.ModifiedOn = DateTime.Now;
                                _claimManagementgDbContext.Entry(entity).State = EntityState.Modified;
                                _claimManagementgDbContext.SaveChanges();
                            }
                        }
                        else
                        {
                            var entity = _claimManagementgDbContext.PharmacyCreditBillStatus.Where(a => a.PhrmCreditBillStatusId == bill.CreditStatusId).FirstOrDefault();
                            if (entity != null)
                            {
                                entity.ClaimSubmissionId = null;
                                entity.SettlementStatus = ENUM_ClaimManagement_SettlementStatus.Pending;
                                entity.ModifiedBy = currentUser.EmployeeId;
                                entity.ModifiedOn = DateTime.Now;
                                _claimManagementgDbContext.Entry(entity).State = EntityState.Modified;
                                _claimManagementgDbContext.SaveChanges();
                            }
                        }

                        var claimEntity = _claimManagementgDbContext.InsuranceClaim.Where(a => a.ClaimSubmissionId == bill.ClaimSubmissionId).FirstOrDefault();
                        if (claimEntity != null)
                        {
                            claimEntity.TotalBillAmount -= bill.TotalAmount;
                            claimEntity.NonClaimableAmount -= bill.NonClaimableAmount;
                            claimEntity.ClaimableAmount -= (bill.TotalAmount - bill.NonClaimableAmount);
                            claimEntity.ModifiedBy = currentUser.EmployeeId;
                            claimEntity.ModifiedOn = DateTime.Now;
                            _claimManagementgDbContext.Entry(claimEntity).State = EntityState.Modified;
                            _claimManagementgDbContext.SaveChanges();
                        }
                    }
                    dbContextTransaction.Commit();
                    return true;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        public object SubmitClaim(RbacUser currentUser, SubmitedClaimDTO claimDTO, Boolean IsForDraft, ClaimManagementDbContext _claimManagementgDbContext)
        {
            using (var dbContextTransaction = _claimManagementgDbContext.Database.BeginTransaction())
            {
                try
                {
                    var claim = _claimManagementgDbContext.InsuranceClaim.Where(a => a.ClaimSubmissionId == claimDTO.claim.ClaimSubmissionId).FirstOrDefault();
                    if (claim != null)
                    {
                        claim.ClaimedAmount = claimDTO.claim.ClaimedAmount;
                        claim.ClaimStatus = IsForDraft ? ENUM_ClaimManagement_ClaimStatus.InReview : ENUM_ClaimManagement_ClaimStatus.PaymentPending;
                        claim.ClaimRemarks = claimDTO.claim.ClaimRemarks;
                        claim.ClaimableAmount = claimDTO.claim.ClaimableAmount;
                        claim.NonClaimableAmount = claimDTO.claim.NonClaimableAmount;
                        claim.TotalBillAmount = claimDTO.claim.TotalBillAmount;
                        claim.ModifiedBy = currentUser.EmployeeId;
                        claim.ModifiedOn = DateTime.Now;
                        _claimManagementgDbContext.Entry(claim).State = EntityState.Modified;
                        _claimManagementgDbContext.SaveChanges();
                    }
                    if (claimDTO.files.Count > 0)
                    {
                        var location = (from dbc in _claimManagementgDbContext.CoreCfgParameter
                                        where dbc.ParameterGroupName == "ClaimManagement"
                                        && dbc.ParameterName == "InsuranceClaimFileUploadLocation"
                                        select dbc.ParameterValue).FirstOrDefault();

                        List<dynamic> existingFiles = new List<dynamic>();
                        existingFiles.AddRange(_claimManagementgDbContext.TXNUploadedFile
                                                                         .Where(a => a.ClaimCode == claimDTO.claim.ClaimCode)
                                                                         .ToList());
                        if (!Directory.Exists(location))
                        {
                            Directory.CreateDirectory(location);
                        }

                        var fileCounter = 1;

                        foreach (var doc in claimDTO.files)
                        {
                            existingFiles.RemoveAll(f => f.FileId == doc.FileId);

                            var matchingFile = _claimManagementgDbContext.TXNUploadedFile
                                                                         .Where(a => a.FileId == doc.FileId)
                                                                         .FirstOrDefault();

                            if (matchingFile != null)
                            {
                                matchingFile.FileDescription = doc.FileDescription;
                                _claimManagementgDbContext.SaveChanges();
                            }
                            else
                            {
                                string filename = claim.PatientCode.ToString() + "_" + claim.ClaimCode.ToString() + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + "_" + fileCounter.ToString();
                                string imgPath = Path.Combine(location, (filename + Path.GetExtension(doc.FileDisplayName)));
                                byte[] imageBytes = Convert.FromBase64String(doc.BinaryData);
                                File.WriteAllBytes(imgPath, imageBytes);

                                TXNUploadedFile file = new TXNUploadedFile();

                                file.FileDisplayName = doc.FileDisplayName;
                                file.FileName = filename;
                                file.FileId = doc.FileId;
                                file.FileExtension = doc.FileExtension;
                                file.FileLocationFullPath = imgPath;
                                file.FileDescription = doc.FileDescription;
                                file.UploadedBy = currentUser.EmployeeId;
                                file.UploadedOn = DateTime.Now;
                                file.ClaimCode = claimDTO.claim.ClaimCode;
                                file.PatientId = claimDTO.claim.PatientId;
                                file.SystemFeatureName = ENUM_FileUpload_SystemFeatureName.InsuranceClaim;
                                file.IsActive = true;
                                file.ReferenceNumber = claimDTO.claim.ClaimSubmissionId;
                                file.ReferenceEntityType = ENUM_FileUpload_ReferenceEntityType.InsuranceClaim;
                                file.PatientVisitId = null;
                                file.Size = doc.Size;

                                fileCounter++;

                                _claimManagementgDbContext.TXNUploadedFile.Add(file);
                                _claimManagementgDbContext.SaveChanges();
                            }
                        }

                        if (existingFiles != null)
                        {
                            foreach (TXNUploadedFile files in existingFiles)
                            {
                                var fileTobeRemoved = _claimManagementgDbContext.TXNUploadedFile
                                                                                .Where(a => a.FileId == files.FileId)
                                                                                .FirstOrDefault();
                                var FileLocationFullPath = fileTobeRemoved.FileLocationFullPath;
                                if (fileTobeRemoved != null)
                                {
                                    _claimManagementgDbContext.TXNUploadedFile.Remove(fileTobeRemoved);
                                    _claimManagementgDbContext.SaveChanges();

                                    File.Delete(FileLocationFullPath);
                                }
                            }
                        }
                    }
                    else if (claimDTO.files.Count == 0)
                    {
                        var existingFiles = _claimManagementgDbContext.TXNUploadedFile
                                                    .Where(a => a.ClaimCode == claimDTO.claim.ClaimCode)
                                                    .ToList();
                        if (existingFiles != null)
                        {
                            _claimManagementgDbContext.TXNUploadedFile.RemoveRange(existingFiles);
                            _claimManagementgDbContext.SaveChanges();

                            foreach (TXNUploadedFile file in existingFiles)
                            {
                                File.Delete(file.FileLocationFullPath);
                            }
                        }
                    }
                    dbContextTransaction.Commit();
                    return true;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        public object UpdateClaimCodeOfInvoices(RbacUser currentUser, Int64 claimCode, List<ClaimBillReviewDTO> bill, ClaimManagementDbContext _claimManagementgDbContext)
        {
            using (var dbContextTransaction = _claimManagementgDbContext.Database.BeginTransaction())
            {
                try
                {
                    bill.ForEach(bil =>
                    {
                        if (bil.CreditModule == ENUM_ClaimManagement_CreditModule.Billing)
                        {
                            var entity = _claimManagementgDbContext.BillingCreditBillStatus.Where(a => a.BillingCreditBillStatusId == bil.CreditStatusId).FirstOrDefault();
                            if (entity != null)
                            {
                                entity.ClaimCode = claimCode;
                                entity.ModifiedBy = currentUser.EmployeeId;
                                entity.ModifiedOn = DateTime.Now;
                                _claimManagementgDbContext.Entry(entity).State = EntityState.Modified;
                                _claimManagementgDbContext.SaveChanges();
                            }
                        }
                        else
                        {
                            var entity = _claimManagementgDbContext.PharmacyCreditBillStatus.Where(a => a.PhrmCreditBillStatusId == bil.CreditStatusId).FirstOrDefault();
                            if (entity != null)
                            {
                                entity.ClaimCode = claimCode;
                                entity.ModifiedBy = currentUser.EmployeeId;
                                entity.ModifiedOn = DateTime.Now;
                                _claimManagementgDbContext.Entry(entity).State = EntityState.Modified;
                                _claimManagementgDbContext.SaveChanges();
                            }
                        }
                    });
                    dbContextTransaction.Commit();
                    return true;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        public object UpdateApprovedAndRejectedAmount (RbacUser currentUser, PendingClaimDTO claimObject, ClaimManagementDbContext _claimManagementgDbContext)
        {
            using (var dbContextTransaction = _claimManagementgDbContext.Database.BeginTransaction())
            {
                try
                {
                    var claim = _claimManagementgDbContext.InsuranceClaim.Where(a => a.ClaimSubmissionId == claimObject.ClaimSubmissionId).FirstOrDefault();
                    if (claim != null)
                    {
                        claim.ApprovedAmount = claimObject.ApprovedAmount;
                        claim.RejectedAmount = claimObject.RejectedAmount;
                        claim.ModifiedBy = currentUser.EmployeeId;
                        claim.ModifiedOn = DateTime.Now;
                        _claimManagementgDbContext.Entry(claim).State = EntityState.Modified;
                        _claimManagementgDbContext.SaveChanges();
                    }
                    dbContextTransaction.Commit();
                    return claim;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        public object ConcludeClaim(RbacUser currentUser, int ClaimSubmissionId, ClaimManagementDbContext _claimManagementgDbContext)
        {
            using (var dbContextTransaction = _claimManagementgDbContext.Database.BeginTransaction())
            {
                try
                {
                    var claim = _claimManagementgDbContext.InsuranceClaim.Where(a => a.ClaimSubmissionId == ClaimSubmissionId).FirstOrDefault();
                    if (claim != null)
                    {
                        claim.ClaimStatus = ENUM_ClaimManagement_ClaimStatus.Settled;
                        claim.ModifiedBy = currentUser.EmployeeId;
                        claim.ModifiedOn = DateTime.Now;
                        _claimManagementgDbContext.Entry(claim).State = EntityState.Modified;
                        _claimManagementgDbContext.SaveChanges();
                    }
                    dbContextTransaction.Commit();
                    return true;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        public object RevertClaimToBackToClaimScrubbing(RbacUser currentUser, int ClaimSubmissionId, ClaimManagementDbContext _claimManagementDbContext)
        {
            using (var dbContextTransaction = _claimManagementDbContext.Database.BeginTransaction())
            {
                try
                {
                    var isPaymentInitiated = _claimManagementDbContext.InsuranceClaimPayment.Any(payment => payment.ClaimSubmissionId == ClaimSubmissionId);
                    if (isPaymentInitiated)
                    {
                        throw new Exception("Some Payments is alredy done against this claim, therefore unable to revert this claim back to claim scrubbing.");
                    }
                    var claim = _claimManagementDbContext.InsuranceClaim.Where(a => a.ClaimSubmissionId == ClaimSubmissionId).FirstOrDefault();
                    if (claim != null)
                    {
                        claim.ClaimStatus = ENUM_ClaimManagement_ClaimStatus.Initiated;
                        claim.NonClaimableAmount = 0;
                        claim.RejectedAmount = 0;
                        claim.ApprovedAmount = 0;
                        claim.ClaimedAmount = 0;
                        claim.ModifiedBy = currentUser.EmployeeId;
                        claim.ModifiedOn = DateTime.Now;
                        _claimManagementDbContext.Entry(claim).State = EntityState.Modified;
                        _claimManagementDbContext.SaveChanges();
                    }
                    dbContextTransaction.Commit();
                    return true;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        public object UpdateBillingCreditItemClaimableStatus(RbacUser currentUser, BillingCreditBillItemDTO BillingCreditBillItemDTO, ClaimManagementDbContext _claimManagementgDbContext)
        {
            using (var dbContextTransaction = _claimManagementgDbContext.Database.BeginTransaction())
            {
                try
                {
                    var matchingCreditBillItem = _claimManagementgDbContext.BillingCreditBillItemStatus.Where(a => a.BillingCreditBillItemStatusId == BillingCreditBillItemDTO.BillingCreditBillItemStatusId).FirstOrDefault();
                    if (matchingCreditBillItem == null)
                    {
                        BillingTransactionCreditBillItemStatusModel NewBillingCreditBillItem = new BillingTransactionCreditBillItemStatusModel();
                        NewBillingCreditBillItem.BillingCreditBillStatusId = BillingCreditBillItemDTO.BillingCreditBillStatusId;
                        NewBillingCreditBillItem.BillingTransactionId = BillingCreditBillItemDTO.BillingTransactionId;
                        NewBillingCreditBillItem.BillingTransactionItemId = BillingCreditBillItemDTO.BillingTransactionItemId;
                        NewBillingCreditBillItem.ServiceDepartmentId = BillingCreditBillItemDTO.ServiceDepartmentId;
                        NewBillingCreditBillItem.ServiceItemId = BillingCreditBillItemDTO.ServiceItemId;
                        NewBillingCreditBillItem.NetTotalAmount = BillingCreditBillItemDTO.NetTotalAmount;
                        NewBillingCreditBillItem.IsClaimable = BillingCreditBillItemDTO.IsClaimable;
                        NewBillingCreditBillItem.CreatedBy = currentUser.EmployeeId;
                        NewBillingCreditBillItem.CreatedOn = DateTime.Now;
                        NewBillingCreditBillItem.IsActive = true;
                        _claimManagementgDbContext.BillingCreditBillItemStatus.Add(NewBillingCreditBillItem);
                        _claimManagementgDbContext.SaveChanges();
                    }
                    else if (matchingCreditBillItem != null)
                    {
                        matchingCreditBillItem.IsClaimable = BillingCreditBillItemDTO.IsClaimable;
                        matchingCreditBillItem.ModifiedBy = currentUser.EmployeeId;
                        matchingCreditBillItem.ModifiedOn = DateTime.Now;
                        _claimManagementgDbContext.SaveChanges();
                    }
                    var matchingCreditBill = _claimManagementgDbContext.BillingCreditBillStatus.Where(a => a.BillingTransactionId == BillingCreditBillItemDTO.BillingTransactionId).FirstOrDefault();
                    if (matchingCreditBill != null)
                    {
                        var matchingInsuranceClaim = _claimManagementgDbContext.InsuranceClaim.Where(a => a.ClaimSubmissionId == matchingCreditBill.ClaimSubmissionId).FirstOrDefault();
                        if (BillingCreditBillItemDTO.IsClaimable == false)
                        {
                            matchingCreditBill.NonClaimableAmount += BillingCreditBillItemDTO.NetTotalAmount;
                            matchingCreditBill.NetReceivableAmount -= BillingCreditBillItemDTO.NetTotalAmount;
                            if ((matchingInsuranceClaim != null) && (matchingCreditBill.IsClaimable == true))
                            {
                                matchingInsuranceClaim.NonClaimableAmount += BillingCreditBillItemDTO.NetTotalAmount;
                                matchingInsuranceClaim.ClaimableAmount -= BillingCreditBillItemDTO.NetTotalAmount;
                            }
                        }
                        else if (BillingCreditBillItemDTO.IsClaimable == true)
                        {
                            matchingCreditBill.NonClaimableAmount -= BillingCreditBillItemDTO.NetTotalAmount;
                            matchingCreditBill.NetReceivableAmount += BillingCreditBillItemDTO.NetTotalAmount;
                            if ((matchingInsuranceClaim != null) && (matchingCreditBill.IsClaimable == true))
                            {
                                matchingInsuranceClaim.NonClaimableAmount -= BillingCreditBillItemDTO.NetTotalAmount;
                                matchingInsuranceClaim.ClaimableAmount += BillingCreditBillItemDTO.NetTotalAmount;
                            }
                        }
                    }
                    _claimManagementgDbContext.SaveChanges();

                    dbContextTransaction.Commit();
                    return matchingCreditBill.NonClaimableAmount;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        public object UpdatePharmacyCreditItemClaimableStatus(RbacUser currentUser, PharmacyCreditBillItemDTO PharmacyCreditBillItemDTO, ClaimManagementDbContext _claimManagementgDbContext)
        {
            using (var dbContextTransaction = _claimManagementgDbContext.Database.BeginTransaction())
            {
                try
                {
                    var matchingCreditBillItem = _claimManagementgDbContext.PharmacyCreditBillItemStatus.Where(a => a.PhrmCreditBillItemStatusId == PharmacyCreditBillItemDTO.PhrmCreditBillItemStatusId).FirstOrDefault();
                    if (matchingCreditBillItem == null)
                    {
                        PHRMTransactionCreditBillItemStatusModel NewPharmacyCreditBillItem = new PHRMTransactionCreditBillItemStatusModel();
                        NewPharmacyCreditBillItem.PhrmCreditBillStatusId = PharmacyCreditBillItemDTO.PhrmCreditBillStatusId;
                        NewPharmacyCreditBillItem.InvoiceId = PharmacyCreditBillItemDTO.InvoiceId;
                        NewPharmacyCreditBillItem.InvoiceItemId = PharmacyCreditBillItemDTO.InvoiceItemId;
                        NewPharmacyCreditBillItem.ItemId = PharmacyCreditBillItemDTO.ItemId;
                        NewPharmacyCreditBillItem.NetTotalAmount = PharmacyCreditBillItemDTO.NetTotalAmount;
                        NewPharmacyCreditBillItem.IsClaimable = PharmacyCreditBillItemDTO.IsClaimable;
                        NewPharmacyCreditBillItem.CreatedBy = currentUser.EmployeeId;
                        NewPharmacyCreditBillItem.CreatedOn = DateTime.Now;
                        NewPharmacyCreditBillItem.IsActive = true;
                        _claimManagementgDbContext.PharmacyCreditBillItemStatus.Add(NewPharmacyCreditBillItem);
                        _claimManagementgDbContext.SaveChanges();
                    }
                    else if (matchingCreditBillItem != null)
                    {
                        matchingCreditBillItem.IsClaimable = PharmacyCreditBillItemDTO.IsClaimable;
                        matchingCreditBillItem.ModifiedBy = currentUser.EmployeeId;
                        matchingCreditBillItem.ModifiedOn = DateTime.Now;
                        _claimManagementgDbContext.SaveChanges();
                    }
                    var matchingCreditBill = _claimManagementgDbContext.PharmacyCreditBillStatus.Where(a => a.InvoiceId == PharmacyCreditBillItemDTO.InvoiceId).FirstOrDefault();
                    if(matchingCreditBill != null)
                    {
                        var matchingInsuranceClaim = _claimManagementgDbContext.InsuranceClaim.Where(a => a.ClaimSubmissionId == matchingCreditBill.ClaimSubmissionId).FirstOrDefault();
                        if (PharmacyCreditBillItemDTO.IsClaimable == false)
                        {
                            matchingCreditBill.NonClaimableAmount += PharmacyCreditBillItemDTO.NetTotalAmount;
                            matchingCreditBill.NetReceivableAmount -= PharmacyCreditBillItemDTO.NetTotalAmount;
                            if ((matchingInsuranceClaim != null) && (matchingCreditBill.IsClaimable == true))
                            {
                                matchingInsuranceClaim.NonClaimableAmount += PharmacyCreditBillItemDTO.NetTotalAmount;
                                matchingInsuranceClaim.ClaimableAmount -= PharmacyCreditBillItemDTO.NetTotalAmount;
                            }
                        }
                        else if (PharmacyCreditBillItemDTO.IsClaimable == true)
                        {
                            matchingCreditBill.NonClaimableAmount -= PharmacyCreditBillItemDTO.NetTotalAmount;
                            matchingCreditBill.NetReceivableAmount += PharmacyCreditBillItemDTO.NetTotalAmount;
                            if ((matchingInsuranceClaim != null) && (matchingCreditBill.IsClaimable == true))
                            {
                                matchingInsuranceClaim.NonClaimableAmount -= PharmacyCreditBillItemDTO.NetTotalAmount;
                                matchingInsuranceClaim.ClaimableAmount += PharmacyCreditBillItemDTO.NetTotalAmount;
                            }
                        }
                    }
                    _claimManagementgDbContext.SaveChanges();

                    dbContextTransaction.Commit();
                    return matchingCreditBill.NonClaimableAmount;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        public object UpdateInsuranceClaimPayment(RbacUser currentUser, ClaimPaymentDTO paymentObject, ClaimManagementDbContext _claimManagementgDbContext)
        {
            using (var dbContextTransaction = _claimManagementgDbContext.Database.BeginTransaction())
            {
                try
                {
                    if (paymentObject != null)
                    {
                        InsuranceClaimPayment paymentEntity = _claimManagementgDbContext.InsuranceClaimPayment.Where(a => a.ClaimPaymentId == paymentObject.ClaimPaymentId).FirstOrDefault();
                        if (paymentEntity != null)
                        {
                            paymentEntity.ReceivedAmount = paymentObject.ReceivedAmount;
                            paymentEntity.ServiceCommission = paymentObject.ServiceCommission;
                            paymentEntity.Remarks = paymentObject.Remarks;
                            paymentEntity.ChequeNumber = paymentObject.ChequeNumber;
                            paymentEntity.BankName = paymentObject.BankName;
                            paymentEntity.ReceivedOn = DateTime.Now;
                            paymentEntity.ReceivedBy = currentUser.EmployeeId;
                            paymentEntity.PaymentDetails = paymentObject.PaymentDetails;
                            _claimManagementgDbContext.Entry(paymentEntity).State = EntityState.Modified;
                            _claimManagementgDbContext.SaveChanges();
                        }
                    }
                    dbContextTransaction.Commit();
                    return paymentObject;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        public object GetECHSPatientWithVisitInformation(string search, ClaimManagementDbContext _claimManagementgDbContext)
        {
           DataTable dtEchsPatient = DALFunctions.GetDataTableFromStoredProc("SP_PAT_ECHSPatientsListWithVisitinformation",
                    new List<SqlParameter>() { new SqlParameter("@SearchTxt", search) }, _claimManagementgDbContext);
            return dtEchsPatient;
        }

        #endregion
    }
}
