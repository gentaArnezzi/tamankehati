import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/useAuth";
import { floraApi, Flora } from "../../lib/api-client";
import { FloraTable } from "./FloraTable";
import { FloraForm } from "./FloraForm";
import { FloraDetail } from "./FloraDetail";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Leaf,
} from "lucide-react";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";

export function FloraPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<Flora[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  // Region filtering removed - using user-based access control

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedFlora, setSelectedFlora] = useState<Flora | null>(null);
  const cacheRef = useRef<Map<string, { data: any; timestamp: number }>>(
    new Map(),
  );

  useEffect(() => {
    loadData();
  }, [currentPage, searchQuery, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      // Create cache key
      const cacheKey = `flora-${currentPage}-${searchQuery}-${statusFilter}-${user?.id}`;
      const now = Date.now();
      const cacheExpiry = 10000; // 10 seconds cache for faster updates

      // Check cache first
      const cached = cacheRef.current.get(cacheKey);
      if (cached && now - cached.timestamp < cacheExpiry) {
        setData(cached.data.items);
        setTotalItems(cached.data.total);
        setLoading(false);
        return;
      }

      const params: Record<string, unknown> = {
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      // Region filtering removed - using user-based access control

      if (user?.role === "regional_admin") {
        // Regional admin should only see their own submitted data
        params.submitted_by = user.id;
      }

      const response = await floraApi.list(params);

      // Cache the response
      cacheRef.current.set(cacheKey, {
        data: response,
        timestamp: now,
      });

      setTotalItems(response.total);
      setData(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data flora");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    router.push("/dashboard/flora/create");
  };

  const handleEdit = (flora: Flora) => {
    console.log("FloraPage - handleEdit called with flora:", flora);
    setSelectedFlora(flora);
    setFormMode("edit");
    setFormOpen(true);
  };

  const handleView = (flora: Flora) => {
    setSelectedFlora(flora);
    setDetailOpen(true);
  };

  const handleSubmit = async (formData: Partial<Flora>) => {
    try {
      let result;
      if (formMode === "create") {
        result = await floraApi.create(formData);
        toast.success("Data flora berhasil ditambahkan");
      } else if (selectedFlora) {
        result = await floraApi.update(selectedFlora.id, formData);
        toast.success("Data flora berhasil diperbarui");
      }
      // Clear cache and reload
      cacheRef.current.clear();
      await loadData();
      return result; // Return the result so FloraForm can use the flora ID
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menyimpan data";
      toast.error(message);
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await floraApi.delete(id);
      toast.success("Data flora berhasil dihapus");
      // Clear cache and reload
      cacheRef.current.clear();
      loadData();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menghapus data";
      toast.error(message);
    }
  };

  const handleSubmitReview = async (id: string) => {
    try {
      await floraApi.submit(id);
      toast.success("Data flora berhasil diajukan untuk ditinjau");
      // Clear cache and reload
      cacheRef.current.clear();
      loadData();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal mengajukan data";
      toast.error(message);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    // Clear cache and reload
    cacheRef.current.clear();
    loadData();
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl mb-2 flex items-center gap-2">
            <Leaf className="h-6 w-6 sm:h-8 sm:w-8" style={{ color: "#356447" }} />
            Manajemen Flora
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Kelola data keanekaragaman flora Indonesia
            {/* wilayah field removed from User type */}
          </p>
        </div>
        <Button
          onClick={handleCreate}
          data-tour="add-flora-button"
          style={{ backgroundColor: "#233c2b" }}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Flora
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama ilmiah, nama umum, atau famili..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch} variant="secondary" className="sm:hidden">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="in_review">Dalam Peninjauan</SelectItem>
                    <SelectItem value="approved">Disetujui</SelectItem>
                    <SelectItem value="rejected">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={loadData}
                variant="outline"
                size="icon"
                title="Muat Ulang"
                className="hidden sm:flex"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Total Data</div>
            <div className="text-2xl">{totalItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Draft</div>
            <div className="text-2xl">
              {data.filter((f) => f.status === "draft").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">
              Dalam Peninjauan
            </div>
            <div className="text-2xl">
              {data.filter((f) => f.status === "in_review").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Disetujui</div>
            <div className="text-2xl">
              {data.filter((f) => f.status === "approved").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <FloraTable
        data={data}
        loading={loading}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onSubmitReview={handleSubmitReview}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    setCurrentPage((p) => Math.max(1, p - 1));
                  }}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5) {
                  if (currentPage > 3) {
                    pageNum = currentPage - 2 + i;
                  }
                  if (currentPage > totalPages - 3) {
                    pageNum = totalPages - 4 + i;
                  }
                }

                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        setCurrentPage(pageNum);
                      }}
                      isActive={currentPage === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                  }}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Modals */}
      <FloraForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        initialData={selectedFlora}
        mode={formMode}
      />

      <FloraDetail
        open={detailOpen}
        onOpenChange={setDetailOpen}
        data={selectedFlora}
      />
    </div>
  );
}
