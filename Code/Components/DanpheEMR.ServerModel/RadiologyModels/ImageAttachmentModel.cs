using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.RadiologyModels
{
    public class ImageAttachmentModel
    {
        public string ImageBase64 { get; set; }
        public string ImageName { get; set; }
    }
}
