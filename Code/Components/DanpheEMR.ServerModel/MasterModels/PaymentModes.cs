using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.MasterModels
{
    public class PaymentModes
    {
        [Key]
        public int PaymentSubCategoryId { get; set; }
        public string PaymentSubCategoryName { get; set; }
        public string PaymentMode { get; set; }
        public Boolean ShowInMultiplePaymentMode { get; set; }
    }
    public class PaymentPages
    {
        [Key]
        public int PaymentPageId { get; set; }
        public string ModuleName { get; set; }
        public string PageName { get; set; }
        public string Description { get; set; }
    }
}
