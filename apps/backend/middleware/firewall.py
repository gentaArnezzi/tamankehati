"""
Firewall middleware for IP-based access control.
Supports IP whitelist and blacklist functionality.
"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from typing import Set, Optional
import os
import ipaddress

class IPFirewallMiddleware(BaseHTTPMiddleware):
    """
    Middleware that filters requests based on IP whitelist/blacklist.
    
    Configuration via environment variables:
    - IP_WHITELIST: Comma-separated list of allowed IPs/CIDR ranges (e.g., "192.168.1.0/24,10.0.0.1")
    - IP_BLACKLIST: Comma-separated list of blocked IPs/CIDR ranges
    - FIREWALL_ENABLED: Set to "true" to enable firewall (default: false)
    - FIREWALL_MODE: "whitelist" or "blacklist" (default: "blacklist")
    - FIREWALL_BYPASS_PATHS: Comma-separated paths to bypass firewall (e.g., "/health,/api/health")
    """
    
    def __init__(self, app, enabled: Optional[bool] = None, mode: Optional[str] = None):
        super().__init__(app)
        
        # Get configuration from environment
        self.enabled = enabled if enabled is not None else os.getenv("FIREWALL_ENABLED", "false").lower() == "true"
        self.mode = mode or os.getenv("FIREWALL_MODE", "blacklist").lower()
        
        # Parse whitelist
        whitelist_str = os.getenv("IP_WHITELIST", "")
        self.whitelist = self._parse_ip_list(whitelist_str)
        
        # Parse blacklist
        blacklist_str = os.getenv("IP_BLACKLIST", "")
        self.blacklist = self._parse_ip_list(blacklist_str)
        
        # Parse bypass paths
        bypass_str = os.getenv("FIREWALL_BYPASS_PATHS", "/health,/healthz,/api/health")
        self.bypass_paths = set(path.strip() for path in bypass_str.split(",") if path.strip())
        
        print(f"Firewall enabled: {self.enabled}, mode: {self.mode}")
        print(f"Whitelist: {len(self.whitelist)} entries")
        print(f"Blacklist: {len(self.blacklist)} entries")
        print(f"Bypass paths: {self.bypass_paths}")
    
    def _parse_ip_list(self, ip_list_str: str) -> Set:
        """
        Parse comma-separated IP list into a set of IP networks/addresses.
        Supports both individual IPs and CIDR ranges.
        """
        ip_set = set()
        
        if not ip_list_str:
            return ip_set
        
        for ip_item in ip_list_str.split(","):
            ip_item = ip_item.strip()
            if not ip_item:
                continue
            
            try:
                # Try to parse as network (CIDR)
                if "/" in ip_item:
                    network = ipaddress.ip_network(ip_item, strict=False)
                    ip_set.add(network)
                else:
                    # Parse as single IP address
                    ip_addr = ipaddress.ip_address(ip_item)
                    ip_set.add(ipaddress.ip_network(f"{ip_addr}/32", strict=False))
            except ValueError as e:
                print(f"Warning: Invalid IP/CIDR in firewall config: {ip_item} - {e}")
        
        return ip_set
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request headers (handles proxy/load balancer)."""
        # Check for forwarded headers first (for reverse proxy/load balancer)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            # X-Forwarded-For can contain multiple IPs, take the first one
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # Check CF-Connecting-IP (Cloudflare)
        cf_ip = request.headers.get("CF-Connecting-IP")
        if cf_ip:
            return cf_ip
        
        # Fallback to direct connection
        if request.client:
            return request.client.host
        
        return "unknown"
    
    def _is_ip_allowed(self, ip_str: str) -> bool:
        """
        Check if IP is allowed based on firewall mode.
        Returns True if request should be allowed, False if blocked.
        """
        if not self.enabled:
            return True
        
        try:
            client_ip = ipaddress.ip_address(ip_str)
        except ValueError:
            # Invalid IP format - block it for safety
            print(f"Warning: Invalid IP format detected: {ip_str}")
            return False
        
        if self.mode == "whitelist":
            # Whitelist mode: Only allow IPs in whitelist
            if not self.whitelist:
                # If whitelist is empty, allow all (not recommended)
                return True
            
            # Check if IP is in any whitelisted network
            for network in self.whitelist:
                if client_ip in network:
                    return True
            
            # IP not in whitelist - block
            return False
        
        elif self.mode == "blacklist":
            # Blacklist mode: Block IPs in blacklist, allow others
            if not self.blacklist:
                # If blacklist is empty, allow all
                return True
            
            # Check if IP is in any blacklisted network
            for network in self.blacklist:
                if client_ip in network:
                    # IP is blacklisted - block
                    return False
            
            # IP not in blacklist - allow
            return True
        
        else:
            # Unknown mode - allow by default (fail open)
            print(f"Warning: Unknown firewall mode: {self.mode}")
            return True
    
    def _should_bypass(self, path: str) -> bool:
        """Check if path should bypass firewall."""
        for bypass_path in self.bypass_paths:
            if path.startswith(bypass_path):
                return True
        return False
    
    async def dispatch(self, request: Request, call_next):
        # Check if path should bypass firewall
        if self._should_bypass(request.url.path):
            return await call_next(request)
        
        # Get client IP
        client_ip = self._get_client_ip(request)
        
        # Check if IP is allowed
        if not self._is_ip_allowed(client_ip):
            return JSONResponse(
                status_code=403,
                content={
                    "detail": "Access denied by firewall policy",
                    "error": "FORBIDDEN"
                },
                headers={
                    "X-Firewall-Status": "blocked",
                    "X-Firewall-Mode": self.mode
                }
            )
        
        # IP is allowed, proceed with request
        response = await call_next(request)
        response.headers["X-Firewall-Status"] = "allowed"
        return response

