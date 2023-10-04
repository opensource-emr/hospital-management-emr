using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace DanpheEMR.Controllers.Stickers.DTOs
{
    public class VisitStickerData_DTO
    {
        public int PatientId { get; set; }
        public int PatientVisitId { get; set; }
        public string HospitalNumber { get; set; }
        public string PatientName { get; set; }
        public string Gender { get; set; }
        public string DateOfBirth { get; set; }
        public string PatientAddress { get; set; }
        public string PatientPhoneNumber { get; set; }
        public string PatientDesignation { get; set; }
        public string VisitCode { get; set; }
        public string VisitDateTime { get; set; }
        public string VisitTypeFormatted { get; set; }
        public string AppointmentType { get; set; }
        public string DepartmentName { get; set; }
        public string PerformerName { get; set; }
        public decimal TicketCharge { get; set; }
        public string WardName { get; set; }
        public string BedNumber { get; set; }
        public string UserName { get; set; }
        public Int64? ClaimCode { get; set; }
        public string SchemeCode { get; set; }
        public string MemberNo { get; set; }
        public int? QueueNo { get; set; }

        public static VisitStickerData_DTO MapDataTableToSingleObject(DataTable visitSticker)
        {
            VisitStickerData_DTO retObj = new VisitStickerData_DTO();
            if (visitSticker != null)
            {
                string strPatData = JsonConvert.SerializeObject(visitSticker);
                List<VisitStickerData_DTO> sticker = JsonConvert.DeserializeObject<List<VisitStickerData_DTO>>(strPatData);
                if (sticker != null && sticker.Count > 0)
                {
                    retObj = sticker.First();
                }
            }
            return retObj;
        }
    }
}
