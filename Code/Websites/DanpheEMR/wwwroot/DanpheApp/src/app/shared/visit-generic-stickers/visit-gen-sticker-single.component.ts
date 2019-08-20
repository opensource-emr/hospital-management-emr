import { Component, Input, Output, EventEmitter } from "@angular/core";
import { VisitGenericStickerModel } from "./visit-generic-sticker.model";


@Component({
    selector: 'visit-gen-sticker-single',
    templateUrl: "./visit-gen-sticker-single.html"
})

export class VisitSticker_Generic_Single_Component {

    @Input("sticker-info")
    public ipStickerInfo: VisitGenericStickerModel = new VisitGenericStickerModel();

    public visitStickerInfo = null;




    constructor() {

    }

    ngOnInit() {
        if (this.ipStickerInfo) {
            this.visitStickerInfo = this.ipStickerInfo;
            //console.log("inside generic sticker ngOnInit");
            //console.log(this.ipStickerInfo);
        }
        //console.log("visit sticker single component");
        //console.log(this.visitStickerInfo);
    }

}