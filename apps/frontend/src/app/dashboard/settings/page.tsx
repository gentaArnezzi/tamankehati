"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../lib/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { apiUrl } from "../../../lib/api-url";
import { CollapsibleDashboardLayout } from "../../../components/CollapsibleDashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Separator } from "../../../components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import {
  Settings,
  User,
  Mail,
  Lock,
  Save,
  Bell,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Camera,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, refreshUser, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    announcementAlerts: true,
    approvalAlerts: true,
  });

  // Refresh user data when settings page is opened
  useEffect(() => {
    const refreshData = async () => {
      try {
        console.log("🔄 Refreshing user data on settings page load...");
        await refreshUser();
        console.log("✅ User data refreshed successfully");
      } catch (error) {
        console.warn("⚠️ Failed to refresh user data:", error);
      }
    };

    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  useEffect(() => {
    if (user) {
      console.log("👤 Current user data in settings:", user);
      console.log("📸 Profile picture URL:", user.profile_picture_url);
      setFormData((prev) => ({
        ...prev,
        nama: user.nama || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    // Calculate password strength
    const password = formData.newPassword;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    setPasswordStrength(strength);
  }, [formData.newPassword]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("Anda harus login terlebih dahulu");
        router.push("/login");
        return;
      }

      const response = await fetch(
        apiUrl("/api/v1/users/me/profile"),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            nama: formData.nama,
            email: formData.email,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update profile");
      }

      toast.success("Profil berhasil diperbarui");

      // Refresh user context from API (without redirect)
      try {
        await refreshUser();
        console.log("✅ User context refreshed after profile update");
      } catch (refreshError) {
        console.warn("⚠️ Could not refresh user context:", refreshError);
        // Profile update was successful, don't logout user
      }
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error(error.message || "Gagal memperbarui profil");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.currentPassword) {
      toast.error("Password saat ini harus diisi");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Password baru tidak cocok");
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error("Password minimal 8 karakter");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("Anda harus login terlebih dahulu");
        router.push("/login");
        return;
      }

      const response = await fetch(
        apiUrl("/api/v1/users/me/change-password"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            current_password: formData.currentPassword,
            new_password: formData.newPassword,
            confirm_password: formData.confirmPassword,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to change password");
      }

      toast.success("Password berhasil diubah");
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error: any) {
      console.error("Failed to change password:", error);
      toast.error(error.message || "Gagal mengubah password");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("Anda harus login terlebih dahulu");
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://103.125.91.16"}/api/v1/users/me/notifications`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            email_notifications: notifications.emailNotifications,
            push_notifications: notifications.pushNotifications,
            announcement_alerts: notifications.announcementAlerts,
            approval_alerts: notifications.approvalAlerts,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update notifications");
      }

      toast.success("Preferensi notifikasi berhasil diperbarui");
    } catch (error: any) {
      console.error("Failed to update notifications:", error);
      toast.error(error.message || "Gagal memperbarui preferensi notifikasi");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WEBP",
      );
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("Anda harus login terlebih dahulu");
        router.push("/login");
        return;
      }

      const formDataToUpload = new FormData();
      formDataToUpload.append("file", file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://103.125.91.16"}/api/v1/users/me/upload-photo`,
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
          },
          body: formDataToUpload,
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to upload photo");
      }

      const updatedUser = await response.json();
      console.log("📸 Photo uploaded, server response:", updatedUser);
      console.log("📸 Profile picture URL from server:", updatedUser.profile_picture_url);

      toast.success("Foto profil berhasil diupload");

      // Immediately update user context with the new profile picture URL
      if (updatedUser.profile_picture_url && user) {
        // Update user state immediately without waiting for refresh
        updateUser({
          profile_picture_url: updatedUser.profile_picture_url,
        });
        console.log("✅ User state updated with new profile picture URL");
      }

      // Refresh user context from API to ensure consistency
      try {
        await refreshUser();
        console.log("✅ User context refreshed after photo upload");
        console.log("📸 Current user data after refresh:", user);
      } catch (refreshError) {
        console.warn("⚠️ Could not refresh user context:", refreshError);
        // Continue anyway since we already updated state
      }

      // Small delay to ensure state is updated before checking UI
      setTimeout(() => {
        // Check if photo is visible, if not reload
        const avatarImg = document.querySelector('img[alt*="Profile photo"]') as HTMLImageElement;
        if (!avatarImg || !avatarImg.complete || avatarImg.naturalHeight === 0) {
          console.log("🔄 Reloading page to show new photo");
          window.location.reload();
        }
      }, 1000);
    } catch (error: any) {
      console.error("Failed to upload photo:", error);
      toast.error(error.message || "Gagal mengupload foto");
    } finally {
      setLoading(false);
      // Reset file input
      e.target.value = "";
    }
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const avatarInitial = user?.nama?.charAt(0)?.toUpperCase() ?? "U";

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-200";
    if (passwordStrength === 1) return "bg-red-500";
    if (passwordStrength === 2) return "bg-yellow-500";
    if (passwordStrength === 3) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength === 1) return "Lemah";
    if (passwordStrength === 2) return "Sedang";
    if (passwordStrength === 3) return "Kuat";
    return "Sangat Kuat";
  };

  return (
    <CollapsibleDashboardLayout
      user={user}
      currentPath={pathname}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-7 w-7 text-gray-900" />
            <h1 className="text-3xl font-bold text-gray-900">Pengaturan</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Kelola informasi akun dan preferensi Anda
          </p>
        </div>

        {/* Profile Header Card */}
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <div className="relative group">
                <Avatar
                  key={user?.profile_picture_url || `no-avatar-${user?.id}`}
                  className="h-24 w-24 border-4 border-white shadow-lg"
                >
                  {user?.profile_picture_url && (
                    <AvatarImage
                      src={`${process.env.NEXT_PUBLIC_API_URL || "http://103.125.91.16"}${user.profile_picture_url}`}
                      alt={user?.nama || "Profile photo"}
                      onError={(e) => {
                        console.error("Failed to load profile image:", user.profile_picture_url);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <AvatarFallback className="bg-gradient-to-br from-brand-600 to-brand-700 text-white font-bold text-3xl">
                    {avatarInitial}
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleUploadPhoto}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("photo-upload")?.click()
                  }
                  disabled={loading}
                  className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border-2 border-gray-100 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {user?.nama}
                </h2>
                <p className="text-muted-foreground mb-3">{user?.email}</p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-50 text-brand-700 border border-brand-200">
                    {user?.role === "super_admin" && "👑 Super Administrator"}
                    {user?.role === "regional_admin" &&
                      "🛡️ Regional Administrator"}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Akun Terverifikasi
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Keamanan</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifikasi</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-brand-600" />
                  <CardTitle>Informasi Profil</CardTitle>
                </div>
                <CardDescription>
                  Update informasi pribadi Anda yang akan ditampilkan di sistem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nama" className="text-sm font-medium">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="nama"
                        type="text"
                        value={formData.nama}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            nama: e.target.value,
                          }))
                        }
                        placeholder="Masukkan nama lengkap"
                        disabled={loading}
                        className="h-11"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          placeholder="Masukkan email"
                          disabled={loading}
                          className="h-11 pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" disabled={loading}>
                      Batal
                    </Button>
                    <Button type="submit" disabled={loading} className="gap-2">
                      <Save className="h-4 w-4" />
                      {loading ? "Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Akun</CardTitle>
                <CardDescription>
                  Detail informasi akun Anda di sistem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <dt className="text-sm font-medium text-muted-foreground">
                      User ID
                    </dt>
                    <dd className="text-sm font-mono font-semibold">
                      {user?.id}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Role
                    </dt>
                    <dd className="text-sm font-semibold">
                      {user?.role === "super_admin" && "Super Administrator"}
                      {user?.role === "regional_admin" &&
                        "Regional Administrator"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Email
                    </dt>
                    <dd className="text-sm font-semibold">{user?.email}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-brand-600" />
                  <CardTitle>Ubah Password</CardTitle>
                </div>
                <CardDescription>
                  Pastikan akun Anda menggunakan password yang kuat untuk
                  keamanan maksimal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="currentPassword"
                      className="text-sm font-medium"
                    >
                      Password Saat Ini <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="currentPassword"
                        type={showPassword.current ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                        placeholder="Masukkan password saat ini"
                        disabled={loading}
                        className="h-11 pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((prev) => ({
                            ...prev,
                            current: !prev.current,
                          }))
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700"
                      >
                        {showPassword.current ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label
                      htmlFor="newPassword"
                      className="text-sm font-medium"
                    >
                      Password Baru <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type={showPassword.new ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                        placeholder="Masukkan password baru"
                        disabled={loading}
                        className="h-11 pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((prev) => ({
                            ...prev,
                            new: !prev.new,
                          }))
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700"
                      >
                        {showPassword.new ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {formData.newPassword && (
                      <div className="space-y-2 mt-3">
                        <div className="flex gap-1">
                          {[...Array(4)].map((_, i) => {
                            const isActive = i < passwordStrength;
                            const colorClass = isActive
                              ? getPasswordStrengthColor()
                              : "bg-gray-200";
                            return (
                              <div
                                key={i}
                                className={
                                  "h-1 flex-1 rounded-full transition-all " +
                                  colorClass
                                }
                              />
                            );
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Kekuatan password:{" "}
                          <span className="font-semibold">
                            {getPasswordStrengthText()}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium"
                    >
                      Konfirmasi Password Baru{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword.confirm ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        placeholder="Konfirmasi password baru"
                        disabled={loading}
                        className="h-11 pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((prev) => ({
                            ...prev,
                            confirm: !prev.confirm,
                          }))
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700"
                      >
                        {showPassword.confirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {formData.confirmPassword &&
                      formData.newPassword !== formData.confirmPassword && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Password tidak cocok
                        </p>
                      )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900 font-medium mb-2">
                      Tips Password Kuat:
                    </p>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>Minimal 8 karakter</li>
                      <li>Kombinasi huruf besar dan kecil</li>
                      <li>Mengandung angka</li>
                      <li>Mengandung karakter khusus (@$!%*?&)</li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={loading}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        }));
                      }}
                    >
                      Batal
                    </Button>
                    <Button type="submit" disabled={loading} className="gap-2">
                      <Lock className="h-4 w-4" />
                      {loading ? "Mengubah..." : "Ubah Password"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-brand-600" />
                  <CardTitle>Preferensi Notifikasi</CardTitle>
                </div>
                <CardDescription>
                  Kelola bagaimana Anda ingin menerima notifikasi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-4 border-b">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Terima notifikasi melalui email
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setNotifications((prev) => ({
                          ...prev,
                          emailNotifications: !prev.emailNotifications,
                        }))
                      }
                      className={
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors " +
                        (notifications.emailNotifications
                          ? "bg-brand-600"
                          : "bg-gray-200")
                      }
                    >
                      <span
                        className={
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform " +
                          (notifications.emailNotifications
                            ? "translate-x-6"
                            : "translate-x-1")
                        }
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">
                        Push Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Terima notifikasi push di browser
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setNotifications((prev) => ({
                          ...prev,
                          pushNotifications: !prev.pushNotifications,
                        }))
                      }
                      className={
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors " +
                        (notifications.pushNotifications
                          ? "bg-brand-600"
                          : "bg-gray-200")
                      }
                    >
                      <span
                        className={
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform " +
                          (notifications.pushNotifications
                            ? "translate-x-6"
                            : "translate-x-1")
                        }
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">
                        Pengumuman Baru
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Notifikasi untuk pengumuman baru
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setNotifications((prev) => ({
                          ...prev,
                          announcementAlerts: !prev.announcementAlerts,
                        }))
                      }
                      className={
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors " +
                        (notifications.announcementAlerts
                          ? "bg-brand-600"
                          : "bg-gray-200")
                      }
                    >
                      <span
                        className={
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform " +
                          (notifications.announcementAlerts
                            ? "translate-x-6"
                            : "translate-x-1")
                        }
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Persetujuan</Label>
                      <p className="text-sm text-muted-foreground">
                        Notifikasi untuk status persetujuan
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setNotifications((prev) => ({
                          ...prev,
                          approvalAlerts: !prev.approvalAlerts,
                        }))
                      }
                      className={
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors " +
                        (notifications.approvalAlerts
                          ? "bg-brand-600"
                          : "bg-gray-200")
                      }
                    >
                      <span
                        className={
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform " +
                          (notifications.approvalAlerts
                            ? "translate-x-6"
                            : "translate-x-1")
                        }
                      />
                    </button>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button
                    onClick={handleUpdateNotifications}
                    disabled={loading}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {loading ? "Menyimpan..." : "Simpan Preferensi"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CollapsibleDashboardLayout>
  );
}
