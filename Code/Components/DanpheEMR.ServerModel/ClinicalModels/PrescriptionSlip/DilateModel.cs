using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class DilateModel
    {
        [Key]
        public int Id { get; set; }
        public int MasterId { get; set; }
        public bool Tplus { get; set; }
        public bool Atropine { get; set; }
        public bool CP { get; set; }
        public bool CTC { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
    }
}