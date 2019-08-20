using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    public class AddressModel
    {
        [Key]
        public int PatientAddressId { get; set; }
        public int PatientId { get; set; }
        public string AddressType { get; set; }
        public string Street1 { get; set; }
        public string Street2 { get; set; }
        public int CountryId { get; set; }

        // this is used to show the value in client side as client side there is only Id ..not name
        [NotMapped]
        public string CountryName { get; set; }
        [NotMapped]
        public string CountrySubDivisionName { get; set; }

        public int? CountrySubDivisionId { get; set; }
        public string City { get; set; }
        public string ZipCode { get; set; }
        public virtual PatientModel Patient { get; set; }
    }

}
