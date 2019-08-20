/*
 File: CommonTypes.cs
 created: 28Jan'17-sudarshan
 description: this class contains all type classes which are to be used commonly across the appliccation
 remarks: 
 -------------------------------------------------------------------
 change history:
 -------------------------------------------------------------------
 S.No     ModifiedBy/Date             description           remarks
 -------------------------------------------------------------------
 1.       sudarshan/28Jan'17          created           -- added public class DanpheHTTPResponse<T>

 -------------------------------------------------------------------
 */


namespace DanpheEMR.CommonTypes
{
    public class DanpheHTTPResponse<T>
    {
        public T Results { get; set; }
        public string Status { get; set; }
        public string ErrorMessage { get; set; }

        public DanpheHTTPResponse()
        {
            this.Status = string.Empty;
            this.ErrorMessage = string.Empty;
        }

        public static DanpheHTTPResponse<T> FormatResult(T results)
        {
            return new DanpheHTTPResponse<T>() { Results = results };
        }

        public static DanpheHTTPResponse<T> FormatResult(T results, string status)
        {
            return new DanpheHTTPResponse<T>() { Status = status, Results = results };
        }

        public static DanpheHTTPResponse<T> FormatResult(T results, string status, string errorMessage)
        {
            return new DanpheHTTPResponse<T>() { Status = status, Results = results, ErrorMessage = errorMessage };
        }

    }
}
