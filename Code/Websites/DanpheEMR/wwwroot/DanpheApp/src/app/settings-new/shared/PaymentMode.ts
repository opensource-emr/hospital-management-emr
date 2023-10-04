export class PaymentModes {
    PaymentSubCategoryId : number = 0;
    PaymentSubCategoryName : string = '';
    PaymentMode : string = '';
    ShowInMultiplePaymentMode : boolean = false;
    IsSelected : boolean = false;
    Amount : number = 0;
    PaymentDetail : string = null;
    ShowPaymentDetails: boolean = false;
    IsRemarksMandatory: boolean = false;
    IsValidAmount : boolean = true;
}