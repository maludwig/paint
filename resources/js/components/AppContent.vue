<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-12">
              <painting-surface v-bind:painting_id="painting.id" />
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: ['painting'],
        mounted() {
            console.log('AppContent mounted.')
        }
    }
</script>
