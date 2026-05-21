import React from "react";

const PageLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-[calc(100-64px)] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {(title || subtitle) && (
        <div className="mb-8">
          {title && (
            <h1 className="text-3xl font-bold text-brand-textMain dark:text-navy-text">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-brand-textSub dark:text-gray-400 mt-2">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default PageLayout;
