using DanpheEMR.DalLayer;
using System.Collections.Generic;
using System.Data.SqlClient;
using System;
using System.Data;
using DanpheEMR.Services.Utilities.DTOs;
using System.Linq;
using DanpheEMR.Security;
using DanpheEMR.Services.MarketingReferral.DTOs;
using DanpheEMR.Enums;
using DanpheEMR.ServerModel.Utilities;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.MarketingReferralModel;
using DanpheEMR.Services.BillSettings.DTOs;
using DocumentFormat.OpenXml.Wordprocessing;
using DanpheEMR.Controllers.Billing;
using iTextSharp.text.pdf;

namespace DanpheEMR.Services.MarketingReferral
{
    public class MarketingReferralService : IMarketingReferralService
    {
        public object GetInvoice(MarketingReferralDbContext _MarketingReferralDbContext, DateTime fromDate, DateTime toDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@FromDate", fromDate),
                        new SqlParameter("@ToDate", toDate),
                    };
            DataTable dt = DALFunctions.GetDataTableFromStoredProc("[SP_MKT_Transaction_Invoice]", paramList, _MarketingReferralDbContext);
            return dt;
        }
        public object GetBillDetails(MarketingReferralDbContext marketingReferralDbContext, int billTransactionId)
        {

            List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@BillingTransactionId", billTransactionId)
                    };
            DataTable dt = DALFunctions.GetDataTableFromStoredProc("[SP_MKT_Transaction_Bill_Details]", paramList, marketingReferralDbContext);
            return dt;
        }
        public object GetMarketingreferralDetailReport(MarketingReferralDbContext marketingReferralDbContext, DateTime fromDate, DateTime toDate, int? referringPartyId)
        {

            List<SqlParameter> paramList = new List<SqlParameter>() {
                  new SqlParameter("@FromDate", fromDate),
                        new SqlParameter("@ToDate", toDate),
                        new SqlParameter("@ReferringPartyId", referringPartyId)
                    };
            DataTable dt = DALFunctions.GetDataTableFromStoredProc("[SP_Marketing_Referral_Detail_Report]", paramList, marketingReferralDbContext);
            return dt;
        }
        public object GetReferralScheme(MarketingReferralDbContext marketingReferralDbContext)
        {
            var referralSchemeList = (from refr in marketingReferralDbContext.ReferralScheme
                                      orderby refr.CreatedOn descending
                                      select new ReferralScheme_DTO
                                      {
                                          ReferralSchemeId = refr.ReferralSchemeId,
                                          ReferralSchemeName = refr.ReferralSchemeName,
                                          ReferralPercentage = (int)refr.ReferralPercentage
                                      }).ToList();
            return referralSchemeList;

        }
        public object GetReferringParty(MarketingReferralDbContext marketingReferralDbContext)
        {
            var referringParties = (from refrparty in marketingReferralDbContext.ReferringParty
                                    join partyGroup in marketingReferralDbContext.ReferringPartyGroup
                                    on refrparty.ReferringPartyGroupId equals partyGroup.ReferringPartyGroupId
                                    join pOrg in marketingReferralDbContext.ReferringOrganization
                                    on refrparty.ReferringOrgId equals pOrg.ReferringOrganizationId
                                    orderby refrparty.CreatedOn descending
                                    select new ReferringParty_DTO
                                    {
                                        ReferringPartyId = refrparty.ReferringPartyId,
                                        ReferringPartyName = refrparty.ReferringPartyName,
                                        Address = refrparty.Address,
                                        VehicleNumber = refrparty.VehicleNumber,
                                        ContactNumber = refrparty.ContactNumber,
                                        AreaCode = refrparty.AreaCode,
                                        PANNumber = refrparty.PANNumber,
                                        IsActive = refrparty.IsActive,
                                        GroupName = partyGroup.GroupName,
                                        ReferringPartyGroupId = partyGroup.ReferringPartyGroupId,
                                        ReferringOrgId = pOrg.ReferringOrganizationId,
                                        ReferringOrganizationName = pOrg.ReferringOrganizationName,

                                    }).ToList();
            return referringParties;
        }
        public object GetReferringPartyGroup(MarketingReferralDbContext marketingReferralDbContext)
        {
            var referringParties = (from partyGroup in marketingReferralDbContext.ReferringPartyGroup
                                    orderby partyGroup.CreatedOn descending
                                    select new ReferringPartyGroup_DTO
                                    {
                                        ReferringPartyGroupId = partyGroup.ReferringPartyGroupId,
                                        GroupName = partyGroup.GroupName,
                                        Description = partyGroup.Description,
                                        CreatedBy = partyGroup.CreatedBy,
                                        CreatedOn = partyGroup.CreatedOn,
                                        ModifiedBy = partyGroup.ModifiedBy,
                                        ModifiedOn = partyGroup.ModifiedOn,
                                        IsActive = partyGroup.IsActive,
                                    }).ToList();
            return referringParties;
        }
        public Object GetReferringOrganizationList(MarketingReferralDbContext marketingReferralDbContext)
        {
            var referringParties = (from reforg in marketingReferralDbContext.ReferringOrganization
                                    orderby reforg.CreatedOn descending
                                    select new ReferringOrganization_DTO
                                    {
                                        ReferringOrganizationId = reforg.ReferringOrganizationId,
                                        ReferringOrganizationName = reforg.ReferringOrganizationName,
                                        Address = reforg.Address,
                                        ContactNo = reforg.ContactNo,
                                        ContactPersons = reforg.ContactPersons,
                                        CreatedOn = reforg.CreatedOn,
                                        CreatedBy = reforg.CreatedBy,
                                        IsActive = reforg.IsActive
                                    }).ToList();
            return referringParties;
        }

        public object GetAlreadyAddedCommission(MarketingReferralDbContext marketingReferralDbContext, int billTransactionId)
        {
            var addedComision = (from commission in marketingReferralDbContext.ReferralComission
                                 join sch in marketingReferralDbContext.ReferralScheme
                                 on commission.ReferralSchemeId equals sch.ReferralSchemeId
                                 join refParty in marketingReferralDbContext.ReferringParty
                                 on commission.ReferringPartyId equals refParty.ReferringPartyId
                                 join org in marketingReferralDbContext.ReferringOrganization
                                 on refParty.ReferringOrgId equals org.ReferringOrganizationId
                                 where commission.BillingTransactionId == billTransactionId
                                 orderby commission.CreatedOn descending
                                 select new ReferralCommission_DTO
                                 {
                                     BillingTransactionId = commission.BillingTransactionId,
                                     ReferralCommissionId = commission.ReferralCommissionId,
                                     ReferralSchemeName = sch.ReferralSchemeName,
                                     ReferralSchemeId = sch.ReferralSchemeId,
                                     ReferringPartyName = refParty.ReferringPartyName,
                                     ReferringPartyId = refParty.ReferringPartyId,
                                     AreaCode = refParty.AreaCode,
                                     ReferringOrganizationName = org.ReferringOrganizationName,
                                     VehicleNumber = refParty.VehicleNumber,
                                     Percentage = commission.Percentage,
                                     InvoiceTotalAmount = commission.InvoiceTotalAmount,
                                     Remarks = commission.Remarks,
                                     ReferralAmount= commission.ReferralAmount,
                                 }).ToList();
            return addedComision;
        }
        public object DeleteReferralCommission(MarketingReferralDbContext marketingReferralDbContext, int ReferralCommissionId)
        {
            var commissionToDelete = marketingReferralDbContext.ReferralComission.SingleOrDefault(c => c.ReferralCommissionId == ReferralCommissionId);

            if (commissionToDelete != null)
            {
                marketingReferralDbContext.ReferralComission.Remove(commissionToDelete);
                marketingReferralDbContext.SaveChanges();
            }
            return commissionToDelete;
        }
        public object UpdateActivateDeactivateOrganization(ReferringOrganization_DTO referringOrganization_DTO, RbacUser currentUser, MarketingReferralDbContext marketingReferralDbContext)
        {
            var organizationToUpdate = marketingReferralDbContext.ReferringOrganization
                .FirstOrDefault(a => a.ReferringOrganizationId == referringOrganization_DTO.ReferringOrganizationId);

            if (organizationToUpdate != null)
            {
                organizationToUpdate.IsActive = !organizationToUpdate.IsActive;

                marketingReferralDbContext.SaveChanges();
            }

            return organizationToUpdate;
        }
        public object ActivateDeactivateParty(ReferringParty_DTO referringParty_DTO, RbacUser currentUser, MarketingReferralDbContext marketingReferralDbContext)
        {
            var PartyToUpdate = marketingReferralDbContext.ReferringParty
                .FirstOrDefault(a => a.ReferringPartyId == referringParty_DTO.ReferringPartyId);

            if (PartyToUpdate != null)
            {
                PartyToUpdate.IsActive = !PartyToUpdate.IsActive;

                marketingReferralDbContext.SaveChanges();
            }

            return PartyToUpdate;
        }

        public object AddNewReferralComission(RbacUser currentUser, ReferralCommission_DTO referralCommission_DTO, MarketingReferralDbContext marketingReferralDbContext)
        {
            using (var dbContextTransaction = marketingReferralDbContext.Database.BeginTransaction())
            {
                try
                {
                    if (referralCommission_DTO != null)
                    {


                        ReferralComissionModel refCommission = new ReferralComissionModel();
                        refCommission.BillingTransactionId = referralCommission_DTO.BillingTransactionId;
                        refCommission.InvoiceNoFormatted = referralCommission_DTO.InvoiceNoFormatted;
                        refCommission.InvoiceDate = referralCommission_DTO.InvoiceDate;
                        refCommission.PatientId = referralCommission_DTO.PatientId;
                        refCommission.PatientVisitId = referralCommission_DTO.PatientVisitId;
                        refCommission.ReferringPartyId = referralCommission_DTO.ReferringPartyId;
                        refCommission.ReferralSchemeId = referralCommission_DTO.ReferralSchemeId;
                        refCommission.InvoiceTotalAmount = referralCommission_DTO.InvoiceTotalAmount;
                        refCommission.ReturnAmount = referralCommission_DTO.ReturnAmount;
                        refCommission.InvoiceNetAmount = referralCommission_DTO.InvoiceNetAmount;
                        refCommission.Percentage = referralCommission_DTO.Percentage;
                        refCommission.ReferralAmount = referralCommission_DTO.ReferralAmount;
                        refCommission.Remarks = referralCommission_DTO.Remarks;
                        refCommission.FiscalYearId = referralCommission_DTO.FiscalYearId;
                        refCommission.CreatedBy = currentUser.EmployeeId;
                        refCommission.CreatedOn = DateTime.Now;
                        refCommission.IsActive = true;
                        marketingReferralDbContext.ReferralComission.Add(refCommission);
                        marketingReferralDbContext.SaveChanges();
                    }
                    dbContextTransaction.Commit();
                    return referralCommission_DTO;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }
        public object AddNewReferringOrganization(RbacUser currentUser, ReferringOrganization_DTO referringOrganization_DTO, MarketingReferralDbContext marketingReferralDbContext)
        {
            using (var dbContextTransaction = marketingReferralDbContext.Database.BeginTransaction())
            {
                try
                {
                    if (referringOrganization_DTO != null)
                    {


                        ReferringOrganizationModel refOrg = new ReferringOrganizationModel();
                        refOrg.ReferringOrganizationName = referringOrganization_DTO.ReferringOrganizationName;
                        refOrg.Address = referringOrganization_DTO.Address;
                        refOrg.ContactNo = referringOrganization_DTO.ContactNo;
                        refOrg.ContactPersons = referringOrganization_DTO.ContactPersons;
                        refOrg.CreatedBy = currentUser.EmployeeId;
                        refOrg.CreatedOn = DateTime.Now;
                        refOrg.IsActive = true;
                        marketingReferralDbContext.ReferringOrganization.Add(refOrg);
                        marketingReferralDbContext.SaveChanges();
                    }
                    dbContextTransaction.Commit();
                    return referringOrganization_DTO;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        public object AddNewReferringParty(RbacUser currentUser, ReferringParty_DTO referringParty_DTO, MarketingReferralDbContext marketingReferralDbContext)
        {
            using (var dbContextTransaction = marketingReferralDbContext.Database.BeginTransaction())
            {
                try
                {
                    if (referringParty_DTO != null)
                    {


                        ReferringPartyModel refrParty = new ReferringPartyModel();
                        refrParty.ReferringPartyName = referringParty_DTO.ReferringPartyName;
                        refrParty.ReferringPartyGroupId = referringParty_DTO.ReferringPartyGroupId;
                        refrParty.ReferringOrgId = referringParty_DTO.ReferringOrgId;
                        refrParty.Address = referringParty_DTO.Address;
                        refrParty.VehicleNumber = referringParty_DTO.VehicleNumber;
                        refrParty.ContactNumber = referringParty_DTO.ContactNumber;
                        refrParty.AreaCode = referringParty_DTO.AreaCode;
                        refrParty.PANNumber = referringParty_DTO.PANNumber;
                        refrParty.CreatedBy = currentUser.EmployeeId;
                        refrParty.CreatedOn = DateTime.Now;
                        refrParty.IsActive = true;
                        marketingReferralDbContext.ReferringParty.Add(refrParty);
                        marketingReferralDbContext.SaveChanges();
                    }
                    dbContextTransaction.Commit();
                    return referringParty_DTO;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }
        public object UpdateReferringOrganization(RbacUser currentUser, ReferringOrganization_DTO referringOrganization_DTO, MarketingReferralDbContext marketingReferralDbContext)
        {
            if (referringOrganization_DTO == null)
            {
                return new Exception("Provided data should not be null");
            }

            var refOrg = marketingReferralDbContext.ReferringOrganization.Where(x => x.ReferringOrganizationId == referringOrganization_DTO.ReferringOrganizationId).FirstOrDefault();
            if (refOrg == null) return new Exception("No data found to update");

            refOrg.ModifiedOn = DateTime.Now;
            refOrg.ModifiedBy = currentUser.EmployeeId;
            refOrg.IsActive = true;
            refOrg.ReferringOrganizationName = referringOrganization_DTO.ReferringOrganizationName;
            refOrg.Address = referringOrganization_DTO.Address;
            refOrg.ContactNo = referringOrganization_DTO.ContactNo;
            refOrg.ContactPersons = referringOrganization_DTO.ContactPersons;

            marketingReferralDbContext.SaveChanges();
            return referringOrganization_DTO;
        }
        public object UpdateReferringParty(RbacUser currentUser, ReferringParty_DTO referringParty_DTO, MarketingReferralDbContext marketingReferralDbContext)
        {
            if (referringParty_DTO == null)
            {
                return new Exception("Provided data should not be null");
            }

            var refParty = marketingReferralDbContext.ReferringParty.Where(x => x.ReferringPartyId == referringParty_DTO.ReferringPartyId).FirstOrDefault();
            if (refParty == null) return new Exception("No data found to update");

            refParty.ModifiedOn = DateTime.Now;
            refParty.ModifiedBy = currentUser.EmployeeId;
            refParty.IsActive = true;
            refParty.ReferringPartyName = referringParty_DTO.ReferringPartyName;
            refParty.ReferringPartyGroupId = referringParty_DTO.ReferringPartyGroupId;
            refParty.ReferringOrgId = referringParty_DTO.ReferringOrgId;
            refParty.Address = referringParty_DTO.Address;
            refParty.VehicleNumber = referringParty_DTO.VehicleNumber;
            refParty.ContactNumber = referringParty_DTO.ContactNumber;
            refParty.AreaCode = referringParty_DTO.AreaCode;
            refParty.PANNumber = referringParty_DTO.PANNumber;
            marketingReferralDbContext.SaveChanges();
            return referringParty_DTO;
        }
    }
}
