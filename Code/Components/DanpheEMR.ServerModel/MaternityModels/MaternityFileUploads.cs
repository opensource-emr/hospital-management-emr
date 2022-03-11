using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class MaternityFileUploads
    {
        [Key]
        public int FileId { get; set; }
        public int MaternityPatientId { get; set; }
        public int PatientId { get; set; }
        public string FileName { get; set; }
        public string FileType { get; set; }
        public string DisplayName { get; set; }
        public DateTime CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }
    }
}
