'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

interface InteractiveOnboardingTourProps {
  run: boolean;
  onFinish: () => void;
}

// Helper function to wait for element to be available
const waitForElement = (selector: string, timeout = 5000): Promise<Element | null> => {
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

export function InteractiveOnboardingTour({ run, onFinish }: InteractiveOnboardingTourProps) {
  const router = useRouter();
  const pathname = usePathname();
  const driverRef = useRef<any>(null);
  const isInitializedRef = useRef(false);
  const currentStepRef = useRef(0);
  const isNavigatingRef = useRef(false); // Track if we're in the middle of programmatic navigation
  const TOUR_STEP_KEY = 'onboarding_current_step';

  // Save current step to localStorage
  const saveCurrentStep = (step: number) => {
    currentStepRef.current = step;
    localStorage.setItem(TOUR_STEP_KEY, String(step));
    console.log('[Tour] Saved step:', step);
  };

  // Get saved step from localStorage
  const getSavedStep = (): number => {
    const saved = localStorage.getItem(TOUR_STEP_KEY);
    return saved ? parseInt(saved, 10) : 0;
  };

  useEffect(() => {
    if (!run) {
      // Clean up driver when not running
      if (driverRef.current) {
        driverRef.current.destroy();
        driverRef.current = null;
        isInitializedRef.current = false;
      }
      localStorage.removeItem(TOUR_STEP_KEY);
      return;
    }

    console.log('[Tour] useEffect run, driverRef exists:', !!driverRef.current, 'isInitialized:', isInitializedRef.current);

    // Check if we have a saved step, which means tour was in progress
    const savedStep = getSavedStep();
    
    // Create driver only if it doesn't exist
    if (!driverRef.current) {
      isInitializedRef.current = true;
      console.log('[Tour] Creating new driver, savedStep:', savedStep);

    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      animate: true,
      allowClose: true,
      
      // Prevent auto-restart on element not found
      disableActiveInteraction: false,
      
      // Custom callbacks to handle missing elements gracefully
      onPopoverRender: (popover, { config, state }) => {
        console.log('[Tour] Rendering step:', state.activeIndex);
        // Save current step every time popover is rendered
        saveCurrentStep(state.activeIndex);
      },
      
      onHighlighted: (element, step, options) => {
        console.log('[Tour] Highlighted step:', options.state.activeIndex, 'Element:', element);
        // Save current step every time a step is highlighted
        saveCurrentStep(options.state.activeIndex);
      },
      
      steps: [
        // Step 1: Welcome & Introduction
        {
          element: 'body',
          popover: {
            title: '🎉 Selamat Datang di Taman Kehati!',
            description: `
              <div style="font-size: 15px; line-height: 1.8;">
                <p style="margin-bottom: 12px;">
                  Terima kasih telah bergabung sebagai <strong>Regional Admin</strong>! 
                </p>
                <p style="margin-bottom: 12px;">
                  Kami akan memandu Anda untuk mengenal sistem ini:
                </p>
                <ul style="list-style: none; padding-left: 0; margin: 12px 0;">
                  <li style="margin-bottom: 8px;">✅ Membuat taman (lokasi konservasi)</li>
                  <li style="margin-bottom: 8px;">✅ Menambahkan data flora</li>
                  <li style="margin-bottom: 8px;">✅ Menambahkan data fauna</li>
                  <li style="margin-bottom: 8px;">✅ Mencatat kegiatan lapangan</li>
                </ul>
                <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 12px; margin-top: 16px; border-radius: 4px;">
                  <p style="margin: 0; color: #1e40af; font-size: 14px;">
                    💡 <strong>Panduan interaktif</strong> - Klik "Selanjutnya" untuk memulai!
                  </p>
                </div>
              </div>
            `,
            side: 'center',
            align: 'center',
          },
        },

        // Step 2: Navigate to Taman
        {
          element: '[data-tour="nav-taman"]',
          popover: {
            title: '🌳 Langkah 1: Menu Taman',
            description: `
              <div style="font-size: 15px; line-height: 1.8;">
                <p style="margin-bottom: 12px;">
                  Hal pertama yang perlu Anda lakukan adalah <strong>membuat taman</strong>. 
                  Taman adalah lokasi/kawasan konservasi tempat data flora, fauna, dan kegiatan Anda berada.
                </p>
                <div style="background-color: #dcfce7; padding: 12px; border-radius: 6px; border-left: 4px solid #16a34a; margin-top: 12px;">
                  <p style="margin: 0; color: #166534; font-size: 14px;">
                    ✅ Klik "Selanjutnya" untuk melihat form pembuatan taman
                  </p>
                </div>
              </div>
            `,
            side: 'right',
            align: 'start',
            onNextClick: async () => {
              console.log('[Tour] Navigating to Taman');
              isNavigatingRef.current = true; // Set flag before navigation
              router.push('/dashboard/taman');
              // Wait for the form to be available before moving to next step
              await waitForElement('[data-tour="taman-form"]', 5000);
              setTimeout(() => {
                if (driverRef.current) {
                  console.log('[Tour] Moving to next step after Taman navigation');
                  driverRef.current.moveNext();
                  isNavigatingRef.current = false; // Clear flag after navigation completes
                }
              }, 300);
            },
          },
        },

        // Step 3: Form Taman (auto-opened)
        {
          element: '[data-tour="taman-form"]',
          popover: {
            title: '📝 Formulir Pembuatan Taman',
            description: `
              <div style="font-size: 15px; line-height: 1.8;">
                <p style="margin-bottom: 12px;">
                  Ini adalah <strong>form untuk membuat taman baru</strong>. Anda perlu mengisi:
                </p>
                <ul style="list-style: disc; margin-left: 20px; margin-bottom: 12px;">
                  <li><strong>Nama Taman</strong> - Nama resmi taman (wajib)</li>
                  <li><strong>Deskripsi</strong> - Penjelasan singkat</li>
                  <li><strong>Lokasi</strong> - Provinsi, Kabupaten, dll</li>
                  <li><strong>Detail lainnya</strong> - SK Penetapan, Pengelola, dll</li>
                </ul>
                <div style="background-color: #fef3c7; padding: 12px; border-radius: 6px; border-left: 4px solid #f59e0b; margin-top: 12px;">
                  <p style="margin: 0; color: #92400e; font-size: 14px;">
                    💡 Minimal isi <strong>Nama Taman</strong>, lalu scroll ke bawah dan klik tombol hijau <strong>"Submit untuk Review"</strong>
                  </p>
                </div>
                <p style="margin-top: 12px; font-size: 13px; color: #6b7280; font-style: italic;">
                  Setelah submit taman, klik "Selanjutnya" untuk lanjut ke Flora...
                </p>
              </div>
            `,
            side: 'left',
            align: 'start',
          },
          onHighlightStarted: async () => {
            // Wait for the form element to be available
            await waitForElement('[data-tour="taman-form"]', 3000);
          },
        },

        // Step 4: Navigate to Flora
        {
          element: '[data-tour="nav-flora"]',
          popover: {
            title: '🌿 Langkah 2: Menu Flora',
            description: `
              <div style="font-size: 15px; line-height: 1.8;">
                <p style="margin-bottom: 12px;">
                  Sekarang mari kita lihat cara menambahkan data <strong>Flora</strong> (tumbuhan).
                </p>
                <div style="background-color: #dcfce7; padding: 12px; border-radius: 6px; border-left: 4px solid #16a34a;">
                  <p style="margin: 0; color: #166534; font-size: 14px;">
                    ✅ Klik "Selanjutnya" untuk membuka halaman Flora
                  </p>
                </div>
              </div>
            `,
            side: 'right',
            align: 'start',
            onNextClick: async () => {
              console.log('[Tour] Navigating to Flora');
              isNavigatingRef.current = true;
              router.push('/dashboard/taman/flora');
              await waitForElement('[data-tour="add-flora-button"]', 5000);
              setTimeout(() => {
                if (driverRef.current) {
                  console.log('[Tour] Moving to next step after Flora navigation');
                  driverRef.current.moveNext();
                  isNavigatingRef.current = false;
                }
              }, 300);
            },
          },
        },

        // Step 5: Flora Page
        {
          element: '[data-tour="add-flora-button"]',
          popover: {
            title: '🌱 Mengelola Data Flora',
            description: `
              <div style="font-size: 15px; line-height: 1.8;">
                <p style="margin-bottom: 12px;">
                  Di halaman ini Anda dapat mengelola data flora:
                </p>
                <ul style="list-style: disc; margin-left: 20px; margin-bottom: 12px;">
                  <li>Melihat semua data flora</li>
                  <li>Menambah spesies flora baru</li>
                  <li>Upload foto flora</li>
                  <li>Mencatat status konservasi</li>
                </ul>
                <div style="background-color: #dcfce7; padding: 12px; border-radius: 6px; border-left: 4px solid #16a34a; margin-top: 12px;">
                  <p style="margin: 0; color: #166534; font-size: 14px;">
                    💡 Klik tombol <strong>"Tambah Flora"</strong> di atas, lalu isi form untuk menambah data flora
                  </p>
                </div>
              </div>
            `,
            side: 'bottom',
            align: 'start',
          },
          onHighlightStarted: async () => {
            await waitForElement('[data-tour="add-flora-button"]', 3000);
          },
        },

        // Step 6: Navigate to Fauna
        {
          element: '[data-tour="nav-fauna"]',
          popover: {
            title: '🦜 Langkah 3: Menu Fauna',
            description: `
              <div style="font-size: 15px; line-height: 1.8;">
                <p style="margin-bottom: 12px;">
                  Selanjutnya, mari kita lihat halaman <strong>Fauna</strong> (hewan).
                </p>
                <div style="background-color: #dcfce7; padding: 12px; border-radius: 6px; border-left: 4px solid #16a34a;">
                  <p style="margin: 0; color: #166534; font-size: 14px;">
                    ✅ Klik "Selanjutnya" untuk membuka halaman Fauna
                  </p>
                </div>
              </div>
            `,
            side: 'right',
            align: 'start',
            onNextClick: async () => {
              console.log('[Tour] Navigating to Fauna');
              isNavigatingRef.current = true;
              router.push('/dashboard/taman/fauna');
              await waitForElement('[data-tour="add-fauna-button"]', 5000);
              setTimeout(() => {
                if (driverRef.current) {
                  console.log('[Tour] Moving to next step after Fauna navigation');
                  driverRef.current.moveNext();
                  isNavigatingRef.current = false;
                }
              }, 300);
            },
          },
        },

        // Step 7: Fauna Page
        {
          element: '[data-tour="add-fauna-button"]',
          popover: {
            title: '🐾 Mengelola Data Fauna',
            description: `
              <div style="font-size: 15px; line-height: 1.8;">
                <p style="margin-bottom: 12px;">
                  Halaman Fauna berfungsi sama seperti Flora:
                </p>
                <ul style="list-style: disc; margin-left: 20px; margin-bottom: 12px;">
                  <li>Dokumentasikan spesies hewan</li>
                  <li>Upload foto fauna</li>
                  <li>Catat status konservasi</li>
                  <li>Kelola informasi habitat & populasi</li>
                </ul>
                <div style="background-color: #dbeafe; padding: 12px; border-radius: 6px; border-left: 4px solid #3b82f6; margin-top: 12px;">
                  <p style="margin: 0; color: #1e40af; font-size: 14px;">
                    💡 Klik <strong>"Tambah Fauna"</strong> untuk menambah data fauna
                  </p>
                </div>
              </div>
            `,
            side: 'bottom',
            align: 'start',
          },
          onHighlightStarted: async () => {
            await waitForElement('[data-tour="add-fauna-button"]', 3000);
          },
        },

        // Step 8: Navigate to Activities
        {
          element: '[data-tour="nav-kegiatan"]',
          popover: {
            title: '📅 Langkah 4: Menu Kegiatan',
            description: `
              <div style="font-size: 15px; line-height: 1.8;">
                <p style="margin-bottom: 12px;">
                  Terakhir, mari lihat halaman <strong>Kegiatan</strong>.
                </p>
                <div style="background-color: #dcfce7; padding: 12px; border-radius: 6px; border-left: 4px solid #16a34a;">
                  <p style="margin: 0; color: #166534; font-size: 14px;">
                    ✅ Klik "Selanjutnya" untuk membuka halaman Kegiatan
                  </p>
                </div>
              </div>
            `,
            side: 'right',
            align: 'start',
            onNextClick: async () => {
              console.log('[Tour] Navigating to Activities');
              isNavigatingRef.current = true;
              router.push('/dashboard/taman/activities');
              await waitForElement('[data-tour="add-activity-button"]', 5000);
              setTimeout(() => {
                if (driverRef.current) {
                  console.log('[Tour] Moving to next step after Activities navigation');
                  driverRef.current.moveNext();
                  isNavigatingRef.current = false;
                }
              }, 300);
            },
          },
        },

        // Step 9: Activities Page
        {
          element: '[data-tour="add-activity-button"]',
          popover: {
            title: '🗓️ Mengelola Kegiatan',
            description: `
              <div style="font-size: 15px; line-height: 1.8;">
                <p style="margin-bottom: 12px;">
                  Di halaman Kegiatan, Anda dapat mencatat aktivitas lapangan:
                </p>
                <ul style="list-style: disc; margin-left: 20px; margin-bottom: 12px;">
                  <li>Survei keanekaragaman hayati</li>
                  <li>Monitoring flora/fauna</li>
                  <li>Kegiatan konservasi</li>
                  <li>Penelitian lapangan</li>
                </ul>
                <div style="background-color: #dcfce7; padding: 12px; border-radius: 6px; border-left: 4px solid #16a34a; margin-top: 12px;">
                  <p style="margin: 0; color: #166534; font-size: 14px;">
                    💡 Klik <strong>"Tambah Kegiatan"</strong> untuk mencatat kegiatan baru
                  </p>
                </div>
              </div>
            `,
            side: 'bottom',
            align: 'start',
          },
          onHighlightStarted: async () => {
            await waitForElement('[data-tour="add-activity-button"]', 3000);
          },
        },

        // Step 10: Final - Completion
        {
          element: 'body',
          popover: {
            title: '🎉 Panduan Selesai!',
            description: `
              <div style="font-size: 15px; line-height: 1.8;">
                <p style="margin-bottom: 16px; font-size: 17px; font-weight: 600; color: #16a34a;">
                  Selamat! Anda sudah menyelesaikan panduan onboarding!
                </p>
                <p style="margin-bottom: 16px;">
                  Anda sekarang tahu cara:
                </p>
                <div style="display: grid; gap: 8px; margin: 12px 0;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="color: #16a34a; font-size: 20px;">✅</span>
                    <span>Membuat dan mengelola taman</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="color: #16a34a; font-size: 20px;">✅</span>
                    <span>Menambahkan data flora</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="color: #16a34a; font-size: 20px;">✅</span>
                    <span>Menambahkan data fauna</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="color: #16a34a; font-size: 20px;">✅</span>
                    <span>Mencatat kegiatan lapangan</span>
                  </div>
                </div>
                <div style="background-color: #dbeafe; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6; margin-top: 20px;">
                  <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: 600;">📝 Catatan Penting:</p>
                  <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                    Semua data yang Anda submit akan berstatus <strong>"Draft"</strong> dan perlu disetujui oleh Super Admin sebelum dipublikasikan.
                  </p>
                </div>
                <p style="margin-top: 20px; text-align: center; font-size: 16px;">
                  <strong>Selamat bekerja! 🚀</strong>
                </p>
              </div>
            `,
            side: 'center',
            align: 'center',
          },
        },
      ],
      onDestroyed: () => {
        console.log('[Tour] onDestroyed called');
        driverRef.current = null;
        isInitializedRef.current = false;
        localStorage.removeItem(TOUR_STEP_KEY);
        onFinish();
      },
      onCloseClick: () => {
        const confirmed = confirm('Apakah Anda yakin ingin menutup tutorial? Anda dapat menjalankan ulang tutorial dari menu Panduan.');
        if (confirmed && driverRef.current) {
          console.log('[Tour] User closed tour');
          driverRef.current.destroy();
          driverRef.current = null;
          isInitializedRef.current = false;
          localStorage.removeItem(TOUR_STEP_KEY);
          onFinish();
        }
      },
      // Custom styling
      popoverClass: 'interactive-onboarding-tour',
      progressText: 'Langkah {{current}} dari {{total}}',
      nextBtnText: 'Selanjutnya →',
      prevBtnText: '← Kembali',
      doneBtnText: 'Selesai ✓',
      closeBtnText: 'Tutup',
    });

      // Store driver instance in ref
      driverRef.current = driverObj;

      // Start the tour from saved step (or beginning if no saved step)
      console.log('[Tour] Starting tour from step:', savedStep);
      driverObj.drive(savedStep);
    } else if (driverRef.current && savedStep > 0 && !isNavigatingRef.current) {
      // Driver exists but we're on a different page - ensure we're at the right step
      // Only do this if we're not in the middle of programmatic navigation
      console.log('[Tour] Driver exists, checking if we need to move to step:', savedStep);
      const currentStep = driverRef.current.getActiveIndex?.() ?? 0;
      if (currentStep !== savedStep) {
        console.log('[Tour] Moving to saved step:', savedStep, 'from current:', currentStep);
        // Try to move to the saved step
        setTimeout(() => {
          if (driverRef.current && !isNavigatingRef.current) {
            try {
              driverRef.current.drive(savedStep);
            } catch (e) {
              console.warn('[Tour] Error moving to saved step:', e);
            }
          }
        }, 300);
      }
    }
    
    // Re-run when pathname changes to handle page navigation
  }, [run, pathname]);

  return null;
}

