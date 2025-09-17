import { TGood } from 'types/good';

export const goodFormat = (
  goods: TGood[]
): Record<
  string,
  {
    name: string;
    color: 'success' | 'warning' | 'primary';
  }
> => {
  let result: any = {};
  goods.forEach((good) => {
    let color = 'primary';
    if (good.name.includes('Viên nén')) {
      color = 'success';
    } else if (good.name.includes('Mùn cưa')) {
      color = 'warning';
    } else {
      color = 'primary';
    }

    result[`${good.id}`] = {
      name: good.name,
      color
    };
  });
  return result;
};
