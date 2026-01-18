# NextJS & React Best Practices - Takeaways

*Generated from official documentation via Context7 queries*

---

## Table of Contents

1. [NextJS Best Practices](#nextjs-best-practices)
   - [Data Fetching Strategies](#data-fetching-strategies)
   - [Server vs Client Components](#server-vs-client-components)
   - [Component Composition Patterns](#component-composition-patterns)
2. [React Best Practices](#react-best-practices)
   - [State Management](#state-management)
   - [Performance Optimization](#performance-optimization)
   - [Core Rules of React](#core-rules-of-react)
3. [Key Architectural Decisions](#key-architectural-decisions)

---

## NextJS Best Practices

### Data Fetching Strategies

#### 1. Server Components with Direct Fetch

In NextJS App Router, you can fetch data directly in async Server Components. The framework provides three caching strategies:

**Static Data (Similar to `getStaticProps`):**
```typescript
export default async function Page() {
  const data = await fetch('https://api.example.com/posts', { 
    cache: 'force-cache' // Default, can be omitted
  })
  const posts = await data.json()
  return <PostList posts={posts} />
}
```

**Dynamic Data (Similar to `getServerSideProps`):**
```typescript
export default async function Page() {
  const data = await fetch('https://api.example.com/posts', { 
    cache: 'no-store' // Refetch on every request
  })
  const posts = await data.json()
  return <PostList posts={posts} />
}
```

**Revalidated Data (ISR - Incremental Static Regeneration):**
```typescript
export default async function Page() {
  const data = await fetch('https://api.example.com/posts', {
    next: { revalidate: 10 } // Revalidate every 10 seconds
  })
  const posts = await data.json()
  return <PostList posts={posts} />
}
```

**Key Takeaway:** Next.js automatically caches fetch requests by default. Use cache options to control behavior.

#### 2. Database/ORM Queries in Server Components

You can safely query databases directly from Server Components - queries execute server-side with no client exposure:

```typescript
import { db, posts } from '@/lib/db'

export default async function Page() {
  const allPosts = await db.select().from(posts)
  return (
    <ul>
      {allPosts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

**Key Takeaway:** No need for API routes for data fetching - access your database directly in Server Components.

---

### Server vs Client Components

#### The Fundamental Shift

**App Router Default:** All components are Server Components by default.

**When to Use Client Components (`'use client'`):**
- Need browser APIs (localStorage, window, etc.)
- Need event handlers (onClick, onChange, etc.)
- Need React hooks (useState, useEffect, etc.)
- Need interactivity or state management

#### Best Practice: Minimize Client Component Boundary

Keep the JavaScript bundle small by marking only interactive parts as Client Components:

```tsx
// Layout.tsx (Server Component)
import Search from './search'  // Client Component with 'use client'
import Logo from './logo'      // Server Component (no 'use client')

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav>
        <Logo />      {/* Server Component - no JS bundle */}
        <Search />    {/* Client Component - interactive search */}
      </nav>
      <main>{children}</main>
    </>
  )
}
```

**Key Takeaway:** Default to Server Components, use Client Components only when necessary for interactivity.

---

### Component Composition Patterns

#### Pattern 1: Server Component Fetches, Client Component Renders

The recommended pattern is to fetch data in Server Components and pass it as props to Client Components:

```typescript
// page.tsx (Server Component)
import HomePage from './home-page' // Client Component

async function getPosts() {
  const res = await fetch('https://api.example.com/posts')
  const posts = await res.json()
  return posts
}

export default async function Page() {
  const recentPosts = await getPosts()
  return <HomePage recentPosts={recentPosts} />
}
```

```typescript
// home-page.tsx (Client Component)
'use client'

export default function HomePage({ recentPosts }) {
  return (
    <div>
      {recentPosts.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  )
}
```

#### Pattern 2: Server Component with Nested Client Components

Server Components can pass data to Client Components for client-side interactivity:

```typescript
import LikeButton from '@/app/ui/like-button' // Client Component
import { getPost } from '@/lib/data'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPost(id)

  return (
    <div>
      <main>
        <h1>{post.title}</h1>
        <LikeButton likes={post.likes} />
      </main>
    </div>
  )
}
```

**Key Takeaway:** Server Components handle data fetching, Client Components handle interactivity.

---

## React Best Practices

### State Management

#### useState vs useReducer: When to Use Each

**Use `useState` when:**
- State updates are simple
- You want less upfront code
- Easy to read and maintain
- Few state variables

```javascript
const [count, setCount] = useState(0)
const [name, setName] = useState('')
```

**Use `useReducer` when:**
- Complex state logic with multiple sub-values
- Next state depends on previous state
- Multiple event handlers modify state similarly
- Better debugging needed (action logs)
- Need to separate "how" (update logic) from "what happened" (events)

```javascript
function tasksReducer(tasks, action) {
  switch (action.type) {
    case 'added':
      return [
        ...tasks,
        { id: action.id, text: action.text, done: false }
      ]
    case 'changed':
      return tasks.map((t) => 
        t.id === action.task.id ? action.task : t
      )
    case 'deleted':
      return tasks.filter((t) => t.id !== action.id)
    default:
      throw Error('Unknown action: ' + action.type)
  }
}

function TaskApp() {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks)
  
  function handleAddTask(text) {
    dispatch({ type: 'added', id: nextId++, text })
  }
  
  return <TaskList tasks={tasks} onAddTask={handleAddTask} />
}
```

**Key Comparison:**

| Aspect | useState | useReducer |
|--------|----------|------------|
| Code size | Less code upfront | More code (reducer + actions) |
| Readability | Simple updates | Complex updates cleaner |
| Debugging | Harder to trace | Action logs help |
| Testing | Test components | Test reducer in isolation |
| Preference | Personal choice | Personal choice |

**Key Takeaway:** Both are equivalent - you can always convert between them. Use what fits your use case.

---

#### Scaling State with Reducer + Context

For complex state shared across many components, combine `useReducer` with Context API:

```javascript
// TasksContext.js
import { createContext, useReducer } from 'react'

export const TasksContext = createContext(null)
export const TasksDispatchContext = createContext(null)

export function TasksProvider({ children }) {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks)

  return (
    <TasksContext.Provider value={tasks}>
      <TasksDispatchContext.Provider value={dispatch}>
        {children}
      </TasksDispatchContext.Provider>
    </TasksContext.Provider>
  )
}
```

```javascript
// App.js
import { TasksProvider } from './TasksContext.js'

export default function TaskApp() {
  return (
    <TasksProvider>
      <h1>Day off in Kyoto</h1>
      <AddTask />
      <TaskList />
    </TasksProvider>
  )
}
```

**Benefits:**
- Avoids prop drilling
- Separates state from dispatch
- Scalable for large component trees
- Clean separation of concerns

**Key Takeaway:** For app-wide state, use Reducer + Context instead of passing props through many levels.

---

### Performance Optimization

#### Performance Hooks Overview

React provides hooks to optimize re-rendering:

**1. `useMemo` - Cache Expensive Calculations**
```javascript
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b)
}, [a, b])
```

**2. `useCallback` - Cache Function Definitions**

Especially important for custom hooks to allow consumers to optimize:

```javascript
function useRouter() {
  const { dispatch } = useContext(RouterStateContext)

  const navigate = useCallback((url) => {
    dispatch({ type: 'navigate', url })
  }, [dispatch])

  const goBack = useCallback(() => {
    dispatch({ type: 'back' })
  }, [dispatch])

  return { navigate, goBack }
}
```

**3. `useTransition` - Non-blocking State Updates**

Separate blocking updates (like typing) from non-blocking updates (like updating charts):

```javascript
const [isPending, startTransition] = useTransition()

function handleChange(value) {
  // Blocking update - runs immediately
  setInputValue(value)
  
  // Non-blocking update - can be interrupted
  startTransition(() => {
    setSearchResults(filterResults(value))
  })
}
```

**4. `useDeferredValue` - Defer Non-Critical UI Updates**

```javascript
const deferredQuery = useDeferredValue(query)
```

**Key Takeaway:** Use performance hooks judiciously - premature optimization can make code harder to maintain.

---

### Core Rules of React

#### 1. Components and Hooks Must Be Pure

**Pure Functions:**
- Same inputs → same outputs
- No side effects during rendering
- Enables React's automatic optimizations

**Side effects belong in:**
- `useEffect` - for effects after render
- Event handlers - for user interactions

```javascript
// ❌ Bad - side effect during render
function Component() {
  localStorage.setItem('key', 'value') // Side effect!
  return <div>Hello</div>
}

// ✅ Good - side effect in useEffect
function Component() {
  useEffect(() => {
    localStorage.setItem('key', 'value')
  }, [])
  return <div>Hello</div>
}
```

#### 2. React Calls Components and Hooks

Don't call components or hooks yourself - let React handle it:

```javascript
// ❌ Bad
const result = MyComponent()

// ✅ Good
<MyComponent />
```

#### 3. Rules of Hooks

**Only call Hooks:**
- At the top level (not in loops, conditions, or nested functions)
- From React function components
- From custom Hooks

```javascript
// ❌ Bad - conditional hook
function Component({ condition }) {
  if (condition) {
    useState(0) // Wrong!
  }
}

// ✅ Good - hook at top level
function Component({ condition }) {
  const [count, setCount] = useState(0)
  if (condition) {
    // Use the state here
  }
}
```

**Key Takeaway:** Following these rules ensures React can correctly preserve state between renders.

---

## Key Architectural Decisions

### Migration from Pages Router to App Router

**Major Changes:**

1. **Component Type Default:**
   - Pages Router: Client Components by default
   - App Router: Server Components by default

2. **Data Fetching:**
   - Old: `getServerSideProps`, `getStaticProps`, `getInitialProps`
   - New: Async Server Components with `fetch()` or direct DB queries

3. **File Structure:**
   - Old: `pages/index.tsx`
   - New: `app/page.tsx` (Server Component) + `app/home-page.tsx` (Client Component)

### Decision Framework

**When building a new feature, ask:**

1. **Does it need interactivity?**
   - No → Server Component ✅
   - Yes → Client Component with `'use client'`

2. **Does it fetch data?**
   - Fetch in Server Component, pass as props to Client Component

3. **Is state complex?**
   - Simple → `useState`
   - Complex/Shared → `useReducer` + Context

4. **Performance concerns?**
   - Expensive calculations → `useMemo`
   - Callback props → `useCallback`
   - Non-blocking updates → `useTransition`

---

## Summary: Golden Rules

### NextJS
1. ✅ **Default to Server Components** - opt into Client Components only when needed
2. ✅ **Fetch data in Server Components** - pass data as props to Client Components
3. ✅ **Use fetch() cache options** - control static, dynamic, or revalidated data
4. ✅ **Direct database queries are safe** - in Server Components (never exposed to client)
5. ✅ **Minimize JavaScript bundle** - keep Client Component boundaries small

### React
1. ✅ **Components must be pure** - no side effects during render
2. ✅ **Choose the right state tool** - useState for simple, useReducer for complex
3. ✅ **Scale with Context + Reducer** - avoid prop drilling in large apps
4. ✅ **Optimize deliberately** - useMemo, useCallback when measurements show benefit
5. ✅ **Follow Rules of Hooks** - top level only, no conditionals

---

## Additional Resources

- **NextJS Library ID:** `/vercel/next.js`
- **React Library ID:** `/websites/18_react_dev`
- **Query Source:** Context7 documentation system
- **Documentation Quality:** High reputation sources with extensive code snippets

---

*This document was generated from official NextJS and React documentation to provide quick reference for best practices and architectural decisions.*
