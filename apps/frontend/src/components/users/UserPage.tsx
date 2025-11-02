"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/useAuth";
import { userApi, User } from "../../lib/api-client";
import { UserTable } from "./UserTable";
import { UserForm } from "./UserForm";
import { AddUserForm } from "./AddUserForm";
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
  Users,
} from "lucide-react";
import { toast } from "sonner";

export function UserPage() {
  const { user: currentUser, isAuthenticated } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name_asc");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | "preview">(
    "create",
  );
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // State untuk form add user terpisah
  const [addFormOpen, setAddFormOpen] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    loadData();
  }, [roleFilter, statusFilter, sortBy, isAuthenticated, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      // Check if user is authenticated
      if (!currentUser) {
        setError("Anda harus login untuk mengakses data pengguna");
        setLoading(false);
        return;
      }

      const users = await userApi.list({
        limit: 200,
        offset: 0,
        q: searchQuery || undefined,
        is_active:
          statusFilter === "all" ? undefined : statusFilter === "active",
        sort: sortBy,
      });

      let filteredData = users;

      if (roleFilter !== "all") {
        filteredData = filteredData.filter((u) => u.role === roleFilter);
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredData = filteredData.filter(
          (u) =>
            u.nama?.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query),
        );
      }

      setData(filteredData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat data pengguna",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setAddFormOpen(true);
  };

  const handlePreview = async (user: User) => {
    try {
      setLoading(true);
      // Fetch detailed user data with park and region info
      const userDetail = await userApi.getDetail(user.id, "park,region");
      setSelectedUser(userDetail);
      setFormMode("preview");
      setFormOpen(true);
    } catch (err) {
      console.error("Error fetching user details:", err);
      toast.error("Gagal memuat detail pengguna");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormMode("edit");
    setFormOpen(true);
  };

  const handleSubmit = async (formData: {
    nama: string;
    email: string;
    role: "super_admin" | "regional_admin";
    is_active: boolean;
    password?: string;
  }) => {
    try {
      if (formMode === "create") {
        if (!formData.password || formData.password.length < 8) {
          throw new Error("Password minimal 8 karakter untuk pengguna baru");
        }

        const createdUser = await userApi.create({
          email: formData.email,
          password: formData.password,
          nama: formData.nama,
          role: formData.role,
        });

        if (!formData.is_active) {
          await userApi.deactivate(createdUser.id);
        }

        toast.success("Pengguna berhasil ditambahkan");
      } else if (selectedUser) {
        let password: string | undefined;
        if (formData.password) {
          if (formData.password.length < 8) {
            throw new Error("Password minimal 8 karakter");
          }
          password = formData.password;
        }

        await userApi.update(selectedUser.id, {
          nama: formData.nama,
          password,
        });

        if (selectedUser.role !== formData.role) {
          await userApi.updateRole(selectedUser.id, formData.role);
        }

        if (formData.is_active !== selectedUser.is_active) {
          if (formData.is_active) {
            await userApi.activate(selectedUser.id);
          } else {
            await userApi.deactivate(selectedUser.id);
          }
        }

        toast.success("Data pengguna berhasil diperbarui");
      }
      loadData();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menyimpan data";
      toast.error(message);
      throw err;
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      if (isActive) {
        await userApi.activate(id);
      } else {
        await userApi.deactivate(id);
      }

      toast.success(
        isActive ? "Pengguna diaktifkan" : "Pengguna dinonaktifkan",
      );
      loadData();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal mengubah status pengguna";
      toast.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await userApi.delete(id);
      toast.success("Pengguna berhasil dihapus");
      loadData();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menghapus pengguna";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl mb-2 flex items-center gap-2">
            <Users className="h-6 w-6 sm:h-8 sm:w-8" style={{ color: "#356447" }} />
            Manajemen Pengguna
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Kelola akun pengguna sistem Taman Kehati
          </p>
        </div>
        <Button 
          onClick={handleCreate} 
          style={{ backgroundColor: "#233c2b" }}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pengguna
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama atau email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={loadData} variant="secondary" className="sm:hidden">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Role</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="regional_admin">Admin Regional</SelectItem>
                <SelectItem value="user">Pengguna</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Nonaktif</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <div className="flex-1">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Urutkan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name_asc">Nama (A-Z)</SelectItem>
                    <SelectItem value="email_asc">Email (A-Z)</SelectItem>
                    <SelectItem value="created_desc">Terbaru Dibuat</SelectItem>
                    <SelectItem value="created_asc">Terlama Dibuat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={loadData} variant="outline" size="icon" className="hidden sm:flex">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-sm text-muted-foreground mb-1">
              Total Pengguna
            </div>
            <div className="text-2xl">{data.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-sm text-muted-foreground mb-1">
              Pengguna Aktif
            </div>
            <div className="text-2xl text-green-600">
              {data.filter((u) => u.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-sm text-muted-foreground mb-1">
              Pengguna Nonaktif
            </div>
            <div className="text-2xl text-red-600">
              {data.filter((u) => !u.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-sm text-muted-foreground mb-1">
              Admin Regional
            </div>
            <div className="text-2xl">
              {data.filter((u) => u.role === "regional_admin").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <UserTable
        data={data}
        loading={loading}
        onEdit={handleEdit}
        onPreview={handlePreview}
        onToggleActive={handleToggleActive}
        onDelete={handleDelete}
      />

      <AddUserForm
        open={addFormOpen}
        onOpenChange={setAddFormOpen}
        onSuccess={loadData}
      />

      <UserForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        initialData={selectedUser}
        mode={formMode}
      />
    </div>
  );
}
