using AutoMapper;
using DanpheEMR.ServerModel;
using DanpheEMR.Services.Pharmacy.DTOs.PurchaseOrder;

namespace DanpheEMR.Services.Pharmacy.Mapper.PurchaseOrder
{
    public class PurchaseOrderMappingProfile : Profile
    {
        public PurchaseOrderMappingProfile()
        {
            CreateMap<PurchaseOrder_DTO, PHRMPurchaseOrderModel>().ForMember(dest => dest.PHRMPurchaseOrderItems, act => act.Ignore());
            CreateMap<PurchaseOrderItems_DTO, PHRMPurchaseOrderItemsModel>();
        }
    }
}
