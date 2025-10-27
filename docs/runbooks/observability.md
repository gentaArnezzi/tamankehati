# 📊 Observability Guide

Comprehensive guide to monitoring, logging, and observability in the Taman Kehati system.

## Overview

Observability is crucial for maintaining system health, performance, and reliability. This guide covers monitoring strategies, logging best practices, and observability tools for the Taman Kehati system.

## Monitoring Strategy

### Three Pillars of Observability

#### 1. Metrics

- **System Metrics**: CPU, memory, disk, network
- **Application Metrics**: Response times, error rates, throughput
- **Business Metrics**: User activity, feature usage, data growth

#### 2. Logs

- **Application Logs**: API requests, errors, debug information
- **System Logs**: Docker, database, operating system
- **Security Logs**: Authentication, authorization, security events

#### 3. Traces

- **Request Tracing**: End-to-end request flow
- **Performance Tracing**: Database queries, external API calls
- **Error Tracing**: Error propagation and root cause analysis

## Monitoring Implementation

### System Metrics

#### Docker Container Monitoring

```bash
#!/bin/bash
# monitor_containers.sh

# Check container status
docker compose ps

# Monitor resource usage
docker stats --no-stream

# Check container health
docker compose exec backend curl -f http://localhost:8000/health
docker compose exec frontend curl -f http://localhost:3000
```

#### System Resource Monitoring

```bash
#!/bin/bash
# monitor_resources.sh

# CPU usage
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
echo "CPU Usage: $CPU_USAGE%"

# Memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.2f", $3/$2 * 100.0}')
echo "Memory Usage: $MEMORY_USAGE%"

# Disk usage
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | cut -d'%' -f1)
echo "Disk Usage: $DISK_USAGE%"

# Network usage
NETWORK_USAGE=$(cat /proc/net/dev | grep eth0 | awk '{print $2, $10}')
echo "Network Usage: $NETWORK_USAGE"
```

### Application Metrics

#### API Performance Monitoring

```python
# middleware/metrics.py
import time
from fastapi import Request, Response
from fastapi.middleware.base import BaseHTTPMiddleware
import logging

logger = logging.getLogger(__name__)

class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        # Process request
        response = await call_next(request)

        # Calculate metrics
        process_time = time.time() - start_time

        # Log metrics
        logger.info(f"API Metrics: {request.method} {request.url.path} - "
                   f"Status: {response.status_code} - "
                   f"Time: {process_time:.4f}s - "
                   f"IP: {request.client.host}")

        # Add metrics headers
        response.headers["X-Process-Time"] = str(process_time)
        response.headers["X-Request-ID"] = str(hash(request.url.path + str(time.time())))

        return response
```

#### Database Performance Monitoring

```python
# core/database_monitoring.py
from sqlalchemy import event
from sqlalchemy.engine import Engine
import time
import logging

logger = logging.getLogger(__name__)

@event.listens_for(Engine, "before_cursor_execute")
def receive_before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    context._query_start_time = time.time()

@event.listens_for(Engine, "after_cursor_execute")
def receive_after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    total = time.time() - context._query_start_time
    logger.info(f"Database Query: {statement[:100]}... - Time: {total:.4f}s")

    # Log slow queries
    if total > 1.0:  # Queries taking more than 1 second
        logger.warning(f"Slow Query: {statement} - Time: {total:.4f}s")
```

### Business Metrics

#### User Activity Tracking

```python
# services/metrics_service.py
from sqlalchemy.orm import Session
from models.user import User
from models.park import Park
from models.flora import Flora
from models.fauna import Fauna
from datetime import datetime, timedelta
from typing import Dict, Any

class MetricsService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_metrics(self) -> Dict[str, Any]:
        """Get user activity metrics"""
        total_users = self.db.query(User).count()
        active_users = self.db.query(User).filter(User.is_active == True).count()
        new_users_today = self.db.query(User).filter(
            User.created_at >= datetime.now().date()
        ).count()

        return {
            "total_users": total_users,
            "active_users": active_users,
            "new_users_today": new_users_today,
        }

    def get_biodiversity_metrics(self) -> Dict[str, Any]:
        """Get biodiversity metrics"""
        total_flora = self.db.query(Flora).count()
        total_fauna = self.db.query(Fauna).count()
        verified_flora = self.db.query(Flora).filter(Flora.verified == True).count()
        verified_fauna = self.db.query(Fauna).filter(Fauna.verified == True).count()

        return {
            "total_flora": total_flora,
            "total_fauna": total_fauna,
            "verified_flora": verified_flora,
            "verified_fauna": verified_fauna,
            "verification_rate": (verified_flora + verified_fauna) / (total_flora + total_fauna) * 100
        }

    def get_park_metrics(self) -> Dict[str, Any]:
        """Get park metrics"""
        total_parks = self.db.query(Park).count()
        active_parks = self.db.query(Park).filter(Park.status == "active").count()
        parks_with_species = self.db.query(Park).join(Flora).distinct().count()

        return {
            "total_parks": total_parks,
            "active_parks": active_parks,
            "parks_with_species": parks_with_species,
        }
```

