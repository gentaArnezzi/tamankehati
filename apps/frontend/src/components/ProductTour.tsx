"use client";

import React, { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

interface ProductTourProps {
  run: boolean;
  onFinish: () => void;
}

export function ProductTour({ run, onFinish }: ProductTourProps) {
  useEffect(() => {
    if (!run) return;

    const driverObj = driver({
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      steps: [
        {
          element: "body",
          popover: {
            title: "🎉 Selamat Datang di Dashboard Regional Admin!",
            description:
              "Mari kami tunjukkan cara menggunakan dashboard untuk mengelola data taman, flora, fauna, dan kegiatan Anda.",
            side: "center",
            align: "center",
          },
        },
        {
          element: '[data-tour="stats-card-taman"]',
          popover: {
            title: "📊 Statistik Taman",
            description:
              "Kartu ini menampilkan jumlah total taman yang Anda kelola. Klik menu <strong>Taman</strong> di sidebar untuk menambah taman baru.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: '[data-tour="stats-card-flora"]',
          popover: {
            title: "🌿 Statistik Flora",
            description:
              "Menampilkan jumlah spesies flora yang telah Anda dokumentasikan. Gunakan menu <strong>Flora</strong> untuk menambah data flora baru.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: '[data-tour="stats-card-fauna"]',
          popover: {
            title: "🦜 Statistik Fauna",
            description:
              "Menampilkan jumlah spesies fauna yang telah Anda dokumentasikan. Gunakan menu <strong>Fauna</strong> untuk menambah data fauna baru.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: '[data-tour="stats-card-kegiatan"]',
          popover: {
            title: "📅 Statistik Kegiatan",
            description:
              "Menampilkan jumlah kegiatan lapangan yang telah Anda catat. Gunakan menu <strong>Kegiatan</strong> untuk menambah kegiatan baru.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: '[data-tour="nav-taman"]',
          popover: {
            title: "🌳 Menu Taman",
            description: `
              <p>Klik menu ini untuk:</p>
              <ul style="list-style: disc; margin-left: 20px; margin-top: 8px;">
                <li>Melihat daftar taman yang Anda kelola</li>
                <li>Menambah taman baru dengan tombol <strong>+ Taman Baru</strong></li>
                <li>Mengedit atau menghapus taman yang sudah ada</li>
              </ul>
            `,
            side: "right",
            align: "start",
          },
        },
        {
          element: '[data-tour="nav-flora"]',
          popover: {
            title: "🌿 Menu Flora",
            description: `
              <p>Klik menu ini untuk:</p>
              <ul style="list-style: disc; margin-left: 20px; margin-top: 8px;">
                <li>Melihat daftar flora yang telah didokumentasikan</li>
                <li>Menambah data flora baru</li>
                <li>Upload foto dan informasi lengkap flora</li>
                <li>Mengelola status konservasi</li>
              </ul>
            `,
            side: "right",
            align: "start",
          },
        },
        {
          element: '[data-tour="nav-fauna"]',
          popover: {
            title: "🦜 Menu Fauna",
            description: `
              <p>Klik menu ini untuk:</p>
              <ul style="list-style: disc; margin-left: 20px; margin-top: 8px;">
                <li>Melihat daftar fauna yang telah didokumentasikan</li>
                <li>Menambah data fauna baru</li>
                <li>Upload foto dan informasi lengkap fauna</li>
                <li>Mengelola status konservasi</li>
              </ul>
            `,
            side: "right",
            align: "start",
          },
        },
        {
          element: '[data-tour="nav-kegiatan"]',
          popover: {
            title: "📅 Menu Kegiatan",
            description: `
              <p>Klik menu ini untuk:</p>
              <ul style="list-style: disc; margin-left: 20px; margin-top: 8px;">
                <li>Melihat daftar kegiatan lapangan</li>
                <li>Menambah kegiatan baru</li>
                <li>Mencatat lokasi dan tanggal kegiatan</li>
                <li>Upload dokumentasi kegiatan</li>
              </ul>
            `,
            side: "right",
            align: "start",
          },
        },
        {
          element: "body",
          popover: {
            title: "✅ Anda Siap Memulai!",
            description: `
              <p>Sekarang Anda dapat mulai mengelola data taman, flora, fauna, dan kegiatan. Jika Anda memerlukan bantuan, klik tombol <strong>Panduan</strong> kapan saja untuk melihat tour ini lagi.</p>
              <div style="background-color: #dbeafe; border: 1px solid #93c5fd; border-radius: 8px; padding: 12px; margin-top: 12px;">
                <p style="margin: 0; color: #1e40af; font-size: 14px;">
                  <strong>💡 Tips:</strong> Semua data yang Anda input akan menunggu persetujuan dari Super Admin sebelum dipublikasikan.
                </p>
              </div>
            `,
            side: "center",
            align: "center",
          },
        },
      ],
      onDestroyed: () => {
        onFinish();
      },
      onCloseClick: () => {
        driverObj.destroy();
        onFinish();
      },
      // Custom styling
      popoverClass: "product-tour-popover",
      progressText: "Langkah {{current}} dari {{total}}",
      nextBtnText: "Selanjutnya",
      prevBtnText: "Kembali",
      doneBtnText: "Selesai",
      closeBtnText: "Tutup",
    });

    driverObj.drive();

    // Cleanup on unmount
    return () => {
      if (driverObj) {
        driverObj.destroy();
      }
    };
  }, [run, onFinish]);

  return null;
}
