import { Component } from "@angular/core";

@Component({
    templateUrl: "./clinical-settings-main.html"
})

export class ClinicalSettingsMainComponent {
    public showReactionList: boolean = true;
    public showICD10GroupList: boolean = false;
    public ShowIntakeOutputParameters: boolean = false;
    public updateView(category: number): void {
        this.showICD10GroupList = false;
        this.showReactionList = (category == 0);
        this.ShowIntakeOutputParameters = false;
    }
    public selectIcd10GroupList(): void {
        this.showReactionList = false;
        this.showICD10GroupList = true;
        this.ShowIntakeOutputParameters = false;
    }
    public IntakeOutputParametrs(): void {
        this.showICD10GroupList = false;
        this.showReactionList = false;
        this.ShowIntakeOutputParameters = true;
    }
}