## Logging Strategy

### Log Levels and Structure

#### Log Level Configuration

```python
# core/logging_config.py
import logging
import sys
from core.config import settings

def setup_logging():
    """Setup application logging"""

    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    # Setup root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper()))

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    # File handler
    file_handler = logging.FileHandler('app.log')
    file_handler.setFormatter(formatter)
    root_logger.addHandler(file_handler)

    # Security logger
    security_logger = logging.getLogger('security')
    security_handler = logging.FileHandler('security.log')
    security_handler.setFormatter(formatter)
    security_logger.addHandler(security_handler)
    security_logger.setLevel(logging.INFO)
```

#### Structured Logging

```python
# core/structured_logging.py
import json
import logging
from datetime import datetime
from typing import Dict, Any

class StructuredLogger:
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)

    def log_event(self, level: str, event: str, **kwargs):
        """Log structured event"""
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": level,
            "event": event,
            **kwargs
        }

        self.logger.log(
            getattr(logging, level.upper()),
            json.dumps(log_data)
        )

    def log_api_request(self, method: str, path: str, status_code: int,
                       response_time: float, user_id: int = None):
        """Log API request"""
        self.log_event(
            "info",
            "api_request",
            method=method,
            path=path,
            status_code=status_code,
            response_time=response_time,
            user_id=user_id
        )

    def log_security_event(self, event_type: str, user_id: int = None,
                          ip_address: str = None, **kwargs):
        """Log security event"""
        self.log_event(
            "warning",
            "security_event",
            event_type=event_type,
            user_id=user_id,
            ip_address=ip_address,
            **kwargs
        )
```

### Application Logging

#### API Request Logging

```python
# middleware/request_logging.py
from fastapi import Request, Response
from fastapi.middleware.base import BaseHTTPMiddleware
import time
import logging

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        # Log request
        logger.info(f"Request: {request.method} {request.url.path} "
                   f"from {request.client.host}")

        # Process request
        response = await call_next(request)

        # Log response
        process_time = time.time() - start_time
        logger.info(f"Response: {response.status_code} "
                   f"in {process_time:.4f}s")

        return response
```

#### Error Logging

```python
# core/error_logging.py
import logging
import traceback
from typing import Optional

logger = logging.getLogger(__name__)

def log_error(error: Exception, context: Optional[str] = None):
    """Log error with context"""
    error_data = {
        "error_type": type(error).__name__,
        "error_message": str(error),
        "traceback": traceback.format_exc(),
        "context": context
    }

    logger.error(f"Error occurred: {error_data}")

def log_critical_error(error: Exception, context: Optional[str] = None):
    """Log critical error"""
    error_data = {
        "error_type": type(error).__name__,
        "error_message": str(error),
        "traceback": traceback.format_exc(),
        "context": context,
        "severity": "critical"
    }

    logger.critical(f"Critical error: {error_data}")
```

### Security Logging

#### Authentication Logging

```python
# core/security_logging.py
import logging
from datetime import datetime
from typing import Optional

security_logger = logging.getLogger('security')

def log_login_attempt(username: str, success: bool, ip_address: str):
    """Log login attempt"""
    event = {
        "timestamp": datetime.utcnow().isoformat(),
        "event": "login_attempt",
        "username": username,
        "success": success,
        "ip_address": ip_address
    }

    security_logger.info(f"Login attempt: {event}")

def log_permission_denied(user_id: int, resource: str, action: str):
    """Log permission denied event"""
    event = {
        "timestamp": datetime.utcnow().isoformat(),
        "event": "permission_denied",
        "user_id": user_id,
        "resource": resource,
        "action": action
    }

    security_logger.warning(f"Permission denied: {event}")

def log_suspicious_activity(user_id: int, activity: str, details: dict):
    """Log suspicious activity"""
    event = {
        "timestamp": datetime.utcnow().isoformat(),
        "event": "suspicious_activity",
        "user_id": user_id,
        "activity": activity,
        "details": details
    }

    security_logger.error(f"Suspicious activity: {event}")
```

