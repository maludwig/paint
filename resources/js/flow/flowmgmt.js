/* jshint -W117 */
/* jshint -W098 */
import './touch'
import { Hook } from './hook'
import { Flow } from './flow'
import { Surface } from './surface'
import { Color } from './color'

// Requires touch.js, hook.js, flow.js, and surface.js

export let scratch, modern, historic
let scratchFlow
let flows = []
let undoMark = 0 // Last flow to be undone
let histoMark = -1 // Last flow to be added to historic
const UNDOCOUNT = 5
let currentTool = 'pen'
let currentSize = 3
let currentColor = '#000'

export const flowActions = {
  add: new Hook(),
  undo: new Hook(),
  redo: new Hook(),
  clear: new Hook(),
  initialize: function () {
    $('#overlay').touchStart(flowActions.start).touchMove(flowActions.move).touchEnd(flowActions.end)
  },
  start: function (x, y) {
    scratchFlow.point(x, y)
  },
  move: function (x, y) {
    scratchFlow.point(x, y)
  },
  end: function (x, y) {
    scratchFlow.point(x, y)
    flowActions.add(scratchFlow)
    scratch.clear()
    scratchFlow = new Flow({ surface: scratch, tool: currentTool, strokeWidth: currentSize, color: currentColor })
  }
}
export const flowMgmt = {
  initialize: function () {
    const d = $('#painting-container').width()
    $('#overlay').css({
      width: d + 'px',
      height: d + 'px'
    })
    scratch = new Surface({ canvas: '#scratch', x: 0, y: 0, w: d, h: d })
    modern = new Surface({ canvas: '#modern', x: 0, y: 0, w: d, h: d })
    historic = new Surface({ canvas: '#historic', x: 0, y: 0, w: d, h: d })
    scratchFlow = new Flow({ surface: scratch })

    // Any calls to flowActions.add/undo/redo/clear will also call flowMgmt's respective function.
    flowActions.add(flowMgmt.add)
    flowActions.undo(flowMgmt.undo)
    flowActions.redo(flowMgmt.redo)
    flowActions.clear(flowMgmt.clear)

    $(window).resize(function () {
      const d = $('#painting-container').width()
      $('#overlay').css({
        width: d + 'px',
        height: d + 'px'
      })
      scratch.resize(d, d)
      modern.resize(d, d)
      historic.resize(d, d)
      flowMgmt.redrawHistoric()
      flowMgmt.redrawModern()
    })
    return {
      scratch,
      modern,
      historic
    }
  },
  tool: function (newTool) {
    if (newTool) {
      currentTool = newTool
      scratchFlow = new Flow({ surface: scratch, tool: currentTool, strokeWidth: currentSize, color: currentColor })
    } else {
      return currentTool
    }
  },
  size: function (newSize) {
    if (newSize) {
      currentSize = newSize
      scratch.strokeWidth(newSize)
      scratchFlow = new Flow({ surface: scratch, tool: currentTool, strokeWidth: currentSize, color: currentColor })
    } else {
      return currentSize
    }
  },
  color: function (newColor) {
    if (newColor) {
      currentColor = new Color(newColor)
      scratch.color(currentColor)
      scratchFlow = new Flow({ surface: scratch, tool: currentTool, strokeWidth: currentSize, color: currentColor })
    } else {
      return currentSize
    }
  },
  getMaxDimension: function () {
    const $overlay = $('#overlay')
    const overlayHeight = $overlay.outerHeight()
    const overlayWidth = $overlay.outerWidth()
    let d = Math.max(screen.width, screen.height, overlayHeight, overlayWidth) + 200
    if (window.innerWidth) d = Math.max(d, window.innerWidth)
    if (window.innerHeight) d = Math.max(d, window.innerHeight)
    return d
  },
  getLastUndo: function () {
    return flows[undoMark]
  },
  getLastRedo: function () {
    return flows[undoMark - 1]
  },
  search: function (flow) {
    for (let i = flows.length - 1; i >= 0; i--) {
      if (flows[i] === flow) {
        return i
      }
    }
    return -1
  },
  undo: function (flow) {
    let f
    if (flows.length > 0 && undoMark > 0) {
      if (typeof flow === 'undefined') {
        undoMark--
        f = flows[undoMark]
        if (f.s === modern) {
          flowMgmt.redrawModern()
        } else {
          flowMgmt.redrawHistoric()
        }
        // menu.activate('#redo')
      } else {
        const idx = flowMgmt.search(flow)
        if (idx !== -1) {
          undoMark = idx
          f = flows[undoMark]
          if (f.s === modern) {
            flowMgmt.redrawModern()
          } else {
            flowMgmt.redrawModern()
            flowMgmt.redrawHistoric()
          }
        }
        // menu.activate('#redo')
      }
    }
    if (undoMark === 0) {
      // menu.deactivate('#undo')
    }
  },
  redo: function () {
    if (flows.length > undoMark) {
      const f = flows[undoMark]
      undoMark++
      if (f.s === modern) {
        flowMgmt.redrawModern()
      } else {
        flowMgmt.redrawHistoric()
      }
      // menu.activate('#undo')
    }
    if (flows.length === undoMark) {
      // menu.deactivate('#redo')
    }
  },
  toDataURL: function () {
    for (let i = histoMark + 1; i < flows.length; i++) {
      flows[i].surface(historic)
      flows[i].redraw()
    }
    histoMark = flows.length - 1
    return historic.toDataURL()
  },
  add: function (newFlow) {
    // Ignore locally generated flows
    for (const oldFlow of flows) {
      if (oldFlow.identicalTo(newFlow)) {
        if (oldFlow.id === null && newFlow.id !== null) {
          oldFlow.id = newFlow.id
        }
        return
      }
    }
    if (undoMark !== flows.length) {
      flows = flows.slice(0, undoMark)
      histoMark = Math.min(histoMark, undoMark - 1)
    }
    newFlow.surface(modern)
    if (newFlow === scratchFlow) {
      newFlow.tool(currentTool)
    }
    flows.push(newFlow)
    const nextHistory = flows.length - UNDOCOUNT
    if (histoMark < nextHistory) {
      const f = flows[nextHistory]
      f.surface(historic)
      f.redraw()
      histoMark = nextHistory
    }
    undoMark = flows.length
    flowMgmt.redrawModern()
  },
  redrawModern: function () {
    const from = Math.max(0, histoMark + 1)
    const to = Math.min(flows.length, undoMark)
    modern.clear()
    for (let i = from; i < to; i++) {
      flows[i].redraw()
    }
  },
  redrawHistoric: function () {
    const to = Math.min(histoMark + 1, undoMark)
    historic.clear()
    for (let i = 0; i < to; i++) {
      flows[i].redraw()
    }
  },
  clear: function () {
    flows = []
    undoMark = 0 // Last flow to be undone
    histoMark = -1 // Last flow to be added to historic
    scratch.clear()
    modern.clear()
    historic.clear()
  }
}
