import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

export default function EmployeeProfiles() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    async function load() {
      const resp = await api.get('/hr/employees');
      if (resp.data.ok) setRows(resp.data.employees);
    }
    load();
  }, []);

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Visa</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((r: any) => (
          <TableRow key={r._id}>
            <TableCell>{r.firstName} {r.lastName}</TableCell>
            <TableCell>{r.email}</TableCell>
            <TableCell>{r.visa}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
