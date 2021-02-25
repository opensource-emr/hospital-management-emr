using OfficeOpenXml;
using OfficeOpenXml.Style;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Linq;
using System.Reflection;
using DanpheEMR.ServerModel;
using System.Drawing;
namespace DanpheEMR.Utilities
{
    public enum ColumnFormulas
    {
        nothing,
        Sum,
        Count,
        Date,
        Time,
        DateTime
    }
    public class ColumnMetaData
    {

        public string ColName { get; set; }
        public int DisplaySeq { get; set; }
        public string ColDisplayName { get; set; }
        public ColumnFormulas Formula { get; set; }
        public string Color { get; set; }
        public double Width = 12;//default width is set as 15, use it as per necessity. sud:9Aug'17
        public ColumnMetaData()
        {
            DisplaySeq = 200;// don't change it
        }
    }

    // this class will be inherited by developers
    // to define their own customer formatting
    // developers need to override the process method
    // to define their custom logic
    public class ExcelExportHelper
    {

        public ExcelPackage package = new ExcelPackage();
        protected ExcelWorksheet worksheet = null;
        public int EndRowPrevious = 0;
        //the endrow is give value 3 because 
        //in first row there is header then there is empty row 
        //then actual data start
        public int EndRow = 3;
        public ExcelExportHelper(string sheetname)
        {
            worksheet = package.Workbook.Worksheets.Add(sheetname);
        }

        // this function is used to give formula to the cell    
        public string GetFormula(ColumnFormulas columnformula, string startrow, string endrow)
        {
            if (columnformula == ColumnFormulas.Sum)
            {
                return "=sum(" + startrow + ":" + endrow + ")";
            }
            if (columnformula == ColumnFormulas.Count)
            {
                return "=count(" + startrow + ":" + endrow + ")";
            }

            return "";
        }
        ///////This Function is Called When we Dont Have to Remove Some Column From Excel
        /////LoadFromDataTable() Behave likes Polymorphism 
        //public void LoadFromDataTable(List<ColumnMetaData> columnamesIp,
        //                            DataTable dataIp, string header, bool showReportSummary, bool freezeHeader)
        //{
        //    try
        //    {
        //        //////Called Actual LoadFromDataTable and Pass removeColNameList = null;
        //        LoadFromDataTable(columnamesIp,
        //                        dataIp, header, showReportSummary, freezeHeader, null);
        //    }
        //    catch (Exception ex)
        //    {
        //        throw ex;
        //    }
        //}
        //this function gets called when we dont have any addional informative summary
        //LoadFromDataTable() behave likes Polymorphism
        //public void LoadFromDataTable(List<ColumnMetaData> columnamesIp,
        //                          DataTable dataIp, string header, bool showReportSummary, bool freezeHeader, List<String> removeColNameList)
        //{
        //    try
        //    {
        //        //calling actual LoadFromTable and passing summaryHeader = "" and SummaryData = "";
        //        LoadFromDataTable(columnamesIp, dataIp, header, showReportSummary, freezeHeader, removeColNameList, "", "");
        //    }
        //    catch (Exception ex)
        //    {
        //        throw ex;
        //    }
        //}

