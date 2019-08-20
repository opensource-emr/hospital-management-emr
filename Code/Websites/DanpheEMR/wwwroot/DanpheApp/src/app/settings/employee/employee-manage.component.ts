import { Component } from '@angular/core'
@Component({
    templateUrl: "../../view/settings-view/EmployeeManage.html" // "/SettingsView/EmployeeManage"
})

// App Component class
export class EmployeeManageComponent {
    public showEmployeeList: boolean = true;
    public showEmployeeRoleList: boolean = false;
    public showEmployeeTypeList: boolean = false;

    public updateView(category: number): void {
        this.showEmployeeList = (category == 0);
        this.showEmployeeRoleList = (category == 1);
        this.showEmployeeTypeList = (category == 2);
    }
}