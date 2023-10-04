import { BillingPackageServiceItemForGridDTO } from "./bill-package-service-item-for-grid.dto";

export class BillingPackageForGrid_DTO {
    BillingPackageId: number;
    BillingPackageName: string;
    Description: string;
    TotalPrice: number;
    DiscountPercent: number;
    PackageCode: string;
    IsActive: boolean;
    LabTypeName: string;
    SchemeId: number;
    PriceCategoryId: number;
    PriceCategoryName: string;
    IsEditable: boolean;
    BillingPackageServiceItemList: BillingPackageServiceItemForGridDTO[];
}
