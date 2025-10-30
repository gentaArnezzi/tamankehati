"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Filter, SlidersHorizontal } from "lucide-react";
import { trackEvent } from "../../../lib/analytics";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet";

const FilterSchema = z.object({
  search: z.string().optional(),
  famili: z.string().optional(),
  status_iucn: z.string().optional(),
  wilayah: z.string().optional(),
});

type FilterValues = z.infer<typeof FilterSchema>;

type FieldLabels = Partial<Record<keyof FilterValues, string>>;

type FacetFiltersProps = {
  defaultValues: FilterValues;
  options: {
    famili: string[];
    status_iucn: string[];
    wilayah: string[];
  };
  targetPath: string;
  title?: string;
  fieldLabels?: FieldLabels;
};

export function FacetFilters({
  defaultValues,
  options,
  targetPath,
  title = "Filter",
  fieldLabels,
}: FacetFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FilterValues>({
    resolver: zodResolver(FilterSchema),
    defaultValues: {
      search: params?.get("search") ?? defaultValues.search ?? "",
      famili: params?.get("famili") ?? defaultValues.famili ?? "__all__",
      status_iucn:
        params?.get("status_iucn") ?? defaultValues.status_iucn ?? "__all__",
      wilayah: params?.get("wilayah") ?? defaultValues.wilayah ?? "__all__",
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    const query = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => {
      if (value && value !== "__all__") {
        query.set(key, value);
      }
    });
    const payload = Object.fromEntries(
      Object.entries(values).filter(
        ([, value]) => value && value !== "__all__",
      ),
    );
    trackEvent({
      event: "public_filters_applied",
      payload: {
        resource: targetPath,
        ...payload,
      },
    });

    startTransition(() => {
      const qs = query.toString();
      router.push(qs ? `${targetPath}?${qs}` : targetPath);
    });
  });

  const handleReset = () => {
    form.reset({
      search: "",
      famili: "__all__",
      status_iucn: "__all__",
      wilayah: "__all__",
    });
    trackEvent({
      event: "public_filters_reset",
      payload: { resource: targetPath },
    });
    startTransition(() => {
      router.push(targetPath);
    });
  };

  const labels: FieldLabels = {
    search: "Kata kunci",
    famili: "Famili",
    status_iucn: "Status IUCN",
    wilayah: "Provinsi",
    ...fieldLabels,
  };

  return (
    <div className="w-full">
      <div className="bg-slate-50 rounded-xl p-6">
        <form onSubmit={handleSubmit}>
          {/* Single Row Filter */}
          <div className="flex flex-col lg:flex-row items-start lg:items-end gap-4">
            {/* Search - Takes more space */}
            <div className="flex-1 w-full space-y-2">
              <label
                htmlFor="search"
                className="text-sm font-light text-slate-700"
              >
                {labels.search}
              </label>
              <Input
                id="search"
                placeholder="Cari nama ilmiah atau lokal"
                {...form.register("search")}
                className="h-11 bg-white border-slate-200 focus:border-slate-900 focus:ring-slate-900"
              />
            </div>

            {/* Famili */}
            {options.famili && options.famili.length > 0 && (
              <div className="w-full lg:w-56 space-y-2">
                <label className="text-sm font-light text-slate-700">
                  {labels.famili}
                </label>
                <Select
                  onValueChange={(value) => form.setValue("famili", value)}
                  value={form.watch("famili")}
                >
                  <SelectTrigger className="w-full h-11 bg-white border-slate-200">
                    <SelectValue
                      placeholder={`Semua ${labels.famili?.toLowerCase() ?? "famili"}`}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Semua famili</SelectItem>
                    {options.famili.map((familia) => (
                      <SelectItem key={familia} value={familia}>
                        {familia}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Status IUCN */}
            {options.status_iucn && options.status_iucn.length > 0 && (
              <div className="w-full lg:w-48 space-y-2">
                <label className="text-sm font-light text-slate-700">
                  {labels.status_iucn}
                </label>
                <Select
                  onValueChange={(value) => form.setValue("status_iucn", value)}
                  value={form.watch("status_iucn")}
                >
                  <SelectTrigger className="w-full h-11 bg-white border-slate-200">
                    <SelectValue placeholder="Semua status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Semua status</SelectItem>
                    {options.status_iucn.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Wilayah */}
            {options.wilayah && options.wilayah.length > 0 && (
              <div className="w-full lg:w-56 space-y-2">
                <label className="text-sm font-light text-slate-700">
                  {labels.wilayah}
                </label>
                <Select
                  onValueChange={(value) => form.setValue("wilayah", value)}
                  value={form.watch("wilayah")}
                >
                  <SelectTrigger className="w-full h-11 bg-white border-slate-200">
                    <SelectValue
                      placeholder={`Semua ${labels.wilayah?.toLowerCase() ?? "provinsi"}`}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Semua provinsi</SelectItem>
                    {options.wilayah.map((wilayah) => (
                      <SelectItem key={wilayah} value={wilayah}>
                        {wilayah}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 w-full lg:w-auto">
              <Button
                type="submit"
                className="flex-1 lg:flex-none bg-slate-900 hover:bg-slate-800 text-white h-11 px-6"
                disabled={isPending}
              >
                {isPending ? "Menerapkan..." : "Filter"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="h-11 px-4 text-slate-600 hover:text-slate-900 border-slate-200"
              >
                Reset
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Mobile drawer */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-center gap-2 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {title}
          </Button>
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="max-h-[80vh] overflow-y-auto rounded-t-3xl"
        >
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-left">
              <Filter className="h-5 w-5" />
              {title}
            </SheetTitle>
          </SheetHeader>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="search-mobile"
                className="text-sm font-medium text-slate-700"
              >
                {labels.search}
              </label>
              <Input
                id="search-mobile"
                placeholder="Cari nama ilmiah atau lokal"
                {...form.register("search")}
              />
            </div>

            {options.famili && options.famili.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  {labels.famili}
                </label>
                <Select
                  onValueChange={(value) => form.setValue("famili", value)}
                  value={form.watch("famili")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={`Semua ${labels.famili?.toLowerCase() ?? "famili"}`}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Semua pilihan</SelectItem>
                    {options.famili.map((familia) => (
                      <SelectItem key={familia} value={familia}>
                        {familia}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {options.status_iucn && options.status_iucn.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  {labels.status_iucn}
                </label>
                <Select
                  onValueChange={(value) => form.setValue("status_iucn", value)}
                  value={form.watch("status_iucn")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Semua status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Semua status</SelectItem>
                    {options.status_iucn.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {options.wilayah && options.wilayah.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  {labels.wilayah}
                </label>
                <Select
                  onValueChange={(value) => form.setValue("wilayah", value)}
                  value={form.watch("wilayah")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={`Semua ${labels.wilayah?.toLowerCase() ?? "provinsi"}`}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Semua pilihan</SelectItem>
                    {options.wilayah.map((wilayah) => (
                      <SelectItem key={wilayah} value={wilayah}>
                        {wilayah}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-500"
                disabled={isPending}
              >
                Terapkan
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isPending}
              >
                Atur ulang
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
