/**
 * Linear Algebra package.
 *
 * All work is done in radians unless otherwise specified.
 *
 * Available objects include Point, Box, Vector, Line, Matrix, Triangle
 */

//Specifies a point in cartesian coordinates.
//Accepts a Point, an object with left and top properties (as from jQuery offset() and position()), or a numeric x and y coordinate
export class Point {
    constructor(x, y) {
        if (x instanceof Point) {
            this.x = x.x;
            this.y = x.y;
        } else if (typeof x.top === "number" && typeof x.left === "number") {
            this.x = x.left;
            this.y = x.top;
        } else {
            this.x = x;
            this.y = y;
        }
    }

    midpoint(p) {
        //Returns a new Point representing the midpoint between the current Point and the input Point
        return new Point((this.x + p.x) / 2, (this.y + p.y) / 2);
    }

    add(v) {
        //Adds a Vector to the current Point, and returns the result as a new Point
        return new Point(this.x + v.dx, this.y + v.dy);
    }

    subtract(v) {
        //Subtracts a Vector from the current Point, and returns the result as a new Point
        return new Point(this.x - v.dx, this.y - v.dy);
    }

    inside(box) {
        //Returns true if the current Point is in the input Box, false otherwise
        return this.x >= box.left &&
            this.x < box.right &&
            this.y >= box.top &&
            this.y < box.bottom;
    }

    toString() {
        return "[" + this.x + ", " + this.y + "]";
    }

    static serialize(pt) {
        //Serializes the a point or set of points into an array of numeric coordinates
        if (pt instanceof Point) {
            return [pt.x, pt.y];
        } else {
            let ret = [];
            for (let i = 0; i < pt.length; i++) {
                ret.push(pt[i].x);
                ret.push(pt[i].y);
            }
            return ret;
        }
    }

    static deserialize(data) {
        //Returns an array of Points from an array of numeric coordinates
        let ret = [];
        for (let i = 0; i < data.length; i += 2) {
            ret.push(new Point(data[i], data[i + 1]));
        }
        return ret;
    }

    static boundingbox(points) {
        //Returns the smallest Box that could contain all of the Points
        let pts = arguments.length === 1 ? points : arguments;
        let minx = pts[0].x, miny = pts[0].y, maxx = pts[0].x, maxy = pts[0].y;
        for (let i = 1; i < pts.length; i++) {
            minx = Math.min(pts[i].x, minx);
            miny = Math.min(pts[i].y, miny);
            maxx = Math.max(pts[i].x, maxx);
            maxy = Math.max(pts[i].y, maxy);
        }
        return new Box(minx, miny, maxx, maxy);
    }

}

//The point at (0,0)
Point.ORIGIN = new Point(0, 0);

//Represents a rectangle
//If the input parameter is a Box, returns a duplicate of the Box
//If the input parameter is two Points, returns the smallest Box that could contain both Points
//If the input is four numbers, they are treated as the cartesian coordinates of two Points, returns the smallest Box that could contain both Points
//Mostly for convenience, this calculates each corner Point, the width, the height, and the top, bottom, left, and right coordinates.
export class Box {
    constructor(x1, y1, x2, y2) {
        let p1, p2, swap;
        if (x1 instanceof Box) {
            this.x1 = x1.x1;
            this.y1 = x1.y1;
            this.x2 = x1.x2;
            this.y2 = x1.y2;
        } else if (x1 instanceof Point && y1 instanceof Point) {
            this.x1 = x1.x;
            this.y1 = x1.y;
            this.x2 = y1.x;
            this.y2 = y1.y;
        } else {
            this.x1 = x1;
            this.y1 = y1;
            this.x2 = x2;
            this.y2 = y2;
        }
        if (this.x1 > this.x2) {
            swap = this.x1;
            this.x1 = this.x2;
            this.x2 = swap;
        }
        if (this.y1 > this.y2) {
            swap = this.y1;
            this.y1 = this.y2;
            this.y2 = swap;
        }
        this.p1 = new Point(this.x1, this.y2);
        this.p2 = new Point(this.x2, this.y2);
        this.left = this.x1;
        this.top = this.y1;
        this.right = this.x2;
        this.bottom = this.y2;
        this.width = this.x2 - this.x1;
        this.height = this.y2 - this.y1;
        this.topleft = this.p1;
        this.lefttop = this.topleft;
        this.topright = new Point(this.right, this.top);
        this.righttop = this.topright;
        this.bottomleft = new Point(this.left, this.bottom);
        this.leftbottom = this.bottomleft;
        this.bottomright = this.p2;
        this.rightbottom = this.bottomright;
    }

    toString() {
        return "{left:" + this.left + ", top:" + this.top + ", right:" + this.right + ", bottom:" + this.bottom + "}";
    }
}

