import { Component, Input, Output, EventEmitter } from "@angular/core";
import { VisitGenericStickerModel } from "./visit-generic-sticker.model";

@Component({
    selector: 'visit-gen-sticker-print',
    templateUrl: "./visit-generic-stickers-print.html",
    host: { '(window:keydown)': 'hotkeys($event)' }
})

export class VisitSticker_Generic_PrintComponent {

    @Output("on-popup-closed")
    closePopup: EventEmitter<Object> = new EventEmitter<Object>();

    @Input("single-sticker-info")
    ipVisitInfo = null;


    visitStickerInfo: VisitGenericStickerModel = null;


    constructor() {

    }

    ngOnInit() {
        if (this.ipVisitInfo) {
            this.visitStickerInfo = this.ipVisitInfo;
        }

    }


    CloseWindow() {
        this.closePopup.emit(true);
    }

    PrintStickers() {
        let popupWinindow;
        var printContents = document.getElementById("visitStickersPrintPage").innerHTML;
        popupWinindow = window.open('', '_blank', 'width=1600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        popupWinindow.document.open();
        popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body style="margin:0px !important;" onload="window.print()">' + printContents + '</body></html>');

        popupWinindow.document.close();

    }

    public hotkeys(event) {
        if (event.keyCode == 27) {
            this.CloseWindow();
        }
    }

}