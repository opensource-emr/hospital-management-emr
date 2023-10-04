using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.MasterModels
{
    public class CfgPaymentModesSettings
    {
        [Key]
        public int PaymentModeSettingsId { get; set; }
        public int PaymentPageId { get; set; }
        public string PaymentModeSubCategoryName { get; set; }
        public int PaymentModeSubCategoryId { get; set; }
        public Boolean IsActive { get; set; }
        public int? DisplaySequence { get; set; }
        public Boolean ShowPaymentDetails { get; set; }
        public Boolean IsRemarksMandatory { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
    }
}
