"use client";

import React, { use } from "react";
import { MediumStyleArtikelPage } from "../../../../../../components/artikel/MediumStyleArtikelPage";

interface EditArtikelPageProps {
  params: Promise<{ id: string }>;
}

export default function EditArtikelPage({ params }: EditArtikelPageProps) {
  const { id } = use(params);

  // Medium-style editor is full-page, no need for DashboardLayout wrapper
  return <MediumStyleArtikelPage articleId={id} mode="edit" />;
}
