import { Component } from "@angular/core";

@Component({
    templateUrl: "../../view/settings-view/DepartmentsManage.html" // "/SettingsView/DepartmentsManage"

})
export class DepartmentsManageComponent {
    public showDepartment: boolean = true;
    public showServiceDepartment: boolean = false;

    public updateView(category: number): void {
        this.showDepartment = (category == 0);
        this.showServiceDepartment = (category == 1);
    }
}