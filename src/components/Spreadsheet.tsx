import React, { useRef, useEffect, useState } from 'react';

const columns = ['A', 'B', 'C', 'D', 'E'];

const Spreadsheet = ({
  onDataChange,
  hiddenCols,
  data,
  selectedCell,
  setSelectedCell,
  addNewRow,
  addNewColumn,
  deleteRow,
  deleteColumn,
  sortConfig,
  onSort,
  columnFilters,
  onFilterChange,
  columnNames,
  setColumnNames
}: {
  onDataChange: (data: any[][]) => void,
  hiddenCols: number[],
  data: any[][],
  selectedCell: [number, number] | null,
  setSelectedCell: (cell: [number, number]) => void,
  addNewRow: () => void,
  addNewColumn: () => void,
  deleteRow: (rowIdx: number) => void,
  deleteColumn: (colIdx: number) => void,
  sortConfig: { col: number; direction: 'asc' | 'desc' } | null,
  onSort: (colIdx: number) => void,
  columnFilters: string[],
  onFilterChange: (colIdx: number, value: string) => void,
  columnNames: string[],
  setColumnNames: (names: string[]) => void
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);
  const [selectionStart, setSelectionStart] = useState<[number, number] | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<[number, number] | null>(null);
  const [formatPainter, setFormatPainter] = useState<{ row: number; col: number; format: any } | null>(null);

  useEffect(() => {
    if (selectedCell) {
      const [row, col] = selectedCell;
      inputRefs.current[row]?.[col]?.focus();
    }
  }, [selectedCell, data]);

  const handleChange = (row: number, col: number, value: string) => {
    const updated = data.map((r, i) => (i === row ? [...r] : r));
    updated[row][col] = { ...updated[row][col], value };
    onDataChange(updated);
  };

  const handleFormatChange = (row: number, col: number, formatKey: 'bold' | 'italic') => {
    const updated = data.map((r, i) => (i === row ? [...r] : r));
    const prevFormat = updated[row][col].format || {};
    updated[row][col] = {
      ...updated[row][col],
      format: { ...prevFormat, [formatKey]: !prevFormat[formatKey] }
    };
    onDataChange(updated);
  };

  const copyFormat = (row: number, col: number) => {
    const cell = data[row][col];
    setFormatPainter({ row, col, format: cell.format || {} });
  };

  const applyFormat = (row: number, col: number) => {
    if (!formatPainter) return;
    
    const updated = data.map((r, i) => (i === row ? [...r] : r));
    updated[row][col] = {
      ...updated[row][col],
      format: { ...formatPainter.format }
    };
    onDataChange(updated);
    setFormatPainter(null);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    row: number,
    col: number
  ) => {
    let nextRow = row;
    let nextCol = col;
    const maxRow = data.length - 1;
    const maxCol = data[0].length - 1;
    switch (e.key) {
      case 'ArrowUp':
        nextRow = Math.max(0, row - 1);
        break;
      case 'ArrowDown':
        nextRow = Math.min(maxRow, row + 1);
        break;
      case 'ArrowLeft':
        nextCol = Math.max(0, col - 1);
        break;
      case 'ArrowRight':
        nextCol = Math.min(maxCol, col + 1);
        break;
      case 'Tab':
        e.preventDefault();
        nextCol = col + (e.shiftKey ? -1 : 1);
        if (nextCol > maxCol) {
          nextCol = 0;
          nextRow = Math.min(maxRow, row + 1);
        } else if (nextCol < 0) {
          nextCol = maxCol;
          nextRow = Math.max(0, row - 1);
        }
        break;
      case 'Enter':
        e.preventDefault();
        nextRow = Math.min(maxRow, row + 1);
        break;
      default:
        return;
    }
    e.preventDefault();
    setSelectedCell([nextRow, nextCol]);
  };

  // Prepare refs for all cells
  inputRefs.current = data.map((row, rowIndex) =>
    row.map((_, colIndex) => inputRefs.current[rowIndex]?.[colIndex] || null)
  );

  const columnIcons = [
    // Example icons (SVGs or emoji for now)
    <span key="job">📋</span>,
    <span key="date">📅</span>,
    <span key="status">🔖</span>,
    <span key="submitter">👤</span>,
    <span key="url">🔗</span>,
  ];

  const statusColors: Record<string, string> = {
    'In-process': 'bg-yellow-100 text-yellow-800',
    'Complete': 'bg-green-100 text-green-800',
    'Blocked': 'bg-red-100 text-red-800',
    'Need to start': 'bg-blue-100 text-blue-800',
  };

  const priorityColors: Record<string, string> = {
    'High': 'text-red-600',
    'Medium': 'text-yellow-600',
    'Low': 'text-blue-600',
  };

  const textColors = [
    '#111827', // default
    '#ef4444', // red
    '#f59e42', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#3b82f6', // blue
    '#a21caf', // purple
  ];
  const bgColors = [
    '#ffffff', // default
    '#fee2e2', // red
    '#fef9c3', // yellow
    '#bbf7d0', // green
    '#dbeafe', // blue
    '#ede9fe', // purple
  ];

  const handleColorChange = (row: number, col: number, key: 'color' | 'bg', value: string) => {
    const updated = data.map((r, i) => (i === row ? [...r] : r));
    const prevFormat = updated[row][col].format || {};
    updated[row][col] = {
      ...updated[row][col],
      format: { ...prevFormat, [key]: value }
    };
    onDataChange(updated);
  };

  // Helper to check if a cell is in the selection range
  const isCellSelected = (row: number, col: number) => {
    if (!selectionStart || !selectionEnd) return false;
    const [r1, c1] = selectionStart;
    const [r2, c2] = selectionEnd;
    const rowMin = Math.min(r1, r2), rowMax = Math.max(r1, r2);
    const colMin = Math.min(c1, c2), colMax = Math.max(c1, c2);
    return row >= rowMin && row <= rowMax && col >= colMin && col <= colMax;
  };

  // Mouse handlers for selection
  const handleCellMouseDown = (row: number, col: number) => {
    setSelectionStart([row, col]);
    setSelectionEnd([row, col]);
    setSelectedCell([row, col]);
  };
  const handleCellMouseEnter = (row: number, col: number) => {
    if (selectionStart) {
      setSelectionEnd([row, col]);
    }
  };
  const handleMouseUp = () => {
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <div className="overflow-auto shadow-lg rounded-xl border border-gray-200 bg-white relative">
      {/* Formatting Toolbar */}
      {selectedCell && (
        <div className="absolute z-20 left-0 right-0 flex justify-center pointer-events-none" style={{ top: 12 + 48 * selectedCell[0] }}>
          <div className="inline-flex gap-3 bg-white border border-gray-300 rounded-xl shadow-lg px-4 py-2 pointer-events-auto items-center">
            <button
              className={`font-bold px-3 py-1 rounded-lg text-base transition-colors ${data[selectedCell[0]][selectedCell[1]].format?.bold ? 'bg-blue-100 text-blue-700 shadow' : 'hover:bg-gray-100 text-gray-700'}`}
              onClick={() => handleFormatChange(selectedCell[0], selectedCell[1], 'bold')}
              type="button"
              title="Bold"
            >
              <span style={{fontFamily: 'inherit'}}>B</span>
            </button>
            <button
              className={`italic px-3 py-1 rounded-lg text-base transition-colors ${data[selectedCell[0]][selectedCell[1]].format?.italic ? 'bg-blue-100 text-blue-700 shadow' : 'hover:bg-gray-100 text-gray-700'}`}
              onClick={() => handleFormatChange(selectedCell[0], selectedCell[1], 'italic')}
              type="button"
              title="Italic"
            >
              <span style={{fontFamily: 'inherit'}}>I</span>
            </button>
            {/* Format Painter */}
            <button
              className={`px-3 py-1 rounded-lg text-base transition-colors ${formatPainter ? 'bg-green-100 text-green-700 shadow' : 'hover:bg-gray-100 text-gray-700'}`}
              onClick={() => copyFormat(selectedCell[0], selectedCell[1])}
              type="button"
              title="Format Painter"
            >
              <span style={{fontFamily: 'inherit'}}>🎨</span>
            </button>
            {formatPainter && (
              <span className="text-xs text-gray-500">Format copied! Click another cell to apply.</span>
            )}
            {/* Text color picker */}
            <div className="flex items-center gap-1 ml-3">
              {textColors.map(color => (
                <button
                  key={color}
                  className="w-5 h-5 rounded-full border-2 border-white shadow focus:outline-none"
                  style={{ background: color, outline: data[selectedCell[0]][selectedCell[1]].format?.color === color ? '2px solid #2563eb' : 'none' }}
                  title={`Text color ${color}`}
                  onClick={() => handleColorChange(selectedCell[0], selectedCell[1], 'color', color)}
                  type="button"
                />
              ))}
            </div>
            {/* BG color picker */}
            <div className="flex items-center gap-1 ml-3">
              {bgColors.map(color => (
                <button
                  key={color}
                  className="w-5 h-5 rounded-full border-2 border-white shadow focus:outline-none"
                  style={{ background: color, outline: data[selectedCell[0]][selectedCell[1]].format?.bg === color ? '2px solid #2563eb' : 'none' }}
                  title={`BG color ${color}`}
                  onClick={() => handleColorChange(selectedCell[0], selectedCell[1], 'bg', color)}
                  type="button"
                />
              ))}
            </div>
          </div>
        </div>
      )}
      <table className="table-auto border-collapse w-full text-sm select-none">
        <thead className="sticky top-0 z-10 bg-gray-100">
          <tr>
            <th className="border-b-2 border-gray-200 px-6 py-3 bg-gray-50 font-bold text-center text-gray-400 text-base tracking-wide w-12">#</th>
            {columnNames.map((name, i) =>
              !hiddenCols.includes(i) && (
                <th key={i} className="border-b-2 border-gray-200 px-6 py-3 bg-gray-50 font-bold text-center text-gray-700 text-base tracking-wide relative group select-none">
                  <input
                    value={name}
                    onChange={e => {
                      const updated = [...columnNames];
                      updated[i] = e.target.value;
                      setColumnNames(updated);
                    }}
                    className="text-center font-bold bg-transparent border-b-2 border-gray-300 focus:border-blue-400 outline-none w-24 mx-auto text-base tracking-wide py-1"
                    style={{ background: 'transparent' }}
                  />
                  <span
                    className="inline-flex items-center gap-1 cursor-pointer hover:text-blue-600"
                    onClick={() => onSort(i)}
                  >
                    {columnIcons[i] || null}
                    {name}
                    {sortConfig?.col === i && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => deleteColumn(i)}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    title="Delete column"
                  >×</button>
                </th>
              )
            )}
            <th className="border-b-2 border-gray-200 px-2 py-2 bg-gray-50 text-center">
              <button onClick={addNewColumn} className="w-7 h-7 rounded-full bg-green-500 hover:bg-green-600 text-white font-bold text-lg flex items-center justify-center shadow transition">+</button>
            </th>
          </tr>
          <tr>
            <th className="border-b border-gray-100 px-2 py-1 bg-gray-50"></th>
            {columns.map((_, i) =>
              !hiddenCols.includes(i) && (
                <th key={i} className="border-b border-gray-100 px-2 py-1 bg-gray-50">
                  <input
                    type="text"
                    value={columnFilters[i] || ''}
                    onChange={e => onFilterChange(i, e.target.value)}
                    className="w-full px-2 py-1 rounded bg-white border border-gray-200 text-xs focus:ring focus:ring-blue-200"
                    placeholder="Filter..."
                  />
                </th>
              )
            )}
            <th className="border-b border-gray-100 px-2 py-1 bg-gray-50"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((rowData, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              <td className="border-b border-gray-100 px-6 py-3 bg-gray-50 font-bold text-center text-gray-400 text-base tracking-wide relative group">
                {rowIndex + 1}
                <button
                  onClick={() => deleteRow(rowIndex)}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  title="Delete row"
                >×</button>
              </td>
              {rowData.map((cell, colIndex) =>
                !hiddenCols.includes(colIndex) && (
                  <td
                    key={colIndex}
                    className={`border-b border-gray-100 px-6 py-3 align-middle relative transition-colors duration-100 ${
                      selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex
                        ? 'bg-yellow-50 ring-2 ring-yellow-300 z-10'
                        : isCellSelected(rowIndex, colIndex)
                        ? 'bg-blue-100/50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      if (formatPainter) {
                        applyFormat(rowIndex, colIndex);
                      } else {
                        setSelectedCell([rowIndex, colIndex]);
                      }
                    }}
                    onMouseDown={() => handleCellMouseDown(rowIndex, colIndex)}
                    onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                    style={{ cursor: formatPainter ? 'crosshair' : 'pointer' }}
                  >
                    {/* Render colored tags for status/priority, links, or default input */}
                    {colIndex === 2 && statusColors[cell.value] ? (
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[cell.value]}`}>{cell.value}</span>
                    ) : colIndex === 6 && priorityColors[cell.value] ? (
                      <span className={`font-semibold ${priorityColors[cell.value]}`}>{cell.value}</span>
                    ) : colIndex === 4 && cell.value.startsWith('www.') ? (
                      <a href={`https://${cell.value}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{cell.value}</a>
                    ) : colIndex === 5 && cell.value ? (
                      <span className="inline-flex items-center gap-1"><span className="bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-700">{cell.value[0]}</span> {cell.value}</span>
                    ) : (
                      <input
                        ref={el => {
                          if (!inputRefs.current[rowIndex]) inputRefs.current[rowIndex] = [];
                          inputRefs.current[rowIndex][colIndex] = el;
                        }}
                        value={cell.value}
                        onChange={(e) => handleChange(rowIndex, colIndex, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                        className="w-full bg-transparent outline-none"
                        style={{
                          fontWeight: cell.format?.bold ? 'bold' : 'normal',
                          fontStyle: cell.format?.italic ? 'italic' : 'normal',
                          color: cell.format?.color || undefined,
                          background: cell.format?.bg || undefined,
                        }}
                      />
                    )}
                  </td>
                )
              )}
              <td className="border-b px-2 py-2 text-center">
                {rowIndex === data.length - 1 && (
                  <button onClick={addNewRow} className="w-7 h-7 rounded-full bg-green-500 hover:bg-green-600 text-white font-bold text-lg flex items-center justify-center shadow transition">+</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Spreadsheet;
