# 📊 CHART ANALYTICS RECOMMENDATIONS
**For Taman Kehati Dashboard - Real Data Implementation**

---

## 🎯 CHART TYPES DARI DEMO DASHBOARD

### **Overview Tab - Demo**

#### 1. **Bar Chart - Distribusi Spesies per Wilayah** ✅ (SUDAH ADA)
```javascript
Current: Bar Chart dengan Flora & Fauna per Provinsi
Data: Real dari database (flora + fauna per provinsi)
Status: ✅ Implemented
```

#### 2. **Pie Chart - Status Konservasi IUCN** 🔥 (PERLU DITAMBAH)
```javascript
Chart Type: Pie Chart
Data Source: flora.iucn_status + fauna.iucn_status

SQL Query:
SELECT 
    iucn_status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
FROM (
    SELECT iucn_status FROM flora WHERE iucn_status IS NOT NULL
    UNION ALL
    SELECT iucn_status FROM fauna WHERE iucn_status IS NOT NULL
) combined
GROUP BY iucn_status
ORDER BY count DESC

Expected Data:
[
  { status: 'LC (Least Concern)', count: 450, percentage: 35 },
  { status: 'NT (Near Threatened)', count: 320, percentage: 25 },
  { status: 'VU (Vulnerable)', count: 230, percentage: 18 },
  { status: 'EN (Endangered)', count: 150, percentage: 12 },
  { status: 'CR (Critically Endangered)', count: 100, percentage: 8 },
  { status: 'DD (Data Deficient)', count: 50, percentage: 2 }
]

Colors: 
- LC: #10B981 (Green)
- NT: #84CC16 (Yellow-Green)
- VU: #F59E0B (Orange)
- EN: #EF4444 (Red)
- CR: #DC2626 (Dark Red)
- DD: #6B7280 (Gray)
```

#### 3. **Composed Chart - Penemuan Spesies Bulanan** ✅ (SUDAH ADA)
```javascript
Current: Line Chart dengan monthly discoveries
Enhancement: Add Publications data (dari articles.created_at)
Status: ✅ Implemented (bisa di-enhance)
```

---

### **Biodiversity Tab - Demo**

#### 4. **Horizontal Bar Chart - Spesies Endemik per Wilayah** 🔥 (PERLU DITAMBAH)
```javascript
Chart Type: Horizontal Bar Chart
Data Source: flora + fauna dengan is_endemic = true

SQL Query:
SELECT 
    COALESCE(p.provinsi, 'Tidak Diketahui') as region,
    COUNT(DISTINCT f.id) + COUNT(DISTINCT fa.id) as endemic_count
FROM parks p
LEFT JOIN flora f ON f.park_id = p.id AND f.is_endemic = true
LEFT JOIN fauna fa ON fa.park_id = p.id AND fa.is_endemic = true
WHERE p.provinsi IS NOT NULL
GROUP BY p.provinsi
ORDER BY endemic_count DESC
LIMIT 10

Expected Data:
[
  { region: 'Papua', endemic: 156 },
  { region: 'Sulawesi', endemic: 89 },
  { region: 'Kalimantan', endemic: 67 },
  { region: 'Sumatra', endemic: 45 },
  { region: 'Jawa', endemic: 28 }
]

Visualization:
- Horizontal orientation untuk readability
- Color: #8B5CF6 (Purple) untuk endemic
- Sort: Descending by count
```

#### 5. **Scatter Chart - Kepadatan Spesies vs Luas Area** 🔥 (PERLU DITAMBAH)
```javascript
Chart Type: Scatter Plot
Data Source: parks.area_ha vs species count

SQL Query:
SELECT 
    p.name,
    COALESCE(p.area_ha, 0) as area,
    COUNT(DISTINCT f.id) + COUNT(DISTINCT fa.id) as species_count,
    COUNT(DISTINCT CASE WHEN f.is_endemic = true THEN f.id END) + 
    COUNT(DISTINCT CASE WHEN fa.is_endemic = true THEN fa.id END) as endemic_count
FROM parks p
LEFT JOIN flora f ON f.park_id = p.id
LEFT JOIN fauna fa ON fa.park_id = p.id
GROUP BY p.id, p.name, p.area_ha
HAVING COUNT(DISTINCT f.id) + COUNT(DISTINCT fa.id) > 0
ORDER BY species_count DESC

Expected Data:
[
  { name: 'Taman A', area: 15000, species: 450, endemic: 89 },
  { name: 'Taman B', area: 12500, species: 380, endemic: 67 },
  ...
]

Visualization:
- X-Axis: area (Luas Area in ha)
- Y-Axis: species_count (Jumlah Spesies)
- Bubble size: endemic_count (Spesies Endemik)
- Color: #F59E0B (Orange)
- Tooltip: Show park name, area, species, endemic
```

