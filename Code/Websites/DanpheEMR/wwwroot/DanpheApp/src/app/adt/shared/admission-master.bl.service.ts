import { Injectable } from "@angular/core";
import { AdmissionMasterDlService } from "./admission-master.dl.service";

@Injectable()
export class AdmissionMasterBlService {

  constructor(private _admissionMasterDlService: AdmissionMasterDlService) {
  }

  public GetSchemeAdtAutoBillingItemsAndDepositSettings(schemeId: number, priceCategoryId: number, serviceBillingContext: string) {
    return this._admissionMasterDlService.GetSchemeAdtAutoBillingItemsAndDepositSettings(schemeId, priceCategoryId, serviceBillingContext).map(res => {
      return res;
    });
  }
  public GetSchemeAdtAutoBillItems(schemeId: number, priceCategoryId: number, serviceBillingContext: string) {
    return this._admissionMasterDlService.GetSchemeAdtAutoBillItems(schemeId, priceCategoryId, serviceBillingContext).map(res => {
      return res;
    });
  }

  public GetBedFeatureSchemePriceCategoryMap(schemeId: number) {
    return this._admissionMasterDlService.GetBedFeatureSchemePriceCategoryMap(schemeId).map(res => {
      return res;
    });
  }

}
