@extends('paintings.single')

@section('painting-title')
  {{ $painting->name }}
@endsection

@section('painting-content')
  <div class="row">
    <div class="col-12">
      <pre>{{ $painting->description }}</pre>
      <div id="app">
        <painting-surface painting-id="{{ $painting->id }}"/>
      </div>
    </div>
  </div>
@endsection
