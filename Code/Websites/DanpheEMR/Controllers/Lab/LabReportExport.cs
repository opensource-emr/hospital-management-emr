using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using System.IO.Compression;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using DanpheEMR.ServerModel;
using Microsoft.Extensions.Options;
using DanpheEMR.Core.Configuration;

namespace DanpheEMR.Controllers.Lab
{
    public class LabReportExport
    {
        string _templateLocation = null;
        bool _highlightAbnormalLabResult = false;
        public LabReportExport(string templateLocation, bool highlightAbnormalLabResult)
        {
            this._templateLocation = templateLocation;
            this._highlightAbnormalLabResult = highlightAbnormalLabResult;
        }

        // in this method we decide which template to be taken depending upon the template name(template)...
        public string GetReportToExport(LabReportTemplateModel template, bool isNegative, PatTemplateResult patTemplateResult, string templatefolder, bool highlightAbnormalLabResult)
        {
            this._templateLocation = templatefolder;
            this._highlightAbnormalLabResult = highlightAbnormalLabResult;
            GetTemplate getTemplate = new GetTemplate(this._templateLocation, this._highlightAbnormalLabResult);
            switch (template.ReportTemplateShortName)
            {
                case "Hematology":
                    return getTemplate.GetHematologyTemplate(template, patTemplateResult);

                case "Culture":
                    return getTemplate.GetCultureTemplate(template, patTemplateResult);

                case "BodyFluid":
                    return getTemplate.GetBodyFluidTemplate(template, patTemplateResult);

                case "PusCultureAndSensitivity":
                    if (isNegative)
                    {
                        return getTemplate.GetPusCultureAndSensitivityTemplate_Negative(template, patTemplateResult);
                    }
                    else
                    {
                        return getTemplate.GetPusCultureAndSensitivityTemplate(template, patTemplateResult);
                    }


                case "Immunochromatographic":
                    return getTemplate.GetImmunochromatographicTemplate(template, patTemplateResult);

                case "BioChemistry":
                    return getTemplate.GetBioChemistryTemplate(template, patTemplateResult);

                case "UrineCS":
                    if (isNegative)
                    {
                        return getTemplate.GetUrineCSTemplate_Negative(template, patTemplateResult);
                    }
                    else
                    {
                        return getTemplate.GetUrineCSTemplate(template, patTemplateResult);
                    }

                case "Serology":
                    return getTemplate.GetSerologyTemplate(template, patTemplateResult);

                case "Microbiology":
                    return getTemplate.GetMicrobiologyTemplate(template, patTemplateResult);

                case "MedicalImmunology":
                    return getTemplate.GetMedicalImmunologyTemplate(template, patTemplateResult);

                case "RoutineUrine":
                    return getTemplate.GetRoutineUrineTemplate(template, patTemplateResult);

                case "RoutineStool":
                    return getTemplate.GetRoutineStoolTemplate(template, patTemplateResult);

                case "TroponinUPT":
                    return getTemplate.GetTroponinUPTTemplate(template, patTemplateResult);

                case "UrineForAcetone":
                    return getTemplate.GetUrineForAcetoneTemplate(template, patTemplateResult);

                case "SemenAnalysis":
                    return getTemplate.GetSemenAnalysisTemplate(template, patTemplateResult);

                case "SputumAFB":
                    return getTemplate.GetSputumAFBTemplate(template, patTemplateResult);

                case "BloodCulture":
                    if (isNegative)
                    {
                        return getTemplate.GetBloodCulture_Negative(template, patTemplateResult);
                    }
                    else
                    {
                        return getTemplate.GetBloodCultureTemplate(template, patTemplateResult);
                    }

                default:
                    if (isNegative)
                    {
                        //inside default template, there are two cases with negative results.
                        //need to update later on.
                        return getTemplate.GetSputumCulture_Negative(template, patTemplateResult);
                    }
                    else
                    {
                        return getTemplate.GetLabTestTemplate(template, patTemplateResult);
                    }


            }
        }


    }
    public class PatTemplateResult
    {

