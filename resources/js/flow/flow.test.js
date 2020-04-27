import { Flow } from './flow'
import { Point } from './linearalgebra-1.4'

describe('Flow tests', () => {
  test('identical flows are equal', () => {
    const surface1 = { s: 1 }
    const surface2 = { s: 1 }
    const f1 = new Flow({
      points: [
        new Point(1, 2)
      ],
      color: '#001122',
      surface: surface1
    })
    const f2 = new Flow({
      points: [
        new Point(1, 2)
      ],
      color: '#001122',
      surface: surface1
    })
    expect(f1).toEqual(f2)
  })
})
