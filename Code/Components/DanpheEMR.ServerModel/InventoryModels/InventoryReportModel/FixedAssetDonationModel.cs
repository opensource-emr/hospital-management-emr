using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class FixedAssetDonationModel
    {
        [Key]
        public int DonationId { get; set; }
        public string Donation { get; set; }
        public string DonationPersonName { get; set; }
        public string DonationDetails { get; set; }
        public string PhoneNumber { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
    }
}
