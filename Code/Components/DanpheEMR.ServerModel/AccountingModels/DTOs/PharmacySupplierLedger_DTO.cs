using System.ComponentModel.DataAnnotations.Schema;
using System;

namespace DanpheEMR.ServerModel.AccountingModels.DTOs
{
    public class PharmacySupplierLedger_DTO
    {
        public int SupplierId { get; set; }
        public string SupplierName { get; set; }
        public int LedgerId { get; set; }
        public string LedgerType { get; set; }
        public int? SubLedgerId { get; set; }
    }
}
