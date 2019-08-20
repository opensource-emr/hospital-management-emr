import { Pipe, PipeTransform } from '@angular/core';

import { CommonFunctions } from '../common.functions';
const PADDING = "000000";

@Pipe({
    name: 'Currency'
})

export class Currency {

    public DECIMAL_SEPARATOR: string;
    public THOUSANDS_SEPARATOR: string;

    constructor() {
        this.DECIMAL_SEPARATOR = ".";
        this.THOUSANDS_SEPARATOR = ",";
    }

    transform(value: number | string, fractionSize: number = 2): string {
        value = CommonFunctions.parseAmount(value);
        let [integer, fraction = ""] = (value || "").toString()
            .split(this.DECIMAL_SEPARATOR);

        fraction = fractionSize > 0
            ? this.DECIMAL_SEPARATOR + (fraction + PADDING).substring(0, fractionSize)
            : "";

        var result = integer.toString().split('.');

        var lastThree = result[0].substring(result[0].length - 3);
        var otherNumbers = result[0].substring(0, result[0].length - 3);
        if (otherNumbers != '')
            lastThree = ',' + lastThree;
        var output = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
        
        if (value == 0) {
            return value + fraction;
        }
        else {
            return output + fraction;
        }
    }
}