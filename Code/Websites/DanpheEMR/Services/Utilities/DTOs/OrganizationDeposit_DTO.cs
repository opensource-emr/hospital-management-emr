using DanpheEMR.ServerModel;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System;

namespace DanpheEMR.Services.Utilities.DTOs
{
    public class OrganizationDeposit_DTO
    {
        public int DepositId { get; set; }
        public int? PatientId { get; set; }
        public string TransactionType { get; set; }
        public decimal InAmount { get; set; }
        public decimal OutAmount { get; set; }
        public string Remarks { get; set; }
        public int DepositHeadId { get; set; }
        public int CreditOrganizationId { get; set; }
        public string ModuleName { get; set; }
        public string OrganizationOrPatient { get; set; }
        public string PaymentMode { get; set; }
        public string PaymentDetails { get; set; }
        public decimal DepositBalance { get; set; }
        public string CareOf { get; set; }
        public string CreditOrganizationName { get; set; }
        public List<EmpCashTransactionModel> empCashTransactionModel { get; set; }
    }
}
