"use client";

import React from "react";
import { MediumStyleCreatePage } from "../../../../../components/artikel/MediumStyleCreatePage";

export default function CreateArtikelPage() {
  // Medium-style editor is full-page, no need for DashboardLayout wrapper
  return <MediumStyleCreatePage mode="create" />;
}
