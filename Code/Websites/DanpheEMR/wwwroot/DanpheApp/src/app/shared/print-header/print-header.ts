import { Component, Input } from "@angular/core"

@Component({
    selector: "print-header",
    templateUrl: "./print-header.html",

})


export class PrintHeaderComponent {

    @Input("unit-name")
    public unitname: string = "PHARMACY UNIT";


}