
using DanpheEMR.CommonTypes;
using DanpheEMR.DalLayer;
using DanpheEMR.ServerModel;
using DanpheEMR.Utilities;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;

namespace DanpheEMR.Controllers
{
    public class StickersBL
    {
        public List<PatientStickerModel> GetPatientStickerDetails (PatientDbContext context, int PatientId)
        {
                List<PatientStickerModel> Data = context.Database.SqlQuery<PatientStickerModel>("exec SP_GetPatientStickerDetails @PatientId",
                new SqlParameter("@PatientId", PatientId)).ToList();
                return Data;            
        }

    }
}
