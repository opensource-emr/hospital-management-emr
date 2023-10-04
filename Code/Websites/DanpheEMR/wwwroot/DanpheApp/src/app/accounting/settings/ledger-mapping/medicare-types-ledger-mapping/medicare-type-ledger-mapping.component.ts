
import { Component } from "@angular/core";
import { MedicalCareType } from "../../../../insurance/medicare/shared/medicare-member.model";
import { MedicareBLService } from "../../../../insurance/medicare/shared/medicare.bl.service";
import { DanpheHTTPResponse } from "../../../../shared/common-models";
import { MessageboxService } from "../../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponseText, ENUM_DanpheHTTPResponses, ENUM_Data_Type, ENUM_MessageBox_Status } from "../../../../shared/shared-enums";
import { AccountingService } from "../../../shared/accounting.service";
import { AccountingSettingsBLService } from "../../shared/accounting-settings.bl.service";
import { LedgerModel } from "../../shared/ledger.model";

@Component({
    selector: 'medicare-types-ledger-mapping',
    templateUrl: "./medicare-type-ledger-mapping.component.html"
})

export class MedicareTypesLedgerMappingComponent {
    public mediCareTypeList: Array<MedicalCareType> = new Array<MedicalCareType>();
    public isSelectAll: boolean = false;
    public loading: boolean = false;
    public sourceLedgerList: Array<LedgerModel> = new Array<LedgerModel>();
    public selectedLedger: Array<LedgerModel> = new Array<LedgerModel>();


    constructor(public medicareBlService: MedicareBLService,
        public accountingService: AccountingService,
        public msgBoxServ: MessageboxService,
        public accountingSettingsBLService: AccountingSettingsBLService

    ) {
        this.GetMedicareType();
        this.getLedgerList();
    }
    public GetMedicareType() {
        this.medicareBlService.GetAllMedicareTypes().subscribe(
            (res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    this.mediCareTypeList = new Array<MedicalCareType>();
                    this.mediCareTypeList = res.Results;
                    this.mediCareTypeList.forEach((a, index) => {
                        a.IsSelected = false;
                        this.selectedLedger[index] = this.sourceLedgerList.find(led => led.LedgerId === a.LedgerId);
                    });
                }
            }
        );
    }
    public getLedgerList() {
        if (!!this.accountingService.accCacheData.LedgersALL && this.accountingService.accCacheData.LedgersALL.length > 0) {
            this.sourceLedgerList = this.accountingService.accCacheData.LedgersALL;
            this.sourceLedgerList = this.sourceLedgerList.slice();
        }
    }
    LedgerListFormatter(data: any): string {
        return `${data["Code"]}-${data["LedgerName"]} | ${data["PrimaryGroup"]} -> ${data["LedgerGroupName"]}`;
    }
    SelectAllChkOnChange() {
        if (this.isSelectAll) {
            this.mediCareTypeList.every(a => a.IsSelected = true);
        }
        else {
            this.mediCareTypeList.forEach(a => a.IsSelected = false);
        }
    }
    UpdateMedicareTypes() {
        let selectedMedicareTypeData = this.mediCareTypeList.filter(a => a.IsSelected == true);
        let emptyCheck: boolean = false;

        for (let i = 0; i < selectedMedicareTypeData.length; i++) {
            if (selectedMedicareTypeData[i].LedgerId === null) {
                emptyCheck = true;
                break;
            }
        }
        this.loading = true;
        if (selectedMedicareTypeData.length > 0) {
            if (emptyCheck) {
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, ["Please select Ledger  from the list."]);
            }
            else {
                this.accountingSettingsBLService.UpdateMedicareType(selectedMedicareTypeData).subscribe(
                    (res: DanpheHTTPResponse) => {
                        if (res.Status = ENUM_DanpheHTTPResponses.OK) {
                            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Medicare Type is successfully mapped to the ledger."]);
                        } else {
                            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Unable to map selected Ledger."]);
                        }
                    },
                    (err: DanpheHTTPResponse) => {
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [`Error: ${err.ErrorMessage}`]);
                        this.GetMedicareType();
                        this.loading = false;

                    },
                    () => {

                        this.loading = false;
                    }
                );
            }
        }

        else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ["Please select at least one Ledger from the list."]);
        }
    }
    SingleCkboxChange(index) {
        const mediCareTypeList = this.mediCareTypeList[index];
    }
    AssignSelectedLedger(index) {
        if (typeof this.selectedLedger[index] === ENUM_Data_Type.Object) {
            this.mediCareTypeList[index].LedgerId = this.selectedLedger[index].LedgerId;
        }
    }
}
