# 📊 ANALISIS DATABASE - POTENSI DASHBOARD

**Generated:** $(date)
**Database:** Taman Kehati Indonesia - Biodiversity Management System

---

## 🗄️ DATABASE SCHEMA OVERVIEW

### **Core Entities (8 Tables)**

| Table | Purpose | Key Fields | Workflow |
|-------|---------|------------|----------|
| **Flora** | Tanaman/Tumbuhan | local_name, scientific_name, family, genus, is_endemic, iucn_status | ✅ Draft → Review → Approved/Rejected |
| **Fauna** | Hewan | local_name, scientific_name, family, genus, ordo, diet, behavior, is_endemic, iucn_status | ✅ Draft → Review → Approved/Rejected |
| **Parks** | Taman Konservasi | name, provinsi, kota_kabupaten, area_ha, sk_penetapan, pengelola | ✅ Draft → Review → Approved/Rejected |
| **Activities** | Kegiatan Konservasi | title, description, activity_date, location | ✅ Draft → Review → Approved/Rejected |
| **Articles** | Artikel Edukasi | title, content, summary, category, featured_image | ✅ Draft → Review → Approved/Rejected |
| **News** | Berita | title, content, summary, category, priority, view_count, reading_time | ✅ Draft → Published → Archived |
| **Announcements** | Pengumuman | title, content, type, target_audience, priority, is_pinned, is_featured | ✅ Draft → Published → Archived |
| **Galleries** | Galeri Foto | title, description, image_url, entity_type, entity_id | ✅ Draft → Review → Approved/Rejected |

### **Supporting Tables (3 Tables)**

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **Users** | Pengguna Sistem | email, role (super_admin/regional_admin), park_id, display_name, profile_picture_url |
| **Audit Logs** | Log Aktivitas | actor_user_id, action, resource, resource_id, before/after JSON, timestamp |
| **Announcement Interactions** | Interaksi Pengumuman | AnnouncementRead, AnnouncementComment, AnnouncementReaction |

---

## 🎯 DASHBOARD YANG SUDAH ADA

### ✅ **Current Dashboard** (`/dashboard`)
- **Metrics**: Total Spesies, Kawasan, Endemik, Kegiatan
- **Charts**: 
  - Bar Chart: Distribusi Flora & Fauna
  - Pie Chart: Status Verifikasi, Endemik vs Non-Endemik
  - Line Chart: Penemuan Spesies Bulanan
  - Bar Chart: Distribusi per Wilayah/Provinsi
  - Composed Chart: Luas Taman & Kekayaan Spesies
- **Role-Based Filtering**: Super Admin (all data) vs Regional Admin (own data)

---

## 💡 POTENSI DASHBOARD BARU

### 🌟 **1. BIODIVERSITY DASHBOARD** (Advanced)

**Purpose:** Analisis mendalam tentang keanekaragaman hayati

#### **Metrics:**
- Total Species (Flora + Fauna)
- Endemic Species Count & Percentage
- IUCN Status Distribution (CR, EN, VU, NT, LC)
- Family Diversity (Top families)
- Genus Diversity
- Species Discovery Rate (per month/year)

#### **Charts:**
```javascript
1. IUCN Status Distribution (Pie Chart)
   - Critically Endangered (CR)
   - Endangered (EN)
   - Vulnerable (VU)
   - Near Threatened (NT)
   - Least Concern (LC)

2. Top 10 Plant Families (Bar Chart)
   - Orchidaceae: 45 species
   - Dipterocarpaceae: 32 species
   - etc.

3. Top 10 Animal Orders (Bar Chart)
   - Passeriformes: 67 species
   - Lepidoptera: 54 species
   - etc.

4. Endemic vs Non-Endemic Trend (Line Chart)
   - Monthly/yearly trend

5. Species Habitat Distribution (Stacked Bar)
   - Forest, Wetland, Grassland, etc.

6. Diet Type Distribution - Fauna (Pie Chart)
   - Herbivore, Carnivore, Omnivore

7. Species per Province (Map Visualization)
   - Heatmap by province
```

