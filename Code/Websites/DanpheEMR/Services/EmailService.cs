using DanpheEMR.ServerModel.RadiologyModels;
using SendGrid;
using SendGrid.Helpers.Mail;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using DanpheEMR.ServerModel.LabModels;

namespace DanpheEMR.Services
{
    public class EmailService : IEmailService
    { 
       
        public async Task<string> SendEmail(string senderAddress, List<string> emailList, string nameOfSender, string subject, 
            string plainText, string htmlContent, string apiKey)
        {
            List<EmailAddress> toSenderList = new List<EmailAddress>();

            var client = new SendGridClient(apiKey);
            var from = new EmailAddress(senderAddress, nameOfSender);

            foreach (var email in emailList)
            {
                var to = new EmailAddress(email);
                toSenderList.Add(to);
            }

            var msg = MailHelper.CreateSingleEmailToMultipleRecipients(from, toSenderList, subject, plainText, htmlContent);
            var response = await client.SendEmailAsync(msg);
            if (response.StatusCode == System.Net.HttpStatusCode.Accepted)
            {
                return "OK";
            }
            else
            {
                return "Error";
            }
        }


        public async Task<string> SendEmail(string senderAddress, List<string> emailList, string nameOfSender, 
            string subject, string plainText, string htmlContent, string pdfBase64string, string fileName, 
            List<ImageAttachmentModel> imageAttachments, string apiKey)
        {
            List<EmailAddress> toSenderList = new List<EmailAddress>();

            var client = new SendGridClient(apiKey);
            var from = new EmailAddress(senderAddress, nameOfSender);

            foreach (var email in emailList)
            {
                var to = new EmailAddress(email);
                toSenderList.Add(to);
            }

            var msg = MailHelper.CreateSingleEmailToMultipleRecipients(from, toSenderList, subject, plainText, htmlContent);

            var attachmentList = new List<Attachment>();
            //Check for Image Attachments
            if (imageAttachments != null && imageAttachments.Count > 0)
            {
                
                foreach (var imgAttach in imageAttachments)
                {
                    Attachment singleAttachment = new Attachment();
                    singleAttachment.Content = imgAttach.ImageBase64;
                    singleAttachment.ContentId = imgAttach.ImageName;
                    singleAttachment.Filename = imgAttach.ImageName + ".jpeg";
                    singleAttachment.Type = "image/jpeg";
                    singleAttachment.Disposition = "attachment";
                    attachmentList.Add(singleAttachment);
                }
               
            }

            if (fileName != null && pdfBase64string != null)
            {
                Attachment singleAttachment = new Attachment();
                singleAttachment.Content = pdfBase64string;
                singleAttachment.ContentId = fileName;
                singleAttachment.Filename = fileName + ".pdf";
                singleAttachment.Type = "application/pdf";
                singleAttachment.Disposition = "attachment";
                attachmentList.Add(singleAttachment);
            }


            if (attachmentList != null && attachmentList.Count > 0)
            {
                msg.AddAttachments(attachmentList.AsEnumerable());
            }    

            var response = await client.SendEmailAsync(msg);

            if (response.StatusCode == System.Net.HttpStatusCode.Accepted)            {
                return "OK";
            } else
            {
              return "Error";
            }
        }
        public async Task<string> SendEmail(string senderAddress, List<string> emailList, string nameOfSender,
        string subject, string plainText,  string htmlContent, string pdfBase64string, string fileName, 
        List<AttachmentModel> ImageAttachments, string apiKey)
        {
            List<EmailAddress> toSenderList = new List<EmailAddress>();

            var client = new SendGridClient(apiKey);
            var from = new EmailAddress(senderAddress, nameOfSender);

            foreach (var email in emailList)
            {
                var to = new EmailAddress(email);
                toSenderList.Add(to);
            }

            var msg = MailHelper.CreateSingleEmailToMultipleRecipients(from, toSenderList, subject, plainText, htmlContent);

            var attachmentList = new List<Attachment>();
            //Check for Image Attachments
            if (fileName != null && pdfBase64string != null)
            {
                Attachment singleAttachment = new Attachment();
                singleAttachment.Content = pdfBase64string;
                singleAttachment.ContentId = fileName;
                singleAttachment.Filename = fileName + ".pdf";
                singleAttachment.Type = "application/pdf";
                singleAttachment.Disposition = "attachment";
                attachmentList.Add(singleAttachment);
            }


            if (attachmentList != null && attachmentList.Count > 0)
            {
                msg.AddAttachments(attachmentList.AsEnumerable());
            }

            var response = await client.SendEmailAsync(msg);

            if (response.StatusCode == System.Net.HttpStatusCode.Accepted)
            {
                return "OK";
            }
            else
            {
                return "Error";
            }
        }
    }
}
