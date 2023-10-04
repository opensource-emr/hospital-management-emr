import { Pipe, PipeTransform } from '@angular/core';

import { CommonFunctions } from '../common.functions';

@Pipe({
    name: 'ParseAmount'
})
export class ParseAmount {
    //actionname like: format or diff (for date difference with today)
    transform(inputVal, decimalUpto): any {
        decimalUpto = +decimalUpto;
        if (isNaN(+decimalUpto) || ((decimalUpto % 1) != 0) || (decimalUpto <= 0)) { decimalUpto = 2; }
        return CommonFunctions.parseAmount(inputVal, decimalUpto);
    }
}