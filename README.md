# React Spreadsheet App

Hey there! 👋 This is my React spreadsheet project that I built while learning React and TypeScript. It's basically like Google Sheets but simpler and more focused on the core features I actually use.

## What's in here?

So I started with a basic spreadsheet and kept adding features as I needed them:

- **Basic spreadsheet stuff**: Add/edit cells, navigate with arrow keys, all that jazz
- **Formatting**: Bold, italic, text colors, background colors - the usual suspects
- **Toolbar with dropdowns**: Because who likes cluttered interfaces?
- **Hide/show columns**: When you have too many columns and just want to focus
- **Sorting**: Click any column header to sort (ascending/descending)
- **Search**: Find stuff quickly without scrolling forever
- **Format painter**: Copy formatting from one cell to another (like in Excel)
- **Undo/Redo**: Because mistakes happen
- **Export/Import**: Save your work as Excel files
- **Data stats**: See how much of your spreadsheet is actually filled

## Getting it running

```bash
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

## Tech stack

- React 18
- TypeScript (because JavaScript wasn't confusing enough)
- Tailwind CSS (for styling)
- Vite (for fast builds)
- XLSX library (for Excel file handling)

## Features breakdown

### Toolbar
The toolbar has these dropdown menus:
- **Tool bar**: Quick actions like undo/redo, add rows, clear data
- **Hide fields**: Toggle column visibility with checkboxes
- **Sort**: Choose any column to sort by
- **Search**: Real-time search across all cells

### Spreadsheet
- Click any cell to edit
- Use arrow keys to navigate
- Tab to move right, Shift+Tab to move left
- Enter to move down
- Format painter: Click the 🎨 button, then click another cell to copy formatting

### Data management
- Add/delete rows and columns
- Export to Excel (.xlsx)
- Import from Excel files
- Clear all data (with confirmation)

## Project structure

```
src/
├── components/
│   ├── Spreadsheet.tsx    # Main spreadsheet component
│   ├── Toolbar.tsx        # Toolbar with all the buttons
│   └── Tabs.tsx          # Tab component (for future use)
├── App.tsx               # Main app component
└── main.tsx             # Entry point
```

## What I learned

Building this helped me understand:
- React hooks (useState, useEffect, useRef)
- TypeScript interfaces and types
- Component composition
- State management
- File handling in the browser
- CSS Grid and Flexbox for layouts

## Future ideas

- Add formulas (like =SUM(A1:A10))
- Charts and graphs
- Multiple sheets/tabs
- Real-time collaboration
- Auto-save to localStorage
- More formatting options (borders, alignment, etc.)

## Screenshots

(Add some screenshots here when you have them)

---

Built with ❤️ and lots of coffee ☕

Feel free to fork this and make it your own!