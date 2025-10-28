'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Park, activitiesApi } from '../../lib/api-client';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '../../lib/utils';

const activitySchema = z.object({
  title: z.string().min(1, 'Judul kegiatan wajib diisi'),
  description: z.string().optional(),
  activity_date: z.string().min(1, 'Tanggal kegiatan wajib diisi'),
  location: z.string().optional(),
  park_id: z.number().optional(),
});

type ActivityFormData = z.infer<typeof activitySchema>;

interface ActivityFormProps {
  activity?: Activity | null;
  parks: Park[];
  userParkId?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ActivityForm({ activity, parks, userParkId, onSuccess, onCancel }: ActivityFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    activity?.activity_date ? new Date(activity.activity_date) : undefined
  );
  const [calendarOpen, setCalendarOpen] = useState(false);

  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: activity?.title ?? '',
      description: activity?.description ?? '',
      activity_date: activity?.activity_date ?? '',
      location: activity?.location ?? '',
      park_id: activity?.park_id ?? userParkId ?? 1,
    },
  });

  const resetFormValues = (activity?: Activity | null) => {
    form.reset({
      title: activity?.title ?? '',
      description: activity?.description ?? '',
      activity_date: activity?.activity_date ?? '',
      location: activity?.location ?? '',
      park_id: activity?.park_id ?? userParkId ?? 1,
    });
    setDate(activity?.activity_date ? new Date(activity.activity_date) : undefined);
  };

  useEffect(() => {
    resetFormValues(activity);
  }, [activity]);

  // Sync date with form field
  useEffect(() => {
    if (date) {
      form.setValue('activity_date', format(date, 'yyyy-MM-dd'));
    }
  }, [date, form]);

  const handleSubmit = async (data: ActivityFormData) => {
    try {
      setSubmitting(true);
      
      const submitData = {
        ...data,
        activity_date: date ? format(date, 'yyyy-MM-dd') : data.activity_date,
        park_id: userParkId || data.park_id,
      };
      
      if (activity) {
        // Update existing activity
        await activitiesApi.update(activity.id, submitData);
      } else {
        // Create new activity
        await activitiesApi.create(submitData);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Activity form submit error:', error);
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="activity_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal Pelaksanaan *</FormLabel>
                <div className="relative">
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCalendarOpen(!calendarOpen);
                        }}
                      >
                        {date ? (
                          format(date, "dd MMMM yyyy", { locale: id })
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(selectedDate) => {
                          setDate(selectedDate);
                          if (selectedDate) {
                            field.onChange(format(selectedDate, 'yyyy-MM-dd'));
                            setCalendarOpen(false);
                          }
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {/* Hidden input for form validation */}
                  <input
                    type="hidden"
                    {...field}
                    value={field.value || ''}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Taman</FormLabel>
            <div className="flex items-center gap-2 px-3 py-2 border border-input bg-input-background rounded-md text-sm">
              <span className="text-muted-foreground">
                {parks.find(park => park.id === userParkId)?.name || 'Taman tidak ditemukan'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Taman otomatis mengikuti akun Anda
            </p>
          </FormItem>
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lokasi Kegiatan</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Contoh: Area tengah taman" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Menyimpan...' : activity ? 'Update' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
