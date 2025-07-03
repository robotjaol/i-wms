import sys
import os
import pandas as pd
import numpy as np
import logging
from datetime import datetime, time, timedelta

# Library untuk Proses Excel
from openpyxl import load_workbook
from xlsxwriter.utility import xl_col_to_name

# Library untuk Server API
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
import uvicorn

class Worker:
    def __init__(self, filepath):
        self.filepath = filepath
        # Sheetname diatur statis ke "Sheet4"
        self.sheetname = "Sheet4"
        self.logger = logging.getLogger("WorkerLogger")
        if not self.logger.handlers:
            self.logger.setLevel(logging.DEBUG)
            file_handler = logging.FileHandler('process_log.txt', mode='a') # 'a' untuk append
            file_handler.setLevel(logging.DEBUG)
            formatter = logging.Formatter('%(asctime)s - %(message)s')
            file_handler.setFormatter(formatter)
            self.logger.addHandler(file_handler)

    def run(self):
        try:
            self.logger.info("Membaca file Excel...")
            df = pd.read_excel(self.filepath, sheet_name=self.sheetname)

            # Memanggil run_rms secara langsung
            result_path = self.run_rms(df)
            
            self.logger.info(f"Proses selesai. File disimpan di: {result_path}")
            return result_path

        except Exception as e:
            self.logger.error(f"❌ Error saat proses: {e}", exc_info=True)
            raise e


    def parse_time(self, text):
        try:
            if pd.isna(text) or not text:
                return None
            date_str = str(text).strip()
            date_str = date_str.replace('.', ':')
            for fmt in ("%Y/%m/%d %H:%M:%S", "%Y-%m-%d %H:%M:%S"):
                try:
                    dt = datetime.strptime(date_str, fmt)
                    return dt.time()
                except ValueError:
                    continue
            self.logger.warning(f"Format waktu tidak dikenal: {text}")
            return None
        except Exception as e:
            self.logger.error(f"Time parsing error: {e}, Text: {text}")
            return None

    def run_rms(self, df):
        try:
            self.logger.info("📥 [10%] Read File...")
            # df sudah di-pass sebagai argumen, tidak perlu dibaca ulang
            # df = pd.read_excel(self.filepath, sheet_name=self.sheetname)

            self.logger.info("🔍 [20%] Find and Format 'Pallet GR'...")
            target_col = next(
                (col for col in df.columns if df[col].astype(str).str.contains("Pallet GR", case=False, na=False).any()),
                None
            )

            if not target_col:
                raise ValueError("[20%] Not Found 'Pallet GR'")

            self.logger.info(f"✅ Kolom ditemukan: {target_col}")
            self.logger.info("🔎 [30%] Filter Column 'Pallet GR'...")
            filtered = df[df[target_col].astype(str).str.contains("Pallet GR", case=False, na=False)]

            if filtered.empty:
                self.logger.warning("Data hasil filter kosong. Tidak ada baris yang mengandung 'Pallet GR'.")
                # Mengembalikan pesan bahwa data kosong setelah difilter
                return "Data kosong setelah filter"

            self.logger.info("📊 [40%] Structuring File...")
            output = pd.DataFrame()

            def get_col(col_name, fallback=None):
                if col_name in df.columns:
                    return df[col_name]
                else:
                    self.logger.warning(f"Kolom {col_name} tidak ditemukan di DataFrame.")
                    return fallback

            col_D = get_col("Start Time", fallback=pd.Series([None]*len(df)))
            col_E = get_col("Fetch Time", fallback=pd.Series([None]*len(df)))
            col_F = get_col("Delivery Time", fallback=pd.Series([None]*len(df)))

            output["Fetch Station"] = df["Fetch Station"]
            output["Deliver Station"] = df["Deliver Station"]
            output["Date"] = col_E.astype(str).str[:10] if col_E is not None else None
            
            def fix_datetime_format(series):
                return pd.to_datetime(series.astype(str).str.replace(".", ":", n=2), errors="coerce", format="%Y/%m/%d %H:%M:%S")
            
            def time_to_excel_number(t):
                if pd.isna(t):
                    return None
                return (t.hour * 3600 + t.minute * 60 + t.second) / (24 * 3600)

            output["Start Time"] = fix_datetime_format(col_D) if col_D is not None else None
            output["Fetch Time"] = fix_datetime_format(col_E) if col_E is not None else None
            output["Delivery Time"] = fix_datetime_format(col_F) if col_F is not None else None

            col_G_time = output["Start Time"].dt.time
            col_H_time = output["Fetch Time"].dt.time
            col_I_time = output["Delivery Time"].dt.time

            output["Start Time No-Date"] = [time_to_excel_number(t) for t in col_G_time]
            output["Fetch Time No-Date"] = [time_to_excel_number(t) for t in col_H_time]
            output["Delivery Time No-Date"] = [time_to_excel_number(t) for t in col_I_time]

            if col_I_time is not None and col_H_time is not None:
                temp_diff = []
                for i, h in zip(col_I_time, col_H_time):
                    if pd.notna(i) and pd.notna(h):
                        dt_i = datetime.combine(datetime.today(), i)
                        dt_h = datetime.combine(datetime.today(), h)
                        if dt_i < dt_h:
                            dt_i += timedelta(days=1)
                        diff = dt_i - dt_h
                        temp_diff.append(diff)
                    else:
                        temp_diff.append(None)
                if len(temp_diff) < len(output):
                    temp_diff += [None] * (len(output) - len(temp_diff))
                formatted_diff = [
                    f"{int(x.total_seconds() // 60):02}:{int(x.total_seconds() % 60):02}" if pd.notna(x) else None
                    for x in temp_diff
                ]
                output["Delivery Time - Fetch Time No-Date"] = formatted_diff
            else:
                self.logger.warning("Kolom waktu untuk perhitungan 'Delivery - Fetch' tidak lengkap.")
                output["Delivery Time - Fetch Time No-Date"] = [None] * len(output)

            if col_I_time is not None and col_G_time is not None:
                temp_diff_start = []
                for i, g in zip(col_I_time, col_G_time):
                    if pd.notna(i) and pd.notna(g):
                        dt_i = datetime.combine(datetime.today(), i)
                        dt_g = datetime.combine(datetime.today(), g)
                        if dt_i < dt_g:
                            dt_i += timedelta(days=1)
                        diff = dt_i - dt_g
                        temp_diff_start.append(diff)
                    else:
                        temp_diff_start.append(None)
                if len(temp_diff_start) < len(output):
                    temp_diff_start += [None] * (len(output) - len(temp_diff_start))
                formatted_diff_start = [
                    f"{int(x.total_seconds() // 60):02}:{int(x.total_seconds() % 60):02}" if pd.notna(x) else None
                    for x in temp_diff_start
                ]
                output["Delivery Time - Start Time No-Date"] = formatted_diff_start
            else:
                self.logger.warning("Kolom waktu untuk perhitungan 'Delivery - Start' tidak lengkap.")
                output["Delivery Time - Start Time No-Date"] = [None] * len(output)

            self.logger.info("📤 [70%] Formatting and Analyze File...")
            
            dir_path = os.path.dirname(self.filepath)
            now = datetime.now()
            timestamp = now.strftime("%d-%m-%Y_%H-%M")
            new_filename = os.path.join(dir_path, f"processed_RMS_{timestamp}.xlsx")

            unique_dates = sorted(output["Date"].dropna().astype(str).unique())
            with pd.ExcelWriter(new_filename, engine='xlsxwriter') as writer:
                output.to_excel(writer, sheet_name="Processed", index=False, header=False, startrow=1)
                workbook = writer.book
                worksheet = writer.sheets["Processed"]

                for i, col in enumerate(output.columns):
                    worksheet.write(0, i, col)

                worksheet.set_column("A:K", None, None, {'hidden': True})

                # FORMAT
                time_format = workbook.add_format({'num_format': 'hh:mm:ss'})
                worksheet.set_column('G:I', 12, time_format)
                date_format = workbook.add_format({'num_format': 'yyyy/mm/dd'})
                text_format = workbook.add_format({'num_format': '@'})

                # color format
                color_format_pallet = workbook.add_format({'bg_color': '#ffff00'})
                color_format_subformula = workbook.add_format({'bg_color': '#7cedff'})
                color_format_main = workbook.add_format({'bg_color': '#42f581'})

                worksheet.set_column('C:C', 15, date_format)
                
                for i, tgl in enumerate(unique_dates):
                    worksheet.write(i+1, 129, tgl)
                
                # Validasi dropdown di sel N1
                dropdown_range = f"=DZ2:DZ{len(unique_dates)+1}"
                worksheet.data_validation("N1", {
                    'validate': 'list',
                    'source': dropdown_range,
                    'input_message': 'Pilih tanggal dari daftar',
                    'error_message': 'Tanggal tidak valid!',
                })

                # DEKLARASI RMS & SCANNING & LD
                worksheet.write("EA1","HARI YANG TERSEDIA")
                worksheet.write("M1", "PILIH HARI ->", color_format_main)
                worksheet.write("O1", "TOTAL PALLET 1 HARI", color_format_subformula)

                # Header Analis
                analis_headers = [
                    (12, "M"), (23, "X"), (34, "AI"), (45, "AT"), (56, "BE"), (67,"BP"), (78,"CA")
                ]
                header_titles = [
                    "Fetch Station", "Deliver Station", "Date",
                    "Fetch Time", "Delivery Time", "Fetch - Delivery", "Delivery - Start Time"
                ]
                for start_col, label in analis_headers:
                    for offset, title in enumerate(header_titles):
                        worksheet.write(1, start_col + offset, title)

                # Formula RMS SCANNING
                let_formula = ('=HSTACK(FILTER(A2:C50000, C2:C50000 = N1, "Not Found"), '
                                'FILTER(H2:K50000, C2:C50000 = N1, "Not Found"))')

                # Sub formula
                let_sub_formula_TUBE = ('=HSTACK(FILTER(M3:S10000, ISNUMBER(SEARCH("Pallet GR Position Tube", M3:M10000)), "Not Found"))')
                let_sub_formula_NON_TUBE = ('=HSTACK(FILTER(M3:S10000, ISNUMBER(SEARCH("Pallet GR Position Non-Tube", M3:M10000)), "Not Found"))')
                let_sub_formula_S_TUBE = ('=HSTACK(FILTER(M3:S10000, ISNUMBER(SEARCH("RMS A", M3:M10000)), "Not Found"))')
                let_sub_formula_S_NON_TUBE = ('=HSTACK(FILTER(M3:S10000, ISNUMBER(SEARCH("RMS C", M3:M10000)), "Not Found"))')
                let_sub_formula_LD_TUBE = ('=HSTACK(FILTER(M3:S10000, ISNUMBER(SEARCH("Button Pallet Position Tube", M3:M10000)), "Not Found"))')
                let_sub_formula_LD_NON_TUBE = ('=HSTACK(FILTER(M3:S10000, ISNUMBER(SEARCH("Button Pallet Position Non-Tube", M3:M10000)), "Not Found"))')

                # COLUMN ANALYZER
                worksheet.write_formula("M3", let_formula)
                worksheet.write("U2", "Jam", color_format_pallet)
                worksheet.write("V2", "Jumlah Pallet", color_format_pallet)
                worksheet.set_column('P:R', 12, time_format)
                worksheet.write_formula("P1", 'INDEX(DZ2:DZ1000, MATCH(N1, DZ2:DZ1000, 0) - 1)', text_format, 'hint_value')

                for i in range(24):
                    row = 2 + i
                    hour_str = time(hour=i).strftime("%H:%M:%S")
                    worksheet.write(row, 20, hour_str)
                    if i == 23:
                        count_formula = (f'=COUNTIFS(P$3:P$10000, ">="&TIME(23,0,0), '
                                        f'P$3:P$10000, "<"&TIME(23,59,59)+1/86400)')
                    else:
                        count_formula = (f'=COUNTIFS(P$3:P$10000, ">="&TIME({i},0,0), '
                                        f'P$3:P$10000, "<"&TIME({i+1},0,0))')
                    worksheet.write_formula(row, 21, count_formula)
                
                # PALLET /SHIFT
                per_shift_formula = ('=VSTACK("JUMLAH PALLET",'
                                    'COUNTIFS(C2:C100000, N1, H2:H100000, ">="&TIME(6,0,0), H2:H100000, "<"&TIME(14,0,0)),'
                                    'COUNTIFS(C2:C100000, N1, H2:H100000, ">="&TIME(14,0,0), H2:H100000, "<"&TIME(22,0,0)),'
                                    'COUNTIFS(C2:C100000, N1, H2:H100000, ">="&TIME(0,0,0), H2:H100000, "<"&TIME(6,0,0)) +'
                                    'COUNTIFS(C2:C100000, P1, H2:H100000, ">="&TIME(22,0,0), H2:H100000, "<"&TIME(23,59,59)+1/86400))')
                worksheet.write_formula("V28", per_shift_formula)
                per_shift_keterangan = ('=VSTACK("SHIFT","06.00-14.00","14.00-22.00","22.00-06.00")')
                worksheet.write_formula("U28", per_shift_keterangan)

                # SCANNING AREA TUBE
                worksheet.write("X1", "SCANNING MENUJU RMS A/SUPERMARKET *TUBE", color_format_subformula)
                worksheet.write_formula("X3",let_sub_formula_TUBE)
                worksheet.write("AF2", "JAM", color_format_pallet)
                worksheet.write("AG2", "JUMLAH PALLET", color_format_pallet)
                worksheet.set_column('AA:AC', 12, time_format)
                for i in range(24):
                    row = 2 + i
                    hour_str = time(hour=i).strftime("%H:%M:%S")
                    worksheet.write(row, 31, hour_str)
                    if i == 23:
                        count_formula = (f'=COUNTIFS(AA$3:AA$10000, ">="&TIME(23,0,0), '
                                        f'AA$3:AA$10000, "<"&TIME(23,59,59)+1/86400)')
                    else:
                        count_formula = (f'=COUNTIFS(AA$3:AA$10000, ">="&TIME({i},0,0), '
                                        f'AA$3:AA$10000, "<"&TIME({i+1},0,0))')
                    worksheet.write_formula(row, 32, count_formula)

                per_shift_formula_tube = ('=VSTACK("JUMLAH PALLET",'
                                        'COUNTIFS(C2:C100000,N1,A2:A100000,"*Pallet GR Position Tube*",H2:H100000,">="&TIME(6,0,0),H2:H100000,"<"&TIME(14,0,0)),'
                                        'COUNTIFS(C2:C100000,N1,A2:A100000,"*Pallet GR Position Tube*",H2:H100000,">="&TIME(14,0,0),H2:H100000,"<"&TIME(22,0,0)),'
                                        'COUNTIFS(C2:C100000,N1,A2:A100000,"*Pallet GR Position Tube*",H2:H100000, ">="&TIME(0,0,0), H2:H100000, "<"&TIME(6,0,0)) +'
                                        'COUNTIFS(C2:C100000,P1,A2:A100000,"*Pallet GR Position Tube*",H2:H100000, ">="&TIME(22,0,0), H2:H100000, "<"&TIME(23,59,59)+1/86400))')
                worksheet.write_formula("AG28", per_shift_formula_tube)
                worksheet.write_formula("AF28", per_shift_keterangan)

                # SCANNING AREA NON-TUBE
                worksheet.write("AI1", "SCANNING MENUJU RMS C/SUPERMARKET *NON-TUBE", color_format_subformula)
                worksheet.write_formula("AI3",let_sub_formula_NON_TUBE)
                worksheet.write("AQ2", "JAM", color_format_pallet)
                worksheet.write("AR2", "JUMLAH PALLET", color_format_pallet)
                worksheet.set_column('AL:AN', 12, time_format)
                for i in range(24):
                    row = 2 + i
                    hour_str = time(hour=i).strftime("%H:%M:%S")
                    worksheet.write(row, 42, hour_str)
                    if i == 23:
                        count_formula = (f'=COUNTIFS(AL$3:AL$10000, ">="&TIME(23,0,0), '
                                        f'AL$3:AL$10000, "<"&TIME(23,59,59)+1/86400)')
                    else:
                        count_formula = (f'=COUNTIFS(AL$3:AL$10000, ">="&TIME({i},0,0), '
                                        f'AL$3:AL$10000, "<"&TIME({i+1},0,0))')
                    worksheet.write_formula(row, 43, count_formula)

                per_shift_formula_nontube = ('=VSTACK("JUMLAH PALLET",'
                                            'COUNTIFS(C2:C100000,N1,A2:A100000,"*Pallet GR Position Non-Tube*",H2:H100000,">="&TIME(6,0,0),H2:H100000,"<"&TIME(14,0,0)),'
                                            'COUNTIFS(C2:C100000,N1,A2:A100000,"*Pallet GR Position Non-Tube*",H2:H100000,">="&TIME(14,0,0),H2:H100000,"<"&TIME(22,0,0)),'
                                            'COUNTIFS(C2:C100000,N1,A2:A100000,"*Pallet GR Position Non-Tube*",H2:H100000, ">="&TIME(0,0,0), H2:H100000, "<"&TIME(6,0,0)) +'
                                            'COUNTIFS(C2:C100000,P1,A2:A100000,"*Pallet GR Position Non-Tube*",H2:H100000, ">="&TIME(22,0,0), H2:H100000, "<"&TIME(23,59,59)+1/86400))')
                worksheet.write_formula("AR28", per_shift_formula_nontube)
                worksheet.write_formula("AQ28", per_shift_keterangan)

                # RMS A TO SUPERMARKET TUBE
                worksheet.write("AT1", "RMS A MENUJU SUPERMARKET *TUBE", color_format_subformula)
                worksheet.write_formula("AT3",let_sub_formula_S_TUBE)
                worksheet.write("BB2", "JAM", color_format_pallet)
                worksheet.write("BC2", "JUMLAH PALLET", color_format_pallet)
                worksheet.set_column('AW:AY', 12, time_format)
                for i in range(24):
                    row = 2 + i
                    hour_str = time(hour=i).strftime("%H:%M:%S")
                    worksheet.write(row, 53, hour_str)
                    if i == 23:
                        count_formula = (f'=COUNTIFS(AW$3:AW$10000, ">="&TIME(23,0,0), '
                                        f'AW$3:AW$10000, "<"&TIME(23,59,59)+1/86400)')
                    else:
                        count_formula = (f'=COUNTIFS(AW$3:AW$10000, ">="&TIME({i},0,0), '
                                        f'AW$3:AW$10000, "<"&TIME({i+1},0,0))')
                    worksheet.write_formula(row, 54, count_formula)

                per_shift_formula_smtube = ('=VSTACK("JUMLAH PALLET",'
                                            'COUNTIFS(C2:C100000,N1,A2:A100000,"*RMS A*",H2:H100000,">="&TIME(6,0,0),H2:H100000,"<"&TIME(14,0,0)),'
                                            'COUNTIFS(C2:C100000,N1,A2:A100000,"*RMS A*",H2:H100000,">="&TIME(14,0,0),H2:H100000,"<"&TIME(22,0,0)),'
                                            'COUNTIFS(C2:C100000,N1,A2:A100000,"*RMS A*",H2:H100000, ">="&TIME(0,0,0), H2:H100000, "<"&TIME(6,0,0)) +'
                                            'COUNTIFS(C2:C100000,P1,A2:A100000,"*RMS A*",H2:H100000, ">="&TIME(22,0,0), H2:H100000, "<"&TIME(23,59,59)+1/86400))')
                worksheet.write_formula("BC28", per_shift_formula_smtube)
                worksheet.write_formula("BB28", per_shift_keterangan)

                # RMS C TO SUPERMARKET NON-TUBE
                worksheet.write("BE1", "RMS C MENUJU SUPERMARKET *NON-TUBE", color_format_subformula)
                worksheet.write_formula("BE3",let_sub_formula_S_NON_TUBE)
                worksheet.write("BM2", "JAM", color_format_pallet)
                worksheet.write("BN2", "JUMLAH PALLET", color_format_pallet)
                worksheet.set_column('BH:BJ', 12, time_format)
                for i in range(24):
                    row = 2 + i
                    hour_str = time(hour=i).strftime("%H:%M:%S")
                    worksheet.write(row, 64, hour_str)
                    if i == 23:
                        count_formula = (f'=COUNTIFS(BH$3:BH$10000, ">="&TIME(23,0,0), '
                                        f'BH$3:BH$10000, "<"&TIME(23,59,59)+1/86400)')
                    else:
                        count_formula = (f'=COUNTIFS(BH$3:BH$10000, ">="&TIME({i},0,0), '
                                        f'BH$3:BH$10000, "<"&TIME({i+1},0,0))')
                    worksheet.write_formula(row, 65, count_formula)

                per_shift_formula_smnontube = ('=VSTACK("JUMLAH PALLET",'
                                                'COUNTIFS(C2:C100000,N1,A2:A100000,"*RMS C*",H2:H100000,">="&TIME(6,0,0),H2:H100000,"<"&TIME(14,0,0)),'
                                                'COUNTIFS(C2:C100000,N1,A2:A100000,"*RMS C*",H2:H100000,">="&TIME(14,0,0),H2:H100000,"<"&TIME(22,0,0)),'
                                                'COUNTIFS(C2:C100000,N1,A2:A100000,"*RMS C*",H2:H100000, ">="&TIME(0,0,0), H2:H100000, "<"&TIME(6,0,0)) +'
                                                'COUNTIFS(C2:C100000,P1,A2:A100000,"*RMS C*",H2:H100000, ">="&TIME(22,0,0), H2:H100000, "<"&TIME(23,59,59)+1/86400))')
                worksheet.write_formula("BN28", per_shift_formula_smnontube)
                worksheet.write_formula("BM28", per_shift_keterangan)

                # LOADING DOCK TO SCANNING TUBE
                worksheet.write("BP1", "LOADING DOCK TO SCANNING *TUBE", color_format_subformula)
                worksheet.write_formula("BP3",let_sub_formula_LD_TUBE)
                worksheet.write("BX2", "JAM", color_format_pallet)
                worksheet.write("BY2", "JUMLAH PALLET", color_format_pallet)
                worksheet.set_column('BS:BU', 12, time_format)
                for i in range(24):
                    row = 2 + i
                    hour_str = time(hour=i).strftime("%H:%M:%S")
                    worksheet.write(row, 75, hour_str)
                    if i == 23:
                        count_formula = (f'=COUNTIFS(BS$3:BS$10000, ">="&TIME(23,0,0), '
                                        f'BS$3:BS$10000, "<"&TIME(23,59,59)+1/86400)')
                    else:
                        count_formula = (f'=COUNTIFS(BS$3:BS$10000, ">="&TIME({i},0,0), '
                                        f'BS$3:BS$10000, "<"&TIME({i+1},0,0))')
                    worksheet.write_formula(row, 76, count_formula)

                per_shift_formula_ldtube = ('=VSTACK("JUMLAH PALLET",'
                                            'COUNTIFS(C2:C100000,N1,A2:A100000,"*Button Pallet Position Tube*",H2:H100000,">="&TIME(6,0,0),H2:H100000,"<"&TIME(14,0,0)),'
                                            'COUNTIFS(C2:C100000,N1,A2:A100000,"*Button Pallet Position Tube*",H2:H100000,">="&TIME(14,0,0),H2:H100000,"<"&TIME(22,0,0)),'
                                            'COUNTIFS(C2:C100000,N1,A2:A100000,"*Button Pallet Position Tube*",H2:H100000, ">="&TIME(0,0,0), H2:H100000, "<"&TIME(6,0,0)) +'
                                            'COUNTIFS(C2:C100000,P1,A2:A100000,"*Button Pallet Position Tube*",H2:H100000, ">="&TIME(22,0,0), H2:H100000, "<"&TIME(23,59,59)+1/86400))')
                worksheet.write_formula("BY28", per_shift_formula_ldtube)
                worksheet.write_formula("BX28", per_shift_keterangan)

                # LOADING DOCK TO SCANNING NON-TUBE
                worksheet.write("CA1", "LOADING DOCK TO SCANNING *NON-TUBE", color_format_subformula)
                worksheet.write_formula("CA3",let_sub_formula_LD_NON_TUBE)
                worksheet.write("CI2", "JAM", color_format_pallet)
                worksheet.write("CJ2", "JUMLAH PALLET", color_format_pallet)
                worksheet.set_column('CD:CF', 12, time_format)
                for i in range(24):
                    row = 2 + i
                    hour_str = time(hour=i).strftime("%H:%M:%S")
                    worksheet.write(row, 86, hour_str)
                    if i == 23:
                        count_formula = (f'=COUNTIFS(CD$3:CD$10000, ">="&TIME(23,0,0), '
                                            f'CD$3:CD$10000, "<"&TIME(23,59,59)+1/86400)')
                    else:
                        count_formula = (f'=COUNTIFS(CD$3:CD$10000, ">="&TIME({i},0,0), '
                                            f'CD$3:CD$10000, "<"&TIME({i+1},0,0))')
                    worksheet.write_formula(row, 87, count_formula)

                per_shift_formula_ldnontube = ('=VSTACK("JUMLAH PALLET",'
                                                'COUNTIFS(C2:C100000,N1,A2:A100000,"*Button Pallet Position Non-Tube*",H2:H100000,">="&TIME(6,0,0),H2:H100000,"<"&TIME(14,0,0)),'
                                                'COUNTIFS(C2:C100000,N1,A2:A100000,"*Button Pallet Position Non-Tube*",H2:H100000,">="&TIME(14,0,0),H2:H100000,"<"&TIME(22,0,0)),'
                                                'COUNTIFS(C2:C100000,N1,A2:A100000,"*Button Pallet Position Non-Tube*",H2:H100000, ">="&TIME(0,0,0), H2:H100000, "<"&TIME(6,0,0)) +'
                                                'COUNTIFS(C2:C100000,P1,A2:A100000,"*Button Pallet Position Non-Tube*",H2:H100000, ">="&TIME(22,0,0), H2:H100000, "<"&TIME(23,59,59)+1/86400))')
                worksheet.write_formula("CJ28", per_shift_formula_ldnontube)
                worksheet.write_formula("CI28", per_shift_keterangan)

                # SUMMARY SHEET
                summary_ws = workbook.add_worksheet("Summary")
                color_ext_sum = workbook.add_format({'bg_color': '#E6F2FF'})
                output["Date"] = pd.to_datetime(output["Date"], errors="coerce")
                output = output.dropna(subset=["Date"])
                output = output.sort_values("Date")
                output["Week Number"] = output["Date"].dt.isocalendar().week
                output["Year"] = output["Date"].dt.isocalendar().year
                weekly_groups = output.groupby(["Year", "Week Number"])
                base_headers = ["Fetch Station", "Deliver Station", "Date", "Fetch Time", "Delivery Time",
                                "Delivery Time - Fetch Time No-Date", "Delivery Time - Start Time No-Date"]
                extra_headers = ["Date", "Location", "Tube", "Non Tube"]
                max_row = 1
                for idx, ((year, week), group) in enumerate(weekly_groups):
                    col_offset = idx * (len(base_headers) + len(extra_headers) + 2)
                    summary_ws.write(0, col_offset, f"Week {week} ({year})", color_format_main)
                    for i_hdr, header in enumerate(base_headers):
                        summary_ws.write(1, col_offset + i_hdr, header, color_format_subformula)
                    for row_idx, (_, row) in enumerate(group.iterrows(), start=2):
                        summary_ws.write(row_idx, col_offset + 0, row["Fetch Station"], text_format)
                        summary_ws.write(row_idx, col_offset + 1, row["Deliver Station"], text_format)
                        summary_ws.write(row_idx, col_offset + 2, row["Date"].strftime("%Y/%m/%d") if pd.notna(row["Date"]) else "", date_format)
                        if pd.notna(row["Fetch Time"]):
                            ft = row["Fetch Time"]
                            time_value = ft.hour / 24 + ft.minute / 1440 + ft.second / 86400
                            summary_ws.write(row_idx, col_offset + 3, time_value, time_format)
                        else:
                            summary_ws.write(row_idx, col_offset + 3, "", time_format)
                        if pd.notna(row["Delivery Time"]):
                            dt = row["Delivery Time"]
                            time_value = dt.hour / 24 + dt.minute / 1440 + dt.second / 86400
                            summary_ws.write(row_idx, col_offset + 4, time_value, time_format)
                        else:
                            summary_ws.write(row_idx, col_offset + 4, "", time_format)
                        summary_ws.write(row_idx, col_offset + 5, row["Delivery Time - Fetch Time No-Date"], text_format)
                        summary_ws.write(row_idx, col_offset + 6, row["Delivery Time - Start Time No-Date"], text_format)
                        max_row = max(max_row, row_idx)

                    temp_df_processed = output.copy()
                    temp_df_processed.rename(columns={'Fetch Station': 'A', 'Deliver Station': 'C', 'Fetch Time': 'H', 'Date': 'DateOnly'}, inplace=True)
                    temp_df_processed['H'] = pd.to_datetime(temp_df_processed['H'], errors='coerce').dt.time
                    temp_df_processed['DateOnly'] = pd.to_datetime(temp_df_processed['DateOnly'], errors='coerce').dt.date
                    
                    night_start = time(22, 0, 0)
                    night_end = time(23, 59, 59)
                    day_start = time(0, 0, 0)
                    day_end = time(22, 0, 0)

                    def count_filtered_updated(df, tanggal, col_a_pattern, time_start, time_end):
                        if tanggal is None: return 0
                        filtered_df = df[(df['DateOnly'] == tanggal) & (df['A'].astype(str).str.contains(col_a_pattern, na=False, case=False))]
                        if not filtered_df.empty:
                            filtered_df = filtered_df[filtered_df['H'].apply(lambda x: x >= time_start if pd.notna(x) else False) &
                                                    filtered_df['H'].apply(lambda x: x <= time_end if pd.notna(x) else False)]
                        return filtered_df.shape[0]

                    unique_dates_in_group = sorted(group["Date"].dt.date.unique())
                    all_unique_dates = pd.Series(sorted(output["Date"].dt.date.unique()))
                    
                    for i, date_val_current in enumerate(unique_dates_in_group):
                        row_pos_0based_header = 3 + i * 5
                        summary_ws.write(row_pos_0based_header, col_offset + len(base_headers) + 0, "Date", color_ext_sum)
                        summary_ws.write(row_pos_0based_header, col_offset + len(base_headers) + 1, "Location", color_ext_sum)
                        summary_ws.write(row_pos_0based_header, col_offset + len(base_headers) + 2, "Tube", color_ext_sum)
                        summary_ws.write(row_pos_0based_header, col_offset + len(base_headers) + 3, "Non Tube", color_ext_sum)
                        summary_ws.write(row_pos_0based_header + 1, col_offset + len(base_headers) + 0, date_val_current.strftime("%Y/%m/%d"), date_format)
                        summary_ws.write(row_pos_0based_header + 1, col_offset + len(base_headers) + 1, "LOADING DOCK -> SCANNING", text_format)
                        summary_ws.write(row_pos_0based_header + 2, col_offset + len(base_headers) + 1, "SCANNING -> RMS", text_format)
                        summary_ws.write(row_pos_0based_header + 3, col_offset + len(base_headers) + 1, "RMS -> SUPERMARKET", text_format)
                        
                        c_shift_pagi_dynamic = date_val_current
                        shift_malam_dynamic = None
                        if c_shift_pagi_dynamic in all_unique_dates.values:
                            idx_current_date = all_unique_dates[all_unique_dates == c_shift_pagi_dynamic].index
                            if not idx_current_date.empty and idx_current_date[0] > 0:
                                shift_malam_dynamic = all_unique_dates[idx_current_date[0] - 1]

                        button_pallet_tube = count_filtered_updated(temp_df_processed, c_shift_pagi_dynamic, "Button Pallet Position Tube", day_start, day_end) + \
                                            count_filtered_updated(temp_df_processed, shift_malam_dynamic, "Button Pallet Position Tube", night_start, night_end)
                        pallet_gr_tube = count_filtered_updated(temp_df_processed, c_shift_pagi_dynamic, "Pallet GR Position Tube", day_start, day_end) + \
                                        count_filtered_updated(temp_df_processed, shift_malam_dynamic, "Pallet GR Position Tube", night_start, night_end)
                        rms_a = count_filtered_updated(temp_df_processed, c_shift_pagi_dynamic, "RMS A", day_start, day_end) + \
                                count_filtered_updated(temp_df_processed, shift_malam_dynamic, "RMS A", night_start, night_end)
                        button_pallet_non_tube = count_filtered_updated(temp_df_processed, c_shift_pagi_dynamic, "Button Pallet Position Non-Tube", day_start, day_end) + \
                                                count_filtered_updated(temp_df_processed, shift_malam_dynamic, "Button Pallet Position Non-Tube", night_start, night_end)
                        pallet_gr_non_tube = count_filtered_updated(temp_df_processed, c_shift_pagi_dynamic, "Pallet GR Position Non-Tube", day_start, day_end) + \
                                            count_filtered_updated(temp_df_processed, shift_malam_dynamic, "Pallet GR Position Non-Tube", night_start, night_end)
                        rms_c = count_filtered_updated(temp_df_processed, c_shift_pagi_dynamic, "RMS C", day_start, day_end) + \
                                count_filtered_updated(temp_df_processed, shift_malam_dynamic, "RMS C", night_start, night_end)

                        summary_ws.write(row_pos_0based_header + 1, col_offset + len(base_headers) + 2, button_pallet_tube)
                        summary_ws.write(row_pos_0based_header + 1, col_offset + len(base_headers) + 3, button_pallet_non_tube)
                        summary_ws.write(row_pos_0based_header + 2, col_offset + len(base_headers) + 2, pallet_gr_tube)
                        summary_ws.write(row_pos_0based_header + 2, col_offset + len(base_headers) + 3, pallet_gr_non_tube)
                        summary_ws.write(row_pos_0based_header + 3, col_offset + len(base_headers) + 2, rms_a)
                        summary_ws.write(row_pos_0based_header + 3, col_offset + len(base_headers) + 3, rms_c)

                    if idx > 0:
                        for r in range(0, max_row + 1):
                            summary_ws.write_blank(r, col_offset - 1, None)
                
                summary_ws.set_column(0, (len(base_headers) + len(extra_headers) + 2) * len(weekly_groups), 18)
                workbook.close()

            self.logger.info(f"🎉 [100%] Selesai: {new_filename}")
            return new_filename

        except Exception as e:
            self.logger.error(f"❌ Error saat proses run_rms: {e}", exc_info=True)
            raise e

