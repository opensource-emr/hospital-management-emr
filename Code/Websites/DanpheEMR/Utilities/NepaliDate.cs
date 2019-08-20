using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data.Sql;
using System.Data.SqlClient;
using System.Data.SqlTypes;
using System.Data;
using System.Collections;
using Microsoft.Extensions.Options;
using DanpheEMR.Core.Configuration;



namespace DanpheEMR.Utilities
{
    //This class uses database entries to do the conversion.
    //we can exclude using this class for client side as of now.
    //later when we need the conversion feature in server side, we can use this class
    //sudarshan: 5June'17

    public class NepaliDate
    {
        public string NepDate;
        SqlConnection sqlConnection;
        string sqlQuery;
        ArrayList Years = new ArrayList();
        ArrayList Months = new ArrayList();
        DateTime StartDate;

        private int _NepaliMonth;
        private int _NepaliDay;
        private int _NepaliYear;

        public int NepaliDay
        {
            get { return _NepaliDay; }
        }

        public int NepaliMonth
        {
            get { return _NepaliMonth; }
        }
        public int NepaliYear
        {
            get { return _NepaliYear; }
        }

        public NepaliDate()
        {
        }

        // GET: api/values
        private readonly string connString = null;
        public NepaliDate(string connectionString)
        {
            connString = connectionString;
        }

        public NepaliDate(DateTime MyDate)
        {
            DateTime today = DateTime.Today;
            DataTable dtCm = new DataTable();
            DataTable dtCy = new DataTable();
            DataTable dtEm = new DataTable();

            int year = Convert.ToInt32(MyDate.Year);
            int month = Convert.ToInt32(MyDate.Month);
            int day = Convert.ToInt32(MyDate.Day);

            int temp = 0, nY = 0;
            int NMonth, NDate, TotalDay, TotalDayNep = 0;
            sqlConnection = GetLocalSqlConnection();
            sqlQuery = "Select * from d_CalendarMonthInfo";
            SqlDataAdapter da = new SqlDataAdapter(sqlQuery, sqlConnection);
            da.Fill(dtCm);

            for (int i = 0; i < dtCm.Rows.Count; i++)
            {
                Months.Add(Convert.ToInt32(dtCm.Rows[i]["nNoOfDays"].ToString()));
            }

            sqlQuery = "Select * from d_CalendarYearInfo";
            SqlDataAdapter da1 = new SqlDataAdapter(sqlQuery, sqlConnection);
            da1.Fill(dtCy);
            nY = 2000 + nY - 1943;
            for (int i = 0; i < dtCy.Rows.Count; i++)
            {
                Years.Add(Convert.ToDateTime(dtCy.Rows[i]["YearStart"].ToString()));

            }
            nY = 2000 + year - 1943;
            if (MyDate < Convert.ToDateTime(Years[year - 1943].ToString()))
            {
                nY = nY - 1;
                StartDate = Convert.ToDateTime(Years[year - 1943 - 1].ToString());
            }
            else
            {
                StartDate = Convert.ToDateTime(Years[year - 1943].ToString());
            }
            NDate = 1;
            NMonth = 1;
            TimeSpan diff = MyDate.Subtract(StartDate);
            TotalDay = diff.Days + 1;
            for (int i = 1; i <= 12; i++)
            {
                if (TotalDay <= TotalDayNep)
                { break; }
                else
                {
                    TotalDayNep = TotalDayNep + Convert.ToInt32(Months[((nY - 2000) * 12) + (i - 1)].ToString());
                    temp = i;
                }
            }
            TotalDayNep = TotalDay - (TotalDayNep - Convert.ToInt32(Months[(((nY - 2000) * 12) + (temp - 1))].ToString()));
            this._NepaliMonth = temp;
            this._NepaliYear = nY;
            this._NepaliDay = TotalDayNep;
        }

