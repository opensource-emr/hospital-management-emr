using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class LabTestMasterSpecimen
    {
        [Key]
        public int SpecimenId { get; set; }
        public string SpecimenName { get; set; }
    }
    public class LabTestSpecimenModel
    {
        public int? RequisitionId { get; set; }
        public string Specimen { get; set; }
    }
}






