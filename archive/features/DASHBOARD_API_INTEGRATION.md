# Dashboard API Integration - Tamankehati

## Overview

Dashboard modern telah diintegrasikan dengan database schema Tamankehati untuk menampilkan data real dari sistem konservasi keanekaragaman hayati.

## API Endpoints

### 1. Modern Dashboard API

- **Endpoint**: `GET /api/v1/dashboard-modern/`
- **Description**: Mengambil data comprehensive untuk dashboard modern
- **Parameters**:
  - `time_range` (optional): `daily`, `weekly`, `monthly`, `yearly` (default: `yearly`)

### 2. Response Structure

```json
{
  "user_role": "super_admin" | "regional_admin",
  "user_id": 1,
  "park_id": 1,
  "time_range": "yearly",
  "date_range": {
    "start": "2024-01-01T00:00:00",
    "end": "2024-12-31T23:59:59"
  },
  "analytics": {
    "biodiversity": { ... },
    "conservation": { ... },
    "activities": { ... },
    "users": { ... },
    "geographic": { ... },
    "temporal": { ... },
    "performance": { ... }
  },
  "generated_at": "2024-10-28T10:30:00"
}
```

## Database Integration

### 1. Tables Used

- **flora**: Data spesies flora
- **fauna**: Data spesies fauna
- **parks**: Data taman konservasi
- **activities**: Data kegiatan konservasi
- **users**: Data pengguna sistem

### 2. Key Metrics

#### Biodiversity Analytics

- Total species (flora + fauna)
- Endemic species count
- IUCN status distribution
- Approval status breakdown

#### Conservation Analytics

- Total protected areas
- Area coverage (hectares)
- Park status distribution
- Regional distribution

#### Activities Analytics

- Total conservation activities
- Activity status breakdown
- Time-based patterns

#### User Analytics

- User count by role
- Active user statistics
- Role-based access control

## Role-Based Access Control

### Super Admin

- Melihat semua data sistem
- Akses penuh ke semua metrik
- Dapat melihat data dari semua regional admin

### Regional Admin

- Hanya melihat data yang mereka submit
- Filter berdasarkan `submitted_by = user.id`
- Data terbatas pada taman yang mereka kelola

## Frontend Integration

### 1. Dashboard Components

- **TamankehatiDashboard**: Dashboard utama dengan data real
- **ModernDashboard**: Dashboard dengan sample data
- **ModernDashboardWithData**: Dashboard dengan data real (legacy)

### 2. Routes Available

- `/dashboard` - Dashboard utama dengan navigasi
- `/dashboard/modern` - Modern dashboard (sample data)
- `/dashboard/data-driven` - Data-driven dashboard (legacy)
- `/dashboard/tamankehati` - **Dashboard utama dengan data real dan tab lengkap**

### 3. Features

- **Tab Navigation**: Dashboard, Biodiversity, Conservation, Activities
- **Real-time data fetching** dengan refresh button
- **Time range filtering**: Daily, Weekly, Monthly, Yearly
- **Role-based content display** dengan data scoping
- **Interactive charts dan visualizations** dengan Recharts
- **Error handling dan loading states** yang comprehensive
- **Responsive design** untuk semua device
- **Dynamic sidebar content** berdasarkan tab aktif

## Tab Features

### 1. Dashboard Tab

- **Overview metrics**: Total species, endemic species, protected areas, activities
- **Species distribution chart**: Flora vs Fauna comparison
- **Approval rates chart**: Performance by entity type
- **Monthly patterns**: Species discovery trends
- **Sidebar**: Biodiversity overview, regional distribution

### 2. Biodiversity Tab

- **Species overview cards**: Flora dan Fauna dengan statistik lengkap
- **IUCN status analysis**: Pie chart dengan distribusi status konservasi
- **Endemic species tracking**: Flora dan fauna endemik
- **Approval status breakdown**: Approved, pending, rejected
- **Sidebar**: Species summary, IUCN status breakdown

### 3. Conservation Tab

- **Parks overview**: Total parks, area coverage, average area
- **Regional distribution chart**: Bar chart parks by region
- **Conservation status**: Status distribution dengan area coverage
- **Protected area metrics**: Total, average, largest park
- **Sidebar**: Protected areas summary, status distribution

### 4. Activities Tab

- **Activities overview**: Total, approved, in review, rejected
- **Status distribution chart**: Pie chart activities by status
- **Conservation actions tracking**: Activity management
- **Performance metrics**: Approval rates per activity
- **Sidebar**: Activities overview, status breakdown

## Data Visualization

### 1. Charts Used

- **Bar Charts**: Species distribution, regional distribution, approval rates
- **Pie Charts**: IUCN status, approval breakdown, activities status
- **Area Charts**: Monthly patterns, trends
- **Progress Bars**: Performance metrics, approval rates

### 2. Color Scheme

