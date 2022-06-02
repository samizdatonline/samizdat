/**
 * Common server request functions
 */
export default class Fetch {
  static async get(path, options = {}, format = 'json') {
    if (path.charAt(0) !== '/') {
      path = `/${path}`;
    }
    options.credentials = 'include';
    const response = await fetch(path, options);
    if (response.ok) {
      return response.status === 204 ? {} : await response[format]();
    } else {
      const error = new Error(`failed to fetch ${path}`);
      error.status = response.status;
      error.response = await response.text();
      throw(error);
    }
  }

  static async getText(path, options) {
    return await this.get(path, options, 'text');
  }

  static async getText(path, options) {
    return await this.get(path, options, 'text');
  }

  static async put(path, body) {
    if (path.charAt(0) !== '/') {
      path = `/${path}`;
    }
    const options = {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    };
    const response = await fetch(path, options);
    if (response.ok) {
      return response.status === 204 ? {} : await response.json();
    } else {
      const error = new Error(`failed update ${path}`);
      error.status = response.status;
      try {
        error.response = await response.json();
      } catch (e) {
        e.response = await response.text();
      }
      throw(error);
    }
  }

  static async remove(path) {
    if (path.charAt(0) !== '/') {
      path = `/${path}`;
    }
    const options = {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const response = await fetch(path, options);
    if (!response.ok) {
      const error = new Error(`failed remove ${path}`);
      error.status = response.status;
      error.response = await response.text();
      throw(error);
    }
  }
}
