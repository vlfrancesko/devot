<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    private function authenticatedUser()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;
        return [$user, $token];
    }

    public function test_user_can_get_categories()
    {
        [$user, $token] = $this->authenticatedUser();
        
        Category::factory()->create(['user_id' => $user->id, 'name' => 'Food']);
        Category::factory()->create(['user_id' => $user->id, 'name' => 'Transport']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/categories');

        $response->assertStatus(200)
            ->assertJsonCount(2)
            ->assertJsonFragment(['name' => 'Food'])
            ->assertJsonFragment(['name' => 'Transport']);
    }

    public function test_user_can_create_category()
    {
        [$user, $token] = $this->authenticatedUser();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/categories', [
            'name' => 'Entertainment',
            'description' => 'Movies, games, etc.',
            'color' => '#FF5722'
        ]);

        $response->assertStatus(201)
            ->assertJsonFragment([
                'name' => 'Entertainment',
                'description' => 'Movies, games, etc.',
                'color' => '#FF5722'
            ]);

        $this->assertDatabaseHas('categories', [
            'name' => 'Entertainment',
            'user_id' => $user->id
        ]);
    }

    public function test_category_creation_requires_name()
    {
        [$user, $token] = $this->authenticatedUser();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/categories', [
            'description' => 'Test category'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_user_can_update_category()
    {
        [$user, $token] = $this->authenticatedUser();
        $category = Category::factory()->create(['user_id' => $user->id, 'name' => 'Old Name']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson("/api/categories/{$category->id}", [
            'name' => 'New Name',
            'description' => 'Updated description'
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'New Name']);

        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'name' => 'New Name'
        ]);
    }

    public function test_user_can_delete_category()
    {
        [$user, $token] = $this->authenticatedUser();
        $category = Category::factory()->create(['user_id' => $user->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->deleteJson("/api/categories/{$category->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }

    public function test_user_cannot_access_other_users_categories()
    {
        [$user1, $token1] = $this->authenticatedUser();
        [$user2, $token2] = $this->authenticatedUser();
        
        $category = Category::factory()->create(['user_id' => $user2->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token1,
        ])->putJson("/api/categories/{$category->id}", [
            'name' => 'Hacked Name'
        ]);

        $response->assertStatus(404);
    }
}
