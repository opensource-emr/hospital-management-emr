using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.Core.DynTemplates
{
    public class Questionnaire
    {
        [Key]
        public int QnairId { get; set; }
        public string Text { get; set; }
        public int TemplateId { get; set; }

        //to set the display position of this Section inside the Template.
        public int? DisplaySeq { get; set; }

        public List<Question> ChildQuestions { get; set; }

        public Questionnaire()
        {
            this.ChildQuestions = new List<Question>();
        }

        public Template Template { get; set; }

    }
}
