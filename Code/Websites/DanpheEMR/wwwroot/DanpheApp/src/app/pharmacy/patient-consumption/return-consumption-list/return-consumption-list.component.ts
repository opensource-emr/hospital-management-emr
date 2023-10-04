import { Component } from '@angular/core';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponseText, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { PharmacyBLService } from '../../shared/pharmacy.bl.service';
import { PHRMPatientConsumption } from '../shared/phrm-patient-consumption.model';
import { ReturnPatientConsumptionDTO } from '../shared/return-patient-consumption-dto.model';

@Component({
  selector: 'app-return-consumption-list',
  templateUrl: './return-consumption-list.component.html',
  host: { '(window:keydown)': 'hotkeys($event)' }

})
export class ReturnConsumptionListComponent {

  PatientConsumptionReturnColumns: Array<any> = null;
  PatientConsumptionReturnList: ReturnPatientConsumptionDTO[] = [];
  NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  showPrintPage: boolean = false;
  PatientConsumption: PHRMPatientConsumption = new PHRMPatientConsumption();
  isConsumptionReturnReceipt: boolean = false;
  PatientConsumptionReturnReceiptNo: number = null;

  constructor(public pharmacyBLService: PharmacyBLService,
    public messageBoxService: MessageboxService) {
    this.PatientConsumptionReturnColumns = GridColumnSettings.PatientConsumptionReturnColumn;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('CreatedOn', false));
  }

  ngOnInit() {
    this.GetPatientConsumptionReturnList();
  }
  PatientConsumptionReturnGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "view": {
        if ($event.Data != null) {
          this.PatientConsumptionReturnReceiptNo = $event.Data.ConsumptionReturnReceiptNo;
          this.showPrintPage = true;
        }
        break;
      }
      default:
        break;
    }
  }

  GetPatientConsumptionReturnList() {
    this.pharmacyBLService.GetPatientConsumptionReturnList().subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
        this.PatientConsumptionReturnList = res.Results;
      }
      else {
        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to load data']);
      }
    },
      err => {
        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to load data. See console for more info.']);
      })
  }

  ClosePrintPage() {
    this.showPrintPage = false;
  }

  public hotkeys(event) {
    if (event.keyCode === 27) {
      //For ESC key => close the pop up
      this.ClosePrintPage();
    }
  }

}
