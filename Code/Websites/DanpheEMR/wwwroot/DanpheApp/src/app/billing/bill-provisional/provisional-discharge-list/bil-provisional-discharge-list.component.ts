import { Component } from "@angular/core";
import { Patient } from "../../../patients/shared/patient.model";
import { PatientService } from "../../../patients/shared/patient.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import GridColumnSettings from "../../../shared/danphe-grid/grid-column-settings.constant";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status, ENUM_ProvisionalBillingContext } from "../../../shared/shared-enums";
import { BillingBLService } from "../../shared/billing.bl.service";
import { ProvisionalDischargeList_DTO } from "../../shared/dto/bill-provisional-discharge-list.dto";

@Component({
  selector: 'provisional-discharge-list',
  templateUrl: './bil-provisional-discharge-list.component.html'
})
export class BilProvisionalDischargeListComponent {

  public ProvisionalDischargeListCols: any;
  public ProvisionalDischargeList = new Array<ProvisionalDischargeList_DTO>();
  public NepaliDateInGridSettings = new NepaliDateInGridParams();
  public ShowProvisionalItems: boolean = false;
  public SelectedProvisionalContext = { PatientId: null, SchemeId: null, PriceCategoryId: null, PatientVisitId: null, ProvisionalBillingContext: null };
  public ProvisionalDischargedOn: string = "";
  public DepositBalance: number = 0;

  constructor(private _billingBlService: BillingBLService, private _msgBoxService: MessageboxService, private _patientService: PatientService) {
    this._patientService.globalPatient = new Patient();
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('AdmittedOn', true));
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('ProvisionalDischargedOn', true));
  }

  ngOnInit(): void {
    this.ProvisionalDischargeListCols = GridColumnSettings.ProvisionalDischargeListGridColumns;
    this.GetProvisionalDischargeList();
  }

  private GetProvisionalDischargeList(): void {
    this._billingBlService.GetProvisionalDischargeList().subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK) {
        this.ProvisionalDischargeList = res.Results;
      } else {
        this._msgBoxService.showMessage(ENUM_MessageBox_Status.Failed, [`Cannot fetch Provisional Discharge List`]);
      }
    }, err => {
      console.log(err);
    });
  }
  public ProvisionalDischargeListGridAction($event: GridEmitModel): void {
    if ($event) {
      console.info($event);
      if ($event.Action === 'viewDetails') {
        const data = $event.Data;
        if (data) {
          this.SelectedProvisionalContext.PatientId = data.PatientId;
          this.SelectedProvisionalContext.SchemeId = data.SchemeId;
          this.SelectedProvisionalContext.PriceCategoryId = data.PriceCategoryId;
          this.SelectedProvisionalContext.PatientVisitId = data.PatientVisitId;
          this.ProvisionalDischargedOn = data.ProvisionalDischargedOn;
          this.DepositBalance = data.DepositAmount;
          this.SelectedProvisionalContext.ProvisionalBillingContext = ENUM_ProvisionalBillingContext.ProvisionalDischarge;
          this.ShowProvisionalItems = true;
        } else {
          this._msgBoxService.showMessage(ENUM_MessageBox_Status.Failed, [`Cannot View Provisional Items`]);
        }
      }
    }
  }

  public OnProvisionalItemsCallBack($event): void {
    if ($event) {
      this.ShowProvisionalItems = false;
      this.GetProvisionalDischargeList();
    }
  }
}
