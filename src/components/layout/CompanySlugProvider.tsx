"use client";

import { createContext, useContext } from "react";

const CompanySlugContext = createContext<string>("");

type CompanySlugProviderProps = {
  companySlug: string;
  children: React.ReactNode;
};

export function CompanySlugProvider({ companySlug, children }: CompanySlugProviderProps) {
  return (
    <CompanySlugContext.Provider value={companySlug}>{children}</CompanySlugContext.Provider>
  );
}

export function useCompanySlug(): string {
  return useContext(CompanySlugContext);
}
