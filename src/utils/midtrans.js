import dotenv from 'dotenv'
import MidtransClient from 'midtrans-client';
import crypto from 'crypto';
dotenv.config()

export const coreApi = new MidtransClient.CoreApi({
    isProduction : (process.env.NODE_ENV === 'development') ? false : true,
    serverKey : process.env.MIDTRANS_SERVER_KEY,
    clientKey : process.env.MIDTRANS_CLIENT_KEY
});

export const isValidSignatureMidtrans = (request) => {
    const hash = crypto.createHash('sha512')
        .update(`${request.order_id}${request.status_code}${request.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`)
        .digest('hex');

    return hash === request.signature_key;
}

export const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY;