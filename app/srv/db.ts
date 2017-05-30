import * as redis from 'redis';

class DataClient {
    client: redis.RedisClient;

    constructor() {
        this.client = redis.createClient(6379, '127.0.0.1', {db: '5'});
        this.init();
    }

    init() {
        this.client.on('error', (error: any) => {

        });
    }

    get(key: string, success: (data: any) => any, error: any) {

        this.client.get(key, (err, data) => {
            if (data) {
                success(data);
            }
            else {
                error();
            }
        })
    }

}

let db: DataClient = new DataClient();
export default db;