---

### 📝 **2. APPROVAL WORKFLOW DASHBOARD**

**Purpose:** Monitor dan manage workflow approval semua content

#### **Metrics:**
- Total Pending Approvals (across all types)
- Total Approved Today/This Week
- Total Rejected
- Average Approval Time
- Approval Rate by User
- Rejection Rate by Content Type

#### **Charts:**
```javascript
1. Approval Pipeline (Funnel Chart)
   - Draft: 120 items
   - In Review: 45 items
   - Approved: 890 items
   - Rejected: 23 items

2. Approval Status by Content Type (Stacked Bar)
   - Flora: [Draft, Review, Approved, Rejected]
   - Fauna: [Draft, Review, Approved, Rejected]
   - Parks: [Draft, Review, Approved, Rejected]
   - Activities: [Draft, Review, Approved, Rejected]
   - Articles: [Draft, Review, Approved, Rejected]
   - Galleries: [Draft, Review, Approved, Rejected]

3. Approval Time Distribution (Histogram)
   - < 1 day: 45%
   - 1-3 days: 30%
   - 3-7 days: 15%
   - > 7 days: 10%

4. Top Approvers (Leaderboard)
   - User A: 234 approvals
   - User B: 189 approvals
   - etc.

5. Rejection Reasons (Word Cloud)
   - Common rejection patterns

6. Monthly Approval Trend (Line Chart)
   - Approved vs Rejected over time
```

---

### 🏞️ **3. CONSERVATION PARKS DASHBOARD**

**Purpose:** Analisis kawasan konservasi

#### **Metrics:**
- Total Parks
- Total Area (ha)
- Average Park Size
- Parks per Province
- Parks with Most Species
- Parks by Ecoregion Type

#### **Charts:**
```javascript
1. Park Status Distribution (Donut Chart)
   - Draft, In Review, Approved, Rejected

2. Top 10 Largest Parks (Horizontal Bar)
   - Park A: 15,000 ha
   - Park B: 12,500 ha
   - etc.

3. Parks per Province (Map/Bar Chart)
   - Jawa Barat: 12 parks
   - Sumatra Utara: 8 parks
   - etc.

4. Ecoregion Type Distribution (Pie Chart)
   - Tropical Rainforest
   - Mangrove
   - etc.

5. Species Richness per Park (Scatter Plot)
   - X: Park Area (ha)
   - Y: Total Species Count
   - Bubble size: Endemic species

6. Park Growth Timeline (Area Chart)
   - Number of parks over time
```

---

### 📰 **4. CONTENT MANAGEMENT DASHBOARD**

**Purpose:** Monitor artikel, berita, pengumuman, dan galeri

#### **Metrics:**
- Total Articles (by status)
- Total News (by category)
- Total Announcements (active/expired)
- Total Gallery Images
- Most Viewed Content
- Content Publishing Rate

#### **Charts:**
```javascript
1. Content Type Distribution (Pie Chart)
   - Articles: 45
   - News: 67
   - Announcements: 23
   - Galleries: 234

2. News Category Distribution (Donut Chart)
   - Biodiversity
   - Conservation
   - Research
   - Education
   - Events

3. Article Categories (Bar Chart)
   - Research: 23
   - Education: 45
   - etc.

4. Top Viewed News/Articles (Leaderboard)
   - Article A: 1,234 views
   - News B: 987 views
   - etc.

5. Publishing Trend (Line Chart)
   - Publications per month

6. Announcement Priority Distribution (Stacked Bar)
   - Normal, High, Urgent

7. Gallery Images per Entity Type (Pie Chart)
   - Flora: 120 photos
   - Fauna: 98 photos
   - Parks: 67 photos
```

---

### 👥 **5. USER ACTIVITY & ENGAGEMENT DASHBOARD**

**Purpose:** Monitor aktivitas dan kontribusi user