        public LabPatientInformation PatientInfo = new LabPatientInformation();
        public TableInformation tableInfo = new TableInformation();
        public Dictionary<string, string> DictionaryInfo = new Dictionary<string, string>();
    }
    ////this is for template related data
    //public class Template
    //{
    //    public string TemplateName { get; set; }
    //    public string TemplateFileLocation { get; set; }
    //    public string TemplateFileName { get; set; }
    //}
    //patient related data
    public class LabPatientInformation
    {
        public string PatientName { get; set; }
        public string PatientCode { get; set; }
        public string Age { get; set; }
        public string Sex { get; set; }
        public string ReferredBy { get; set; }
        public string LabNo { get; set; }
        public string Date { get; set; }
        public string CreatedBy { get; set; }
        public string Comments { get; set; }
    }
    //this is use to the table with result value
    public class TableInformation
    {
        public string TablePlaceHolder { get; set; }
        public List<Test> Tests = new List<Test>();

    }
    public class Test
    {
        public string TestName { get; set; }
        public List<ComponentResult> Result = new List<ComponentResult>();

    }
    //this has the result value..
    public class ComponentResult
    {
        public string ComponentName { get; set; }
        public string Value { get; set; }
        public string Range { get; set; }
        public string Unit { get; set; }
        public string Method { get; set; }
        public string Remarks { get; set; }
        public string TestName { get; set; }
        public bool? IsAbnormal { get; set; }
    }
    //this class has the all the template .... just need to call the template 
    public class GetTemplate
    {
        string _templateLocation = null;
        string templateLocalFolder = "Labs\\Templates";
        string resultLocalFolder = "Labs\\Results";
        bool _highlightAbnormalLabResult = false;
        public GetTemplate(string templateLocation, bool highlightAbnormalLabResult)
        {
            this._templateLocation = templateLocation;
            this._highlightAbnormalLabResult = highlightAbnormalLabResult;
        }
        public void SignatureFormatting(string data, Text Value)
        {
            Value.Text = "";
            if (!string.IsNullOrEmpty(data))
            {
                string[] Signature = data.Split(',');

                for (var i = 0; i < Signature.Length; i++)
                {
                    Value.Parent.Append(new Text(Signature[i]));
                    Value.Parent.Append(new Break());

                }
            }

        }
        public string GetHematologyTemplate(LabReportTemplateModel template, PatTemplateResult patTemplateResult)
        {
            var returnMemStream = new MemoryStream();

            string dateTimeNow = DateTime.Now.ToString("dd-MM-yyyy_hh_mm_ss tt");

            // given the file location ...Template dotx file is saved in wwwroot\fileuploads folder and Tests results in result folder  
            string templateFIleName = _templateLocation + templateLocalFolder + "\\" + "HematologyTemplate.dotx";
            string fileName = _templateLocation + resultLocalFolder + "\\" + "CurrentTest.docx";

            File.Copy(templateFIleName, fileName, true);

            using (WordprocessingDocument newdoc =
                WordprocessingDocument.Open(fileName, true))
            {

                // Change document type (dotx->docx)
                newdoc.ChangeDocumentType(WordprocessingDocumentType.Document);

                SetDocumentKeyValues(newdoc, patTemplateResult.DictionaryInfo);

                Table table = null;
                IEnumerable<TableProperties> tableProperties = newdoc.MainDocumentPart.
                                        Document.Descendants<TableProperties>().
                                        Where(tp => tp.TableCaption != null);
                foreach (TableProperties tProp in tableProperties)
                {
                    if (tProp.TableCaption.Val == patTemplateResult.tableInfo.TablePlaceHolder) // see comment, this is actually StringValue
                    {
                        // do something for table with myCaption
                        table = (Table)tProp.Parent;
                        SetTableProperties(table);
                    }
                }
                foreach (var test in patTemplateResult.tableInfo.Tests)
                {
                    foreach (var res in test.Result)
                    {
                        TableRow tr = new TableRow();
                        tr.Append(new TableCell());
                        tr.Append(new TableCell());
                        tr.Append(new TableCell());
                        TableRow rowCopy = (TableRow)tr.CloneNode(true);
                        rowCopy.Descendants<TableCell>().ElementAt(0).Append(GetNewParagraph(res.ComponentName));
                        rowCopy.Descendants<TableCell>().ElementAt(1).Append(GetNewParagraph(res.Value, JustificationValues.Center, res.IsAbnormal));
                        rowCopy.Descendants<TableCell>().ElementAt(2).Append(GetNewParagraph((res.Range + res.Unit), JustificationValues.Center));
                        table.Append(rowCopy);
                    }
                }
                newdoc.MainDocumentPart.GetStream().CopyTo(returnMemStream);


                return fileName;
            }
        }
        public string GetCultureTemplate(LabReportTemplateModel template, PatTemplateResult patTemplateResult)
        {
            var returnMemStream = new MemoryStream();
            string dateTimeNow = DateTime.Now.ToString("dd-MM-yyyy_hh_mm_ss tt");
            string templateFIleName = _templateLocation + templateLocalFolder + "\\" + "CultureTemplate.dotx";
            string fileName = _templateLocation + resultLocalFolder + "\\" + "CurrentTest.docx";
            //string fileName = _templateLocation + resultLocalFolder + "\\" + dateTimeNow + "CBCTemplate.docx";

            File.Copy(templateFIleName, fileName, true);

            using (WordprocessingDocument newdoc =
                WordprocessingDocument.Open(fileName, true))
            {

                // Change document type (dotx->docx)
                newdoc.ChangeDocumentType(WordprocessingDocumentType.Document);
                SetDocumentKeyValues(newdoc, patTemplateResult.DictionaryInfo);

                Table table = null;
                IEnumerable<TableProperties> tableProperties = newdoc.MainDocumentPart.
                                        Document.Descendants<TableProperties>().
                                        Where(tp => tp.TableCaption != null);
                foreach (TableProperties tProp in tableProperties)
                {
                    if (tProp.TableCaption.Val == patTemplateResult.tableInfo.TablePlaceHolder) // see comment, this is actually StringValue
                    {
                        // do something for table with myCaption
                        table = (Table)tProp.Parent;
                        SetTableProperties(table);
                    }
                }
                foreach (var test in patTemplateResult.tableInfo.Tests)
                {
                    foreach (var res in test.Result)
                    {

                        TableRow tr = new TableRow();
                        tr.Append(new TableCell());
                        tr.Append(new TableCell());
                        tr.Append(new TableCell());
                        TableRow rowCopy = (TableRow)tr.CloneNode(true);
                        rowCopy.Descendants<TableCell>().ElementAt(0).Append(GetNewParagraph(res.ComponentName));
                        rowCopy.Descendants<TableCell>().ElementAt(1).Append(GetNewParagraph(res.Value, JustificationValues.Center, res.IsAbnormal));
                        rowCopy.Descendants<TableCell>().ElementAt(2).Append(GetNewParagraph(res.Method, JustificationValues.Center));
                        table.Append(rowCopy);
                    }
                }
                newdoc.MainDocumentPart.GetStream().CopyTo(returnMemStream);

            } // automaticall newdoc.close
            return fileName;

        }//contains desc and note ..no table

        //without table.
        public string GetBodyFluidTemplate(LabReportTemplateModel template, PatTemplateResult patTemplateResult)
        {
            var returnMemStream = new MemoryStream();
            string dateTimeNow = DateTime.Now.ToString("dd-MM-yyyy_hh_mm_ss tt");


            string templateFIleName = _templateLocation + templateLocalFolder + "\\" + "BodyFluidTemplate.dotx";
            string fileName = _templateLocation + resultLocalFolder + "\\" + "CurrentTest.docx";
            //string fileName = _templateLocation + resultLocalFolder + "\\" + dateTimeNow + "BodyFluidTemplate.docx";

            File.Copy(templateFIleName, fileName, true);
            CreateTemplateWitoutTable(fileName, patTemplateResult);

            return fileName;

        }//table contains 3 cols

