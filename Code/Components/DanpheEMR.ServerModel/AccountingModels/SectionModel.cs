using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;


namespace DanpheEMR.ServerModel
{
    public class AccSectionModel
        
    {
        [Key]
        public int Id { get; set; }
        public int SectionId { get; set; }
        public string SectionName { get; set; }
        public string SectionCode { get; set; }
        //sud-nagesh: 20June'20-- for Acc-Hospital Separation.
        public int? HospitalId { get; set; }

        public bool IsDefault { get; set; }
        public bool IsActive { get; set; }
    }
  
}