## Monitoring Tools

### Health Check Endpoints

#### API Health Check

```python
# api/v1/endpoints/health.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from core.config import settings
import psutil
import time

router = APIRouter()

@router.get("/health")
async def health_check():
    """Basic health check"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": settings.VERSION
    }

@router.get("/health/detailed")
async def detailed_health_check(db: Session = Depends(get_db)):
    """Detailed health check"""
    health_status = {
        "status": "healthy",
        "timestamp": time.time(),
        "version": settings.VERSION,
        "checks": {}
    }

    # Database check
    try:
        db.execute("SELECT 1")
        health_status["checks"]["database"] = "healthy"
    except Exception as e:
        health_status["checks"]["database"] = f"unhealthy: {str(e)}"
        health_status["status"] = "unhealthy"

    # System resources
    health_status["checks"]["cpu"] = f"{psutil.cpu_percent()}%"
    health_status["checks"]["memory"] = f"{psutil.virtual_memory().percent}%"
    health_status["checks"]["disk"] = f"{psutil.disk_usage('/').percent}%"

    return health_status
```

#### Frontend Health Check

```typescript
// src/app/api/health/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check if frontend is responsive
    const healthCheck = {
      status: "healthy",
      timestamp: Date.now(),
      version: process.env.NEXT_PUBLIC_VERSION || "1.0.0",
    };

    return NextResponse.json(healthCheck);
  } catch (error) {
    return NextResponse.json({ status: "unhealthy", error: error.message }, { status: 500 });
  }
}
```

### Monitoring Scripts

#### System Monitoring Script

```bash
#!/bin/bash
# system_monitor.sh

# Configuration
ALERT_CPU_THRESHOLD=80
ALERT_MEMORY_THRESHOLD=80
ALERT_DISK_THRESHOLD=80
LOG_FILE="/var/log/system_monitor.log"

# Function to log alerts
log_alert() {
    echo "$(date): $1" >> $LOG_FILE
    # Send alert (email, Slack, etc.)
    # send_alert "$1"
}

# Check CPU usage
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
if (( $(echo "$CPU_USAGE > $ALERT_CPU_THRESHOLD" | bc -l) )); then
    log_alert "High CPU usage: $CPU_USAGE%"
fi

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
if [ $MEMORY_USAGE -gt $ALERT_MEMORY_THRESHOLD ]; then
    log_alert "High memory usage: $MEMORY_USAGE%"
fi

# Check disk usage
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | cut -d'%' -f1)
if [ $DISK_USAGE -gt $ALERT_DISK_THRESHOLD ]; then
    log_alert "High disk usage: $DISK_USAGE%"
fi

# Check Docker services
if ! docker compose ps | grep -q "Up"; then
    log_alert "Docker services not running"
fi

# Check API health
if ! curl -f http://localhost:8000/health > /dev/null 2>&1; then
    log_alert "API health check failed"
fi
```

#### Application Monitoring Script

```bash
#!/bin/bash
# app_monitor.sh

# Check API response time
API_RESPONSE_TIME=$(curl -w "%{time_total}" -o /dev/null -s http://localhost:8000/health)
if (( $(echo "$API_RESPONSE_TIME > 2.0" | bc -l) )); then
    echo "$(date): Slow API response: ${API_RESPONSE_TIME}s"
fi

# Check error rate
ERROR_COUNT=$(docker compose logs --since=5m | grep -i error | wc -l)
if [ $ERROR_COUNT -gt 10 ]; then
    echo "$(date): High error rate: $ERROR_COUNT errors in last 5 minutes"
fi

# Check database connections
DB_CONNECTIONS=$(docker compose exec postgres psql -U kehati_user -d kehati_db -c "SELECT count(*) FROM pg_stat_activity;" -t)
if [ $DB_CONNECTIONS -gt 50 ]; then
    echo "$(date): High database connections: $DB_CONNECTIONS"
fi
```