app = FastAPI(
    title="AGV Excel Analysis API",
    description="Menerima file Excel, memproses dengan metode RMS pada Sheet4, dan mengembalikan hasilnya."
)

@app.post("/process-file/")
async def process_agv_file(file: UploadFile = File(...)):
    """
    Endpoint untuk menerima file dari n8n, memprosesnya, dan mengirim kembali hasilnya.
    """
    temp_dir = "temp_files"
    os.makedirs(temp_dir, exist_ok=True)
    temp_filepath = os.path.join(temp_dir, file.filename)
    
    try:
        # Menyimpan file yang di-upload dari n8n
        with open(temp_filepath, "wb") as buffer:
            buffer.write(await file.read())
            
        # Membuat instance Worker dan menjalankan proses
        processor = Worker(filepath=temp_filepath)
        result_filepath = processor.run()

        # Mengirim file hasil kembali ke n8n
        if os.path.exists(result_filepath):
            return FileResponse(
                path=result_filepath,
                media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                filename=os.path.basename(result_filepath)
            )
        else:
            raise HTTPException(status_code=404, detail=f"File hasil tidak ditemukan: {result_filepath}")
            
    except Exception as e:
        # Jika ada error, kirim pesan error ke n8n
        raise HTTPException(status_code=500, detail=f"Error saat pemrosesan: {str(e)}")
    
    finally:
        # Membersihkan file sementara setelah selesai
        if os.path.exists(temp_filepath):
            os.remove(temp_filepath)

@app.get("/")
async def root():
    return {"message": "API Server untuk Analisis AGV sudah berjalan."}


if __name__ == "__main__":
    print("🚀 Menjalankan server API di http://127.0.0.1:8000")
    print("📁 File hasil akan disimpan di folder 'processed_files'")
    print("📝 Log proses akan disimpan di 'process_log.txt'")
    uvicorn.run(app, host="0.0.0.0", port=8000)