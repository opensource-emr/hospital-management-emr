import { Component } from "@angular/core";

@Component({
    templateUrl: "../../view/settings-view/ADTManage.html" // "/SettingsView/ADTManage"

})
export class ADTManageComponent {
    public showWardList: boolean = true;
    public showBedFeatureList: boolean = false;
    public showBedList: boolean = false;
    public showAutoItemList: boolean = false;

    public updateView(category: number): void {
        this.showWardList = (category == 0);
        this.showBedFeatureList = (category == 1);
        this.showBedList = (category == 2);
        this.showAutoItemList = (category == 3);
    }
}