import { Component } from "@angular/core";

@Component({
    templateUrl: "./clinical-settings-main.html"
})

export class ClinicalSettingsMainComponent {
    public showReactionList: boolean = true;
    public updateView(category: number): void {
        this.showReactionList = (category == 0);
    }
}
