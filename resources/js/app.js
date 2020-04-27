import Vue from 'vue'
import './bootstrap'
import { upperFirst } from 'lodash'

/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

/**
 * The following block of code may be used to automatically register your
 * Vue components. It will recursively scan this directory for the Vue
 * components and automatically register them with their "basename".
 *
 * Eg. ./components/ExampleComponent.vue -> <example-component></example-component>
 */

const files = require.context('./', true, /\.vue$/i)
for (const key of files.keys()) {
  const cut = key.split('/').slice(2).map(dirName => upperFirst(dirName))
  const baseName = cut.pop().split('.')[0]
  const elementName = cut.join(' ') + baseName
  const elementExport = files(key).default
  console.log('Registering ' + elementName)
  Vue.component(elementName, elementExport)
}

// Vue.component('example-component', require('./components/ExampleComponent.vue').default);

/**
 * Next, we will create a fresh Vue application instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

let app

$(function () {
  if ($('#app').length) {
    app = new Vue({
      el: '#app',
      data: {
        message: 'Hello World',
        shapes: [
          { id: 1, name: 'first', shape_data: 'asdf' },
          { id: 2, name: 'second', shape_data: 'asdfaaa' }
        ],
        painting: {
          id: 1,
          name: 'boo',
          description: 'blah'
        }
      }
    })
  }
})

setTimeout(() => {
  $('#painting-list .created-timestamp').each(function (idx) {
    const timestamp = $(this).data('createdAt') + 'Z'
    const createdAt = moment(timestamp)
    console.log(createdAt.fromNow())
    $(this).text(createdAt.fromNow())
    $(this).attr('title', createdAt.format())
  }, 1000)
})
