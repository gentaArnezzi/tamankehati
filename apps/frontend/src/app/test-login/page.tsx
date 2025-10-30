"use client";

import React, { useState } from "react";

export default function TestLoginPage() {
  const [result, setResult] = useState("");
  const base =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://tamankehati-backend-pxnu.onrender.com";

  const runTest = async () => {
    try {
      const dashboardResponse = await fetch(base + "/api/v1/dashboard", {
        credentials: "include",
      });

      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        setResult(
          (prev) =>
            prev + "\n[OK] Dashboard API! User: " + dashboardData.user_role,
        );
      } else {
        setResult(
          (prev) =>
            prev +
            "\n[FAIL] Dashboard API: " +
            String(dashboardResponse.status),
        );
      }
    } catch (e: any) {
      setResult((prev) => prev + "\n[ERROR] " + String(e?.message || e));
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>Test Login</h1>
      <button onClick={runTest}>Run Test</button>
      <pre style={{ whiteSpace: "pre-wrap" }}>{result}</pre>
    </div>
  );
}
