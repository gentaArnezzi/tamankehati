'use client';

import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  backButton?: {
    label: string;
    onClick: () => void;
  };
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-3xl',
  md: 'max-w-4xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-7xl',
  full: 'max-w-full',
};

export function PageLayout({
  children,
  title,
  subtitle,
  action,
  backButton,
  maxWidth = '2xl',
}: PageLayoutProps) {
  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        {/* Back Button */}
        {backButton && (
          <button
            onClick={backButton.onClick}
            className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{backButton.label}</span>
          </button>
        )}

        {/* Title & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-600">
                {subtitle}
              </p>
            )}
          </div>
          {action && (
            <div className="flex-shrink-0">
              {action}
            </div>
          )}
        </div>
      </div>

      {/* Page Content */}
      <div className={`w-full ${maxWidthClasses[maxWidth]} mx-auto`}>
        {children}
      </div>
    </div>
  );
}

interface PageSectionProps {
  children: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function PageSection({
  children,
  title,
  description,
  action,
  className = '',
  noPadding = false,
}: PageSectionProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      {(title || description || action) && (
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              {title && (
                <h2 className="text-base font-semibold text-black">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-600">
                  {description}
                </p>
              )}
            </div>
            {action && (
              <div className="flex-shrink-0">
                {action}
              </div>
            )}
          </div>
        </div>
      )}
      <div className={noPadding ? '' : 'p-4 sm:p-6'}>
        {children}
      </div>
    </div>
  );
}

interface PageGridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 4 | 6 | 8;
}

export function PageGrid({ children, cols = 3, gap = 6 }: PageGridProps) {
  const colsClass = {
    1: 'grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  const gapClass = {
    4: 'gap-4',
    6: 'gap-4 sm:gap-6',
    8: 'gap-4 sm:gap-6 lg:gap-8',
  };

  return (
    <div className={`grid ${colsClass[cols]} ${gapClass[gap]}`}>
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-bold text-black">{value}</p>
            {trend && (
              <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 sm:py-16">
      {icon && (
        <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 mb-4 text-gray-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-black mb-2">{title}</h3>
      <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}