        public string LongMonth(int m)
        {
            if (m == 1) return "Baisakh";
            else if (m == 2) return "Jestha";
            else if (m == 3) return "Ashadh";
            else if (m == 4) return "Shrawan";
            else if (m == 5) return "Bhadra";
            else if (m == 6) return "Ashwin";
            else if (m == 7) return "Kartik";
            else if (m == 8) return "Mangsir";
            else if (m == 9) return "Poush";
            else if (m == 10) return "Magh";
            else if (m == 11) return "Falgun";
            else if (m == 12) return "Chaitra";
            else return "Error";
        }

        public DateTime NeptoEnglishDate(string MyDate)
        {
            char[] sep = new char[2];
            sep[0] = '/';
            sep[1] = '-';
            string[] NepDate = MyDate.Split(sep);
            int year = Convert.ToInt32(NepDate[0].ToString());
            int month = Convert.ToInt32(NepDate[1].ToString());
            int day = Convert.ToInt32(NepDate[2].ToString());
            int TotalDay = 0;
            DataTable dtCm = new DataTable();
            DataTable dtCy = new DataTable(); ;
            sqlConnection = GetLocalSqlConnection();
            sqlConnection.Open();
            sqlQuery = "Select * from d_CalendarMonthInfo";
            SqlDataAdapter da = new SqlDataAdapter(sqlQuery, sqlConnection);
            da.Fill(dtCm);
            for (int i = 0; i < dtCm.Rows.Count; i++)
            {
                Months.Add(Convert.ToInt32(dtCm.Rows[i]["nNoOfDays"].ToString()));
            }
            sqlQuery = "Select * from d_CalendarYearInfo";
            SqlDataAdapter da1 = new SqlDataAdapter(sqlQuery, sqlConnection);
            da1.Fill(dtCy);
            for (int i = 0; i < dtCy.Rows.Count; i++)
            {
                Years.Add(Convert.ToDateTime(dtCy.Rows[i]["YearStart"].ToString()));

            }
            DateTime StartDate = Convert.ToDateTime(Years[year - 2000].ToString());
            for (int i = 1; i <= month - 1; i++)
            {
                TotalDay = TotalDay + Convert.ToInt32(Months[(((year - 2000) * 12) + (i - 1))].ToString());
            }
            TotalDay = TotalDay + day;
            StartDate = StartDate.AddDays(TotalDay - 1);
            if (sqlConnection.State == ConnectionState.Open)
            {
                sqlConnection.Close();
            }
            return StartDate;
        }

        public string EngToNepaliDate(DateTime MyDate)
        {
            DateTime today = DateTime.Today;
            DataTable dtCm = new DataTable();
            DataTable dtCy = new DataTable();
            DataTable dtEm = new DataTable();

            int year = Convert.ToInt32(MyDate.Year);
            int month = Convert.ToInt32(MyDate.Month);
            int day = Convert.ToInt32(MyDate.Day);

            int temp = 0, nY = 0;
            int NMonth, NDate, TotalDay, TotalDayNep = 0;
            sqlConnection = GetLocalSqlConnection();
            sqlQuery = "Select * from d_CalendarMonthInfo";
            SqlDataAdapter da = new SqlDataAdapter(sqlQuery, sqlConnection);
            da.Fill(dtCm);

            for (int i = 0; i < dtCm.Rows.Count; i++)
            {
                Months.Add(Convert.ToInt32(dtCm.Rows[i]["nNoOfDays"].ToString()));
            }

            sqlQuery = "Select * from d_CalendarYearInfo";
            SqlDataAdapter da1 = new SqlDataAdapter(sqlQuery, sqlConnection);
            da1.Fill(dtCy);
            nY = 2000 + nY - 1943;
            for (int i = 0; i < dtCy.Rows.Count; i++)
            {
                Years.Add(Convert.ToDateTime(dtCy.Rows[i]["YearStart"].ToString()));

            }
            nY = 2000 + year - 1943;
            if (MyDate < Convert.ToDateTime(Years[year - 1943].ToString()))
            {
                nY = nY - 1;
                StartDate = Convert.ToDateTime(Years[year - 1943 - 1].ToString());
            }
            else
            {
                StartDate = Convert.ToDateTime(Years[year - 1943].ToString());
            }

            NDate = 1;
            NMonth = 1;
            TimeSpan diff = MyDate.Subtract(StartDate);
            TotalDay = diff.Days + 1;
            for (int i = 1; i <= 12; i++)
            {
                if (TotalDay <= TotalDayNep)
                { break; }
                else
                {
                    TotalDayNep = TotalDayNep + Convert.ToInt32(Months[((nY - 2000) * 12) + (i - 1)].ToString());
                    temp = i;
                }
            }
            TotalDayNep = TotalDay - (TotalDayNep - Convert.ToInt32(Months[(((nY - 2000) * 12) + (temp - 1))].ToString()));
            NDate = TotalDayNep;
            NMonth = temp;

            string dtstring = nY + "/" + NMonth + "/" + NDate;
            this._NepaliYear = nY;
            this._NepaliDay = NMonth;
            this._NepaliDay = NDate;
            return dtstring;
        }

