import { ENUM_LabTypes } from "../../../shared/shared-enums";
import { BillingPackageServiceItems_DTO } from "./bill-package-service-items.dto";

export class BillingPackages_DTO {
  public BillingPackageId: number = 0;
  public BillingPackageName: string = '';
  public Description: string = '';
  public TotalPrice: number = 0;
  public DiscountPercent: number = 0;
  public PackageCode: string = '';
  public IsActive: boolean = false;
  public LabTypeName: string = ENUM_LabTypes.OpLab;
  public SchemeId: number = 0;
  public PriceCategoryId: number = 0;
  public IsEditable: boolean = false;
  public BillingPackageServiceItemList = new Array<BillingPackageServiceItems_DTO>();
}

