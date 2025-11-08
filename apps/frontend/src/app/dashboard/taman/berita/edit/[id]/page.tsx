"use client";

import React from "react";
import { useParams } from "next/navigation";
import { MediumStyleCreatePage } from "../../../../../../components/artikel/MediumStyleCreatePage";

export default function EditArtikelPage() {
  const params = useParams();
  const id = params?.id as string;

  // Medium-style editor is full-page, no need for DashboardLayout wrapper
  return <MediumStyleCreatePage articleId={id} mode="edit" />;
}
