using Google.Apis.Auth.OAuth2;
using Google.Apis.Drive.v3;
using Google.Apis.Drive.v3.Data;
using Google.Apis.Services;
using Google.Apis.Upload;
using DanpheEMR.Core.Configuration;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;

namespace DanpheEMR.Services
{
    public class GoogleDriveFileUploadService : IFileUploadService
    {
        private GoogleDriveLogger _logger;
        private string UploadFileBasePath;
        private string ServiceAccountKeyPath;
        private string GoogleFileURLCommon;

        private DriveService service;
        public GoogleDriveFileUploadService(IOptions<MyConfiguration> configuration)
        {
            _logger = new GoogleDriveLogger(configuration.Value.GoogleDriveFileUpload.LoggerFilePath);

            UploadFileBasePath = configuration.Value.GoogleDriveFileUpload.UploadFileBasePath;
            ServiceAccountKeyPath = configuration.Value.GoogleDriveFileUpload.ServiceAccountKey;
            GoogleFileURLCommon = configuration.Value.GoogleDriveFileUpload.FileUrlCommon;

            InitializeGoogleDriveService();
        }

        private void InitializeGoogleDriveService()
        {
            if (System.IO.File.Exists(ServiceAccountKeyPath))
            {
                // Load the Service account credentials and define the scope of its access.
                var credential = GoogleCredential.FromFile(ServiceAccountKeyPath)
                                .CreateScoped(DriveService.ScopeConstants.Drive);

                // Create the  Drive service.
                service = new DriveService(new BaseClientService.Initializer()
                {
                    HttpClientInitializer = credential
                });
            }
        }

        public GoogleDriveResponse UploadNewFile(string UploadFileName, string mimeType = "text/plain")
        {
            if (!System.IO.Directory.Exists(UploadFileBasePath))
            {
                System.IO.Directory.CreateDirectory(UploadFileBasePath);
            }

            string BlankFileFullPath = String.Concat(UploadFileBasePath, "\\blank.txt").ToApplicationPath();          
            
            // Create a new blank text file if does not exists
            if (System.IO.File.Exists(BlankFileFullPath) == false)
            {
                // Create a new file     
                using (StreamWriter sw = System.IO.File.CreateText(BlankFileFullPath))
                {
                    sw.WriteLine("No Data Available Yet.", DateTime.Now.ToString());
                }
            }            

            if (service == null)
            {
                return (new GoogleDriveResponse() { FileId = "", FileLink = "", CreatedOn = DateTime.Now });
            }

            var uploadFolderInGoogleDrive = CreateFolderInGoogleDriveIfNotExists();

            // Upload file Metadata
            var fileMetadata = new Google.Apis.Drive.v3.Data.File()
            {
                Name = UploadFileName,
                Parents = new List<string>() { uploadFolderInGoogleDrive.Id }
            };

            string uploadedFileId;

            // Create a new file on Google Drive
            using (var fsSource = new FileStream(BlankFileFullPath, FileMode.Open, FileAccess.Read))
            {
                // Create a new file, with metadata and stream.
                var request = service.Files.Create(fileMetadata, fsSource, mimeType);
                request.Fields = "*";
                var results = request.Upload();

                if (results.Status == UploadStatus.Failed)
                {
                    _logger.Write($"Error uploading file: {results.Exception.Message}");
                }

                // the file id of the new file we created
                uploadedFileId = request.ResponseBody?.Id;
            }

            // Provide reader access to anyone
            CreatePermissionForFile(uploadedFileId);

            var fileLink = GoogleFileURLCommon.Replace("GGLFILEUPLOADID", uploadedFileId);
            //var fileLink = $"https://drive.google.com/file/d/{uploadedFileId}/view?usp=sharing";
            var response = new GoogleDriveResponse() { FileId = uploadedFileId, FileLink = fileLink, CreatedOn = DateTime.Now };
            _logger.Write("UploadNewFile: " + response.ToString());
            return response;
        }
        private void CreatePermissionForFile(string uploadedFileId)
        {
            try
            {
                //create reader permission for anyone
                Permission permissions = new Permission()
                {
                    Type = "anyone",
                    Role = "reader"
                };
                var permissionCreateRequest = service.Permissions.Create(permissions, uploadedFileId);
                permissionCreateRequest.Fields = "id";
                permissionCreateRequest.Execute();

            }
            catch (Exception ex)
            {
                _logger.Write($"Error uploading file: {ex.Message}");
            }
        }

