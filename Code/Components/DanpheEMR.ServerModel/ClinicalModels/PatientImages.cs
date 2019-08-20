using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
   public class PatientImagesModel
    {
            [Key]
            public Int64 PatImageId { get; set; }
            public int PatientId { get; set; }
            public int PatientVisitId { get; set; }
            public int DepartmentId { get; set; }
            public Guid ROWGUID { get; set; }
            public string FileType { get; set; }
            public string Comment { get; set; }
            public byte[] FileBinaryData { get; set; }
            public string FileName { get; set; }
            public string Title { get; set; }
            public string FileExtention { get; set; }
            public DateTime UploadedOn { get; set; }
            public int UploadedBy { get; set; }
            public bool? IsActive { get; set; }
    }
}
