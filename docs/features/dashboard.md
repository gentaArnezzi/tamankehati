# 📊 Dashboard System

Comprehensive guide to the admin dashboard functionality in Taman Kehati.

## Overview

The Taman Kehati dashboard provides a centralized interface for managing biodiversity data, monitoring activities, and analyzing park information. It offers role-based access control with different views for different user types.

## Dashboard Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Dashboard Layout                         │
│                 (Header, Sidebar, Main)                     │
├─────────────────────────────────────────────────────────────┤
│                    Widget System                            │
│              (Stats, Charts, Tables)                        │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                               │
│              (API Calls, State Management)                  │
├─────────────────────────────────────────────────────────────┤
│                    Visualization Layer                      │
│              (Charts, Maps, Tables)                         │
└─────────────────────────────────────────────────────────────┘
```

## Dashboard Components

### Main Dashboard Layout
```typescript
// src/app/(dashboard)/dashboard/page.tsx
import { StatsCards } from '@/components/features/dashboard/stats-cards';
import { RecentActivities } from '@/components/features/dashboard/recent-activities';
import { ParkOverview } from '@/components/features/dashboard/park-overview';
import { BiodiversityChart } from '@/components/features/dashboard/biodiversity-chart';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredRoles={['super_admin', 'regional_admin', 'park_admin', 'user']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to Taman Kehati management system</p>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BiodiversityChart />
          <ParkOverview />
        </div>

        {/* Activities */}
        <RecentActivities />
      </div>
    </ProtectedRoute>
  );
}
```

### Stats Cards Component
```typescript
// src/components/features/dashboard/stats-cards.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useParks } from '@/hooks/use-parks';
import { useFlora } from '@/hooks/use-flora';
import { useFauna } from '@/hooks/use-fauna';
import { useActivities } from '@/hooks/use-activities';
import { Map, TreePine, Rabbit, Calendar, TrendingUp, Users } from 'lucide-react';

export function StatsCards() {
  const { data: parks } = useParks();
  const { data: flora } = useFlora();
  const { data: fauna } = useFauna();
  const { data: activities } = useActivities();

  const stats = [
    {
      title: 'Total Parks',
      value: parks?.length || 0,
      icon: Map,
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      title: 'Flora Species',
      value: flora?.length || 0,
      icon: TreePine,
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      title: 'Fauna Species',
      value: fauna?.length || 0,
      icon: Rabbit,
      change: '+5%',
      changeType: 'positive' as const,
    },
    {
      title: 'Active Activities',
      value: activities?.filter(a => a.status === 'ongoing').length || 0,
      icon: Calendar,
      change: '+3%',
      changeType: 'positive' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className={`text-xs ${
              stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {stat.change} from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### Biodiversity Chart Component
```typescript
// src/components/features/dashboard/biodiversity-chart.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useBiodiversityStats } from '@/hooks/use-biodiversity-stats';

export function BiodiversityChart() {
  const { data: stats, isLoading } = useBiodiversityStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Biodiversity Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Biodiversity Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={stats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="flora" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Flora Species"
            />
            <Line 
              type="monotone" 
              dataKey="fauna" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Fauna Species"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

### Recent Activities Component
```typescript
// src/components/features/dashboard/recent-activities.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useActivities } from '@/hooks/use-activities';
import { Calendar, Clock, User, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function RecentActivities() {
  const { data: activities, isLoading } = useActivities({ limit: 10 });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities?.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.title}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(new Date(activity.start_date))} ago
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    Park {activity.park_id}
                  </div>
                  {activity.assigned_to && (
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      Assigned
                    </div>
                  )}
                </div>
              </div>
              <Badge variant={
                activity.status === 'completed' ? 'default' :
                activity.status === 'ongoing' ? 'secondary' : 'outline'
              }>
                {activity.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

## Role-Based Dashboard Views

### Super Admin Dashboard
```typescript
// src/components/features/dashboard/super-admin-dashboard.tsx
import { StatsCards } from './stats-cards';
import { UserManagement } from './user-management';
import { SystemSettings } from './system-settings';
import { GlobalAnalytics } from './global-analytics';

export function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="text-gray-600">System-wide management and analytics</p>
      </div>

      <StatsCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlobalAnalytics />
        <UserManagement />
      </div>
      
      <SystemSettings />
    </div>
  );
}
```

### Regional Admin Dashboard
```typescript
// src/components/features/dashboard/regional-admin-dashboard.tsx
import { RegionalStatsCards } from './regional-stats-cards';
import { RegionalParks } from './regional-parks';
import { RegionalActivities } from './regional-activities';

export function RegionalAdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Regional Dashboard</h1>
        <p className="text-gray-600">Manage parks and activities in your region</p>
      </div>

      <RegionalStatsCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RegionalParks />
        <RegionalActivities />
      </div>
    </div>
  );
}
```

### Park Admin Dashboard
```typescript
// src/components/features/dashboard/park-admin-dashboard.tsx
import { ParkStatsCards } from './park-stats-cards';
import { ParkOverview } from './park-overview';
import { ParkActivities } from './park-activities';
import { SpeciesManagement } from './species-management';

export function ParkAdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Park Dashboard</h1>
        <p className="text-gray-600">Manage your assigned park</p>
      </div>

      <ParkStatsCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ParkOverview />
        <SpeciesManagement />
      </div>
      
      <ParkActivities />
    </div>
  );
}
```

## Dashboard Hooks

### Dashboard Data Hooks
```typescript
// src/hooks/use-dashboard.ts
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api-client';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
  });
}

