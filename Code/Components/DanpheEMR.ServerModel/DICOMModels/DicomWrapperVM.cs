using System;
using System.Collections.Generic;
using System.Text;

namespace DanpheEMR.ServerModel
{
    //revision needed
    [Serializable]
    public class DicomWrapperVM
    {
        public PatientStudyModel PatientStudy { get; set; }
        public DicomFileInfoModel FileInfo { get; set; } 
        public SeriesInfoModel SeriesInfo { get; set; }
        public byte[] FileBytes { get; set; }
    }
}