- **Primary**: Green (#10b981) - Conservation theme
- **Secondary**: Blue (#3b82f6) - Data visualization
- **Accent**: Purple (#8b5cf6) - Highlights
- **Warning**: Yellow (#eab308) - Pending status
- **Danger**: Red (#ef4444) - Rejected status

## Performance Considerations

### 1. Database Queries

- Optimized SQL queries with proper indexing
- Role-based filtering at database level
- Efficient aggregation queries

### 2. Caching

- API responses can be cached
- Frontend implements loading states
- Error handling with retry mechanisms

### 3. Real-time Updates

- Manual refresh functionality
- Time range selection
- Dynamic data loading

## Security

### 1. Authentication

- JWT token-based authentication
- Token validation on every request
- Automatic logout on token expiry

### 2. Authorization

- Role-based access control
- Data scoping based on user role
- SQL injection prevention

### 3. Data Privacy

- Regional admin data isolation
- Sensitive data filtering
- Audit trail maintenance

## Usage Examples

### 1. Accessing Dashboard

```typescript
// Navigate to Tamankehati Dashboard
window.location.href = "/dashboard/tamankehati";

// Or use Next.js router
router.push("/dashboard/tamankehati");
```

### 2. Tab Navigation

```typescript
// Switch between tabs
const [activeTab, setActiveTab] = useState("dashboard");

// Available tabs
const tabs = [
  { id: "dashboard", name: "Dashboard" },
  { id: "biodiversity", name: "Biodiversity" },
  { id: "conservation", name: "Conservation" },
  { id: "activities", name: "Activities" },
];

// Tab switching
setActiveTab("biodiversity"); // Switch to Biodiversity tab
```

### 3. API Call

```typescript
const response = await fetch("/api/v1/dashboard-modern/?time_range=yearly", {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});
const data = await response.json();
```

### 4. Time Range Selection

```typescript
const timeRanges = ["daily", "weekly", "monthly", "yearly"];
// Update timeRange state to trigger data refresh
setTimeRange("monthly");
```

### 5. Tab-Specific Features

#### Biodiversity Tab

```typescript
// Access biodiversity data
const biodiversityData = data.analytics.biodiversity;

// Flora statistics
const floraStats = {
  total: biodiversityData.flora.total,
  endemic: biodiversityData.flora.endemic,
  approved: biodiversityData.flora.approved,
  pending: biodiversityData.flora.pending,
  rejected: biodiversityData.flora.rejected,
};

// IUCN status data
const iucnData = [
  { name: "Critically Endangered", value: biodiversityData.flora.iucn_status.critically_endangered + biodiversityData.fauna.iucn_status.critically_endangered },
  { name: "Endangered", value: biodiversityData.flora.iucn_status.endangered + biodiversityData.fauna.iucn_status.endangered },
  // ... other statuses
];
```

#### Conservation Tab

```typescript
// Access conservation data
const conservationData = data.analytics.conservation;

// Parks statistics
const parksStats = {
  total: conservationData.parks.total,
  totalArea: conservationData.parks.total_area_ha,
  avgArea: conservationData.parks.avg_area_ha,
  maxArea: conservationData.parks.max_area_ha,
};

// Regional distribution
const regionalData = data.analytics.geographic.regional_distribution;
```

#### Activities Tab

```typescript
// Access activities data
const activitiesData = data.analytics.activities;

// Activities statistics
const activitiesStats = {
  total: activitiesData.total,
  approved: activitiesData.approved,
  inReview: activitiesData.in_review,
  rejected: activitiesData.rejected,
};

// Status distribution
const statusData = activitiesData.by_status.map((status) => ({
  name: status.status.replace("_", " ").toUpperCase(),
  value: status.count,
}));
```

## Future Enhancements

### 1. Planned Features

- Real-time notifications
- Advanced filtering options
- Export functionality (PDF, Excel)
- Custom dashboard layouts
- Mobile-responsive improvements

### 2. Performance Optimizations

- Data caching strategies
- Lazy loading implementation
- Virtual scrolling for large datasets
- Optimized chart rendering

### 3. Additional Metrics

- Conservation impact metrics
- Species discovery trends
- Geographic heat maps
- Time-series analysis

## Troubleshooting

### 1. Common Issues

- **401 Unauthorized**: Check token validity
- **403 Forbidden**: Verify user role permissions
- **500 Server Error**: Check database connection
- **Empty Data**: Verify time range and user scope

### 2. Debug Steps

1. Check browser console for errors
2. Verify API endpoint accessibility
3. Confirm user authentication status
4. Check database data availability
5. Validate time range parameters

## Conclusion

Dashboard modern Tamankehati telah berhasil diintegrasikan dengan database schema yang ada, menyediakan visualisasi data real-time untuk sistem konservasi keanekaragaman hayati. Implementasi ini mendukung role-based access control dan menyediakan metrik yang relevan untuk monitoring dan evaluasi konservasi.