## Alerting and Notifications

### Alert Configuration

#### Alert Rules

```yaml
# alerts.yml
alerts:
  - name: "High CPU Usage"
    condition: "cpu_usage > 80"
    duration: "5m"
    severity: "warning"

  - name: "High Memory Usage"
    condition: "memory_usage > 80"
    duration: "5m"
    severity: "warning"

  - name: "API Down"
    condition: "api_health_check == false"
    duration: "1m"
    severity: "critical"

  - name: "Database Down"
    condition: "database_health_check == false"
    duration: "1m"
    severity: "critical"

  - name: "High Error Rate"
    condition: "error_rate > 10"
    duration: "5m"
    severity: "warning"
```

#### Notification Channels

```python
# core/notifications.py
import smtplib
import requests
from email.mime.text import MIMEText
from typing import Dict, Any

class NotificationService:
    def __init__(self):
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.email_user = "alerts@tamankehati.com"
        self.email_password = "your-app-password"
        self.slack_webhook = "https://hooks.slack.com/services/your/webhook/url"

    def send_email_alert(self, subject: str, message: str, recipients: list):
        """Send email alert"""
        msg = MIMEText(message)
        msg['Subject'] = subject
        msg['From'] = self.email_user
        msg['To'] = ', '.join(recipients)

        server = smtplib.SMTP(self.smtp_server, self.smtp_port)
        server.starttls()
        server.login(self.email_user, self.email_password)
        server.send_message(msg)
        server.quit()

    def send_slack_alert(self, message: str, channel: str = "#alerts"):
        """Send Slack alert"""
        payload = {
            "channel": channel,
            "text": message,
            "username": "TamanKehati Monitor"
        }

        requests.post(self.slack_webhook, json=payload)

    def send_alert(self, alert_type: str, message: str, severity: str):
        """Send alert based on type and severity"""
        if severity == "critical":
            self.send_email_alert(
                f"CRITICAL: {alert_type}",
                message,
                ["admin@tamankehati.com", "oncall@tamankehati.com"]
            )
            self.send_slack_alert(f"🚨 CRITICAL: {alert_type}\n{message}")
        elif severity == "warning":
            self.send_slack_alert(f"⚠️ WARNING: {alert_type}\n{message}")
```

## Dashboard and Visualization

### Metrics Dashboard

#### System Metrics Dashboard

```typescript
// src/components/monitoring/system-metrics.tsx
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function SystemMetrics() {
  const { data: metrics } = useQuery({
    queryKey: ["system-metrics"],
    queryFn: () => fetch("/api/monitoring/system-metrics").then((res) => res.json()),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>CPU Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics?.cpu_usage || 0}%</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Memory Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics?.memory_usage || 0}%</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Disk Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics?.disk_usage || 0}%</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Network I/O</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics?.network_io || 0} MB/s</div>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### Application Metrics Dashboard

```typescript
// src/components/monitoring/app-metrics.tsx
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function ApplicationMetrics() {
  const { data: metrics } = useQuery({
    queryKey: ["app-metrics"],
    queryFn: () => fetch("/api/monitoring/app-metrics").then((res) => res.json()),
    refetchInterval: 30000,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>API Response Times</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics?.response_times || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="endpoint" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avg_time" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Error Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics?.error_rates || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="endpoint" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="error_rate" fill="#ff6b6b" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Best Practices

### Monitoring Best Practices

1. **Set Appropriate Thresholds**

   - Use historical data to set thresholds
   - Consider business impact
   - Avoid alert fatigue

2. **Monitor Key Metrics**

   - Focus on business-critical metrics
   - Monitor user experience metrics
   - Track system health metrics

3. **Use Multiple Monitoring Layers**
   - Infrastructure monitoring
   - Application monitoring
   - Business metrics monitoring

### Logging Best Practices

1. **Structured Logging**

   - Use consistent log formats
   - Include relevant context
   - Use appropriate log levels

2. **Log Retention**

   - Set appropriate retention periods
   - Compress old logs
   - Archive important logs

3. **Security Considerations**
   - Don't log sensitive data
   - Use secure log storage
   - Monitor log access

## Related Documentation

- [Operational Runbooks](operational.md)
- [Security Best Practices](../security/best-practices.md)
- [Production Deployment](../deployment/production.md)
- [Troubleshooting Guide](../troubleshooting/common-issues.md)
