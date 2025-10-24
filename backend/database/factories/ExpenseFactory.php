<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Expense;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ExpenseFactory extends Factory
{
    protected $model = Expense::class;

    public function definition(): array
    {
        return [
            'amount' => $this->faker->randomFloat(2, 10, 500),
            'description' => $this->faker->sentence(),
            'notes' => $this->faker->optional()->paragraph(),
            'expense_date' => $this->faker->date(),
            'user_id' => User::factory(),
            'category_id' => Category::factory(),
        ];
    }
}