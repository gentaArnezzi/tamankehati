"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "../../lib/utils";

interface EnhancedAnnouncementFormProps {
  mode: 'create' | 'edit';
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ANNOUNCEMENT_TYPES = [
  { value: 'announcement', label: 'Pengumuman' },
  { value: 'news', label: 'Berita' },
  { value: 'event', label: 'Event' },
  { value: 'maintenance', label: 'Maintenance' }
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Rendah', color: 'bg-gray-500' },
  { value: 'normal', label: 'Normal', color: 'bg-blue-500' },
  { value: 'high', label: 'Tinggi', color: 'bg-orange-500' },
  { value: 'urgent', label: 'Mendesak', color: 'bg-red-500' }
];

const TARGET_AUDIENCES = [
  { value: 'all_regional_admins', label: 'Semua Regional Admin' },
  { value: 'specific_regions', label: 'Wilayah Tertentu' },
  { value: 'specific_users', label: 'User Tertentu' }
];

export default function EnhancedAnnouncementForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}: EnhancedAnnouncementFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    type: 'announcement',
    priority: 'normal',
    target_audience: 'all_regional_admins',
    target_regions: [] as string[],
    target_user_ids: [] as number[],
    requires_acknowledgment: false,
    is_featured: false,
    is_pinned: false,
    expires_at: null as Date | null,
    tags: '',
    featured_image: '',
    attachments: [] as any[]
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
        summary: initialData.summary || '',
        type: initialData.type || 'announcement',
        priority: initialData.priority || 'normal',
        target_audience: initialData.target_audience || 'all_regional_admins',
        target_regions: initialData.target_regions || [],
        target_user_ids: initialData.target_user_ids || [],
        requires_acknowledgment: initialData.requires_acknowledgment || false,
        is_featured: initialData.is_featured || false,
        is_pinned: initialData.is_pinned || false,
        expires_at: initialData.expires_at ? new Date(initialData.expires_at) : null,
        tags: initialData.tags || '',
        featured_image: initialData.featured_image || '',
        attachments: initialData.attachments || []
      });
      
      if (initialData.expires_at) {
        setSelectedDate(new Date(initialData.expires_at));
      }
      
      if (initialData.tags) {
        setTags(initialData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean));
      }
    }
  }, [initialData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    handleInputChange('expires_at', date);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      setFormData(prev => ({
        ...prev,
        tags: updatedTags.join(', ')
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    setFormData(prev => ({
      ...prev,
      tags: updatedTags.join(', ')
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const selectedPriority = PRIORITY_LEVELS.find(p => p.value === formData.priority);

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {mode === 'create' ? 'Buat Pengumuman Baru' : 'Edit Pengumuman'}
          </CardTitle>
          <CardDescription>
            {mode === 'create' 
              ? 'Buat pengumuman baru untuk Regional Admin' 
              : 'Edit pengumuman yang sudah ada'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium">
                    Judul Pengumuman *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Masukkan judul pengumuman"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="summary" className="text-sm font-medium">
                    Ringkasan
                  </Label>
                  <Textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) => handleInputChange('summary', e.target.value)}
                    placeholder="Ringkasan singkat pengumuman"
                    className="mt-1 min-h-[80px]"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="content" className="text-sm font-medium">
                    Konten Pengumuman *
                  </Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Masukkan konten pengumuman lengkap"
                    className="mt-1 min-h-[200px]"
                    rows={8}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Jenis Pengumuman</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Pilih jenis pengumuman" />
                    </SelectTrigger>
                    <SelectContent>
                      {ANNOUNCEMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Prioritas</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Pilih prioritas" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_LEVELS.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${priority.color}`} />
                            {priority.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedPriority && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${selectedPriority.color}`} />
                      <span className="text-sm text-muted-foreground">{selectedPriority.label}</span>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium">Target Audience</Label>
                  <Select value={formData.target_audience} onValueChange={(value) => handleInputChange('target_audience', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Pilih target audience" />
                    </SelectTrigger>
                    <SelectContent>
                      {TARGET_AUDIENCES.map((audience) => (
                        <SelectItem key={audience.value} value={audience.value}>
                          {audience.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="featured_image" className="text-sm font-medium">
                    Featured Image URL
                  </Label>
                  <Input
                    id="featured_image"
                    value={formData.featured_image}
                    onChange={(e) => handleInputChange('featured_image', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Tanggal Expired</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pilih tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label className="text-sm font-medium">Tags</Label>
              <div className="mt-1 space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Tambahkan tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Tambah
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="requires_acknowledgment"
                  checked={formData.requires_acknowledgment}
                  onCheckedChange={(checked) => handleInputChange('requires_acknowledgment', checked)}
                />
                <Label htmlFor="requires_acknowledgment" className="text-sm">
                  Wajib Acknowledgment
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                />
                <Label htmlFor="is_featured" className="text-sm">
                  Featured
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_pinned"
                  checked={formData.is_pinned}
                  onCheckedChange={(checked) => handleInputChange('is_pinned', checked)}
                />
                <Label htmlFor="is_pinned" className="text-sm">
                  Pinned
                </Label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Menyimpan...' : (mode === 'create' ? 'Buat Pengumuman' : 'Update Pengumuman')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
