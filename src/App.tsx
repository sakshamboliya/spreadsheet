import React, { useState, useRef } from 'react';
import Tabs from './components/Tabs';
import Toolbar from './components/Toolbar';
import Spreadsheet from './components/Spreadsheet';

const App = () => {
  const [spreadsheetData, setSpreadsheetData] = useState(
    Array.from({ length: 10 }, () =>
      Array(5).fill({ value: '', format: {} })
    )
  );
  const [hiddenCols, setHiddenCols] = useState<number[]>([]);
  const [filterTerm, setFilterTerm] = useState('');
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [sortConfig, setSortConfig] = useState<{ col: number; direction: 'asc' | 'desc' } | null>(null);
  const [columnFilters, setColumnFilters] = useState<string[]>(Array(spreadsheetData[0]?.length || 5).fill(''));
  const [history, setHistory] = useState<any[][][]>([]);
  const [redoStack, setRedoStack] = useState<any[][][]>([]);
  const [columnNames, setColumnNames] = useState([
    'A', 'B', 'C', 'D', 'E'
  ]);

  const toggleColumn = (index: number) => {
    setHiddenCols(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const addNewRow = () => {
    setSpreadsheetData(prev => [...prev, Array(prev[0]?.length || 5).fill({ value: '', format: {} })]);
  };

  const deleteLastRow = () => {
    setSpreadsheetData(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  const addNewColumn = () => {
    setSpreadsheetData(prev => prev.map(row => [...row, { value: '', format: {} }]));
  };

  const deleteLastColumn = () => {
    setSpreadsheetData(prev =>
      prev[0]?.length > 1 ? prev.map(row => row.slice(0, -1)) : prev
    );
  };

  const sortByColumn = (index: number) => {
    setSortConfig(prev => {
      if (prev && prev.col === index) {
        return { col: index, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { col: index, direction: 'asc' };
    });
  };

  const handleFilter = (term: string) => {
    setFilterTerm(term);
  };

  const handleSort = (colIdx: number) => {
    setSortConfig(prev => {
      if (prev && prev.col === colIdx) {
        return { col: colIdx, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { col: colIdx, direction: 'asc' };
    });
  };

  const handleFilterChange = (colIdx: number, value: string) => {
    setColumnFilters(prev => {
      const updated = [...prev];
      updated[colIdx] = value;
      return updated;
    });
  };

  let filteredData = spreadsheetData.filter(row =>
    row.some(cell => cell.value.toLowerCase().includes(filterTerm.toLowerCase()))
  );
  filteredData = filteredData.filter(row =>
    row.every((cell, idx) =>
      !columnFilters[idx] || cell.value.toLowerCase().includes(columnFilters[idx].toLowerCase())
    )
  );

  if (sortConfig) {
    filteredData = [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.col]?.value || '';
      const bVal = b[sortConfig.col]?.value || '';
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const deleteRow = (rowIdx: number) => {
    setSpreadsheetData(prev => prev.length > 1 ? prev.filter((_, i) => i !== rowIdx) : prev);
  };

  const deleteColumn = (colIdx: number) => {
    setSpreadsheetData(prev =>
      prev[0]?.length > 1 ? prev.map(row => row.filter((_, i) => i !== colIdx)) : prev
    );
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      setSpreadsheetData(prev => prev.map(row => row.map(cell => ({ value: '', format: {} }))));
    }
  };

  const duplicateRow = (rowIdx: number) => {
    setSpreadsheetData(prev => {
      const newData = [...prev];
      const rowToDuplicate = newData[rowIdx];
      newData.splice(rowIdx + 1, 0, rowToDuplicate.map(cell => ({ ...cell })));
      return newData;
    });
  };

  // CSV Export
  const handleExport = () => {
    const csv = spreadsheetData.map(row => row.map(cell => '"' + cell.value.replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spreadsheet.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // CSV Import
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split(/\r?\n/).filter(Boolean);
      const data = rows.map(row => {
        const matches = row.match(/("[^"]*("{2})*[^"]*"|[^,])+/g) || [];
        return matches.map(cell => ({ value: cell.replace(/^"|"$/g, '').replace(/""/g, '"'), format: {} }));
      });
      setSpreadsheetData(data);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Wrap setSpreadsheetData to push to history
  const setSpreadsheetDataWithHistory = (newData: any[][]) => {
    setHistory(prev => [...prev, spreadsheetData]);
    setRedoStack([]);
    setSpreadsheetData(newData);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setRedoStack(r => [spreadsheetData, ...r]);
    setHistory(h => h.slice(0, -1));
    setSpreadsheetData(prev);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setHistory(h => [...h, spreadsheetData]);
    setRedoStack(r => r.slice(1));
    setSpreadsheetData(next);
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-8 py-4 bg-white shadow rounded-b-xl mb-8 border-b border-gray-200">
        {/* Left: Workspace/Folders */}
        <div className="flex items-center gap-3 text-gray-500 text-base font-medium">
          <span className="w-5 h-5 bg-purple-400 rounded-lg mr-2 inline-block"></span>
          <span>Workspace</span>
          <span className="mx-1 text-gray-300">/</span>
          <span>Folder 2</span>
          <span className="mx-1 text-gray-300">/</span>
          <span className="font-bold text-gray-900">Spreadsheet 3</span>
        </div>
        {/* Center: (optional, can add logo or title if Figma shows) */}
        <div></div>
        {/* Right: Search, Notifications, User */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search within sheet"
              className="pl-10 pr-4 py-2 rounded-lg bg-gray-100 border border-gray-200 focus:ring-2 focus:ring-blue-200 text-base min-w-[200px]"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">
              {/* Figma-matching search icon */}
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.6 10.6Z"/></svg>
            </span>
          </div>
          <button className="relative">
            {/* Figma-matching notification bell icon */}
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" className="text-gray-400"><path stroke="currentColor" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0h-6"/></svg>
            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full px-1">2</span>
          </button>
          <div className="flex items-center gap-3">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow" />
            <div className="text-sm text-right">
              <div className="font-bold text-gray-900 leading-tight">John Doe</div>
              <div className="text-gray-400">john.doe@email.com</div>
            </div>
          </div>
        </div>
      </div>
      {/* End Header Bar */}
      {/* Toolbar */}
      <Toolbar
        data={spreadsheetData}
        toggleColumn={toggleColumn}
        sortByColumn={sortByColumn}
        onSearch={handleFilter}
        addNewRow={addNewRow}
        hiddenCols={hiddenCols}
        columnNames={columnNames}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={history.length > 0}
        canRedo={redoStack.length > 0}
        clearAllData={clearAllData}
        duplicateRow={duplicateRow}
      />
      {/* End Toolbar */}
      <div className="p-6">
        <h1 className="text-xl font-bold mb-2">React Spreadsheet</h1>
        <Tabs />
        <Spreadsheet
          onDataChange={setSpreadsheetDataWithHistory}
          hiddenCols={hiddenCols}
          data={filteredData}
          selectedCell={selectedCell}
          setSelectedCell={setSelectedCell}
          addNewRow={addNewRow}
          addNewColumn={addNewColumn}
          deleteRow={deleteRow}
          deleteColumn={deleteColumn}
          sortConfig={sortConfig}
          onSort={handleSort}
          columnFilters={columnFilters}
          onFilterChange={handleFilterChange}
          columnNames={columnNames}
          setColumnNames={setColumnNames}
        />
      </div>
    </div>
  );
};

export default App;
