using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DanpheEMR.Core.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using DanpheEMR.DalLayer;
using DanpheEMR.Utilities;
using DanpheEMR.CommonTypes;
using System.IO;
using System.Data.Entity.Validation;
using System.Data.SqlClient;
using System.Data;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Formatters.Binary;
using DanpheEMR.ServerModel;
using System.Configuration;
using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using DanpheEMR.Security;
using System.Data.Entity;

namespace DanpheEMR.Controllers
{
    [Produces("application/json")]
    [Route("api/Dicom")]
    public class DicomController : CommonController
    {
        public DicomController(IOptions<MyConfiguration> _config) : base(_config)
        {
        }


        //api/Dicom/byDicomFileId?id=1
        [HttpGet("byDicomFileId")]
        public FileStreamResult GetDicomImage(Int64 dicomFileId)
        {
            DicomDbContext dbContext = new DicomDbContext(connStringPACSServer);

            var fileBytes = (from fil in dbContext.DicomFiles
                             where fil.DicomFileId == dicomFileId
                             select fil.FileBinaryData).FirstOrDefault();

            Stream stream = new MemoryStream(fileBytes);

            return new FileStreamResult(stream, "plain/text");
        }

        [HttpGet]
        public string Get(string reqType, string status, string studyInstanceUID, string sopInstanceUID, string patStudyId, Int64 dicomFileId)
        {
            DicomDbContext dbContext = new DicomDbContext(connStringPACSServer);

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

            try
            {
                //return distinct studies information.
                if (reqType == "getStudies")//For Geting a List of StudyId's
                {

                    var distPatStudies = (from pat in dbContext.PatientStudies
                                          where pat.PatientName != null && pat.StudyInstanceUID != null
                                          select new
                                          {
                                              StudyId = pat.PatientStudyId,
                                              PatientName = pat.PatientName,
                                              PatientId = pat.PatientId,
                                              StudyDate = pat.StudyDate,
                                              StudyInstanceUID = pat.StudyInstanceUID,
                                              StudyDescription = pat.StudyDescription
                                          }).Distinct().ToList();
                    responseData.Results = distPatStudies;

                }
                else if (reqType == "getStudiesByPatStudyId")
                {
                    if (patStudyId != null)
                    {
                        List<string> allPatientStudyId = new List<string>(patStudyId.Split(','));
                        // var gg = patStudyId.Split(';').Select(Convert.ToInt32).ToList();
                        var res = (from patStudy in dbContext.PatientStudies.AsEnumerable()
                                   where patStudy.PatientName != null && patStudy.StudyInstanceUID != null
                                   && allPatientStudyId.Contains(Convert.ToString(patStudy.PatientStudyId))
                                   select new
                                   {
                                       StudyId = patStudy.PatientStudyId,
                                       PatientName = patStudy.PatientName,
                                       PatientId = patStudy.PatientId,
                                       StudyDate = patStudy.StudyDate,
                                       StudyInstanceUID = patStudy.StudyInstanceUID,
                                       StudyDescription = patStudy.StudyDescription
                                   }).Distinct().ToList();
                        responseData.Results = res;
                    }


                    //var distPatStudies = (from pat in dbContext.PatientStudies.AsEnumerable()
                    //                      where pat.PatientName != null && pat.StudyInstanceUID != null
                    //                      && pat.PatientStudyId == patStudyId
                    //                      select new
                    //                      {
                    //                          StudyId = pat.PatientStudyId,
                    //                          PatientName = pat.PatientName,
                    //                          PatientId = pat.PatientId,
                    //                          StudyDate = pat.StudyDate,
                    //                          StudyInstanceUID = pat.StudyInstanceUID,
                    //                          StudyDescription = pat.StudyDescription
                    //                      }).Distinct().ToList();

                }
                else if (reqType == "getSeriesImageInfo")//For Acquiring a list of SoapId's
                {

                    var rest = (from pat in dbContext.PatientStudies
                                where pat.StudyInstanceUID == studyInstanceUID
                                select new
                                {
                                    pat.PatientId,
                                    pat.PatientName,
                                    pat.PatientStudyId,
                                    pat.Modality,
                                    pat.StudyDescription,
                                    pat.StudyDate,
                                    SeriesList = from sers in dbContext.Series
                                                 where sers.PatientStudyId == pat.PatientStudyId
                                                 select new
                                                 {
                                                     SeriesInstanceUID = sers.SeriesInstanceUID,
                                                     SeriesDescription = sers.SeriesDescription,
                                                     //FrameRate = 1,//check if we can get this from image property.
                                                     ImageList = from img in dbContext.DicomFiles
                                                                 where img.SeriesId == sers.SeriesId
                                                                 select new
                                                                 {
                                                                     DicomFileId = img.DicomFileId,
                                                                     SOPInstanceUID = img.SOPInstanceUID,
                                                                     //img.SOPInstanceUID
                                                                     //img.FileBinaryData
                                                                 }
                                                 }
                                }).FirstOrDefault();

                    responseData.Results = rest;
                    responseData.Status = "OK";
                }
                else if (reqType == "loadImagesByDicomFileId")
                {

                    var fileBytes = (from fil in dbContext.DicomFiles
                                     where fil.DicomFileId == dicomFileId
                                     select fil.FileBinaryData).FirstOrDefault();

                    Stream stream = new MemoryStream(fileBytes);
                    responseData.Results = stream;
                    responseData.Status = "OK";
                    return new FileStreamResult(stream, "plain/text").ToString();

                }
                else if (reqType == "getByteArray")//For Ajax Call Made in Javascript Index.cshtml Page
                {

                    //var soapIdList = (from dic in dbContext.DicomFiles
                    //                  join pat in dbContext.PatientStudies on dic.PatientStudyId equals pat.PatientStudyId

                    //                  where pat.PatientId != null && pat.PatientName != null && pat.SeriesInstanceUID != null
                    //                  && dic.SOPInstanceUID == sopInstanceUID

                    //                  select new
                    //                  {
                    //                      SOPInstanceUID = dic.SOPInstanceUID,
                    //                      FileData = Convert.ToBase64String(dic.FileBinaryData)

                    //                  }).ToList();


                    //responseData.Results = soapIdList;


                }
                else if (reqType == "getAllData")
                {
                    var alldatas = (from pat in dbContext.PatientStudies
                                    join series in dbContext.Series on pat.PatientStudyId equals series.PatientStudyId
                                    join dcm in dbContext.DicomFiles on series.SeriesId equals dcm.SeriesId
                                    where pat.StudyInstanceUID == studyInstanceUID
                                    select new
                                    {
                                        StudyId = pat.PatientStudyId,
                                        PatientName = pat.PatientName,
                                        PatientId = pat.PatientId,
                                        PatientStudyIdm = pat.PatientStudyId,
                                        StudyDate = pat.StudyDate,
                                        StudyInstanceUID = pat.StudyInstanceUID,
                                        StudyDescription = pat.StudyDescription,
                                        SeriesId = series.SeriesId,
                                        DicomFileId = dcm.DicomFileId,
                                        ROWGUID = dcm.ROWGUID,
                                        FileBinaryData = dcm.FileBinaryData,
                                        FileToolData = dcm.FileToolData

                                    }).Distinct().ToList();
                    responseData.Results = alldatas;

                }
                else if (reqType == "dicomFileToolData")
                {
                    var fileToolData = (from toolData in dbContext.DicomFiles
                                        where toolData.DicomFileId == dicomFileId
                                        select new
                                        {
                                            FileToolData = toolData.FileToolData
                                        }).ToList();
                    responseData.Results = fileToolData;
                }

                responseData.Status = "OK";

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }


        // POST api/values
        [HttpPost]
        public string Post()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            responseData.Status = "OK";

            try
            {
                string basepath = ConfigurationManager.AppSettings["DestinationPathAPI"];

                string ipDataString = this.ReadPostData();
                JObject obj = JObject.Parse(ipDataString);
                string data = (string)obj["fileData"];
                // ImageQueueModel ImgQObj = JsonConvert.DeserializeObject<ImageQueueModel>(imgData);

                //string jsonString = Encoding.ASCII.GetString(data.ToArray());

                byte[] byteArray = Encoding.ASCII.GetBytes(data);

                //Stream reqStream = Request.Body;
                MemoryStream inMemoryStream = new MemoryStream(byteArray);
                Request.Body.CopyTo(inMemoryStream);
                string jsonString = Encoding.ASCII.GetString(inMemoryStream.ToArray());
                DicomWrapperVM dcmWrapObj = JsonConvert.DeserializeObject<DicomWrapperVM>(jsonString);
                DicomFileInfoModel fileInfo = dcmWrapObj.FileInfo;

                int patstudyId = 0;
                int seriesId = 0;




                DicomDbContext dbContext = new DicomDbContext(connStringPACSServer);

                //check if particular SeriesInstanceUID is present or not.. if not present then only insert in PatientStudies table
                var StudyCheck = (from patstudy in dbContext.PatientStudies
                                  where patstudy.StudyInstanceUID == dcmWrapObj.PatientStudy.StudyInstanceUID
                                  select patstudy).FirstOrDefault();

                if (StudyCheck == null)
                {
                    InsertPatientStudiesData(dcmWrapObj.PatientStudy, dbContext);
                    patstudyId = dcmWrapObj.PatientStudy.PatientStudyId;
                }
                else
                {
                    patstudyId = StudyCheck.PatientStudyId;
                }


                //check if particular SeriesInstanceUID is present or not.. if not present then only insert in PatientStudies table
                var SeriesCheck = (from patSeries in dbContext.Series
                                   where patSeries.SeriesInstanceUID == dcmWrapObj.SeriesInfo.SeriesInstanceUID
                                   select patSeries).FirstOrDefault();

                if (SeriesCheck == null)
                {
                    dcmWrapObj.SeriesInfo.PatientStudyId = patstudyId;
                    InsertPatientSeriesData(dcmWrapObj.SeriesInfo, dbContext);
                    seriesId = dcmWrapObj.SeriesInfo.SeriesId;
                }
                else
                {
                    seriesId = SeriesCheck.SeriesId;
                }


                //can comment out below code of creating folders and saving file
                //folderpath format:  apistoragelocation\patname-studyid\seriesname-seriesid\sopinstanceid of file
                string studyFolderName = "", seriesFolderName = "";
                if (string.IsNullOrEmpty(dcmWrapObj.PatientStudy.PatientName))
                    studyFolderName = "NA-" + patstudyId;
                else
                    studyFolderName = dcmWrapObj.PatientStudy.PatientName + "-" + patstudyId;

                if (string.IsNullOrEmpty(dcmWrapObj.SeriesInfo.SeriesDescription))
                    seriesFolderName = "NA-" + seriesId;
                else
                    seriesFolderName = dcmWrapObj.SeriesInfo.SeriesDescription + "-" + seriesId;


                //! ? dcmWrapObj.PatientStudy.PatientName + "-" + patstudyId;
                string path = basepath + @"\" + studyFolderName + @"\" + seriesFolderName;
                string fileName = path + @"\" + Path.GetFileName(dcmWrapObj.FileInfo.SOPInstanceUID);
                if (!(Directory.Exists(path)))
                {
                    Directory.CreateDirectory(path);
                }
                //Save the File to the Directory (Folder).
                System.IO.File.WriteAllBytes(fileName, dcmWrapObj.FileBytes);


                //get from table if data present... if not found then insert data in table DicomFiles
                var dicomfileCheck = (from f in dbContext.DicomFiles
                                      where f.SOPInstanceUID == dcmWrapObj.FileInfo.SOPInstanceUID
                                      select f).FirstOrDefault();
                responseData.Status = "OK";
                if (dicomfileCheck == null)
                {
                    DicomFileInfoModel dcmFile = new DicomFileInfoModel();
                    dcmFile.SeriesId = seriesId;
                    dcmFile.FileBinaryData = dcmWrapObj.FileBytes;
                    dcmFile.FilePath = fileName;
                    dcmFile.ROWGUID = dcmWrapObj.FileInfo.ROWGUID;
                    dcmFile.SOPInstanceUID = dcmWrapObj.FileInfo.SOPInstanceUID;
                    dcmFile.CreatedOn = DateTime.Now;

                    dbContext.DicomFiles.Add(dcmFile);
                    dbContext.SaveChanges();


                }

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + "exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        // PUT api/values/5
        [HttpPut]
        public string Put()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            DicomDbContext dbContextDicom = new DicomDbContext(connStringPACSServer);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string inputSting = this.ReadPostData();

            try
            {
                //if(inputSting !=null && reqType="putToolData")
                //{ 
                object clientData = DanpheJSONConvert.DeserializeObject<object>(inputSting);

                JObject obj = JObject.Parse(inputSting);

               
                var FileToolData = obj["FileToolData"].ToString();
                var DicomFileId = int.Parse(obj["DicomFileId"]["dicomFileId"].ToString());

                DicomFileInfoModel getDataForUpdate = dbContextDicom.DicomFiles.Where(d => d.DicomFileId == DicomFileId).FirstOrDefault<DicomFileInfoModel>();

                getDataForUpdate.FileToolData = FileToolData;
                getDataForUpdate.ModifiedBy = currentUser.UserId;
                getDataForUpdate.ModifiedOn = DateTime.Now;
                dbContextDicom.DicomFiles.Attach(getDataForUpdate);
                dbContextDicom.Entry(getDataForUpdate).Property(u => u.CreatedOn).IsModified = true;
                dbContextDicom.Entry(getDataForUpdate).State = EntityState.Modified;
                dbContextDicom.SaveChanges();
                responseData.Results = getDataForUpdate.DicomFileId;
                responseData.Status = "OK";
                //}
                //else{
                //        responseData.Status = "Failed";
                //        responseData.Results = "input data is not available";
                //    }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }


        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }


        public static void InsertPatientStudiesData(PatientStudyModel patData, DicomDbContext dcmdbContext)
        {
            //dcmWrapObj.FileInfo.FileName = dcmWrapObj.FileInfo.SOPInstanceUID;
            ///dcmWrapObj.FileInfo.FilePath = path;
            patData.CreatedOn = DateTime.Now;
            dcmdbContext.PatientStudies.Add(patData);
            dcmdbContext.SaveChanges();
        }

        public static void InsertPatientSeriesData(SeriesInfoModel serData, DicomDbContext dcmdbContext)
        {
            serData.CreatedOn = DateTime.Now;
            dcmdbContext.Series.Add(serData);
            dcmdbContext.SaveChanges();
        }
        public static void InsertFileInfoData(DicomFileInfoModel fileInfo, DicomDbContext dcmdbContext)
        {
            //dcmWrapObj.FileInfo.FileName = dcmWrapObj.FileInfo.SOPInstanceUID;
            ///dcmWrapObj.FileInfo.FilePath = path;
            try
            {
                fileInfo.CreatedOn = DateTime.Now;
                dcmdbContext.DicomFiles.Add(fileInfo);
                dcmdbContext.SaveChanges();
            }
            catch (DbEntityValidationException e)
            {
                foreach (var eve in e.EntityValidationErrors)
                {
                    Console.WriteLine("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:",
                        eve.Entry.Entity.GetType().Name, eve.Entry.State);
                    foreach (var ve in eve.ValidationErrors)
                    {
                        Console.WriteLine("- Property: \"{0}\", Error: \"{1}\"",
                            ve.PropertyName, ve.ErrorMessage);
                    }
                }

            }

        }

        public static object DeserializeFromStream(MemoryStream stream)
        {
            IFormatter formatter = new BinaryFormatter();
            stream.Seek(0, SeekOrigin.Begin);
            object o = formatter.Deserialize(stream);
            return o;
        }

        private Boolean InsertData(SqlCommand cmd)
        {
            //String strConnString = System.Configuration.ConfigurationManager
            //.ConnectionStrings["conString"].ConnectionString;
            SqlConnection con = new SqlConnection(connString);
            cmd.CommandType = CommandType.Text;
            cmd.Connection = con;
            try
            {
                con.Open();
                cmd.ExecuteNonQuery();
                return true;
            }
            catch (Exception ex)
            {
                //Response.Write(ex.Message);
                Console.WriteLine(ex.Message);
                return false;
            }
            finally
            {
                con.Close();
                con.Dispose();
            }
        }
    }
}
