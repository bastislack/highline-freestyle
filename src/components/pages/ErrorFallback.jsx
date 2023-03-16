const ErrorFallback = ({error}) => {
  return (
    <div role="alert">
      <h2>Something went wrong</h2>
      {error.name === "DatabaseClosedError" && (
        <p>
          {" "}
          Unfortunatly this App does not work in incognito mode, try to disable
          it{" "}
        </p>
      )}
      <p>
        If this is an unexpected error, please write an issue on{" "}
        <a href="https://github.com/bastislack/highline-freestyle/issues">
          Github
        </a>
        , containing what you did to produce this error and the following error
        msg:
      </p>
      <pre>{error.message}</pre>
    </div>
  );
};

export default ErrorFallback;
