import { ChangeDetectorRef, Component } from "@angular/core";
import { DepositHead_DTO } from "../../../billing/shared/dto/deposit-head.dto";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponseText, ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { SettingsService } from "../../shared/settings-service";
import { SettingsBLService } from "../../shared/settings.bl.service";


@Component({
    templateUrl: './deposit-head-list.component.html',
})
export class DepositHeadListComponent {

    public showAddPage: boolean = false;
    public isUpdate: boolean = false;
    public showGrid: boolean = false;
    public depositHeadList: Array<DepositHead_DTO> = new Array<DepositHead_DTO>();
    public depositHeadGridColumns: Array<any> = null;
    public selectedDepositHead: DepositHead_DTO;
    public depositHeadData: { depositHeadId: number, isActive: boolean } = { depositHeadId: 0, isActive: false }





    constructor(
        public settingsBLService: SettingsBLService,
        public settingsServ: SettingsService,
        public messageBoxService: MessageboxService,
        public changeDetector: ChangeDetectorRef,) {
        this.depositHeadGridColumns = this.settingsServ.settingsGridCols.depositHeadList;
        this.GetDepositHead();
    }


    ShowAddPage() {
        this.showAddPage = true;
        this.isUpdate = false;
    }
    DepositHeadsGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "edit": {
                this.selectedDepositHead = null;
                this.selectedDepositHead = $event.Data;
                this.isUpdate = true;
                this.showAddPage = true;
                break;
            }
            case "activateDeactivate": {
                if ($event.Data != null) {
                    this.selectedDepositHead = null;
                    let rowdata = $event.Data;
                    this.selectedDepositHead = rowdata;
                    this.ActivateDeactivateDepositheadStatus(this.selectedDepositHead);
                }
                break;
            }
            default:
                break;
        }
    }


    ActivateDeactivateDepositheadStatus(currDepositHead: DepositHead_DTO) {
        if (currDepositHead !== null) {
            let status = currDepositHead.IsActive === true ? false : true;
            this.depositHeadData.depositHeadId = currDepositHead.DepositHeadId;
            this.depositHeadData.isActive = status;
            if (status === true) {
                currDepositHead.IsActive = status;
                this.ChangeActiveStatus(this.depositHeadData);
            } else {
                if (confirm("Are you Sure want to Deactivate " + ' Selected Deposit Head ?')) {
                    currDepositHead.IsActive = status;
                    this.ChangeActiveStatus(this.depositHeadData);
                }
            }
        }

    }
    ChangeActiveStatus(depositHeadData) {
        this.settingsBLService.ActivateDeactivateDepositHeadStatus(depositHeadData.depositHeadId)
            .subscribe(
                res => {
                    if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                        this.GetDepositHead();
                        let responseMessage = res.Results.IsActive ? "Deposit Head is now Activated." : "Deposit Head is now Deactivated.";
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [responseMessage]);

                    }
                    else {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ['Something went wrong' + res.ErrorMessage]);
                    }
                },
                err => {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [err]);
                });

    }


    GetDepositHead() {
        this.settingsBLService
            .GetDepositHead()
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.depositHeadList = res.Results;
                    this.showGrid = true;

                } else {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [
                        "No Default Deposit Head Found",
                    ]);
                }
            });
    }
    CallBackAddDepositHead($event) {
        this.showAddPage = false;
        this.GetDepositHead();
    }
}
