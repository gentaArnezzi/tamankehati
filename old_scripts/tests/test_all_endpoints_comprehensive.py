#!/usr/bin/env python3
"""
Comprehensive Endpoint Testing Script
Tests all API endpoints after database schema changes
"""

import requests
import json
from typing import Dict, List, Tuple
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
API_PREFIX = "/api/v1"

# Test credentials
TEST_ADMIN_EMAIL = "admin@kehati.com"
TEST_ADMIN_PASSWORD = "admin123"

# ANSI color codes for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

class EndpointTester:
    def __init__(self):
        self.token = None
        self.results = []
        self.session = requests.Session()
        
    def login(self) -> bool:
        """Login to get authentication token"""
        print(f"\n{Colors.BLUE}━━━ Logging in...{Colors.RESET}")
        try:
            response = self.session.post(
                f"{BASE_URL}{API_PREFIX}/auth/login",
                json={
                    "email": TEST_ADMIN_EMAIL,
                    "password": TEST_ADMIN_PASSWORD
                }
            )
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("access_token")
                print(f"{Colors.GREEN}✅ Login successful{Colors.RESET}")
                print(f"   Token: {self.token[:20]}...")
                return True
            else:
                print(f"{Colors.RED}❌ Login failed: {response.status_code}{Colors.RESET}")
                print(f"   Response: {response.text}")
                return False
        except Exception as e:
            print(f"{Colors.RED}❌ Login error: {e}{Colors.RESET}")
            return False
    
    def test_endpoint(self, method: str, path: str, name: str, 
                     requires_auth: bool = True, body: dict = None,
                     expected_status: List[int] = None) -> Tuple[bool, str]:
        """Test a single endpoint"""
        if expected_status is None:
            expected_status = [200, 201]
            
        url = f"{BASE_URL}{API_PREFIX}{path}"
        headers = {}
        
        if requires_auth and self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        
        try:
            if method == "GET":
                response = self.session.get(url, headers=headers, timeout=10)
            elif method == "POST":
                response = self.session.post(url, headers=headers, json=body, timeout=10)
            elif method == "PUT":
                response = self.session.put(url, headers=headers, json=body, timeout=10)
            elif method == "DELETE":
                response = self.session.delete(url, headers=headers, timeout=10)
            else:
                return False, f"Unknown method: {method}"
            
            success = response.status_code in expected_status
            status_color = Colors.GREEN if success else Colors.RED
            status_symbol = "✅" if success else "❌"
            
            result = {
                "name": name,
                "method": method,
                "path": path,
                "status": response.status_code,
                "success": success,
                "response_size": len(response.content),
                "timestamp": datetime.now().isoformat()
            }
            self.results.append(result)
            
            return success, f"{status_symbol} {method:6} {path:50} → {status_color}{response.status_code}{Colors.RESET}"
            
        except requests.exceptions.Timeout:
            result = {
                "name": name,
                "method": method,
                "path": path,
                "status": "TIMEOUT",
                "success": False,
                "error": "Request timeout",
                "timestamp": datetime.now().isoformat()
            }
            self.results.append(result)
            return False, f"❌ {method:6} {path:50} → {Colors.RED}TIMEOUT{Colors.RESET}"
            
        except Exception as e:
            result = {
                "name": name,
                "method": method,
                "path": path,
                "status": "ERROR",
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
            self.results.append(result)
            return False, f"❌ {method:6} {path:50} → {Colors.RED}ERROR: {str(e)}{Colors.RESET}"
    
    def print_category(self, title: str):
        """Print category header"""
        print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.RESET}")
        print(f"{Colors.BOLD}{Colors.BLUE}  {title}{Colors.RESET}")
        print(f"{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.RESET}\n")
    
    def run_tests(self):
        """Run all endpoint tests"""
        print(f"\n{Colors.BOLD}🧪 COMPREHENSIVE ENDPOINT TESTING{Colors.RESET}")
        print(f"{Colors.BOLD}Base URL: {BASE_URL}{Colors.RESET}")
        print(f"{Colors.BOLD}Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.RESET}")
        
        # Login first
        if not self.login():
            print(f"\n{Colors.RED}❌ Cannot proceed without authentication{Colors.RESET}")
            return
        
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # AUTHENTICATION ENDPOINTS
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        self.print_category("1. AUTHENTICATION ENDPOINTS")
        
        success, msg = self.test_endpoint("GET", "/auth/me", "Get Current User")
        print(msg)
        
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # USER MANAGEMENT ENDPOINTS
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        self.print_category("2. USER MANAGEMENT ENDPOINTS")
        
        success, msg = self.test_endpoint("GET", "/users", "List Users")
        print(msg)
        
        success, msg = self.test_endpoint("GET", "/users/me/debug", "Debug Current User", 
                                         expected_status=[200, 404])
        print(msg)
        
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # DASHBOARD ENDPOINTS
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        self.print_category("3. DASHBOARD ENDPOINTS")
        
        success, msg = self.test_endpoint("GET", "/dashboard", "Dashboard Overview")
        print(msg)
        
        success, msg = self.test_endpoint("GET", "/dashboard/test", "Dashboard Test")
        print(msg)
        
        success, msg = self.test_endpoint("GET", "/dashboard/overview-simple", "Dashboard Overview Simple")
        print(msg)
        
        success, msg = self.test_endpoint("GET", "/dashboard/comprehensive-simple", "Dashboard Comprehensive")
        print(msg)
        
        success, msg = self.test_endpoint("GET", "/dashboard/activity", "Dashboard Activity")
        print(msg)
        
        success, msg = self.test_endpoint("GET", "/dashboard/approvals", "Dashboard Approvals")
        print(msg)
        
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # PARKS ENDPOINTS
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        self.print_category("4. PARKS ENDPOINTS")
        
        success, msg = self.test_endpoint("GET", "/parks", "List Parks")
        print(msg)
        
        success, msg = self.test_endpoint("GET", "/parks?status=approved", "List Approved Parks")
        print(msg)
        
        success, msg = self.test_endpoint("GET", "/parks?status=draft", "List Draft Parks")
        print(msg)
        
        success, msg = self.test_endpoint("GET", "/parks?status=in_review", "List In Review Parks")
        print(msg)
        
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # FLORA ENDPOINTS
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        self.print_category("5. FLORA ENDPOINTS")
        
        success, msg = self.test_endpoint("GET", "/flora", "List Flora")
        print(msg)
        
        success, msg = self.test_endpoint("GET", "/flora?status=approved", "List Approved Flora")
        print(msg)
        
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # FAUNA ENDPOINTS
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        self.print_category("6. FAUNA ENDPOINTS")
        
        success, msg = self.test_endpoint("GET", "/fauna", "List Fauna")
        print(msg)
        
        success, msg = self.test_endpoint("GET", "/fauna?status=approved", "List Approved Fauna")
        print(msg)
        
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # ACTIVITIES ENDPOINTS
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        self.print_category("7. ACTIVITIES ENDPOINTS")
        
        success, msg = self.test_endpoint("GET", "/activities", "List Activities")
        print(msg)
        
        success, msg = self.test_endpoint("GET", "/activities?status=approved", "List Approved Activities")
        print(msg)
        
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # ARTICLES ENDPOINTS
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        self.print_category("8. ARTICLES ENDPOINTS")
        
        success, msg = self.test_endpoint("GET", "/articles", "List Articles")
        print(msg)
        
        success, msg = self.test_endpoint("GET", "/articles?status=approved", "List Approved Articles")
        print(msg)
        
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # NEWS ENDPOINTS
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        self.print_category("9. NEWS ENDPOINTS")
        
        success, msg = self.test_endpoint("GET", "/news", "List News (Admin)")
        print(msg)
        
        success, msg = self.test_endpoint("GET", "/news/public", "List News (Public)", 
                                         requires_auth=False)
        print(msg)
        
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # ANNOUNCEMENTS ENDPOINTS
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        self.print_category("10. ANNOUNCEMENTS ENDPOINTS")
        
        success, msg = self.test_endpoint("GET", "/announcements", "List Announcements")
        print(msg)
        
        success, msg = self.test_endpoint("GET", "/announcements?status=active", "List Active Announcements")
        print(msg)
        
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # GALLERIES ENDPOINTS
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        self.print_category("11. GALLERIES ENDPOINTS")
        
        success, msg = self.test_endpoint("GET", "/galleries", "List Galleries")
        print(msg)
        
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # APPROVALS ENDPOINTS
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        self.print_category("12. APPROVALS ENDPOINTS")
        
        success, msg = self.test_endpoint("GET", "/approvals", "List Pending Approvals")
        print(msg)
        
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # ANALYTICS ENDPOINTS
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        self.print_category("13. ANALYTICS ENDPOINTS (if exists)")
        
        success, msg = self.test_endpoint("GET", "/analytics/events", "Analytics Events",
                                         expected_status=[200, 404])
        print(msg)
        
        # Print summary
        self.print_summary()
        
        # Save results to file
        self.save_results()
    
    def print_summary(self):
        """Print test summary"""
        total = len(self.results)
        passed = sum(1 for r in self.results if r['success'])
        failed = total - passed
        pass_rate = (passed / total * 100) if total > 0 else 0
        
        print(f"\n{Colors.BOLD}{'='*80}{Colors.RESET}")
        print(f"{Colors.BOLD}TEST SUMMARY{Colors.RESET}")
        print(f"{Colors.BOLD}{'='*80}{Colors.RESET}\n")
        
        print(f"Total Tests:  {Colors.BOLD}{total}{Colors.RESET}")
        print(f"Passed:       {Colors.GREEN}{passed}{Colors.RESET}")
        print(f"Failed:       {Colors.RED}{failed}{Colors.RESET}")
        print(f"Pass Rate:    {Colors.BOLD}{pass_rate:.1f}%{Colors.RESET}")
        
        if failed > 0:
            print(f"\n{Colors.RED}Failed Tests:{Colors.RESET}")
            for result in self.results:
                if not result['success']:
                    error_info = result.get('error', result.get('status', 'Unknown'))
                    print(f"  ❌ {result['method']:6} {result['path']:50} → {error_info}")
        
        overall_status = "✅ ALL TESTS PASSED" if failed == 0 else f"⚠️  {failed} TEST(S) FAILED"
        status_color = Colors.GREEN if failed == 0 else Colors.YELLOW
        
        print(f"\n{status_color}{Colors.BOLD}{overall_status}{Colors.RESET}\n")
    
    def save_results(self):
        """Save results to JSON file"""
        filename = f"endpoint_test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, 'w') as f:
            json.dump({
                "timestamp": datetime.now().isoformat(),
                "base_url": BASE_URL,
                "total_tests": len(self.results),
                "passed": sum(1 for r in self.results if r['success']),
                "failed": sum(1 for r in self.results if not r['success']),
                "results": self.results
            }, f, indent=2)
        print(f"{Colors.BLUE}📄 Results saved to: {filename}{Colors.RESET}")

def main():
    print(f"""
{Colors.BOLD}╔══════════════════════════════════════════════════════════════════════════════╗
║                   🧪 COMPREHENSIVE ENDPOINT TESTING                          ║
╚══════════════════════════════════════════════════════════════════════════════╝{Colors.RESET}

Testing all API endpoints after database schema changes...
""")
    
    tester = EndpointTester()
    
    try:
        tester.run_tests()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}⚠️  Testing interrupted by user{Colors.RESET}")
    except Exception as e:
        print(f"\n\n{Colors.RED}❌ Unexpected error: {e}{Colors.RESET}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()


