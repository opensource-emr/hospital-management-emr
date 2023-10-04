import { Pipe, PipeTransform } from "@angular/core";
@Pipe({ name: 'paymentDetails' })
export class PaymentDetailsPipe implements PipeTransform {
    transform(data): string {
        var detailsToShow = "";
        data.forEach(b => {
            detailsToShow += b.PaymentSubCategoryName + " : " + b.InAmount + ",  "
        });
        detailsToShow = detailsToShow.substring(0, detailsToShow.length - 3);
        return detailsToShow;
    }
}