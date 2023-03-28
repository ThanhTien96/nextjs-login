
import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxy, { ProxyResCallback } from 'http-proxy';
import Cookies from 'cookies'



export const config = {
  api: {
    bodyParser: false,
  },
};

const proxy = httpProxy.createProxyServer();


export default function handler(req: NextApiRequest, res: NextApiResponse<any>) {

  // if the method not equal to POST send message not support
  if (req.method !== 'POST') return res.status(404).json({ message: 'This Method Not Support !!!' });

  return new Promise((resolve) => {

    // else do something when user login
    req.headers.cookie = '';

    const handleLogin: ProxyResCallback = (proxyRes, req, res) => {
      let body = '';
      proxyRes.on('data', function (chunk) {
        body += chunk
      });

      proxyRes.on('end', function () {
        try {

          const {accessToken, expiredAt} = JSON.parse(body);

          const cookies = new Cookies(req, res, { secure: process.env.NODE_ENV !== 'development'});
          cookies.set('access_token', accessToken, {
            httpOnly: true,
            sameSite: 'lax',
            expires: new Date(expiredAt),
          });
          
          ;(res as NextApiResponse).status(200).json({message: 'Login successfully !!!'});

        } catch (error) {
          ;(res as NextApiResponse).status(500).json({message: 'Some Thing Went Wrong !!!'});
        } finally {

          resolve(true);

        };

      });

    };

    proxy.once('proxyRes', handleLogin);

    proxy.web(req, res, {
      target: process.env.BASE_URL,
      changeOrigin: true,
      selfHandleResponse: true,
    });

  });
};
