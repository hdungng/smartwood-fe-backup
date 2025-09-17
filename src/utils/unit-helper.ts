
export const unitHelper = {
  fromKgToTon: (value: number): number => {
    if (value < 0) {
      return 0;
    }
    return value / 1000;
  },

  fromTonToKg: (value: number): number => {
    if (value < 0) {
      return 0;
    }
    return value * 1000;
  }
}