import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'ItemListFilter' })
export class ItemListFilterPipe implements PipeTransform {

    transform(list: any[], filterText: string): any {
        return list ? list.filter(item => item.ItemName.search(new RegExp(filterText, 'i')) > -1) : [];
    }
}
