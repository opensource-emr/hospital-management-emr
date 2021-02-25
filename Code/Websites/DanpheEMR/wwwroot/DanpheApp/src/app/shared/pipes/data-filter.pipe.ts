import { Pipe, PipeTransform } from '@angular/core';
import { pipe } from '@angular/core/src/render3';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | searchFilter: searchString
 * Example:
 *   let req of requisitions | searchFilter: searchString
*/

@Pipe({ name: 'searchFilter' })

export class SearchFilterPipe implements PipeTransform {
  transform(itemList: any[], searchText: string): Observable<any[]> {
    return of(itemList).pipe(
      delay(500),
      map(d => {
        if (!searchText) { return d };
        if (searchText && searchText.trim() != '') {
          searchText = searchText.toLowerCase();
          return itemList.filter(val => {
            for (var objProp in val) {
              if (val[objProp] ? val[objProp] : val[objProp] == 0) {
                var srchingTxt: string = val[objProp].toString().toLowerCase();
                if (srchingTxt.includes(searchText)) {
                  return true;
                }
              }
            }
            return false;
          });
        } else {
          return itemList;
        }
      }) 
     );
  }
}
