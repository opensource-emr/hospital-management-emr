using DanpheEMR.CommonTypes;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Utilities
{
    public class FileUploader
    {

        static string fileStorageLocation;

        public FileUploader(string storageLocation)
        {
            fileStorageLocation = storageLocation;

        }


        public static DanpheHTTPResponse<object> Upload(IFormFileCollection files, string localFolder)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            
            try
            {
                string filePath = fileStorageLocation + localFolder;
                foreach (var file in files)
                {
                    using (Stream stream = file.OpenReadStream())
                    {
                        using (var binaryReader = new BinaryReader(stream))
                        {
                            byte[] fileBytes = binaryReader.ReadBytes((int)file.Length);
                            //set below filepath dynamically, based on some logic.
                            //filename should come from the client.
                            

                            // the byte array argument contains the content of the file
                            // the string argument contains the name and extension
                            // of the file passed in the byte array
                            // instance a memory stream and pass the
                            // byte array to its constructor
                            MemoryStream ms = new MemoryStream(fileBytes);

                            // instance a filestream pointing to the
                            // storage folder, use the original file name
                            // to name the resulting file
                            FileStream fs = new FileStream(filePath + "/" + file.FileName, FileMode.Create);

                            // write the memory stream containing the original
                            // file as a byte array to the filestream
                            ms.WriteTo(fs);

                            // clean up
                            ms.Close();
                            fs.Close();
                            fs.Dispose();
                        }
                    }
                }
                responseData.Status = "OK";
                responseData.Results = filePath;
                
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return responseData;
        }
    }
}
