#!/usr/bin/env python3
"""
Comprehensive API Endpoint Test
Tests all major endpoints to ensure they're working correctly.
"""

import requests
import json
from typing import Dict, List, Tuple

BASE_URL = "http://localhost:8000"

# Color codes for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_header(text: str):
    print(f"\n{BLUE}{'=' * 70}{RESET}")
    print(f"{BLUE}{text:^70}{RESET}")
    print(f"{BLUE}{'=' * 70}{RESET}\n")

def print_success(text: str):
    print(f"{GREEN}✓{RESET} {text}")

def print_error(text: str):
    print(f"{RED}✗{RESET} {text}")

def print_warning(text: str):
    print(f"{YELLOW}⚠{RESET} {text}")

def test_endpoint(
    method: str,
    path: str,
    headers: Dict = None,
    json_data: Dict = None,
    expected_status: int = 200,
    description: str = ""
) -> Tuple[bool, str]:
    """Test a single endpoint."""
    url = f"{BASE_URL}{path}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=5)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=json_data, timeout=5)
        elif method == "PUT":
            response = requests.put(url, headers=headers, json=json_data, timeout=5)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers, timeout=5)
        else:
            return False, "Invalid HTTP method"
        
        # Check status code
        if response.status_code == expected_status:
            print_success(f"{method} {path} → {response.status_code} {description}")
            return True, response.text
        else:
            print_error(f"{method} {path} → {response.status_code} (expected {expected_status}) {description}")
            if response.text:
                print(f"  Response: {response.text[:200]}")
            return False, response.text
            
    except requests.exceptions.ConnectionError:
        print_error(f"{method} {path} → Connection Error (Backend not running?)")
        return False, "Connection Error"
    except requests.exceptions.Timeout:
        print_error(f"{method} {path} → Timeout")
        return False, "Timeout"
    except Exception as e:
        print_error(f"{method} {path} → {str(e)}")
        return False, str(e)

def get_auth_tokens() -> Dict[str, str]:
    """Get authentication tokens for testing."""
    print_header("AUTHENTICATION")
    
    tokens = {}
    
    # Test Super Admin Login
    success, response = test_endpoint(
        "POST",
        "/api/v1/auth/login",
        json_data={"email": "admin@kehati.org", "password": "password"},
        expected_status=200,
        description="(Super Admin Login)"
    )
    
    if success:
        try:
            data = json.loads(response)
            tokens['super_admin'] = data.get('access_token', '')
            print(f"  Super Admin Token: {tokens['super_admin'][:30]}...")
        except:
            print_warning("  Could not parse super admin token")
    
    # Test Regional Admin Login
    success, response = test_endpoint(
        "POST",
        "/api/v1/auth/login",
        json_data={"email": "santana@kehati.org", "password": "password"},
        expected_status=200,
        description="(Regional Admin Login)"
    )
    
    if success:
        try:
            data = json.loads(response)
            tokens['regional_admin'] = data.get('access_token', '')
            print(f"  Regional Admin Token: {tokens['regional_admin'][:30]}...")
        except:
            print_warning("  Could not parse regional admin token")
    
    return tokens

def test_public_endpoints():
    """Test public endpoints (no auth required)."""
    print_header("PUBLIC ENDPOINTS")
    
    endpoints = [
        ("GET", "/", 200, "Root endpoint"),
        ("GET", "/health", 200, "Health check"),
        ("GET", "/api/v1/regions/", 200, "List regions"),
    ]
    
    results = []
    for method, path, expected_status, description in endpoints:
        success, _ = test_endpoint(method, path, expected_status=expected_status, description=description)
        results.append(success)
    
    return results

def test_authenticated_endpoints(tokens: Dict[str, str]):
    """Test endpoints that require authentication."""
    print_header("AUTHENTICATED ENDPOINTS")
    
    if not tokens.get('super_admin'):
        print_warning("Skipping authenticated tests - no auth token available")
        return []
    
    headers = {
        "Authorization": f"Bearer {tokens['super_admin']}",
        "Content-Type": "application/json"
    }
    
    endpoints = [
        # Dashboard
        ("GET", "/api/v1/dashboard/stats", 200, "Dashboard stats"),
        ("GET", "/api/v1/analytics/dashboard", 200, "Analytics dashboard"),
        
        # Users
        ("GET", "/api/v1/users/", 200, "List users"),
        ("GET", "/api/v1/users/me", 200, "Current user"),
        
        # Parks
        ("GET", "/api/v1/parks/", 200, "List parks"),
        ("GET", "/api/v1/parks/?limit=10", 200, "List parks with limit"),
        
        # Flora
        ("GET", "/api/v1/flora/", 200, "List flora"),
        ("GET", "/api/v1/flora/?limit=10", 200, "List flora with limit"),
        
        # Fauna
        ("GET", "/api/v1/fauna/", 200, "List fauna"),
        ("GET", "/api/v1/fauna/?limit=10", 200, "List fauna with limit"),
        
        # Activities
        ("GET", "/api/v1/activities/", 200, "List activities"),
        
        # Announcements
        ("GET", "/api/v1/announcements/", 200, "List announcements"),
        ("GET", "/api/v1/announcements/?status_filter=published", 200, "List published announcements"),
        
        # Articles
        ("GET", "/api/v1/articles/", 200, "List articles"),
        
        # News
        ("GET", "/api/v1/news/", 200, "List news"),
        
        # Galleries
        ("GET", "/api/v1/galleries/", 200, "List galleries"),
        
        # Approvals (Super Admin only)
        ("GET", "/api/v1/approvals/", 200, "List approvals"),
        ("GET", "/api/v1/approvals/?entity_type=taman", 200, "List park approvals"),
    ]
    
    results = []
    for method, path, expected_status, description in endpoints:
        success, _ = test_endpoint(method, path, headers=headers, expected_status=expected_status, description=description)
        results.append(success)
    
    return results

