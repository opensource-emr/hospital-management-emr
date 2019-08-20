import { Pipe, PipeTransform } from '@angular/core';

import { CommonFunctions } from '../common.functions';

@Pipe({
    name: 'ParseAmount'
})
export class ParseAmount {
    //actionname like: format or diff (for date difference with today)
    transform(inputVal): any {
        return CommonFunctions.parseAmount(inputVal);
    }
} 