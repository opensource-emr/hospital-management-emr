import { Component, Input } from '@angular/core';
import * as JsBarcode from 'jsbarcode'
@Component({
    selector: 'danphe-bar-code',
    templateUrl: './danphe-bar-code.html'
})
//for implement barcode we have to add <danphe-bar-code> selector  
export class DanpheBarCodeComponent {

    @Input("barcode-number")
    public BarcodeNum: string = "";
    @Input("width")
    public Width: number = 1.5;
    @Input("height")
    public Height: number = 30;

    @Input("font-size")
    public fontSize: number = 14;

    @Input("text-margin")
    public textMargin: number = 1;//this is not pixel, could be Percent.. (need to check.)
    @Input("barcode-margin")
    barcodeMargin: number = 10;

    @Input("show-value")
    showValue: boolean = true;
    constructor() {

    }

    ngOnInit() {
        //JsBarcode(".barcode").init();
        JsBarcode("#barcode", this.BarcodeNum, {
            width: this.Width,
            height: this.Height,
            fontSize: this.fontSize,
            textMargin: this.textMargin,
            margin: this.barcodeMargin,
            displayValue: this.showValue
        });
    }


    //GenerateCode() {
    //    JsBarcode("#barcode", this.BarcodeNum);
    //}

}