def test_regional_admin_endpoints(tokens: Dict[str, str]):
    """Test endpoints for regional admin."""
    print_header("REGIONAL ADMIN ENDPOINTS")
    
    if not tokens.get('regional_admin'):
        print_warning("Skipping regional admin tests - no token available")
        return []
    
    headers = {
        "Authorization": f"Bearer {tokens['regional_admin']}",
        "Content-Type": "application/json"
    }
    
    endpoints = [
        # Dashboard
        ("GET", "/api/v1/dashboard/stats", 200, "Regional admin dashboard"),
        
        # Parks (filtered by regional admin)
        ("GET", "/api/v1/parks/", 200, "Regional admin parks"),
        ("GET", "/api/v1/parks/?submitted_by=me", 200, "My submitted parks"),
        
        # Flora (filtered by regional admin)
        ("GET", "/api/v1/flora/?submitted_by=me", 200, "My submitted flora"),
        
        # Fauna (filtered by regional admin)
        ("GET", "/api/v1/fauna/?submitted_by=me", 200, "My submitted fauna"),
        
        # Activities
        ("GET", "/api/v1/activities/?submitted_by=me", 200, "My activities"),
        
        # Announcements (filtered by target_audience)
        ("GET", "/api/v1/announcements/", 200, "Regional admin announcements"),
        ("GET", "/api/v1/announcements/?status_filter=published", 200, "Published announcements"),
    ]
    
    results = []
    for method, path, expected_status, description in endpoints:
        success, _ = test_endpoint(method, path, headers=headers, expected_status=expected_status, description=description)
        results.append(success)
    
    return results

def test_parks_workflow(tokens: Dict[str, str]):
    """Test park submission and approval workflow."""
    print_header("PARKS WORKFLOW")
    
    if not tokens.get('super_admin'):
        print_warning("Skipping workflow tests - no auth token available")
        return []
    
    headers = {
        "Authorization": f"Bearer {tokens['super_admin']}",
        "Content-Type": "application/json"
    }
    
    results = []
    
    # Check for parks with status in_review
    success, response = test_endpoint(
        "GET",
        "/api/v1/approvals/?entity_type=taman",
        headers=headers,
        expected_status=200,
        description="Check pending park approvals"
    )
    results.append(success)
    
    if success:
        try:
            data = json.loads(response)
            count = data.get('counts', {}).get('taman', 0)
            print(f"  Found {count} parks pending approval")
        except:
            print_warning("  Could not parse approval response")
    
    return results

def print_summary(results: Dict[str, List[bool]]):
    """Print test summary."""
    print_header("TEST SUMMARY")
    
    total_tests = 0
    passed_tests = 0
    
    for category, tests in results.items():
        category_passed = sum(tests)
        category_total = len(tests)
        total_tests += category_total
        passed_tests += category_passed
        
        if category_total == 0:
            status = f"{YELLOW}SKIPPED{RESET}"
        elif category_passed == category_total:
            status = f"{GREEN}PASSED{RESET}"
        else:
            status = f"{RED}FAILED{RESET}"
        
        print(f"{status} {category}: {category_passed}/{category_total} tests passed")
    
    print(f"\n{BLUE}{'─' * 70}{RESET}")
    
    if passed_tests == total_tests:
        print(f"{GREEN}✓ ALL TESTS PASSED: {passed_tests}/{total_tests}{RESET}")
    else:
        print(f"{YELLOW}⚠ SOME TESTS FAILED: {passed_tests}/{total_tests} passed{RESET}")
    
    print(f"{BLUE}{'─' * 70}{RESET}\n")

def main():
    """Main test runner."""
    print_header("🧪 COMPREHENSIVE API ENDPOINT TEST")
    print(f"Backend URL: {BASE_URL}")
    
    results = {}
    
    # Get authentication tokens
    tokens = get_auth_tokens()
    
    # Test public endpoints
    results['Public Endpoints'] = test_public_endpoints()
    
    # Test authenticated endpoints
    results['Authenticated Endpoints (Super Admin)'] = test_authenticated_endpoints(tokens)
    
    # Test regional admin endpoints
    results['Regional Admin Endpoints'] = test_regional_admin_endpoints(tokens)
    
    # Test parks workflow
    results['Parks Workflow'] = test_parks_workflow(tokens)
    
    # Print summary
    print_summary(results)

if __name__ == "__main__":
    main()