#### 6. **Radial Bar Chart - Status Konservasi Radial** 🎨 (ADVANCED)
```javascript
Chart Type: Radial Bar Chart
Data Source: Same as Pie Chart (IUCN Status)

Purpose: Alternative visualization untuk conservation status
Style: Modern, eye-catching
Colors: Gradient from green (LC) to red (CR)

Use Case: 
- Visual impact lebih besar
- Good for presentations
- Emphasize endangered species
```

---

### **Conservation Tab - Demo**

#### 7. **Bar Chart - Luas Taman Nasional** ✅ (SUDAH ADA dengan enhancement)
```javascript
Current: Composed Chart dengan Area + Species
Enhancement: Add separate bar chart untuk area only
Status: ✅ Implemented
```

#### 8. **Scatter Chart - Pengunjung vs Spesies** 🌟 (REQUIRES NEW DATA)
```javascript
Chart Type: Scatter Plot
Data Source: parks dengan visitor data (BELUM ADA DI DATABASE)

Note: Database tidak punya field 'visitors' atau 'visitor_count'
Recommendation: 
- Skip untuk sekarang
- Atau tambah field 'annual_visitors' ke parks table di future
```

#### 9. **Treemap - Distribusi Taman Nasional** 🎨 (ADVANCED)
```javascript
Chart Type: Treemap
Data Source: parks.area_ha

SQL Query:
SELECT 
    p.name,
    p.area_ha as size,
    p.provinsi as category,
    COUNT(DISTINCT f.id) + COUNT(DISTINCT fa.id) as species
FROM parks p
LEFT JOIN flora f ON f.park_id = p.id
LEFT JOIN fauna fa ON fa.park_id = p.id
GROUP BY p.id, p.name, p.area_ha, p.provinsi
ORDER BY p.area_ha DESC

Visualization:
- Size: area_ha (larger areas = bigger blocks)
- Color: By provinsi or species count
- Label: Park name + area
- Tooltip: Show species count

Benefits:
- See size comparison at a glance
- Hierarchical view of parks
- Good for large datasets
```

---

### **Research Tab - Demo**

#### 10. **Area Chart - Aktivitas Riset Tahunan** 🔥 (BISA DIBUAT)
```javascript
Chart Type: Stacked Area Chart
Data Source: articles, activities, news (grouped by year)

SQL Query:
SELECT 
    EXTRACT(YEAR FROM created_at) as year,
    COUNT(CASE WHEN table_name = 'articles' THEN 1 END) as articles,
    COUNT(CASE WHEN table_name = 'activities' THEN 1 END) as activities,
    COUNT(CASE WHEN table_name = 'news' THEN 1 END) as news
FROM (
    SELECT created_at, 'articles' as table_name FROM articles
    UNION ALL
    SELECT created_at, 'activities' FROM activities
    UNION ALL
    SELECT created_at, 'news' FROM news
) combined
WHERE created_at >= NOW() - INTERVAL '5 years'
GROUP BY year
ORDER BY year

Expected Data:
[
  { year: 2020, articles: 45, activities: 120, news: 67 },
  { year: 2021, articles: 52, activities: 145, news: 78 },
  { year: 2022, articles: 67, activities: 180, news: 89 },
  { year: 2023, articles: 73, activities: 195, news: 95 },
  { year: 2024, articles: 89, activities: 220, news: 102 }
]

Visualization:
- Stacked areas for cumulative effect
- Colors: Articles (green), Activities (blue), News (orange)
- Show growth over time
```

#### 11. **Funnel Chart - Output Riset** 🎨 (ADVANCED)
```javascript
Chart Type: Funnel Chart
Data Source: Workflow stages (draft → review → approved)

SQL Query:
SELECT 
    'Total Submitted' as stage,
    COUNT(*) as count
FROM (
    SELECT id FROM articles
    UNION ALL SELECT id FROM flora
    UNION ALL SELECT id FROM fauna
    UNION ALL SELECT id FROM activities
) combined

UNION ALL

SELECT 'In Review', COUNT(*)
FROM (
    SELECT id FROM articles WHERE status = 'in_review'
    UNION ALL SELECT id FROM flora WHERE status = 'in_review'
    ...
) combined

UNION ALL

SELECT 'Approved', COUNT(*)
FROM (
    SELECT id FROM articles WHERE status = 'approved'
    ...
) combined

Expected Data:
[
  { stage: 'Total Submitted', count: 1000, fill: '#10B981' },
  { stage: 'In Review', count: 250, fill: '#3B82F6' },
  { stage: 'Approved', count: 650, fill: '#F59E0B' },
  { stage: 'Published', count: 500, fill: '#8B5CF6' }
]

Use Case:
- Show approval workflow conversion
- Identify bottlenecks
- Track approval efficiency
```

