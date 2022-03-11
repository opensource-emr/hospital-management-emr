
import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';

export class QuoatationVm{
    ItemNameList : string[];
    QuotationRates : QuotationRatesDto[];
}
export class QuotationRatesDto{
    VendorId : number;
    VendorName : string;
    ItemDetails : QuotationRatesComparisionDTO[]
}
export class QuotationRatesComparisionDTO{
    ItemName: string = "";
    ItemId: number = 0;
    Price: number = 0;
    Status : string;
}