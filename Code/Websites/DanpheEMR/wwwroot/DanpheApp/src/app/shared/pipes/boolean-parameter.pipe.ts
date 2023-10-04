import { Pipe, PipeTransform } from '@angular/core';
import { CoreService } from '../../core/shared/core.service';

@Pipe({
  name: 'booleanParameter'
})
export class BooleanParameterPipe implements PipeTransform {

  constructor(public coreService: CoreService) { }

  transform(value: string, arg: string): boolean {
      if (value && arg) {

        const isApplicable = this.coreService.Parameters.filter(p => p.ParameterGroupName === arg
                              && p.ParameterName === value);

        if (isApplicable.length > 0 && isApplicable[0].ParameterValue === 'true') {
           return true;
        } else {
            return false;
        }
      } else {
        return false;
      }
  }
}
