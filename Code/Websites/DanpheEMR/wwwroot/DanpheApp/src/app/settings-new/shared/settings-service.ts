import { Injectable, Directive } from '@angular/core';
import { SettingsGridColumnSettings } from "../../shared/danphe-grid/settings-grid-column-settings";
import { CoreService } from "../../core/shared/core.service";
import { BedFeature } from '../../adt/shared/bedfeature.model';
import { BillItemPriceModel } from './bill-item-price.model';
import { LabTest } from '../../labs/shared/lab-test.model';
import { ImagingItem } from '../../radiology/shared/imaging-item.model';
import { SecurityService } from '../../security/shared/security.service';


@Injectable()
export class SettingsService {
  public settingsGridCols: SettingsGridColumnSettings;

  constructor(public coreService: CoreService, public securityService: SecurityService) {
    this.settingsGridCols = new SettingsGridColumnSettings(this.coreService.taxLabel, this.securityService)
  }


  //public MAP_GetBillItemFromBedFeature(): BillingItem {
  //  return null;
  //}

  public MAP_GetBillItemFromBedFeature(bedF: BedFeature): BillItemPriceModel {
    let retBillItem = new BillItemPriceModel();
    retBillItem.ItemName = bedF.BedFeatureName;
    retBillItem.ItemId = bedF.BedFeatureId;
    retBillItem.Price = bedF.BedPrice;
    retBillItem.TaxApplicable = bedF.TaxApplicable;
    retBillItem.DiscountApplicable = true;
    retBillItem.IsActive = true;
    retBillItem.IsNormalPriceApplicable = true;
    retBillItem.IsFractionApplicable = false;
    retBillItem.IsDoctorMandatory = false;
    return retBillItem;
  }


  public MAP_GetBillItemFromLabTest(): BillItemPriceModel {
    return null;
  }

  public MAP_GetBillItemFromRadiologyItem(): BillItemPriceModel {
    return null;
  }



  public MAP_GetBedFeatureFromBillItem(billItem: BillItemPriceModel): BedFeature {
    let bedFeatureItem: BedFeature = new BedFeature();
    bedFeatureItem.BedFeatureId = billItem.ItemId;
    bedFeatureItem.BedPrice = billItem.Price;
    bedFeatureItem.BedFeatureName = billItem.ItemName;
    bedFeatureItem.CreatedOn = billItem.CreatedOn;
    bedFeatureItem.CreatedBy = billItem.CreatedBy;
    bedFeatureItem.ModifiedBy = billItem.ModifiedBy;
    bedFeatureItem.ModifiedOn = billItem.ModifiedOn;
    bedFeatureItem.IsActive = billItem.IsActive;

    return bedFeatureItem;
  }

  public MAP_GetLabTestFromBillItem(billItm: BillItemPriceModel): LabTest {
    let retLabTest: LabTest = new LabTest();

    retLabTest.LabSequence = 0;
    retLabTest.IsActive = true;
    retLabTest.IsValidForReporting = true;
    retLabTest.LabTestCode = null;
    retLabTest.LabTestComponentsJSON = null;
    retLabTest.LabTestName = billItm.ItemName;
    retLabTest.Description = billItm.Description;
    retLabTest.LabTestSpecimen = '["Blood"]';
    retLabTest.LabTestSpecimenSource = "Peripheral Vein";

    return retLabTest;
  }

  public MAP_GetRadiologyItemFromBillItem(billItm: BillItemPriceModel, imagingTypeId: number): ImagingItem {
    let retImgItem = new ImagingItem();
    if (billItm) {
      retImgItem.ImagingItemId = billItm.ItemId;
      retImgItem.ImagingItemName = billItm.ItemName;
      retImgItem.ImagingTypeId = imagingTypeId;
      retImgItem.IsActive = true;
      retImgItem.ProcedureCode = null;
    }


    return retImgItem;
  }






}
