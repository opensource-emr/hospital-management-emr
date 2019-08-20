import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { Router } from '@angular/router';
import * as cornerstone from 'cornerstone-core';
import * as dicomParser from 'dicom-parser';
import * as cornerstoneWADOImageLoader from '../../../../../../assets-dph/dicom-assets/cornerstone/lib/cornerstoneWADOImageLoader.js'
import { DICOMViewerComponent } from '../dicom-viewer/dicom-viewer.component';
import { DicomDataModel } from '../shared/dicom-load-study.model';
import { DicomService } from '../shared/dicom.service';

@Component({
  selector: 'dicom-study-list',
  templateUrl: './dicom-load-study.view.html'
})
export class DicomLoadStudyComponent {
  showList: boolean = true;
  public dicomWebUrl: string = "";
  public showDicomViewerPage: boolean = false;
  public showStudyListPage: boolean = true;
  public showDicomPopUp: boolean = true;
  @ViewChild(DICOMViewerComponent) viewPort: DICOMViewerComponent;

  public showPatientStudy: boolean = false;
  private headers: HttpHeaders;
  private accessStudiesByPatStudyId: string = "/api/Dicom?reqType=getStudiesByPatStudyId&patStudyId="
  private accessPointUrl1: string = "/api/Dicom?reqType=getAllData&studyInstanceUID=";
  private accessDicomWebLink: string = "/api/radiology?reqType=dicomImageLoaderUrl";
  public dicomDataObj: DicomDataModel = new DicomDataModel();
  private dicomDataObjs: Array<DicomDataModel> = new Array<DicomDataModel>();
  constructor(public _http: HttpClient,
    public _router: Router,
    public _dicomService: DicomService) {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    this.GetDicomDataByStudyId();
    this.GetDicomWebUrl();
  }


  ngOnInit() {
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone; // initialize WADO Image loader
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser; // initialize dicomParser
    cornerstoneWADOImageLoader.webWorkerManager.initialize({
      webWorkerPath: '/assets-dph/dicom-assets/cornerstone/webworkers/cornerstoneWADOImageLoaderWebWorker.js',
      taskConfiguration: {
        'decodeTask': {
          codecsPath: '../codecs/cornerstoneWADOImageLoaderCodecs.js'
        }
      }
    });
  }


  public GetDicomDataByStudyId() {
    /* Commented for Future use like get particular data from querystring...*/

    // var  param = window.location.href;
    // if (param) {
    //     var url = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    //     var patStudyId:any=[]
    //     for (var i = 0; i < url.length; i++) {
    //         var urlparam = url[i].split('=');
    //          patStudyId = urlparam[1];
    //     }
    // }
    var patStudyId = this._dicomService.patientStudyId;
    this._dicomService.resetPatientStudyId();
    var observable = this._http.get(this.accessStudiesByPatStudyId + patStudyId, { headers: this.headers });
    observable.subscribe(res => this.Successs(res),
      res => this.Errors(res));

  }
  Errors(err) {
    console.debug(err.json());
  }
  Successs(res) {
    let response = JSON.parse(res);
    this.dicomDataObjs = response.Results;
  }

  public GetDicomWebUrl() {

    var observable = this._http.get(this.accessDicomWebLink, { headers: this.headers });
    observable.subscribe(res => this.SUCCESS(res),
      res => this.ERRORS(res));
  }
  ERRORS(err) {
    console.debug(err.json());
  }
  SUCCESS(res) {
    this.dicomWebUrl = res.Results;
  }


  public GetImageData(studyInstanceUID) {

    var StudyInstanceUID = studyInstanceUID;
    var observable = this._http.get(this.accessPointUrl1 + StudyInstanceUID, { headers: this.headers });
    observable.subscribe(res => this.Success(res),
      res => this.Error(res));
  }
  Error(err) {
    console.debug(err.json());
  }
  Success(res) {
    let response = JSON.parse(res);
    var dicomData = [];
    var dicomFileId = response.Results[0].DicomFileId;
    for (let i = 0; i < response.Results.length; i++) {

      dicomData.push(response.Results[i].DicomFileId);
    }

    if (dicomData != null) {
      var imageList = [];
      var fileList = dicomData;

      cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.purge();

      // loop through the File list and build a list of wadouri imageIds (dicomfile:) 
      for (let i = 0; i < fileList.length; i++) {
        var dicomFile = fileList[i];
        const imageId = this.dicomWebUrl + dicomFile // get dicomweb: link in this.dicomWebUrl and dicomFileId then push it to loadStudyImages

        imageList.push(imageId);

      }

      this.viewPort.resetAllTools();

      // now load all Images, using their wadouri
      this.viewPort.loadStudyImages(imageList);

    }
    else {
      alert('There is not DicomFileId.');
    }
  }

  ShowDicomViewer(index) {

    this.showDicomViewerPage = true;
    this.showStudyListPage = false;
    let studyInstanceUID = this.dicomDataObjs[index].StudyInstanceUID
    this.GetImageData(studyInstanceUID);
  }

  showStudyList() {
    this.showDicomViewerPage = false;
    this.showStudyListPage = true;
  }

  CloseDicomViewer() {
    this.showDicomViewerPage = false;
    this.showDicomPopUp = false;
  }

}
