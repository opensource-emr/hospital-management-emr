using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services
{
    public interface IEmailService
    {
        Task SendEmail(string senderAddress, List<string> emailList, string nameofsender, string subject, string plainText, string htmlContent);
        Task SendEmail(string senderAddress, List<string> emailList, string nameofsender , string subject, string plainText, string htmlContent, string base64string, string attachmentFileName);       
    }
}
