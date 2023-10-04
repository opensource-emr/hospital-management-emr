import { Component, ViewChild, OnInit, Input, ViewChildren, ElementRef, ChangeDetectorRef } from '@angular/core';
import { DropEvent } from 'angular-draggable-droppable';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Hammer from 'hammerjs';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools/dist/cornerstoneTools';
import * as cornerstoneMath from 'cornerstone-math';
import { DicomDataModel, DicomFileModel } from '../shared/dicom-load-study.model';
import { CornerstoneDirective } from './dicom-viewer.cornerstone.directive';
import { ThumbnailDirective } from './dicom-viewer.thumbnail.directive';


@Component({
  selector: 'dicom-viewer',
  templateUrl: './dicom-viewer.component.html',
  styleUrls: ['./dicom-viewer.component.css']
})
export class DICOMViewerComponent implements OnInit {

  private DicomToolDataByDicomFileId = [];
  private headers: HttpHeaders;
  private showDicomViewerPage: boolean = false;
  @ViewChild('panzoomDiv') panzoomDiv: ElementRef;
  @Input() public enableViewerTools = false; // enable viewer tools
  @Input() public maxImagesToLoad = 100; // limit for the automatic loading of study images
  @Input("showDicomViewerPage")
  public set value(val: boolean) {
    this.showDicomViewerPage = val;
  }
  private accessPointUrl1: string = "/api/Dicom";
  private accessPointUrlFileToolData: string = "/api/Dicom?reqType=dicomFileToolData&dicomFileId=";
  private isCornerstoneEnabled = false;
  public dicomImageData: DicomDataModel = new DicomDataModel();
  public imageData: Array<DicomDataModel> = Array<DicomDataModel>();
  public dicomFileData: DicomFileModel = new DicomFileModel();
  public seriesList = []; // list of series on the images being displayed
  public currentSeriesIndex = 0;
  public currentSeries: any = {};
  public imageCount = 0; // total image count being viewed


  // control enable/disable image scroll buttons
  public get hidePreviousImage(): any { return { color: (this.viewPort.currentIndex < 1) ? 'black' : 'white' }; }
  public get hideNextImage(): any { return { color: (this.viewPort.currentIndex >= (this.imageCount - 1)) ? 'black' : 'white' }; }

  // control message for more images to load
  public get moreImagestoLoad(): string {
    if (this.loadedImages.length < this.imageIdList.length && !this.loadingImages) { // are there any more images to load?
      const imagesToLoad = (this.maxImagesToLoad <= 0) ? (this.imageIdList.length - this.loadedImages.length) : Math.min(this.maxImagesToLoad, this.imageIdList.length - this.loadedImages.length);
      return imagesToLoad.toString();
    } else return '';
  }

  // control exhibition of a loading images progress indicator
  public loadingImages = false;
  public get showProgress(): any { return { display: (this.loadingImages) ? 'inline-block' : 'none' } };

  @ViewChild(CornerstoneDirective) viewPort: CornerstoneDirective; // the main cornertone view port
  @ViewChildren(ThumbnailDirective) thumbnails: Array<ThumbnailDirective>;

  private loadedImages = [];
  private imageIdList = [];
  private element: any;
  private targetImageCount = 0;

  public pathToImage: string = "";

  constructor(public _router: Router,
    private elementRef: ElementRef,
    public _http: HttpClient,
    public _changedef: ChangeDetectorRef) {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    this.pathToImage = "../../../../themes/theme-default/images/loading.gif";

  }

  ngOnInit() {
    this.element = this.viewPort.element;
    cornerstoneTools.external.cornerstone = cornerstone;// initialize cornerstone
    cornerstoneTools.external.Hammer = Hammer;// initial hammer
    cornerstoneTools.external.cornerstoneMath = cornerstoneMath;//initialize cornerstoneMath
    this.DicomToolDataByDicomFileId = [];
  }
  /**
  * Load dicom images for display
  *
  * @param imageIdList list of imageIds to load and display
  */
  loadStudyImages(imageIdList: Array<any>) {
    var imageId = imageIdList;
    this.element = this.viewPort.element;
    this.imageIdList = imageIdList;
    this.viewPort.resetViewer();
    this.viewPort.resetImageCache(); // clean up image cache
    this.seriesList = []; // start a new series list
    this.currentSeriesIndex = 0; // always display first series
    this.loadedImages = []; // reset list of images already loaded

    //loop through all imageIds, load and cache them for exhibition (up the the maximum limit defined)
    const maxImages = (this.maxImagesToLoad <= 0) ? imageIdList.length : Math.min(this.maxImagesToLoad, imageIdList.length);
    this.loadingImages = true; // activate progress indicator
    this.targetImageCount = maxImages;
    for (let index = 0; index < maxImages; index++) {
      const imageId = imageIdList[index];
      cornerstone.loadAndCacheImage(imageId).then(imageData => {
        this.imageLoaded(imageData)

      });
    }

  }

