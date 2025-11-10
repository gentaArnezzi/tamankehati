"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import "../styles/onboarding-tour.css";
import {
  ELEMENT_WAIT_TIMEOUT_MS,
  FORM_ELEMENT_WAIT_TIMEOUT_MS,
  NAVIGATION_DELAY_MS,
  ONBOARDING_CURRENT_STEP_KEY,
} from "../lib/constants";

interface InteractiveOnboardingTourProps {
  run: boolean;
  onFinish: () => void;
}

// Helper function to wait for element to be available
const waitForElement = (
  selector: string,
  timeout = ELEMENT_WAIT_TIMEOUT_MS,
): Promise<Element | null> => {
  return new Promise((resolve) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Timeout fallback
    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
};

export function InteractiveOnboardingTour({
  run,
  onFinish,
}: InteractiveOnboardingTourProps) {
  const router = useRouter();
  const pathname = usePathname();
  const driverRef = useRef<any>(null);
  const isInitializedRef = useRef(false);
  const currentStepRef = useRef(0);
  const isNavigatingRef = useRef(false); // Track if we're in the middle of programmatic navigation
  const onFinishCalledRef = useRef(false); // Prevent multiple calls to onFinish

  // Save current step to localStorage
  const saveCurrentStep = (step: number) => {
    currentStepRef.current = step;
    localStorage.setItem(ONBOARDING_CURRENT_STEP_KEY, String(step));
  };

  // Get saved step from localStorage
  const getSavedStep = (): number => {
    const saved = localStorage.getItem(ONBOARDING_CURRENT_STEP_KEY);
    return saved ? parseInt(saved, 10) : 0;
  };

  useEffect(() => {
    if (!run) {
      // Clean up driver when not running
      if (driverRef.current) {
        try {
          if (typeof driverRef.current.destroy === 'function') {
            driverRef.current.destroy();
          }
        } catch (e) {
          console.error("[Tour] Error destroying driver during cleanup:", e);
        }
        driverRef.current = null;
        isInitializedRef.current = false;
      }
      localStorage.removeItem(ONBOARDING_CURRENT_STEP_KEY);
      onFinishCalledRef.current = false; // Reset flag when tour stops
      return;
    }

    // Reset flag when tour starts
    onFinishCalledRef.current = false;

    // Check if we have a saved step, which means tour was in progress
    const savedStep = getSavedStep();

    // Create driver only if it doesn't exist
    if (!driverRef.current) {
      isInitializedRef.current = true;

      const driverObj = driver({
        showProgress: true,
        showButtons: ["next", "previous", "close"],
        animate: true,
        allowClose: true,

        // Prevent auto-restart on element not found
        disableActiveInteraction: false,

        // Custom callbacks to handle missing elements gracefully
        onPopoverRender: (popover, { config, state }) => {
          // Save current step every time popover is rendered
          if (state.activeIndex !== undefined) {
            saveCurrentStep(state.activeIndex);
          }
          
          // Remove any arrow characters from button text
          setTimeout(() => {
            const nextButton = document.querySelector('.interactive-onboarding-tour .driver-popover-next-btn, .interactive-onboarding-tour .driver-popover-btn-next');
            if (nextButton) {
              const text = nextButton.textContent || '';
              // Remove common arrow characters: →, →, →, →, →
              const cleanText = text.replace(/[→→→→→]/g, '').trim();
              if (cleanText !== text) {
                nextButton.textContent = cleanText;
              }
            }
          }, 0);
        },

        onHighlighted: (element, step, options) => {
          // Save current step every time a step is highlighted
          if (options.state.activeIndex !== undefined) {
            saveCurrentStep(options.state.activeIndex);
          }
        },

        steps: [
          // Step 1: Welcome & Introduction
          {
            element: "body",
            popover: {
              title: "Selamat Datang di Taman Kehati",
              description: `
              <p>Terima kasih telah bergabung sebagai <strong>Regional Admin</strong>. Kami akan memandu Anda mengenal sistem manajemen konservasi ini.</p>
              
              <p>Yang akan Anda pelajari:</p>
              <ul>
                <li>Membuat taman (lokasi konservasi)</li>
                <li>Menambahkan data flora</li>
                <li>Menambahkan data fauna</li>
                <li>Mencatat kegiatan lapangan</li>
              </ul>
              
              <div style="background-color: #dbeafe;">
                <p style="margin: 0; color: #1a1a1a;">
                  <strong>Panduan Interaktif</strong> · Klik "Selanjutnya" untuk memulai perjalanan Anda
                </p>
              </div>
            `,
              align: "center",
            },
          },

          // Step 2: Navigate to Taman
          {
            element: '[data-tour="nav-taman"]',
            popover: {
              title: "Langkah 1 · Menu Taman",
              description: `
              <p>Hal pertama yang perlu Anda lakukan adalah <strong>membuat taman</strong>. Taman adalah lokasi/kawasan konservasi tempat data flora, fauna, dan kegiatan Anda berada.</p>
              
              <div style="background-color: #dcfce7;">
                <p style="margin: 0; color: #1a1a1a;">
                  Klik "Selanjutnya" untuk melihat form pembuatan taman
                </p>
              </div>
            `,
              side: "right",
              align: "start",
              onNextClick: async () => {
                isNavigatingRef.current = true; // Set flag before navigation
                router.push("/dashboard/taman");
                // Wait for the form to be available before moving to next step
                await waitForElement('[data-tour="taman-form"]', ELEMENT_WAIT_TIMEOUT_MS);
                setTimeout(() => {
                  if (driverRef.current && typeof driverRef.current.moveNext === 'function') {
                    try {
                      driverRef.current.moveNext();
                    } catch (e) {
                      console.error("[Tour] Error calling moveNext:", e);
                    }
                    isNavigatingRef.current = false; // Clear flag after navigation completes
                  }
                }, NAVIGATION_DELAY_MS);
              },
            },
          },

          // Step 3: Form Taman (auto-opened)
          {
            element: '[data-tour="taman-form"]',
            popover: {
              title: "Formulir Pembuatan Taman",
              description: `
              <p>Ini adalah <strong>form untuk membuat taman baru</strong>. Field yang perlu diisi:</p>
              
              <ul>
                <li><strong>Nama Taman</strong> — Nama resmi taman (wajib)</li>
                <li><strong>Deskripsi</strong> — Penjelasan singkat</li>
                <li><strong>Lokasi</strong> — Provinsi, Kabupaten, dll</li>
                <li><strong>Detail lainnya</strong> — SK Penetapan, Pengelola, dll</li>
              </ul>
              
              <div style="background-color: #fef3c7;">
                <p style="margin: 0; color: #1a1a1a;">
                  <strong>Tips:</strong> Minimal isi Nama Taman, lalu scroll ke bawah dan klik tombol "Submit untuk Review"
                </p>
              </div>
              
              <p style="font-size: 13px; color: #6b7280; font-style: italic; margin-top: 12px;">
                Setelah submit taman, klik "Selanjutnya" untuk lanjut ke Flora
              </p>
            `,
              side: "right",
              align: "start",
            },
            onHighlightStarted: async () => {
              // Wait for the form element to be available
              await waitForElement('[data-tour="taman-form"]', FORM_ELEMENT_WAIT_TIMEOUT_MS);
            },
          },

          // Step 4: Navigate to Flora
          {
            element: '[data-tour="nav-flora"]',
            popover: {
              title: "Langkah 2 · Menu Flora",
              description: `
              <p>Sekarang mari kita lihat cara menambahkan data <strong>Flora</strong> (tumbuhan).</p>
              
              <div style="background-color: #dcfce7;">
                <p style="margin: 0; color: #1a1a1a;">
                  Klik "Selanjutnya" untuk membuka halaman Flora
                </p>
              </div>
            `,
              side: "right",
              align: "start",
              onNextClick: async () => {
                isNavigatingRef.current = true;
                router.push("/dashboard/taman/flora");
                await waitForElement('[data-tour="add-flora-button"]', ELEMENT_WAIT_TIMEOUT_MS);
                setTimeout(() => {
                  if (driverRef.current && typeof driverRef.current.moveNext === 'function') {
                    try {
                      driverRef.current.moveNext();
                    } catch (e) {
                      console.error("[Tour] Error calling moveNext:", e);
                    }
                    isNavigatingRef.current = false;
                  }
                }, NAVIGATION_DELAY_MS);
              },
            },
          },

          // Step 5: Flora Page
          {
            element: '[data-tour="add-flora-button"]',
            popover: {
              title: "Mengelola Data Flora",
              description: `
              <p>Di halaman ini Anda dapat mengelola data flora:</p>
              
              <ul>
                <li>Melihat semua data flora</li>
                <li>Menambah spesies flora baru</li>
                <li>Upload foto flora</li>
                <li>Mencatat status konservasi</li>
              </ul>
              
              <div style="background-color: #dcfce7;">
                <p style="margin: 0; color: #1a1a1a;">
                  Klik tombol <strong>"Tambah Flora"</strong> di atas untuk menambah data flora
                </p>
              </div>
            `,
              side: "left",
              align: "center",
            },
            onHighlightStarted: async () => {
              await waitForElement('[data-tour="add-flora-button"]', FORM_ELEMENT_WAIT_TIMEOUT_MS);
            },
          },

          // Step 6: Navigate to Fauna
          {
            element: '[data-tour="nav-fauna"]',
            popover: {
              title: "Langkah 3 · Menu Fauna",
              description: `
              <p>Selanjutnya, mari kita lihat halaman <strong>Fauna</strong> (hewan).</p>
              
              <div style="background-color: #dcfce7;">
                <p style="margin: 0; color: #1a1a1a;">
                  Klik "Selanjutnya" untuk membuka halaman Fauna
                </p>
              </div>
            `,
              side: "right",
              align: "start",
              onNextClick: async () => {
                isNavigatingRef.current = true;
                router.push("/dashboard/taman/fauna");
                await waitForElement('[data-tour="add-fauna-button"]', ELEMENT_WAIT_TIMEOUT_MS);
                setTimeout(() => {
                  if (driverRef.current && typeof driverRef.current.moveNext === 'function') {
                    try {
                      driverRef.current.moveNext();
                    } catch (e) {
                      console.error("[Tour] Error calling moveNext:", e);
                    }
                    isNavigatingRef.current = false;
                  }
                }, NAVIGATION_DELAY_MS);
              },
            },
          },

          // Step 7: Fauna Page
          {
            element: '[data-tour="add-fauna-button"]',
            popover: {
              title: "Mengelola Data Fauna",
              description: `
              <p>Halaman Fauna berfungsi sama seperti Flora:</p>
              
              <ul>
                <li>Dokumentasikan spesies hewan</li>
                <li>Upload foto fauna</li>
                <li>Catat status konservasi</li>
                <li>Kelola informasi habitat & populasi</li>
              </ul>
              
              <div style="background-color: #dbeafe;">
                <p style="margin: 0; color: #1a1a1a;">
                  Klik <strong>"Tambah Fauna"</strong> untuk menambah data fauna
                </p>
              </div>
            `,
              side: "left",
              align: "center",
            },
            onHighlightStarted: async () => {
              await waitForElement('[data-tour="add-fauna-button"]', FORM_ELEMENT_WAIT_TIMEOUT_MS);
            },
          },

          // Step 8: Navigate to Activities
          {
            element: '[data-tour="nav-kegiatan"]',
            popover: {
              title: "Langkah 4 · Menu Kegiatan",
              description: `
              <p>Terakhir, mari lihat halaman <strong>Kegiatan</strong>.</p>
              
              <div style="background-color: #dcfce7;">
                <p style="margin: 0; color: #1a1a1a;">
                  Klik "Selanjutnya" untuk membuka halaman Kegiatan
                </p>
              </div>
            `,
              side: "right",
              align: "start",
              onNextClick: async () => {
                isNavigatingRef.current = true;
                router.push("/dashboard/taman/activities");
                await waitForElement('[data-tour="add-activity-button"]', ELEMENT_WAIT_TIMEOUT_MS);
                setTimeout(() => {
                  if (driverRef.current && typeof driverRef.current.moveNext === 'function') {
                    try {
                      driverRef.current.moveNext();
                    } catch (e) {
                      console.error("[Tour] Error calling moveNext:", e);
                    }
                    isNavigatingRef.current = false;
                  }
                }, NAVIGATION_DELAY_MS);
              },
            },
          },

          // Step 9: Activities Page
          {
            element: '[data-tour="add-activity-button"]',
            popover: {
              title: "Mengelola Kegiatan",
              description: `
              <p>Di halaman Kegiatan, Anda dapat mencatat aktivitas lapangan:</p>
              
              <ul>
                <li>Survei keanekaragaman hayati</li>
                <li>Monitoring flora/fauna</li>
                <li>Kegiatan konservasi</li>
                <li>Penelitian lapangan</li>
              </ul>
              
              <div style="background-color: #dcfce7;">
                <p style="margin: 0; color: #1a1a1a;">
                  Klik <strong>"Tambah Kegiatan"</strong> untuk mencatat kegiatan baru
                </p>
              </div>
            `,
              side: "left",
              align: "center",
            },
            onHighlightStarted: async () => {
              await waitForElement('[data-tour="add-activity-button"]', FORM_ELEMENT_WAIT_TIMEOUT_MS);
            },
          },

          // Step 10: Final - Completion
          {
            element: "body",
            popover: {
              title: "Panduan Selesai",
              description: `
              <p style="font-size: 17px; font-weight: 600; color: #16a34a; margin-bottom: 16px;">
                Selamat! Anda sudah menyelesaikan panduan onboarding.
              </p>
              
              <p>Anda sekarang siap untuk:</p>
              
              <ul>
                <li>Membuat dan mengelola taman</li>
                <li>Menambahkan data flora</li>
                <li>Menambahkan data fauna</li>
                <li>Mencatat kegiatan lapangan</li>
              </ul>
              
              <div style="background-color: #dbeafe;">
                <p style="margin: 0 0 8px 0; color: #1a1a1a; font-weight: 600;">
                  Catatan Penting
                </p>
                <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                  Semua data yang Anda submit akan berstatus <strong>"Draft"</strong> dan perlu disetujui oleh Super Admin sebelum dipublikasikan.
                </p>
              </div>
              
              <p style="margin-top: 20px; text-align: center; font-size: 16px; font-weight: 600;">
                Selamat bekerja!
              </p>
            `,
              align: "center",
            },
          },
        ],
        onDestroyed: () => {
          // Prevent multiple calls to onFinish
          if (onFinishCalledRef.current) {
            return;
          }
          onFinishCalledRef.current = true;
          
          try {
            if (driverRef.current && typeof driverRef.current.destroy === 'function') {
              driverRef.current.destroy();
            }
          } catch (e) {
            console.error("[Tour] Error in onDestroyed:", e);
          }
          driverRef.current = null;
          isInitializedRef.current = false;
          localStorage.removeItem(ONBOARDING_CURRENT_STEP_KEY);
          onFinish();
        },
        onCloseClick: () => {
          const confirmed = confirm(
            "Apakah Anda yakin ingin menutup tutorial? Anda dapat menjalankan ulang tutorial dari menu Panduan.",
          );
          if (confirmed && driverRef.current) {
            // Prevent multiple calls to onFinish
            if (onFinishCalledRef.current) {
              return;
            }
            onFinishCalledRef.current = true;
            
            try {
              if (typeof driverRef.current.destroy === 'function') {
                driverRef.current.destroy();
              }
            } catch (e) {
              console.error("[Tour] Error destroying driver:", e);
            }
            driverRef.current = null;
            isInitializedRef.current = false;
            localStorage.removeItem(ONBOARDING_CURRENT_STEP_KEY);
            onFinish();
          }
        },
        // Custom styling
        popoverClass: "interactive-onboarding-tour",
        progressText: "Langkah {{current}} dari {{total}}",
        nextBtnText: "Selanjutnya",
        prevBtnText: "Kembali",
        doneBtnText: "Selesai",
      });

      // Store driver instance in ref
      driverRef.current = driverObj;

      // Start the tour from saved step (or beginning if no saved step)
      try {
        if (typeof driverObj.drive === 'function') {
          driverObj.drive(savedStep);
        }
      } catch (e) {
        console.error("[Tour] Error starting tour:", e);
      }
    } else if (driverRef.current && savedStep > 0 && !isNavigatingRef.current) {
      // Driver exists but we're on a different page - ensure we're at the right step
      // Only do this if we're not in the middle of programmatic navigation
      let currentStep = 0;
      try {
        if (driverRef.current && typeof driverRef.current.getActiveIndex === 'function') {
          currentStep = driverRef.current.getActiveIndex() ?? 0;
        }
      } catch (e) {
        console.error("[Tour] Error getting active index:", e);
      }
      
      if (currentStep !== savedStep) {
        // Try to move to the saved step
        setTimeout(() => {
          if (driverRef.current && !isNavigatingRef.current) {
            try {
              if (typeof driverRef.current.drive === 'function') {
                driverRef.current.drive(savedStep);
              }
            } catch (e) {
              console.error("[Tour] Error moving to saved step:", e);
            }
          }
        }, NAVIGATION_DELAY_MS);
      }
    }

    // Re-run when pathname changes to handle page navigation
  }, [run, pathname]);

  return null;
}
