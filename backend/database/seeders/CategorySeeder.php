<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Food & Dining', 'description' => 'Groceries, restaurants, takeout', 'color' => '#EF4444'],
            ['name' => 'Transportation', 'description' => 'Car expenses, fuel, public transport', 'color' => '#3B82F6'],
            ['name' => 'Accommodation', 'description' => 'Rent, mortgage, utilities', 'color' => '#10B981'],
            ['name' => 'Entertainment', 'description' => 'Movies, games, hobbies', 'color' => '#8B5CF6'],
            ['name' => 'Healthcare', 'description' => 'Medical expenses, insurance', 'color' => '#F59E0B'],
            ['name' => 'Shopping', 'description' => 'Clothing, electronics, personal items', 'color' => '#EC4899'],
            ['name' => 'Gifts & Donations', 'description' => 'Presents, charity, tips', 'color' => '#06B6D4'],
            ['name' => 'Education', 'description' => 'Books, courses, training', 'color' => '#84CC16'],
            ['name' => 'Bills & Utilities', 'description' => 'Phone, internet, electricity', 'color' => '#6B7280'],
            ['name' => 'Other', 'description' => 'Miscellaneous expenses', 'color' => '#64748B'],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['name' => $category['name'], 'is_predefined' => true],
                array_merge($category, [
                    'user_id' => null,
                    'is_predefined' => true,
                ])
            );
        }
    }
}
