"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../lib/useAuth";

export function useNewUserDetection() {
  const { user } = useAuth();
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkIfNewUser() {
      if (!user || user.role !== "regional_admin") {
        setIsNewUser(false);
        setLoading(false);
        return;
      }

      // Check if tour has been completed before
      const tourCompleted = localStorage.getItem(`tour_completed_${user.id}`);
      if (tourCompleted) {
        setIsNewUser(false);
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("auth_token");
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ||
          "https://tamankehati-backend-pxnu.onrender.com";

        // Check if user has any parks
        const response = await fetch(`${apiUrl}/api/v1/parks?submitted_by=me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          setIsNewUser(false);
          setLoading(false);
          return;
        }

        const data = await response.json();
        const parks = data.items || data || [];

        // User is new if they have no parks
        setIsNewUser(parks.length === 0);
      } catch (error) {
        console.error("Error checking new user status:", error);
        setIsNewUser(false);
      } finally {
        setLoading(false);
      }
    }

    checkIfNewUser();
  }, [user]);

  const markTourAsCompleted = () => {
    if (user) {
      localStorage.setItem(`tour_completed_${user.id}`, "true");
      setIsNewUser(false);
    }
  };

  return { isNewUser, loading, markTourAsCompleted };
}
