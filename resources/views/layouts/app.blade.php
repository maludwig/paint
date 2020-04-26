@extends('layouts.headonly')

@section('body')

    <div id="app">
        <x-nav-bar/>
        <br />
        <div style="display: none">
            <nav-bar v-bind:stuff="message"/>
            <app-content/>
            App: @{{message}}
        </div>
        <main class="container-fluid">
            @yield('content')
        </main>

    </div>
@endsection

