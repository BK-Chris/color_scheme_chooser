class Rectangle {
    constructor(x, y, width, height) {
        try {
            x = Number(x);
            y = Number(y);
            width = Number(width);
            height = Number(height);
        } catch (err) {
            console.error(`Failed to conver one or more value to numbers. Expected numbers.` +
                `\n x=${x}, y=${y}, width=${width}, height=${height}`);
            return;
        }
        this.x = x;
        this.y = y;
        this.w = width;
        this.h = height;

        this.centerX = x + width / 2;
        this.centerY = y + height / 2;
    }

    move(deltaX, deltaY) {
        try {
            deltaX = Number(deltaX);
            deltaY = Number(deltaY);
        } catch (err) {
            console.error(`Failed to conver one or more value to numbers. Expected numbers.` +
                `\n deltaX=${deltaX}, deltaY=${deltaY}`);
            return;
        }
        this.x += Number(deltaX);
        this.centerX += Number(deltaX);
        this.y += Number(deltaY);
        this.centerY += Number(deltaY);
    }

    rotate(radian, pivotX, pivotY) {
        try {
            radian = Number(radian);
            pivotX = Number(pivotX);
            pivotY = Number(pivotY);
        } catch (err) {
            console.error(`Failed to conver one or more value to numbers. Expected numbers.` +
                `\n radian=${radian}, pivotX=${pivotX}, pivotY=${pivotY}`);
            return;
        }

        const translatedX = this.centerX - pivotX;
        const translatedY = this.centerY - pivotY;

        const rotatedX = translatedX * Math.cos(radian) - translatedY * Math.sin(radian);
        const rotatedY = translatedX * Math.sin(radian) + translatedY * Math.cos(radian);

        this.x = (rotatedX + pivotX) - this.w / 2;
        this.y = (rotatedY + pivotY) - this.h / 2;
        this.centerX = (this.x + this.w / 2);
        this.centerY = (this.y + this.h / 2);
    }

    contains(x, y) {
        try {
            x = Number(x);
            y = Number(y);
        } catch (err) {
            console.error(`Failed to conver one or more value to numbers. Expected numbers.` +
                `\n x=${x}, y=${y}`);
            return;
        }
        return (this.x <= x && x <= this.x + this.w)
            && (this.y <= y && y <= this.y + this.h);
    }
}