
import { Component } from "@angular/core";

@Component({
    templateUrl: "../../view/settings-view/RadiologyManage.html" // "/SettingsView/RadiologyManage"

})
//testing
export class RadiologyManageComponent {
    public showImgTypeList: boolean = true;
    public showImgItemList: boolean = false;
    public showRADReportTemplateList: boolean = false;

    public updateView(category: number): void {
        this.showImgTypeList = (category == 0);
        this.showImgItemList = (category == 1);
        this.showRADReportTemplateList = (category == 2);
    }
}