using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace DanpheEMR.Utilities
{
    public class DanpheJSONConvert
    {
        public static string SerializeObject(object input, bool ignoreLoop = true)
        {
            var jsonmappings = new JsonSerializerSettings();
            if (ignoreLoop)
            {
                jsonmappings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
            }
            string returnValue = JsonConvert.SerializeObject(input, jsonmappings);
            return returnValue;

        }
      

        public static object DeserializeObject(string input)
        {
            object returnValue = JsonConvert.DeserializeObject(input);
            return returnValue;
        }

        public static T DeserializeObject<T>(string input) 
        {
            T returnValue = JsonConvert.DeserializeObject<T>(input);
            return returnValue;
        }

    }
}
