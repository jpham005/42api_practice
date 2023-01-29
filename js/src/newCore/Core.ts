const CONSTRUCT_FAILURE = 'construct failed';

interface Token {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  created_at: number;
}

export class Core {
  clientId: string;
  clientSecret: string;
  accessToken: string | null;
  retryCount: number;

  constructor() {
    // todo: process.env type def
    this.clientId = process.env.CLIENT_ID;
    this.clientSecret = process.env.CLIENT_SECRET;

    if (!this.clientId || !this.clientSecret) {
      console.error(__filename, 'wrong env');
      throw Error(CONSTRUCT_FAILURE);
    }

    this.accessToken = null;
    this.retryCount = 0;
  }

  getAccessToken = async () => {
    try {
      const response = await fetch('https://api.intra.42.fr/oauth/token', {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
      });

      if (!response.ok) {
        console.log(response.status);
        throw new Error('fail to get access token');
      }

      const token: Token = await response.json();
      this.accessToken = token.access_token;
      console.log(`accessToken Issued: ${this.accessToken}`);
    } catch {
      console.error(`error: getAccessToken`);
      throw new Error();
    }
  };

  // todo: fix return only generic
  sendApiRequest = async <ResponseType = any>(
    url: string
  ): Promise<ResponseType> => {
    if (this.accessToken === null) {
      await this.getAccessToken();
    }

    try {
      const response = await fetch(`https://api.intra.42.fr/v2/${url}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        if (
          this.isTokenErrorResponse(response.status) === true &&
          this.retryCount <= 3
        ) {
          await this.getAccessToken();
          this.retryCount++;
          return await this.sendApiRequest<ResponseType>(url);
        }

        console.error(`error: api failed status: ${response.status}`);
        throw new Error(`response status: ${response.status}`);
      }

      this.retryCount = 0;

      const responseJson: ResponseType = await response.json();

      await new Promise((resolve) => {
        setTimeout(() => resolve(true), 300);
      });

      return responseJson;
    } catch (e) {
      console.error(`error: send: ${e}`);
      throw new Error();
    }
  };

  isTokenErrorResponse = (status: number) => {
    return status === 401 || status === 429;
  };
}
