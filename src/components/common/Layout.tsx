// src/components/common/Layout.tsx

import { ReactNode } from "react";
import Head from "next/head";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function Layout({
  children,
  title = "Система управления конференциями",
  description = "Платформа для подачи заявок и управления научными конференциями",
}: LayoutProps) {
  const pageTitle =
    title === "Система управления конференциями"
      ? title
      : `${title} | Система управления конференциями`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen">{children}</main>
    </>
  );
}
