# Transaction Module

This module contains the Transaction Dashboard functionality, broken down into smaller, manageable components.

## Structure

```
Transaction/
├── index.jsx                    # Main TransactionApp component
├── TransactionHeader.jsx        # Header with title and subtitle
├── TransactionStats.jsx         # Statistics cards component
├── TransactionForm.jsx          # Quick add transaction form
├── TransactionTable.jsx         # Main transactions table
├── FilterDrawer.jsx            # Filter drawer component
├── hooks/
│   └── useTransactions.js      # Custom hook for transaction logic
└── utils/
    └── transactionUtils.js     # Utility functions
```

## Components

### TransactionApp (index.jsx)

Main orchestrating component that combines all sub-components and manages the overall state flow.

### TransactionHeader

Simple header component with title and description.

### TransactionStats

Displays statistical cards:

- Total Transactions
- Total Debit
- Total Credit
- Current Period

### TransactionForm

Quick add form for creating new transactions with fields:

- Transaction name
- Amount
- Credit/Debit toggle
- Date
- Tags

### TransactionTable

Main data table with features:

- Inline editing
- Sorting
- Search/filtering on Name and Tags columns
- Pagination
- Actions (edit/save/cancel)

### FilterDrawer

Side drawer for filtering transactions by:

- Start date
- End date
- Tags

## Custom Hook

### useTransactions

Centralizes all transaction-related logic:

- API calls (fetch, create, update)
- State management
- Event handlers
- Pagination logic

## Utilities

### transactionUtils.js

Helper functions for:

- Date parsing and formatting
- Data preparation for API calls
- Tag color generation

## Benefits of This Structure

1. **Maintainability**: Each component has a single responsibility
2. **Reusability**: Components can be easily reused in other parts of the app
3. **Testability**: Smaller components are easier to unit test
4. **Readability**: Logic is separated from presentation
5. **Performance**: Components can be optimized individually
6. **Development**: Multiple developers can work on different components simultaneously

## Usage

The main component is exported as default from `index.jsx` and can be imported as:

```jsx
import TransactionApp from "./Transaction";
```

The original `TransactionApp.jsx` file now simply re-exports this modular version for backward compatibility.