        public string GetImmunochromatographicTemplate(LabReportTemplateModel template, PatTemplateResult patTemplateResult)
        {

            var returnMemStream = new MemoryStream();
            string dateTimeNow = DateTime.Now.ToString("dd-MM-yyyy_hh_mm_ss tt");

            string templateFIleName = _templateLocation + templateLocalFolder + "\\" + "ImmunochromatographicTemplate.dotx";
            string fileName = _templateLocation + resultLocalFolder + "\\" + "CurrentTest.docx";
            //string fileName = _templateLocation + resultLocalFolder + "\\" + dateTimeNow + "LabTestTemplate.docx";

            File.Copy(templateFIleName, fileName, true);


            using (WordprocessingDocument newdoc =
                WordprocessingDocument.Open(fileName, true))
            {

                // Change document type (dotx->docx)
                newdoc.ChangeDocumentType(WordprocessingDocumentType.Document);

                SetDocumentKeyValues(newdoc, patTemplateResult.DictionaryInfo);


                Table table = null;
                IEnumerable<TableProperties> tableProperties = newdoc.MainDocumentPart.
                                        Document.Descendants<TableProperties>().
                                        Where(tp => tp.TableCaption != null);
                foreach (TableProperties tProp in tableProperties)
                {
                    if (tProp.TableCaption.Val == patTemplateResult.tableInfo.TablePlaceHolder) // see comment, this is actually StringValue
                    {
                        // do something for table with myCaption
                        table = (Table)tProp.Parent;
                        SetTableProperties(table);
                    }
                }
                foreach (var test in patTemplateResult.tableInfo.Tests)

                {
                    RunProperties rp = new RunProperties();
                    Bold bold = new Bold();
                    bold.Val = OnOffValue.FromBoolean(true);

                    //table.Append(rowCopy1);
                    foreach (var res in test.Result)
                    {
                        TableRow tr = new TableRow();
                        tr.Append(new TableCell());
                        tr.Append(new TableCell());
                        tr.Append(new TableCell());
                        TableRow rowCopy = (TableRow)tr.CloneNode(true);
                        rowCopy.Descendants<TableCell>().ElementAt(0).Append(GetNewParagraph(res.ComponentName, JustificationValues.Center));
                        rowCopy.Descendants<TableCell>().ElementAt(1).Append(GetNewParagraph(res.Value, JustificationValues.Center, res.IsAbnormal));
                        rowCopy.Descendants<TableCell>().ElementAt(2).Append(GetNewParagraph(res.Method, JustificationValues.Center));
                        //rowCopy.Descendants<TableCell>().ElementAt(4).Append(new Paragraph(new Run(new Text(res.Remarks))));
                        table.Append(rowCopy);
                    }

                }
                newdoc.MainDocumentPart.GetStream().CopyTo(returnMemStream);
            } // automaticall newdoc.close
            return fileName;
        }
        public string GetBioChemistryTemplate(LabReportTemplateModel template, PatTemplateResult patTemplateResult)
        {
            var returnMemStream = new MemoryStream();
            string dateTimeNow = DateTime.Now.ToString("dd-MM-yyyy_hh_mm_ss tt");


            string templateFIleName = _templateLocation + templateLocalFolder + "\\" + "BioChemistryTemplate.dotx";
            string fileName = _templateLocation + resultLocalFolder + "\\" + "CurrentTest.docx";
            //string fileName = _templateLocation + resultLocalFolder + "\\" + dateTimeNow + "BioChemistryTemplate.docx";

            File.Copy(templateFIleName, fileName, true);


            using (WordprocessingDocument newdoc =
                WordprocessingDocument.Open(fileName, true))
            {

                // Change document type (dotx->docx)
                newdoc.ChangeDocumentType(WordprocessingDocumentType.Document);

                SetDocumentKeyValues(newdoc, patTemplateResult.DictionaryInfo);

                Table table = null;
                IEnumerable<TableProperties> tableProperties = newdoc.MainDocumentPart.
                                        Document.Descendants<TableProperties>().
                                        Where(tp => tp.TableCaption != null);
                foreach (TableProperties tProp in tableProperties)
                {
                    if (tProp.TableCaption.Val == patTemplateResult.tableInfo.TablePlaceHolder) // see comment, this is actually StringValue
                    {
                        // do something for table with myCaption
                        table = (Table)tProp.Parent;
                        SetTableProperties(table);
                    }
                }
                foreach (var test in patTemplateResult.tableInfo.Tests)
                {
                    foreach (var res in test.Result)
                    {
                        TableRow tr = new TableRow();
                        tr.Append(new TableCell());
                        tr.Append(new TableCell());
                        tr.Append(new TableCell());
                        TableRow rowCopy = (TableRow)tr.CloneNode(true);
                        // this is openxml you need to create run properties
                        // wait let me check it

                        rowCopy.Descendants<TableCell>().ElementAt(0).Append(GetNewParagraph(res.ComponentName));
                        rowCopy.Descendants<TableCell>().ElementAt(1).Append(GetNewParagraph(res.Value, JustificationValues.Center, res.IsAbnormal));
                        rowCopy.Descendants<TableCell>().ElementAt(2).Append(GetNewParagraph((res.Range + res.Unit), JustificationValues.Center));
                        table.Append(rowCopy);
                    }
                }
                newdoc.MainDocumentPart.GetStream().CopyTo(returnMemStream);

            } // automaticall newdoc.close
            return fileName;

        }
        public string GetBloodCultureTemplate(LabReportTemplateModel template, PatTemplateResult patTemplateResult)
        {
            var returnMemStream = new MemoryStream();

            string dateTimeNow = DateTime.Now.ToString("dd-MM-yyyy_hh_mm_ss tt");

            string templateFIleName = _templateLocation + templateLocalFolder + "\\" + "BloodCultureTemplate.dotx";
            string fileName = _templateLocation + resultLocalFolder + "\\" + "CurrentTest.docx";
            //string fileName = _templateLocation + resultLocalFolder + "\\" + dateTimeNow + "CultureAndSensitivityTemplate.docx";

            File.Copy(templateFIleName, fileName, true);

            using (WordprocessingDocument newdoc =
                WordprocessingDocument.Open(fileName, true))
            {

                // Change document type (dotx->docx)
                newdoc.ChangeDocumentType(WordprocessingDocumentType.Document);

                var elements = newdoc.MainDocumentPart.
                                        Document.Descendants<SdtElement>();
                if (patTemplateResult.DictionaryInfo != null)
                {
                    ComponentResult Comp_isolatedOrg = patTemplateResult.tableInfo.Tests.SelectMany(a => a.Result)
                                .Where(a => a.ComponentName == "Isolated Organism").FirstOrDefault();
                    if (Comp_isolatedOrg != null)
                        patTemplateResult.DictionaryInfo.Add(Comp_isolatedOrg.ComponentName, Comp_isolatedOrg.Value);
                }
                SetDocumentKeyValues(newdoc, patTemplateResult.DictionaryInfo);

                Table table = null;
                IEnumerable<TableProperties> tableProperties = newdoc.MainDocumentPart.
                                        Document.Descendants<TableProperties>().
                                        Where(tp => tp.TableCaption != null);

                foreach (TableProperties tProp in tableProperties)
                {
                    if (tProp.TableCaption.Val == patTemplateResult.tableInfo.TablePlaceHolder) // see comment, this is actually StringValue
                    {
                        // do something for table with myCaption
                        table = (Table)tProp.Parent;
                        SetTableProperties(table);
                    }
                }
                foreach (var test in patTemplateResult.tableInfo.Tests)
                {
                    foreach (var res in test.Result)
                    {
                        if (res.ComponentName != "Isolated Organism")
                        {
                            TableRow tr = new TableRow();


                            tr.Append(new TableCell());
                            tr.Append(new TableCell());
                            TableRow rowCopy = (TableRow)tr.CloneNode(true);
                            rowCopy.Descendants<TableCell>().ElementAt(0).Append(GetNewParagraph(res.ComponentName));
                            rowCopy.Descendants<TableCell>().ElementAt(1).Append(GetNewParagraph(res.Value, JustificationValues.Center, res.IsAbnormal));
                            table.Append(rowCopy);
                        }
                    }
                }
                newdoc.MainDocumentPart.GetStream().CopyTo(returnMemStream);

            } // automaticall newdoc.close
            return fileName;

        }
        
        public string GetLabTestTemplate(LabReportTemplateModel template, PatTemplateResult patTemplateResult)
        {

            var returnMemStream = new MemoryStream();



            string dateTimeNow = DateTime.Now.ToString("dd-MM-yyyy_hh_mm_ss tt");

            string templateFIleName = _templateLocation + templateLocalFolder + "\\" + "LabTestTemplate.dotx";
            string fileName = _templateLocation + resultLocalFolder + "\\" + "CurrentTest.docx";
            //string fileName = _templateLocation + resultLocalFolder + "\\" + dateTimeNow + "LabTestTemplate.docx";

            File.Copy(templateFIleName, fileName, true);


            using (WordprocessingDocument newdoc =
                WordprocessingDocument.Open(fileName, true))
            {

                // Change document type (dotx->docx)
                newdoc.ChangeDocumentType(WordprocessingDocumentType.Document);

                SetDocumentKeyValues(newdoc, patTemplateResult.DictionaryInfo);

                Table table = null;
                IEnumerable<TableProperties> tableProperties = newdoc.MainDocumentPart.
                                        Document.Descendants<TableProperties>().
                                        Where(tp => tp.TableCaption != null);
                foreach (TableProperties tProp in tableProperties)
                {
                    if (tProp.TableCaption.Val == patTemplateResult.tableInfo.TablePlaceHolder) // see comment, this is actually StringValue
                    {
                        // do something for table with myCaption
                        table = (Table)tProp.Parent;
                        SetTableProperties(table);
                    }
                }

                foreach (var test in patTemplateResult.tableInfo.Tests)
                {
                    RunProperties rp = new RunProperties();
                    Bold bold = new Bold();
                    bold.Val = OnOffValue.FromBoolean(true);
                    foreach (var res in test.Result)
                    {
                        ParagraphProperties rc = new ParagraphProperties();
                        Justification Center = new Justification() { Val = JustificationValues.Center };
                        rc.Append(Center);
                        TableRow tr = new TableRow();
                        tr.Append(new TableCell());
                        tr.Append(new TableCell());
                        tr.Append(new TableCell());
                        tr.Append(new TableCell());
                        //tr.Append(new TableCell());
                        TableRow rowCopy = (TableRow)tr.CloneNode(true);
                        rowCopy.Descendants<TableCell>().ElementAt(0).Append(GetNewParagraph(res.ComponentName, JustificationValues.Center));
                        rowCopy.Descendants<TableCell>().ElementAt(1).Append(GetNewParagraph(res.Value, JustificationValues.Center, res.IsAbnormal));
                        rowCopy.Descendants<TableCell>().ElementAt(2).Append(GetNewParagraph((res.Range + " " + res.Unit), JustificationValues.Center));
                        rowCopy.Descendants<TableCell>().ElementAt(3).Append(GetNewParagraph(res.Method, JustificationValues.Center));
                        //rowCopy.Descendants<TableCell>().ElementAt(4).Append(new Paragraph(new Run(new Text(res.Remarks))));
                        table.Append(rowCopy);
                    }

                }
                newdoc.MainDocumentPart.GetStream().CopyTo(returnMemStream);
            } // automaticall newdoc.close
            return fileName;
        }


