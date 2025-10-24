<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * @OA\Tag(
 *     name="Analytics",
 *     description="Financial analytics and reporting endpoints"
 * )
 */
class AnalyticsController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * @OA\Get(
     *     path="/api/analytics/summary",
     *     tags={"Analytics"},
     *     summary="Get financial summary",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="period",
     *         in="query",
     *         @OA\Schema(type="string", enum={"month", "quarter", "year"})
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Financial summary retrieved successfully"
     *     )
     * )
     */
    public function summary(Request $request): JsonResponse
    {
        $period = $request->get('period', 'month');
        $userId = auth()->id();
        
        $dateRange = $this->getDateRange($period);
        
        // Total spent in period
        $totalSpent = Expense::where('user_id', $userId)
            ->whereBetween('expense_date', $dateRange)
            ->sum('amount');
        
        // Current balance
        $currentBalance = auth()->user()->balance;
        
        // Initial balance (assuming 1000 + total spent - current balance)
        $initialBalance = 1000.00;
        
        // Spending by category
        $spendingByCategory = Expense::select('categories.name', DB::raw('SUM(expenses.amount) as total'))
            ->join('categories', 'expenses.category_id', '=', 'categories.id')
            ->where('expenses.user_id', $userId)
            ->whereBetween('expense_date', $dateRange)
            ->groupBy('categories.id', 'categories.name')
            ->orderBy('total', 'desc')
            ->get();
        
        // Daily spending trend
        $dailySpending = Expense::select(
                DB::raw('date(expense_date) as date'),
                DB::raw('SUM(amount) as total')
            )
            ->where('user_id', $userId)
            ->whereBetween('expense_date', $dateRange)
            ->groupBy(DB::raw('date(expense_date)'))
            ->orderBy('date')
            ->get();
        
        return response()->json([
            'period' => $period,
            'date_range' => [
                'from' => $dateRange[0],
                'to' => $dateRange[1]
            ],
            'summary' => [
                'initial_balance' => $initialBalance,
                'current_balance' => $currentBalance,
                'total_spent' => $totalSpent,
                'remaining_budget' => $currentBalance,
                'spending_rate' => $totalSpent > 0 ? ($totalSpent / $initialBalance) * 100 : 0
            ],
            'spending_by_category' => $spendingByCategory,
            'daily_spending' => $dailySpending
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/analytics/trends",
     *     tags={"Analytics"},
     *     summary="Get spending trends",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Spending trends retrieved successfully"
     *     )
     * )
     */
    public function trends(Request $request): JsonResponse
    {
        $userId = auth()->id();
        $period = $request->get('period', 'month');
        
        // Monthly spending for the last 6 months
        $monthlySpending = Expense::select(
                DB::raw('strftime("%Y", expense_date) as year'),
                DB::raw('strftime("%m", expense_date) as month'),
                DB::raw('SUM(amount) as total')
            )
            ->where('user_id', $userId)
            ->where('expense_date', '>=', Carbon::now()->subMonths(6))
            ->groupBy(DB::raw('strftime("%Y", expense_date)'), DB::raw('strftime("%m", expense_date)'))
            ->orderBy('year')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'period' => sprintf('%s-%02d', $item->year, $item->month),
                    'total' => $item->total
                ];
            });
        
        // Top spending categories (all time)
        $topCategories = Expense::select('categories.name', DB::raw('SUM(expenses.amount) as total'))
            ->join('categories', 'expenses.category_id', '=', 'categories.id')
            ->where('expenses.user_id', $userId)
            ->groupBy('categories.id', 'categories.name')
            ->orderBy('total', 'desc')
            ->limit(5)
            ->get();
        
        return response()->json([
            'monthly_spending' => $monthlySpending,
            'top_categories' => $topCategories
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/analytics/budget-status",
     *     tags={"Analytics"},
     *     summary="Get current budget status",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Budget status retrieved successfully"
     *     )
     * )
     */
    public function budgetStatus(): JsonResponse
    {
        $user = auth()->user();
        $userId = $user->id;
        
        // Current month spending
        $currentMonth = Carbon::now();
        $monthStart = $currentMonth->copy()->startOfMonth();
        $monthEnd = $currentMonth->copy()->endOfMonth();
        
        $monthlySpent = Expense::where('user_id', $userId)
            ->whereBetween('expense_date', [$monthStart, $monthEnd])
            ->sum('amount');
        
        // Average daily spending this month
        $daysInMonth = $currentMonth->daysInMonth;
        $daysPassed = $currentMonth->day;
        $avgDailySpending = $daysPassed > 0 ? $monthlySpent / $daysPassed : 0;
        
        // Projected monthly spending
        $projectedMonthlySpending = $avgDailySpending * $daysInMonth;
        
        return response()->json([
            'current_balance' => $user->balance,
            'monthly_spent' => $monthlySpent,
            'days_passed' => $daysPassed,
            'days_remaining' => $daysInMonth - $daysPassed,
            'avg_daily_spending' => round($avgDailySpending, 2),
            'projected_monthly_spending' => round($projectedMonthlySpending, 2),
            'budget_health' => $this->calculateBudgetHealth($user->balance, $projectedMonthlySpending)
        ]);
    }

    private function getDateRange(string $period): array
    {
        $now = Carbon::now();
        
        return match ($period) {
            'month' => [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()],
            'quarter' => [$now->copy()->startOfQuarter(), $now->copy()->endOfQuarter()],
            'year' => [$now->copy()->startOfYear(), $now->copy()->endOfYear()],
            default => [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()]
        };
    }

    private function calculateBudgetHealth(float $balance, float $projectedSpending): string
    {
        if ($balance <= 0) {
            return 'critical';
        }
        
        if ($projectedSpending > $balance) {
            return 'warning';
        }
        
        if ($balance > $projectedSpending * 2) {
            return 'excellent';
        }
        
        return 'good';
    }
}
