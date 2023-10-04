import { Pipe, PipeTransform } from '@angular/core';

import { CommonFunctions } from '../common.functions';

@Pipe({
    name: 'CapitalFirstLetter'
})
export class CapitalFirstLetter {
    transform(inputVal): any {
        return CommonFunctions.CapitalizeFirstLetter(inputVal);
    }
} 