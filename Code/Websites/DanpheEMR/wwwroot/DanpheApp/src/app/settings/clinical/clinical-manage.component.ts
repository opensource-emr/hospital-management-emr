import { Component } from "@angular/core";

@Component({
    templateUrl: "../../view/settings-view/ClinicalManage.html" //"/SettingsView/ClinicalManage"
})

export class ClinicalManageComponent {

    public showReactionList: boolean = true;
    public updateView(category: number): void {
        this.showReactionList = (category == 0);
    }
}