---

### **Trends Tab - Demo**

#### 12. **Line Chart - Trend Penemuan Spesies** ✅ (SUDAH ADA)
```javascript
Current: Line Chart dengan monthly discoveries
Status: ✅ Implemented
```

#### 13. **Area Chart - Pertumbuhan Riset** 🔥 (PERLU DITAMBAH)
```javascript
Chart Type: Area Chart (single series)
Data Source: Research activities growth

Same as #10 but focusing on single metric
```

---

## 🎯 ADDITIONAL CHART ANALYTICS (RECOMMENDED)

### **14. Heatmap - Activity by Day & Hour** 🔥
```javascript
Chart Type: Calendar Heatmap
Data Source: created_at timestamps

Purpose: Show peak activity times
Visualization:
- X-Axis: Hour of day (0-23)
- Y-Axis: Day of week (Mon-Sun)
- Color intensity: Number of submissions

SQL Query:
SELECT 
    EXTRACT(DOW FROM created_at) as day_of_week,
    EXTRACT(HOUR FROM created_at) as hour,
    COUNT(*) as activity_count
FROM (
    SELECT created_at FROM flora
    UNION ALL SELECT created_at FROM fauna
    UNION ALL SELECT created_at FROM articles
    UNION ALL SELECT created_at FROM activities
) combined
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY day_of_week, hour
ORDER BY day_of_week, hour
```

### **15. Gauge Chart - Approval Rate** 🎯
```javascript
Chart Type: Gauge/Speedometer
Data Source: Approval percentage

Purpose: Show overall system health
Ranges:
- 0-50%: Red (Poor)
- 51-75%: Orange (Fair)
- 76-90%: Yellow (Good)
- 91-100%: Green (Excellent)

SQL Query:
SELECT 
    ROUND(
        COUNT(CASE WHEN status = 'approved' THEN 1 END) * 100.0 / 
        COUNT(CASE WHEN status IN ('approved', 'rejected') THEN 1 END), 
    1) as approval_rate
FROM (
    SELECT status FROM flora
    UNION ALL SELECT status FROM fauna
    UNION ALL SELECT status FROM parks
    UNION ALL SELECT status FROM activities
    UNION ALL SELECT status FROM articles
) combined
```

### **16. Sankey Diagram - Content Flow** 🎨
```javascript
Chart Type: Sankey Diagram
Data Source: Workflow transitions

Purpose: Visualize content flow from submission to publication
Nodes: Draft → In Review → Approved/Rejected
Links: Show volume of transitions

Example Flow:
Draft (1000) → In Review (800) → Approved (650)
                               → Rejected (150)
In Review → Back to Draft (50)
```

### **17. Word Cloud - Species Names** ☁️
```javascript
Chart Type: Word Cloud
Data Source: local_name, scientific_name from flora & fauna

Purpose: Visualize most common species families/genera
Size: Frequency of occurrence
Color: Random or by family

SQL Query:
SELECT 
    family,
    COUNT(*) as frequency
FROM (
    SELECT family FROM flora WHERE family IS NOT NULL
    UNION ALL
    SELECT family FROM fauna WHERE family IS NOT NULL
) combined
GROUP BY family
ORDER BY frequency DESC
LIMIT 50
```

### **18. Network Graph - User Collaboration** 🕸️
```javascript
Chart Type: Network Graph
Data Source: submitted_by, approved_by relationships

Purpose: Show collaboration patterns
Nodes: Users
Edges: Approval relationships (who approves whose submissions)

SQL Query:
SELECT 
    submitted_by as source_user_id,
    approved_by as target_user_id,
    COUNT(*) as collaboration_count
FROM (
    SELECT submitted_by, approved_by FROM flora WHERE approved_by IS NOT NULL
    UNION ALL SELECT submitted_by, approved_by FROM fauna WHERE approved_by IS NOT NULL
    ...
) combined
GROUP BY submitted_by, approved_by
```

