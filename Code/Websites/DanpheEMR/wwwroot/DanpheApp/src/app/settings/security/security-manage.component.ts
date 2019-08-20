
import { Component } from "@angular/core";

@Component({
    templateUrl: "../../view/settings-view/SecurityManage.html" //  "/SettingsView/SecurityManage"

})
//testing
export class SecurityManageComponent {
    public showUserList: boolean = true;
    public showRoleList: boolean = false;

    public updateView(category: number): void {
        this.showUserList = (category == 0);
        this.showRoleList = (category == 1);
    }
}