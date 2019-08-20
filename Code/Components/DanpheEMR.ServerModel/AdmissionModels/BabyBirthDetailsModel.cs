using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class BabyBirthDetailsModel
    {
        [Key]
        public int BabyBirthDetailsId {get;set;}
        public string CertificateNumber {get;set;}
        public string Sex {get;set;}
        public string FathersName {get;set;}
        public decimal WeightOfBaby {get;set;}
        public DateTime BirthDate {get;set;}
        public TimeSpan BirthTime {get;set;}
        public int DischargeSummaryId {get;set;}
        [NotMapped]
        public bool IsDeleted { get; set; }
    }
}
