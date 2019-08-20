using SendGrid;
using SendGrid.Helpers.Mail;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace DanpheEMR.Services
{
    public class EmailService : IEmailService
    {
        protected const String API_KEY = "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";

        public async Task SendEmail(string senderAddress, List<string> emailList, string nameOfSender, string subject, 
            string plainText, string htmlContent)
        {
            List<EmailAddress> toSenderList = new List<EmailAddress>();

            var client = new SendGridClient(API_KEY);
            var from = new EmailAddress(senderAddress, nameOfSender);

            foreach (var email in emailList)
            {
                var to = new EmailAddress(email);
                toSenderList.Add(to);
            }

            var msg = MailHelper.CreateSingleEmailToMultipleRecipients(from, toSenderList, subject, plainText, htmlContent);
            var response = await client.SendEmailAsync(msg);
        }


        public async Task SendEmail(string senderAddress, List<string> emailList, string nameOfSender, 
            string subject, string plainText, string htmlContent, string base64string, string fileName)
        {
            List<EmailAddress> toSenderList = new List<EmailAddress>();

            var client = new SendGridClient(API_KEY);
            var from = new EmailAddress(senderAddress, nameOfSender);

            foreach (var email in emailList)
            {
                var to = new EmailAddress(email);
                toSenderList.Add(to);
            }

            var msg = MailHelper.CreateSingleEmailToMultipleRecipients(from, toSenderList, subject, plainText, htmlContent);
            if(fileName != null && base64string != null)
            {
                msg.AddAttachment(fileName, base64string, ".pdf");
            }

            var response = await client.SendEmailAsync(msg);
        }
    }
}
