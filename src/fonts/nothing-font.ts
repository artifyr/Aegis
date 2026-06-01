import localFont from 'next/font/local';

export const nothingFont = localFont({
  src: '../../public/nothing-font.otf.woff2',
  variable: '--font-nothing',
  display: 'swap',
  weight: '400',
});
