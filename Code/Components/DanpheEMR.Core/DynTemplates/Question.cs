using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.Core.DynTemplates
{
    public class Question
    {
        [Key]
        public int QuestionId { get; set; }

        public int TemplateId { get; set; }

        //[ForeignKey("Qnair")]
        public int QnairId { get; set; }
        //public Questionnaire Qnair { get; set; }

        public string Text { get; set; }
        public string Type { get; set; }


        //IMPORTANT: FOREIGN KEY TO self referring table.
        public Question ParentQtn { get; set; }
        [ForeignKey("ParentQtn")]//this should be name of the navigation property, not the Column
        public int? ParentQtnId { get; set; }

        //to set the display position of this question inside the questionnaire.
        public int? DisplaySeq { get; set; }

        public List<Question> ChildQuestions { get; set; }
        //IMPORTANT: THE navigation Property o


        [NotMapped]
        public int QtnHRCLevel { get; set; }
        public bool? ShowChilds { get; set; }
        [NotMapped]
        public string ChildQtnAlignment { get; set; }
        [NotMapped]
        public string SelectedAnswer { get; set; }

        public List<Option> Options { get; set; }


    }
}
