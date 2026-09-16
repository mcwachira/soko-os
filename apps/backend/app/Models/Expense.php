<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Expense extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'branch_id',
        'supplier_id',
        'expense_category_id',
        'account_id',
        'bank_account_id',
        'created_by_user_id',
        'approved_by_user_id',
        'expense_number',
        'status',
        'expense_date',
        'payment_date',
        'payment_method',
        'reference',
        'payee_name',
        'description',
        'notes',
        'receipt_path',
        'amount_minor',
        'tax_minor',
        'total_minor',
    ];

    protected $casts = [
        'amount_minor' => 'integer',
        'tax_minor' => 'integer',
        'total_minor' => 'integer',
        'expense_date' => 'date',
        'payment_date' => 'date',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function category()
    {
        return $this->belongsTo(ExpenseCategory::class, 'expense_category_id');
    }

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function bankAccount()
    {
        return $this->belongsTo(BankAccount::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by_user_id');
    }
}
