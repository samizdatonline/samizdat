import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv'
dotenv.config();
let apikey = null;

export default class Admin {
  static get root() {
    return 'https://admin.samizdat.online';
  }
  static get headers() {
    if (!apikey) apikey = process.env.APIKEY;
    if (!apikey && process.env.SNAP_DATA) {
      apikey = fs.readFileSync(`${process.env.SNAP_DATA}/apikey`);
      if (!apikey) throw new Error('Try sudo snap set samizdat apikey=[key] and restart');
      else apikey = apikey.toString().replace(/\n/,""); // sometimes 'snap set' allows errant newlines
    }
    if (!apikey) {
      throw new Error('APIKEY=[apikey] needs to be defined in .env')
    }
    return {headers:{authorization:"bearer "+apikey}};
  }
  static async getDomain(count=1) {
    try {
      let result = await axios.get(`${Admin.root}/resource/domain/${count}`,Admin.headers);
      if (!result.data || result.data.length === 0) return null;
      else return result.data;
    } catch(e) {
      return null;
    }
  }
  static async getSite(target) {
    try {
      let result = await axios.get(`${Admin.root}/resource/site/${target.root}`,Admin.headers);
      if (!result.data || result.data.length === 0) return null;
      else return result.data;
    } catch(e) {
      return null;
    }
  }
  static async getSigners() {
    try {
      let result = await axios.get(`${Admin.root}/resource/signers`,Admin.headers);
      return result.data;
    } catch(e) {
      console.log(Admin.headers);
      console.log(e);
      return null;
    }
  }
  static async ping(data) {
    try {
      let result = await axios.put(`${Admin.root}/ping/silent/samizdat`,data,Admin.headers);
      return result.data;
    } catch(e) {
      return null;
    }
  }
}