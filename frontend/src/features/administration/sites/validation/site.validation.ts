import { z } from "zod";

export const siteSchema = z.object({
  codeSite: z.string().min(1, "Le code site est requis"),
  nomSite: z.string().min(2, "Le libellé est requis"),
  description: z.string().optional(),
  address: z.string().optional(),
  idSiteParent: z.string().optional().nullable(),
});

export type SiteFormValues = z.infer<typeof siteSchema>;
