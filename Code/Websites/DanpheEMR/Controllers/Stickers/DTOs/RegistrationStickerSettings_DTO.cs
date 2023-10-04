using DanpheEMR.ServerModel.BillingModels;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace DanpheEMR.Controllers.Stickers.DTOs
{
    public class RegistrationStickerSettings_DTO
    {
        public int RegistrationStickerSettingsId { get; set; }
        public string StickerName { get; set; }
        public string StickerGroupCode { get; set; }
        public string VisitType { get; set; }
        public bool IsDefaultForCurrentVisitType { get; set; }
        public string VisitDateLabel { get; set; }
        public bool ShowSchemeCode { get; set; }
        public bool ShowMemberNo { get; set; }
        public string MemberNoLabel { get; set; }
        public bool ShowClaimCode { get; set; }
        public bool ShowIpdNumber { get; set; }
        public bool ShowWardBedNo { get; set; }
        public bool ShowRegistrationCharge { get; set; }
        public bool ShowPatContactNo { get; set; }
        public bool ShowPatientDesignation { get; set; }
        public string PatientDesignationLabel { get; set; }        
        public bool ShowQueueNo { get; set; }
        public string QueueNoLabel { get; set; }
        public static RegistrationStickerSettings_DTO MapDataTableToSingleObject(DataTable regSticker)
        {
            RegistrationStickerSettings_DTO retObj = new RegistrationStickerSettings_DTO();
            if (regSticker != null)
            {
                string strPatData = JsonConvert.SerializeObject(regSticker);
                List<RegistrationStickerSettings_DTO> sticker = JsonConvert.DeserializeObject<List<RegistrationStickerSettings_DTO>>(strPatData);
                if (sticker != null && sticker.Count > 0)
                {
                    retObj = sticker.First();
                }
            }
            return retObj;
        }

    }

}
