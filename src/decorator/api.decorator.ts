interface APIOptions {
  desc?: string,
  checked?: boolean
}

export const api = (options: APIOptions): MethodDecorator => {
  return (target: any) => {
    return null;
  }
}