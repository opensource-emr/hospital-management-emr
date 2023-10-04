import { Component, EventEmitter, Input, Output } from "@angular/core";
import { DepositHead_DTO } from "../../../billing/shared/dto/deposit-head.dto";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { SettingsBLService } from "../../shared/settings.bl.service";


@Component({
    selector: 'deposit-head-add',
    templateUrl: './deposit-head-add.component.html'
})
export class DepositHeadAddComponent {


    @Input("showAddPage")
    public showAddPage: boolean = false;

    @Input("isUpdate")
    public isUpdate: boolean = false;
    public loading: boolean = false;
    public isValid: boolean = false;
    @Input("rowdata") rowData;

    @Input("deposit-head-list")
    public DepositHeadList: Array<DepositHead_DTO> = new Array<DepositHead_DTO>();
    @Output("CallBack-Add-deposit-heads")
    callBackAddDepositHead: EventEmitter<Object> = new EventEmitter<Object>();
    public currentDepositHead: DepositHead_DTO = new DepositHead_DTO();
    public existingDepositHead: DepositHead_DTO;
    constructor(
        public messageBoxService: MessageboxService,
        public settingsBLService: SettingsBLService,
    ) {

    }
    ngOnInit() {
        if (this.isUpdate) {
            this.SetDepositHead();
        }
    }
    Close() {
        this.showAddPage = false;
        this.callBackAddDepositHead.emit(true);
    }

    CheckAddValidations() {
        this.isValid = true;
        if (this.currentDepositHead.DepositHeadName === null && this.currentDepositHead.DepositHeadCode === null) {
            this.isValid = false;
            return this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, ['Please enter Deposit Head Name and Code']);
        }
        let depositHeadCode = this.DepositHeadList.find(d => d.DepositHeadCode == this.currentDepositHead.DepositHeadCode)
        if (depositHeadCode) {
            this.isValid = false;
            return this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ['Duplicate Deposit Head Code is not allowed']);
        }
        let depositHeadName = this.DepositHeadList.find(d => d.DepositHeadName == this.currentDepositHead.DepositHeadName);
        if (depositHeadName) {
            this.isValid = false;
            return this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ['Duplicate Deposit Head Name is not allowed']);
        }
        if (this.currentDepositHead.IsDefault && this.DepositHeadList.some(a => a.IsDefault)) {
            this.isValid = false;
            return this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ['Default Deposit Head cannot be Duplicate']);
        }
    }
    AddDepositHead() {
        this.CheckAddValidations();
        if (this.isValid) {
            this.settingsBLService.AddDepositHead(this.currentDepositHead).finally(() => {
                this.loading = false;
            }).subscribe(
                (res: DanpheHTTPResponse) => {
                    if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                        this.currentDepositHead = new DepositHead_DTO();
                        this.callBackAddDepositHead.emit(true);
                        this.Close();
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ['Deposit Head Added Successfully']);
                    }
                    else {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Failed to add Deposit Head, check log for details"]);
                    }
                },
                err => {
                    this.logError(err);
                });
        }
    }
    logError(ErrorMessage: any) {
        throw new Error("Method not implemented.");
    }
    SetDepositHead() {
        this.existingDepositHead = this.rowData;
        this.currentDepositHead.DepositHeadId = this.rowData.DepositHeadId;
        this.currentDepositHead.DepositHeadCode = this.rowData.DepositHeadCode;
        this.currentDepositHead.DepositHeadName = this.rowData.DepositHeadName;
        this.currentDepositHead.IsDefault = this.rowData.IsDefault;
        this.currentDepositHead.Description = this.rowData.Description;
    }

    CheckUpdateValidations() {
        this.isValid = true;
        if (this.currentDepositHead.DepositHeadName === null && this.currentDepositHead.DepositHeadCode === null) {
            this.isValid = false;
            return this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, ['Please enter Deposit Head Name and Code']);
        }
        let isPresent: boolean = false;
        if (this.existingDepositHead.DepositHeadCode === this.currentDepositHead.DepositHeadCode && this.existingDepositHead.DepositHeadName ===
            this.currentDepositHead.DepositHeadName) {
            isPresent = true;
        }
        let checkDepositHead = this.DepositHeadList.find(d => d.DepositHeadCode === this.currentDepositHead.DepositHeadCode &&
            d.DepositHeadName === this.currentDepositHead.DepositHeadName)
        if (checkDepositHead === undefined && !isPresent) {
            this.isValid = false;
            return this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ['Duplicate Deposit Head Code  and Deposit Head Name is not allowed']);
        }

        if (this.currentDepositHead.IsDefault && this.DepositHeadList.some(a => a.IsDefault)) {
            this.isValid = false;
            return this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ['Default Deposit Head cannot be Duplicate']);
        }


    }
    UpdateDepositHead() {
        this.CheckUpdateValidations();
        if (this.isValid) {
            this.settingsBLService.UpdateDepositHead(this.currentDepositHead).finally(() => {
                this.loading = false;
            }).subscribe(
                (res: DanpheHTTPResponse) => {
                    if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                        this.currentDepositHead = new DepositHead_DTO();
                        this.callBackAddDepositHead.emit(true);
                        this.Close();
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ['Deposit Head Updated Successfully']);
                    }
                    else {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Failed to add Deposit Head, check log for details"]);
                    }
                },
                err => {
                    this.logError(err);
                });
        }
    }
}