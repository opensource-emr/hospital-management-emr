using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.Core.Configuration;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using System.Data.Entity;
using System.Data.SqlClient;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using DanpheEMR.Utilities;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Http.Features;
using DanpheEMR.CommonTypes;
using DanpheEMR.Core;
using DanpheEMR.Core.Parameters;
using RefactorThis.GraphDiff;//for entity-update.
using DanpheEMR.Core.DynTemplates;

namespace DanpheEMR.Controllers
{


    public class DynTemplatesController : CommonController
    {

        public DynTemplatesController(IOptions<MyConfiguration> _config) : base(_config)
        {
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="reqType">eg: getTemplate, getQtn etc</param>
        /// <param name="templateName">currentTemplateName</param>
        /// <param name="renderMode">Template render mode: eg: edit, view etc.</param>
        /// <returns></returns>
        [HttpGet]
        public string Get(string reqType, string templateCode, string renderMode)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                CoreDbContext coreDbContext = new CoreDbContext(connString);
                if (reqType == "getSurveyTemplate")
                {

                    Template currTemplate = coreDbContext.Templates.Where(t => t.Code == templateCode)
                        .Include("Qnairs.ChildQuestions.Options").FirstOrDefault();
                    //order the questionnaires by their display sequence.
                    if (currTemplate != null && currTemplate.Qnairs != null)
                    {
                        //if value of displayseq are same, order by qnair id in that case.
                        currTemplate.Qnairs = currTemplate.Qnairs.OrderBy(q => q.DisplaySeq).ThenBy(q => q.QnairId).ToList();
                    }

                    ConfigureTemplate(currTemplate, renderMode);
                    responseData.Results = currTemplate;


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
            try
            {
                //RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                string reqType = this.ReadQueryStringData("reqType");
                string ipStr = this.ReadPostData();

                CoreDbContext coreDbContext = new CoreDbContext(connString);
                if (reqType == "addQuestion")
                {
                    Question qtnVM = DanpheJSONConvert.
                          DeserializeObject<Question>(ipStr);
                    if (qtnVM != null)
                    {
                        coreDbContext.Questions.Add(qtnVM);
                        coreDbContext.SaveChanges();
                        responseData.Results = qtnVM;
                    }

                }
                else if (reqType == "addQnair")
                {
                    Questionnaire qnrVM = DanpheJSONConvert.
                          DeserializeObject<Questionnaire>(ipStr);
                    if (qnrVM != null)
                    {
                        Questionnaire qnr = qnrVM;
                        coreDbContext.Questionnaires.Add(qnr);
                        coreDbContext.SaveChanges();
                        //we get qnairId once it is saved to database.
                        qnrVM.QnairId = qnr.QnairId;
                    }

                    responseData.Results = qnrVM;
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

        // PUT api/values/5
        [HttpPut]
        public string Put()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                //RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                string reqType = this.ReadQueryStringData("reqType");
                string ipStr = this.ReadPostData();

                CoreDbContext coreDbContext = new CoreDbContext(connString);

                if (reqType == "updateQnairs")
                {
                    //this is used to 1. Rename Questionnaire, 2. Change Display Sequence.
                    List<Questionnaire> qnrListFromclient = DanpheJSONConvert.
                           DeserializeObject<List<Questionnaire>>(ipStr);
                    if (qnrListFromclient != null && qnrListFromclient.Count > 0)
                    {
                        foreach (Questionnaire qnr in qnrListFromclient)
                        {
                            qnr.ChildQuestions = null;//needed since otherwise it goes on to add existing ChildQuestion again.
                                                      //coreDbContext.Entry(qnrFromClient).Property(q => q.Text).IsModified = true;
                            coreDbContext.Entry(qnr).State = EntityState.Modified;
                        }
                        coreDbContext.SaveChanges();
                    }

                    responseData.Results = qnrListFromclient;
                }
                else if (reqType == "updateQtn")
                {
                    Question qtnVM = DanpheJSONConvert.
                          DeserializeObject<Question>(ipStr);
                    if (qtnVM != null)
                    {
                        //use GraphDiff's updategraph method to save/delete question and option (hierarchy)
                        coreDbContext.UpdateGraph(qtnVM,
                          map => map.OwnedCollection(a => a.Options));
                        coreDbContext.SaveChanges();
                        responseData.Results = qtnVM;
                    }

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


        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }


        private Option AddOptionToDb(Option opt, CoreDbContext dbContext)
        {
            Option newOpt = new Option();


            return newOpt;
        }


        private Template NA_CreateTemplate(Template tmpl, List<Questionnaire> qnrs, List<Question> qtns, List<Option> opts, List<Option> maps)
        {
            Template tempVM = new Template();
            tempVM.TemplateId = tmpl.TemplateId;
            tempVM.Text = tmpl.Text;
            tempVM.Code = tmpl.Code;


            //get only those Qnrs which has mappings with the question table.
            List<Questionnaire> validQnrs = (from qnr in qnrs
                                             select new Questionnaire()
                                             {
                                                 QnairId = qnr.QnairId,
                                                 Text = qnr.Text,
                                                 TemplateId = tmpl.TemplateId
                                             }).Distinct().ToList();

            tempVM.Qnairs = validQnrs;

            foreach (Questionnaire qnr in tempVM.Qnairs)
            {
                NA_AddQtnsToQnair(qnr, qtns, maps, opts);
            }
            return tempVM;
        }

        private void NA_AddQtnsToQnair(Questionnaire currQnr, List<Question> qtns, List<Option> maps, List<Option> opts)
        {
            var qnrQtns = (from qtn in qtns
                               //add root level qtns at this stage.
                           where qtn.QnairId == currQnr.QnairId && qtn.ParentQtnId == null
                           select new Question()
                           {
                               TemplateId = currQnr.TemplateId,
                               QnairId = currQnr.QnairId,
                               QuestionId = qtn.QuestionId,
                               Text = qtn.Text,
                               ParentQtnId = qtn.ParentQtnId,
                               QtnHRCLevel = 0,//Hierarchy level is 0 at questionnaire level.
                               Type = qtn.Type,
                               ShowChilds = false,
                               ChildQtnAlignment = "vertical",//default vertical
                           }).ToList();

            if (qnrQtns != null && qnrQtns.Count > 0)
            {
                currQnr.ChildQuestions = qnrQtns;
                foreach (Question qtn in currQnr.ChildQuestions)
                {
                    NA_SetQuestion(qtn, qtns, maps, opts);
                }
            }

        }

        private void NA_SetQuestion(Question qtn, List<Question> allQtns, List<Option> maps, List<Option> options)
        {

            qtn.Options = NA_GetOptions(qtn.QuestionId, maps, options);
            List<Question> childQtns = allQtns.Where(q => q.ParentQtnId == qtn.QuestionId).ToList();

            if (childQtns != null && childQtns.Count > 0)
            {

                qtn.ChildQuestions = (from chld in childQtns
                                      select new Question()
                                      {
                                          TemplateId = qtn.TemplateId,
                                          QnairId = chld.QnairId,
                                          QuestionId = chld.QuestionId,
                                          Text = chld.Text,
                                          ParentQtnId = chld.ParentQtnId,
                                          QtnHRCLevel = qtn.QtnHRCLevel + 1,//Hierarchy level will increase by 1
                                          Type = chld.Type,
                                          ShowChilds = false,
                                          ChildQtnAlignment = "vertical",//default vertical
                                      }).ToList();

                foreach (Question chldQtn in qtn.ChildQuestions)
                {
                    NA_SetQuestion(chldQtn, allQtns, maps, options);
                }

            }
        }


        private List<Option> NA_GetOptions(int questionId, List<Option> maps, List<Option> options)
        {
            List<Option> retList = new List<Option>();

            retList = (from map in maps
                       join opt in options
                       on map.OptionId equals opt.OptionId
                       where map.QuestionId == questionId
                       select new Option()
                       {
                           OptionId = opt.OptionId,
                           IsDefault = map.IsDefault,
                           IsSelected = false,
                           Text = opt.Text,
                           ShowChildOnSelect = map.ShowChildOnSelect
                       }).ToList();

            return retList;
        }

        /// <summary>
        /// This removes the Qnairs->ChildQuestion mapping where parentid are null.
        /// needed since g-child questions wer coming as a part of childqtns of qnairs since they have</summary>
        /// same questionnaireid as that of parent question.
        /// 
        /// <param name="template">template object</param>
        /// <param name="renderMode">template render mode, default=fill. Removes Inactive option when rendermode = fill or view
        /// shows also the inactive options when render mode = edit.</param>
        private void ConfigureTemplate(Template template, string renderMode = "fill")
        {
            ///goes only upto 3level hierarchy (same as in UI), increase it if needed later on.
            template.Qnairs.ForEach(qnr =>
            {
                //remove all questions which are not RootLevelQtns. i.e: rootlevel qtn has parent id either null or zero.
                qnr.ChildQuestions.RemoveAll(q => q.ParentQtnId != null && q.ParentQtnId != 0);

                qnr.ChildQuestions.ForEach(_Lvl0 =>
                {
                    //remove Inactive options when rendermode=view
                    if (_Lvl0.Options != null && renderMode != "edit")
                    {
                        _Lvl0.Options.RemoveAll(o => o.IsActive == false);
                    }

                    if (_Lvl0.ChildQuestions != null && _Lvl0.ChildQuestions.Count > 0)
                    {
                        _Lvl0.ChildQuestions.ForEach(_Lvl1 =>
                        {
                            if (_Lvl1.Options != null && renderMode != "edit")
                            {
                                _Lvl1.Options.RemoveAll(o => o.IsActive == false);
                            }

                            _Lvl1.QtnHRCLevel = 1;
                            if (_Lvl1.ChildQuestions != null && _Lvl1.ChildQuestions.Count > 0)
                            {
                                _Lvl1.ChildQuestions.ForEach(_Lvl2 =>
                                {
                                    if (_Lvl2.Options != null && renderMode != "edit")
                                    {
                                        _Lvl2.Options.RemoveAll(o => o.IsActive == false);
                                    }
                                    _Lvl2.QtnHRCLevel = 2;
                                });
                            }
                        });

                    }
                });

            });

            string str = DanpheJSONConvert.SerializeObject(template);


        }


    }



}
