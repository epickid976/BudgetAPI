# Frontend Quick Reference 🚀

## Critical Information

**⚠️ API URL:** `http://localhost:3002/api` (NOT 3001!)

**Test Credentials:**
- Email: `joseblanco0430906@gmail.com`
- Password: `JbEpic10!`

## Common Mistake #1: Authorization Header ❌

```javascript
// ❌ WRONG - Missing "Bearer " prefix
headers: { 'Authorization': token }

// ✅ CORRECT
headers: { 'Authorization': `Bearer ${token}` }
```

## Common Mistake #2: Not Handling Token Expiration ❌

Access tokens expire after 15 minutes. You **must** implement token refresh:

```javascript
// ✅ CORRECT - Check for 401 and refresh
if (response.status === 401) {
  await refreshToken();
  // Retry request
}
```

## Minimal Working Example

```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'joseblanco0430906@gmail.com',
    password: 'JbEpic10!'
  })
});

const { accessToken, refreshToken } = await loginResponse.json();
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// 2. Get Accounts
const token = localStorage.getItem('accessToken');
const accountsResponse = await fetch('http://localhost:3002/api/accounts', {
  headers: {
    'Authorization': `Bearer ${token}`  // ⚠️ Don't forget "Bearer "
  }
});

const accounts = await accountsResponse.json();
console.log(accounts);
```

## Complete API Client (Copy-Paste Ready)

```javascript
class BudgetAPI {
  constructor() {
    this.baseURL = 'http://localhost:3002/api';
  }

  // Get stored token
  getToken() {
    return localStorage.getItem('accessToken');
  }

  // Make authenticated request
  async request(endpoint, options = {}) {
    const token = this.getToken();
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      }
    };

    // Add auth header if we have a token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    let response = await fetch(`${this.baseURL}${endpoint}`, config);

    // Handle token expiration
    if (response.status === 401 && token) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry with new token
        config.headers['Authorization'] = `Bearer ${this.getToken()}`;
        response = await fetch(`${this.baseURL}${endpoint}`, config);
      } else {
        throw new Error('Session expired. Please login again.');
      }
    }

    return response;
  }

  // Login
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return data;
    }

    throw new Error('Login failed');
  }

  // Refresh token
  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  }

  // Get accounts
  async getAccounts(includeBalance = false) {
    const endpoint = includeBalance ? '/accounts?includeBalance=true' : '/accounts';
    const response = await this.request(endpoint);
    return response.json();
  }

  // Create account
  async createAccount(name, type, currency) {
    const response = await this.request('/accounts', {
      method: 'POST',
      body: JSON.stringify({ name, type, currency })
    });
    return response.json();
  }

  // Update account
  async updateAccount(id, updates) {
    const response = await this.request(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return response.json();
  }

  // Delete account
  async deleteAccount(id) {
    const response = await this.request(`/accounts/${id}`, {
      method: 'DELETE'
    });
    return response.ok;
  }
}

// Usage:
const api = new BudgetAPI();

// Login
await api.login('joseblanco0430906@gmail.com', 'JbEpic10!');

// Get accounts
const accounts = await api.getAccounts();
console.log(accounts);

// Create account
const newAccount = await api.createAccount('My Checking', 'checking', 'USD');
```

## Vue/Nuxt Composable

```javascript
// composables/useApi.js
export const useApi = () => {
  const config = useRuntimeConfig();
  const baseURL = 'http://localhost:3002/api'; // Or config.public.apiBase

  const getToken = () => {
    if (process.client) {
      return localStorage.getItem('accessToken');
    }
    return null;
  };

  const request = async (endpoint, options = {}) => {
    const token = getToken();

    const fetchOptions = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await $fetch(`${baseURL}${endpoint}`, fetchOptions);
      return response;
    } catch (error) {
      if (error.statusCode === 401) {
        // Handle token refresh here
        console.error('Unauthorized - token may be expired');
      }
      throw error;
    }
  };

  return {
    request,
    login: (email, password) => request('/auth/login', {
      method: 'POST',
      body: { email, password }
    }),
    getAccounts: () => request('/accounts'),
    createAccount: (data) => request('/accounts', {
      method: 'POST',
      body: data
    }),
  };
};
```

## Debugging Checklist

When you get a 401 error, check:

1. ✅ Is the API URL correct? (`http://localhost:3002/api`)
2. ✅ Is the token stored? (`localStorage.getItem('accessToken')`)
3. ✅ Does the token have "Bearer " prefix? (`Bearer eyJh...`)
4. ✅ Is the token expired? (Check browser console for server response)
5. ✅ Are you logged in? (Try logging in first)
6. ✅ Is email verified? (Use test user above)

## Quick Test Commands

```bash
# Test login
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joseblanco0430906@gmail.com","password":"JbEpic10!"}'

# Test accounts (replace YOUR_TOKEN)
curl http://localhost:3002/api/accounts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Browser Console Test

```javascript
// Open browser console (F12) and paste:

// Login
const loginData = await fetch('http://localhost:3002/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'joseblanco0430906@gmail.com',
    password: 'JbEpic10!'
  })
}).then(r => r.json());

console.log('Access Token:', loginData.accessToken);

// Get accounts
const accounts = await fetch('http://localhost:3002/api/accounts', {
  headers: { 'Authorization': `Bearer ${loginData.accessToken}` }
}).then(r => r.json());

console.log('Accounts:', accounts);
```

## Need Help?

1. **Check server logs** - The server now logs all auth attempts
2. **Use test endpoint** - `GET /api/auth/test-token` to verify token
3. **Run test script** - `./test-api.sh` to verify backend is working
4. **Open test page** - `test-auth.html` for visual testing

---

**Summary:** Make sure you're using port 3002, include "Bearer " prefix, and implement token refresh!

