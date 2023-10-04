import { Injectable, Directive } from '@angular/core';
import { CoreService } from "../../core/shared/core.service";
@Injectable()
export class RadiologyService {
  //public enableImgUpload: boolean;
  //headertype=('image' or 'text-formatted'). This is to determine whether to show customer header in radiology report'
  public ReportHeader = { show: false, headerType: "image" };
  public selectedImagingType: number = 0;

  constructor(public coreService: CoreService) {
    //this.enableImgUpload = this.coreService.GetRadImgUploadConfig();
    //this.showCustomerHeader = this.coreService.GetCustomerHeaderViewConfig();
    this.ReportHeader = this.GetReportHeaderParam();
  }

  public setSelectedImagingType(typeId: number) {
    this.selectedImagingType = typeId;
  }

  //sud: 4thJan'18--moved from core-service to radiology service.. 
  public GetReportHeaderParam() {
    let retVal = { show: false, headerType: "image" };
    var currParameter = this.coreService.Parameters.find(a => a.ParameterGroupName == "Radiology" && a.ParameterName == "RadReportCustomerHeader")
    if (currParameter) {
      retVal = JSON.parse(currParameter.ParameterValue);
    }

    return retVal;

  }

  
  public GetImageUploadFolderPath() {
    let retVal: string = null;
    var currParameter = this.coreService.Parameters.find(a => a.ParameterGroupName == "Radiology" && a.ParameterName == "ReportImagesFolderPath")
    if (currParameter) {
      retVal = currParameter.ParameterValue;
    }
    return retVal;
  }

  public EnableDicomImages():boolean {
    let retVal: boolean = false;
    var currParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Radiology" && a.ParameterName == "EnableDicomImages");
    if (currParam && currParam.ParameterValue && currParam.ParameterValue.toLowerCase()=="true") {
      retVal = true;
    }
    return retVal;
  }


  public EnableImageUpload():boolean {
    let retVal: boolean = false;
    var currParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Radiology" && a.ParameterName == "EnableImageUpload");
    if (currParam && currParam.ParameterValue && currParam.ParameterValue.toLowerCase() == "true") {
      retVal = true;
    }
    return retVal;
  }



  public GetExtReferrerSettings() {
    var currParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Radiology" && a.ParameterName == "ExternalReferralSettings");
    if (currParam && currParam.ParameterValue) {
      return JSON.parse(currParam.ParameterValue);
    }
    else {
      return { EnableExternal: true, DefaultExternal: false, AllowFreeText: true };
    }
  }



}
