<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Expense;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExpenseTest extends TestCase
{
    use RefreshDatabase;

    private function authenticatedUser()
    {
        $user = User::factory()->create(['balance' => 1000]);
        $token = $user->createToken('test-token')->plainTextToken;
        return [$user, $token];
    }

    public function test_user_can_get_expenses()
    {
        [$user, $token] = $this->authenticatedUser();
        $category = Category::factory()->create(['user_id' => $user->id]);
        
        Expense::factory()->create(['user_id' => $user->id, 'category_id' => $category->id, 'amount' => 50]);
        Expense::factory()->create(['user_id' => $user->id, 'category_id' => $category->id, 'amount' => 75]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/expenses');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data')
            ->assertJsonFragment(['amount' => '50.00'])
            ->assertJsonFragment(['amount' => '75.00']);
    }

    public function test_user_can_create_expense()
    {
        [$user, $token] = $this->authenticatedUser();
        $category = Category::factory()->create(['user_id' => $user->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/expenses', [
            'amount' => 100.50,
            'description' => 'Grocery shopping',
            'notes' => 'Weekly groceries',
            'category_id' => $category->id,
            'expense_date' => '2024-01-15'
        ]);

        $response->assertStatus(201)
            ->assertJsonFragment([
                'amount' => '100.50',
                'description' => 'Grocery shopping'
            ]);

        $this->assertDatabaseHas('expenses', [
            'amount' => 100.50,
            'user_id' => $user->id
        ]);

        $user->refresh();
        $this->assertEquals(899.50, $user->balance);
    }

    public function test_expense_creation_requires_valid_data()
    {
        [$user, $token] = $this->authenticatedUser();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/expenses', [
            'amount' => '',
            'description' => '',
            'category_id' => 999
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['amount', 'description', 'category_id']);
    }

    public function test_user_can_update_expense()
    {
        [$user, $token] = $this->authenticatedUser();
        $category = Category::factory()->create(['user_id' => $user->id]);
        $expense = Expense::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'amount' => 50
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson("/api/expenses/{$expense->id}", [
            'amount' => 75,
            'description' => 'Updated expense',
            'category_id' => $category->id,
            'expense_date' => '2024-01-15'
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['amount' => '75.00']);

        $this->assertDatabaseHas('expenses', [
            'id' => $expense->id,
            'amount' => 75
        ]);
    }

    public function test_user_can_delete_expense()
    {
        [$user, $token] = $this->authenticatedUser();
        $category = Category::factory()->create(['user_id' => $user->id]);
        $expense = Expense::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'amount' => 100
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->deleteJson("/api/expenses/{$expense->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('expenses', ['id' => $expense->id]);

        $user->refresh();
        $this->assertEquals(1100, $user->balance);
    }

    public function test_expenses_can_be_filtered_by_category()
    {
        [$user, $token] = $this->authenticatedUser();
        $category1 = Category::factory()->create(['user_id' => $user->id, 'name' => 'Food']);
        $category2 = Category::factory()->create(['user_id' => $user->id, 'name' => 'Transport']);
        
        Expense::factory()->create(['user_id' => $user->id, 'category_id' => $category1->id]);
        Expense::factory()->create(['user_id' => $user->id, 'category_id' => $category2->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson("/api/expenses?category_id={$category1->id}");

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_expenses_can_be_filtered_by_amount_range()
    {
        [$user, $token] = $this->authenticatedUser();
        $category = Category::factory()->create(['user_id' => $user->id]);
        
        Expense::factory()->create(['user_id' => $user->id, 'category_id' => $category->id, 'amount' => 25]);
        Expense::factory()->create(['user_id' => $user->id, 'category_id' => $category->id, 'amount' => 75]);
        Expense::factory()->create(['user_id' => $user->id, 'category_id' => $category->id, 'amount' => 125]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/expenses?min_amount=50&max_amount=100');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonFragment(['amount' => '75.00']);
    }

    public function test_expenses_can_be_filtered_by_date_range()
    {
        [$user, $token] = $this->authenticatedUser();
        $category = Category::factory()->create(['user_id' => $user->id]);
        
        Expense::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'expense_date' => '2024-01-15'
        ]);
        Expense::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'expense_date' => '2024-02-15'
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/expenses?date_from=2024-02-01&date_to=2024-02-28');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_user_cannot_access_other_users_expenses()
    {
        [$user1, $token1] = $this->authenticatedUser();
        [$user2, $token2] = $this->authenticatedUser();
        
        $category = Category::factory()->create(['user_id' => $user2->id]);
        $expense = Expense::factory()->create(['user_id' => $user2->id, 'category_id' => $category->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token1,
        ])->getJson("/api/expenses/{$expense->id}");

        $response->assertStatus(404);
    }
}
