using DanpheEMR.ServerModel;
using System;
using System.Collections.Generic;

namespace DanpheEMR.Controllers.Stickers.DTOs
{
    public class StickerSettingsAndData_DTO
    {
       public RegistrationStickerSettings_DTO StickerSettings { get; set; }
       public VisitStickerData_DTO StickerData { get; set; }

    }
}
