import { Component, EventEmitter } from '@angular/core';

@Component({
    selector: 'pagination',
    inputs: ['itemCount', 'pageSize', 'pageIndex'],
    outputs: ['pageIndexChange'],
    templateUrl: './pagination.component.html',
})

export class Pagination {
    constructor() {
        this.pageSize = 1;
    }

    _itemCount: number;
    get itemCount() {
        return this._itemCount;
    }
    set itemCount(value) {
        this._itemCount = value;
        this.updatePageCount();
    }

    _pageSize: number;
    get pageSize() {
        return this._pageSize;
    }
    set pageSize(value) {
        this._pageSize = value;
        this.updatePageCount();
    }

    _pageCount: number;
    updatePageCount() {
        this._pageCount = Math.ceil(this.itemCount / this.pageSize);
    }

    _pageIndex: number;
    pageIndexChange = new EventEmitter();
    get pageIndex() {
        return this._pageIndex;
    }
    set pageIndex(value) {
        this._pageIndex = value;
        this.pageIndexChange.emit(this.pageIndex);
    }

    get canMoveToNextPage(): boolean {
        return this.pageIndex < this._pageCount - 1 ? true : false;
    }

    get canMoveToPreviousPage(): boolean {
        return this.pageIndex >= 1 ? true : false;
    }

    moveToNextPage() {
        if (this.canMoveToNextPage) {
            this.pageIndex++;
        }
    }

    moveToPreviousPage() {
        if (this.canMoveToPreviousPage) {
            this.pageIndex--;
        }
    }

    moveToLastPage() {
        this.pageIndex = this._pageCount - 1;
    }

    moveToFirstPage() {
        this.pageIndex = 0;
    }
}