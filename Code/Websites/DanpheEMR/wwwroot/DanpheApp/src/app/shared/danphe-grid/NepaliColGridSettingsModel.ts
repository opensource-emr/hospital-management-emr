export class NepaliDateInGridParams {
  public ShowNepaliDateInGrid: boolean = true;
  public NepaliDateColumnList: Array<NepaliDateInGridColumnDetail> = [];
}

export class NepaliDateInGridColumnDetail {
  constructor(englishDateColname: string, showtime: boolean = false) {
    this.EnglishColumnName = englishDateColname;
    this.ShowTime = showtime;
  }    
  public EnglishColumnName: string = '';
  public ShowTime: boolean = false;
}
