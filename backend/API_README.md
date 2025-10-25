# Home Budget API

A simple REST API for managing personal budget and expenses built with Laravel.

## Features

- ✅ User authentication (register, login, logout)
- ✅ Categories CRUD operations
- ✅ Expenses CRUD operations with filtering
- ✅ Predefined categories (Food, Transportation, etc.)
- ✅ Financial analytics and reporting
- ✅ Balance management with automatic deduction
- ✅ Swagger API documentation
- ✅ Comprehensive filtering (category, price range, date range, search)

## Tech Stack

- **Framework**: Laravel 12
- **Database**: MySQL 8.0
- **Authentication**: Laravel Sanctum
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker with Laravel Sail

## Installation & Setup

1. **Start the application**:
   ```bash
   docker compose up -d
   ```

2. **Run migrations and seed data**:
   ```bash
   docker compose exec laravel.test php artisan migrate --seed
   ```

3. **Generate API documentation**:
   ```bash
   docker compose exec laravel.test php artisan l5-swagger:generate
   ```

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user (requires auth)

### Categories
- `GET /api/categories` - List all categories (user's + predefined)
- `POST /api/categories` - Create new category
- `GET /api/categories/{id}` - Get specific category
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

### Expenses
- `GET /api/expenses` - List expenses with filtering
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/{id}` - Get specific expense
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense

### Analytics
- `GET /api/analytics/summary` - Financial summary (month/quarter/year)
- `GET /api/analytics/trends` - Spending trends
- `GET /api/analytics/budget-status` - Current budget status

## Filtering Options

The expenses endpoint supports comprehensive filtering:

```
GET /api/expenses?category_id=1&min_amount=10&max_amount=100&date_from=2024-01-01&date_to=2024-01-31&search=lunch
```

**Available filters**:
- `category_id` - Filter by category
- `min_amount` / `max_amount` - Price range
- `date_from` / `date_to` - Date range
- `search` - Search in description and notes

## API Documentation

Access the interactive Swagger documentation at:
```
http://localhost:88/api/documentation
```

## Database Schema

### Users
- `id`, `name`, `email`, `password`, `balance`, `timestamps`

### Categories
- `id`, `name`, `description`, `color`, `user_id`, `is_predefined`, `timestamps`

### Expenses
- `id`, `amount`, `description`, `notes`, `expense_date`, `user_id`, `category_id`, `timestamps`

## Predefined Categories

The system comes with 10 predefined categories:
1. Food & Dining
2. Transportation
3. Accommodation
4. Entertainment
5. Healthcare
6. Shopping
7. Gifts & Donations
8. Education
9. Bills & Utilities
10. Other

## Authentication

The API uses Laravel Sanctum for authentication. Include the bearer token in requests:

```
Authorization: Bearer {your-token}
```

## Example Usage

### 1. Register a new user
```bash
curl -X POST http://localhost:88/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 2. Create an expense
```bash
curl -X POST http://localhost:88/api/expenses \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 25.50,
    "description": "Lunch at restaurant",
    "notes": "Business lunch",
    "category_id": 1,
    "expense_date": "2024-01-15"
  }'
```

### 3. Get financial summary
```bash
curl -X GET "http://localhost:88/api/analytics/summary?period=month" \
  -H "Authorization: Bearer {token}"
```

## Testing

Run the test suite:
```bash
docker compose exec laravel.test php artisan test
```

## Key Features Implemented

1. **Balance Management**: Users start with $1000, balance decreases with expenses
2. **Category System**: Mix of predefined and user-created categories
3. **Expense Tracking**: Full CRUD with comprehensive filtering
4. **Analytics**: Summary reports, trends, and budget health indicators
5. **Data Validation**: Comprehensive validation with custom error messages
6. **API Documentation**: Complete Swagger/OpenAPI documentation
7. **Security**: Token-based authentication with proper authorization checks

## Project Structure

```
app/
├── Http/Controllers/Api/
│   ├── AuthController.php
│   ├── CategoryController.php
│   ├── ExpenseController.php
│   └── AnalyticsController.php
├── Models/
│   ├── User.php
│   ├── Category.php
│   └── Expense.php
└── Http/Requests/
    ├── StoreExpenseRequest.php
    └── StoreCategoryRequest.php

database/
├── migrations/
└── seeders/
    └── CategorySeeder.php

routes/
└── api.php
```

This API provides a solid foundation for a budget management application with room for future enhancements like budgets, recurring expenses, and more advanced analytics.