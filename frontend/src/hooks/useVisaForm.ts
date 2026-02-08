import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { visaSchema, type VisaFormValues } from "../pages/employee/visa.schema";
import type { BaseDocument } from "../types/document";


export function useVisaForm(documents: BaseDocument[], loading: boolean) {
  const methods = useForm<VisaFormValues>({
    resolver: zodResolver(visaSchema),
    defaultValues: {},
    mode: "onTouched",
  });

  const { setValue, getValues } = methods;

  useEffect(() => {
    if (!loading) {
      documents.forEach((d) => {
        if (d.fileName) {
          setValue(d.type as keyof VisaFormValues, true, {
            shouldDirty: false,
            shouldTouch: false,
            shouldValidate: false,
          });
        }
      });
    }
  }, [loading, documents, setValue]);

  const isUploaded = (type: keyof VisaFormValues) => {
    const v = getValues(type);
    return !!v;
  };

  return {
    ...methods,
    isUploaded,
  };
}
