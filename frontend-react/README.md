# Home Budget Frontend

A minimal React TypeScript frontend for the Home Budget API.

## Features

- ✅ User authentication (login/register)
- ✅ Dashboard with balance overview
- ✅ Add new expenses
- ✅ View recent expenses
- ✅ Category selection
- ✅ Real-time balance updates

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Access the app**:
   - Frontend: http://localhost:5173
   - API: http://localhost:88/api

## Usage

1. **Register/Login**: Create account or login with existing credentials
2. **View Dashboard**: See current balance, monthly spending, and expense count
3. **Add Expenses**: Click "Add Expense" to create new expense entries
4. **View History**: Recent expenses are displayed with category and amount

## API Integration

The frontend connects to the Laravel API running on `localhost:88` and includes:

- Automatic token management
- API error handling
- Real-time data updates
- Secure authentication flow

## Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/         # Custom React hooks
├── pages/         # Page components
├── services/      # API service layer
├── types/         # TypeScript interfaces
└── App.tsx        # Main app component
```

## Default Credentials

For testing, you can use:
- Email: `john@example.com`
- Password: `password123`

Or register a new account to get started with $1000 initial balance.