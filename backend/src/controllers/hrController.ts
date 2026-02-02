import { Request, Response } from 'express';

export const listEmployees = (_req: Request, res: Response) => {
  const employees = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      visa: 'F1 (OPT)',
    },
    {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@example.com',
      visa: 'H1-B',
    },
  ];

  res.json({
    ok: true,
    employees,
  });
};
