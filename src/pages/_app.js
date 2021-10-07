import Head from 'next/head';
import '../styles/main.scss'

function FileManager({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>File Manager</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preload" crossOrigin='anonymous' href="/assets/fonts/opensans/opensans-light.ttf" as="font" />
        <link rel="preload" crossOrigin='anonymous' href="/assets/fonts/opensans/opensans-regular.ttf" as="font" />
        <link rel="preload" crossOrigin='anonymous' href="/assets/fonts/opensans/opensans-bold.ttf" as="font" />
        <link rel="preload" crossOrigin='anonymous' href="/assets/fonts/opensans/opensans-semibold.ttf" as="font" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default FileManager
