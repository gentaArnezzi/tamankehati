"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Switch } from "../ui/switch";
import { userApi, User } from "../../lib/api-client";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";

const formSchema = z.object({
  nama: z.string().min(1, "Nama lengkap harus diisi"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["super_admin", "regional_admin"]),
  is_active: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface AddUserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddUserForm({
  open,
  onOpenChange,
  onSuccess,
}: AddUserFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: "",
      email: "",
      password: "",
      role: "regional_admin",
      is_active: true,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      const userData = {
        nama: data.nama,
        email: data.email,
        password: data.password,
        role: data.role,
        is_active: data.is_active,
      };

      await userApi.create(userData);

      toast.success("User berhasil ditambahkan");
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal menambahkan user",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Tambah User Baru
          </DialogTitle>
          <DialogDescription>
            Isi form di bawah ini untuk menambahkan user baru ke sistem.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="nama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: Ahmad Ranger"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Contoh: ahmad@kehati.org"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password *</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Minimal 6 karakter"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="regional_admin">
                          Regional Admin
                        </SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Status Aktif</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      User dapat login dan mengakses sistem
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Menyimpan..." : "Tambah User"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
