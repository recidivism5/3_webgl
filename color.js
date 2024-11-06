export class Color {
    constructor(r, g, b, a){
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    clone(){
        return new Color(this.r,this.g,this.b,this.a);
    }
}