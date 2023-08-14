
import type { AppProps } from 'next/app'

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
      <Component {...pageProps} ceramic />
  );
}

export default MyApp