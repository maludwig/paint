@extends('paintings.single')

@section('painting-title')
    {{ $painting->name }}
@endsection

@section('painting-content')
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
