export class RootElement{
    public name_: string = ""
    public min_: number = 1
    public max_: number = 100

    constructor(name: string, min: number, max: number) {
        this.name_ = name;
        this.min_ = min;
        this.max_ = max
    }

    getNumber()
    {
        return Math.min(Math.floor(Math.random() * (this.max_ + 1)), this.min_)
    }
}