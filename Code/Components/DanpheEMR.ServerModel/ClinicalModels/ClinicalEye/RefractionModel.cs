using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class RefractionModel
    {
        [Key]
        public int Id { get; set; }
        public int MasterId { get; set; }
        public DateTime? Date { get; set; }
        public string TimePoint { get; set; }
        public int? UCVA { get; set; }
        public string ULett { get; set; }
        public string NUC { get; set; }
        public double? Sph { get; set; }
        public double? Cyf { get; set; }
        public int? Axis { get; set; }
        public int? BSCVA { get; set; }
        public string BLett { get; set; }
        public string DCNV { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public Boolean IsOD { get; set; }

    }
}