        public GoogleDriveResponse UpdateFileById(string FileId, string NewFileName, string newMimeType = "text/plain")
        {
            // File's new metadata.
            Google.Apis.Drive.v3.Data.File updatedFile = new Google.Apis.Drive.v3.Data.File();
            updatedFile.Name = NewFileName;
            updatedFile.Description = "";
            updatedFile.MimeType = newMimeType;


            using (var fsSource = new FileStream(UploadFileBasePath + '\\' + NewFileName, FileMode.Open, FileAccess.Read))
            {
                // Send the request to the API.
                FilesResource.UpdateMediaUpload request = service.Files.Update(updatedFile, FileId, fsSource, newMimeType);
                IUploadProgress result = request.Upload();

                if (result.Status == UploadStatus.Failed)
                {
                    _logger.Write($"Error updating file: {result.Exception.Message}");
                }

                updatedFile = request.ResponseBody;
            }

            var fileLink = GoogleFileURLCommon.Replace("GGLFILEUPLOADID", updatedFile.Id);
            //var fileLink = $"https://drive.google.com/file/d/{updatedFile.Id}/view?usp=sharing";
            var response = new GoogleDriveResponse() { FileId = updatedFile.Id, FileLink = fileLink, CreatedOn = DateTime.Now };
            _logger.Write("UpdateFileById: " + response.ToString());
            return response;
        }


        /// <summary>
        /// A folder is also a file in Google Drive with MimeType = application/vnd.google-apps.folder
        /// </summary>
        /// <param name="service">Instance of Google Drive Service</param>
        /// <returns> A file with MimeType = "application/vnd.google-apps.folder" (folder)</returns>
        private Google.Apis.Drive.v3.Data.File CreateFolderInGoogleDriveIfNotExists()
        {            
                var fileListRequest = service.Files.List();
                // List files.
                IList<Google.Apis.Drive.v3.Data.File> files = fileListRequest.Execute().Files;
                var uploadFolderInServer = files.Where(x => x.MimeType == "application/vnd.google-apps.folder" && x.Name == "LabTestReports").FirstOrDefault();

                if (uploadFolderInServer == null)
                {
                    var FileMetaData = new Google.Apis.Drive.v3.Data.File();
                    FileMetaData.Name = "LabTestReports";
                    FileMetaData.MimeType = "application/vnd.google-apps.folder";

                    Google.Apis.Drive.v3.FilesResource.CreateRequest folderCreaterequest = service.Files.Create(FileMetaData);
                    folderCreaterequest.Fields = "id";
                    uploadFolderInServer = folderCreaterequest.Execute();
                }
                return uploadFolderInServer;
        }

    }
    static class GoogleDriveExtensionFunc
    {
        public static string ToApplicationPath(this string fileName)
        {
            var exePath = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
            Regex appPathMatcher = new Regex(@"(?<!fil)[A-Za-z]:\\+[\S\s]*?(?=\\+bin)");
            var appRoot = appPathMatcher.Match(exePath).Value;
            return Path.Combine(appRoot, fileName);
        }
    }

    public class GoogleDriveResponse
    {
        public string FileId { get; set; }
        public string FileLink { get; set; }
        public DateTime CreatedOn { get; set; }
        public override string ToString()
        {
            return $" FileId: {FileId}, FileLink: {FileLink}, CreatedOn: {CreatedOn}";
        }
    }

    public class GoogleDriveLogger
    {
        private string LoggerFileBasePath { get; set; }
        private string LoggerFileFullPath { get; set; }

        public GoogleDriveLogger(string loggerFileBasePath)
        {
            LoggerFileBasePath = loggerFileBasePath;
            CreateLoggerFileIfNotExist();
        }
        private void CreateLoggerFileIfNotExist()
        {
            if (!System.IO.Directory.Exists(LoggerFileBasePath))
            {
                System.IO.Directory.CreateDirectory(LoggerFileBasePath);
            }

            //logger
            // Create a logger text file if does not exists

            var currentDate = DateTime.Now.ToString("yyyy-MM-dd");
            LoggerFileFullPath = $"{LoggerFileBasePath}\\googleFileUploadLogs_{currentDate}.txt";

            if (System.IO.File.Exists(LoggerFileFullPath.ToApplicationPath()) == false)
            {
                using (var sw = System.IO.File.Create(LoggerFileFullPath.ToApplicationPath()))
                {
                    sw.Close();
                }
            }

        }
        public void Write(string text)
        {
            using (StreamWriter sw = System.IO.File.AppendText(LoggerFileFullPath.ToApplicationPath()))
            {
                sw.WriteLine(text);
            }
        }
    }
}
