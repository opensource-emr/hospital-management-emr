import { Component } from "@angular/core";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import GridColumnSettings from "../../../shared/danphe-grid/grid-column-settings.constant";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { BillingBLService } from "../../shared/billing.bl.service";
import { OrganizationDepositList_DTO } from "../../shared/dto/bill-organization-deposits-list.dto";

@Component({
  templateUrl: './bil-org-deposit-receipt-duplicate.component.html',
})

export class BIL_DuplicatePrint_OrganizationDepositListComponent {
  public duplicateBillGrid: Array<any> = null;
  public depositList = new Array<OrganizationDepositList_DTO>();
  public showReceipt: boolean = false;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public depositId: number = null;

  constructor(private messageBoxService: MessageboxService, private billingBlService: BillingBLService) {
    this.duplicateBillGrid = GridColumnSettings.DuplicateOrganizationDepositReceiptList;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('ReceiptDate', true));
  }


  ngOnInit(): void {
    this.GetOrganizationDeposits();
  }

  GetOrganizationDeposits(): void {
    this.billingBlService.GetOrganizationDepositLists().subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results.length) {
        this.depositList = res.Results;
      } else {
        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["No Data to Display"]);
      }
    });
  }

  DuplicateReceiptGridActions($event: GridEmitModel): void {
    switch ($event.Action) {
      case "showDetails":
        {
          this.depositId = $event.Data.DepositId;
          this.showReceipt = true;
          break;
        }

      default:
        break;
    }
  }

  CloseDepositReceiptPopUp(): void {
    this.showReceipt = false;
    this.depositId = null;
  }
}