        public string GetSerologyTemplate(LabReportTemplateModel template, PatTemplateResult patTemplateResult)
        {
            var returnMemStream = new MemoryStream();

            string dateTimeNow = DateTime.Now.ToString("dd-MM-yyyy_hh_mm_ss tt");

            // given the file location ...Template dotx file is saved in wwwroot\fileuploads folder and Tests results in result folder  
            string templateFIleName = _templateLocation + templateLocalFolder + "\\" + "SerologyTemplate.dotx";
            string fileName = _templateLocation + resultLocalFolder + "\\" + "CurrentTest.docx";

            File.Copy(templateFIleName, fileName, true);

            using (WordprocessingDocument newdoc =
                WordprocessingDocument.Open(fileName, true))
            {

                // Change document type (dotx->docx)
                newdoc.ChangeDocumentType(WordprocessingDocumentType.Document);
                SetDocumentKeyValues(newdoc, patTemplateResult.DictionaryInfo);

                Table table = null;
                IEnumerable<TableProperties> tableProperties = newdoc.MainDocumentPart.
                                        Document.Descendants<TableProperties>().
                                        Where(tp => tp.TableCaption != null);
                foreach (TableProperties tProp in tableProperties)
                {
                    if (tProp.TableCaption.Val == patTemplateResult.tableInfo.TablePlaceHolder) // see comment, this is actually StringValue
                    {
                        // do something for table with myCaption
                        table = (Table)tProp.Parent;
                        SetTableProperties(table);
                    }
                }
                foreach (var test in patTemplateResult.tableInfo.Tests)
                {
                    foreach (var res in test.Result)
                    {

                        TableRow tr = new TableRow();


                        tr.Append(new TableCell());
                        tr.Append(new TableCell());
                        tr.Append(new TableCell());

                        TableRow rowCopy = (TableRow)tr.CloneNode(true);
                        rowCopy.Descendants<TableCell>().ElementAt(0).Append(GetNewParagraph(res.ComponentName));
                        rowCopy.Descendants<TableCell>().ElementAt(1).Append(GetNewParagraph(res.Value, JustificationValues.Center, res.IsAbnormal));
                        rowCopy.Descendants<TableCell>().ElementAt(2).Append(GetNewParagraph(res.Method, JustificationValues.Center));

                        table.Append(rowCopy);
                    }
                }
                newdoc.MainDocumentPart.GetStream().CopyTo(returnMemStream);

            } // automaticall newdoc.close
            return fileName;

        }

        public string GetMicrobiologyTemplate(LabReportTemplateModel template, PatTemplateResult patTemplateResult)
        {
            var returnMemStream = new MemoryStream();

            string dateTimeNow = DateTime.Now.ToString("dd-MM-yyyy_hh_mm_ss tt");

            // given the file location ...Template dotx file is saved in wwwroot\fileuploads folder and Tests results in result folder  
            string templateFIleName = _templateLocation + templateLocalFolder + "\\" + "MicrobiologyTemplate.dotx";
            string fileName = _templateLocation + resultLocalFolder + "\\" + "CurrentTest.docx";

            File.Copy(templateFIleName, fileName, true);

            using (WordprocessingDocument newdoc =
                WordprocessingDocument.Open(fileName, true))
            {

                // Change document type (dotx->docx)
                newdoc.ChangeDocumentType(WordprocessingDocumentType.Document);
                SetDocumentKeyValues(newdoc, patTemplateResult.DictionaryInfo);

                Table table = null;
                IEnumerable<TableProperties> tableProperties = newdoc.MainDocumentPart.
                                        Document.Descendants<TableProperties>().
                                        Where(tp => tp.TableCaption != null);
                foreach (TableProperties tProp in tableProperties)
                {
                    if (tProp.TableCaption.Val == patTemplateResult.tableInfo.TablePlaceHolder) // see comment, this is actually StringValue
                    {
                        // do something for table with myCaption
                        table = (Table)tProp.Parent;
                        SetTableProperties(table);
                    }
                }
                foreach (var test in patTemplateResult.tableInfo.Tests)
                {
                    foreach (var res in test.Result)
                    {

                        TableRow tr = new TableRow();
                        tr.Append(new TableCell());
                        tr.Append(new TableCell());
                        tr.Append(new TableCell());
                        TableRow rowCopy = (TableRow)tr.CloneNode(true);

                        rowCopy.Descendants<TableCell>().ElementAt(0).Append(GetNewParagraph(res.ComponentName, JustificationValues.Left));
                        rowCopy.Descendants<TableCell>().ElementAt(1).Append(GetNewParagraph(res.Value, JustificationValues.Center, res.IsAbnormal));
                        rowCopy.Descendants<TableCell>().ElementAt(2).Append(GetNewParagraph(res.Method, JustificationValues.Center));
                        table.Append(rowCopy);
                    }
                }
                newdoc.MainDocumentPart.GetStream().CopyTo(returnMemStream);

            } // automaticall newdoc.close
            return fileName;

        }
        public string GetMedicalImmunologyTemplate(LabReportTemplateModel template, PatTemplateResult patTemplateResult)
        {
            var returnMemStream = new MemoryStream();

            string dateTimeNow = DateTime.Now.ToString("dd-MM-yyyy_hh_mm_ss tt");

            // given the file location ...Template dotx file is saved in wwwroot\fileuploads folder and Tests results in result folder  
            string templateFIleName = _templateLocation + templateLocalFolder + "\\" + "MedicalImmunologyTemplate.dotx";
            string fileName = _templateLocation + resultLocalFolder + "\\" + "CurrentTest.docx";

            File.Copy(templateFIleName, fileName, true);

            using (WordprocessingDocument newdoc =
                WordprocessingDocument.Open(fileName, true))
            {

                // Change document type (dotx->docx)
                newdoc.ChangeDocumentType(WordprocessingDocumentType.Document);
                SetDocumentKeyValues(newdoc, patTemplateResult.DictionaryInfo);


                Table table = null;
                IEnumerable<TableProperties> tableProperties = newdoc.MainDocumentPart.
                                        Document.Descendants<TableProperties>().
                                        Where(tp => tp.TableCaption != null);
                foreach (TableProperties tProp in tableProperties)
                {
                    if (tProp.TableCaption.Val == patTemplateResult.tableInfo.TablePlaceHolder) // see comment, this is actually StringValue
                    {
                        // do something for table with myCaption
                        table = (Table)tProp.Parent;
                        SetTableProperties(table);
                    }
                }
                foreach (var test in patTemplateResult.tableInfo.Tests)
                {
                    foreach (var res in test.Result)
                    {

                        TableRow tr = new TableRow();
                        tr.Append(new TableCell());
                        tr.Append(new TableCell());
                        tr.Append(new TableCell());
                        tr.Append(new TableCell());
                        //tr.Append(new TableCell());
                        TableRow rowCopy = (TableRow)tr.CloneNode(true);
                        rowCopy.Descendants<TableCell>().ElementAt(0).Append(GetNewParagraph(res.ComponentName, JustificationValues.Left));// new Paragraph(new Run(new Text(res.ComponentName))));
                        rowCopy.Descendants<TableCell>().ElementAt(1).Append(GetNewParagraph(res.Value, JustificationValues.Center, res.IsAbnormal));
                        rowCopy.Descendants<TableCell>().ElementAt(2).Append(GetNewParagraph(res.Range + res.Unit, JustificationValues.Center));// new Paragraph(new Run(new Text(res.Range + res.Unit))));
                        rowCopy.Descendants<TableCell>().ElementAt(3).Append(GetNewParagraph(res.Method, JustificationValues.Center)); //new Paragraph(new Run(new Text(res.Method))));
                                                                                                                                       //rowCopy.Descendants<TableCell>().ElementAt(4).Append(new Paragraph(new Run(new Text(res.Remarks))));
                        table.Append(rowCopy);
                    }
                }
                newdoc.MainDocumentPart.GetStream().CopyTo(returnMemStream);

            } // automaticall newdoc.close
            return fileName;

        }


