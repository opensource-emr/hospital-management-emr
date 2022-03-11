using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class MorbidityReportingGroupVM
    {
        public int ReportingGroupId { get; set; }
        public string ReportingGroupName { get; set; }
        public string GroupCode { get; set; }
        public int SerialNumber { get; set; }

        public List<MorbidityDiseaseGroupVM> DiseasesGroup = new List<MorbidityDiseaseGroupVM>();
    }


    public class MorbidityDiseaseGroupVM
    {
        public int SerialNumber { get; set; }
        public string ICDCode { get; set; }
        public string DiseaseGroupName { get; set; }
        public int NumberOfMale { get; set; }
        public int NumberOfFemale { get; set; }
        public int NumberOfOtherGender { get; set; }
    }
}
