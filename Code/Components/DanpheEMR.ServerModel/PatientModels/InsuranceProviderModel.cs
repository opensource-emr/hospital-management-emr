using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class InsuranceProviderModel
    {
        [Key]
        public int InsuranceProviderId { get; set; }
        public string InsuranceProviderName { get; set; }
        public string Description { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public int? ModifiedBy { get; set; }
        public Boolean IsActive { get; set; }
    }
}
