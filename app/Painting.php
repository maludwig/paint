<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Painting extends Model
{
    protected $fillable = [
        'name', 'description','user_id'
    ];

    public function user()
    {
        return $this->belongsTo('App\User');
    }

    public function shapes()
    {
        return $this->hasMany('App\Shape');
    }
}
