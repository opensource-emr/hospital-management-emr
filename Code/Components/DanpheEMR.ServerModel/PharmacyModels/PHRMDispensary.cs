using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
namespace DanpheEMR.ServerModel
{
    public class PHRMDispensaryModel
    {
        [Key]
        public int DispensaryId { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public string ContactNo { get; set; }
        public string Email { get; set; }
        public string DispensaryLabel { get; set; }
        public string DispensaryDescription { get; set; }
        public DateTime CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public Boolean IsActive { get; set; }
    }
}