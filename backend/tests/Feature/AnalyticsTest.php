<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Expense;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    private function authenticatedUser()
    {
        $user = User::factory()->create(['balance' => 1000]);
        $token = $user->createToken('test-token')->plainTextToken;
        return [$user, $token];
    }

    public function test_user_can_get_summary()
    {
        [$user, $token] = $this->authenticatedUser();
        $category = Category::factory()->create(['user_id' => $user->id]);
        
        Expense::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'amount' => 100,
            'expense_date' => now()->format('Y-m-d')
        ]);
        Expense::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'amount' => 50,
            'expense_date' => now()->format('Y-m-d')
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/analytics/summary');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'period',
                'date_range',
                'summary' => [
                    'initial_balance',
                    'current_balance',
                    'total_spent',
                    'remaining_budget',
                    'spending_rate'
                ],
                'spending_by_category',
                'daily_spending'
            ]);
    }

    public function test_user_can_get_trends()
    {
        [$user, $token] = $this->authenticatedUser();
        $category = Category::factory()->create(['user_id' => $user->id]);
        
        Expense::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'amount' => 100,
            'expense_date' => now()->subMonth()->format('Y-m-d')
        ]);
        Expense::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'amount' => 150,
            'expense_date' => now()->format('Y-m-d')
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/analytics/trends?period=month');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'monthly_spending',
                'top_categories'
            ]);
    }

    public function test_user_can_get_budget_status()
    {
        [$user, $token] = $this->authenticatedUser();
        $category = Category::factory()->create(['user_id' => $user->id]);
        
        Expense::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'amount' => 200,
            'expense_date' => now()->format('Y-m-d')
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/analytics/budget-status');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'current_balance',
                'monthly_spent',
                'days_passed',
                'days_remaining',
                'avg_daily_spending',
                'projected_monthly_spending',
                'budget_health'
            ]);
    }

    public function test_trends_supports_different_periods()
    {
        [$user, $token] = $this->authenticatedUser();

        $periods = ['month', 'quarter', 'year'];
        
        foreach ($periods as $period) {
            $response = $this->withHeaders([
                'Authorization' => 'Bearer ' . $token,
            ])->getJson("/api/analytics/trends?period={$period}");

            $response->assertStatus(200);
        }
    }

    public function test_analytics_requires_authentication()
    {
        $endpoints = [
            '/api/analytics/summary',
            '/api/analytics/trends',
            '/api/analytics/budget-status'
        ];

        foreach ($endpoints as $endpoint) {
            $response = $this->getJson($endpoint);
            $response->assertStatus(401);
        }
    }
}