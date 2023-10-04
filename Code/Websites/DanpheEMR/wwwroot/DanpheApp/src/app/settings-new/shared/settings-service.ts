import { Injectable } from '@angular/core';
import { CoreService } from "../../core/shared/core.service";
import { SecurityService } from '../../security/shared/security.service';
import { SettingsGridColumnSettings } from "../../shared/danphe-grid/settings-grid-column-settings";


@Injectable()
export class SettingsService {
  public settingsGridCols: SettingsGridColumnSettings;

  constructor(public coreService: CoreService, public securityService: SecurityService) {
    this.settingsGridCols = new SettingsGridColumnSettings(this.coreService.taxLabel, this.securityService)
  }


  //public MAP_GetBillItemFromBedFeature(): BillingItem {
  //  return null;
  //}

  // public MAP_GetBillItemFromBedFeature(bedF: BedFeature): BillServiceItem_DTO {
  //   /*Manipal-RevisionNeeded*/
  //   /*Sud:20Mar'23-- There's not sufficient properties in new model so need to revise later */
  //   let retBillItem = new BillServiceItem_DTO();
  //   retBillItem.ItemName = bedF.BedFeatureName;
  //   retBillItem.IntegrationItemId = bedF.BedFeatureId;
  //   //retBillItem.Price = bedF.BedPrice;
  //   retBillItem.IsTaxApplicable = bedF.TaxApplicable;
  //   retBillItem.IsActive = true;
  //   //retBillItem.DiscountApplicable = true;
  //   retBillItem.IsIncentiveApplicable = false;
  //   retBillItem.IsDoctorMandatory = false;
  //   return retBillItem;
  // }



}
