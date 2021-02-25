using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.CommonModels
{
    public class ImageUploadModel
    {
        public string base64String { get; set; }
        public string ImageName { get; set; }
        public string FullPath { get; set; }
    }
}
