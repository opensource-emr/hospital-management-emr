import { Component } from "@angular/core";

@Component({
    template: ''  // "../../../view/inventory-view/Settings/VendorsManage.html"  //"/InventorySettings/VendorsManage"

})
export class VendorsManageComponent {
    public showVendor: boolean = true;
   

    public updateView(category: number): void {
        this.showVendor = (category == 0);
        
    }
}