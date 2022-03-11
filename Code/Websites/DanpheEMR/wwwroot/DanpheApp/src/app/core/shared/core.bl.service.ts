import { Injectable, Directive } from '@angular/core';
import { CoreDLService } from './core.dl.service';


@Injectable()
export class CoreBLService {
  constructor(public coreDLService: CoreDLService) {}

  public GetParametersList() {
    return this.coreDLService.GetParametersList().map((res) => res);
  }

  //default moduleName will be null.
  public GetLookups(moduleName: string = null) {
    return this.coreDLService.GetLookups(moduleName).map((res) => res);
  }

  public GetAllLookUpDetails(type: number) {
    return this.coreDLService.GetAllLookUpDetails(type).map((res) => res);
  }

  public GetMasterEntities() {
    return this.coreDLService.GetAllMasterEntities().map((res) => res);
  }

  //start: Sud:25Dec'18--to load AppSettings
  public GetAppSettings() {
    return this.coreDLService.GetAppSettings().map((res) => res);
  }
  //end: Sud:25Dec'18--to load AppSettings

  public GetCounter() {
    return this.coreDLService.GetCounter().map((res) => res);
  }

  public GetCodeDetails() {
    return this.coreDLService.GetCodeDetails().map((res) => res);
  }
  public GetFiscalYearList() {
    return this.coreDLService.GetFiscalYearList().map((res) => res);
  }
  public GetsectionList() {
    return this.coreDLService.GetsectionList().map((res) => {
      return res;
    });
  }
  //START: VIKAS:22 Apr 2020: get user level date preference
  public getCalenderDatePreference() {
    return this.coreDLService.getCalenderDatePreference().map((res) => {
      return res;
    });
  }
  //END:VIKAS :22 Apr 2020: get user level date preference

  //pratik:May:27,2021
  public GetPrinterSettingList() {
    return this.coreDLService.GetPrinterSettingList().map((res) => {
      return res;
    });
  }

  public GetAllMunicipalities() {
    return this.coreDLService.GetAllMunicipalities().map((res) => {
      return res;
    });
  }

  public GetLabTypes() {
    return this.coreDLService.GetLabTypes().map((res) => {
      return res;
    });
  }

  public GetAllGovLabComponents() {
    return this.coreDLService.GetAllGovLabComponents();
  }

  public GetPrintExportConfiguration() {
    return this.coreDLService.GetPrintExportConfiguration().map((res) => {
      return res;
    });
  }
}
