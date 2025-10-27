'use client';

import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface RegionData {
  provinsi?: string;
  kota_kabupaten?: string;
  kecamatan?: string;
  desa_kelurahan?: string;
}

interface IndonesiaRegionSelectorProps {
  onRegionChange: (data: RegionData) => void;
  initialValues?: RegionData;
}

export function IndonesiaRegionSelector({
  onRegionChange,
  initialValues = {},
}: IndonesiaRegionSelectorProps) {
  const handleChange = (field: keyof RegionData, value: string) => {
    onRegionChange({
      ...initialValues,
      [field]: value,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="provinsi">Provinsi</Label>
        <Input
          id="provinsi"
          value={initialValues.provinsi || ''}
          onChange={(e) => handleChange('provinsi', e.target.value)}
          placeholder="Jawa Barat"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="kota_kabupaten">Kota/Kabupaten</Label>
        <Input
          id="kota_kabupaten"
          value={initialValues.kota_kabupaten || ''}
          onChange={(e) => handleChange('kota_kabupaten', e.target.value)}
          placeholder="Kabupaten Bogor"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="kecamatan">Kecamatan</Label>
        <Input
          id="kecamatan"
          value={initialValues.kecamatan || ''}
          onChange={(e) => handleChange('kecamatan', e.target.value)}
          placeholder="Cibinong"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="desa_kelurahan">Desa/Kelurahan</Label>
        <Input
          id="desa_kelurahan"
          value={initialValues.desa_kelurahan || ''}
          onChange={(e) => handleChange('desa_kelurahan', e.target.value)}
          placeholder="Cibinong"
        />
      </div>
    </div>
  );
}
