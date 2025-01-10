import React from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { IconButton } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const DataGridWithActions = ({ rows, columns, onEdit, onDelete }) => {
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "data.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      columns: columns.map(col => ({ header: col.headerName, dataKey: col.field })),
      body: rows,
    });
    doc.save("data.pdf");
  };

  const exportToCSV = () => {
    const csv = rows.map(row => 
      columns.map(col => row[col.field]).join(",")
    ).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, "data.csv");
  };

  const actionColumns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => onEdit(params.row)}>
            <Edit />
          </IconButton>
          <IconButton onClick={() => onDelete(params.row)}>
            <Delete />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <div style={{ height: 600, width: "100%" }}>
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <button onClick={exportToCSV}>Export to CSV</button>
        <button onClick={exportToExcel}>Export to Excel</button>
        <button onClick={exportToPDF}>Export to PDF</button>
      </div>
      <DataGrid
        rows={rows}
        columns={[...columns, ...actionColumns]}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
        components={{ Toolbar: GridToolbar }}
      />
    </div>
  );
};

export default DataGridWithActions;
