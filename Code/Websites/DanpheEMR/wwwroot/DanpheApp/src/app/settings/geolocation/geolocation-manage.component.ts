import { Component } from "@angular/core";

@Component({
    templateUrl: "../../view/settings-view/GeolocationManage.html" // "/SettingsView/GeolocationManage"
})

export class GeolocationManageComponent {
    public showCountryList: boolean = true;
    public showSubDivision: boolean = false;

    public updateView(category: number): void {
        this.showCountryList = (category == 0);
        this.showSubDivision = (category == 1);
    }
}