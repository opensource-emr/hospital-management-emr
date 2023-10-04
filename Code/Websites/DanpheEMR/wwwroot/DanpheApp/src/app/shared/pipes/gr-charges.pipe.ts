import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'grCharges' })
export class GRChargesPipe implements PipeTransform {
    transform(charges): string {
        var chargesToShow = "";
        charges.forEach(b => {
            chargesToShow += b.ChargeName + " : " + b.TotalAmount + ",  "
        });
        chargesToShow = chargesToShow.substring(0, chargesToShow.length - 3);
        return chargesToShow;
    }
}