// src/components/common/Layout.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ с Navbar

"use client";

import React from "react";
import { Navbar } from "@/components/common/Navbar";
import Head from "next/head";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showNavbar?: boolean;
  className?: string;
}

export default function Layout({
  children,
  title = "Система конференций",
  description = "Система управления научными конференциями",
  showNavbar = true,
  className = "",
}: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={`min-h-screen bg-gray-50 ${className}`}>
        {showNavbar && <Navbar />}
        <main className={showNavbar ? "" : "pt-0"}>{children}</main>
      </div>
    </>
  );
}
