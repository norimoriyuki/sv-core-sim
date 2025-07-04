'use client';

import Script from 'next/script';

const GoogleAnalytics = () => {

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=G-DZC06V38VP`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-DZC06V38VP', {
            page_title: 'AFネメシス コア獲得シミュレータ',
            page_location: window.location.href,
          });
        `}
      </Script>
    </>
  );
};

export default GoogleAnalytics; 