export function useBiodiversityStats() {
  return useQuery({
    queryKey: ['biodiversity-stats'],
    queryFn: dashboardApi.getBiodiversityStats,
  });
}

export function useRecentActivities(limit: number = 10) {
  return useQuery({
    queryKey: ['recent-activities', limit],
    queryFn: () => dashboardApi.getRecentActivities(limit),
  });
}

export function useParkOverview(parkId?: number) {
  return useQuery({
    queryKey: ['park-overview', parkId],
    queryFn: () => dashboardApi.getParkOverview(parkId),
    enabled: !!parkId,
  });
}
```

## Dashboard API

### Dashboard Endpoints
```python
# api/v1/endpoints/dashboard.py
from fastapi import APIRouter, Depends
from core.dependencies import get_current_user
from services.dashboard_service import DashboardService
from typing import Dict, Any

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(
    current_user = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get dashboard statistics"""
    dashboard_service = DashboardService(current_user)
    return await dashboard_service.get_stats()

@router.get("/biodiversity-stats")
async def get_biodiversity_stats(
    current_user = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get biodiversity statistics"""
    dashboard_service = DashboardService(current_user)
    return await dashboard_service.get_biodiversity_stats()

@router.get("/recent-activities")
async def get_recent_activities(
    limit: int = 10,
    current_user = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get recent activities"""
    dashboard_service = DashboardService(current_user)
    return await dashboard_service.get_recent_activities(limit)
```

### Dashboard Service
```python
# services/dashboard_service.py
from sqlalchemy.orm import Session
from models.user import User
from models.park import Park
from models.flora import Flora
from models.fauna import Fauna
from models.activity import Activity
from typing import Dict, Any, List
from datetime import datetime, timedelta

class DashboardService:
    def __init__(self, user: User, db: Session):
        self.user = user
        self.db = db
    
    async def get_stats(self) -> Dict[str, Any]:
        """Get dashboard statistics based on user role"""
        if self.user.has_role("super_admin"):
            return await self._get_super_admin_stats()
        elif self.user.has_role("regional_admin"):
            return await self._get_regional_admin_stats()
        elif self.user.has_role("park_admin"):
            return await self._get_park_admin_stats()
        else:
            return await self._get_user_stats()
    
    async def _get_super_admin_stats(self) -> Dict[str, Any]:
        """Get super admin statistics"""
        total_parks = self.db.query(Park).count()
        total_flora = self.db.query(Flora).count()
        total_fauna = self.db.query(Fauna).count()
        active_activities = self.db.query(Activity).filter(
            Activity.status == "ongoing"
        ).count()
        
        return {
            "total_parks": total_parks,
            "total_flora": total_flora,
            "total_fauna": total_fauna,
            "active_activities": active_activities,
        }
    
    async def _get_regional_admin_stats(self) -> Dict[str, Any]:
        """Get regional admin statistics"""
        # Get parks in user's region
        regional_parks = self.db.query(Park).filter(
            Park.region_id == self.user.region_id
        ).all()
        
        park_ids = [park.id for park in regional_parks]
        
        total_flora = self.db.query(Flora).filter(
            Flora.park_id.in_(park_ids)
        ).count()
        
        total_fauna = self.db.query(Fauna).filter(
            Fauna.park_id.in_(park_ids)
        ).count()
        
        active_activities = self.db.query(Activity).filter(
            Activity.park_id.in_(park_ids),
            Activity.status == "ongoing"
        ).count()
        
        return {
            "total_parks": len(regional_parks),
            "total_flora": total_flora,
            "total_fauna": total_fauna,
            "active_activities": active_activities,
        }
    
    async def get_biodiversity_stats(self) -> List[Dict[str, Any]]:
        """Get biodiversity statistics over time"""
        # Get data for last 12 months
        stats = []
        for i in range(12):
            date = datetime.now() - timedelta(days=30 * i)
            month_start = date.replace(day=1)
            month_end = month_start + timedelta(days=32)
            month_end = month_end.replace(day=1) - timedelta(days=1)
            
            flora_count = self.db.query(Flora).filter(
                Flora.created_at >= month_start,
                Flora.created_at <= month_end
            ).count()
            
            fauna_count = self.db.query(Fauna).filter(
                Fauna.created_at >= month_start,
                Fauna.created_at <= month_end
            ).count()
            
            stats.append({
                "month": month_start.strftime("%b %Y"),
                "flora": flora_count,
                "fauna": fauna_count,
            })
        
        return list(reversed(stats))
```

## Related Documentation

- [Frontend Components](../development/frontend-components.md)
- [Authentication System](../security/authentication.md)
- [Park Management](park-management.md)
- [Interactive Maps](interactive-maps.md)