### **19. Box Plot - Approval Time Distribution** 📦
```javascript
Chart Type: Box Plot
Data Source: approved_at - submitted_at

Purpose: Show approval time statistics
Shows: Min, Q1, Median, Q3, Max, Outliers

SQL Query:
SELECT 
    'Flora' as content_type,
    EXTRACT(EPOCH FROM (approved_at - submitted_at))/3600 as hours
FROM flora
WHERE approved_at IS NOT NULL AND submitted_at IS NOT NULL

UNION ALL

SELECT 'Fauna', EXTRACT(EPOCH FROM (approved_at - submitted_at))/3600
FROM fauna
WHERE approved_at IS NOT NULL AND submitted_at IS NOT NULL

Visualization:
- Y-Axis: Hours to approve
- X-Axis: Content type
- Show median line
- Identify outliers (very slow approvals)
```

### **20. Chord Diagram - Regional Connections** 🌐
```javascript
Chart Type: Chord Diagram
Data Source: Parks and species relationships by province

Purpose: Show inter-provincial biodiversity connections
Links: Species found in multiple provinces

SQL Query:
SELECT 
    p1.provinsi as source,
    p2.provinsi as target,
    COUNT(DISTINCT f.scientific_name) as shared_species
FROM parks p1
JOIN flora f1 ON f1.park_id = p1.id
JOIN flora f2 ON f2.scientific_name = f1.scientific_name AND f2.park_id != f1.park_id
JOIN parks p2 ON f2.park_id = p2.id
WHERE p1.provinsi != p2.provinsi
GROUP BY p1.provinsi, p2.provinsi
```

---

## 🚀 IMPLEMENTATION PRIORITY

### **Phase 1: High Priority** ⭐⭐⭐
1. ✅ **Monthly Discoveries** (DONE)
2. ✅ **Regional Distribution** (DONE)
3. 🔥 **IUCN Status Pie Chart** (IMPORTANT!)
4. 🔥 **Endemic Species Horizontal Bar** (IMPORTANT!)
5. 🔥 **Scatter Plot - Area vs Species** (INSIGHTFUL!)

### **Phase 2: Medium Priority** ⭐⭐
6. **Stacked Area - Research Activity**
7. **Funnel Chart - Workflow Conversion**
8. **Gauge Chart - Approval Rate**
9. **Treemap - Park Distribution**

### **Phase 3: Advanced** ⭐
10. **Radial Bar Chart** (Visual impact)
11. **Heatmap - Activity Calendar**
12. **Box Plot - Approval Time**
13. **Sankey - Content Flow**

### **Phase 4: Nice to Have** 💡
14. **Word Cloud** (Species families)
15. **Network Graph** (Collaboration)
16. **Chord Diagram** (Regional connections)

---

## 💡 RECOMMENDED NEXT IMPLEMENTATION

### **Add to Current Dashboard:**

**Top 3 Charts to Add NOW:**

#### 1. **IUCN Status Distribution** (Pie Chart)
- **Impact**: HIGH - Shows conservation priority
- **Complexity**: LOW - Simple query
- **Time**: 30 minutes

#### 2. **Endemic Hotspots** (Horizontal Bar)
- **Impact**: HIGH - Identifies biodiversity hotspots
- **Complexity**: LOW - Simple query
- **Time**: 30 minutes

#### 3. **Park Efficiency** (Scatter: Area vs Species)
- **Impact**: MEDIUM - Shows park performance
- **Complexity**: MEDIUM - Needs aggregation
- **Time**: 1 hour

**Total Implementation Time: ~2 hours**

---

## 📝 NOTES

1. **Data Availability**: All queries use existing database fields
2. **Performance**: Add indexes on created_at, status, iucn_status for faster queries
3. **Caching**: Cache chart data for 1 hour to reduce database load
4. **Real-time**: Use WebSocket for live chart updates (optional)
5. **Export**: All charts should be exportable as PNG/PDF

---

## 🎨 DESIGN GUIDELINES

### **Color Palette:**
```javascript
const CONSERVATION_COLORS = {
  LC: '#10B981',  // Green - Least Concern
  NT: '#84CC16',  // Yellow-Green - Near Threatened
  VU: '#F59E0B',  // Orange - Vulnerable
  EN: '#EF4444',  // Red - Endangered
  CR: '#DC2626',  // Dark Red - Critically Endangered
  DD: '#6B7280'   // Gray - Data Deficient
};

const PRIMARY_COLORS = {
  flora: '#10B981',
  fauna: '#3B82F6',
  parks: '#8B5CF6',
  activities: '#F59E0B'
};
```

### **Chart Sizes:**
- Small charts: 300px height
- Medium charts: 400px height
- Large charts: 500px height
- Full-width timeline charts: 400-600px height

### **Responsive Breakpoints:**
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 2-3 columns

---

**END OF RECOMMENDATIONS**

