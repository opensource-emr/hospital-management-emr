using System;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Windows.Input;

namespace DanpheEMR.ServerModel.ClaimManagementModels
{
    public class TXNUploadedFile
    {
        [Key]
        public int FileId { get; set; }
        public string SystemFeatureName { get; set; }
        public int PatientId { get; set; }
        public int? PatientVisitId { get; set; }
        public Int64? ClaimCode { get; set; }
        public int ReferenceNumber { get; set; }
        public string ReferenceEntityType { get; set; }
        public string FileDisplayName { get; set; }
        public string FileName { get; set; }
        public string FileExtension { get; set; }
        public string FileLocationFullPath { get; set; }
        public string FileDescription { get; set; }
        public int UploadedBy { get; set; }
        public DateTime UploadedOn { get; set; }
        public bool IsActive { get; set; }
        public Int64 Size {  get; set; }
    }
}
