using DanpheEMR.CommonTypes;
using DanpheEMR.ServerModel.CommonModels;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Utilities
{
    public class ImageUploader
    {
        public static DanpheHTTPResponse<object> UploadImages(List<ImageUploadModel> ImageList, string FolderLocation)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();            

            try
            {
                foreach (var image in ImageList)
                {
                    byte[] imageData = Convert.FromBase64String(image.base64String);
                    using (MemoryStream ms = new MemoryStream(imageData, 0, imageData.Length))
                    {
                        var fullPath = FolderLocation + image.ImageName;
                        image.FullPath = fullPath;
                        ms.Write(imageData, 0, imageData.Length);                        
                        System.Drawing.Image currImage = System.Drawing.Image.FromStream(ms, true);
                        currImage.Save(fullPath);
                        ms.Close();
                    }
                }

                responseData.Status = "OK";

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return responseData;
        }

        public static string GetBase64FromLocation(string path)
        {
            string base64String;
            using (System.Drawing.Image image = System.Drawing.Image.FromFile(path))
            {
                using (MemoryStream m = new MemoryStream())
                {
                    image.Save(m, image.RawFormat);
                    byte[] imageBytes = m.ToArray();
                    base64String = Convert.ToBase64String(imageBytes);                    
                    m.Close();
                }

                return base64String;
            }
            
        }
    }    
}
