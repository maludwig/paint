@extends('layouts.headonly')

@section('body')

    <div>
        <x-nav-bar/>
        <br/>
        <main class="container-fluid">
            @yield('content')
        </main>
        <br/>
    </div>
@endsection

