import axios from 'axios';
import { getNackUrl } from './nack.mjs';
import { config } from '../config.mjs';

export async function putErrorDocumentOnServer(data) {
  try {
    const paylaod = {
      method: 'post',
      url: getNackUrl(config.CORE_BACKEND_ORIGIN),
      headers: { 
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(data)
    };
  
    const response = await axios(paylaod);

    return response.data;

  } catch(e) {
    console.log('Something went wrong :: ', e.message || e.msg);
    return;
  }
}
