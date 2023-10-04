using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.LabModels
{
   public class LabEmailModel
    {
        public string EmailAddress { get; set; }
        public string Subject { get; set; }
        public string PlainContent { get; set; }
        public string HtmlContent { get; set; }
        public string PdfBase64 { get; set; }
        public string AttachmentFileName { get; set; }
        public List<AttachmentModel> ImageAttachments { get; set; }
        public string SenderEmailAddress { get; set; }
        public string SenderTitle { get; set; }
        public bool SendPdf { get; set; }
        public bool SendHtml { get; set; }

        public List<string> EmailList { get; set; }
    }
}
