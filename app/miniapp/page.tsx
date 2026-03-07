import Script from "next/script";
import { MiniAppClient } from "./ui-client";

export default function MiniAppPage() {
  return (
    <>
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      <MiniAppClient />
    </>
  );
}
