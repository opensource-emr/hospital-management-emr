import { Directive, ElementRef, OnInit, Input, AfterViewChecked } from '@angular/core';

import * as cornerstone from 'cornerstone-core';


@Directive({
  selector: '[thumbnail]',
})

export class ThumbnailDirective implements OnInit, AfterViewChecked {

  @Input() public imageData: any;

  public element: any;

  constructor(private elementRef: ElementRef) {
  }

  ngOnInit() {
    // Retrieve the DOM element itself
    this.element = this.elementRef.nativeElement;

    // Enable the element with Cornerstone
    cornerstone.enable(this.element);
    this.setImageData(this.imageData);
  }

  ngAfterViewChecked() {
    this.refresh();
  }

  public refresh() {
    this.setImageData(this.imageData);
  }

  public setImageData(image) {
    this.imageData = image;
    if (this.imageData && this.element) {
      const viewport = cornerstone.getDefaultViewportForImage(this.element, this.imageData);
      cornerstone.displayImage(this.element, this.imageData, viewport);
      // Fit the image to the viewport window
      cornerstone.fitToWindow(this.element);
      cornerstone.resize(this.element, true);
    }

  }
}
