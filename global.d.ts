/// <reference types="react" />
/// <reference types="react-dom" />

// CSS Modules — 仅 .module.less 文件返回 class name 映射
declare module '*.module.less' {
  const classes: Record<string, string>;
  export default classes;
}

// 全局样式 — 普通 .less 文件无导出
declare module '*.less' {
  const _empty: void;
  export default _empty;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

declare module '*.woff' {
  const value: string;
  export default value;
}

declare module '*.woff2' {
  const value: string;
  export default value;
}

declare module 'nprogress' {
  const NProgress: {
    start(): void;
    done(): void;
    configure(options: { showSpinner?: boolean }): void;
  };
  export default NProgress;
}
