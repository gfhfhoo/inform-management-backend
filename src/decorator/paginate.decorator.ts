export const paginate = (): MethodDecorator => {
  return (target: any, propertyKey: any, descriptor: any) => {
    const func = descriptor.value;
    descriptor.value = async function(this: any, ...args: any[]) {
      const res = func.apply(this, args);
      return res.then(r => {
        return {
          docs: r.docs,
          nowPage: Number(r.page).valueOf(),
          pageTotal: r.pages,
          itemTotal: r.total
        };
      });
    };
  };
};