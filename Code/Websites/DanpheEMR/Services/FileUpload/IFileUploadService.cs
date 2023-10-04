using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services
{
    public interface IFileUploadService
    {
        GoogleDriveResponse UploadNewFile(string UploadFileName, string mimeType = "text/plain");
        GoogleDriveResponse UpdateFileById(string fileId, string newFileName, string mimeType = "text/plain");
    }
}
