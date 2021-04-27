export enum Order {
  NULL,
  CREATE_TIME,
  DEADLINE,
  PRIORITY,
}

// 正序

const map = new Map([
  ["NULL", "createTime"],
  ["CREATE_TIME", "createTime"],
  ["DEADLINE", "deadline"],
  ["PRIORITY", "priority"]
]);

export function OrderToField(order: Order) {
  const [key] = Object.entries(Order).find(([key, val]) => val == order);
  return new Map([[map.get(key), -1]]);
}

export function MultiOrderToField(orders: Order[]) {
  let res = new Map();
  orders.forEach(ele => {
    const [key] = Object.entries(Order).find(([key, val]) => val == ele);
    if (key) res.set(map.get(key), -1);
  });
  return res;
}