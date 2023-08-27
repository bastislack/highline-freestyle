import Database from "../../services/db";

const ErrorFallback = ({error}) => {
  const db = new Database();
  return (
    <div role="alert">
      <h2>Something went wrong</h2>
      <p>Maype try again, but if this problem happens again, you can do following steps:</p>
      <p>1. Tell us about it, so we can fix it. Best over <a href="https://github.com/bastislack/highline-freestyle/issues">Github</a> (account needed... maybe alternatives in the future), mentioning exactly what you did to produce this error, what device you use and the following error msg:</p>
      <pre>{error.message}</pre>
      <p>2. Don't use the Incognito mode</p>
      <p>3. Make an backup of you data (which you can import later again) <button onClick={() => db.exportDatabase()}>export changes</button></p>
      <p>4. Reset all Tricks and Combos and refresh the page (or reopen the app) <button onClick={() => db.resetAll()}>reset ALL</button></p>
      <p>5. Try to completly reset the app. Click <a href="https://github.com/bastislack/highline-freestyle/issues/224#issuecomment-1694383128">here</a> for how to.</p>
    </div>
  );
};

export default ErrorFallback;
