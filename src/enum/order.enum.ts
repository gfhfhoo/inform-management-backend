export enum Order {
  NULL,
  CREATE_TIME,
  DEADLINE,
  PRIORITY,
}

// 正序


export function OrderToField(order: Order) {
  const map = new Map([
    ["NULL", "createTime"],
    ["CREATE_TIME", "createTime"],
    ["DEADLINE", "deadline"],
    ["PRIORITY", "priority"]
  ]);
  const [key] = Object.entries(Order).find(([key, val]) => val == order);
  return new Map([[map.get(key), 1]]);
}