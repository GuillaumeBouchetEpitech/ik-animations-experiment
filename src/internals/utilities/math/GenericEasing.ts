
interface IEasingStep<T> {
  coefStep: number;
  value: T;
  easing?: (ratio: number) => number;
};

type TypeLerp<T> = (a: Readonly<T>, b: Readonly<T>, r: number) => T;

export class GenericEasing<T> {
  private _steps: IEasingStep<T>[] = [];
  private _lerp: TypeLerp<T>;

  constructor(lerp: TypeLerp<T>) {
    this._lerp = lerp;
  }

  reset() { this._steps.length = 0; }

  push(coefStep: number, value: Readonly<T>, easing?: (t: number) => number): this {
    // if (_size == _MaxSize)
    //   D_THROW(std::runtime_error, "max steps reached, max: " << _MaxSize);
    if (this._steps.length != 0 && coefStep <= this._steps[this._steps.length - 1].coefStep)
      throw new Error("coef step will be missed");
    if (coefStep < 0.0)
      throw new Error("coef cannot be < 0");
    if (coefStep > 1.0)
      throw new Error("coef cannot be > 1");

    this._steps.push({ coefStep, value, easing });
    return this;
  }


  get(coef: number): T {
    if (this._steps.length < 2) {
      throw new Error("not enough coef steps");
    }

    const first = this._steps[0];
    if (coef < first.coefStep) {
      return first.value;
    }

    const last = this._steps[this._steps.length - 1];
    if (coef >= last.coefStep) {
      return last.value;
    }

    for (let index = 0; index + 1 < this._steps.length; ++index) {
      const currStep = this._steps[index];
      const nextStep = this._steps[index + 1];

      if (coef >= currStep.coefStep && coef < nextStep.coefStep) {
        let subCoef = (coef - currStep.coefStep) / (nextStep.coefStep - currStep.coefStep);

        if (currStep.easing) {
          subCoef = currStep.easing(subCoef);
        }
        // return gero::math::lerp(currStep.value, nextStep.value, subCoef);
        return this._lerp(currStep.value, nextStep.value, subCoef);
      }
    }

    throw new Error("unreachable");
  }



}
