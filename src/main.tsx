import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./global.scss";
import {createBrowserRouter, redirect, RouterProvider} from "react-router-dom";
import {Root, RootErrorBoundary} from "./routes/root";

import csvData from "virtual:csvData";
import {Index} from "./routes";

const router = createBrowserRouter([
  {
    id: "root",
    path: "/",
    element: <Root />,
    errorElement: <RootErrorBoundary />,
    hasErrorBoundary: true,
    children: [
      {
        id: "index",
        path: "/",
        index: true,
        element: <Index />,
      },
      {
        path: "/tricks",
        loader: () => redirect("/"),
      },
      {
        id: "getTrick",
        path: "/tricks/:id",
      },
    ],
  },
]);
console.log(csvData);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
