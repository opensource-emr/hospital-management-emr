using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class PatientStickerModel
    {
        public string PatientName { get; set; }
        public string HospitalNo { get; set; }
        public string Age { get; set; }
        public string Contact { get; set; }
        public string Address { get; set; }
        public string District { get; set; }
        public string MunicipalityName { get; set; }
        public string CountryName { get; set; }
        public string Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }
    }
}
