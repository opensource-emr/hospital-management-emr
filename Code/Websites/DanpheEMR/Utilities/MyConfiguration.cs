using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

//try to move this to some other namespace later on.-- sud: 8June'18
namespace DanpheEMR.Core.Configuration
{
    public class MyConfiguration
    {
        public string Connectionstring { get; set; }
        public string ConnectionStringAdmin { get; set; }
        public string ConnectionStringPACSServer { get; set; }
        public int CacheExpirationMinutes { get; set; }
        public string FileStorageRelativeLocation { get; set; }
        public bool highlightAbnormalLabResult { get; set; }
        public bool RealTimeRemoteSyncEnabled { get; set; }
        public string ApplicationVersionNum { get; set; }
        public bool IsAuditEnable { get; set; }
        public string LISDataBaseUrl { get; set; }
        public GoogleDriveConfiguration GoogleDriveFileUpload { get; set; }
    }
    public class GoogleDriveConfiguration
    {
        public string ServiceAccountKey { get; set; }
        public string LoggerFilePath { get; set; }
        public string UploadFileBasePath { get; set; }
        public string FileUrlCommon { get; set; }
    }
}
