export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const _addr_allowed = {
  uppers: "QWERTYUIOPASDFGHJKLZXCVBNM",
  lowers: "qwertyuiopasdfghjklzxcvbnm",
  numbers: "1234567890",
  symbols: "_"
};

const getRandomCharFromString = (str: string) => str.charAt(Math.floor(Math.random() * str.length));
export const generateAddress = () => {
  let addr = "";
  addr += getRandomCharFromString(_addr_allowed.uppers);
  for (let i = 0; i < 19; i++)
    addr += getRandomCharFromString(_addr_allowed.lowers + _addr_allowed.uppers + _addr_allowed.numbers);
  addr += "_";
  addr += getRandomCharFromString(_addr_allowed.lowers);
  for (let i = 0; i < 7; i++)
    addr += getRandomCharFromString(_addr_allowed.lowers + _addr_allowed.uppers + _addr_allowed.numbers);
  addr += "_";
  addr += getRandomCharFromString(_addr_allowed.lowers);
  for (let i = 0; i < 17; i++)
    addr += getRandomCharFromString(_addr_allowed.lowers + _addr_allowed.uppers + _addr_allowed.numbers);
  return addr;
};

export const generateHash = () => {
  let hash = "";
  hash += getRandomCharFromString(_addr_allowed.lowers);
  for (let i = 0; i < 63; i++)
    hash += getRandomCharFromString(_addr_allowed.lowers + _addr_allowed.numbers);
  return hash;
};