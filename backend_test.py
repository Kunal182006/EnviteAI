#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class InviteAIAPITester:
    def __init__(self, base_url="https://invite-ai-designs.preview.emergentagent.com"):
        self.base_url = base_url
        self.session_token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log(self, message, test_type="INFO"):
        """Log test messages"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {test_type}: {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if self.session_token:
            test_headers['Authorization'] = f'Bearer {self.session_token}'

        self.tests_run += 1
        self.log(f"Testing {name}... ({method} {endpoint})")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}", "PASS")
                try:
                    return True, response.json() if response.content else {}
                except:
                    return True, {}
            else:
                self.failed_tests.append(f"{name} - Expected {expected_status}, got {response.status_code}")
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}", "FAIL")
                try:
                    error_response = response.json()
                    self.log(f"Response: {error_response}", "ERROR")
                except:
                    self.log(f"Response: {response.text[:200]}", "ERROR")
                
                return False, {}

        except requests.exceptions.Timeout:
            self.failed_tests.append(f"{name} - Request timeout")
            self.log(f"❌ {name} - Request timeout", "FAIL")
            return False, {}
        except Exception as e:
            self.failed_tests.append(f"{name} - Error: {str(e)}")
            self.log(f"❌ {name} - Error: {str(e)}", "FAIL")
            return False, {}

    def test_basic_endpoints(self):
        """Test basic public endpoints"""
        self.log("=== Testing Basic API Endpoints ===", "HEADER")
        
        # Test root endpoint
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "api/",
            200
        )
        
        if success and 'message' in response:
            self.log(f"Root API Response: {response['message']}", "INFO")
        
        # Test stats endpoint
        success, stats = self.run_test(
            "Stats API Endpoint", 
            "GET",
            "api/stats",
            200
        )
        
        if success:
            self.log(f"Stats: {json.dumps(stats, indent=2)}", "INFO")
            
            # Validate stats structure
            required_fields = ['totalCouples', 'foundingMembersRemaining', 'weddingsCreated', 'rating']
            for field in required_fields:
                if field not in stats:
                    self.log(f"Missing field in stats: {field}", "WARN")
        
        return True

    def test_auth_endpoints(self):
        """Test authentication endpoints (without real OAuth)"""
        self.log("=== Testing Auth Endpoints ===", "HEADER")
        
        # Test /me endpoint without auth (should return 401)
        success, response = self.run_test(
            "Auth Me (Unauthorized)",
            "GET", 
            "api/auth/me",
            401
        )
        
        # Test logout endpoint
        success, response = self.run_test(
            "Auth Logout",
            "POST",
            "api/auth/logout", 
            200
        )
        
        return True

    def test_protected_endpoints(self):
        """Test protected endpoints (should return 401 without auth)"""
        self.log("=== Testing Protected Endpoints (Unauthorized) ===", "HEADER")
        
        protected_endpoints = [
            ("Weddings List", "GET", "api/weddings"),
            ("Create Wedding", "POST", "api/weddings", {"bride_name": "Test", "groom_name": "Test", "wedding_date": "2026-06-15"}),
            ("Chat", "POST", "api/chat", {"message": "Hello"}),
        ]
        
        for name, method, endpoint, *args in protected_endpoints:
            data = args[0] if args else None
            self.run_test(name, method, endpoint, 401, data)
        
        return True

    def test_mock_endpoints(self):
        """Test mock functionality endpoints"""
        self.log("=== Testing Mock Endpoints ===", "HEADER")
        
        # These should return 401 since they require auth
        # but we're testing they exist and respond correctly
        mock_endpoints = [
            ("Mock Chat", "POST", "api/chat", {"message": "Hello"}),
            ("Mock Design Generation", "POST", "api/generate-designs/test-wedding-id"),
        ]
        
        for name, method, endpoint, *args in mock_endpoints:
            data = args[0] if args else None
            # Expecting 401 unauthorized since we don't have auth
            self.run_test(name, method, endpoint, 401, data)
        
        return True

    def run_all_tests(self):
        """Run complete test suite"""
        self.log("🚀 Starting InviteAI API Testing", "HEADER")
        self.log(f"Base URL: {self.base_url}", "INFO")
        
        try:
            # Run test categories
            self.test_basic_endpoints()
            self.test_auth_endpoints() 
            self.test_protected_endpoints()
            self.test_mock_endpoints()
            
        except Exception as e:
            self.log(f"Test suite error: {str(e)}", "ERROR")
        
        # Print summary
        self.log("", "INFO")
        self.log("=== TEST SUMMARY ===", "HEADER")
        self.log(f"Tests Run: {self.tests_run}", "INFO")
        self.log(f"Tests Passed: {self.tests_passed}", "INFO")
        self.log(f"Tests Failed: {self.tests_run - self.tests_passed}", "INFO")
        self.log(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%", "INFO")
        
        if self.failed_tests:
            self.log("", "INFO")
            self.log("Failed Tests:", "ERROR")
            for failure in self.failed_tests:
                self.log(f"  - {failure}", "ERROR")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = InviteAIAPITester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All API tests passed!")
        return 0
    else:
        print(f"\n❌ {tester.tests_run - tester.tests_passed} test(s) failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())