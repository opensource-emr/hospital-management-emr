using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class MunicipalityModel
    {
        [Key]
        public int MunicipalityId { get; set; }
        public string MunicipalityName { get; set; }
        public string Type { get; set; }
        public int CountryId { get; set; }
        public int CountrySubDivisionId { get; set; }
        public bool IsActive { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }

    }
}
