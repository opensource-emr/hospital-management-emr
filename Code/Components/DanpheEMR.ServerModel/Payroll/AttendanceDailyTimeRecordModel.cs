using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class AttendanceDailyTimeRecord
    {
        [Key]
        [JsonProperty(PropertyName = "myProperty")]
        [JsonConverter(typeof(NullToEmptyStringConverter))]
        public int ID { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public string RecordDateTime { get; set; }
    }

   public  class NullToEmptyStringConverter : JsonConverter
    {
        public override bool CanConvert(Type objectType)
        {
            return objectType == typeof(object[]);
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            throw new NotImplementedException();
        }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            if (value == null)
                writer.WriteValue("");
        }
    }
}
