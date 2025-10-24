<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * @OA\Tag(
 *     name="Expenses",
 *     description="Expense management endpoints"
 * )
 */
class ExpenseController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * @OA\Get(
     *     path="/api/expenses",
     *     tags={"Expenses"},
     *     summary="Get all expenses with filtering",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="category_id",
     *         in="query",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="min_amount",
     *         in="query",
     *         @OA\Schema(type="number")
     *     ),
     *     @OA\Parameter(
     *         name="max_amount",
     *         in="query",
     *         @OA\Schema(type="number")
     *     ),
     *     @OA\Parameter(
     *         name="date_from",
     *         in="query",
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="date_to",
     *         in="query",
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Expenses retrieved successfully"
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $query = Expense::with('category')
            ->where('user_id', auth()->id())
            ->orderBy('expense_date', 'desc');

        // Apply filters
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('min_amount')) {
            $query->where('amount', '>=', $request->min_amount);
        }

        if ($request->has('max_amount')) {
            $query->where('amount', '<=', $request->max_amount);
        }

        if ($request->has('date_from')) {
            $query->where('expense_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('expense_date', '<=', $request->date_to);
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('description', 'like', '%' . $request->search . '%')
                  ->orWhere('notes', 'like', '%' . $request->search . '%');
            });
        }

        $expenses = $query->paginate(15);

        return response()->json($expenses);
    }

    /**
     * @OA\Post(
     *     path="/api/expenses",
     *     tags={"Expenses"},
     *     summary="Create a new expense",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"amount","description","category_id","expense_date"},
     *             @OA\Property(property="amount", type="number", example=25.50),
     *             @OA\Property(property="description", type="string", example="Lunch at restaurant"),
     *             @OA\Property(property="notes", type="string", example="Business lunch"),
     *             @OA\Property(property="category_id", type="integer", example=1),
     *             @OA\Property(property="expense_date", type="string", format="date", example="2024-01-15")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Expense created successfully"
     *     )
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'expense_date' => 'required|date',
        ]);

        // Check if user has sufficient balance
        $user = auth()->user();
        if ($user->balance < $request->amount) {
            return response()->json([
                'message' => 'Insufficient balance'
            ], 422);
        }

        DB::transaction(function () use ($request, $user) {
            // Create expense
            $expense = Expense::create([
                'amount' => $request->amount,
                'description' => $request->description,
                'notes' => $request->notes,
                'category_id' => $request->category_id,
                'expense_date' => $request->expense_date,
                'user_id' => auth()->id(),
            ]);

            // Update user balance
            $user->decrement('balance', $request->amount);

            return $expense;
        });

        $expense = Expense::with('category')->find($expense->id ?? Expense::latest()->first()->id);

        return response()->json($expense, 201);
    }

    /**
     * @OA\Get(
     *     path="/api/expenses/{id}",
     *     tags={"Expenses"},
     *     summary="Get a specific expense",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Expense retrieved successfully"
     *     )
     * )
     */
    public function show(string $id): JsonResponse
    {
        $expense = Expense::with('category')
            ->where('id', $id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        return response()->json($expense);
    }

    /**
     * @OA\Put(
     *     path="/api/expenses/{id}",
     *     tags={"Expenses"},
     *     summary="Update an expense",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Expense updated successfully"
     *     )
     * )
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $expense = Expense::where('id', $id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'expense_date' => 'required|date',
        ]);

        $user = auth()->user();
        $oldAmount = $expense->amount;
        $newAmount = $request->amount;
        $difference = $newAmount - $oldAmount;

        // Check if user has sufficient balance for the difference
        if ($difference > 0 && $user->balance < $difference) {
            return response()->json([
                'message' => 'Insufficient balance for this update'
            ], 422);
        }

        DB::transaction(function () use ($expense, $request, $user, $difference) {
            $expense->update($request->only([
                'amount', 'description', 'notes', 'category_id', 'expense_date'
            ]));

            // Adjust user balance
            if ($difference != 0) {
                $user->decrement('balance', $difference);
            }
        });

        return response()->json($expense->load('category'));
    }

    /**
     * @OA\Delete(
     *     path="/api/expenses/{id}",
     *     tags={"Expenses"},
     *     summary="Delete an expense",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=204,
     *         description="Expense deleted successfully"
     *     )
     * )
     */
    public function destroy(string $id): JsonResponse
    {
        $expense = Expense::where('id', $id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $user = auth()->user();

        DB::transaction(function () use ($expense, $user) {
            // Refund the amount to user balance
            $user->increment('balance', $expense->amount);
            $expense->delete();
        });

        return response()->json(null, 204);
    }
}
