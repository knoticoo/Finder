#!/bin/bash

# Test script for VisiPakalpojumi API endpoints

echo "🧪 Testing VisiPakalpojumi API endpoints..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to test endpoint
test_endpoint() {
    local endpoint=$1
    local method=${2:-GET}
    local data=${3:-""}
    
    echo -e "${BLUE}Testing $method $endpoint${NC}"
    
    if [ "$method" = "POST" ] && [ ! -z "$data" ]; then
        response=$(curl -s -X POST -H "Content-Type: application/json" -d "$data" "http://localhost:3001$endpoint")
    else
        response=$(curl -s -X $method "http://localhost:3001$endpoint")
    fi
    
    if [ $? -eq 0 ] && [ ! -z "$response" ]; then
        echo -e "${GREEN}✅ Success${NC}"
        echo "Response: $response" | head -c 200
        echo "..."
    else
        echo -e "${RED}❌ Failed${NC}"
    fi
    echo ""
}

# Test health endpoint
test_endpoint "/health"

# Test authentication endpoints
test_endpoint "/api/auth/register" "POST" '{"email":"test@example.com","password":"TestPass123","firstName":"John","lastName":"Doe","role":"CUSTOMER","language":"LATVIAN"}'

# Test service endpoints
test_endpoint "/api/services/categories"

# Test user endpoints (will fail without auth token)
test_endpoint "/api/users/profile"

echo "🎉 API testing completed!"