  /**
    * Load the next batch of images
    */
  public loadMoreImages() {
    this.element = this.viewPort.element;
    //
    // loop through all imageIds, load and cache them for exhibition (up the the maximum limit defined)
    //
    const maxImages = (this.maxImagesToLoad <= 0) ? (this.imageIdList.length - this.loadedImages.length) : Math.min(this.maxImagesToLoad, this.imageIdList.length - this.loadedImages.length);
    this.loadingImages = true; // activate progress indicator
    this.targetImageCount += maxImages;
    let nextImageIndex = this.loadedImages.length;
    for (let index = 0; index < maxImages; index++) {
      const imageId = this.imageIdList[nextImageIndex++];
      cornerstone.loadAndCacheImage(imageId)
        .then(imageData => { this.imageLoaded(imageData) })
        .catch(err => { this.targetImageCount--; });
    }

  }



  /**
   *
   * @param imageData the dicom image data
   */
  imageLoaded(imageData) {

    const series = {
      studyID: imageData.data.string('x0020000d'),
      seriesID: imageData.data.string('x0020000e'),
      seriesNumber: imageData.data.intString('x00200011'),
      studyDescription: imageData.data.string('x00081030'),
      seriesDescription: imageData.data.string('x0008103e'),
      imageCount: 1,
      imageList: [imageData]
    }

    // if this is a new series, add it to the serieslist
    let seriesIndex = this.seriesList.findIndex(item => item.seriesID === series.seriesID);
    if (seriesIndex < 0) {
      seriesIndex = this.seriesList.length;
      this.seriesList.push(series);
      this.seriesList.sort((a, b) => {
        if (a.seriesNumber > b.seriesNumber) return 1;
        if (a.seriesNumber < b.seriesNumber) return -1;
        return 0;
      })
    } else {
      let seriesItem = this.seriesList[seriesIndex];
      seriesItem.imageCount++;
      seriesItem.imageList.push(imageData);
      seriesItem.imageList.sort((a, b) => {
        if (a.data.intString('x00200013') > b.data.intString('x00200013')) return 1;
        if (a.data.intString('x00200013') < b.data.intString('x00200013')) return -1;
        return 0;
      })
    }

    this.loadedImages.push(imageData); // save to images loaded

    if (seriesIndex === this.currentSeriesIndex) {

      this.showSeries(this.currentSeriesIndex)
    }

    if (this.loadedImages.length >= this.targetImageCount) { // did we finish loading images?
      this.loadingImages = false; // deactivate progress indicator
    }

  }

  public showSeries(index) {
    this.currentSeriesIndex = index;
    this.currentSeries = this.seriesList[index];
    this.imageCount = this.currentSeries.imageCount; // get total image count
    this.viewPort.resetImageCache(); // clean up image cache
    for (let i = 0; i < this.currentSeries.imageList.length; i++) {
      const imageData = this.currentSeries.imageList[i];
      this.viewPort.addImageData(imageData);
    }
  }

  // downLoadedImages
  public downloadImagesURL() {
    cornerstoneTools.saveAs(this.element, "DicomImage.jpg")
  }


  /**
   * Image scroll methods
   */
  public nextImage() {
    cornerstoneTools.stopClip(this.element);
    if (this.viewPort.currentIndex < this.imageCount) {
      this.viewPort.nextImage();
    }
  }

  public previousImage() {
    cornerstoneTools.stopClip(this.element);
    if (this.viewPort.currentIndex > 0) {
      this.viewPort.previousImage();
    }
  }

  /**
   * Methods to activate/deactivate viewer tools
   */

