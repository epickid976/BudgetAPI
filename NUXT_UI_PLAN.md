# Nuxt Vue UI Plan for Budget API

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Core Features](#core-features)
5. [Page Architecture](#page-architecture)
6. [Component Architecture](#component-architecture)
7. [State Management](#state-management)
8. [API Integration](#api-integration)
9. [Authentication Flow](#authentication-flow)
10. [UI/UX Design System](#uiux-design-system)
11. [Implementation Phases](#implementation-phases)
12. [Development Guidelines](#development-guidelines)

---

## 🎯 Project Overview

Build a modern, responsive budget management application using Nuxt 3 and Vue 3 that connects to the existing Budget API. The application will provide users with comprehensive financial tracking, budgeting, and reporting capabilities.

### Key Goals
- **Intuitive UX**: Clean, modern interface that makes budget management effortless
- **Responsive Design**: Mobile-first approach with full desktop support
- **Real-time Updates**: Immediate feedback on financial changes
- **Data Visualization**: Clear charts and graphs for financial insights
- **Accessibility**: WCAG 2.1 AA compliant

---

## 🛠️ Tech Stack

### Core Framework
- **Nuxt 3**: Latest version for SSR/SPA capabilities
- **Vue 3**: Composition API with TypeScript
- **TypeScript**: Full type safety throughout the application

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Nuxt UI** or **Shadcn Vue**: Pre-built component library
- **HeadlessUI**: Unstyled, accessible components
- **Heroicons**: SVG icon library
- **Chart.js** or **ApexCharts**: Data visualization

### State & Data Management
- **Pinia**: State management (stores)
- **VueUse**: Composition utility library
- **@nuxtjs/axios** or **ofetch**: HTTP client
- **Zod**: Runtime validation & type inference

### Authentication
- **@nuxtjs/auth-next** or **nuxt-auth-utils**: Auth middleware
- **JWT**: Token-based authentication

### Additional Tools
- **VeeValidate**: Form validation
- **date-fns** or **dayjs**: Date manipulation
- **nuxt-icon**: Icon management
- **@vueuse/motion**: Animation library

---

## 📁 Project Structure

```
budget-ui/
├── .nuxt/                      # Auto-generated Nuxt files
├── assets/                     # Static assets
│   ├── css/
│   │   └── main.css           # Global styles, Tailwind imports
│   ├── images/
│   └── fonts/
├── components/                 # Vue components
│   ├── accounts/
│   │   ├── AccountCard.vue
│   │   ├── AccountForm.vue
│   │   ├── AccountList.vue
│   │   └── AccountSelector.vue
│   ├── budgets/
│   │   ├── BudgetChart.vue
│   │   ├── BudgetItem.vue
│   │   ├── BudgetProgress.vue
│   │   ├── MonthSelector.vue
│   │   └── CategoryBudgetForm.vue
│   ├── categories/
│   │   ├── CategoryBadge.vue
│   │   ├── CategoryForm.vue
│   │   ├── CategoryList.vue
│   │   └── CategoryIcon.vue
│   ├── transactions/
│   │   ├── TransactionForm.vue
│   │   ├── TransactionList.vue
│   │   ├── TransactionItem.vue
│   │   ├── TransactionFilters.vue
│   │   └── QuickAddTransaction.vue
│   ├── dashboard/
│   │   ├── BalanceCard.vue
│   │   ├── RecentTransactions.vue
│   │   ├── SpendingChart.vue
│   │   ├── BudgetOverview.vue
│   │   └── MonthlyComparison.vue
│   ├── reports/
│   │   ├── ExpenseByCategory.vue
│   │   ├── IncomeVsExpense.vue
│   │   ├── TrendChart.vue
│   │   └── ExportButton.vue
│   ├── auth/
│   │   ├── LoginForm.vue
│   │   ├── RegisterForm.vue
│   │   ├── ForgotPasswordForm.vue
│   │   ├── ResetPasswordForm.vue
│   │   └── ChangePasswordForm.vue
│   ├── ui/                     # Reusable UI components
│   │   ├── Button.vue
│   │   ├── Card.vue
│   │   ├── Modal.vue
│   │   ├── Dropdown.vue
│   │   ├── Input.vue
│   │   ├── Select.vue
│   │   ├── DatePicker.vue
│   │   ├── Alert.vue
│   │   ├── Badge.vue
│   │   ├── Table.vue
│   │   ├── Tabs.vue
│   │   ├── Skeleton.vue
│   │   └── EmptyState.vue
│   └── layout/
│       ├── AppHeader.vue
│       ├── AppSidebar.vue
│       ├── AppFooter.vue
│       ├── MobileNav.vue
│       └── UserMenu.vue
├── composables/                # Composition functions
│   ├── useAuth.ts
│   ├── useAccounts.ts
│   ├── useCategories.ts
│   ├── useTransactions.ts
│   ├── useBudgets.ts
│   ├── useApi.ts
│   ├── useCurrency.ts
│   ├── useToast.ts
│   └── useModal.ts
├── layouts/                    # Layout templates
│   ├── default.vue            # Main app layout
│   ├── auth.vue               # Auth pages layout
│   └── empty.vue              # Minimal layout
├── middleware/                 # Route middleware
│   ├── auth.ts                # Authentication guard
│   ├── guest.ts               # Guest-only pages
│   └── verified.ts            # Email verification check
├── pages/                      # File-based routing
│   ├── index.vue              # Dashboard
│   ├── login.vue
│   ├── register.vue
│   ├── forgot-password.vue
│   ├── reset-password.vue
│   ├── verify-email.vue
│   ├── accounts/
│   │   ├── index.vue          # Account list
│   │   ├── create.vue
│   │   └── [id]/
│   │       ├── index.vue      # Account detail
│   │       └── edit.vue
│   ├── transactions/
│   │   ├── index.vue          # Transaction list
│   │   └── [id]/
│   │       └── edit.vue
│   ├── budgets/
│   │   ├── index.vue          # Current month budget
│   │   └── [year]/
│   │       └── [month].vue    # Specific month budget
│   ├── categories/
│   │   └── index.vue          # Category management
│   ├── reports/
│   │   └── index.vue          # Reports & analytics
│   └── settings/
│       ├── index.vue          # General settings
│       ├── profile.vue
│       └── security.vue
├── plugins/                    # Nuxt plugins
│   ├── api.ts                 # API client setup
│   ├── charts.ts              # Chart library
│   └── vee-validate.ts        # Form validation
├── public/                     # Public static files
│   └── favicon.ico
├── server/                     # Server middleware (optional)
│   └── api/
├── stores/                     # Pinia stores
│   ├── auth.ts
│   ├── accounts.ts
│   ├── categories.ts
│   ├── transactions.ts
│   ├── budgets.ts
│   └── ui.ts
├── types/                      # TypeScript types
│   ├── api.ts                 # API response types
│   ├── models.ts              # Domain models
│   └── forms.ts               # Form types
├── utils/                      # Utility functions
│   ├── currency.ts
│   ├── date.ts
│   ├── validation.ts
│   └── formatters.ts
├── .env.example
├── .gitignore
├── nuxt.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 🎨 Core Features

### 1. Authentication & User Management
- ✅ User registration with email validation
- ✅ Login with JWT tokens
- ✅ Token refresh mechanism
- ✅ Forgot password flow
- ✅ Reset password
- ✅ Change password (authenticated)
- ✅ Email verification
- ✅ Persistent auth state
- ✅ Auto-logout on token expiration

### 2. Dashboard
- 📊 Total balance across all accounts
- 📈 Monthly spending vs. budget
- 💰 Income vs. expenses chart
- 📝 Recent transactions (last 10)
- 🎯 Budget progress indicators
- 📅 Quick month selector
- ⚡ Quick add transaction button
- 🔔 Budget alerts (over/near limit)

### 3. Accounts Management
- ➕ Create/Edit/Delete accounts
- 💳 Account types: Cash, Checking, Credit
- 🌍 Multi-currency support
- 💵 Real-time balance calculation
- 📊 Account transaction history
- 🏦 Account list with balance summary
- 🔄 Transfer between accounts

### 4. Categories Management
- 🏷️ Create/Edit/Delete categories
- 📂 Income vs. Expense categories
- 🎨 Custom category colors/icons
- 📊 Category spending analytics
- 🔄 Bulk category operations

### 5. Transactions
- ➕ Create/Edit/Delete transactions
- 🔍 Advanced filtering (date range, account, category)
- 📅 Date picker with calendar
- 💰 Amount input with currency formatting
- 📝 Optional notes
- 📊 Transaction list with pagination
- 🔄 Bulk operations
- 📥 Import transactions (CSV)
- 📤 Export transactions

### 6. Budget Management
- 📅 Monthly budget view
- 🎯 Set budget per category
- 📊 Progress bars (planned vs. actual)
- 🔔 Warning indicators (over budget)
- 📈 Budget vs. actual comparison chart
- 📅 Navigate between months
- 📋 Copy budget from previous month
- 💡 Budget suggestions based on history

### 7. Reports & Analytics
- 📊 Expense breakdown by category
- 📈 Income vs. expense trends
- 📅 Monthly/yearly comparisons
- 🥧 Pie charts for spending distribution
- 📉 Line charts for trends
- 📊 Bar charts for category comparison
- 📤 Export reports (PDF, CSV)
- 📅 Custom date ranges

### 8. Settings
- 👤 Profile management
- 🔒 Security settings (change password)
- 💱 Currency preferences
- 🌓 Theme toggle (light/dark mode)
- 📱 Notification preferences
- 🗑️ Delete account

---

## 📄 Page Architecture

### Public Pages (Guest Only)
```
/login                 - Login page
/register              - Registration page
/forgot-password       - Request password reset
/reset-password        - Reset password with token
/verify-email          - Email verification with token
```

### Protected Pages (Require Auth)
```
/                      - Dashboard (home)
/accounts              - Account list
/accounts/create       - Create new account
/accounts/:id          - Account detail view
/accounts/:id/edit     - Edit account
/transactions          - Transaction list & management
/transactions/:id/edit - Edit transaction
/budgets               - Current month budget
/budgets/:year/:month  - Specific month budget
/categories            - Category management
/reports               - Reports & analytics
/settings              - General settings
/settings/profile      - Profile settings
/settings/security     - Security settings
```

---

## 🧩 Component Architecture

### Component Hierarchy

```
App
├── Layout (Default)
│   ├── AppHeader
│   │   ├── UserMenu
│   │   └── MobileNav
│   ├── AppSidebar (Desktop)
│   │   └── Navigation Links
│   └── AppFooter
│
├── Pages
│   ├── Dashboard Page
│   │   ├── BalanceCard
│   │   ├── BudgetOverview
│   │   ├── SpendingChart
│   │   ├── RecentTransactions
│   │   │   └── TransactionItem[]
│   │   └── QuickAddTransaction
│   │
│   ├── Accounts Page
│   │   ├── AccountList
│   │   │   └── AccountCard[]
│   │   └── AccountForm (Modal)
│   │
│   ├── Transactions Page
│   │   ├── TransactionFilters
│   │   ├── TransactionList
│   │   │   └── TransactionItem[]
│   │   └── TransactionForm (Modal/Slide-over)
│   │
│   ├── Budgets Page
│   │   ├── MonthSelector
│   │   ├── BudgetProgress
│   │   ├── BudgetChart
│   │   └── BudgetItem[]
│   │       └── CategoryBudgetForm
│   │
│   └── Reports Page
│       ├── DateRangeSelector
│       ├── ExpenseByCategory
│       ├── IncomeVsExpense
│       ├── TrendChart
│       └── ExportButton
```

### Reusable UI Components

All UI components should follow these principles:
- **Accessible**: ARIA labels, keyboard navigation
- **Responsive**: Mobile-first design
- **Themeable**: Support light/dark mode
- **Consistent**: Use design tokens
- **Typed**: Full TypeScript support

---

## 🗃️ State Management

### Pinia Stores

#### 1. Auth Store (`stores/auth.ts`)
```typescript
interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

Actions:
- login(email, password)
- register(email, password)
- logout()
- refreshTokens()
- fetchUser()
- verifyEmail(token)
- forgotPassword(email)
- resetPassword(token, newPassword)
- changePassword(currentPassword, newPassword)
```

#### 2. Accounts Store (`stores/accounts.ts`)
```typescript
interface AccountsState {
  accounts: Account[]
  balances: Record<string, number>
  currentAccount: Account | null
  isLoading: boolean
}

Actions:
- fetchAccounts(includeBalance?)
- fetchBalances()
- createAccount(data)
- updateAccount(id, data)
- deleteAccount(id)
- setCurrentAccount(account)
```

#### 3. Categories Store (`stores/categories.ts`)
```typescript
interface CategoriesState {
  categories: Category[]
  incomeCategories: Category[]
  expenseCategories: Category[]
  isLoading: boolean
}

Actions:
- fetchCategories()
- createCategory(data)
- updateCategory(id, data)
- deleteCategory(id)
```

#### 4. Transactions Store (`stores/transactions.ts`)
```typescript
interface TransactionsState {
  transactions: Transaction[]
  filters: TransactionFilters
  pagination: PaginationState
  isLoading: boolean
}

Actions:
- fetchTransactions(filters?)
- createTransaction(data)
- updateTransaction(id, data)
- deleteTransaction(id)
- setFilters(filters)
```

#### 5. Budgets Store (`stores/budgets.ts`)
```typescript
interface BudgetsState {
  currentBudget: BudgetMonth | null
  budgetItems: BudgetItem[]
  year: number
  month: number
  isLoading: boolean
}

Actions:
- fetchBudget(year, month)
- setBudgetItem(categoryId, plannedCents)
- updateBudgetItem(categoryId, plannedCents)
- deleteBudgetItem(categoryId)
- copyFromPreviousMonth()
```

#### 6. UI Store (`stores/ui.ts`)
```typescript
interface UIState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  currency: string
  toasts: Toast[]
}

Actions:
- toggleTheme()
- toggleSidebar()
- setCurrency(currency)
- showToast(toast)
- dismissToast(id)
```

---

## 🔌 API Integration

### API Client Setup

Create a centralized API client using composables:

**`composables/useApi.ts`**
```typescript
export const useApi = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  
  const api = $fetch.create({
    baseURL: config.public.apiBase,
    async onRequest({ options }) {
      const token = authStore.accessToken
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`
        }
      }
    },
    async onResponseError({ response }) {
      if (response.status === 401) {
        // Try to refresh token
        await authStore.refreshTokens()
        // Retry request would be handled here
      }
    }
  })
  
  return api
}
```

### API Endpoints Map

```typescript
// Auth
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/change-password
POST   /api/auth/verify-email
POST   /api/auth/resend-verification

// Accounts
GET    /api/accounts
GET    /api/accounts/balances
GET    /api/accounts/:id
POST   /api/accounts
PUT    /api/accounts/:id
DELETE /api/accounts/:id

// Categories
GET    /api/categories
GET    /api/categories/:id
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id

// Transactions
GET    /api/transactions
GET    /api/transactions/:id
POST   /api/transactions
PUT    /api/transactions/:id
DELETE /api/transactions/:id

// Budgets
GET    /api/budgets/:year/:month
POST   /api/budgets/:year/:month/items
PUT    /api/budgets/:year/:month/items/:categoryId
DELETE /api/budgets/:year/:month/items/:categoryId
```

---

## 🔐 Authentication Flow

### Registration Flow
1. User fills registration form
2. Client validates input (email format, password strength)
3. POST `/api/auth/register`
4. Server creates user, sends verification email (optional)
5. Client receives tokens or success message
6. If tokens received, store and redirect to dashboard
7. If email verification required, show verification notice

### Login Flow
1. User enters email/password
2. Client validates input
3. POST `/api/auth/login`
4. Server validates credentials, returns tokens
5. Client stores tokens (localStorage/cookie)
6. Store user state in Pinia
7. Redirect to dashboard

### Token Refresh Flow
1. Access token expires (detected on 401 response)
2. Client automatically calls POST `/api/auth/refresh`
3. Server validates refresh token, returns new tokens
4. Client updates stored tokens
5. Retry original request
6. If refresh fails, logout user

### Protected Route Middleware
```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
  
  // Optional: Check email verification
  if (!authStore.user?.emailVerified && to.path !== '/verify-email') {
    return navigateTo('/verify-email')
  }
})
```

---

## 🎨 UI/UX Design System

### Color Palette

#### Light Mode
```
Primary: Indigo (600)
Success: Green (500)
Warning: Amber (500)
Danger: Red (500)
Background: Gray (50)
Card: White
Text: Gray (900)
Muted: Gray (500)
```

#### Dark Mode
```
Primary: Indigo (400)
Success: Green (400)
Warning: Amber (400)
Danger: Red (400)
Background: Gray (900)
Card: Gray (800)
Text: Gray (50)
Muted: Gray (400)
```

### Typography
- **Font Family**: Inter, system-ui, sans-serif
- **Headings**: Font weight 700
- **Body**: Font weight 400
- **Small**: Font weight 500

### Spacing Scale
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

### Component Patterns

#### Cards
- Rounded corners (8px)
- Shadow on hover
- Padding: 24px
- Background: white/gray-800
- Border: 1px solid gray-200/gray-700

#### Buttons
- **Primary**: Filled with primary color
- **Secondary**: Outlined
- **Ghost**: Text only
- **Sizes**: sm, md, lg
- **States**: default, hover, active, disabled, loading

#### Forms
- **Labels**: Above input, weight 500
- **Inputs**: Rounded (6px), border on focus
- **Validation**: Inline error messages
- **Help text**: Below input, muted color

#### Charts
- **Colors**: Use categorical color palette
- **Tooltips**: Show on hover
- **Legend**: Top or bottom
- **Responsive**: Scale on mobile

---

## 📅 Implementation Phases

### Phase 1: Setup & Foundation (Week 1)
- [ ] Initialize Nuxt 3 project
- [ ] Configure TypeScript, ESLint, Prettier
- [ ] Set up Tailwind CSS
- [ ] Install core dependencies
- [ ] Create base layout components
- [ ] Set up Pinia stores structure
- [ ] Configure API client
- [ ] Create type definitions

### Phase 2: Authentication (Week 2)
- [ ] Implement auth store
- [ ] Create login page
- [ ] Create registration page
- [ ] Create forgot password flow
- [ ] Create reset password page
- [ ] Implement auth middleware
- [ ] Add token refresh mechanism
- [ ] Create user menu component

### Phase 3: Core UI Components (Week 2-3)
- [ ] Button component
- [ ] Input component
- [ ] Card component
- [ ] Modal component
- [ ] Dropdown component
- [ ] Date picker
- [ ] Table component
- [ ] Form validation setup
- [ ] Toast notifications

### Phase 4: Dashboard (Week 3-4)
- [ ] Dashboard layout
- [ ] Balance card
- [ ] Recent transactions list
- [ ] Budget overview widget
- [ ] Spending chart
- [ ] Quick actions (add transaction)

### Phase 5: Accounts Module (Week 4-5)
- [ ] Accounts store
- [ ] Account list page
- [ ] Account card component
- [ ] Account form (create/edit)
- [ ] Account detail page
- [ ] Balance calculation integration

### Phase 6: Categories Module (Week 5)
- [ ] Categories store
- [ ] Category management page
- [ ] Category form
- [ ] Category list component
- [ ] Category selector component
- [ ] Category icons

### Phase 7: Transactions Module (Week 6-7)
- [ ] Transactions store
- [ ] Transaction list page
- [ ] Transaction form (create/edit)
- [ ] Transaction filters
- [ ] Date range picker
- [ ] Amount input with currency
- [ ] Pagination component

### Phase 8: Budget Module (Week 7-8)
- [ ] Budgets store
- [ ] Budget main page
- [ ] Month selector
- [ ] Budget items list
- [ ] Budget form per category
- [ ] Progress indicators
- [ ] Budget charts
- [ ] Copy from previous month feature

### Phase 9: Reports & Analytics (Week 9)
- [ ] Reports page layout
- [ ] Expense by category chart
- [ ] Income vs expense chart
- [ ] Trend analysis chart
- [ ] Date range selector
- [ ] Export functionality
- [ ] Print stylesheet

### Phase 10: Settings & Profile (Week 10)
- [ ] Settings layout
- [ ] Profile page
- [ ] Change password form
- [ ] Currency preferences
- [ ] Theme toggle
- [ ] Delete account

### Phase 11: Polish & Optimization (Week 11)
- [ ] Mobile responsiveness review
- [ ] Loading states everywhere
- [ ] Error handling improvements
- [ ] Empty states
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] SEO meta tags

### Phase 12: Testing & Deployment (Week 12)
- [ ] Unit tests (key components)
- [ ] E2E tests (critical flows)
- [ ] Cross-browser testing
- [ ] Production build optimization
- [ ] Deployment setup
- [ ] Documentation

---

## 📝 Development Guidelines

### Code Style
- Use Composition API (not Options API)
- Use `<script setup>` syntax
- Type everything with TypeScript
- Use composables for reusable logic
- Keep components small and focused
- Follow Vue style guide

### Component Guidelines
```vue
<script setup lang="ts">
// 1. Imports
import { ref, computed } from 'vue'
import type { Account } from '~/types/models'

// 2. Props & Emits
interface Props {
  account: Account
  showBalance?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showBalance: true
})

const emit = defineEmits<{
  edit: [id: string]
  delete: [id: string]
}>()

// 3. Composables
const { formatCurrency } = useCurrency()

// 4. Reactive state
const isHovered = ref(false)

// 5. Computed
const formattedBalance = computed(() => {
  return formatCurrency(props.account.balance)
})

// 6. Methods
const handleEdit = () => {
  emit('edit', props.account.id)
}
</script>

<template>
  <!-- Use semantic HTML -->
  <!-- Add proper aria labels -->
  <!-- Mobile-first responsive design -->
</template>

<style scoped>
/* Prefer Tailwind, minimize custom CSS */
</style>
```

### Error Handling
```typescript
// Always wrap API calls in try-catch
try {
  const data = await api('/accounts')
  accounts.value = data
} catch (error) {
  showToast({
    type: 'error',
    message: 'Failed to load accounts'
  })
  console.error(error)
}
```

### Loading States
```typescript
// Always show loading states
const isLoading = ref(false)

const fetchData = async () => {
  isLoading.value = true
  try {
    // fetch data
  } finally {
    isLoading.value = false
  }
}
```

### Accessibility Checklist
- [ ] All interactive elements keyboard accessible
- [ ] Proper heading hierarchy
- [ ] Alt text for images
- [ ] ARIA labels for icon buttons
- [ ] Focus indicators visible
- [ ] Color contrast ratio > 4.5:1
- [ ] Form inputs have labels
- [ ] Error messages announced to screen readers

### Performance Best Practices
- Lazy load routes with defineAsyncComponent
- Use virtual scrolling for long lists
- Debounce search/filter inputs
- Optimize images (use WebP)
- Code split by route
- Use computed for expensive calculations
- Memoize components when needed

---

## 🔄 Data Flow Example

### Creating a Transaction

```
User fills form → Validate input → Call store action → 
API request → Update local state → Show success toast → 
Refresh accounts balance → Update transaction list
```

**Step-by-step:**

1. **User Action**: Fills transaction form
2. **Component**: `TransactionForm.vue`
   ```typescript
   const handleSubmit = async () => {
     const isValid = await validate()
     if (!isValid) return
     
     await transactionStore.createTransaction(formData)
     emit('success')
     resetForm()
   }
   ```

3. **Store Action**: `stores/transactions.ts`
   ```typescript
   async createTransaction(data: CreateTransactionInput) {
     this.isLoading = true
     try {
       const api = useApi()
       const transaction = await api('/transactions', {
         method: 'POST',
         body: data
       })
       this.transactions.unshift(transaction)
       
       // Refresh account balance
       const accountStore = useAccountsStore()
       await accountStore.fetchBalances()
       
       // Show success
       const ui = useUIStore()
       ui.showToast({ type: 'success', message: 'Transaction added' })
       
       return transaction
     } catch (error) {
       throw error
     } finally {
       this.isLoading = false
     }
   }
   ```

---

## 📊 Key Metrics to Track

### User Experience
- Page load time < 2s
- Time to interactive < 3s
- First contentful paint < 1s
- Lighthouse score > 90

### Code Quality
- TypeScript coverage: 100%
- Test coverage: > 80%
- No console errors
- Accessibility score: 100

---

## 🚀 Getting Started

### Prerequisites
```bash
# Node.js 18+ required
node --version

# Install pnpm (recommended)
npm install -g pnpm
```

### Initial Setup
```bash
# Create Nuxt project
npx nuxi@latest init budget-ui
cd budget-ui

# Install dependencies
pnpm install

# Install additional packages
pnpm add @pinia/nuxt @nuxtjs/tailwindcss
pnpm add -D @nuxtjs/color-mode @vueuse/nuxt
pnpm add dayjs zod @vee-validate/zod
pnpm add chart.js vue-chartjs

# Start dev server
pnpm dev
```

### Environment Variables
```bash
# .env
NUXT_PUBLIC_API_BASE=http://localhost:3000/api
NUXT_PUBLIC_APP_URL=http://localhost:3001
```

---

## 📚 Resources & References

### Documentation
- [Nuxt 3 Docs](https://nuxt.com)
- [Vue 3 Docs](https://vuejs.org)
- [Pinia Docs](https://pinia.vuejs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [VueUse](https://vueuse.org)

### Design Inspiration
- [Mint](https://mint.intuit.com) - Budget tracking
- [YNAB](https://www.youneedabudget.com) - Budgeting UI
- [Actual Budget](https://actualbudget.com) - Clean interface

### Component Libraries
- [Nuxt UI](https://ui.nuxt.com)
- [Shadcn Vue](https://www.shadcn-vue.com)
- [HeadlessUI](https://headlessui.com)

---

## ✅ Success Criteria

### Functionality
- ✅ All API endpoints integrated
- ✅ All CRUD operations working
- ✅ Auth flow complete and secure
- ✅ Real-time balance updates
- ✅ Charts rendering correctly
- ✅ Mobile responsive

### Quality
- ✅ No TypeScript errors
- ✅ No console errors
- ✅ Accessible (WCAG AA)
- ✅ Fast performance
- ✅ Clean, maintainable code

### User Experience
- ✅ Intuitive navigation
- ✅ Clear visual feedback
- ✅ Helpful error messages
- ✅ Smooth animations
- ✅ Beautiful design

---

## 🎯 Next Steps

1. **Review this plan** with stakeholders
2. **Set up development environment**
3. **Create design mockups** (Figma/Adobe XD)
4. **Initialize Nuxt project**
5. **Start with Phase 1** implementation
6. **Iterate and improve** based on feedback

---

**Document Version**: 1.0  
**Last Updated**: October 9, 2025  
**Status**: Ready for Implementation

