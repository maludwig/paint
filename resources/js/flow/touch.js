
import { Hook } from 'flow/hook'
let mDown = false;

(function ($) {
  $(document).mousedown(function (e) {
    mDown = true
  })
  $(document).mouseup(function (e) {
    mDown = false
  })
  function handleEvent ($elem, e, h) {
    let x
    let y
    const offset = $elem.offset()
    if (e.originalEvent && e.originalEvent.changedTouches && e.originalEvent.changedTouches[0]) {
      x = e.originalEvent.changedTouches[0].pageX - offset.left
      y = e.originalEvent.changedTouches[0].pageY - offset.top
    } else {
      x = e.pageX - offset.left
      y = e.pageY - offset.top
    }
    h(x, y)
    e.preventDefault()
  }
  $.fn.touchStart = function (f) {
    return this.each(function () {
      let h = $(this).data('touchstarthook')
      h = typeof h === 'undefined' ? new Hook(this) : h
      h(f)
      $(this).on('touchstart', function (e) {
        handleEvent($(this), e, h)
      })
      $(this).mousedown(function (e) {
        handleEvent($(this), e, h)
      })
      $(this).data('touchstarthook', h)
      return $(this)
    })
  }
  $.fn.touchMove = function (f) {
    return this.each(function () {
      const offset = $(this).offset()
      let h = $(this).data('touchmovehook')
      h = typeof h === 'undefined' ? new Hook(this) : h
      h(f)
      $(this).on('touchmove', function (e) {
        handleEvent($(this), e, h)
      })
      $(this).mousemove(function (e) {
        if (mDown) {
          handleEvent($(this), e, h)
        }
        e.preventDefault()
      })
      $(this).data('touchmovehook', h)
    })
  }
  $.fn.touchEnd = function (f) {
    return this.each(function () {
      let h = $(this).data('touchendhook')
      h = typeof h === 'undefined' ? new Hook(this) : h
      h(f)
      $(this).on('touchend', function (e) {
        handleEvent($(this), e, h)
      })
      $(this).mouseup(function (e) {
        handleEvent($(this), e, h)
      })
      $(this).data('touchendhook', h)
    })
  }
})(jQuery)
