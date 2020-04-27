
import { Color } from './color'
import { isEqual } from 'lodash'

describe('Color tests', () => {
  test('identical colors are equal', () => {
    const c1 = new Color('#102030')
    const c2 = new Color('rgb(16,32,48)')
    expect(c1).toEqual(c2)
    console.log(isEqual(c1, c2))
  })
})
