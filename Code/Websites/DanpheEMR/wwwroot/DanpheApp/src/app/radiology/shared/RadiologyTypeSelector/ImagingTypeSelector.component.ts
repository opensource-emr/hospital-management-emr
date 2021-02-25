import { Component, ViewChild, ChangeDetectorRef, Input, EventEmitter, Output } from "@angular/core";
import { ImagingBLService } from "../imaging.bl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { CoreService } from "../../../core/shared/core.service";
import { SecurityService } from "../../../security/shared/security.service";
import { RadiologyService } from "../radiology-service";

@Component({
  selector: "imaging-type-selector",
  templateUrl: "./imaging-type-selector.html" //  "/RadiologyView/ImagingRequisitionList"
})
export class ImagingTypeSelectorComponent {
  //selected Imaging Type to  display in the grid.
  public imagingTypes: Array<any> = [];
  //@Input("selImgType") selImgType: any;
  public selImgType: any;
  @Output() inputModelChange = new EventEmitter<object>();
  public allTypeIdList: Array<number> = new Array<number>();
  public showAll: boolean = false;

  constructor(
    public imagingBLService: ImagingBLService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    public securityService: SecurityService,
    public radiologyService: RadiologyService
  ) {
    this.getImagingType();    
  }

  getImagingType() {
    this.allTypeIdList = [];
    this.imagingBLService.GetImagingTypes()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.imagingTypes = res.Results;
          if (this.radiologyService.selectedImagingType && this.radiologyService.selectedImagingType != 0) {
            this.selImgType = this.radiologyService.selectedImagingType;
          }
          this.setImagingType();
        }
        else {
          this.msgBoxServ.showMessage('failed', ["failed to get Imaging Types " + res.ErrorMessage]);
        }
      });
  }


  setImagingType() {
    let num = 0;
    let typ = '';
    let typeName = '';

    this.imagingTypes.forEach(i => {
      let ipPermissionName = 'Radiology-' + i.ImagingTypeName.replace(' ', '-') + '-selection-Category';
      i['validToSelect'] = false;
      if (this.securityService.HasPermission(ipPermissionName)) {
        i['validToSelect'] = true;
        num++;
        typ = i.ImagingTypeId;
        typeName = i.ImagingTypeName;
        this.allTypeIdList.push(i.ImagingTypeId);
      }

    });

    this.showAll = (num > 1);

    if (this.allTypeIdList && this.allTypeIdList.length) {
      if (!this.selImgType || (this.selImgType == 0)) {
        //if multiple imagingType permission given then -1 else if single imagingType permission given then typ
        this.selImgType = this.showAll ? -1 : typ;
      }
      this.radiologyService.setSelectedImagingType(this.selImgType);
      this.ImagingTypeDropdownOnChange();
    }
  }


  ImagingTypeDropdownOnChange() {
    let imgTypeId = parseInt(this.selImgType);
    let filteredType = this.allTypeIdList.filter(t => (t == imgTypeId));
    let typeName = 'All';

    if (filteredType && filteredType.length) {
      typeName = this.imagingTypes.find(i => i.ImagingTypeId == imgTypeId).ImagingTypeName;
    }

    if (imgTypeId == -1) {
      filteredType = this.allTypeIdList;
    }

    this.radiologyService.setSelectedImagingType(this.selImgType);
    this.inputModelChange.emit({ selectedType: parseInt(this.selImgType), typeList: filteredType, selectedImagingTypeName: typeName });
  }  

}
