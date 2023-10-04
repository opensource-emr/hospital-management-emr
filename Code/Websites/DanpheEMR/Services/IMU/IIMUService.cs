using DanpheEMR.Core;
using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.ServerModel.IMUDTOs;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services.IMU
{
    public interface IIMUService
    {
        Task <DataTable> GetAllImuTestData(LabDbContext labDbcontext, DateTime fromDate , DateTime toDate);
        Task<IMUResponseModel> PostDataToIMU(LabDbContext labDbContex,CoreDbContext coreDbContext, List<Int64> reqIdList, RbacUser user);
    }
}