        public string NepaliLongDate(DateTime MyDate)
        {
            DateTime today = DateTime.Today;
            DataTable dtCm = new DataTable();
            DataTable dtCy = new DataTable();
            DataTable dtEm = new DataTable();

            int year = Convert.ToInt32(MyDate.Year);
            int month = Convert.ToInt32(MyDate.Month);
            int day = Convert.ToInt32(MyDate.Day);

            int temp = 0, nY = 0;
            int NMonth, NDate, TotalDay, TotalDayNep = 0;
            sqlConnection = GetLocalSqlConnection();
            sqlQuery = "Select * from d_CalendarMonthInfo";
            SqlDataAdapter da = new SqlDataAdapter(sqlQuery, sqlConnection);
            da.Fill(dtCm);

            for (int i = 0; i < dtCm.Rows.Count; i++)
            {
                Months.Add(Convert.ToInt32(dtCm.Rows[i]["nNoOfDays"].ToString()));
            }

            sqlQuery = "Select * from d_CalendarYearInfo";
            SqlDataAdapter da1 = new SqlDataAdapter(sqlQuery, sqlConnection);
            da1.Fill(dtCy);
            nY = 2000 + nY - 1943;
            for (int i = 0; i < dtCy.Rows.Count; i++)
            {
                Years.Add(Convert.ToDateTime(dtCy.Rows[i]["YearStart"].ToString()));

            }
            nY = 2000 + year - 1943;
            if (MyDate < Convert.ToDateTime(Years[year - 1943].ToString()))
            {
                nY = nY - 1;
                StartDate = Convert.ToDateTime(Years[year - 1943 - 1].ToString());
            }
            else
            {
                StartDate = Convert.ToDateTime(Years[year - 1943].ToString());
            }

            NDate = 1;
            NMonth = 1;
            TimeSpan diff = MyDate.Subtract(StartDate);
            TotalDay = diff.Days + 1;
            for (int i = 1; i <= 12; i++)
            {
                if (TotalDay <= TotalDayNep)
                { break; }
                else
                {
                    TotalDayNep = TotalDayNep + Convert.ToInt32(Months[((nY - 2000) * 12) + (i - 1)].ToString());
                    temp = i;
                }
            }
            TotalDayNep = TotalDay - (TotalDayNep - Convert.ToInt32(Months[(((nY - 2000) * 12) + (temp - 1))].ToString()));
            NDate = TotalDayNep;
            NMonth = temp;
            string dtstring = nY + " " + LongMonth(NMonth) + " " + NDate;
            this._NepaliYear = nY;
            this._NepaliDay = NMonth;
            this._NepaliDay = NDate;
            return dtstring;
        }
        public DataTable getNepaliMonth(int month)
        {
            sqlConnection = GetLocalSqlConnection();
            sqlQuery = "Select * from d_NepaliMonth where Code = '" + month + "'";
            SqlDataAdapter da = new SqlDataAdapter(sqlQuery, sqlConnection);
            DataSet ds = new DataSet();

            da.Fill(ds, "getnepalimonth");
            return ds.Tables["getnepalimonth"];
        }

        private SqlConnection GetLocalSqlConnection()
        {
            string connString = this.connString;
            SqlConnection conn = new SqlConnection(connString);
            return conn;
        }

    }
}
