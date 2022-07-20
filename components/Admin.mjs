import axios from 'axios';

export default class Admin {
  static get root() {
    return 'https://admin.samizdat.online';
  }
  static get headers() {
    return {headers:{authorization:"bearer "+process.env.APIKEY}};
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