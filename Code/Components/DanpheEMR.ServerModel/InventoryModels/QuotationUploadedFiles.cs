using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class QuotationUploadedFiles
    {
        [Key]
        public int QuotationUploadedFileId { get; set; }
        public int? RequestForQuotationId { get; set; }
        public int VendorId { get; set; }
        public Guid? ROWGUID { get; set; }
        public string FileType { get; set; }
        public byte[] FileBinaryData { get; set; }
        public string FileName { get; set; }
        public int FileNo { get; set; }
        public string FileExtention { get; set; }
        public DateTime? UpLoadedOn { get; set; }
        public int? UpLoadedBy { get; set; }
        public string Description { get; set; }
    }
}
