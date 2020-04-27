import {Point, Vector, Box, Line, Triangle, Matrix} from './linearalgebra-1.4'
describe('Point tests', () => {
    test('makes new Points properly', () => {
        const p1 = new Point(1, 2)
        expect(p1.x).toBe(1)
        expect(p1.y).toBe(2)
        const p2 = new Point(p1)
        expect(p2.x).toBe(1)
        expect(p2.y).toBe(2)
        expect(p2).toEqual(p1)
        expect(p2).not.toBe(p1)
    })
    test('finds midpoints', () => {
        const p1 = new Point(10,20)
        const p2 = new Point(30,50)
        expect(p1.midpoint(p2)).toEqual(new Point(20,35))
    })
    test('adding vectors', () => {
        const p1 = new Point(10,20)
        const v1 = new Vector(30,50)
        expect(p1.add(v1)).toEqual(new Point(40,70))
    })
    test('subtracting vectors', () => {
        const p1 = new Point(10,20)
        const v1 = new Vector(30,50)
        expect(p1.subtract(v1)).toEqual(new Point(-20,-30))
    })
    test('inside box', () => {
        const p1 = new Point(5,5)
        const p2 = new Point(50,50)
        const p3 = new Point(49.9,49.9)
        const p4 = new Point(49.9,50)
        const p5 = new Point(4,5)
        const b1 = new Box(5,5,50,50)
        expect(p1.inside(b1)).toBeTruthy()
        expect(p2.inside(b1)).toBeFalsy()
        expect(p3.inside(b1)).toBeTruthy()
        expect(p4.inside(b1)).toBeFalsy()
        expect(p5.inside(b1)).toBeFalsy()
    })
    test('stringification', () => {
        const p1 = new Point(49.9,50)
        const p2 = new Point(-49.9,50)
        expect(p1.toString()).toBe('[49.9, 50]')
        expect(p2.toString()).toBe('[-49.9, 50]')
    })
    test('serialization', () => {
        for (let x = -5; x < 200; x++) {
            for (let y = -5; y < 11; y++) {
                const pt = new Point(x,y)
                const serialized = Point.serialize(pt)
                const points = Point.deserialize(serialized)
                expect([pt]).toEqual(points)
            }
        }
    })
    test('bounding box', () => {
        let points = []
        for (let x = -5; x < 200; x++) {
            for (let y = -7; y < 11; y++) {
                points.push(new Point(x,y))
            }
        }
        const bounds = Point.boundingbox(points)
        expect(bounds).toEqual(new Box(-5,-7,199,10))
    })
})
