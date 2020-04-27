<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Shape extends Model
{
    protected $dateFormat = 'Y-m-d H:i:s.u';
    protected $fillable = [
        'user_id', 'painting_id','shape_data'
    ];

    protected $casts = [
      'shape_data' => 'json',
    ];
    public function user()
    {
        return $this->belongsTo('App\User');
    }

    public function painting()
    {
        return $this->belongsTo('App\Painting');
    }
}