#### **Metrics:**
- Total Users (by role)
- Active Users (last 30 days)
- Top Contributors
- Submissions per User
- Approval Rate per User
- Regional Coverage

#### **Charts:**
```javascript
1. User Role Distribution (Pie Chart)
   - Super Admin: 5
   - Regional Admin: 45

2. Top Contributors (Leaderboard)
   - User A: 234 submissions
   - User B: 189 submissions
   - etc.

3. User Activity Heatmap (Calendar)
   - Submissions per day

4. Submissions by Content Type (Stacked Bar)
   - Per user breakdown

5. Regional Coverage Map
   - Parks per region/province

6. User Registration Timeline (Area Chart)
   - New users over time

7. Approval Success Rate per User (Bar Chart)
   - User A: 95% approved
   - User B: 87% approved
```

---

### 📊 **6. AUDIT & ACTIVITY LOG DASHBOARD**

**Purpose:** Track semua perubahan dan aktivitas sistem

#### **Metrics:**
- Total Actions (CRUD operations)
- Actions per Resource Type
- Actions per User
- Peak Activity Hours
- Failed Operations

#### **Charts:**
```javascript
1. Actions by Type (Pie Chart)
   - Create: 45%
   - Update: 30%
   - Approve: 15%
   - Delete: 5%
   - Reject: 5%

2. Activity Timeline (Line Chart)
   - Actions per hour/day

3. Top Active Users (Bar Chart)
   - User A: 567 actions
   - User B: 432 actions

4. Resource Activity Distribution (Stacked Bar)
   - Flora, Fauna, Parks, etc.

5. Activity Heatmap (Day x Hour)
   - Peak times visualization

6. IP Address Distribution (Map/Table)
   - Login locations
```

---

### 🎯 **7. CONSERVATION ACTIVITIES DASHBOARD**

**Purpose:** Monitor kegiatan konservasi di lapangan

#### **Metrics:**
- Total Activities
- Activities This Month/Year
- Activities per Park
- Most Active Parks
- Activity Types Distribution

#### **Charts:**
```javascript
1. Activities Status (Donut Chart)
   - Draft, In Review, Approved, Rejected

2. Activities Timeline (Calendar/Gantt)
   - Scheduled activities

3. Activities per Park (Bar Chart)
   - Park A: 23 activities
   - Park B: 18 activities

4. Monthly Activity Count (Line Chart)
   - Trend over time

5. Activities per Province (Map/Bar)
   - Regional distribution

6. Activities by Location Type (Pie Chart)
   - Field, Office, Community, etc.
```

---

### 📈 **8. ANNOUNCEMENT ENGAGEMENT DASHBOARD**

**Purpose:** Monitor engagement dengan pengumuman

#### **Metrics:**
- Total Announcements
- Read Rate (%)
- Comment Count
- Reaction Count
- Most Engaged Announcements

#### **Charts:**
```javascript
1. Announcement Type Distribution (Pie Chart)
   - News, Announcement, Event, Maintenance

2. Read Rate by Announcement (Bar Chart)
   - Announcement A: 95% read
   - Announcement B: 78% read

3. Engagement Timeline (Line Chart)
   - Reads, Comments, Reactions over time

4. Reaction Distribution (Pie Chart)
   - Like, Love, Wow, Sad, etc.

5. Top Commented Announcements (Leaderboard)

6. Target Audience Distribution (Donut)
   - Super Admin vs Regional Admin

7. Pinned vs Regular Performance (Comparison)
```

---

### 🔍 **9. RESEARCH & SCIENTIFIC DASHBOARD**

**Purpose:** Analisis data ilmiah untuk penelitian

#### **Metrics:**
- Total Scientific Names (unique)
- Total Families (Flora & Fauna)
- Total Genera
- Endemic Rate by Province
- IUCN Threatened Species Count