        //without table.
        public string GetUrineCSTemplate(LabReportTemplateModel template, PatTemplateResult patTemplateResult)
        {
            var returnMemStream = new MemoryStream();

            string dateTimeNow = DateTime.Now.ToString("dd-MM-yyyy_hh_mm_ss tt");

            string templateFIleName = _templateLocation + templateLocalFolder + "\\" + "UrineCSTemplate.dotx";
            string fileName = _templateLocation + resultLocalFolder + "\\" + "CurrentTest.docx";
            //string fileName = _templateLocation + resultLocalFolder + "\\" + dateTimeNow + "CultureAndSensitivityTemplate.docx";

            File.Copy(templateFIleName, fileName, true);

            using (WordprocessingDocument newdoc =
                WordprocessingDocument.Open(fileName, true))
            {

                // Change document type (dotx->docx)
                newdoc.ChangeDocumentType(WordprocessingDocumentType.Document);

                if (patTemplateResult.DictionaryInfo != null)
                {
                    ComponentResult Comp_isolatedOrg = patTemplateResult.tableInfo.Tests.SelectMany(a => a.Result)
                                .Where(a => a.ComponentName == "Isolated Organism").FirstOrDefault();
                    if (Comp_isolatedOrg != null)
                        patTemplateResult.DictionaryInfo.Add(Comp_isolatedOrg.ComponentName, Comp_isolatedOrg.Value);
                }
                SetDocumentKeyValues(newdoc, patTemplateResult.DictionaryInfo);

                Table table = null;
                IEnumerable<TableProperties> tableProperties = newdoc.MainDocumentPart.
                                        Document.Descendants<TableProperties>().
                                        Where(tp => tp.TableCaption != null);
                foreach (TableProperties tProp in tableProperties)
                {
                    if (tProp.TableCaption.Val == patTemplateResult.tableInfo.TablePlaceHolder) // see comment, this is actually StringValue
                    {
                        // do something for table with myCaption
                        table = (Table)tProp.Parent;
                        SetTableProperties(table);
                    }
                }
                foreach (var test in patTemplateResult.tableInfo.Tests)
                {
                    foreach (var res in test.Result)
                    {
                        if (res.ComponentName != "Isolated Organism")
                        {
                            TableRow tr = new TableRow();


                            tr.Append(new TableCell());
                            tr.Append(new TableCell());
                            TableRow rowCopy = (TableRow)tr.CloneNode(true);
                            rowCopy.Descendants<TableCell>().ElementAt(0).Append(GetNewParagraph(res.ComponentName, JustificationValues.Left));// new Paragraph(new Run(new Text(res.ComponentName))));
                            rowCopy.Descendants<TableCell>().ElementAt(1).Append(GetNewParagraph(res.Value, JustificationValues.Center, res.IsAbnormal));// new Paragraph(new Run(new Text(res.Value))));


                            table.Append(rowCopy);
                        }
                    }
                }
                newdoc.MainDocumentPart.GetStream().CopyTo(returnMemStream);

            } // automaticall newdoc.close
            return fileName;



        }//table contains 4 cols

        //without table.
        public string GetUrineCSTemplate_Negative(LabReportTemplateModel template, PatTemplateResult patTemplateResult)
        {
            var returnMemStream = new MemoryStream();

            string dateTimeNow = DateTime.Now.ToString("dd-MM-yyyy_hh_mm_ss tt");

            string templateFIleName = _templateLocation + templateLocalFolder + "\\" + "UrineCS-Negative.dotx";
            string fileName = _templateLocation + resultLocalFolder + "\\" + "CurrentTest.docx";

            File.Copy(templateFIleName, fileName, true);

            using (WordprocessingDocument newdoc =
                WordprocessingDocument.Open(fileName, true))
            {

                // Change document type (dotx->docx)
                newdoc.ChangeDocumentType(WordprocessingDocumentType.Document);


                SetDocumentKeyValues(newdoc, patTemplateResult.DictionaryInfo);

                newdoc.MainDocumentPart.GetStream().CopyTo(returnMemStream);

            } // automaticall newdoc.close
            return fileName;



        }//table contains 4 cols


