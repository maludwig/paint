@extends('layouts.app')
@section('content')
    <div class="row">
        <h2><a class="btn btn-light" href="{{ route('paintings.index') }}"><i class="fas fa-arrow-left"></i></a> {{ $painting->name }}</h2>
    </div>

    <div class="row">
        <div class="col-12 col-md-6">
            <p>
                {{ $painting->description }}
            </p>
        </div>
        <div class="col-12 col-md-6">
            <div class="form-group">
                <strong>Details:</strong>
                {{ $painting->description }}
            </div>
        </div>
    </div>
@endsection
