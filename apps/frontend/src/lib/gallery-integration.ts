/**
 * Gallery Integration Module
 * Handles creation of gallery records for flora and fauna entities
 */

interface GalleryMetadata {
  entityType: "flora" | "fauna";
  entityId: number | string;
  title: string;
  description: string;
  parkId: number;
  status?: "draft" | "in_review" | "approved";
}

/**
 * Creates a gallery record for an entity (flora or fauna)
 * @param imageUrl - The URL of the uploaded image
 * @param metadata - Metadata about the entity
 */
export async function createGalleryForEntity(
  imageUrl: string,
  metadata: GalleryMetadata,
): Promise<void> {
  try {
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://tamankehati-backend-pxnu.onrender.com";
    const token = localStorage.getItem("auth_token");

    if (!token) {
      console.warn("No auth token found, skipping gallery creation");
      return;
    }

    // Create gallery record
    const response = await fetch(`${API_BASE_URL}/api/v1/galleries/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        image_url: imageUrl,
        entity_type: metadata.entityType,
        entity_id:
          typeof metadata.entityId === "string"
            ? parseInt(metadata.entityId)
            : metadata.entityId,
        title: metadata.title,
        description: metadata.description,
        park_id: metadata.parkId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(
        "Failed to create gallery record:",
        response.status,
        errorText,
      );
      // Don't throw error - gallery creation is optional
      return;
    }

    const result = await response.json();
    console.log("Gallery record created successfully:", result);

    // Auto-approve if requested (for super_admin or when status is 'approved')
    if (metadata.status === "approved" && result.id) {
      try {
        const approveResponse = await fetch(
          `${API_BASE_URL}/api/v1/galleries/${result.id}/approve`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (approveResponse.ok) {
          console.log("Gallery auto-approved successfully:", result.id);
        } else {
          console.warn("Failed to auto-approve gallery:", result.id);
        }
      } catch (approveError) {
        console.warn("Error auto-approving gallery:", approveError);
      }
    }
  } catch (error) {
    // Log but don't throw - gallery creation failure shouldn't break the main flow
    console.warn("Error creating gallery record:", error);
  }
}
