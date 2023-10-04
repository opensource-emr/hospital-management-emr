using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class CountryModel
    {
        [Key]
        public int CountryId { get; set; }
        public string CountryShortName { get; set; }
        public string CountryName { get; set; }
        public string ISDCode { get; set; }
        public string CountrySubDivisionType { get; set; }
        public bool IsActive { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
    }
}