        //without table
        public string GetRoutineUrineTemplate(LabReportTemplateModel template, PatTemplateResult patTemplateResult)
        {
            var returnMemStream = new MemoryStream();
            string dateTimeNow = DateTime.Now.ToString("dd-MM-yyyy_hh_mm_ss tt");


            string templateFIleName = _templateLocation + templateLocalFolder + "\\" + "RoutineUrineTemplate.dotx";
            string fileName = _templateLocation + resultLocalFolder + "\\" + "CurrentTest.docx";
            //string fileName = _templateLocation + resultLocalFolder + "\\" + dateTimeNow + "BodyFluidTemplate.docx";

            File.Copy(templateFIleName, fileName, true);
            //pass current filepath and patient's data which will generate the document and returns the filename.
            CreateTemplateWitoutTable(fileName, patTemplateResult);

            return fileName;

        }//table contains 3 cols
        //without table.
        public string GetRoutineStoolTemplate(LabReportTemplateModel template, PatTemplateResult patTemplateResult)
        {
            var returnMemStream = new MemoryStream();
            string dateTimeNow = DateTime.Now.ToString("dd-MM-yyyy_hh_mm_ss tt");


            string templateFIleName = _templateLocation + templateLocalFolder + "\\" + "RoutineStoolTemplate.dotx";
            string fileName = _templateLocation + resultLocalFolder + "\\" + "CurrentTest.docx";
            //string fileName = _templateLocation + resultLocalFolder + "\\" + dateTimeNow + "BodyFluidTemplate.docx";

            File.Copy(templateFIleName, fileName, true);
            //pass current filepath and patient's data which will generate the document and returns the filename.
            CreateTemplateWitoutTable(fileName, patTemplateResult);

            return fileName;

        }//table contains 3 cols
        public string GetTroponinUPTTemplate(LabReportTemplateModel template, PatTemplateResult patTemplateResult)
        {

            var returnMemStream = new MemoryStream();
            string dateTimeNow = DateTime.Now.ToString("dd-MM-yyyy_hh_mm_ss tt");

            string templateFIleName = _templateLocation + templateLocalFolder + "\\" + "TroponinUPTTemplate.dotx";
            string fileName = _templateLocation + resultLocalFolder + "\\" + "CurrentTest.docx";
            //string fileName = _templateLocation + resultLocalFolder + "\\" + dateTimeNow + "LabTestTemplate.docx";

            File.Copy(templateFIleName, fileName, true);


            using (WordprocessingDocument newdoc =
                WordprocessingDocument.Open(fileName, true))
            {

                // Change document type (dotx->docx)
                newdoc.ChangeDocumentType(WordprocessingDocumentType.Document);

                SetDocumentKeyValues(newdoc, patTemplateResult.DictionaryInfo);

                Table table = null;
                IEnumerable<TableProperties> tableProperties = newdoc.MainDocumentPart.
                                        Document.Descendants<TableProperties>().
                                        Where(tp => tp.TableCaption != null);
                foreach (TableProperties tProp in tableProperties)
                {
                    if (tProp.TableCaption.Val == patTemplateResult.tableInfo.TablePlaceHolder) // see comment, this is actually StringValue
                    {
                        // do something for table with myCaption
                        table = (Table)tProp.Parent;
                        SetTableProperties(table);
                    }
                }

                foreach (var test in patTemplateResult.tableInfo.Tests)
                {
                    RunProperties rp = new RunProperties();
                    Bold bold = new Bold();
                    bold.Val = OnOffValue.FromBoolean(true);
                    foreach (var res in test.Result)
                    {
                        ParagraphProperties rc = new ParagraphProperties();
                        Justification Center = new Justification() { Val = JustificationValues.Center };
                        rc.Append(Center);
                        TableRow tr = new TableRow();
                        tr.Append(new TableCell());
                        tr.Append(new TableCell());
                        tr.Append(new TableCell());
                        //tr.Append(new TableCell());
                        TableRow rowCopy = (TableRow)tr.CloneNode(true);
                        rowCopy.Descendants<TableCell>().ElementAt(0).Append(GetNewParagraph(res.ComponentName, JustificationValues.Center));
                        rowCopy.Descendants<TableCell>().ElementAt(1).Append(GetNewParagraph(res.Value, JustificationValues.Center, res.IsAbnormal));
                        rowCopy.Descendants<TableCell>().ElementAt(2).Append(GetNewParagraph(res.Method, JustificationValues.Center));
                        //rowCopy.Descendants<TableCell>().ElementAt(4).Append(new Paragraph(new Run(new Text(res.Remarks))));
                        table.Append(rowCopy);
                    }

                }
                newdoc.MainDocumentPart.GetStream().CopyTo(returnMemStream);
            } // automaticall newdoc.close
            return fileName;
        }


        public string GetUrineForAcetoneTemplate(LabReportTemplateModel template, PatTemplateResult patTemplateResult)
        {

            var returnMemStream = new MemoryStream();
            string dateTimeNow = DateTime.Now.ToString("dd-MM-yyyy_hh_mm_ss tt");

            string templateFIleName = _templateLocation + templateLocalFolder + "\\" + "UrineForAcetoneTemplate.dotx";
            string fileName = _templateLocation + resultLocalFolder + "\\" + "CurrentTest.docx";
            //string fileName = _templateLocation + resultLocalFolder + "\\" + dateTimeNow + "LabTestTemplate.docx";

            File.Copy(templateFIleName, fileName, true);


            using (WordprocessingDocument newdoc =
                WordprocessingDocument.Open(fileName, true))
            {

                // Change document type (dotx->docx)
                newdoc.ChangeDocumentType(WordprocessingDocumentType.Document);

                SetDocumentKeyValues(newdoc, patTemplateResult.DictionaryInfo);

                Table table = null;
                IEnumerable<TableProperties> tableProperties = newdoc.MainDocumentPart.
                                        Document.Descendants<TableProperties>().
                                        Where(tp => tp.TableCaption != null);
                foreach (TableProperties tProp in tableProperties)
                {
                    if (tProp.TableCaption.Val == patTemplateResult.tableInfo.TablePlaceHolder) // see comment, this is actually StringValue
                    {
                        // do something for table with myCaption
                        table = (Table)tProp.Parent;
                        SetTableProperties(table);
                    }
                }

                foreach (var test in patTemplateResult.tableInfo.Tests)
                {
                    RunProperties rp = new RunProperties();
                    Bold bold = new Bold();
                    bold.Val = OnOffValue.FromBoolean(true);
                    foreach (var res in test.Result)
                    {
                        ParagraphProperties rc = new ParagraphProperties();
                        Justification Center = new Justification() { Val = JustificationValues.Center };
                        rc.Append(Center);
                        TableRow tr = new TableRow();
                        tr.Append(new TableCell());
                        tr.Append(new TableCell());
                        //tr.Append(new TableCell());
                        TableRow rowCopy = (TableRow)tr.CloneNode(true);
                        rowCopy.Descendants<TableCell>().ElementAt(0).Append(GetNewParagraph(res.ComponentName, JustificationValues.Center));
                        rowCopy.Descendants<TableCell>().ElementAt(1).Append(GetNewParagraph(res.Value, JustificationValues.Center, res.IsAbnormal));
                        //rowCopy.Descendants<TableCell>().ElementAt(4).Append(new Paragraph(new Run(new Text(res.Remarks))));
                        table.Append(rowCopy);
                    }

                }
                newdoc.MainDocumentPart.GetStream().CopyTo(returnMemStream);
            } // automaticall newdoc.close
            return fileName;
        }

        // Only with   (TestName + Result + Normal Range\

        public string GetSemenAnalysisTemplate(LabReportTemplateModel template, PatTemplateResult patTemplateResult)
        {

            var returnMemStream = new MemoryStream();
            string dateTimeNow = DateTime.Now.ToString("dd-MM-yyyy_hh_mm_ss tt");

            string templateFIleName = _templateLocation + templateLocalFolder + "\\" + "SemenAnalysisTemplate.dotx";
            string fileName = _templateLocation + resultLocalFolder + "\\" + "CurrentTest.docx";
            //string fileName = _templateLocation + resultLocalFolder + "\\" + dateTimeNow + "LabTestTemplate.docx";

            File.Copy(templateFIleName, fileName, true);


            using (WordprocessingDocument newdoc =
                WordprocessingDocument.Open(fileName, true))
            {

                // Change document type (dotx->docx)
                newdoc.ChangeDocumentType(WordprocessingDocumentType.Document);

                SetDocumentKeyValues(newdoc, patTemplateResult.DictionaryInfo);

                Table table = null;
                IEnumerable<TableProperties> tableProperties = newdoc.MainDocumentPart.
                                        Document.Descendants<TableProperties>().
                                        Where(tp => tp.TableCaption != null);
                foreach (TableProperties tProp in tableProperties)
                {
                    if (tProp.TableCaption.Val == patTemplateResult.tableInfo.TablePlaceHolder) // see comment, this is actually StringValue
                    {
                        // do something for table with myCaption
                        table = (Table)tProp.Parent;
                        SetTableProperties(table);
                    }
                }

                foreach (var test in patTemplateResult.tableInfo.Tests)
                {
                    RunProperties rp = new RunProperties();
                    Bold bold = new Bold();
                    bold.Val = OnOffValue.FromBoolean(true);
                    foreach (var res in test.Result)
                    {
                        ParagraphProperties rc = new ParagraphProperties();
                        Justification Center = new Justification() { Val = JustificationValues.Center };
                        rc.Append(Center);
                        TableRow tr = new TableRow();
                        tr.Append(new TableCell());
                        tr.Append(new TableCell());
                        tr.Append(new TableCell());
                        TableRow rowCopy = (TableRow)tr.CloneNode(true);
                        rowCopy.Descendants<TableCell>().ElementAt(0).Append(GetNewParagraph(res.ComponentName, JustificationValues.Center));
                        rowCopy.Descendants<TableCell>().ElementAt(1).Append(GetNewParagraph(res.Value, JustificationValues.Center, res.IsAbnormal));
                        rowCopy.Descendants<TableCell>().ElementAt(2).Append(GetNewParagraph((res.Range + res.Unit), JustificationValues.Center));
                        table.Append(rowCopy);
                    }

                }
                newdoc.MainDocumentPart.GetStream().CopyTo(returnMemStream);
            } // automaticall newdoc.close
            return fileName;
        }