//Represents a Vector
//If the input parameter is a Vector, returns a duplicate of the Vector
//If the input is a single Point, returns the Vector pointing from the Origin (0,0) to the input point
//If the input is two Points, returns the Vector pointing from the first input to the second
//If the input is two numbers, treats those numbers as coordinates of a Point, and returns the Vector pointing from the Origin to that Point
export class Vector {
    constructor(o, t) {
        if (o instanceof Vector) {
            this.o = new Point(o.o);
            this.t = new Point(o.t);
        } else if (o instanceof Point) {
            if (!t) {
                t = o;
                o = new Point(0, 0);
            }
            this.o = o;
            this.t = t;
        } else if (typeof o === "number") {
            this.o = Point.ORIGIN;
            this.t = new Point(o, t);
        }
        this.dx = this.t.x - this.o.x;
        this.dy = this.t.y - this.o.y;
    }

    add(v) {
        //Adds the input Vector to the current Vector, returns the result as a new Vector
        return new Vector(this.dx + v.dx, this.dy + v.dy);
    }

    sub(v) {
        //Subtracts the input Vector from the current Vector, returns the result as a new Vector
        return new Vector(this.dx - v.dx, this.dy - v.dy);
    }

    mul(m) {
        //Multiplies the Vector magnitude by the input number, without changing the angle
        return new Vector(this.dx * m, this.dy * m);
    }

    div(d) {
        //Divides the Vector magnitude by the input number, without changing the angle
        return new Vector(this.dx / d, this.dy / d);
    }

    dot(v) {
        //Returns the dot product of the current Vector with the input Vector
        return (this.dx * v.dx) + (this.dy * v.dy);
    }

    mag(m) {
        //If no input is provided, returns the magnitude of the Vector
        //If a numeric input is provided, sets the magnitude of the current Vector without changing the angle
        let curmag = Math.sqrt((this.dx * this.dx) + (this.dy * this.dy));
        if (typeof m !== 'undefined') {
            let newdx = this.dx * (m / curmag);
            let newdy = this.dy * (m / curmag);
            return new Vector(newdx, newdy);
        } else {
            return curmag;
        }
    }

    magsq() {
        //Returns the square of the current Vector's magnitude, used as a faster calculation
        return (this.dx * this.dx) + (this.dy * this.dy);
    }

    rotate(rad) {
        //Rotates the current Vector's angle by the input, in radians, without changing the magnitude
        rad += Math.PI;
        let angle = this.angle();
        let newx = this.o.x - this.mag() * Math.cos(angle - rad);
        let newy = this.o.y - this.mag() * Math.sin(angle - rad);
        return new Vector(new Point(this.o), new Point(newx, newy));
    }

    angle() {
        //Returns the current Vector's angle
        return Math.atan2(this.dy, this.dx);
    }

    angleFrom(v) {
        //Returns the difference between the current Vector's angle and the input Vector's angle
        let a = this.angle() - v.angle();
        if (a > Math.PI) {
            a = (-2 * Math.PI) + a;
        }
        if (a < -Math.PI) {
            a = (2 * Math.PI) + a;
        }
        return a;
    }

    terminus() {
        //Calculates the Point that would result from the addition of the current Vector to the Origin
        return new Point(this.dx, this.dy);
    }

    toPoint() {
        return new Point(this.dx, this.dy);
    }

    toString() {
        return "[" + this.dx + ", " + this.dy + "]";
    }

}

//Represents a straight line with no fixed beginning or end
//If the input is a Line, creates a new duplicate of the Line
//If the first input is a Point, and the second input is a Vector, returns the Line that intersects the Point with the same angle as the Vector
//If the first input is a Point, and the second input is a Point, returns the Line intersecting both Points
//If the first input is a Point, and the second and third inputs are numeric, returns the Line intersecting the Point, with a slope specified by the numeric inputs
export class Line {
    constructor(o, dx, dy) {
        if (o instanceof Line) {
            this.o = new Point(o.o);
            this.dx = o.dx;
            this.dy = o.dy;
        } else {
            this.o = o;
            if (dx instanceof Vector) {
                this.dx = dx.dx;
                this.dy = dx.dy;
            } else if (dx instanceof Point) {
                if (!dy) {
                    dy = dx;
                    dx = o;
                }
                this.dx = dx.x - dy.x;
                this.dy = dx.y - dy.y;
            } else {
                this.dx = dx;
                this.dy = dy;
            }
        }
        this.t = new Point(this.o.x + this.dx, this.o.y + this.dy);
        this.v = new Vector(this.o, this.t);
    }

