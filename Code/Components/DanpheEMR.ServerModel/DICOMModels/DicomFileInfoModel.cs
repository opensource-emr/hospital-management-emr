using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System.Text;

namespace DanpheEMR.ServerModel
{
    [Serializable]
    public class DicomFileInfoModel
    {
        [Key]
        public Int64 DicomFileId { get; set; }
        public string SOPInstanceUID { get; set; }
        public Guid ROWGUID { get; set; }
        public int SeriesId { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public byte[] FileBinaryData { get; set; }
        public DateTime? CreatedOn { get; set; }
        public string FileToolData { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
        //add all required properties of DCM_DicomFiles
        //add [Key] attribute to Primary key and also add ForeignKey if required.

    }
}
