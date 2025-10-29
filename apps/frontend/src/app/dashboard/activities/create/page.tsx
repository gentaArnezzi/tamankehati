'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Park, activitiesApi, parksApi } from '../../../../lib/api-client';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Label } from '../../../../components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../components/ui/form';
import { Calendar } from '../../../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { ArrowLeft, Save, Loader2, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '../../../../lib/utils';
import { toast } from 'sonner';
import { useAuth } from '../../../../lib/useAuth';
import { DashboardLayoutNext } from '../../../../components/DashboardLayoutNext';
import { RBACGuard } from '../../../../components/RBACGuard';

const activitySchema = z.object({
  title: z.string().min(1, 'Judul kegiatan wajib diisi'),
  description: z.string().optional(),
  activity_date: z.string().min(1, 'Tanggal kegiatan wajib diisi'),
  location: z.string().optional(),
  park_id: z.number().optional(),
});

type ActivityFormData = z.infer<typeof activitySchema>;

function CreateActivityPageContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parks, setParks] = useState<Park[]>([]);
  const [date, setDate] = useState<Date | undefined>();
  const [calendarOpen, setCalendarOpen] = useState(false);

  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: '',
      description: '',
      activity_date: '',
      location: '',
      park_id: user?.park_id ?? 1,
    },
  });

  // Load parks data
  useEffect(() => {
    const loadParks = async () => {
      try {
        const response = await parksApi.list({ limit: 100 });
        setParks(response.items);
      } catch (err) {
        console.error('Failed to load parks:', err);
        toast.error('Gagal memuat data taman');
      }
    };
    loadParks();
  }, []);

  // Sync date with form field
  useEffect(() => {
    if (date) {
      form.setValue('activity_date', format(date, 'yyyy-MM-dd'));
    }
  }, [date, form]);

  const handleSubmit = async (data: ActivityFormData) => {
    try {
      setIsSubmitting(true);
      
      const submitData = {
        ...data,
        activity_date: date ? format(date, 'yyyy-MM-dd') : data.activity_date,
        park_id: user?.park_id || data.park_id,
      };
      
      await activitiesApi.create(submitData);
      
      toast.success('Kegiatan berhasil dibuat');
      router.push('/dashboard/activities');
    } catch (error) {
      console.error('Activity creation error:', error);
      const message = error instanceof Error ? error.message : 'Gagal membuat kegiatan';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Buat Kegiatan Baru</h1>
                <p className="text-sm text-muted-foreground">
                  Buat kegiatan konservasi baru untuk taman nasional
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                onClick={form.handleSubmit(handleSubmit)}
                disabled={isSubmitting}
                style={{ backgroundColor: '#233c2b' }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Kegiatan
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Informasi Dasar */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Kegiatan</CardTitle>
                <CardDescription>
                  Informasi utama kegiatan konservasi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Judul Kegiatan *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Contoh: Penanaman Pohon Endemik" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi Kegiatan</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Contoh: Penanaman pohon lokal bersama masyarakat sekitar"
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Detail Kegiatan */}
            <Card>
              <CardHeader>
                <CardTitle>Detail Kegiatan</CardTitle>
                <CardDescription>
                  Informasi detail waktu dan lokasi kegiatan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="activity_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Tanggal Kegiatan *</FormLabel>
                        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !date && "text-muted-foreground"
                                )}
                              >
                                {date ? (
                                  format(date, "dd MMMM yyyy", { locale: id })
                                ) : (
                                  <span>Pilih tanggal</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              disabled={(date) =>
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lokasi Kegiatan</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Contoh: Area Konservasi A" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {user?.role === 'super_admin' && (
                  <FormField
                    control={form.control}
                    name="park_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taman Nasional</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih taman nasional" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {parks.map((park) => (
                              <SelectItem key={park.id} value={park.id.toString()}>
                                {park.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Footer Actions - Mobile */}
            <div className="md:hidden sticky bottom-0 bg-white border-t p-4 -mx-4">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                  style={{ backgroundColor: '#233c2b' }}
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Kegiatan'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default function CreateActivityPage() {
  return (
    <RBACGuard allowedRoles={['regional_admin']}>
      <DashboardLayoutNext>
        <CreateActivityPageContent />
      </DashboardLayoutNext>
    </RBACGuard>
  );
}
