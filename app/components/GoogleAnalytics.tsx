'use client';

import Script from 'next/script';

const GoogleAnalytics = () => {
  const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

  if (!GA_TRACKING_ID) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=G-CW3CH4F4EG`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-CW3CH4F4EG', {
            page_title: 'AFネメシス コア獲得シミュレータ',
            page_location: window.location.href,
          });
        `}
      </Script>
    </>
  );
};

export default GoogleAnalytics; 