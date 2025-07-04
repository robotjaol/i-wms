import React, { useState } from 'react';
import { Database, Download, Upload, Filter, Trash2, RefreshCw, Search, Save, Edit, Eye, Plus, Settings, ExternalLink, HardDrive, Cloud, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DatabasePanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [sortField, setSortField] = useState('startDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterFetchStation, setFilterFetchStation] = useState('all');
  const [filterDeliveryStation, setFilterDeliveryStation] = useState('all');
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<string | null>(null);

  // Enhanced mock data
  const tableData = [
    { id: '1', startDate: '2024-07-01', fetchStation: 'Zone A', deliveryStation: 'Zone B', batch: 'Batch 123', qty: 50, status: 'completed', lastUpdated: '2024-07-01 14:30' },
    { id: '2', startDate: '2024-07-02', fetchStation: 'Zone C', deliveryStation: 'Zone D', batch: 'Batch 456', qty: 30, status: 'completed', lastUpdated: '2024-07-02 09:15' },
    { id: '3', startDate: '2024-07-03', fetchStation: 'Loading Dock', deliveryStation: 'Zone A', batch: 'Batch 789', qty: 75, status: 'in-progress', lastUpdated: '2024-07-03 11:45' },
    { id: '4', startDate: '2024-07-04', fetchStation: 'Zone B', deliveryStation: 'RMS A', batch: 'Batch 101', qty: 25, status: 'pending', lastUpdated: '2024-07-04 08:20' },
    { id: '5', startDate: '2024-07-05', fetchStation: 'Zone A', deliveryStation: 'Zone C', batch: 'Batch 202', qty: 40, status: 'completed', lastUpdated: '2024-07-05 16:10' },
    { id: '6', startDate: '2024-07-06', fetchStation: 'RMS B', deliveryStation: 'Loading Dock', batch: 'Batch 303', qty: 60, status: 'error', lastUpdated: '2024-07-06 13:25' },
  ];

  const syncEndpoints = [
    { name: 'Production DB', url: 'https://api.production.com/db', status: 'connected', lastSync: '5 min ago' },
    { name: 'Backup Server', url: 'https://backup.company.com/api', status: 'disconnected', lastSync: '2 hours ago' },
    { name: 'Analytics Platform', url: 'https://analytics.company.com/sync', status: 'connected', lastSync: '1 min ago' },
  ];

  const databaseStats = {
    totalRecords: 1247,
    lastBackup: '2024-07-06 23:00',
    storageUsed: '2.3 GB',
    syncStatus: 'healthy',
    pendingUpdates: 3,
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectRecord = (id: string) => {
    setSelectedRecords(prev => 
      prev.includes(id) 
        ? prev.filter(recordId => recordId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRecords.length === tableData.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(tableData.map(record => record.id));
    }
  };

  const filteredAndSortedData = tableData
    .filter(record => {
      const matchesSearch = 
        record.batch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.fetchStation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.deliveryStation.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStartDate = !filterStartDate || record.startDate >= filterStartDate;
      const matchesFetchStation = filterFetchStation === 'all' || record.fetchStation === filterFetchStation;
      const matchesDeliveryStation = filterDeliveryStation === 'all' || record.deliveryStation === filterDeliveryStation;
      
      return matchesSearch && matchesStartDate && matchesFetchStation && matchesDeliveryStation;
    })
    .sort((a, b) => {
      const aValue = a[sortField as keyof typeof a];
      const bValue = b[sortField as keyof typeof b];
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
      'in-progress': { color: 'bg-blue-100 text-blue-700', icon: RefreshCw },
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      error: { color: 'bg-red-100 text-red-700', icon: AlertCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${config.color}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const renderSyncModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-glass p-6 max-w-2xl w-full mx-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Cloud className="w-5 h-5 text-primary-500" />
            Database Sync Configuration
          </h3>
          <button
            onClick={() => setShowSyncModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          {syncEndpoints.map((endpoint, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-semibold">{endpoint.name}</div>
                <div className="text-sm text-gray-600">{endpoint.url}</div>
                <div className="text-xs text-gray-500">Last sync: {endpoint.lastSync}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  endpoint.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <button className="btn-secondary btn-sm">
                  {endpoint.status === 'connected' ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2 mt-6">
          <button className="btn-primary flex-1">Save Configuration</button>
          <button 
            onClick={() => setShowSyncModal(false)}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-2">
        <span>Home</span> / <span className="text-primary-600 font-semibold">Database</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Database className="w-6 h-6 text-primary-500" /> 
          Data Management Panel
        </h1>
        <div className="flex gap-2">
          <button className="btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" /> Export JSON
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <HardDrive className="w-4 h-4" /> Backup
          </button>
          <button className="btn-accent flex items-center gap-2">
            <Upload className="w-4 h-4" /> Restore
          </button>
        </div>
      </div>

      {/* Database Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card-glass text-center p-4">
          <Database className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{databaseStats.totalRecords}</div>
          <div className="text-sm text-gray-600">Total Records</div>
        </div>
        
        <div className="card-glass text-center p-4">
          <HardDrive className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{databaseStats.storageUsed}</div>
          <div className="text-sm text-gray-600">Storage Used</div>
        </div>
        
        <div className="card-glass text-center p-4">
          <Cloud className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{databaseStats.syncStatus}</div>
          <div className="text-sm text-gray-600">Sync Status</div>
        </div>
        
        <div className="card-glass text-center p-4">
          <RefreshCw className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{databaseStats.pendingUpdates}</div>
          <div className="text-sm text-gray-600">Pending Updates</div>
        </div>
        
        <div className="card-glass text-center p-4">
          <Save className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <div className="text-sm font-bold text-gray-900">{databaseStats.lastBackup}</div>
          <div className="text-sm text-gray-600">Last Backup</div>
        </div>
      </div>

      {/* Enhanced Filters & Actions */}
      <div className="card-glass">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Records</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="input-primary pl-10"
                placeholder="Search by batch, station, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              className="input-primary"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
            />
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Fetch Station</label>
            <select
              className="input-primary"
              value={filterFetchStation}
              onChange={(e) => setFilterFetchStation(e.target.value)}
            >
              <option value="all">All Stations</option>
              <option value="Zone A">Zone A</option>
              <option value="Zone B">Zone B</option>
              <option value="Zone C">Zone C</option>
              <option value="Loading Dock">Loading Dock</option>
              <option value="RMS A">RMS A</option>
              <option value="RMS B">RMS B</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Station</label>
            <select
              className="input-primary"
              value={filterDeliveryStation}
              onChange={(e) => setFilterDeliveryStation(e.target.value)}
            >
              <option value="all">All Stations</option>
              <option value="Zone A">Zone A</option>
              <option value="Zone B">Zone B</option>
              <option value="Zone C">Zone C</option>
              <option value="Loading Dock">Loading Dock</option>
              <option value="RMS A">RMS A</option>
              <option value="RMS B">RMS B</option>
            </select>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary flex items-center gap-1">
            <Filter className="w-4 h-4" /> Apply Filters
          </button>
          <button className="btn-secondary flex items-center gap-1">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button 
            onClick={() => setShowSyncModal(true)}
            className="btn-accent flex items-center gap-1"
          >
            <ExternalLink className="w-4 h-4" /> Sync Config
          </button>
          <button className="btn-primary flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Record
          </button>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="card-glass">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Database className="w-5 h-5 text-primary-500" />
            Excel Processor Records (Sheet 4)
          </h2>
          <div className="text-sm text-gray-500">
            {filteredAndSortedData.length} of {tableData.length} records
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="w-8">
                  <input
                    type="checkbox"
                    checked={selectedRecords.length === tableData.length}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('startDate')}
                >
                  Start Date {renderSortIcon('startDate')}
                </th>
                <th 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('fetchStation')}
                >
                  Fetch Station {renderSortIcon('fetchStation')}
                </th>
                <th 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('deliveryStation')}
                >
                  Delivery Station {renderSortIcon('deliveryStation')}
                </th>
                <th 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('batch')}
                >
                  Batch {renderSortIcon('batch')}
                </th>
                <th 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('qty')}
                >
                  Quantity {renderSortIcon('qty')}
                </th>
                <th 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('status')}
                >
                  Status {renderSortIcon('status')}
                </th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData.map((record) => (
                <tr key={record.id} className="hover:bg-blue-50">
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRecords.includes(record.id)}
                      onChange={() => handleSelectRecord(record.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="font-mono text-sm">{record.startDate}</td>
                  <td className="font-medium">{record.fetchStation}</td>
                  <td className="font-medium">{record.deliveryStation}</td>
                  <td className="font-mono text-sm">{record.batch}</td>
                  <td className="font-semibold">{record.qty}</td>
                  <td>{renderStatusBadge(record.status)}</td>
                  <td className="text-sm text-gray-600">{record.lastUpdated}</td>
                  <td>
                    <div className="flex gap-1">
                      <button 
                        className="btn-secondary btn-xs"
                        onClick={() => setEditingRecord(record.id)}
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      <button 
                        className="btn-secondary btn-xs"
                        onClick={() => setEditingRecord(record.id)}
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button className="btn-secondary btn-xs">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Batch Operations */}
        {selectedRecords.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
          >
            <span className="text-sm text-blue-700 font-medium">
              {selectedRecords.length} record(s) selected
            </span>
            <button className="btn-secondary btn-sm flex items-center gap-1">
              <Edit className="w-4 h-4" /> Batch Update
            </button>
            <button className="btn-secondary btn-sm flex items-center gap-1">
              <Trash2 className="w-4 h-4" /> Batch Delete
            </button>
            <button className="btn-primary btn-sm flex items-center gap-1">
              <Download className="w-4 h-4" /> Export Selected
            </button>
          </motion.div>
        )}
      </div>

      {/* Sync Status */}
      <div className="card-glass">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Cloud className="w-5 h-5 text-primary-500" />
          External Database Sync Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {syncEndpoints.map((endpoint, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-semibold">{endpoint.name}</div>
                <div className="text-sm text-gray-600">{endpoint.url}</div>
                <div className="text-xs text-gray-500">Last sync: {endpoint.lastSync}</div>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                endpoint.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
              }`} />
            </div>
          ))}
        </div>
      </div>

      {/* Sync Modal */}
      {showSyncModal && renderSyncModal()}
    </div>
  );
} 