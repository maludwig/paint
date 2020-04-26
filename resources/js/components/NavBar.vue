<template>
    <p>{{ stuff }}</p>
</template>

<script>
    export default {
        props: ['stuff'],
        mounted() {
            console.log('NavBar mounted.')
        }
    }
</script>
