import React, { useRef, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const Toolbar = ({
  data,
  toggleColumn,
  sortByColumn,
  onSearch,
  addNewRow,
  hiddenCols,
  columnNames,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  clearAllData,
  duplicateRow
}: {
  data: any[][],
  toggleColumn: (i: number) => void,
  sortByColumn: (colIdx: number) => void,
  onSearch: (term: string) => void,
  addNewRow: () => void,
  hiddenCols: number[],
  columnNames: string[],
  onUndo: () => void,
  onRedo: () => void,
  canUndo: boolean,
  canRedo: boolean,
  clearAllData: () => void,
  duplicateRow: (rowIdx: number) => void
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showToolbarMenu, setShowToolbarMenu] = useState(false);
  const [showHideMenu, setShowHideMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.dropdown-container')) {
        setShowToolbarMenu(false);
        setShowHideMenu(false);
        setShowSortMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = () => {
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'spreadsheet.xlsx');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryStr = event.target?.result;
      const workbook = XLSX.read(binaryStr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const importedData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
      console.log('Imported:', importedData);
      // use setSpreadsheetData here if lifting state
    };
    reader.readAsBinaryString(file);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch(term);
  };

  const handleHideColumn = (colIndex: number) => {
    toggleColumn(colIndex);
    setShowHideMenu(false);
  };

  const handleSortColumn = (colIndex: number) => {
    sortByColumn(colIndex);
    setShowSortMenu(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    onSearch('');
  };

  const getDataStats = () => {
    const totalCells = data.length * (data[0]?.length || 0);
    const filledCells = data.flat().filter(cell => cell && cell.value && cell.value.trim() !== '').length;
    return { total: totalCells, filled: filledCells, percentage: Math.round((filledCells / totalCells) * 100) };
  };

  const stats = getDataStats();

  return (
    <div className="flex flex-wrap items-center gap-2 bg-white px-4 py-2 rounded shadow mb-4 border border-gray-100">
      {/* Toolbar dropdown */}
      <div className="relative dropdown-container">
        <button className="btn flex items-center gap-1" onClick={() => setShowToolbarMenu(!showToolbarMenu)}>
          <span>Tool bar</span> 
          <span className="text-xs">▼</span>
        </button>
        {showToolbarMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
            <div className="p-2">
              <div className="text-sm font-medium text-gray-700 mb-2">Quick Actions</div>
              <button 
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                onClick={onUndo}
                disabled={!canUndo}
              >
                Undo {canUndo ? '' : '(disabled)'}
              </button>
              <button 
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                onClick={onRedo}
                disabled={!canRedo}
              >
                Redo {canRedo ? '' : '(disabled)'}
              </button>
              <button 
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                onClick={addNewRow}
              >
                Add New Row
              </button>
              <button 
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                onClick={clearAllData}
              >
                Clear All Data
              </button>
              <div className="border-t border-gray-200 my-2"></div>
              <div className="text-xs text-gray-500 px-2">Data Actions</div>
              <button 
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                onClick={() => duplicateRow(0)}
              >
                Duplicate First Row
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hide fields dropdown */}
      <div className="relative dropdown-container">
        <button className="btn" onClick={() => setShowHideMenu(!showHideMenu)}>
          Hide fields
        </button>
        {showHideMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
            <div className="p-2">
              <div className="text-sm font-medium text-gray-700 mb-2">Toggle Column Visibility</div>
              {columnNames.map((name, index) => (
                <button
                  key={index}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2 ${
                    hiddenCols.includes(index) ? 'text-gray-400' : 'text-gray-700'
                  }`}
                  onClick={() => handleHideColumn(index)}
                >
                  <span className={`w-3 h-3 rounded border ${hiddenCols.includes(index) ? 'bg-gray-300' : 'bg-blue-500'}`}></span>
                  {name} {hiddenCols.includes(index) ? '(Hidden)' : ''}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sort dropdown */}
      <div className="relative dropdown-container">
        <button className="btn" onClick={() => setShowSortMenu(!showSortMenu)}>
          Sort
        </button>
        {showSortMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
            <div className="p-2">
              <div className="text-sm font-medium text-gray-700 mb-2">Sort by Column</div>
              {columnNames.map((name, index) => (
                <button
                  key={index}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                  onClick={() => handleSortColumn(index)}
                >
                  Sort by {name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
        />
        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.6 10.6Z"/>
          </svg>
        </span>
        {searchTerm && (
          <button
            onClick={clearFilters}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            title="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Data stats */}
      <div className="text-xs text-gray-500 px-2">
        {stats.filled}/{stats.total} cells ({stats.percentage}%)
      </div>

      <button className="btn">Filter</button>
      <button className="btn">Cell view</button>
      
      <div className="flex-1"></div>
      
      {/* Action buttons */}
      <button className="btn" onClick={handleExport}>Export</button>
      <button className="btn" onClick={() => fileInputRef.current?.click()}>Import</button>
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleImport} />
      <button className="btn" onClick={handleShare}>Share</button>
      <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded font-medium transition">New Action</button>
    </div>
  );
};

export default Toolbar;