        public string GetSputumAFBTemplate(LabReportTemplateModel template, PatTemplateResult patTemplateResult)
        {
            var returnMemStream = new MemoryStream();
            string dateTimeNow = DateTime.Now.ToString("dd-MM-yyyy_hh_mm_ss tt");
            string templateFIleName = _templateLocation + templateLocalFolder + "\\" + "SputumReportTemplate.dotx";
            string fileName = _templateLocation + resultLocalFolder + "\\" + "CurrentTest.docx";
            //string fileName = _templateLocation + resultLocalFolder + "\\" + dateTimeNow + "CBCTemplate.docx";

            File.Copy(templateFIleName, fileName, true);

            using (WordprocessingDocument newdoc =
                WordprocessingDocument.Open(fileName, true))
            {

                // Change document type (dotx->docx)
                newdoc.ChangeDocumentType(WordprocessingDocumentType.Document);
                SetDocumentKeyValues(newdoc, patTemplateResult.DictionaryInfo);

                Table table = null;
                IEnumerable<TableProperties> tableProperties = newdoc.MainDocumentPart.
                                        Document.Descendants<TableProperties>().
                                        Where(tp => tp.TableCaption != null);
                foreach (TableProperties tProp in tableProperties)
                {
                    if (tProp.TableCaption.Val == patTemplateResult.tableInfo.TablePlaceHolder) // see comment, this is actually StringValue
                    {
                        // do something for table with myCaption
                        table = (Table)tProp.Parent;
                        SetTableProperties(table);
                    }
                }
                foreach (var test in patTemplateResult.tableInfo.Tests)
                {
                    foreach (var res in test.Result)
                    {

                        TableRow tr = new TableRow();
                        tr.Append(new TableCell());
                        tr.Append(new TableCell());
                        tr.Append(new TableCell());
                        TableRow rowCopy = (TableRow)tr.CloneNode(true);
                        rowCopy.Descendants<TableCell>().ElementAt(0).Append(GetNewParagraph(res.ComponentName));
                        rowCopy.Descendants<TableCell>().ElementAt(1).Append(GetNewParagraph(res.Value, JustificationValues.Center, res.IsAbnormal));
                        rowCopy.Descendants<TableCell>().ElementAt(2).Append(GetNewParagraph(res.Method, JustificationValues.Center));
                        table.Append(rowCopy);
                    }
                }
                newdoc.MainDocumentPart.GetStream().CopyTo(returnMemStream);

            } // automaticall newdoc.close
            return fileName;

        }//contains desc and note ..no table
        //without table
        public string GetPusCultureAndSensitivityTemplate(LabReportTemplateModel template, PatTemplateResult patTemplateResult)
        {
            var returnMemStream = new MemoryStream();

            string dateTimeNow = DateTime.Now.ToString("dd-MM-yyyy_hh_mm_ss tt");

            string templateFIleName = _templateLocation + templateLocalFolder + "\\" + "CultureAndSensitivityTemplate.dotx";
            string fileName = _templateLocation + resultLocalFolder + "\\" + "CurrentTest.docx";
            //string fileName = _templateLocation + resultLocalFolder + "\\" + dateTimeNow + "CultureAndSensitivityTemplate.docx";

            File.Copy(templateFIleName, fileName, true);

            using (WordprocessingDocument newdoc =
                WordprocessingDocument.Open(fileName, true))
            {

                // Change document type (dotx->docx)
                newdoc.ChangeDocumentType(WordprocessingDocumentType.Document);

                var elements = newdoc.MainDocumentPart.
                                        Document.Descendants<SdtElement>();
                if (patTemplateResult.DictionaryInfo != null)
                {
                    ComponentResult Comp_isolatedOrg = patTemplateResult.tableInfo.Tests.SelectMany(a => a.Result)
                                .Where(a => a.ComponentName == "Isolated Organism").FirstOrDefault();
                    if (Comp_isolatedOrg != null)
                        patTemplateResult.DictionaryInfo.Add(Comp_isolatedOrg.ComponentName, Comp_isolatedOrg.Value);
                }
                SetDocumentKeyValues(newdoc, patTemplateResult.DictionaryInfo);

                Table table = null;
                IEnumerable<TableProperties> tableProperties = newdoc.MainDocumentPart.
                                        Document.Descendants<TableProperties>().
                                        Where(tp => tp.TableCaption != null);

                foreach (TableProperties tProp in tableProperties)
                {
                    if (tProp.TableCaption.Val == patTemplateResult.tableInfo.TablePlaceHolder) // see comment, this is actually StringValue
                    {
                        // do something for table with myCaption
                        table = (Table)tProp.Parent;
                        SetTableProperties(table);
                    }
                }
                foreach (var test in patTemplateResult.tableInfo.Tests)
                {
                    foreach (var res in test.Result)
                    {
                        if (res.ComponentName != "Isolated Organism")
                        {
                            TableRow tr = new TableRow();


                            tr.Append(new TableCell());
                            tr.Append(new TableCell());
                            TableRow rowCopy = (TableRow)tr.CloneNode(true);
                            rowCopy.Descendants<TableCell>().ElementAt(0).Append(GetNewParagraph(res.ComponentName));
                            rowCopy.Descendants<TableCell>().ElementAt(1).Append(GetNewParagraph(res.Value, JustificationValues.Center, res.IsAbnormal));
                            table.Append(rowCopy);
                        }
                    }
                }
                newdoc.MainDocumentPart.GetStream().CopyTo(returnMemStream);

            } // automaticall newdoc.close
            return fileName;

        }
        //without table.
        public string GetPusCultureAndSensitivityTemplate_Negative(LabReportTemplateModel template, PatTemplateResult patTemplateResult)
        {
            var returnMemStream = new MemoryStream();

            string dateTimeNow = DateTime.Now.ToString("dd-MM-yyyy_hh_mm_ss tt");

            string templateFIleName = _templateLocation + templateLocalFolder + "\\" + "PusCultureAndSensitivityTemplate_Negative.dotx";
            string fileName = _templateLocation + resultLocalFolder + "\\" + "CurrentTest.docx";

            File.Copy(templateFIleName, fileName, true);

            using (WordprocessingDocument newdoc =
                WordprocessingDocument.Open(fileName, true))
            {

                // Change document type (dotx->docx)
                newdoc.ChangeDocumentType(WordprocessingDocumentType.Document);


                SetDocumentKeyValues(newdoc, patTemplateResult.DictionaryInfo);

                newdoc.MainDocumentPart.GetStream().CopyTo(returnMemStream);

            } // automaticall newdoc.close
            return fileName;



        }//table contains 4 cols
        
