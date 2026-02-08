import { z } from "zod";

export const visaSchema = z.object({
  opt_receipt: z.boolean().optional(),
  opt_ead: z.boolean().optional(),
  i_983: z.boolean().optional(),
  i_20: z.boolean().optional(),
});

export type VisaFormValues = z.infer<typeof visaSchema>;
