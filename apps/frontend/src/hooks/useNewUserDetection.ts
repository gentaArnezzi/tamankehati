"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../lib/useAuth";
import { apiUrl } from "../lib/api-url";
import {
  AUTH_TOKEN_KEY,
  TOUR_COMPLETED_KEY_PREFIX,
  ONBOARDING_CURRENT_STEP_KEY,
} from "../lib/constants";

export function useNewUserDetection() {
  const { user } = useAuth();
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const checkIfNewUser = useCallback(async () => {
    if (!user || user.role !== "regional_admin") {
      setIsNewUser(false);
      setLoading(false);
      return;
    }

    // Check if tour has been completed before
    const tourCompleted = localStorage.getItem(
      `${TOUR_COMPLETED_KEY_PREFIX}${user.id}`
    );
    if (tourCompleted) {
      setIsNewUser(false);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);

      // Check if user has any parks
      const response = await fetch(apiUrl("/api/v1/parks?submitted_by=me"), {
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
      // Handle different response formats
      let parks = [];
      if (Array.isArray(data)) {
        parks = data;
      } else if (data.items && Array.isArray(data.items)) {
        parks = data.items;
      } else if (data.data && Array.isArray(data.data)) {
        parks = data.data;
      }

      // User is new if they have no parks
      setIsNewUser(parks.length === 0);
    } catch (error) {
      console.error("Error checking new user status:", error);
      setIsNewUser(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkIfNewUser();
  }, [checkIfNewUser]);

  const markTourAsCompleted = () => {
    if (user) {
      localStorage.setItem(
        `${TOUR_COMPLETED_KEY_PREFIX}${user.id}`,
        "true"
      );
      setIsNewUser(false);
    }
  };

  const resetTourStatus = () => {
    if (user) {
      localStorage.removeItem(`${TOUR_COMPLETED_KEY_PREFIX}${user.id}`);
      localStorage.removeItem(ONBOARDING_CURRENT_STEP_KEY);
      // Reset state and re-check
      setIsNewUser(null);
      setLoading(true);
      checkIfNewUser();
    }
  };

  return { isNewUser, loading, markTourAsCompleted, resetTourStatus };
}
