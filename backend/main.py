from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends, Header, APIRouter
from fastapi.responses import JSONResponse, FileResponse
from rag.vector_store import vectorize_file, query_rag
import os
from fastapi.middleware.cors import CORSMiddleware
import sys
sys.path.append(str(os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))))
from reference.api_process import Worker
import tempfile
import shutil
import numpy as np
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import pandas as pd
from datetime import datetime, timedelta
import re
from typing import Optional
import logging
from sqlalchemy.exc import IntegrityError
import json

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sheet4_records.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Define the Sheet4Record model
class Sheet4Record(Base):
    __tablename__ = "sheet4_records"
    id = Column(Integer, primary_key=True, index=True)
    PC = Column(String)
    MC = Column(String)
    Materiel_Desc = Column(String)
    Vendor = Column(String)
    Quantity = Column(Float)
    Uom = Column(String)
    Batch = Column(String)
    Pallet_Id = Column(String)
    Mfg_Date = Column(DateTime)
    Exp_Date = Column(DateTime)
    Fetch_Station = Column(String)
    Deliver_Station = Column(String)
    Start_Time = Column(DateTime, unique=True, index=True)
    Fetch_Time = Column(DateTime)
    Delivery_Time = Column(DateTime)

Base.metadata.create_all(bind=engine)

app = FastAPI()

API_KEY = os.getenv("API_KEY")

