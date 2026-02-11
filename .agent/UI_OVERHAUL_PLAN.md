# Phantom UI Overhaul - Jira-Style Enterprise Layout

## Implementation Status

### ✅ Completed
1. **Slim Sidebar** - Icon-first navigation with blue gradient background (64px width)

### 🔄 In Progress
The following components need to be updated to complete the Jira-style transformation:

## 2. Top Navigation Bar

Create `TopNavBar.tsx` and `TopNavBar.css`:

```tsx
// TopNavBar.tsx
import React from 'react';
import { Search, Bell, Settings, HelpCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import './TopNavBar.css';

const TopNavBar: React.FC = () => {
    const { user } = useAuthStore();
    
    return (
        <div className="top-nav-bar">
            <div className="top-nav-left">
                <div className="phantom-logo">
                    <span className="logo-text">Phantom</span>
                </div>
            </div>
            
            <div className="top-nav-center">
                <div className="global-search">
                    <Search size={16} />
                    <input type="text" placeholder="Search..." />
                    <kbd>/</kbd>
                </div>
            </div>
            
            <div className="top-nav-right">
                <button className="icon-btn-top"><Bell size={18} /></button>
                <button className="icon-btn-top"><HelpCircle size={18} /></button>
                <button className="icon-btn-top"><Settings size={18} /></button>
                <div className="user-menu">
                    <div className="user-avatar-top">{user?.name?.charAt(0)}</div>
                </div>
            </div>
        </div>
    );
};

export default TopNavBar;
```

```css
/* TopNavBar.css */
.top-nav-bar {
    height: 56px;
    background: white;
    border-bottom: 2px solid #DFE1E6;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    position: sticky;
    top: 0;
    z-index: 1000;
}

.top-nav-left {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.phantom-logo {
    font-size: 1.25rem;
    font-weight: 700;
    color: #0052CC;
}

.top-nav-center {
    flex: 1;
    max-width: 600px;
    margin: 0 2rem;
}

.global-search {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #F4F5F7;
    border: 2px solid transparent;
    border-radius: 3px;
    padding: 0.5rem 0.75rem;
    transition: all 0.2s ease;
}

.global-search:focus-within {
    background: white;
    border-color: #4C9AFF;
}

.global-search input {
    flex: 1;
    border: none;
    background: none;
    outline: none;
    font-size: 0.875rem;
}

.global-search kbd {
    background: #DFE1E6;
    padding: 0.125rem 0.375rem;
    border-radius: 3px;
    font-size: 0.75rem;
    font-weight: 600;
}

.top-nav-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.icon-btn-top {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #42526E;
    transition: all 0.2s ease;
}

.icon-btn-top:hover {
    background: #EBECF0;
}

.user-avatar-top {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
}
```

## 3. Breadcrumb Component

Create `Breadcrumb.tsx`:

```tsx
import React from 'react';
import { ChevronRight } from 'lucide-react';
import './Breadcrumb.css';

interface BreadcrumbProps {
    items: { label: string; href?: string }[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
    return (
        <nav className="breadcrumb-nav">
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {index > 0 && <ChevronRight size={14} className="breadcrumb-separator" />}
                    {item.href ? (
                        <a href={item.href} className="breadcrumb-link">{item.label}</a>
                    ) : (
                        <span className="breadcrumb-current">{item.label}</span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

export default Breadcrumb;
```

```css
/* Breadcrumb.css */
.breadcrumb-nav {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: #F4F5F7;
    font-size: 0.875rem;
}

.breadcrumb-link {
    color: #42526E;
    text-decoration: none;
    transition: color 0.2s ease;
}

.breadcrumb-link:hover {
    color: #0052CC;
    text-decoration: underline;
}

.breadcrumb-current {
    color: #172B4D;
    font-weight: 600;
}

.breadcrumb-separator {
    color: #6B778C;
}
```

## 4. High-Density Kanban Cards

Update `IssueCard.css`:

```css
.issue-card {
    background: white;
    border: 1px solid #DFE1E6;
    border-radius: 3px;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border-left: 3px solid transparent;
}

.issue-card:hover {
    background: #F4F5F7;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.issue-card.type-story {
    border-left-color: #36B37E;
}

.issue-card.type-bug {
    border-left-color: #FF5630;
}

.issue-card.type-task {
    border-left-color: #0052CC;
}

.card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 0.375rem;
}

.card-title {
    font-size: 0.875rem;
    font-weight: 500;
    color: #172B4D;
    line-height: 1.4;
    margin: 0;
}

.card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.5rem;
}

.card-key {
    font-size: 0.75rem;
    color: #6B778C;
    font-weight: 600;
}

.card-meta {
    display: flex;
    align-items: center;
    gap: 0.375rem;
}

.priority-icon {
    width: 16px;
    height: 16px;
}

.assignee-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #DFE1E6;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.625rem;
    font-weight: 700;
    color: #42526E;
}
```

## 5. Slim Column Headers

Update `BoardColumn.css`:

```css
.board-column {
    background: #F4F5F7;
    border-radius: 3px;
    min-width: 280px;
    max-width: 280px;
    display: flex;
    flex-direction: column;
}

.column-header {
    padding: 0.75rem 0.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2px solid #DFE1E6;
}

.column-title {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #5E6C84;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.column-count {
    background: #DFE1E6;
    color: #42526E;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.125rem 0.5rem;
    border-radius: 12px;
    min-width: 24px;
    text-align: center;
}

.column-content {
    flex: 1;
    padding: 0.5rem;
    overflow-y: auto;
}
```

## 6. Advanced Filter Bar

Update `FilterBar.tsx` and `FilterBar.css` to match Jira's filter row with avatar circles and dropdowns.

## 7. Update AppLayout

Integrate TopNavBar and adjust grid layout:

```tsx
// AppLayout.tsx
return (
    <div className="app-layout">
        <Sidebar />
        <div className="app-main">
            <TopNavBar />
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    </div>
);
```

```css
/* AppLayout.css */
.app-layout {
    display: flex;
    min-height: 100vh;
}

.app-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.main-content {
    flex: 1;
    overflow-y: auto;
}
```

## Key Design Tokens

```css
:root {
    /* Jira Colors */
    --jira-blue: #0052CC;
    --jira-blue-light: #4C9AFF;
    --jira-green: #36B37E;
    --jira-red: #FF5630;
    --jira-yellow: #FFAB00;
    --jira-purple: #6554C0;
    
    /* Neutrals */
    --n900: #172B4D;
    --n800: #253858;
    --n700: #344563;
    --n600: #42526E;
    --n500: #5E6C84;
    --n400: #6B778C;
    --n300: #8993A4;
    --n200: #A5ADBA;
    --n100: #C1C7D0;
    --n90: #DFE1E6;
    --n80: #EBECF0;
    --n70: #F4F5F7;
    --n60: #FAFBFC;
}
```

## Implementation Order

1. ✅ Slim Sidebar (Complete)
2. Top Navigation Bar
3. Breadcrumb Component
4. High-Density Cards
5. Slim Column Headers
6. Advanced Filter Bar
7. Update AppLayout Integration

This refactor will transform Phantom into a professional, enterprise-grade tool matching Jira's information density and visual hierarchy.
