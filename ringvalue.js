export class RingValue {
    constructor(max_exclusive, value){
        this.max_exclusive = max_exclusive;
        this.set(value);
    }

    #clamp(){
        if (this.value < 0){
            this.value = this.max_exclusive-1;
        } else if (this.value >= this.max_exclusive){
            this.value = 0;
        }
    }

    set(value){
        this.value = value;
        this.#clamp();
    }

    get(){
        return this.value;
    }

    add(value){
        this.value += value;
        this.#clamp();
    }
}