def verify_token(authorization: str = Header(None)):
    if API_KEY and (authorization != f"Bearer {API_KEY}"):
        raise HTTPException(status_code=401, detail="Invalid or missing API key.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

PROCESSED_DIR = os.path.join(os.path.dirname(__file__), 'processed_files')
os.makedirs(PROCESSED_DIR, exist_ok=True)

def parse_datetime(val):
    if pd.isna(val):
        return None
    if isinstance(val, datetime):
        return val
    # Try multiple formats
    for fmt in [
        "%Y/%m/%d %H.%M.%S", "%Y/%m/%d %H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y/%m/%d %H.%M", "%Y/%m/%d", "%Y-%m-%d"
    ]:
        try:
            return datetime.strptime(str(val), fmt)
        except Exception:
            continue
    # Try to extract numbers and reformat
    match = re.match(r"(\d{4})[/-](\d{2})[/-](\d{2})[ T]?(\d{2})[.:](\d{2})(?:[.:](\d{2}))?", str(val))
    if match:
        y, m, d, H, M, S = match.groups(default="00")
        return datetime(int(y), int(m), int(d), int(H), int(M), int(S))
    return None

@app.post("/api/sheet-names")
async def get_sheet_names(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name
    try:
        xl = pd.ExcelFile(tmp_path, engine="openpyxl")
        return {"sheets": xl.sheet_names}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        os.remove(tmp_path)

@app.post("/api/upload-sheet4")
async def upload_sheet4(file: UploadFile = File(...), sheet: Optional[str] = Form(None)):
    if not file.filename or not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Only Excel files are supported and filename must be provided.")
    with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name
    try:
        sheet_name = sheet or "Sheet 4"
        df = pd.read_excel(tmp_path, sheet_name=sheet_name, engine="openpyxl")
        expected_cols = [
            "PC", "MC", "Materiel Desc", "Vendor", "Quantity", "Uom", "Batch", "Pallet Id", "Mfg. Date", "Exp. Date", "Fetch Station", "Deliver Station", "Start Time", "Fetch Time", "Delivery Time"
        ]
        missing = [col for col in expected_cols if col not in df.columns]
        if missing:
            raise HTTPException(status_code=400, detail=f"Missing columns: {missing}")
        # Clean and parse
        inserted, skipped, duplicate = 0, 0, 0
        session = SessionLocal()
        debug_rows = []
        for row_idx, (idx, row) in enumerate(df.iterrows()):
            start_time = parse_datetime(row["Start Time"])
            if row_idx < 3:
                debug_rows.append({"row": row.to_dict(), "parsed_start_time": str(start_time)})
            if not start_time:
                skipped += 1
                continue
            record = Sheet4Record(
                PC=str(row["PC"]),
                MC=str(row["MC"]),
                Materiel_Desc=str(row["Materiel Desc"]),
                Vendor=str(row["Vendor"]),
                Quantity=float(row["Quantity"]),
                Uom=str(row["Uom"]),
                Batch=str(row["Batch"]),
                Pallet_Id=str(row["Pallet Id"]),
                Mfg_Date=parse_datetime(row["Mfg. Date"]),
                Exp_Date=parse_datetime(row["Exp. Date"]),
                Fetch_Station=str(row["Fetch Station"]),
                Deliver_Station=str(row["Deliver Station"]),
                Start_Time=start_time,
                Fetch_Time=parse_datetime(row["Fetch Time"]),
                Delivery_Time=parse_datetime(row["Delivery Time"]),
            )
            try:
                session.add(record)
                session.commit()
                inserted += 1
            except IntegrityError:
                session.rollback()
                duplicate += 1
                continue
        session.close()
        logging.warning(f"[UPLOAD] Sheet: {sheet_name}, Rows: {len(df)}, Inserted: {inserted}, Skipped: {skipped}, Duplicates: {duplicate}")
        logging.warning(f"[UPLOAD] First 3 parsed rows: {debug_rows}")
        if inserted == 0:
            raise HTTPException(status_code=400, detail=f"No new records inserted. {duplicate} rows were duplicates and {skipped} rows were invalid. Please check your Excel file, sheet, and required columns. See logs for details.")
        return {"inserted": inserted, "skipped": skipped, "duplicates": duplicate}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        os.remove(tmp_path)

@app.get("/api/records")
def get_records():
    session = SessionLocal()
    records = session.query(Sheet4Record).all()
    session.close()
    def to_dict(r):
        return {
            "id": r.id,
            "PC": r.PC,
            "MC": r.MC,
            "Materiel_Desc": r.Materiel_Desc,
            "Vendor": r.Vendor,
            "Quantity": r.Quantity,
            "Uom": r.Uom,
            "Batch": r.Batch,
            "Pallet_Id": r.Pallet_Id,
            "Mfg_Date": r.Mfg_Date.isoformat() if r.Mfg_Date else None,
            "Exp_Date": r.Exp_Date.isoformat() if r.Exp_Date else None,
            "Fetch_Station": r.Fetch_Station,
            "Deliver_Station": r.Deliver_Station,
            "Start_Time": r.Start_Time.isoformat() if r.Start_Time else None,
            "Fetch_Time": r.Fetch_Time.isoformat() if r.Fetch_Time else None,
            "Delivery_Time": r.Delivery_Time.isoformat() if r.Delivery_Time else None,
        }
    return [to_dict(r) for r in records]

@app.delete("/api/record/{record_id}")
def delete_record(record_id: int):
    session = SessionLocal()
    record = session.query(Sheet4Record).filter_by(id=record_id).first()
    if not record:
        session.close()
        raise HTTPException(status_code=404, detail="Record not found")
    session.delete(record)
    session.commit()
    session.close()
    return {"status": "deleted"}

@app.post("/api/record")
def add_record(data: dict):
    session = SessionLocal()
    try:
        record = Sheet4Record(
            PC=data.get("PC"),
            MC=data.get("MC"),
            Materiel_Desc=data.get("Materiel_Desc"),
            Vendor=data.get("Vendor"),
            Quantity=float(data.get("Quantity", 0)),
            Uom=data.get("Uom"),
            Batch=data.get("Batch"),
            Pallet_Id=data.get("Pallet_Id"),
            Mfg_Date=parse_datetime(data.get("Mfg_Date")),
            Exp_Date=parse_datetime(data.get("Exp_Date")),
            Fetch_Station=data.get("Fetch_Station"),
            Deliver_Station=data.get("Deliver_Station"),
            Start_Time=parse_datetime(data.get("Start_Time")),
            Fetch_Time=parse_datetime(data.get("Fetch_Time")),
            Delivery_Time=parse_datetime(data.get("Delivery_Time")),
        )
        session.add(record)
        session.commit()
        return {"status": "inserted", "id": record.id}
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        session.close()

@app.post("/api/vectorize")
async def vectorize_endpoint(file: UploadFile = File(...), doc_type: str = Form("auto"), authorization: str = Depends(verify_token)):
    try:
        return await vectorize_file(file, doc_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Helper: summarize records for LLM context
def summarize_records(records):
    if not records:
        return json.dumps({"error": "No data available"})
    # Example: summarize by date, shift, area, etc.
    summary = {}
    # Group by date
    daily = {}
    for r in records:
        date = r.Start_Time.date().isoformat() if r.Start_Time else 'unknown'
        shift = None
        hour = r.Start_Time.hour if r.Start_Time else None
        area = r.Fetch_Station or 'unknown'
        # Example shift logic (customize as needed)
        if hour is not None:
            if 6 <= hour < 14:
                shift = 'shift_1'
            elif 14 <= hour < 22:
                shift = 'shift_2'
            else:
                shift = 'shift_3'
        else:
            shift = 'unknown'
        if date not in daily:
            daily[date] = {
                'total_pallets': 0,
                'shift_summary': {'shift_1': 0, 'shift_2': 0, 'shift_3': 0},
                'distribution': {},
            }
        daily[date]['total_pallets'] += 1
        daily[date]['shift_summary'][shift] += 1
        if area not in daily[date]['distribution']:
            daily[date]['distribution'][area] = 0
        daily[date]['distribution'][area] += 1
    # Top area, peak hour, etc. (for latest date)
    latest_date = max(daily.keys())
    latest = daily[latest_date]
    top_area = max(latest['distribution'], key=latest['distribution'].get)
    # Find peak hour (across all records)
    hour_counts = {}
    for r in records:
        if r.Start_Time:
            h = r.Start_Time.strftime('%H:00')
            hour_counts[h] = hour_counts.get(h, 0) + 1
    peak_hour = max(list(hour_counts.keys()), key=hour_counts.get) if hour_counts else None
    # Top 5 routes by pallet volume
    route_counts = {}
    for r in records:
        route = f"{r.Fetch_Station} -> {r.Deliver_Station}"
        route_counts[route] = route_counts.get(route, 0) + 1
    top_routes = sorted(route_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    summary = {
        "date": latest_date,
        "total_pallets": latest['total_pallets'],
        "top_area": top_area,
        "peak_hour": peak_hour,
        "shift_summary": latest['shift_summary'],
        "distribution": latest['distribution'],
        "top_5_routes_by_pallet_volume": [{"route": r, "count": c} for r, c in top_routes],
        "daily_summary": daily,
    }
    return json.dumps(summary, indent=2)

@app.post("/api/query")
async def query_endpoint(query: str = Form(...), context_id: str = Form(None), supervisor_mode: str = Header(None)):
    # Access control: only allow if supervisor_mode is 'true'
    if supervisor_mode != 'true':
        return {"error": "Access denied. Only Supervisor mode can query the AI."}
    # Fetch all records (optionally filter by last 30 days)
    session = SessionLocal()
    thirty_days_ago = datetime.now() - timedelta(days=30)
    records = session.query(Sheet4Record).filter(Sheet4Record.Start_Time >= thirty_days_ago).all()
    session.close()
    context = summarize_records(records)
    explanation = "This answer is based on the summarized warehouse activity data from the last 30 days. The context JSON contains daily, shift, area, and route breakdowns. If you need to see the exact data used, ask: 'how did you get this value?'"
    # If question is not about warehouse data, fallback
    if not any(word in query.lower() for word in ["pallet", "shift", "area", "agv", "cycle", "station", "fetch", "deliver", "batch", "quantity", "summary", "compare", "today", "yesterday", "route", "performance", "stock", "data"]):
        return {
            "answer": "I'm currently connected to your warehouse activity data. Please rephrase your question to refer to a metric, date, location, or shift.",
            "context_json": context,
            "explanation": explanation
        }
    # Pass context to LLM
    ai_answer = await query_rag(query, context)
    return {
        "answer": ai_answer,
        "context_json": context,
        "explanation": explanation
    }

@app.post("/api/analytics")
async def analytics_endpoint(authorization: str = Depends(verify_token)):
    # TODO: Replace with real analytics data aggregation logic
    # Example: Fetch from database, aggregate, and return
    return {
        "hourlyData": [],
        "shiftComparison": [],
        "equipmentData": [],
        "areaPerformance": []
    }

@app.post("/api/dashboard")
async def dashboard_endpoint(authorization: str = Depends(verify_token)):
    # TODO: Replace with real dashboard data aggregation logic
    # Example: Fetch from database, aggregate, and return
    return {
        "hourlyData": [],
        "shiftData": [],
        "efficiencyData": [],
        "alerts": []
    } 