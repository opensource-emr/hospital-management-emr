using AutoMapper;
using DanpheEMR.ServerModel.BillingModels;

namespace DanpheEMR.Controllers.Settings.DTO
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<BillSchemeDTO, BillingSchemeModel>();
        }
    }
}
