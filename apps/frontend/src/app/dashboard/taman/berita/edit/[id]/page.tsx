"use client";

import React from "react";
import { useParams } from "next/navigation";
import { MediumStyleArtikelPage } from "../../../../../../components/artikel/MediumStyleArtikelPage";

export default function EditArtikelPage() {
  const params = useParams();
  const id = params?.id as string;

  // Medium-style editor is full-page, no need for DashboardLayout wrapper
  return <MediumStyleArtikelPage articleId={id} mode="edit" />;
}