        public void Save()
        {
            package.Save();
        }
        //reconstruct  table columns and data as per user req
        public static DataTable RestructureDatatableByIpColumns(DataTable ipDataTable, List<ColumnMetaData> colMetaData, List<string> removeColNames)
        {
            try
            {
                //change datatable colname as per displaycolname
                for (int j = 0; j < colMetaData.Count; j++)
                {
                    ipDataTable.Columns[colMetaData[j].ColName].ColumnName = colMetaData[j].ColDisplayName;
                }
                ipDataTable.AcceptChanges();
                for (int i = 0; i < colMetaData.Count; i++)
                {
                    //SetOrdinal changes position of column 
                    //we are changing position of Data column as per ColMetaData
                    ipDataTable.Columns[colMetaData[i].ColDisplayName].SetOrdinal(i);
                }

                ///////If removeColNames List is Not Null Then We Can Remove that Column from Datatable
                if (removeColNames != null)
                {
                    if (removeColNames.Count > 0)
                    {
                        for (int i = 0; i < removeColNames.Count; i++)
                        {
                            var colName = colMetaData.Find(x => x.ColName == removeColNames[i].ToString()).ColDisplayName;
                            var index = ipDataTable.Columns.IndexOf(colName);
                            if (index >= 0)
                            {
                                ipDataTable.Columns.RemoveAt(index);
                            }

                        }
                    }
                }

                return ipDataTable;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        //make columnmetadata as per customer req
        public static List<ColumnMetaData> MakeColumnsHeader(DataTable table, List<ColumnMetaData> colMetaInput)
        {
            try
            {
                //check is null col meta data by user, if null then make it as per table column sequence
                if (colMetaInput.Count <= 0 || colMetaInput == null)
                {
                    foreach (var col in table.Columns)
                    {
                        ColumnMetaData tempcolMetaa = new ColumnMetaData();
                        tempcolMetaa.ColName = col.ToString();
                        tempcolMetaa.ColDisplayName = col.ToString();
                        colMetaInput.Add(tempcolMetaa);
                    }
                    return colMetaInput;

                }
                else
                {
                    //making new Original list using table column name and ClientSequenceList using sequenceNo 
                    //this loop make object of ColMetadata as per DataTable column
                    List<ColumnMetaData> OriginalDataTableColumnList = new List<ColumnMetaData>();
                    List<ColumnMetaData> SequenceNoColumnList = new List<ColumnMetaData>();

                    /////Add All actual table Column to OriginalDataTableColumnList
                    for (int i = 0; i < table.Columns.Count; i++)
                    {
                        ColumnMetaData temp = new ColumnMetaData();
                        temp.ColName = table.Columns[i].ColumnName;
                        temp.ColDisplayName = table.Columns[i].ColumnName;
                        temp.DisplaySeq = 0;
                        OriginalDataTableColumnList.Add(temp);  ////This list will Contin all Column of Original Datatable
                    }

                    ///Add Modified Column to SequenceNoColumnList
                    //Making changes as per Input ColMetaData info  i.e. changing DisplaySeq,  DisplayColName,Formula,Color,etc.
                    for (int j = 0; j < colMetaInput.Count; j++)
                    {
                        ColumnMetaData tempColData = new ColumnMetaData();
                        tempColData.ColName = colMetaInput[j].ColName;
                        tempColData.ColDisplayName = (colMetaInput[j].ColDisplayName != null) ? colMetaInput[j].ColDisplayName : tempColData.ColName;
                        tempColData.DisplaySeq = colMetaInput[j].DisplaySeq;
                        tempColData.Formula = colMetaInput[j].Formula;
                        tempColData.Color = colMetaInput[j].Color;

                        SequenceNoColumnList.Add(tempColData); ////This list will Contin all Column of Sequence No Passed 

                    }
                    ///var final= SequenceNoColumnList.OrderBy(x => x.DisplaySeq).ToList();
                    /////Removing Row from original table(OriginalDataTableColumnList) which are Present in Client list Data (SequenceNoColumnList)
                    for (int i = 0; i < (SequenceNoColumnList.Count); i++)
                    {
                        //////Find the Index no of Each 
                        var removeIndex = OriginalDataTableColumnList.FindIndex(y => y.ColName == SequenceNoColumnList[i].ColName);
                        ////Delete Row from that Index
                        OriginalDataTableColumnList.RemoveAt(removeIndex);

                    }

                    for (int i = 0; i < (OriginalDataTableColumnList.Count); i++)
                    {
                        SequenceNoColumnList.Add(OriginalDataTableColumnList[i]);

                    }

                    /////
                    //// var OriginalLength = SequenceNoColumnList.Count + OriginalDataTableColumnList.Count;

                    List<ColumnMetaData> FinalColumnHeaderDetails = new List<ColumnMetaData>();
                    int flag = 0;
                    for (int i = 0; i < SequenceNoColumnList.Count; i++)
                    {

                        if (SequenceNoColumnList[flag].DisplaySeq == i)
                        {
                            FinalColumnHeaderDetails.Add(SequenceNoColumnList[flag]);
                            flag++;
                        }
                        else
                        {
                            FinalColumnHeaderDetails.Add(SequenceNoColumnList[flag]);
                            flag++;
                            //FinalColumnHeaderDetails.Add(OriginalDataTableColumnList[0]);
                            // OriginalDataTableColumnList.RemoveAt(0);
                        }
                        FinalColumnHeaderDetails[i].DisplaySeq = i;
                    }

                    return FinalColumnHeaderDetails;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        //in loadCollection there are 8 parameter 
        //1) columnames: column names as the name says.
        //2) data : for actual list of data..
        //3) header: this is header name of the report
        //4) showReportSummary: this bool type if this is true summary of report is shown otherwise no...
        //5) freezeHeader: this is used to the header of the report..
        //6) removeColNameList : This is the List of All Column which we want to Remove From Excel
        //7) SummaryData : contains summary data 
        //8) summaryHeader : contains summary header name
        public void LoadFromDataTable(List<ColumnMetaData> columnamesIp, DataTable dataIp,
                                        string header, bool showReportSummary,
                                        bool freezeHeader, List<String> removeColNameList = null,
                                        string SummaryData = "", string summaryHeader = "")
        {
            try
            {
                //pass user setting column header data for make all column header metadata
                List<ColumnMetaData> columnames = ExcelExportHelper.MakeColumnsHeader(dataIp, columnamesIp);

                //after column header need to rearrange datatabel data as per columnHeader data
                DataTable data = ExcelExportHelper.RestructureDatatableByIpColumns(dataIp, columnames, removeColNameList);

                int colcount = 1;
                //this is header of the report..
                worksheet.Cells["B" + (EndRow - 2) + ":H" + (EndRow - 2)].Value = header;
                worksheet.Cells["B" + (EndRow - 2) + ":H" + (EndRow - 2)].Merge = true;
                worksheet.Cells["B" + (EndRow - 2) + ":H" + (EndRow - 2)].Style.Font.Color.SetColor(System.Drawing.Color.Green);
                worksheet.Cells["B" + (EndRow - 2) + ":H" + (EndRow - 2)].Style.Font.Bold = true;

                //this is use to freeze the rows ..for now it will freeze the uppper three rows 
                //till the column has the value
                if (freezeHeader == true)
                {
                    // endrow +1 because if we give 4 as row value then the FreezePanes method will freeze 3 rows
                    //worksheet.View.FreezePanes(EndRow + 1, columnames.Count + 1);
                    //sud:11Aug'17-- above will freeze also the columns, Below is the correct implementation, it'll freeze only required rows.
                    worksheet.View.FreezePanes(EndRow + 1, 1);
                }
                // the error is right
                // . Default option will load all public instance properties of T            
                worksheet.Cells["A" + (EndRow + 1)].LoadFromDataTable(data, true, OfficeOpenXml.Table.TableStyles.Light1);

                EndRowPrevious = EndRow;
                EndRow = worksheet.Dimension.End.Row + 2;
                colcount = 1;
                var endrow = EndRow + 4;

                //this is for summary of report id showreportSummary is true then show the summary else dont
                if (showReportSummary == true)
                {
                    //this is for the header of the summary..
                    worksheet.Cells["B" + (endrow - 1) + ":D" + (endrow - 1)].Value = header + " Summary";
                    worksheet.Cells["B" + (endrow - 1) + ":D" + (endrow - 1)].Merge = true;
                    worksheet.Cells["B" + (endrow - 1) + ":D" + (endrow - 1)].Style.Font.Bold = true;
                    worksheet.Cells["B" + (endrow - 1) + ":D" + (endrow - 1)].Style.Font.Color.SetColor(System.Drawing.Color.BlueViolet);
                    foreach (var col in columnames)
                    {
                        //calculation part & condition is for count and sum summary are shown for now..
                        if (col.Formula != ColumnFormulas.nothing && col.Formula != ColumnFormulas.Date)
                        {
                            //this is like giving the label
                            string propName = col.ColDisplayName.Length > 0 ? col.ColDisplayName : col.ColName;
                            worksheet.Cells["A" + endrow + ":B" + endrow].Value = propName;
                            //this is for calculation
                            worksheet.Cells["C" + endrow + ":D" + endrow].Formula = GetFormula(col.Formula,
                                                                 Convert.ToChar(64 + colcount).ToString()
                                                                 + EndRowPrevious,
                                                                 Convert.ToChar(64 + colcount).ToString() + (EndRow - 1));
                            //styling
                            worksheet.Cells["A" + endrow + ":B" + endrow].Style.Font.Bold = true;
                            worksheet.Cells["C" + endrow + ":D" + endrow].Style.Font.Color.SetColor(System.Drawing.Color.Red);
                            worksheet.Cells["A" + endrow + ":B" + endrow].Merge = true;
                            worksheet.Cells["C" + endrow + ":D" + endrow].Merge = true;
                            endrow++;
                        }
                        colcount++;
                    }
                }
                colcount = 1;
                foreach (var col in columnames)
                {
                    worksheet.Column(colcount).Width = col.Width;//sud:9aug'17--pass them properly from the column-metadata.
                                                                 // this is for proper format of date..
                    if (col.Formula == ColumnFormulas.Date)
                    {
                        worksheet.Column(colcount).Style.Numberformat.Format = "dd-mm-yyyy";

                    }
                    if (col.Formula == ColumnFormulas.Time)
                    {
                        worksheet.Column(colcount).Style.Numberformat.Format = "hh:mm:ss";

                    }
                    if (col.Formula == ColumnFormulas.DateTime)
                    {
                        worksheet.Column(colcount).Style.Numberformat.Format = "dd-mm-yyyy hh:mm:ss";

                    }
                    // this is use to for calculation part.. 
                    if (col.Formula != ColumnFormulas.nothing && col.Formula != ColumnFormulas.Date)
                    {
                        worksheet.Cells[EndRow, colcount].Formula = GetFormula(col.Formula,
                                                             Convert.ToChar(64 + colcount).ToString()
                                                             + EndRowPrevious,
                                                             Convert.ToChar(64 + colcount).ToString() + (EndRow - 1));
                        worksheet.Cells[EndRow, colcount].Style.Font.Bold = true;
                    }
                    colcount++;
                }
                //this for maitaining the proper spacing between to report ....
                //if want to load multiple report in one excel
                EndRow = worksheet.Dimension.End.Row + 4;
                endrow = EndRow;
                if (summaryHeader.Length > 0)
                {
                    //summary header
                    worksheet.Cells["B" + (endrow - 1) + ":C" + (endrow - 1)].Value = summaryHeader;
                    worksheet.Cells["B" + (endrow - 1) + ":C" + (endrow - 1)].Merge = true;
                    worksheet.Cells["B" + (endrow - 1) + ":C" + (endrow - 1)].Style.Font.Bold = true;
                    worksheet.Cells["B" + (endrow - 1) + ":C" + (endrow - 1)].Style.Font.Color.SetColor(System.Drawing.Color.BlueViolet);

                    var sumData = DanpheJSONConvert.DeserializeObject<Dictionary<string, object>>(SummaryData);
                    foreach (var s in sumData)
                    {
                        //this is like giving the label
                        worksheet.Cells["A" + endrow + ":B" + endrow].Value = s.Key;
                        worksheet.Cells["C" + endrow + ":D" + endrow].Value = s.Value;
                        //styling
                        worksheet.Cells["A" + endrow + ":B" + endrow].Style.Font.Bold = true;
                        worksheet.Cells["C" + endrow + ":D" + endrow].Style.Font.Color.SetColor(System.Drawing.Color.Red);
                        worksheet.Cells["A" + endrow + ":B" + endrow].Merge = true;
                        worksheet.Cells["C" + endrow + ":D" + endrow].Merge = true;
                        endrow++;
                    }
                }
                //this for maitaining the proper spacing between to report ....
                //if want to load multiple report in one excel
                EndRow = worksheet.Dimension.End.Row + 3;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