  // deactivate all tools
  public resetAllTools() {
    if (this.imageCount > 0) {
      cornerstoneTools.wwwc.disable(this.element, 1);
      cornerstoneTools.pan.deactivate(this.element, 2);
      cornerstoneTools.zoom.deactivate(this.element, 4);
      cornerstoneTools.probe.deactivate(this.element, 1);
      cornerstoneTools.length.deactivate(this.element, 1);
      cornerstoneTools.simpleAngle.deactivate(this.element, 1);
      cornerstoneTools.ellipticalRoi.deactivate(this.element, 1);
      cornerstoneTools.rectangleRoi.deactivate(this.element, 1);
      cornerstoneTools.stackScroll.deactivate(this.element, 1);
      cornerstoneTools.wwwcTouchDrag.deactivate(this.element);
      cornerstoneTools.zoomTouchDrag.deactivate(this.element);
      cornerstoneTools.panTouchDrag.deactivate(this.element);
      cornerstoneTools.stackScrollWheel.deactivate(this.element);
      cornerstoneTools.stackScrollTouchDrag.deactivate(this.element, 1);
      cornerstoneTools.magnify.deactivate(this.element, 1);
      cornerstoneTools.rotate.deactivate(this.element, 1);
      cornerstoneTools.arrowAnnotate.deactivate(this.element, 1);
      this.stopClip();
    }
  }
  // activate windowing
  public enableWindowing() {

    if (this.imageCount > 0) {
      this.resetAllTools();
      cornerstoneTools.wwwc.activate(this.element, 1);
      cornerstoneTools.wwwcTouchDrag.activate(this.element);
    }
  }

  // activate zoom
  public enableZoom() {
    if (this.imageCount > 0) {
      this.resetAllTools();
      cornerstoneTools.zoom.activate(this.element, 5);// 5 is middle mouse button and left mouse button
      cornerstoneTools.zoomTouchDrag.activate(this.element);
    }
  }

  // activate pan
  public enablePan() {
    if (this.imageCount > 0) {
      this.resetAllTools();
      cornerstoneTools.pan.activate(this.element, 3); // 3 is middle mouse button and left mouse button
      cornerstoneTools.panTouchDrag.activate(this.element);
    }
  }


  // activate image scroll
  public enableScroll() {
    if (this.imageCount > 0) {
      this.resetAllTools();
      cornerstoneTools.stackScroll.activate(this.element, 1);
      cornerstoneTools.stackScrollTouchDrag.activate(this.element);
      cornerstoneTools.stackScrollKeyboard.activate(this.element);
    }
  }
  // activate angle measurement
  public enableAnotation() {
    if (this.imageCount > 0) {
      this.resetAllTools();
      cornerstoneTools.arrowAnnotate.activate(this.element, 1);
      cornerstoneTools.arrowAnnotateTouch.activate(this.element);
    }
  }

  // activate length measurement
  public enableLength() {
    if (this.imageCount > 0) {
      this.resetAllTools();
      cornerstoneTools.length.activate(this.element, 1);
    }
  }

  // activate angle measurement
  public enableAngle() {
    if (this.imageCount > 0) {
      this.resetAllTools();
      cornerstoneTools.simpleAngle.activate(this.element, 1);
    }
  }

  // activate pixel probe
  public enableProbe() {
    if (this.imageCount > 0) {
      this.resetAllTools();
      cornerstoneTools.probe.activate(this.element, 1);
      cornerstoneTools.probe.getConfiguration();
    }
  }

  // activate Elliptical ROI
  public enableElliptical() {
    if (this.imageCount > 0) {
      this.resetAllTools();
      cornerstoneTools.ellipticalRoi.activate(this.element, 1);
    }
  }

  // activate Rectangle ROI
  public enableRectangle() {
    if (this.imageCount > 0) {
      this.resetAllTools();
      cornerstoneTools.rectangleRoi.activate(this.element, 1);
    }
  }

  // Play Clip
  public playClip() {
    if (this.imageCount > 0) {
      let frameRate = 10;
      let stackState = cornerstoneTools.getToolState(this.element, 'stack');
      if (stackState) {
        frameRate = stackState.data[0].frameRate;
        // Play at a default 10 FPS if the framerate is not specified
        if (frameRate === undefined) {
          frameRate = 15;
        }
      }
      cornerstoneTools.playClip(this.element, frameRate);
    }
  }

  // SlowMotion
  public SlowMotion() {
    if (this.imageCount > 0) {
      let frameRate = 3;
      let stackState = cornerstoneTools.getToolState(this.element, 'stack');
      if (stackState) {
        frameRate = stackState.data[0].frameRate;
        // Play at a default 3 FPS if the framerate is not specified
        if (frameRate === undefined) {
          frameRate = 3;
        }
      }
      cornerstoneTools.playClip(this.element, frameRate);
    }
  }

  // Stop Clip
  public stopClip() {

    cornerstoneTools.stopClip(this.element);
  }

  //Magnify
  public magnify() {
    if (this.imageCount > 0) {
      this.resetAllTools();
      cornerstoneTools.magnify.activate(this.element, 1);
    }
  }
  //Rotate
  public rotate() {
    if (this.imageCount > 0) {
      this.resetAllTools();
      cornerstoneTools.rotate.activate(this.element, 1);
    }
  }

