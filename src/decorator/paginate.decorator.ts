interface PaginationOption {
  isPaginate: boolean
}

export const paginate = (options: PaginationOption): MethodDecorator => {
  return (target: any, key: any, descriptor: any) => {
    const func = descriptor.value;
    descriptor.value = (...args: any[]) => {
      const res = func.apply(target, args);
      res.then(r => {
        if (options.isPaginate) {
          return null;
        }
      });
    };
  };
};