'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, Plus, Download, X, Loader2, File, Info, HelpCircle, CheckCircle, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const columns = [
  'PC', 'MC', 'Materiel_Desc', 'Vendor', 'Quantity', 'Uom', 'Batch', 'Pallet_Id', 'Mfg_Date', 'Exp_Date', 'Fetch_Station', 'Deliver_Station', 'Start_Time', 'Fetch_Time', 'Delivery_Time'
];

function safeFormatDate(val: any, fmt = 'yyyy-MM-dd HH:mm:ss') {
  if (!val) return '';
  try {
    const d = typeof val === 'string' ? new Date(val) : val;
    if (isNaN(d.getTime())) return '';
    return format(d, fmt);
  } catch {
    return '';
  }
}

export default function ExcelProcessor() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [filter, setFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newRow, setNewRow] = useState<any>({});
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortCol, setSortCol] = useState('Start_Time');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const requiredFields = [
    'Fetch Station',
    'Deliver Station',
    'Start Time',
    'Fetch Time',
    'Delivery Time',
  ];
  const [addError, setAddError] = useState<string | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const helpRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [processingFile, setProcessingFile] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [filterColumn, setFilterColumn] = useState<string>('all');

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    if (!file) {
      setSheetNames([]);
      setSelectedSheet('');
      setProcessingFile(false);
      return;
    }
    const fetchSheetNames = async () => {
      setProcessingFile(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/sheet-names', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setSheetNames(data.sheets || []);
        setSelectedSheet(data.sheets?.[0] || '');
      } else {
        setSheetNames([]);
        setSelectedSheet('');
      }
      setProcessingFile(false);
    };
    fetchSheetNames();
  }, [file]);

  useEffect(() => {
    if (!showHelp) return;
    function handleClickOutside(event: MouseEvent) {
      if (helpRef.current && !helpRef.current.contains(event.target as Node)) {
        setShowHelp(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showHelp]);

  useEffect(() => {
    if (error || success) {
      setShowBanner(true);
      const timer = setTimeout(() => setShowBanner(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/records');
      if (!res.ok) throw new Error('Failed to fetch records');
      const data = await res.json();
      setRecords(data);
    } catch (e: any) {
      setError(e.message || 'Error fetching records');
    }
    setLoading(false);
  };

  const handleUpload = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!file || !selectedSheet) return;
    setUploading(true);
    setLoading(true);
    setError(null);
    setSuccess(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sheet', selectedSheet);
    try {
      const res = await fetch('/api/upload-sheet4', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Upload failed');
      }
      setFile(null);
      setSuccess('File uploaded and processed successfully.');
      setError(null);
      await fetchRecords();
    } catch (e: any) {
      setError(e.message || 'Upload failed');
    }
    setUploading(false);
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/record/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await fetchRecords();
    } catch (e: any) {
      setError(e.message || 'Delete failed');
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRow),
      });
      if (!res.ok) throw new Error('Add failed');
      setShowAdd(false);
      setNewRow({});
      setSuccess('Row added successfully.');
      await fetchRecords();
    } catch (e: any) {
      setError(e.message || 'Add failed');
    }
    setLoading(false);
  };

  const handleExport = () => {
    const filtered = getFilteredSorted();
    const csv = [columns.join(',')].concat(
      filtered.map(row => columns.map(col => JSON.stringify(row[col] ?? '')).join(','))
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sheet4_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFilteredSorted = () => {
    let data = [...records];
    if (filter) {
      if (filterColumn === 'all') {
        data = data.filter(row =>
          columns.some(col => (row[col] || '').toString().toLowerCase().includes(filter.toLowerCase()))
        );
      } else {
        data = data.filter(row => (row[filterColumn] || '').toString().toLowerCase().includes(filter.toLowerCase()));
      }
    }
    data.sort((a, b) => {
      if (!a[sortCol] || !b[sortCol]) return 0;
      if (sortDir === 'asc') return a[sortCol] > b[sortCol] ? 1 : -1;
      return a[sortCol] < b[sortCol] ? 1 : -1;
    });
    return data;
  };

  const paged = getFilteredSorted().slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.max(1, Math.ceil(getFilteredSorted().length / rowsPerPage));

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 md:px-12 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x">Excel Processor</h1>
          <p className="text-gray-700 text-lg mt-1">Upload and manage warehouse Sheet 4 data. Filter, sort, edit, and export records in real time.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Excel format help"
            tabIndex={0}
            onClick={() => setShowHelp(v => !v)}
          >
            <HelpCircle className="w-6 h-6 text-blue-500" />
          </button>
          {showHelp && (
            <div ref={helpRef} className="absolute z-50 mt-12 right-4 bg-white border border-blue-200 rounded-lg shadow-lg p-4 w-80 animate-fade-in text-sm text-gray-700">
              <div className="flex items-center gap-2 mb-2 font-semibold text-blue-700"><Info className="w-4 h-4" /> Required Excel Format</div>
              <ul className="list-disc ml-6">
                <li>Sheet name: <b>Sheet 4</b></li>
                <li>Columns: PC, MC, Materiel Desc, Vendor, Quantity, Uom, Batch, Pallet Id, Mfg. Date, Exp. Date, Fetch Station, Deliver Station, Start Time, Fetch Time, Delivery Time</li>
                <li>File type: .xlsx or .xls</li>
              </ul>
            </div>
          )}
        </div>
      </div>
      {/* Error/Success Feedback */}
      <AnimatePresence>
        {error && showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded shadow font-semibold flex items-center gap-2 mb-2 cursor-pointer animate-fade-in"
            aria-live="assertive"
            onClick={() => setShowBanner(false)}
          >
            <X className="w-5 h-5" /> {error}
          </motion.div>
        )}
        {success && showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded shadow font-semibold flex items-center gap-2 mb-2 cursor-pointer animate-fade-in"
            aria-live="polite"
            onClick={() => setShowBanner(false)}
          >
            <CheckCircle className="w-5 h-5" /> {success}
          </motion.div>
        )}
      </AnimatePresence>
      {/* File Upload Card */}
      <motion.div
        className="bg-white/90 rounded-2xl shadow-lg p-6 flex flex-col md:flex-row md:items-center gap-4 border border-blue-100 relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Progress bar for processing/uploading */}
        {(uploading || processingFile) && (
          <motion.div
            className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-pulse z-30 rounded-t-2xl"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: 0.5 }}
            style={{ transformOrigin: 'left' }}
          />
        )}
        {/* Overlay loading spinner while uploading or processing file */}
        {(uploading || processingFile) && (
          <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-20 rounded-2xl">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-2" />
            <span className="text-blue-700 font-semibold">{uploading ? 'Uploading and processing...' : 'Processing file...'}</span>
          </div>
        )}
        <div className="flex-1 flex flex-col items-center md:items-start gap-2">
          <motion.div
            className={`w-full border-2 border-dashed ${file ? 'border-green-400 bg-green-50' : 'border-blue-300 bg-blue-50'} rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-100 focus-within:scale-105 focus-within:shadow-lg focus-within:border-pink-400`}
            whileHover={{ scale: 1.03, boxShadow: '0 4px 24px 0 rgba(80,80,255,0.08)' }}
            whileTap={{ scale: 0.98 }}
            tabIndex={0}
            aria-label="Drag and drop Excel file or click to select"
            onClick={() => fileInputRef.current?.click()}
            onDrop={e => { e.preventDefault(); setFile(e.dataTransfer.files?.[0] || null); }}
            onDragOver={e => e.preventDefault()}
          >
            <Upload className="w-10 h-10 text-blue-400 mb-2" />
            <span className="font-semibold text-lg text-blue-700">{file ? 'Change File' : 'Drag & Drop or Click to Upload'}</span>
            <span className="text-gray-500 text-sm mt-1">Accepted: .xlsx, .xls</span>
            {file && (
              <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-lg mt-2 animate-fade-in">
                <File className="w-4 h-4" />
                <span className="truncate max-w-[120px] font-medium">{file.name}</span>
              </span>
            )}
          </motion.div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="hidden"
            aria-label="Upload Excel file"
          />
          {/* Sheet selector and Send to Table button only after processing */}
          <AnimatePresence>
            {sheetNames.length > 0 && !processingFile && (
              <motion.div
                className="mt-4 w-full flex flex-col gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-sm font-semibold text-blue-700 mb-1">Select Sheet</label>
                <div className="relative">
                  <select
                    value={selectedSheet}
                    onChange={e => setSelectedSheet(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gradient-to-r from-blue-400 via-purple-400 to-pink-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-300 bg-white text-gray-900 font-semibold shadow transition-all outline-none appearance-none"
                    style={{ backgroundImage: 'linear-gradient(to right, #60a5fa, #a78bfa, #f472b6)' }}
                  >
                    {sheetNames.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-pink-400 text-lg">▼</span>
                </div>
                {/* Send to Table button */}
                <motion.button
                  type="button"
                  onClick={handleUpload}
                  disabled={!file || !selectedSheet || uploading}
                  className="mt-2 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow hover:scale-105 transition-transform disabled:opacity-50 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  aria-live="polite"
                >
                  {uploading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Upload className="w-5 h-5 mr-2" />} Send to Table
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <button type="button" onClick={handleExport} disabled={records.length === 0} className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-lg shadow hover:scale-105 transition-transform disabled:opacity-50 font-semibold" aria-label="Export CSV">
            <Download className="w-5 h-5 mr-2" /> Export CSV
          </button>
          <button type="button" onClick={() => setShowAdd(true)} className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-lg shadow hover:scale-105 transition-transform font-semibold" aria-label="Add Row">
            <Plus className="w-5 h-5 mr-2" /> Add Row
          </button>
        </div>
      </motion.div>
      {/* Filter/Search Bar */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-[#eafaf1] to-[#f7fdf9] rounded-xl shadow-sm p-3 flex flex-col sm:flex-row sm:items-center gap-3 border border-green-100">
        <div className="flex items-center w-full sm:w-auto">
          <span className="inline-flex items-center px-2 bg-transparent text-green-600">
            <Filter className="w-5 h-5" />
          </span>
          <select
            value={filterColumn}
            onChange={e => setFilterColumn(e.target.value)}
            className="px-2 py-2 rounded-l-lg border-0 bg-transparent text-green-800 font-medium focus:ring-0 focus:outline-none"
            aria-label="Select column to filter"
          >
            <option value="all">All Columns</option>
            {columns.map(col => (
              <option key={col} value={col}>{col.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <input
            placeholder="Filter records..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="flex-1 px-4 py-2 border-2 border-green-200 rounded-r-lg focus:ring-2 focus:ring-green-400 bg-white shadow transition-all text-gray-700 font-medium min-w-0"
            aria-label="Filter records"
            style={{ borderLeft: 'none' }}
          />
        </div>
        <span className="text-gray-400 text-sm sm:text-base whitespace-nowrap sm:ml-auto font-medium">{getFilteredSorted().length} records</span>
      </div>
      {/* Loading Indicator */}
      {loading && <div className="flex items-center space-x-2 text-blue-600 animate-fade-in font-semibold"><Loader2 className="w-5 h-5 animate-spin" /> <span>Loading...</span></div>}
      {/* Data Table */}
      <div className="overflow-x-auto rounded-xl shadow bg-white/90 animate-fade-in border border-gray-100">
        <table className="min-w-full border text-sm">
          <thead className="bg-gradient-to-r from-[#d9ead3] via-[#b6d7a8] to-[#93c47d] sticky top-0 z-10">
            <tr>
              {columns.map(col => (
                <th key={col} onClick={() => {
                  setSortCol(col);
                  setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                }} className="px-2 py-2 cursor-pointer whitespace-nowrap font-bold text-black hover:text-green-700 transition-colors text-xs sm:text-sm md:text-base sticky top-0 bg-gradient-to-r from-green-200 via-green-100 to-emerald-100 border-b border-gray-200">
                  {col.replace(/_/g, ' ')} {sortCol === col ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </th>
              ))}
              <th className="text-xs sm:text-sm md:text-base sticky top-0 bg-gradient-to-r from-green-200 via-green-100 to-emerald-100 border-b border-gray-200 font-bold text-black">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((row, idx) => (
              <tr
                key={row.id || row.Start_Time || Math.random()}
                className={
                  `${idx % 2 === 0 ? 'bg-white' : 'bg-[#f3fdf6]'} hover:bg-[#e2f7e1] transition-colors group`
                }
              >
                {columns.map(col => (
                  <td key={col} className="px-2 py-2 whitespace-nowrap group-hover:bg-[#e2f7e1] transition-colors text-xs sm:text-sm md:text-base border-b border-gray-100 text-black">{
                    col.endsWith('Date') || col.endsWith('Time')
                      ? safeFormatDate(row[col])
                      : row[col]
                  }</td>
                ))}
                <td className="border-b border-gray-100">
                  <button onClick={() => handleDelete(row.id)} className="p-1 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded shadow hover:scale-110 transition-transform" aria-label="Delete row" title="Delete row">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 bg-white/80 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(page - 1)} disabled={page === 1} className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold disabled:opacity-50">Prev</button>
            <span className="text-gray-600">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(page + 1)} disabled={page === totalPages} className="px-3 py-1 rounded bg-pink-100 text-pink-700 font-semibold disabled:opacity-50">Next</button>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={1}
              max={100}
              value={rowsPerPage}
              onChange={e => setRowsPerPage(Number(e.target.value))}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-black"
              aria-label="Rows per page"
            />
            <span className="text-black">rows/page</span>
          </div>
        </div>
      </div>
      {/* Modal for Add Row */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg p-4 sm:p-8 relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAdd(false)} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 focus:outline-none" aria-label="Close add row modal">
              <X className="w-6 h-6 text-gray-400" />
            </button>
            <h2 className="text-2xl font-bold text-pink-600 mb-4 sm:mb-6">Add New Row</h2>
            {addError && <div className="mb-3 bg-red-100 border border-red-300 text-red-800 px-3 py-2 rounded shadow animate-fade-in font-semibold flex items-center gap-2"><X className="w-5 h-5" /> {addError}</div>}
            <div className="space-y-3">
              {columns.map(col => {
                const isRequired = requiredFields.includes(col.replace(/_/g, ' '));
                return (
                  <div key={col} className="flex flex-col">
                    <input
                      type="text"
                      value={newRow[col] || ''}
                      onChange={e => setNewRow({ ...newRow, [col]: e.target.value })}
                      placeholder={col.replace(/_/g, ' ') + (isRequired ? ' *' : '')}
                      className={`w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-base focus:outline-none focus:ring-2 ${isRequired ? 'focus:ring-pink-500' : 'focus:ring-pink-400'} focus:border-pink-400 placeholder-gray-400 transition-all`}
                      autoComplete="off"
                      required={isRequired}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setAddError(null);
                  // Validate required fields
                  for (const field of requiredFields) {
                    const key = columns.find(c => c.replace(/_/g, ' ') === field);
                    if (!key) continue; // skip if not found, for type safety
                    if (!newRow[key]) {
                      setAddError(`"${field}" is required.`);
                      return;
                    }
                  }
                  handleAdd();
                }}
                className="px-5 py-2 rounded-lg bg-green-500 text-white font-semibold shadow hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                Add
              </button>
              <button onClick={() => setShowAdd(false)} className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold shadow hover:bg-gray-300 transition-colors focus:outline-none">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 