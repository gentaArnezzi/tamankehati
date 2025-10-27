# 📚 API Documentation

Complete API reference for the Taman Kehati backend API.

## Overview

The Taman Kehati API is built with FastAPI and provides RESTful endpoints for managing biodiversity data, parks, users, and related resources. All endpoints return JSON responses and follow REST conventions.

## Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://api.yourdomain.com`

## Authentication

The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Getting a Token

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

**Response:**

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

## API Endpoints

### Authentication Endpoints

#### Login

```http
POST /api/v1/auth/login
```

**Request Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "access_token": "string",
  "token_type": "bearer",
  "expires_in": 1800
}
```

#### Register

```http
POST /api/v1/auth/register
```

**Request Body:**

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "full_name": "string"
}
```

**Response:**

```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "full_name": "string",
  "is_active": true,
  "created_at": "2023-10-27T10:00:00Z"
}
```

#### Get Current User

```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

**Response:**

```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "full_name": "string",
  "roles": ["user"],
  "is_active": true,
  "created_at": "2023-10-27T10:00:00Z"
}
```

### Parks Endpoints

#### List Parks

```http
GET /api/v1/parks
```

**Query Parameters:**

- `skip` (integer, optional): Number of records to skip (default: 0)
- `limit` (integer, optional): Number of records to return (default: 100)
- `status` (string, optional): Filter by status (active, inactive, maintenance)
- `search` (string, optional): Search by name or location

**Response:**

```json
{
  "items": [
    {
      "id": 1,
      "name": "Taman Nasional Bromo",
      "description": "Famous volcanic national park",
      "location": "East Java, Indonesia",
      "area_hectares": 50276.9,
      "coordinates": {
        "type": "Point",
        "coordinates": [112.95, -7.95]
      },
      "status": "active",
      "created_at": "2023-10-27T10:00:00Z",
      "updated_at": "2023-10-27T10:00:00Z"
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 100
}
```

#### Get Park

```http
GET /api/v1/parks/{park_id}
```

**Response:**

```json
{
  "id": 1,
  "name": "Taman Nasional Bromo",
  "description": "Famous volcanic national park",
  "location": "East Java, Indonesia",
  "area_hectares": 50276.9,
  "coordinates": {
    "type": "Point",
    "coordinates": [112.95, -7.95]
  },
  "status": "active",
  "zones": [
    {
      "id": 1,
      "name": "Conservation Zone",
      "description": "Protected area for wildlife",
      "zone_type": "conservation",
      "area_hectares": 30000.0
    }
  ],
  "flora": [
    {
      "id": 1,
      "common_name": "Edelweiss",
      "scientific_name": "Anaphalis javanica",
      "conservation_status": "vulnerable"
    }
  ],
  "fauna": [
    {
      "id": 1,
      "common_name": "Javan Leopard",
      "scientific_name": "Panthera pardus melas",
      "conservation_status": "endangered"
    }
  ],
  "created_at": "2023-10-27T10:00:00Z",
  "updated_at": "2023-10-27T10:00:00Z"
}
```

#### Create Park

```http
POST /api/v1/parks
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Taman Nasional Bromo",
  "description": "Famous volcanic national park",
  "location": "East Java, Indonesia",
  "area_hectares": 50276.9,
  "coordinates": {
    "type": "Point",
    "coordinates": [112.95, -7.95]
  }
}
```

**Response:**

```json
{
  "id": 1,
  "name": "Taman Nasional Bromo",
  "description": "Famous volcanic national park",
  "location": "East Java, Indonesia",
  "area_hectares": 50276.9,
  "coordinates": {
    "type": "Point",
    "coordinates": [112.95, -7.95]
  },
  "status": "active",
  "created_at": "2023-10-27T10:00:00Z",
  "updated_at": "2023-10-27T10:00:00Z"
}
```

#### Update Park

```http
PUT /api/v1/parks/{park_id}
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Taman Nasional Bromo Tengger",
  "description": "Updated description"
}
```

**Response:**

```json
{
  "id": 1,
  "name": "Taman Nasional Bromo Tengger",
  "description": "Updated description",
  "location": "East Java, Indonesia",
  "area_hectares": 50276.9,
  "coordinates": {
    "type": "Point",
    "coordinates": [112.95, -7.95]
  },
  "status": "active",
  "created_at": "2023-10-27T10:00:00Z",
  "updated_at": "2023-10-27T11:00:00Z"
}
```

#### Delete Park

```http
DELETE /api/v1/parks/{park_id}
Authorization: Bearer <token>
```

**Response:**

```http
HTTP/1.1 204 No Content
```

### Flora Endpoints

#### List Flora

```http
GET /api/v1/flora
```

**Query Parameters:**

- `park_id` (integer, optional): Filter by park ID
- `verified` (boolean, optional): Filter by verification status
- `conservation_status` (string, optional): Filter by conservation status
- `skip` (integer, optional): Number of records to skip
- `limit` (integer, optional): Number of records to return

**Response:**

```json
{
  "items": [
    {
      "id": 1,
      "park_id": 1,
      "common_name": "Edelweiss",
      "scientific_name": "Anaphalis javanica",
      "family": "Asteraceae",
      "genus": "Anaphalis",
      "species": "javanica",
      "description": "High altitude flowering plant",
      "conservation_status": "vulnerable",
      "verified": true,
      "created_at": "2023-10-27T10:00:00Z"
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 100
}
```

#### Get Flora

```http
GET /api/v1/flora/{flora_id}
```

**Response:**

```json
{
  "id": 1,
  "park_id": 1,
  "common_name": "Edelweiss",
  "scientific_name": "Anaphalis javanica",
  "family": "Asteraceae",
  "genus": "Anaphalis",
  "species": "javanica",
  "description": "High altitude flowering plant",
  "habitat": "High altitude volcanic areas",
  "conservation_status": "vulnerable",
  "flowering_season": "June-August",
  "coordinates": {
    "type": "Point",
    "coordinates": [112.95, -7.95]
  },
  "verified": true,
  "verified_by": 1,
  "verified_at": "2023-10-27T10:30:00Z",
  "created_at": "2023-10-27T10:00:00Z"
}
```

#### Create Flora

```http
POST /api/v1/flora
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "park_id": 1,
  "common_name": "Edelweiss",
  "scientific_name": "Anaphalis javanica",
  "family": "Asteraceae",
  "description": "High altitude flowering plant",
  "conservation_status": "vulnerable",
  "coordinates": {
    "type": "Point",
    "coordinates": [112.95, -7.95]
  }
}
```

#### Update Flora

```http
PUT /api/v1/flora/{flora_id}
Authorization: Bearer <token>
Content-Type: application/json
```

#### Delete Flora

```http
DELETE /api/v1/flora/{flora_id}
Authorization: Bearer <token>
```

### Fauna Endpoints

#### List Fauna

```http
GET /api/v1/fauna
```

**Query Parameters:**

- `park_id` (integer, optional): Filter by park ID
- `verified` (boolean, optional): Filter by verification status
- `conservation_status` (string, optional): Filter by conservation status
- `diet_type` (string, optional): Filter by diet type
- `skip` (integer, optional): Number of records to skip
- `limit` (integer, optional): Number of records to return

**Response:**

```json
{
  "items": [
    {
      "id": 1,
      "park_id": 1,
      "common_name": "Javan Leopard",
      "scientific_name": "Panthera pardus melas",
      "family": "Felidae",
      "genus": "Panthera",
      "species": "pardus",
      "description": "Large carnivorous cat",
      "conservation_status": "endangered",
      "diet_type": "carnivore",
      "activity_pattern": "nocturnal",
      "verified": true,
      "created_at": "2023-10-27T10:00:00Z"
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 100
}
```

#### Get Fauna

```http
GET /api/v1/fauna/{fauna_id}
```

#### Create Fauna

```http
POST /api/v1/fauna
Authorization: Bearer <token>
Content-Type: application/json
```

#### Update Fauna

```http
PUT /api/v1/fauna/{fauna_id}
Authorization: Bearer <token>
Content-Type: application/json
```

#### Delete Fauna

```http
DELETE /api/v1/fauna/{fauna_id}
Authorization: Bearer <token>
```

### Activities Endpoints

#### List Activities

```http
GET /api/v1/activities
```

**Query Parameters:**

- `park_id` (integer, optional): Filter by park ID
- `status` (string, optional): Filter by status
- `assigned_to` (integer, optional): Filter by assigned user
- `activity_type` (string, optional): Filter by activity type
- `skip` (integer, optional): Number of records to skip
- `limit` (integer, optional): Number of records to return

**Response:**

```json
{
  "items": [
    {
      "id": 1,
      "park_id": 1,
      "title": "Wildlife Survey",
      "description": "Monthly wildlife population survey",
      "activity_type": "research",
      "start_date": "2023-11-01T09:00:00Z",
      "end_date": "2023-11-01T17:00:00Z",
      "status": "planned",
      "priority": "high",
      "assigned_to": 2,
      "created_at": "2023-10-27T10:00:00Z"
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 100
}
```

#### Get Activity

```http
GET /api/v1/activities/{activity_id}
```

#### Create Activity

```http
POST /api/v1/activities
Authorization: Bearer <token>
Content-Type: application/json
```

#### Update Activity

```http
PUT /api/v1/activities/{activity_id}
Authorization: Bearer <token>
Content-Type: application/json
```

#### Delete Activity

```http
DELETE /api/v1/activities/{activity_id}
Authorization: Bearer <token>
```

### File Upload Endpoints

#### Upload File

```http
POST /api/v1/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**

- `file` (file): The file to upload
- `related_table` (string): Table name (parks, flora, fauna)
- `related_id` (integer): Related record ID
- `description` (string, optional): File description
- `tags` (string, optional): Comma-separated tags

**Response:**

```json
{
  "id": 1,
  "file_name": "edelweiss_photo.jpg",
  "original_name": "edelweiss_photo.jpg",
  "file_path": "/uploads/2023/10/edelweiss_photo.jpg",
  "file_size": 1024000,
  "mime_type": "image/jpeg",
  "file_type": "image",
  "related_table": "flora",
  "related_id": 1,
  "description": "Edelweiss flower photo",
  "tags": ["flower", "edelweiss", "high-altitude"],
  "created_at": "2023-10-27T10:00:00Z"
}
```

#### Get File

```http
GET /api/v1/files/{file_id}
```

#### Delete File

```http
DELETE /api/v1/files/{file_id}
Authorization: Bearer <token>
```

### Announcements Endpoints

#### List Announcements

```http
GET /api/v1/announcements
```

**Query Parameters:**

- `park_id` (integer, optional): Filter by park ID
- `announcement_type` (string, optional): Filter by type
- `priority` (string, optional): Filter by priority
- `is_active` (boolean, optional): Filter by active status
- `skip` (integer, optional): Number of records to skip
- `limit` (integer, optional): Number of records to return

**Response:**

```json
{
  "items": [
    {
      "id": 1,
      "title": "Park Maintenance Notice",
      "content": "The park will be closed for maintenance on November 1st",
      "announcement_type": "maintenance",
      "priority": "high",
      "target_audience": "all",
      "park_id": 1,
      "is_active": true,
      "published_at": "2023-10-27T10:00:00Z",
      "expires_at": "2023-11-02T00:00:00Z",
      "created_at": "2023-10-27T10:00:00Z"
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 100
}
```

#### Get Announcement

```http
GET /api/v1/announcements/{announcement_id}
```

#### Create Announcement

```http
POST /api/v1/announcements
Authorization: Bearer <token>
Content-Type: application/json
```

#### Update Announcement

```http
PUT /api/v1/announcements/{announcement_id}
Authorization: Bearer <token>
Content-Type: application/json
```

#### Delete Announcement

```http
DELETE /api/v1/announcements/{announcement_id}
Authorization: Bearer <token>
```

## Error Responses

### Standard Error Format

```json
{
  "detail": "Error message",
  "error_code": 400,
  "timestamp": "2023-10-27T10:00:00Z"
}
```

### Common HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **204 No Content**: Request successful, no content returned
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **422 Unprocessable Entity**: Validation error
- **500 Internal Server Error**: Server error

### Validation Errors

```json
{
  "detail": "Validation error",
  "errors": [
    {
      "field": "name",
      "message": "Name is required",
      "code": "required"
    },
    {
      "field": "email",
      "message": "Invalid email format",
      "code": "invalid_email"
    }
  ]
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authenticated users**: 1000 requests per hour
- **Unauthenticated users**: 100 requests per hour

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1698408000
```

## Pagination

List endpoints support pagination with the following parameters:

- `skip`: Number of records to skip (default: 0)
- `limit`: Number of records to return (default: 100, max: 1000)

Response includes pagination metadata:

```json
{
  "items": [...],
  "total": 150,
  "skip": 0,
  "limit": 100,
  "has_next": true,
  "has_prev": false
}
```

## Filtering & Sorting

### Filtering

Most list endpoints support filtering by relevant fields:

- Use query parameters to filter results
- Multiple filters can be combined
- Filter values are case-sensitive

### Sorting

Sort results using the `sort` parameter:

- Format: `field:direction` (e.g., `name:asc`, `created_at:desc`)
- Default: `created_at:desc`
- Multiple sorts: `name:asc,created_at:desc`

## Webhooks

The API supports webhooks for real-time notifications:

### Webhook Events

- `park.created`
- `park.updated`
- `park.deleted`
- `flora.created`
- `flora.updated`
- `fauna.created`
- `fauna.updated`
- `activity.created`
- `activity.updated`
- `activity.completed`

### Webhook Payload

```json
{
  "event": "park.created",
  "data": {
    "id": 1,
    "name": "Taman Nasional Bromo",
    "created_at": "2023-10-27T10:00:00Z"
  },
  "timestamp": "2023-10-27T10:00:00Z"
}
```

## SDKs & Libraries

### JavaScript/TypeScript

```bash
npm install @tamankehati/api-client
```

```typescript
import { TamanKehatiAPI } from "@tamankehati/api-client";

const api = new TamanKehatiAPI({
  baseURL: "http://localhost:8000",
  token: "your-jwt-token",
});

const parks = await api.parks.list();
```

### Python

```bash
pip install tamankehati-api
```

```python
from tamankehati_api import TamanKehatiAPI

api = TamanKehatiAPI(
    base_url='http://localhost:8000',
    token='your-jwt-token'
)

parks = api.parks.list()
```

## Interactive Documentation

- **Swagger UI**: Available at `/docs`
- **ReDoc**: Available at `/redoc`
- **OpenAPI Schema**: Available at `/openapi.json`

## Related Documentation

- [Backend API Architecture](../architecture/backend-api.md)
- [Development Workflow](workflow.md)
- [Authentication Guide](../security/authentication.md)
- [Environment Configuration](../reference/environment-variables.md)