  // invert image
  public invertImage() {
    if (this.imageCount > 0) {
      let viewport = cornerstone.getViewport(this.element);
      // Toggle invert
      if (viewport.invert === true) {
        viewport.invert = false;
      } else {
        viewport.invert = true;
      }
      cornerstone.setViewport(this.element, viewport);
    }
  }

  //Save FileToolData in DataBase
  public save() {
    if (this.viewPort.currentIndex < this.imageCount) {

      var element = document.getElementById("dicomImage");
      var allToolData = {};

      // Decide which tool types you want to serialize
      var toolTypes = ['length', 'angle', 'simpleAngle', 'probe', 'ellipticalRoi', 'rectangleRoi', 'arrowAnnotate'];

      // Loop through all the tool types
      for (var i = 0; i < toolTypes.length; i++) {
        // Get the tool data for this tool type
        var toolType = toolTypes[i];
        var toolData = cornerstoneTools.getToolState(element, toolType);

        if (toolData !== undefined) {
          // Put it into an object
          allToolData[toolTypes[i]] = toolData;
        }
      }

      // let input = new FormData();
      var toolDataString = JSON.stringify(allToolData);
      var dicomFileData: any = {};
      dicomFileData.FileToolData = toolDataString;
      dicomFileData.DicomFileId = this.getDicomFileId(this.viewPort.currentImage.imageId);
      var data = JSON.stringify(dicomFileData);

      // input.append("data", data);
      var observable = this._http.put(this.accessPointUrl1, data, { headers: this.headers });
      observable.subscribe(res => this.Successs(res),
        res => this.Errors(res));
    } else {
      alert("Images Not Found..");
    }
  }
  Errors(err) {
    console.debug(err.json());
  }
  Successs(res) {
    console.log("PUT Request is successful ", res);
  }

  //get dicomFileId using Params
  public getDicomFileId(url) {
    if (url) {
      var params = {};
      var parser = document.createElement('a');
      parser.href = url;
      var query = parser.search.substring(1);
      var vars = query.split('&');
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        params[pair[0]] = decodeURIComponent(pair[1]);
      }
      return params;
    }
  }

  public showToolData() {

    if (this.viewPort.currentImage.imageId) {

      var DicomFileId = this.getDicomFileId(this.viewPort.currentImage.imageId);
      var dicomFileId = DicomFileId["dicomFileId"];
      var observable = this._http.get(this.accessPointUrlFileToolData + dicomFileId, { headers: this.headers });
      observable.subscribe(res => this.Success(res),
        res => this.Error(res));
    }
  }
  Error(err) {
    console.debug(err.json());
  }
  Success(res) {
    let response = JSON.parse(res);
    var toolDataString = response.Results[0].FileToolData;
    var element = document.getElementById("dicomImage");
    var allToolData = JSON.parse(toolDataString);
    for (var toolType in allToolData) {
      if (allToolData.hasOwnProperty(toolType)) {
        for (var i = 0; i < allToolData[toolType].data.length; i++) {
          var toolData = allToolData[toolType].data[i];
          cornerstoneTools.addToolState(element, toolType, toolData);
        }
      }
      // Update the canvas
      cornerstone.updateImage(element);
    }
  }

  // reset image
  public resetImage() {
    if (this.imageCount > 0) {
      let toolStateManager = cornerstoneTools.getElementToolStateManager(this.element);
      // Note that this only works on ImageId-specific tool state managers (for now)
      //toolStateManager.clear(this.element);
      cornerstoneTools.clearToolState(this.element, "length");
      cornerstoneTools.clearToolState(this.element, "angle");
      cornerstoneTools.clearToolState(this.element, "simpleAngle");
      cornerstoneTools.clearToolState(this.element, "probe");
      cornerstoneTools.clearToolState(this.element, "ellipticalRoi");
      cornerstoneTools.clearToolState(this.element, "rectangleRoi");
      cornerstoneTools.clearToolState(this.element, "arrowAnnotate");
      cornerstone.updateImage(this.element);
      this.resetAllTools();
      cornerstone.reset(this.element);
    }
  }

  public clearImage() {
    this.viewPort.resetViewer();
    this.viewPort.resetImageCache();
    this.seriesList = []; // list of series on the images being displayed
    this.currentSeriesIndex = 0;
    this.currentSeries = {};
    this.imageCount = 0; // total image count being viewed

  }

}
