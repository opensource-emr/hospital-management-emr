using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.AccountingModels.DTOs
{
    public class MakePayment_DTO
    {
        public AccountingPaymentModel Payment { get; set; }
        public TransactionModel Transaction  { get; set; }

    }
}
