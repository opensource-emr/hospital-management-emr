using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
  public class PatientFilesModel
    {
        [Key]
        public Int64 PatientFileId { get; set; }
        public int PatientId { get; set; }
        public Guid ROWGUID  { get; set; }
        public string FileType { get; set; }
        public string Title { get; set; }
        public DateTime UploadedOn  { get; set; }
        public int UploadedBy { get; set; }
        public string Description { get; set; }
        //public byte[] FileBinaryData { get; set; }
        public int FileNo { get; set; }
        public string FileName { get; set; }
        public string FileExtention { get; set; }
     
        public bool? IsActive { get; set; }

        [NotMapped]
        public string FileBase64String { get; set; }

        [NotMapped]
        public bool? HasFile { get; set; }

    }
}
