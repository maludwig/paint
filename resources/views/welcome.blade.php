@extends('layouts.headonly')

@section('body')
    <div class="flex-center position-ref full-height">
        <div class="content">
            <div class="title m-b-md">
                <img src="/favicon/favicon.png" alt="logo" width="610" height="610" class="img-fluid"/>
                <h1>Multiplayer Paint</h1>
                <h3>Paint with friends!</h3>
                <a href="{{ route('paintings.index') }}" class="btn btn-primary">Get Painting!</a>
            </div>
        </div>
    </div>
@endsection
