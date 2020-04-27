<template>
  <div id="surface-container">
    <div class="btn-group my-3" role="group" aria-label="Actions">
      <button v-on:click="setTool('highlighter')"
              v-bind:class="{ btn: true, 'btn-dark': tool === 'highlighter', 'btn-light': tool !== 'highlighter' }">
        <i class="fas fa-paint-brush"></i> Paintbrush
      </button>
      <button v-on:click="setTool('eraser')"
              v-bind:class="{ btn: true, 'btn-dark': tool === 'eraser', 'btn-light': tool !== 'eraser' }">
        <i class="fas fa-eraser"></i> Eraser
      </button>
      <button v-on:click="setTool('pen')"
              v-bind:class="{ btn: true, 'btn-dark': tool === 'pen', 'btn-light': tool !== 'pen' }">
        <i class="fas fa-pen"></i> Pen
      </button>
    </div>
    <div class="btn-group my-3" role="group" aria-label="Actions">
      <button v-for="item in [3,5,12,18]" v-on:click="setSize(item)"
              v-bind:class="{ btn: true, 'btn-dark': size === item, 'btn-light': size !== item }">
        <i class="fas fa-circle" :style="sizeStyle(item)"></i>
      </button>
    </div>

    <div class="btn-group my-3" role="group" aria-label="Actions">
      <button v-for="item in palette" v-on:click="setColor(item)"
              v-bind:class="{ btn: true, 'btn-dark': color === item, 'btn-light': color !== item }">
        <div class="color-selector" :style="colorStyle(item)"></div>
      </button>
    </div>
    <br/>
    <div id="painting-container">
      <div id="overlay"></div>
      <canvas id="historic"></canvas>
      <canvas id="modern"></canvas>
      <canvas id="scratch"></canvas>
    </div>

  </div>
</template>

<script>
  import palettes from 'flow/palettes.json'
  import { flowMgmt, flowActions } from 'flow/flowmgmt'
  import { Flow } from 'flow/flow'

  const defaultPalette = palettes[1]

  function initSurface () {
    flowMgmt.initialize()
    flowActions.initialize()
  }

  export default {
    props: ['paintingId'],
    data () {
      return {
        shapes: [],
        lastId: 0,
        intervalRef: null,
        reqInFlight: false,
        tool: 'pen',
        size: 3,
        color: defaultPalette[0],
        surface: null,
        palette: defaultPalette,
      }
    },
    methods: {
      setTool (newTool) {
        this.tool = newTool
        flowMgmt.tool(newTool)
      },
      setSize (newSize) {
        this.size = newSize
        flowMgmt.size(newSize)
      },
      setColor (newColor) {
        this.color = newColor
        flowMgmt.color('#' + newColor)
      },
      sizeStyle (size) {
        return {
          'font-size': `${size}px`,
        }
      },
      colorStyle (colorHex) {
        return {
          'background': '#' + colorHex,
        }
      },
    },
    mounted () {
      const shapeList = this
      console.log('ShapeList mounted.')
      const url = `/paintings/${shapeList.paintingId}/shapes`
      shapeList.intervalRef = setInterval(() => {
        console.log('tick')
        if (shapeList.reqInFlight) {
          console.log('Skipping request, reqs are slow')
        } else {
          shapeList.reqInFlight = true
          axios.get(url, { params: { after: shapeList.lastId } }).then(response => {
            const newShapes = response.data
            if (newShapes.length > 0) {
              shapeList.shapes = [...shapeList.shapes, ...newShapes]
              for (let shape of newShapes) {
                shapeList.lastId = Math.max(this.lastId, shape.id)
                const shapeData = shape['shape_data']
                if (shapeData.flow) {
                  const flow = Flow.deserialize(shapeData.flow)
                  flow.id = shape.id
                  // flow.color("#0f0")
                  flowActions.add(flow)
                }
              }
            }
            shapeList.reqInFlight = false
          }).catch(reason => {
            console.log(reason)
            shapeList.reqInFlight = false
          })
        }
      }, 1000)
      this.surface = initSurface()
      this.setColor(this.color)
      flowActions.add(function (flow) {
        if (!flow.id) {
          let postData = {
            'shape_data': {
              flow: Flow.serialize(flow),
            },
          }
          axios.post(url, postData).then(console.log).catch(console.error)
        }
      })
    },
    beforeDestroy () {
      clearInterval(this.intervalRef)
    },
  }
</script>
