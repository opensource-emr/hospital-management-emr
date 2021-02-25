import { Component } from '@angular/core'
import { ENUM_TermsApplication } from '../../shared/shared-enums'

@Component({
    selector: 'my-app',
    templateUrl: "../../view/inventory-view/Settings/SettingsMain.html" // "/InventorySettingView/Settings"
})
export class InventorySettingsComponent {
    public TermsApplicationId : number = ENUM_TermsApplication.Inventory;
}