#### **Charts:**
```javascript
1. Taxonomic Hierarchy (Sunburst Chart)
   - Family → Genus → Species

2. Endemic Species Hotspots (Map)
   - Provinces with highest endemic %

3. IUCN Threatened Species Trend (Line Chart)
   - Over time

4. Species Morphology Word Cloud
   - Common morphological traits

5. Habitat Preference Analysis (Sankey Diagram)
   - Species → Habitat → Province

6. Diet Network - Fauna (Network Graph)
   - Food chain relationships
```

---

### 🌍 **10. GEOGRAPHIC & SPATIAL DASHBOARD**

**Purpose:** Visualisasi data geografis

#### **Metrics:**
- Total Provinces Covered
- Total Districts Covered
- Geographic Spread Index
- Area Coverage (ha) by Region

#### **Charts:**
```javascript
1. Indonesia Map - Parks Distribution
   - Interactive map with park markers

2. Indonesia Map - Species Density
   - Heatmap by species count

3. Indonesia Map - Endemic Hotspots
   - Provinces with endemic species

4. Ecoregion Coverage (Choropleth Map)
   - Color-coded by ecoregion type

5. Province Coverage Table
   - Province, Parks, Species, Area

6. Administrative Hierarchy (Treemap)
   - Province → Kabupaten → Kecamatan → Desa
```

---

## 🚀 PRIORITAS IMPLEMENTASI

### **Phase 1: High Priority** ⭐⭐⭐
1. ✅ **BIODIVERSITY DASHBOARD** - Already implemented (enhanced)
2. 🔥 **APPROVAL WORKFLOW DASHBOARD** - Critical for operations
3. 🔥 **CONSERVATION PARKS DASHBOARD** - Core functionality

### **Phase 2: Medium Priority** ⭐⭐
4. **CONTENT MANAGEMENT DASHBOARD** - Manage articles/news
5. **USER ACTIVITY & ENGAGEMENT DASHBOARD** - Monitor contributors
6. **CONSERVATION ACTIVITIES DASHBOARD** - Track field work

### **Phase 3: Low Priority** ⭐
7. **AUDIT & ACTIVITY LOG DASHBOARD** - System monitoring
8. **ANNOUNCEMENT ENGAGEMENT DASHBOARD** - Communication metrics
9. **RESEARCH & SCIENTIFIC DASHBOARD** - Advanced analytics
10. **GEOGRAPHIC & SPATIAL DASHBOARD** - Requires PostGIS (disabled)

---

## 🎨 RECOMMENDED NEXT DASHBOARD

### **APPROVAL WORKFLOW DASHBOARD** 
**Why?**
- ✅ All tables have workflow fields (draft, in_review, approved, rejected)
- ✅ Critical for admin operations
- ✅ Helps identify bottlenecks
- ✅ Data readily available
- ✅ High business value

**Implementation Time:** ~4-6 hours

**Tech Stack:**
- Backend: New endpoint `/api/v1/dashboard/approvals`
- Frontend: New component `ApprovalWorkflowDashboard.tsx`
- Charts: Recharts (Funnel, Stacked Bar, Line, Leaderboard)

---

## 📝 NOTES

1. **PostGIS Disabled:** Geographic features (geom) are disabled, so spatial analysis will be limited
2. **Workflow Consistency:** All major entities use the same workflow pattern
3. **Rich Metadata:** All tables have created_at, updated_at, timestamps
4. **Audit Trail:** Comprehensive tracking with submitted_by, approved_by, rejected_by
5. **Role-Based:** Data filtering by super_admin vs regional_admin is already in place

---

## 🛠️ TECHNICAL RECOMMENDATIONS

1. **Caching:** Implement Redis for dashboard data caching
2. **Background Jobs:** Use Celery for heavy analytics calculations
3. **Real-time:** WebSocket for live dashboard updates
4. **Export:** Add PDF/Excel export for all dashboards
5. **Filters:** Implement advanced filters (date range, region, status, etc.)
6. **Pagination:** For large datasets in tables
7. **Permissions:** Role-based access to different dashboards

---

**END OF ANALYSIS**

