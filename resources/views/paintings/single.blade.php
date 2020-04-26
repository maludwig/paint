@extends('layouts.app')

@section('content')
    <div class="row">
        <div class="col-12">
            <h2>
                <a class="btn btn-light" href="{{ route('paintings.index') }}"><i class="fas fa-arrow-left"></i></a>
                @yield('painting-title')
            </h2>
        </div>
    </div>
    @yield('painting-content')
@endsection
