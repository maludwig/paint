@extends('layouts.app')

@section('content')
    <div class="row">
        <div class="col-lg-12">
            <h2>Your paintings</h2>
            <p>
                <a class="btn btn-success" href="{{ route('paintings.create') }}"><i class="fas fa-plus-circle"></i> New
                    Painting</a>
            </p>
        </div>
    </div>

    @if ($message = Session::get('success'))
        <div class="alert alert-success">
            <p>{{ $message }}</p>
        </div>
    @endif

    @if($paintings->isEmpty())
        <div class="alert alert-info" role="alert">
            You do not have any paintings. Create one!
        </div>
    @else
        <table id="painting-list" class="table table-bordered">
            <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Created</th>
                <th>Action</th>
            </tr>
            @foreach ($paintings as $painting)
                <tr>
                    <td>{{ $painting->name }}</td>
                    <td>{{ $painting->description }}</td>
                    <td class="created-timestamp" data-created-at="{{ ++$painting->created_at }}" title="{{ ++$painting->created_at }}"></td>
                    <td>
                        <form action="{{ route('paintings.destroy',$painting->id) }}" method="POST">
                            <div class="btn-group" role="group" aria-label="Actions">
                                <a class="btn btn-info" href="{{ route('paintings.show',$painting->id) }}">
                                    <i class="fas fa-eye"></i> Show
                                </a>
                                <a class="btn btn-primary" href="{{ route('paintings.edit',$painting->id) }}">
                                    <i class="fas fa-pencil-alt"></i> Edit
                                </a>
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="btn btn-danger">
                                    <i class="fas fa-trash-alt"></i> Delete
                                </button>
                            </div>
                        </form>
                    </td>
                </tr>
            @endforeach
        </table>
        <script>
            $("#painting-list .created-timestamp").each(function (idx) {
                const timestamp = $(this).data("createdAt") + "Z";
                const createdAt = moment(timestamp);
                $(this).text(createdAt.fromNow());
                $(this).attr('title', createdAt.format());
            })
        </script>
    @endif

    {!! $paintings->links() !!}

@endsection
