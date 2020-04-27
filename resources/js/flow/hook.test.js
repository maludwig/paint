import {Hook} from './hook'

describe('Hook tests', () => {
    test('named binds kick properly', () => {
        let x = 0
        let obj = {z:3}
        let h = new Hook(obj)
        h.bind(function (...args) {
            expect(args).toEqual([1,2,3,4])
            x++
            obj.a = args[0]
        })
        expect(x).toBe(0)
        expect(obj).toEqual({z:3})
        h.trigger(1,2,3,4)
        expect(x).toBe(1)
        expect(obj).toEqual({z:3,a:1})
    })
    test('implied binds kick properly', () => {
        let x = 0
        let obj = {z:3}
        let h = new Hook(obj)
        h(function (...args) {
            expect(args).toEqual([1,2,3,4])
            x++
            obj.a = args[0]
        })
        expect(x).toBe(0)
        expect(obj).toEqual({z:3})
        h(1,2,3,4)
        expect(x).toBe(1)
        expect(obj).toEqual({z:3,a:1})
    })
})