             public string GetBloodCulture_Negative(LabReportTemplateModel template, PatTemplateResult patTemplateResult)
        {
            var returnMemStream = new MemoryStream();

            string dateTimeNow = DateTime.Now.ToString("dd-MM-yyyy_hh_mm_ss tt");

            string templateFIleName = _templateLocation + templateLocalFolder + "\\" + "BloodCulture_Negative.dotx";
            string fileName = _templateLocation + resultLocalFolder + "\\" + "CurrentTest.docx";

            File.Copy(templateFIleName, fileName, true);

            using (WordprocessingDocument newdoc =
                WordprocessingDocument.Open(fileName, true))
            {

                // Change document type (dotx->docx)
                newdoc.ChangeDocumentType(WordprocessingDocumentType.Document);


                SetDocumentKeyValues(newdoc, patTemplateResult.DictionaryInfo);

                newdoc.MainDocumentPart.GetStream().CopyTo(returnMemStream);

            } // automaticall newdoc.close
            return fileName;



        }//table contains 4 cols

        public string GetSputumCulture_Negative(LabReportTemplateModel template, PatTemplateResult patTemplateResult)
        {
            var returnMemStream = new MemoryStream();

            string dateTimeNow = DateTime.Now.ToString("dd-MM-yyyy_hh_mm_ss tt");

            string templateFIleName = _templateLocation + templateLocalFolder + "\\" + "SputumCulture_Negative.dotx";
            string fileName = _templateLocation + resultLocalFolder + "\\" + "CurrentTest.docx";

            File.Copy(templateFIleName, fileName, true);

            using (WordprocessingDocument newdoc =
                WordprocessingDocument.Open(fileName, true))
            {

                // Change document type (dotx->docx)
                newdoc.ChangeDocumentType(WordprocessingDocumentType.Document);


                SetDocumentKeyValues(newdoc, patTemplateResult.DictionaryInfo);

                newdoc.MainDocumentPart.GetStream().CopyTo(returnMemStream);

            } // automaticall newdoc.close
            return fileName;



        }//table contains 4 cols


        private void CreateTemplateWitoutTable(string fileName, PatTemplateResult patTemplateResult)
        {
            using (WordprocessingDocument newdoc1 =
                WordprocessingDocument.Open(fileName, true))
            {

                newdoc1.ChangeDocumentType(WordprocessingDocumentType.Document);

                List<SdtElement> elements = newdoc1.MainDocumentPart.
                                        Document.Descendants<SdtElement>().ToList();

                if (patTemplateResult.DictionaryInfo != null)
                {
                    foreach (var test in patTemplateResult.tableInfo.Tests)
                    {
                        foreach (var res in test.Result)
                        {
                            if (patTemplateResult.DictionaryInfo.ContainsKey(res.ComponentName) == false)
                            {
                                patTemplateResult.DictionaryInfo.Add(res.ComponentName, res.Value + " " + (string.IsNullOrEmpty(res.Unit) ? "" : res.Unit));
                            }
                        }
                    }
                    //add those keys which are not found in the Template as dynamic list to process them later.
                    List<KeyValuePair<string, string>> dynamicItems = new List<KeyValuePair<string, string>>();


                    foreach (KeyValuePair<string, string> item in patTemplateResult.DictionaryInfo)
                    {
                        // here placeholdername are passed as key of the KeyValueCollection in dictionary.
                        //we'll replace this element's text with value.
                        var tag = (from x in elements
                                   where x.Descendants<Tag>()
                                   .FirstOrDefault().Val == item.Key
                                   select x).FirstOrDefault();

                        if (tag != null)
                        {
                            if (item.Key != "CreatedBy")
                            {
                                var x1 = tag.Descendants<Text>().First<Text>();
                                x1.Text = item.Value;
                            }
                            else
                            {
                                var x1 = tag.Descendants<Text>().First<Text>();
                                SignatureFormatting(item.Value, x1);
                            }
                        }
                        else
                        {
                            dynamicItems.Add(item);
                        }
                    }

                    //add everything that comes in dynamicitems as one whole string (componentName:value) and set to the value.
                    if (dynamicItems.Count > 0)
                    {
                        string dynamicComponentString = "";

                        dynamicItems.ForEach(a =>
                        {
                            dynamicComponentString += a.Key + " : " + a.Value + "   ";
                        });

                        var dynamicTag = (from x in elements
                                          where x.Descendants<Tag>()
                                          .FirstOrDefault().Val == "DynamicComponent"
                                          select x).FirstOrDefault();
                        if (dynamicTag != null)
                        {
                            //Text newText = new Text();
                            //newText.Text = dynamicComponentString;
                            //dynamicTag.AppendChild<Text>(newText);
                            //dynamicTag.
                            //dynamicTag.InnerText = dynamicComponentString;

                            var x2 = dynamicTag.Descendants<Text>().First<Text>();
                            x2.Text = dynamicComponentString;
                        }
                    }

                }

            }
        }


        private void SetTableProperties(Table inputTable)
        {
            TableBorders tblBorders = new TableBorders();
            TableProperties tblProperties = new TableProperties();
            InsideHorizontalBorder insideHBorder = new InsideHorizontalBorder();
            insideHBorder.Val = new EnumValue<BorderValues>(BorderValues.Thick);
            insideHBorder.Color = "CC0000";
            tblBorders.AppendChild(insideHBorder);
            InsideVerticalBorder insideVBorder = new InsideVerticalBorder();
            insideVBorder.Val = new EnumValue<BorderValues>(BorderValues.Thick);
            insideVBorder.Color = "CC0000";
            tblBorders.AppendChild(insideVBorder);
            tblProperties.AppendChild(tblBorders);
            inputTable.AppendChild(tblProperties);
        }



        //sets dictionary/key-value properties of current template into Given Input Document.
        private void SetDocumentKeyValues(WordprocessingDocument document, Dictionary<string, string> templateDictionaryInfo)
        {
            var elements = document.MainDocumentPart.
                                        Document.Descendants<SdtElement>();

            if (templateDictionaryInfo != null)
            {
                foreach (KeyValuePair<string, string> item in templateDictionaryInfo)
                {
                    //// here placeholdername are passed as key of the KeyValueCollection in dictionary.
                    ////we'll replace this element's text with value.
                    var tag = (from x in elements
                               where x.Descendants<Tag>()
                               .FirstOrDefault().Val == item.Key
                               select x).FirstOrDefault();

                    if (tag != null)
                    {
                        var x1 = tag.Descendants<Text>().First<Text>();
                        if (item.Key != "CreatedBy")
                            x1.Text = item.Value;
                        else
                            SignatureFormatting(item.Value, x1);
                        x1.Space = SpaceProcessingModeValues.Default;
                    }

                }
            }


        }


        //create a paragraph with given text and justifiation, default justification=Left
        private Paragraph GetNewParagraph(string text, JustificationValues justification = JustificationValues.Left, bool? isAbnormal = false)
        {
            ParagraphProperties prgrphProps = new ParagraphProperties();
            Justification just = new Justification() { Val = justification };
            prgrphProps.Append(just);
            Run run = new Run(new Text((isAbnormal == true && this._highlightAbnormalLabResult == true) ? text + " *" : text));
            if (isAbnormal == true && this._highlightAbnormalLabResult == true)
            {
                RunProperties runProperties = new RunProperties();
                Bold bold = new Bold();
                bold.Val = OnOffValue.FromBoolean(true);
                runProperties.Append(bold);
                run.RunProperties = runProperties;
            }

            Paragraph retParagraph = new Paragraph(prgrphProps, run);
            return retParagraph;
        }
    }

}
