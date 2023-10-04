using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.Services.Utilities.DTOs;
using System;

namespace DanpheEMR.Services.Utilities
{
    public interface IUtilitiesService
    {
        object SaveSchemeRefundTransaction(RbacUser currentUser, SchemeRefund_DTO schemeRefundDTO, UtilitiesDbContext utilitiesDbContext);
        object GetSchemeRefundTransaction(UtilitiesDbContext utilitiesDbContext, DateTime fromDate, DateTime toDate);
         object GetSchemeRefundById(UtilitiesDbContext utilitiesDbContext, int receiptNo );

        object SaveVisitSchemeChange(RbacUser currentUser, VisitSchemeChangeHistory_DTO visitSchemeChangeHistory_DTO, UtilitiesDbContext utilitiesDbContext);
        object SaveOrganizationDeposit(RbacUser currentUser, OrganizationDeposit_DTO organizationDeposit_DTO, UtilitiesDbContext utilitiesDbContext);
        decimal GetOrganizationDepositBalance(UtilitiesDbContext utilitiesDbContext, int OrganizationId);
        object GetOrganizationDepositDetails(UtilitiesDbContext utilitiesDbContext, int DepositId);
        object GetPatientSchemeRefunds(UtilitiesDbContext utilitiesDbContext, int patientId);

    }
}
