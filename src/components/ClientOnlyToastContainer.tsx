// src/components/ClientOnlyToastContainer.tsx - ПОЛНОСТЬЮ ЗАМЕНИТЬ ФАЙЛ

"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function ClientOnlyToastContainer() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
      toastStyle={{
        fontSize: "14px",
      }}
    />
  );
}
