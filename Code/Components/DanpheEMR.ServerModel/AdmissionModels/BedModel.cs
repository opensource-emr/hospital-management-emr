using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class BedModel
    {
        [Key]
        public int BedId { get; set; }
        public string BedCode { get; set; }
        public int BedNumber { get; set; }
        public int WardId { get; set; }
        public bool IsOccupied { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }
        public WardModel Ward { get; set; }

        [NotMapped]
        public int BedNumFrm { get; set; }
        [NotMapped]
        public int BedNumTo { get; set; }
    }
}
