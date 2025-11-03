import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Settings, Palette, Bell, Key, Shield } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "../ui/separator";
import { getApiUrl } from "../../lib/api-url";

export function SettingsPage() {
  const [saving, setSaving] = useState(false);

  // Theme settings
  const [primaryColor, setPrimaryColor] = useState("#233c2b");
  const [secondaryColor, setSecondaryColor] = useState("#356447");
  const [backgroundColor, setBackgroundColor] = useState("#f4f0ee");

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [approvalNotifications, setApprovalNotifications] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  // System settings
  const [siteName, setSiteName] = useState("Taman Kehati");
  const [siteDescription, setSiteDescription] = useState(
    "Portal Nasional Keanekaragaman Hayati Indonesia",
  );
  const [bannerMessage, setBannerMessage] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // API settings
  const [apiKey, setApiKey] = useState("");

  const handleSaveTheme = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Pengaturan tema berhasil disimpan");
    } catch (error) {
      toast.error("Gagal menyimpan pengaturan tema");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Pengaturan notifikasi berhasil disimpan");
    } catch (error) {
      toast.error("Gagal menyimpan pengaturan notifikasi");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSystem = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Pengaturan sistem berhasil disimpan");
    } catch (error) {
      toast.error("Gagal menyimpan pengaturan sistem");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateApiKey = () => {
    const newKey =
      "tk_" +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    setApiKey(newKey);
    toast.success("API Key baru telah dibuat");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2 flex items-center gap-2">
          <Settings className="h-8 w-8" style={{ color: "#356447" }} />
          Pengaturan Sistem
        </h1>
        <p className="text-muted-foreground">
          Kelola konfigurasi dan preferensi sistem Taman Kehati
        </p>
      </div>

      <Tabs defaultValue="theme" className="space-y-6">
        <TabsList>
          <TabsTrigger value="theme">
            <Palette className="mr-2 h-4 w-4" />
            Tema
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifikasi
          </TabsTrigger>
          <TabsTrigger value="system">
            <Shield className="mr-2 h-4 w-4" />
            Sistem
          </TabsTrigger>
          <TabsTrigger value="api">
            <Key className="mr-2 h-4 w-4" />
            API
          </TabsTrigger>
        </TabsList>

        {/* Theme Settings */}
        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Tema</CardTitle>
              <CardDescription>
                Sesuaikan warna dan tampilan visual sistem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Warna Utama</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-10 w-20"
                    />
                    <Input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#233c2b"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Warna Sekunder</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="h-10 w-20"
                    />
                    <Input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      placeholder="#356447"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backgroundColor">Warna Latar Belakang</Label>
                  <div className="flex gap-2">
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="h-10 w-20"
                    />
                    <Input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      placeholder="#f4f0ee"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4>Pratinjau</h4>
                <div
                  className="p-6 border rounded-lg"
                  style={{ backgroundColor }}
                >
                  <div className="space-y-4">
                    <Button style={{ backgroundColor: primaryColor }}>
                      Tombol Utama
                    </Button>
                    <Button
                      variant="outline"
                      style={{
                        borderColor: secondaryColor,
                        color: secondaryColor,
                      }}
                    >
                      Tombol Sekunder
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveTheme}
                  disabled={saving}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Notifikasi</CardTitle>
              <CardDescription>
                Kelola preferensi notifikasi email dan sistem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Notifikasi Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Terima notifikasi penting melalui email
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Notifikasi Persetujuan</Label>
                    <p className="text-sm text-muted-foreground">
                      Dapatkan pemberitahuan saat ada data baru untuk ditinjau
                    </p>
                  </div>
                  <Switch
                    checked={approvalNotifications}
                    onCheckedChange={setApprovalNotifications}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Laporan Mingguan</Label>
                    <p className="text-sm text-muted-foreground">
                      Terima ringkasan aktivitas sistem setiap minggu
                    </p>
                  </div>
                  <Switch
                    checked={weeklyReport}
                    onCheckedChange={setWeeklyReport}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveNotifications}
                  disabled={saving}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Sistem</CardTitle>
              <CardDescription>
                Konfigurasi informasi dasar dan pengaturan sistem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Nama Situs</Label>
                  <Input
                    id="siteName"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="Taman Kehati"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Deskripsi Situs</Label>
                  <Textarea
                    id="siteDescription"
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    placeholder="Portal Nasional Keanekaragaman Hayati Indonesia"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bannerMessage">Pesan Banner Info</Label>
                  <Textarea
                    id="bannerMessage"
                    value={bannerMessage}
                    onChange={(e) => setBannerMessage(e.target.value)}
                    placeholder="Pesan informasi yang akan ditampilkan di banner (kosongkan untuk menyembunyikan)"
                    rows={2}
                  />
                  <p className="text-sm text-muted-foreground">
                    Pesan ini akan muncul di bagian atas halaman publik
                  </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                  <div className="space-y-0.5">
                    <Label>Mode Pemeliharaan</Label>
                    <p className="text-sm text-muted-foreground">
                      Nonaktifkan akses publik untuk pemeliharaan sistem
                    </p>
                  </div>
                  <Switch
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveSystem}
                  disabled={saving}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Settings */}
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan API</CardTitle>
              <CardDescription>
                Kelola kunci API untuk integrasi eksternal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Perhatian:</strong> API Key memberikan akses ke data
                  sistem. Jangan bagikan kunci API Anda kepada siapa pun.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="apiKey"
                      type="password"
                      value={apiKey}
                      readOnly
                      placeholder="Klik tombol untuk membuat API Key"
                      className="flex-1 font-mono"
                    />
                    <Button onClick={handleGenerateApiKey} variant="outline">
                      Buat Baru
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    API Key digunakan untuk autentikasi aplikasi eksternal
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm">Endpoint API</h4>
                  <div className="p-3 bg-gray-50 rounded border font-mono text-sm">
                    <p className="mb-1">
                      Base URL: <code>{getApiUrl()}/api/v1</code>
                    </p>
                    <p className="mb-1">
                      Headers: <code>Authorization: Bearer {"<API_KEY>"}</code>
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm">Dokumentasi</h4>
                  <p className="text-sm text-muted-foreground">
                    Akses dokumentasi API lengkap di{" "}
                    <a
                      href={`${getApiUrl()}/docs`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {getApiUrl()}/docs
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
