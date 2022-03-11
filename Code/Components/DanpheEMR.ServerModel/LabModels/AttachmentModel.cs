using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.LabModels
{
   public class AttachmentModel
    {
        public string ImageBase64 { get; set; }
        public string ImageName { get; set; }
        public string pdfBase64 { get; set; }
    }
}
