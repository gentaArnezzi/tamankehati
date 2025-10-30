import { useState, FormEvent } from "react";
import { useAuth } from "../lib/useAuth";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle, Leaf } from "lucide-react";

type LoginFormProps = {
  onSuccess?: () => void;
};

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal masuk ke sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#f4f0ee" }}
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div
            className="mx-auto w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#233c2b" }}
          >
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">Taman Kehati</CardTitle>
            <CardDescription>
              Portal Nasional Keanekaragaman Hayati Indonesia
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              style={{ backgroundColor: "#233c2b" }}
            >
              {loading ? "Memuat..." : "Masuk ke Sistem"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export function LoginPage() {
  const router = useRouter();
  return <LoginForm onSuccess={() => router.push("/dashboard")} />;
}
