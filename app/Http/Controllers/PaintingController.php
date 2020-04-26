<?php

namespace App\Http\Controllers;

use App\Painting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PaintingController extends Controller
{

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\View\View
     */
    public function index()
    {
        $paintings = Painting::latest()->paginate(20);
        return view('paintings.index', compact('paintings'))
            ->with('i', (request()->input('page', 1) -1) * 5);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\View\View
     */
    public function create()
    {
        return view('paintings.create');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
        ]);
        $props = $request->all();
        $props['user_id'] = Auth::id();
        $painting = Painting::create($props);
        return redirect()->route('paintings.show',['painting' => $painting]);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Painting  $painting
     * @return \Illuminate\View\View
     */
    public function show(Painting $painting)
    {
        return view('paintings.show', compact('painting'));
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Painting  $painting
     * @return \Illuminate\View\View
     */
    public function edit(Painting $painting)
    {
        return view('paintings.edit', compact('painting'));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Painting  $painting
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Painting $painting)
    {
        $request->validate([
            'name' => 'required',
        ]);
        $props = $request->all();
        $props['user_id'] = Auth::id();
        $painting->update($props);
        return redirect()->route('paintings.show',['painting' => $painting]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Painting  $painting
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Painting $painting)
    {
        $painting->delete();
        return redirect()->route('paintings.index')->with('success', 'Deleted successfully');
    }
}
