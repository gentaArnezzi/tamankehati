import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ComprehensiveAIGenerator from "../ComprehensiveAIGenerator";

// Mock fetch
global.fetch = jest.fn();

describe("ComprehensiveAIGenerator", () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it("renders all tabs correctly", () => {
    render(<ComprehensiveAIGenerator />);

    expect(screen.getByText("Flora & Fauna")).toBeInTheDocument();
    expect(screen.getByText("Artikel")).toBeInTheDocument();
    expect(screen.getByText("Berita")).toBeInTheDocument();
    expect(screen.getByText("CSV Import")).toBeInTheDocument();
  });

  it("switches between tabs correctly", () => {
    render(<ComprehensiveAIGenerator />);

    // Test Articles tab
    fireEvent.click(screen.getByText("Artikel"));
    expect(screen.getByText("Generate Artikel")).toBeInTheDocument();

    // Test News tab
    fireEvent.click(screen.getByText("Berita"));
    expect(screen.getByText("Generate Berita")).toBeInTheDocument();

    // Test CSV Import tab
    fireEvent.click(screen.getByText("CSV Import"));
    expect(screen.getByText("Upload & Extract Data")).toBeInTheDocument();
  });

  it("handles flora/fauna type selection", () => {
    render(<ComprehensiveAIGenerator />);

    const floraButton = screen.getByText("🌿 Flora");
    const faunaButton = screen.getByText("🐅 Fauna");

    fireEvent.click(floraButton);
    expect(floraButton).toHaveClass("bg-primary");

    fireEvent.click(faunaButton);
    expect(faunaButton).toHaveClass("bg-primary");
  });

  it("handles form input changes", () => {
    render(<ComprehensiveAIGenerator />);

    // Test flora/fauna inputs
    const localNameInput = screen.getByPlaceholderText("Contoh: Pohon Jati");
    fireEvent.change(localNameInput, { target: { value: "Test Flora" } });
    expect(localNameInput).toHaveValue("Test Flora");

    // Switch to Articles tab
    fireEvent.click(screen.getByText("Artikel"));
    const topicInput = screen.getByPlaceholderText(
      "Contoh: Konservasi Harimau Sumatera",
    );
    fireEvent.change(topicInput, { target: { value: "Test Topic" } });
    expect(topicInput).toHaveValue("Test Topic");
  });

  it("handles key points addition and removal", () => {
    render(<ComprehensiveAIGenerator />);

    // Switch to Articles tab
    fireEvent.click(screen.getByText("Artikel"));

    // Add key point
    fireEvent.click(screen.getByText("Tambah Poin"));
    expect(screen.getAllByPlaceholderText(/Poin/)).toHaveLength(2);

    // Remove key point
    const removeButtons = screen.getAllByText("Hapus");
    fireEvent.click(removeButtons[0]);
    expect(screen.getAllByPlaceholderText(/Poin/)).toHaveLength(1);
  });

  it("handles CSV file upload", () => {
    render(<ComprehensiveAIGenerator />);

    // Switch to CSV Import tab
    fireEvent.click(screen.getByText("CSV Import"));

    const fileInput = screen.getByLabelText("File CSV");
    const file = new File(["test,data"], "test.csv", { type: "text/csv" });

    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(fileInput.files[0]).toBe(file);
  });

  it("shows loading state during generation", async () => {
    (fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () =>
                  Promise.resolve({
                    success: true,
                    title: "Test",
                    content: "Test content",
                  }),
              }),
            100,
          ),
        ),
    );

    render(<ComprehensiveAIGenerator />);

    // Switch to Articles tab
    fireEvent.click(screen.getByText("Artikel"));

    // Fill form
    fireEvent.change(
      screen.getByPlaceholderText("Contoh: Konservasi Harimau Sumatera"),
      {
        target: { value: "Test Topic" },
      },
    );

    // Click generate
    fireEvent.click(screen.getByText("Generate Artikel"));

    // Check loading state
    expect(
      screen.getByRole("button", { name: /Generate Artikel/ }),
    ).toBeDisabled();
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  it("handles API errors gracefully", async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error("API Error"));

    render(<ComprehensiveAIGenerator />);

    // Switch to Articles tab
    fireEvent.click(screen.getByText("Artikel"));

    // Fill form and generate
    fireEvent.change(
      screen.getByPlaceholderText("Contoh: Konservasi Harimau Sumatera"),
      {
        target: { value: "Test Topic" },
      },
    );

    fireEvent.click(screen.getByText("Generate Artikel"));

    // Wait for error handling
    await waitFor(() => {
      expect(
        screen.getByText("Terjadi kesalahan saat generate artikel"),
      ).toBeInTheDocument();
    });
  });

  it("displays generated content correctly", async () => {
    const mockResponse = {
      success: true,
      title: "Test Article Title",
      summary: "Test article summary",
      content: "Test article content",
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(<ComprehensiveAIGenerator />);

    // Switch to Articles tab
    fireEvent.click(screen.getByText("Artikel"));

    // Fill form and generate
    fireEvent.change(
      screen.getByPlaceholderText("Contoh: Konservasi Harimau Sumatera"),
      {
        target: { value: "Test Topic" },
      },
    );

    fireEvent.click(screen.getByText("Generate Artikel"));

    // Wait for content to appear
    await waitFor(() => {
      expect(
        screen.getByDisplayValue("Test Article Title"),
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue("Test article summary"),
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue("Test article content"),
      ).toBeInTheDocument();
    });
  });
});