    reflect (p) {
        //If the input is a Point, calculates the reflection of the Point across the Line, and returns the result as a new Point
        //If the input is a Vector, calculates the reflection of the Vector across the Line, and returns the result as a new Vector
        if (p instanceof Point) {
            let vop = new Vector(this.o, p);
            let v0p = new Vector(p);
            let proj = this.v.mul(this.v.dot(vop) / this.v.magsq());
            let vpd = proj.sub(vop).mul(2);
            let v0d = v0p.add(vpd);
            return v0d.terminus();
        } else if (p instanceof Vector) {
            let p1 = this.reflect(p.o);
            let p2 = this.reflect(p.t);
            return new Vector(p1, p2);
        }
    }
    rotate (rad) {
        //Rotate the line about the Origin point
        return new Line(new Point(this.o), this.v.rotate(rad));
    }
    angle () {
        //Return the angle of the Line
        return Math.atan2(this.dy, this.dx);
    }
    intersect (ln) {
        //If the current Line and the input Line intersect, calculate their intersection and return the Point
        //Throws an error of the Lines do not intersect
        if (this.dx === 0) {
            if (ln.dx === 0) {
                throw "No intersection";
            } else {
                return new Point(this.o.x, (ln.dy / ln.dx) * (this.o.x - ln.o.x) + ln.o.y);
            }
        }
        if (ln.dx === 0) {
            return new Point(ln.o.x, (this.dy / this.dx) * (ln.o.x - this.o.x) + this.o.y);
        }
        let sl1 = this.dy / this.dx;
        let sl2 = ln.dy / ln.dx;
        if (sl1 == sl2) {
            throw "No intersection";
        } else {
            let xi1 = this.o.y - (sl1 * this.o.x);
            let xi2 = ln.o.y - (sl2 * ln.o.x);
            let x = (xi2 - xi1) / (sl1 - sl2);
            let y = (sl1 * x) + xi1;
            return new Point(x, y);
        }
    }
    toString () {
        return "o" + this.o + "->[" + this.dx + ", " + this.dy + "]";
    }

}

export class Matrix {
    constructor(o) {
        //Accepts either an existing Matrix or an array of arrays of numbers as input
        if (o instanceof Matrix) {
            this.data = o.data;
        } else {
            this.data = o;
        }
        this.h = this.data.length;
        this.w = this.data[0].length;
    }

    row (k) {
        //Returns a single row from the Matrix
        return this.data[k];
    }
    col (k) {
        //Returns a single column from the Matrix
        let ret = [];
        for (let y = 0; y < this.data.length; y++) {
            ret.push(this.data[y][k]);
        }
        return ret;
    }
    mul (m) {
        //Multiplies the current matrix by the input, returns a new Matrix
        let newdata = [], x, y;
        if (m instanceof Matrix) {
            let rowa, colb, rowc, sum;
            for (y = 0; y < this.h; y++) {
                rowa = this.row(y);
                rowc = [];
                for (x = 0; x < m.w; x++) {
                    sum = 0;
                    colb = m.col(x);
                    for (let i = 0; i < this.w; i++) {
                        sum += rowa[i] * colb[i];
                    }
                    rowc.push(sum);
                }
                newdata.push(rowc);
            }
            return new Matrix(newdata);
        } else {
            let row;
            for (y = 0; y < this.h; y++) {
                row = [];
                for (x = 0; x < this.w; x++) {
                    row.push(m * this.data[y][x]);
                }
                newdata.push(row);
            }
            return new Matrix(newdata);
        }
    }
    toString () {
        let s = "{\n";
        for (let i = 0; i < this.data.length; i++) {
            s += this.data[i].toString() + "\n";
        }
        s += "}";
        return s;
    }
}

//Accepts 3 Points, a, b, and c, that define the Triangle.
export class Triangle {
    constructor(a, b, c) {
        //Precalculate the distance (vertical and horizontal) between each point.
        let abx = a.x - b.x, acx = a.x - c.x, bcx = b.x - c.x;
        let aby = a.y - b.y, acy = a.y - c.y, bcy = b.y - c.y;
        this.a = a;
        this.b = b;
        this.c = c;
        //Calculate the length of each side. lena is the length of the side opposite to Point a
        this.lena = Math.sqrt((bcx * bcx) + (bcy * bcy));
        this.lenb = Math.sqrt((acx * acx) + (acy * acy));
        this.lenc = Math.sqrt((abx * abx) + (aby * aby));
        //Calculate the angle, in radians, of each point
        this.rada = Math.acos(((this.lenb * this.lenb) + (this.lenc * this.lenc) - (this.lena * this.lena)) / (2 * this.lenb * this.lenc));
        this.radb = Math.acos(((this.lena * this.lena) + (this.lenc * this.lenc) - (this.lenb * this.lenb)) / (2 * this.lena * this.lenc));
        this.radc = (Math.PI) - (this.rada + this.radb);
        //Calculate the angle, in degrees, of each point
        this.dega = this.rada * (180 / Math.PI);
        this.degb = this.radb * (180 / Math.PI);
        this.degc = this.radc * (180 / Math.PI);
    }
}
