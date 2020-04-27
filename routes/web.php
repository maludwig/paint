<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', 'WelcomeController@index');

Auth::routes();

Route::get('/home', 'HomeController@index')->name('home');

Route::resource('paintings','PaintingController')->middleware('auth');

Route::get('/paintings/{painting}/shapes', 'PaintingController@shapes')->middleware('auth');
Route::post('/paintings/{painting}/shapes', 'PaintingController@add_shape')->middleware('auth');
