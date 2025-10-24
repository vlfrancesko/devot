<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreExpenseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'amount' => 'required|numeric|min:0.01|max:999999.99',
            'description' => 'required|string|max:255',
            'notes' => 'nullable|string|max:1000',
            'category_id' => 'required|exists:categories,id',
            'expense_date' => 'required|date|before_or_equal:today',
        ];
    }

    public function messages(): array
    {
        return [
            'amount.required' => 'The expense amount is required.',
            'amount.min' => 'The expense amount must be at least 0.01.',
            'amount.max' => 'The expense amount cannot exceed 999,999.99.',
            'description.required' => 'The expense description is required.',
            'category_id.required' => 'Please select a category.',
            'category_id.exists' => 'The selected category is invalid.',
            'expense_date.before_or_equal' => 'The expense date cannot be in the future.',
        ];
    }
}
