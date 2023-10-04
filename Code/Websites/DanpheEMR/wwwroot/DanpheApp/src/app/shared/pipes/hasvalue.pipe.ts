import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'HasValue'
})
export class HasValuePipe {

    transform(value: string, unit: any): string {
        if (value) {
            var valueWithUnit = value + " " + unit;
            return valueWithUnit;
        }
        else {
            return "";
        }
    }
}