using DanpheEMR.ServerModel.RadiologyModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services
{
    public interface IEmailService
    {
        Task<string> SendEmail(string senderAddress, List<string> emailList, string nameofsender, string subject,
            string plainText, string htmlContent, string apiKey);
        Task<string> SendEmail(string senderAddress, List<string> emailList, string nameofsender , string subject, 
            string plainText, string htmlContent, string pdfBase64string, string attachmentFileName,
            List<ImageAttachmentModel> imageAttachments, string apiKey);       
    }
}
