import { Component, ChangeDetectorRef } from '@angular/core'
import { WardSupplyBLService } from './shared/wardsupply.bl.service';
@Component({
    templateUrl:"../../app/wardsupply/wardsupply-pharmacy-stock.html" // "/WardSupplyView/Stock"
})
export class WardPharmacyStockComponent {    
    public isPharmacyStock: boolean= false;
    constructor(){
        this.isPharmacyStock=true;   //shows only pharmacy stock
        ////
    }
}