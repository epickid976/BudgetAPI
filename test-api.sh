#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="http://localhost:3002/api"
EMAIL="joseblanco0430906@gmail.com"
PASSWORD="JbEpic10!"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Budget API - Comprehensive Test Suite${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Test 1: Login
echo -e "${YELLOW}TEST 1: Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "$LOGIN_RESPONSE" | jq . 2>/dev/null || echo "$LOGIN_RESPONSE"

# Extract tokens
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken' 2>/dev/null)
REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.refreshToken' 2>/dev/null)

if [ "$ACCESS_TOKEN" != "null" ] && [ -n "$ACCESS_TOKEN" ]; then
    echo -e "${GREEN}✓ Login successful!${NC}\n"
else
    echo -e "${RED}✗ Login failed!${NC}\n"
    exit 1
fi

# Test 2: Test Token Endpoint
echo -e "${YELLOW}TEST 2: Test Token Validity${NC}"
curl -s -X GET "$API_URL/auth/test-token" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq .
echo -e "\n"

# Test 3: Get Current User
echo -e "${YELLOW}TEST 3: Get Current User (/auth/me)${NC}"
curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq .
echo -e "\n"

# Test 4: Get All Accounts
echo -e "${YELLOW}TEST 4: Get All Accounts${NC}"
ACCOUNTS_RESPONSE=$(curl -s -X GET "$API_URL/accounts" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "$ACCOUNTS_RESPONSE" | jq .
echo -e "\n"

# Test 5: Get Accounts with Balances
echo -e "${YELLOW}TEST 5: Get Accounts with Balances${NC}"
curl -s -X GET "$API_URL/accounts?includeBalance=true" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq .
echo -e "\n"

# Test 6: Get Account Balances
echo -e "${YELLOW}TEST 6: Get Account Balances${NC}"
curl -s -X GET "$API_URL/accounts/balances" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq .
echo -e "\n"

# Test 7: Create New Account
echo -e "${YELLOW}TEST 7: Create New Account${NC}"
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/accounts" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Account","type":"checking","currency":"USD"}')
echo "$CREATE_RESPONSE" | jq .

ACCOUNT_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id' 2>/dev/null)
echo -e "\n"

# Test 8: Get Single Account
if [ "$ACCOUNT_ID" != "null" ] && [ -n "$ACCOUNT_ID" ]; then
    echo -e "${YELLOW}TEST 8: Get Single Account (ID: $ACCOUNT_ID)${NC}"
    curl -s -X GET "$API_URL/accounts/$ACCOUNT_ID" \
      -H "Authorization: Bearer $ACCESS_TOKEN" | jq .
    echo -e "\n"
    
    # Test 9: Update Account
    echo -e "${YELLOW}TEST 9: Update Account${NC}"
    curl -s -X PUT "$API_URL/accounts/$ACCOUNT_ID" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"name":"Updated Test Account"}' | jq .
    echo -e "\n"
fi

# Test 10: Test Without Authorization (should fail)
echo -e "${YELLOW}TEST 10: Request Without Authorization (should fail with 401)${NC}"
curl -s -X GET "$API_URL/accounts" | jq .
echo -e "\n"

# Test 11: Test With Invalid Token (should fail)
echo -e "${YELLOW}TEST 11: Request With Invalid Token (should fail with 401)${NC}"
curl -s -X GET "$API_URL/accounts" \
  -H "Authorization: Bearer invalid_token_12345" | jq .
echo -e "\n"

# Test 12: Refresh Token
echo -e "${YELLOW}TEST 12: Refresh Token${NC}"
REFRESH_RESPONSE=$(curl -s -X POST "$API_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")
echo "$REFRESH_RESPONSE" | jq .

NEW_ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.accessToken' 2>/dev/null)
if [ "$NEW_ACCESS_TOKEN" != "null" ] && [ -n "$NEW_ACCESS_TOKEN" ]; then
    echo -e "${GREEN}✓ Token refresh successful!${NC}"
fi
echo -e "\n"

# Test 13: Use new token
echo -e "${YELLOW}TEST 13: Use Refreshed Token${NC}"
curl -s -X GET "$API_URL/auth/test-token" \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN" | jq .
echo -e "\n"

# Test 14: Delete Test Account (cleanup)
if [ "$ACCOUNT_ID" != "null" ] && [ -n "$ACCOUNT_ID" ]; then
    echo -e "${YELLOW}TEST 14: Delete Test Account (cleanup)${NC}"
    curl -s -X DELETE "$API_URL/accounts/$ACCOUNT_ID" \
      -H "Authorization: Bearer $ACCESS_TOKEN"
    echo -e "${GREEN}✓ Test account deleted${NC}\n"
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Test Suite Complete!${NC}"
echo -e "${BLUE}========================================${NC}"

