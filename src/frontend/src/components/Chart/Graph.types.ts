export interface GraphProps {
  data: PoolGraphData | undefined;
}
export interface PoolGraphData {
  columns: Array<Array<string | Date | number>>;
  types: any;
  names: any;
  colors: any;
}
export function poolGraphData() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setMinutes(0);

  const dates = Array.from({ length: 288 }, () => {
    yesterday.setMinutes(yesterday.getMinutes() + 5);
    const date = new Date(yesterday);
    return Date.parse(date.toString());
  });
  // @ts-ignore:next-line
  dates.unshift('x');
  let x = 0;
  const arrayY0 = Array.from({ length: 288 }, () => {
    x += Math.random() * 100 - 50;
    return Math.abs(x);
  });
  // @ts-ignore:next-line
  arrayY0.unshift('y0');

  const fakeData: PoolGraphData = {
    columns: [dates, arrayY0],
    types: {
      y0: 'line',
      x: 'x',
    },
    names: {
      y0: 'TONCOIN',
    },
    colors: {
      y0: '#0088cc',
    },
  };
  return fakeData;
}