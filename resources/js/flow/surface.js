import { Color } from './color'
import { Point } from './linearalgebra-1.4'

// Make new Surface
// Options:
// {
//  canvas //The canvas to draw on
//  parent //The parent element to make a new child canvas element for
// }

export class Surface {
  constructor (opt) {
    opt = typeof opt === 'undefined' ? {} : opt
    let cv = opt.canvas
    if (typeof cv === 'string') {
      cv = $(cv)[0]
    }
    if (typeof cv === 'undefined') {
      throw 'Could not find canvas: ' + opt.canvas
    }
    this.cv = cv
    this.$cv = $(cv)
    this.$cv.addClass('surface')
    const pos = this.$cv.position()
    const options = {
      x: pos.left,
      y: pos.top,
      w: this.$cv.width(),
      h: this.$cv.height(),
      tool: 'pen',
      color: '#000',
      strokeWidth: 3,
      offsetx: 0,
      offsety: 0,
      drawing: true
    }
    $.extend(options, opt)

    this.x = options.x
    this.y = options.y
    this.w = options.w
    this.h = options.h
    this.ox = options.offsetx
    this.oy = options.offsety
    $(this.cv).attr({
      width: this.w,
      height: this.h
    }).css({
      left: this.x + 'px',
      top: this.y + 'px',
      width: this.w + 'px',
      height: this.h + 'px'
    })
    if (this.cv.getContext) {
      this.ctx = this.cv.getContext('2d')
      this.ctx.lineCap = 'round'
      this.color(options.color)
      this.strokeWidth(options.strokeWidth)
      this.tool(options.tool)
      this.drawing = options.drawing
    } else {
      alert('You need canvas support to view this correctly.')
    }
  }

  toDataURL () {
    if (this.cv.toDataURL) {
      return this.cv.toDataURL('image/png')
    } else {
      alert('This function is not supported in your browser')
      return false
    }
  }

  draw (b) {
    if (typeof b === 'undefined') {
      return this.drawing
    } else {
      this.drawing = b
    }
  }

  clear () {
    if (this.drawing) {
      this.ctx.clearRect(0, 0, this.cv.width, this.cv.height)
    }
  }

  color (c) {
    if (typeof c === 'undefined') {
      return this.c
    } else {
      this.c = new Color(c)
      this.c.rgba.a = this.toolOpacity()
      if (this.tool() === 'eraser') {
        this.ctx.strokeStyle = '#FFF'
      } else {
        this.ctx.strokeStyle = this.c.toString()
      }
      this.ctx.fillStyle = this.ctx.strokeStyle
    }
  }

  tool (tool) {
    if (typeof tool === 'undefined') {
      return this.t
    } else {
      this.t = tool
      this.color(this.c)
    }
  }

  toolOpacity () {
    return this.t === 'highlighter' ? 0.2 : 1
  }

  strokeWidth (w) {
    if (typeof w === 'undefined') {
      return this.sw
    } else {
      w = w < 1 ? 1 : w
      this.sw = w
      this.ctx.lineWidth = w
    }
  }

  moveTo (pt, y) {
    if (this.drawing) {
      pt = typeof y === 'number' ? pt = new Point(pt, y) : pt
      this.ctx.moveTo(pt.x - this.ox, pt.y - this.oy)
    }
  }

  lineTo (pt, y) {
    if (this.drawing) {
      pt = typeof y === 'number' ? pt = new Point(pt, y) : pt
      this.ctx.lineTo(pt.x - this.ox, pt.y - this.oy)
    }
  }

  bezierCurveTo (pt1, pt2, pt3) {
    if (this.drawing) {
      this.ctx.bezierCurveTo(pt1.x - this.ox, pt1.y - this.oy, pt2.x - this.ox, pt2.y - this.oy, pt3.x - this.ox, pt3.y - this.oy)
    }
  }

  dot (pt, y) {
    if (this.drawing) {
      pt = typeof y === 'number' ? pt = new Point(pt, y) : pt
      this.ctx.beginPath()
      this.ctx.arc(pt.x - this.ox, pt.y - this.oy, this.strokeWidth() / 2, 0, 2 * Math.PI)
      this.ctx.fill()
    }
  }

  semicircle (pt1, pt2) {
    // Draws a semicircle centred at pt1, pointing away from pt2
    if (this.drawing) {
      const dx = pt1.x - pt2.x
      const dy = pt1.y - pt2.y
      const deg = Math.atan2(dy, dx)
      this.ctx.beginPath()
      this.ctx.arc(pt1.x - this.ox, pt1.y - this.oy, this.strokeWidth() / 2, (-0.5 * Math.PI) + deg, (0.5 * Math.PI) + deg)
      this.ctx.fill()
    }
  }

  resize (w, h) {
    // Resize canvas to w pixels wide by h pixels high
    const tempCanvas = document.createElement('canvas')
    const prevCap = this.ctx.lineCap
    const tempCtx = tempCanvas.getContext('2d')
    tempCanvas.width = w
    tempCanvas.height = h
    tempCtx.drawImage(this.cv, 0, 0)
    $(this.cv).attr({
      width: w,
      height: h
    }).css({
      width: w + 'px',
      height: h + 'px'
    })
    this.ctx.drawImage(tempCanvas, 0, 0)
    this.ctx.lineCap = prevCap
  }
}
